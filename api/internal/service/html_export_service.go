package service

import (
	"archive/zip"
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"mime"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

// The HTML export saves the whole public website as plain files in a zip:
// every page as <path>/index.html, plus the CSS, JavaScript, fonts and
// images they use. It crawls the live site the way a visitor would (from the
// homepage, every published page and every active region, following
// internal links), so the files are exactly what visitors get.
//
// In the zip, every link and file reference is relative to the page
// ("../sg/index.html"), so the folder works anywhere: opened from disk,
// under a local server, in a subfolder or at the root of a host (see
// html_export_offline.go). Images from the API's /uploads/ are copied in,
// and what Cloudflare adds to pages (analytics, email protection) is taken
// out, since it only works behind Cloudflare.

const (
	HTMLExportIdle    = "idle"
	HTMLExportRunning = "running"
	HTMLExportDone    = "done"
	HTMLExportFailed  = "failed"

	htmlExportWorkers   = 6
	htmlExportMaxPages  = 5000
	htmlExportMaxFiles  = 20000
	htmlExportMaxBytes  = 2 << 30
	htmlExportMaxFile   = 100 << 20
	htmlExportTimeout   = 30 * time.Second
	htmlExportUserAgent = "topcasinosg-html-export/1.0"
	htmlExportFilePrefx = "topcasinosg-html-"
	maxExportFailures   = 50
)

var (
	ErrHTMLExportRunning = errors.New("an export is already running; wait for it to finish or cancel it")
	ErrHTMLExportNoFile  = errors.New("there is no finished export to download yet")
	ErrHTMLExportSiteURL = errors.New("the website address is not set: add it in Settings > General (Site URL)")
)

// HTMLExportFailure is a page or file that couldn't be saved.
type HTMLExportFailure struct {
	URL    string `json:"url"`
	Reason string `json:"reason"`
}

// HTMLExportStatus is the current or last export.
type HTMLExportStatus struct {
	State        string              `json:"state"`
	SiteURL      string              `json:"siteUrl"`
	StartedAt    *time.Time          `json:"startedAt"`
	FinishedAt   *time.Time          `json:"finishedAt"`
	StartedBy    string              `json:"startedBy"`
	Pages        int                 `json:"pages"`
	Files        int                 `json:"files"`
	Bytes        int64               `json:"bytes"`
	Queued       int                 `json:"queued"`
	Failures     []HTMLExportFailure `json:"failures"`
	FailureCount int                 `json:"failureCount"`
	Error        string              `json:"error"`
	FileName     string              `json:"fileName"`
	FileSize     int64               `json:"fileSize"`
}

type HTMLExportService struct {
	pages    *PageService
	regions  *RegionService
	settings *SiteSettingsService
	// webURL overrides Site Settings' Site URL (WEB_URL), e.g. when the API
	// should reach the site on an internal address.
	webURL string
	dir    string
	client *http.Client

	mu     sync.Mutex
	status HTMLExportStatus
	cancel context.CancelFunc
}

func NewHTMLExportService(pages *PageService, regions *RegionService, settings *SiteSettingsService, webURL, dir string) *HTMLExportService {
	s := &HTMLExportService{
		pages: pages, regions: regions, settings: settings, webURL: webURL, dir: dir,
		client: &http.Client{Timeout: htmlExportTimeout},
		status: HTMLExportStatus{State: HTMLExportIdle, Failures: []HTMLExportFailure{}},
	}
	// After a restart, the last finished zip is still downloadable.
	if name, size, modTime := s.latestFile(); name != "" {
		s.status.State = HTMLExportDone
		s.status.FileName, s.status.FileSize = name, size
		s.status.FinishedAt = &modTime
	}
	return s
}

func (s *HTMLExportService) Status() HTMLExportStatus {
	s.mu.Lock()
	defer s.mu.Unlock()
	st := s.status
	st.Failures = append([]HTMLExportFailure{}, s.status.Failures...)
	return st
}

// Start begins an export in the background. apiOrigin is the API's public
// address as the site uses it (e.g. https://backapi.topcasinosg.com.sg), so
// image URLs pointing at it can be copied into the zip.
func (s *HTMLExportService) Start(ctx context.Context, actor *domain.AdminUser, apiOrigin string) (HTMLExportStatus, error) {
	settings, err := s.settings.Get(ctx)
	if err != nil {
		return HTMLExportStatus{}, err
	}
	publicURL := strings.TrimRight(strings.TrimSpace(settings.SiteURL), "/")
	siteURL := publicURL
	if s.webURL != "" {
		siteURL = s.webURL
	}
	site, err := url.Parse(strings.TrimRight(strings.TrimSpace(siteURL), "/"))
	if err != nil || site.Host == "" || (site.Scheme != "http" && site.Scheme != "https") {
		return HTMLExportStatus{}, ErrHTMLExportSiteURL
	}

	s.mu.Lock()
	if s.status.State == HTMLExportRunning {
		s.mu.Unlock()
		return HTMLExportStatus{}, ErrHTMLExportRunning
	}
	now := time.Now().UTC()
	s.status = HTMLExportStatus{State: HTMLExportRunning, SiteURL: site.String(), StartedAt: &now, StartedBy: actor.FullName, Failures: []HTMLExportFailure{}}
	runCtx, cancel := context.WithCancel(context.Background())
	s.cancel = cancel
	st := s.status
	s.mu.Unlock()

	seeds := s.seeds(ctx)
	// The site's pages use its public address (Site URL) in links and
	// images; with WEB_URL set, that's a different address for the same site.
	var aliases []string
	if publicURL != "" && publicURL != site.String() {
		aliases = append(aliases, publicURL)
	}
	go s.run(runCtx, site, aliases, strings.TrimRight(apiOrigin, "/"), seeds)
	return st, nil
}

// Cancel stops a running export; its partial zip is thrown away.
func (s *HTMLExportService) Cancel() {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.cancel != nil && s.status.State == HTMLExportRunning {
		s.cancel()
	}
}

// File opens the last finished zip.
func (s *HTMLExportService) File() (*os.File, string, error) {
	st := s.Status()
	if st.FileName == "" {
		return nil, "", ErrHTMLExportNoFile
	}
	f, err := os.Open(filepath.Join(s.dir, st.FileName))
	if err != nil {
		return nil, "", ErrHTMLExportNoFile
	}
	return f, st.FileName, nil
}

// seeds: the homepage, every published page and every active region, so
// pages nothing links to are saved too.
func (s *HTMLExportService) seeds(ctx context.Context) []string {
	seeds := []string{"/"}
	if pages, err := s.pages.List(ctx); err == nil {
		if paths, err := s.pages.PathsByID(ctx); err == nil {
			for _, p := range pages {
				if p.Status == domain.ContentStatusPublished && p.Kind != domain.PageKindGlobal && paths[p.ID] != "" {
					seeds = append(seeds, "/"+strings.Trim(paths[p.ID], "/"))
				}
			}
		}
	}
	if regions, err := s.regions.ListActive(ctx); err == nil {
		for _, r := range regions {
			seeds = append(seeds, "/"+strings.ToLower(r.Code))
		}
	}
	return seeds
}

func (s *HTMLExportService) update(change func(st *HTMLExportStatus)) {
	s.mu.Lock()
	defer s.mu.Unlock()
	change(&s.status)
}

func (s *HTMLExportService) fail(rawURL, reason string) {
	s.update(func(st *HTMLExportStatus) {
		st.FailureCount++
		if len(st.Failures) < maxExportFailures {
			st.Failures = append(st.Failures, HTMLExportFailure{URL: rawURL, Reason: reason})
		}
	})
}

// --- the crawl ---

type exportItem struct {
	path   string // root-relative path, no query
	source string // full URL to fetch
	page   bool
	// optional files (robots.txt, favicon.ico) aren't failures when missing.
	optional bool
}

type exportCrawl struct {
	s    *HTMLExportService
	site *url.URL
	// origins: the site's address, and its public one when they differ.
	origins []string
	// publicURL: the site's public address, for canonical links and share
	// images, which need a full address.
	publicURL string
	apiOrigin string
	zip       *zip.Writer
	zipMu     sync.Mutex

	mu       sync.Mutex
	cond     *sync.Cond
	queue    []exportItem
	seen     map[string]bool
	inFlight int
	pages    int
	files    int
	bytes    int64
	stopped  error
}

func (s *HTMLExportService) run(ctx context.Context, site *url.URL, aliases []string, apiOrigin string, seeds []string) {
	defer func() {
		if p := recover(); p != nil {
			log.Printf("html export: panic: %v", p)
			s.finish("", 0, fmt.Errorf("the export stopped unexpectedly: %v", p))
		}
	}()
	if err := os.MkdirAll(s.dir, 0o755); err != nil {
		s.finish("", 0, fmt.Errorf("could not create the export folder: %w", err))
		return
	}
	stamp := time.Now().Format("20060102-150405")
	name := htmlExportFilePrefx + stamp + ".zip"
	partPath := filepath.Join(s.dir, name+".part")
	out, err := os.Create(partPath)
	if err != nil {
		s.finish("", 0, fmt.Errorf("could not create the zip: %w", err))
		return
	}

	origins := append([]string{site.String()}, aliases...)
	c := &exportCrawl{s: s, site: site, origins: origins, publicURL: origins[len(origins)-1], apiOrigin: apiOrigin, zip: zip.NewWriter(out), seen: map[string]bool{}}
	c.cond = sync.NewCond(&c.mu)
	for _, seed := range seeds {
		c.enqueue(seed, true)
	}
	var wg sync.WaitGroup
	for i := 0; i < htmlExportWorkers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			c.work(ctx)
		}()
	}
	wg.Wait()

	crawlErr := c.stopped
	if crawlErr == nil && ctx.Err() != nil {
		crawlErr = errors.New("cancelled")
	}
	if crawlErr == nil {
		c.extras(ctx)
	}
	closeErr := c.zip.Close()
	if err := out.Close(); closeErr == nil {
		closeErr = err
	}
	if crawlErr == nil && closeErr != nil {
		crawlErr = fmt.Errorf("could not finish the zip: %w", closeErr)
	}
	if crawlErr == nil && c.pages == 0 {
		crawlErr = fmt.Errorf("no pages could be saved from %s; check that the website is up and its address in Settings > General is right", site.String())
	}
	if crawlErr != nil {
		os.Remove(partPath)
		s.finish("", 0, crawlErr)
		return
	}
	finalPath := filepath.Join(s.dir, name)
	if err := os.Rename(partPath, finalPath); err != nil {
		os.Remove(partPath)
		s.finish("", 0, fmt.Errorf("could not save the zip: %w", err))
		return
	}
	s.removeOlder(name)
	info, _ := os.Stat(finalPath)
	var size int64
	if info != nil {
		size = info.Size()
	}
	s.finish(name, size, nil)
}

func (s *HTMLExportService) finish(name string, size int64, err error) {
	now := time.Now().UTC()
	s.update(func(st *HTMLExportStatus) {
		st.FinishedAt = &now
		st.Queued = 0
		if err != nil {
			st.State = HTMLExportFailed
			st.Error = err.Error()
			// The previous zip, if any, stays downloadable.
			if prev, prevSize, _ := s.latestFile(); prev != "" {
				st.FileName, st.FileSize = prev, prevSize
			}
			return
		}
		st.State = HTMLExportDone
		st.FileName, st.FileSize = name, size
	})
	s.mu.Lock()
	s.cancel = nil
	s.mu.Unlock()
}

// latestFile is the newest finished zip in the export folder.
func (s *HTMLExportService) latestFile() (string, int64, time.Time) {
	entries, err := os.ReadDir(s.dir)
	if err != nil {
		return "", 0, time.Time{}
	}
	var names []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasPrefix(e.Name(), htmlExportFilePrefx) && strings.HasSuffix(e.Name(), ".zip") {
			names = append(names, e.Name())
		}
	}
	if len(names) == 0 {
		return "", 0, time.Time{}
	}
	sort.Strings(names)
	latest := names[len(names)-1]
	info, err := os.Stat(filepath.Join(s.dir, latest))
	if err != nil {
		return "", 0, time.Time{}
	}
	return latest, info.Size(), info.ModTime().UTC()
}

// removeOlder keeps only the newest zip, so exports don't fill the disk.
func (s *HTMLExportService) removeOlder(keep string) {
	entries, _ := os.ReadDir(s.dir)
	for _, e := range entries {
		if e.Name() != keep && strings.HasPrefix(e.Name(), htmlExportFilePrefx) {
			os.Remove(filepath.Join(s.dir, e.Name()))
		}
	}
}

func (c *exportCrawl) enqueue(ref string, page bool) {
	source, p, ok := c.resolve(ref)
	if !ok {
		return
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.seen[p] || len(c.seen) >= htmlExportMaxFiles {
		return
	}
	if page && c.pageCount() >= htmlExportMaxPages {
		return
	}
	c.seen[p] = true
	c.queue = append(c.queue, exportItem{path: p, source: source, page: page})
	c.s.update(func(st *HTMLExportStatus) { st.Queued = len(c.queue) + c.inFlight })
	c.cond.Signal()
}

// pageCount counts queued and saved pages (c.mu held).
func (c *exportCrawl) pageCount() int {
	n := c.pages
	for _, it := range c.queue {
		if it.page {
			n++
		}
	}
	return n
}

// resolve turns a reference found in the site into the URL to fetch and
// the root-relative path it's saved under. Only the site itself and the
// API's /uploads/ are copied.
func (c *exportCrawl) resolve(ref string) (string, string, bool) {
	ref = strings.TrimSpace(strings.ReplaceAll(ref, "&amp;", "&"))
	if ref == "" || strings.HasPrefix(ref, "//") {
		return "", "", false
	}
	if c.apiOrigin != "" && strings.HasPrefix(ref, c.apiOrigin+"/uploads/") {
		u, err := url.Parse(ref)
		if err != nil {
			return "", "", false
		}
		return c.apiOrigin + u.EscapedPath(), cleanExportPath(u.Path), true
	}
	for _, origin := range c.origins {
		if strings.HasPrefix(ref, origin) {
			ref = strings.TrimPrefix(ref, origin)
			if ref == "" {
				ref = "/"
			}
			break
		}
	}
	if !strings.HasPrefix(ref, "/") {
		return "", "", false
	}
	u, err := url.Parse(ref)
	if err != nil {
		return "", "", false
	}
	p := cleanExportPath(u.Path)
	if p == "" || strings.HasPrefix(p, "/api/") || strings.HasPrefix(p, "/preview/") || p == "/_next/image" {
		return "", "", false
	}
	return c.site.String() + u.EscapedPath(), p, true
}

func cleanExportPath(p string) string {
	if p == "" {
		return "/"
	}
	clean := path.Clean("/" + p)
	if strings.Contains(clean, "..") {
		return ""
	}
	return clean
}

func (c *exportCrawl) next(ctx context.Context) (exportItem, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	for len(c.queue) == 0 && c.inFlight > 0 && c.stopped == nil && ctx.Err() == nil {
		c.cond.Wait()
	}
	if len(c.queue) == 0 || c.stopped != nil || ctx.Err() != nil {
		c.cond.Broadcast()
		return exportItem{}, false
	}
	it := c.queue[0]
	c.queue = c.queue[1:]
	c.inFlight++
	return it, true
}

func (c *exportCrawl) done() {
	c.mu.Lock()
	c.inFlight--
	queued := len(c.queue) + c.inFlight
	c.mu.Unlock()
	c.s.update(func(st *HTMLExportStatus) { st.Queued = queued })
	c.cond.Broadcast()
}

func (c *exportCrawl) work(ctx context.Context) {
	// Wake waiting workers when the export is cancelled.
	stop := context.AfterFunc(ctx, func() { c.cond.Broadcast() })
	defer stop()
	for {
		it, ok := c.next(ctx)
		if !ok {
			return
		}
		c.fetch(ctx, it)
		c.done()
	}
}

// errExportStatus is a response other than 200 OK.
type errExportStatus int

func (e errExportStatus) Error() string { return fmt.Sprintf("status %d", int(e)) }

var errExportTooLarge = errors.New("too large or cut off")

// get loads one URL from the site, with one retry for a server error or a
// dropped connection: a busy site can fail a few of many requests in a row.
func (c *exportCrawl) get(ctx context.Context, source string) ([]byte, string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, source, nil)
	if err != nil {
		return nil, "", errors.New("bad address")
	}
	req.Header.Set("User-Agent", htmlExportUserAgent)
	res, err := c.s.client.Do(req)
	if (err != nil || res.StatusCode >= http.StatusInternalServerError) && ctx.Err() == nil {
		if res != nil {
			res.Body.Close()
		}
		select {
		case <-time.After(time.Second):
		case <-ctx.Done():
			return nil, "", ctx.Err()
		}
		res, err = c.s.client.Do(req)
	}
	if err != nil {
		return nil, "", fmt.Errorf("could not load: %w", err)
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return nil, "", errExportStatus(res.StatusCode)
	}
	body, err := io.ReadAll(io.LimitReader(res.Body, htmlExportMaxFile+1))
	if err != nil || len(body) > htmlExportMaxFile {
		return nil, "", errExportTooLarge
	}
	contentType, _, _ := mime.ParseMediaType(res.Header.Get("Content-Type"))
	return body, contentType, nil
}

func (c *exportCrawl) fetch(ctx context.Context, it exportItem) {
	body, contentType, err := c.get(ctx, it.source)
	if err != nil {
		if ctx.Err() != nil {
			return
		}
		var status errExportStatus
		if errors.As(err, &status) && it.optional {
			return
		}
		// A page link to something that doesn't exist is a broken link on
		// the site, worth knowing about.
		c.s.fail(it.path, err.Error())
		return
	}
	isHTML := contentType == "text/html"
	if it.page && !isHTML && path.Ext(it.path) != "" {
		it.page = false // a link to a file (PDF, image...)
	}

	name := strings.TrimPrefix(it.path, "/")
	switch {
	case isHTML:
		name = strings.TrimSuffix(name, "/") + "/index.html"
		name = strings.TrimPrefix(name, "/")
	case name == "":
		name = "index"
	}
	if decoded, err := url.PathUnescape(name); err == nil {
		name = decoded
	}

	isCSS := contentType == "text/css"
	isJS := strings.Contains(contentType, "javascript")
	if isHTML || isCSS || isJS {
		text := string(body)
		if isHTML {
			text = rewriteFlight(cleanCloudflare(text), exportRoot(name), c.rewrite)
		}
		text = c.rewrite(text)
		c.discover(text, isHTML, isCSS, it.path)
		// Then made to work from any folder (html_export_offline.go).
		switch {
		case isHTML:
			text = relativeHTML(text, name, c.publicURL)
		case isCSS:
			text = relativeCSS(c.inlineFonts(ctx, text, it.path), name)
		case isJS:
			text = patchChunkRuntime(text)
		}
		body = []byte(text)
	}
	if err := c.write(name, body); err != nil {
		c.mu.Lock()
		if c.stopped == nil {
			c.stopped = err
		}
		c.mu.Unlock()
		c.cond.Broadcast()
		return
	}
	c.mu.Lock()
	if isHTML {
		c.pages++
	} else {
		c.files++
	}
	c.bytes += int64(len(body))
	pages, files, bytes := c.pages, c.files, c.bytes
	if bytes > htmlExportMaxBytes && c.stopped == nil {
		c.stopped = fmt.Errorf("the site is larger than %d GB; the export stopped", htmlExportMaxBytes>>30)
	}
	c.mu.Unlock()
	c.s.update(func(st *HTMLExportStatus) { st.Pages, st.Files, st.Bytes = pages, files, bytes })
}

func (c *exportCrawl) write(name string, body []byte) error {
	c.zipMu.Lock()
	defer c.zipMu.Unlock()
	w, err := c.zip.CreateHeader(&zip.FileHeader{Name: name, Method: zip.Deflate, Modified: time.Now()})
	if err != nil {
		return fmt.Errorf("could not write %s to the zip: %w", name, err)
	}
	if _, err := w.Write(body); err != nil {
		return fmt.Errorf("could not write %s to the zip: %w", name, err)
	}
	return nil
}

// rewrite makes the site's own absolute URLs root-relative, and points
// images on the API at the zip's own /uploads/.
func (c *exportCrawl) rewrite(text string) string {
	// Also the address on its own, quoted or JSON-escaped (\"...\").
	var replacements []string
	for _, origin := range c.origins {
		replacements = append(replacements, origin+"/", "/", `"`+origin+`"`, `"/"`, origin+`\"`, `/\"`)
	}
	if c.apiOrigin != "" {
		replacements = append(replacements, c.apiOrigin+"/uploads/", "/uploads/")
	}
	return strings.NewReplacer(replacements...).Replace(text)
}

var (
	htmlLinkRe   = regexp.MustCompile(`<a\b[^>]*?\bhref="([^"#]*)`)
	htmlAssetRe  = regexp.MustCompile(`\b(?:src|href|poster|content)="(/[^"#]*\.[A-Za-z0-9]{2,5}(?:\?[^"#]*)?)"`)
	assetPathRe  = regexp.MustCompile(`/(?:_next/static|uploads|assets)/[^"'\s()\\<>,&;` + "`" + `]+\.[A-Za-z0-9]{2,6}`)
	chunkPathRe  = regexp.MustCompile(`static/(?:chunks|css|media)/[^"'\s()\\<>,&;` + "`" + `]+\.[A-Za-z0-9]{2,6}`)
	cssURLRe     = regexp.MustCompile(`url\(\s*['"]?([^'")]+)['"]?\s*\)`)
	nonPageExtRe = regexp.MustCompile(`\.[A-Za-z0-9]{2,5}$`)
)

// discover queues the pages and files a saved page, stylesheet or script
// refers to.
func (c *exportCrawl) discover(text string, isHTML, isCSS bool, from string) {
	if isHTML {
		for _, m := range htmlLinkRe.FindAllStringSubmatch(text, -1) {
			ref := strings.SplitN(m[1], "?", 2)[0]
			if strings.HasPrefix(ref, "/") && !nonPageExtRe.MatchString(ref) &&
				!strings.HasPrefix(ref, "/_next/") && !strings.HasPrefix(ref, "/uploads/") {
				c.enqueue(ref, true)
			}
		}
		for _, m := range htmlAssetRe.FindAllStringSubmatch(text, -1) {
			c.enqueue(m[1], false)
		}
	}
	for _, m := range assetPathRe.FindAllString(text, -1) {
		c.enqueue(m, false)
	}
	if !isHTML {
		for _, m := range chunkPathRe.FindAllString(text, -1) {
			c.enqueue("/_next/"+m, false)
		}
	}
	if isCSS {
		for _, m := range cssURLRe.FindAllStringSubmatch(text, -1) {
			ref := m[1]
			if strings.HasPrefix(ref, "data:") {
				continue
			}
			if !strings.HasPrefix(ref, "/") {
				ref = path.Join(path.Dir(from), ref)
			}
			c.enqueue(ref, false)
		}
	}
}

// extras adds the site's 404 page, robots.txt and favicon when there are,
// and a README on hosting the files.
func (c *exportCrawl) extras(ctx context.Context) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.site.String()+"/__html-export-missing-page", nil)
	if err == nil {
		req.Header.Set("User-Agent", htmlExportUserAgent)
		if res, err := c.s.client.Do(req); err == nil {
			body, _ := io.ReadAll(io.LimitReader(res.Body, htmlExportMaxFile))
			res.Body.Close()
			if res.StatusCode == http.StatusNotFound && len(body) > 0 {
				text := rewriteFlight(cleanCloudflare(string(body)), "", c.rewrite)
				text = c.rewrite(text)
				_ = c.write("404.html", []byte(relativeHTML(text, "404.html", c.publicURL)))
			}
		}
	}
	for _, p := range []string{"/robots.txt", "/favicon.ico"} {
		if !c.seen[p] {
			c.seen[p] = true
			c.fetch(ctx, exportItem{path: p, source: c.site.String() + p, optional: true})
		}
	}
	readme := fmt.Sprintf(`TopCasinoSG website, saved as HTML
Saved from %s on %s: %d pages and %d other files.

How to open it (unzip first; any of these works)
- Double-click index.html: it opens in your browser from your computer.
- VS Code: open this folder, right-click index.html > "Open with Live
  Server".
- XAMPP: copy the folder into htdocs (e.g. htdocs/topcasinosg-html) and
  go to http://localhost/topcasinosg-html/
- A web host: upload everything, to the root or to a subfolder.

Links between pages are relative ("../sg/index.html"), so the folder works
wherever it is. Each page is <path>/index.html (e.g. /sg is
sg/index.html). 404.html is the site's "page not found" page, for hosts
that use one.

What to know
- Page content is as it was at export time. Changes in the admin after
  that need a new export.
- Menus, sliders, tabs, the casino finder and the bonus calculator work
  offline; links to casinos' own sites go to the internet as usual.
- Canonical links and share images point at the live site, so search
  engines keep treating it as the original.
`, c.site.String(), time.Now().Format("2 Jan 2006 15:04"), c.pages, c.files)
	_ = c.write("README.txt", []byte(readme))
}

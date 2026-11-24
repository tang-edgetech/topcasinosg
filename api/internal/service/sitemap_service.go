package service

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"sort"
	"strings"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

var (
	ErrInvalidSitemapItem = errors.New("the sitemap can only list pages, casinos, guides, news, bonuses and the fixed list pages")
	ErrInvalidSitemapMode = errors.New(`sitemap choice must be "default", "include" or "exclude"`)
	ErrInvalidSitemapType = errors.New("unknown content type for the sitemap")
	// ErrInvalidSitemapURL is wrapped with the address that is wrong.
	ErrInvalidSitemapURL   = errors.New("extra addresses must be on this website: a path like /promotions or a full https:// address")
	ErrTooManySitemapURLs  = fmt.Errorf("the sitemap takes at most %d extra addresses", maxSitemapExtraURLs)
	ErrTooManySitemapItems = fmt.Errorf("change at most %d items at once", maxSitemapModeChanges)
)

const (
	maxSitemapExtraURLs   = 500
	maxSitemapURLLength   = 1000
	maxSitemapModeChanges = 1000
)

// SitemapService builds the website's sitemap and manages its settings:
// Settings > Sitemap (Super Admin and Admin) and each item's Sitemap choice
// (anyone who can edit content, like the rest of its SEO tab).
type SitemapService struct {
	sitemap  *repository.SitemapRepo
	settings *SiteSettingsService
}

func NewSitemapService(sitemap *repository.SitemapRepo, settings *SiteSettingsService) *SitemapService {
	return &SitemapService{sitemap: sitemap, settings: settings}
}

// SitemapOverview is everything Settings > Sitemap shows.
type SitemapOverview struct {
	Settings *domain.SitemapSettings
	// SiteNoindex: Settings > General hides the whole site from search
	// engines, so the sitemap is empty whatever is chosen here.
	SiteNoindex bool
	Items       []domain.SitemapItem
}

func (s *SitemapService) Settings(ctx context.Context) (*domain.SitemapSettings, error) {
	return s.sitemap.GetSettings(ctx)
}

// Overview lists every live page and item with whether it is in the sitemap
// and why. An item's Listed ignores the two site-wide switches (the sitemap
// off, or the site set to noindex); those are reported once, on their own.
func (s *SitemapService) Overview(ctx context.Context) (*SitemapOverview, error) {
	settings, err := s.sitemap.GetSettings(ctx)
	if err != nil {
		return nil, err
	}
	site, err := s.settings.Get(ctx)
	if err != nil {
		return nil, err
	}
	items, err := s.items(ctx, settings)
	if err != nil {
		return nil, err
	}
	return &SitemapOverview{Settings: settings, SiteNoindex: !site.SEOIndex, Items: items}, nil
}

func (s *SitemapService) items(ctx context.Context, settings *domain.SitemapSettings) ([]domain.SitemapItem, error) {
	modes, err := s.sitemap.Modes(ctx)
	if err != nil {
		return nil, err
	}
	noindex, err := s.sitemap.Noindex(ctx)
	if err != nil {
		return nil, err
	}
	redirected, err := s.sitemap.RedirectedPaths(ctx)
	if err != nil {
		return nil, err
	}

	var items []domain.SitemapItem
	add := func(item domain.SitemapItem) {
		key := repository.SitemapKey(item.EntityType, item.EntityID)
		item.Mode = domain.SitemapModeDefault
		if m, ok := modes[key]; ok {
			item.Mode = m
		}
		switch {
		case noindex[key]:
			item.Reason = domain.SitemapReasonNoindex
		case redirected[repository.NormalizeSitemapPath(item.Path)]:
			item.Reason = domain.SitemapReasonRedirected
		case item.Mode == domain.SitemapModeExclude:
			item.Reason = domain.SitemapReasonExcluded
		case item.Mode == domain.SitemapModeInclude:
			item.Reason = domain.SitemapReasonIncluded
		case settings.TypeOn(item.EntityType):
			item.Reason = domain.SitemapReasonListed
		default:
			item.Reason = domain.SitemapReasonTypeOff
		}
		item.Listed = item.Reason == domain.SitemapReasonListed || item.Reason == domain.SitemapReasonIncluded
		items = append(items, item)
	}

	pages, err := s.sitemap.Pages(ctx)
	if err != nil {
		return nil, err
	}
	paths := sitemapPagePaths(pages)
	for _, p := range pages {
		if !p.Live || paths[p.ID] == "" {
			continue
		}
		add(domain.SitemapItem{EntityType: domain.SeoEntityPage, EntityID: p.ID, Name: p.Title, Path: paths[p.ID], UpdatedAt: p.UpdatedAt})
	}

	prefixes := []struct{ entityType, prefix string }{
		{domain.SeoEntityCasino, "/casinos/"},
		{domain.SeoEntityGuide, "/guides/"},
		{domain.SeoEntityNews, "/news/"},
		{domain.SeoEntityBonus, "/bonuses/"},
	}
	for _, t := range prefixes {
		records, err := s.sitemap.Records(ctx, t.entityType)
		if err != nil {
			return nil, err
		}
		for _, rec := range records {
			add(domain.SitemapItem{EntityType: t.entityType, EntityID: rec.ID, Name: rec.Name, Path: t.prefix + url.PathEscape(rec.Slug), UpdatedAt: rec.UpdatedAt})
		}
	}

	updated, err := s.sitemap.ListingUpdated(ctx)
	if err != nil {
		return nil, err
	}
	for _, l := range domain.SitemapListings {
		add(domain.SitemapItem{EntityType: domain.SitemapTypeListing, EntityID: l.ID, Name: l.Name, Path: l.Path, UpdatedAt: updated[l.ID]})
	}
	return items, nil
}

// sitemapPagePaths gives each page its address: its slug after its ancestors'
// (an unpublished ancestor still counts, as on the website), and "/" for
// the homepage (slug "home" at the top). A page caught in a parent loop
// gets "".
func sitemapPagePaths(pages []repository.SitemapPage) map[int64]string {
	byID := make(map[int64]repository.SitemapPage, len(pages))
	for _, p := range pages {
		byID[p.ID] = p
	}
	paths := make(map[int64]string, len(pages))
	var resolve func(id int64, depth int) string
	resolve = func(id int64, depth int) string {
		if p, ok := paths[id]; ok {
			return p
		}
		p, ok := byID[id]
		if !ok || depth > 50 {
			return ""
		}
		var path string
		if p.ParentID == nil {
			path = "/" + url.PathEscape(p.Slug)
		} else if parent := resolve(*p.ParentID, depth+1); parent != "" && parent != "/" {
			path = parent + "/" + url.PathEscape(p.Slug)
		} else {
			path = "/" + url.PathEscape(p.Slug)
		}
		paths[id] = path
		return path
	}
	for _, p := range pages {
		resolve(p.ID, 0)
	}
	for _, p := range pages {
		if p.ParentID == nil && p.Slug == "home" {
			paths[p.ID] = "/"
		}
	}
	return paths
}

// SitemapItemStatus is one item's Sitemap box in its SEO tab.
type SitemapItemStatus struct {
	Item domain.SitemapItem
	// SitemapOn: the sitemap is on and the site isn't set to noindex.
	SitemapOn bool
	// TypeOn: the item's content type is listed by default.
	TypeOn bool
}

// ItemStatus reports one item; a draft or scheduled item has Reason
// "unpublished" (its choice still applies once it is live).
func (s *SitemapService) ItemStatus(ctx context.Context, entityType string, id int64) (*SitemapItemStatus, error) {
	if err := s.checkItem(ctx, entityType, id); err != nil {
		return nil, err
	}
	overview, err := s.Overview(ctx)
	if err != nil {
		return nil, err
	}
	status := &SitemapItemStatus{
		SitemapOn: overview.Settings.Enabled && !overview.SiteNoindex,
		TypeOn:    overview.Settings.TypeOn(entityType),
	}
	for _, item := range overview.Items {
		if item.EntityType == entityType && item.EntityID == id {
			status.Item = item
			return status, nil
		}
	}
	modes, err := s.sitemap.Modes(ctx)
	if err != nil {
		return nil, err
	}
	mode := domain.SitemapModeDefault
	if m, ok := modes[repository.SitemapKey(entityType, id)]; ok {
		mode = m
	}
	status.Item = domain.SitemapItem{EntityType: entityType, EntityID: id, Mode: mode, Reason: domain.SitemapReasonUnpublished}
	return status, nil
}

func (s *SitemapService) checkItem(ctx context.Context, entityType string, id int64) error {
	if entityType == domain.SitemapTypeListing {
		for _, l := range domain.SitemapListings {
			if l.ID == id {
				return nil
			}
		}
		return repository.ErrNotFound
	}
	if !isSeoEntityType(entityType) {
		return ErrInvalidSitemapItem
	}
	return s.sitemap.ItemExists(ctx, entityType, id)
}

// SitemapModeChange is one item's new choice.
type SitemapModeChange struct {
	EntityType string
	EntityID   int64
	Mode       string
}

// SetModes checks every change first and saves them only if all are valid.
func (s *SitemapService) SetModes(ctx context.Context, changes []SitemapModeChange) error {
	if len(changes) > maxSitemapModeChanges {
		return ErrTooManySitemapItems
	}
	for _, c := range changes {
		if c.Mode != domain.SitemapModeDefault && c.Mode != domain.SitemapModeInclude && c.Mode != domain.SitemapModeExclude {
			return ErrInvalidSitemapMode
		}
		if err := s.checkItem(ctx, c.EntityType, c.EntityID); err != nil {
			return err
		}
	}
	for _, c := range changes {
		if err := s.sitemap.SetMode(ctx, c.EntityType, c.EntityID, c.Mode); err != nil {
			return err
		}
	}
	return nil
}

// UpdateSettings checks and saves Settings > Sitemap. Types keep the order
// of domain.SitemapTypes; extra addresses are trimmed, de-duplicated and
// must be on this website.
func (s *SitemapService) UpdateSettings(ctx context.Context, enabled bool, types, extraURLs []string) (*domain.SitemapSettings, error) {
	wanted := map[string]bool{}
	for _, t := range types {
		known := false
		for _, k := range domain.SitemapTypes {
			if k == t {
				known = true
			}
		}
		if !known {
			return nil, ErrInvalidSitemapType
		}
		wanted[t] = true
	}
	ordered := []string{}
	for _, k := range domain.SitemapTypes {
		if wanted[k] {
			ordered = append(ordered, k)
		}
	}

	site, err := s.settings.Get(ctx)
	if err != nil {
		return nil, err
	}
	siteHost := ""
	if u, err := url.Parse(strings.TrimSpace(site.SiteURL)); err == nil {
		siteHost = strings.ToLower(u.Hostname())
	}
	var extras []string
	seen := map[string]bool{}
	for _, raw := range extraURLs {
		u := strings.TrimSpace(raw)
		if u == "" || seen[u] {
			continue
		}
		if err := checkSitemapURL(u, siteHost); err != nil {
			return nil, err
		}
		seen[u] = true
		extras = append(extras, u)
	}
	if len(extras) > maxSitemapExtraURLs {
		return nil, ErrTooManySitemapURLs
	}

	settings := &domain.SitemapSettings{Enabled: enabled, Types: ordered, ExtraURLs: extras}
	if err := s.sitemap.SaveSettings(ctx, settings); err != nil {
		return nil, err
	}
	return s.sitemap.GetSettings(ctx)
}

func checkSitemapURL(u, siteHost string) error {
	bad := fmt.Errorf("%w (%q)", ErrInvalidSitemapURL, u)
	if len(u) > maxSitemapURLLength || strings.ContainsAny(u, " \t<>\"") {
		return bad
	}
	if strings.HasPrefix(u, "/") {
		if strings.HasPrefix(u, "//") {
			return bad
		}
		return nil
	}
	parsed, err := url.Parse(u)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" {
		return bad
	}
	if siteHost != "" && strings.TrimPrefix(strings.ToLower(parsed.Hostname()), "www.") != strings.TrimPrefix(siteHost, "www.") {
		return bad
	}
	return nil
}

// PublicSitemap is what the website turns into /sitemap.xml. Loc is a path
// ("/casinos/77w", the website adds its own address) or, for an extra
// address, a full URL.
type PublicSitemap struct {
	Enabled bool
	Entries []domain.SitemapEntry
}

func (s *SitemapService) Public(ctx context.Context) (*PublicSitemap, error) {
	overview, err := s.Overview(ctx)
	if err != nil {
		return nil, err
	}
	if !overview.Settings.Enabled || overview.SiteNoindex {
		return &PublicSitemap{Enabled: false}, nil
	}
	out := &PublicSitemap{Enabled: true}
	seen := map[string]bool{}
	for _, item := range overview.Items {
		if !item.Listed || seen[item.Path] {
			continue
		}
		seen[item.Path] = true
		entry := domain.SitemapEntry{Loc: item.Path}
		if !item.UpdatedAt.IsZero() {
			t := item.UpdatedAt
			entry.LastMod = &t
		}
		out.Entries = append(out.Entries, entry)
	}
	// Homepage first, then by address, so the file reads in order.
	sort.SliceStable(out.Entries, func(i, j int) bool {
		if out.Entries[i].Loc == "/" || out.Entries[j].Loc == "/" {
			return out.Entries[i].Loc == "/"
		}
		return out.Entries[i].Loc < out.Entries[j].Loc
	})
	for _, u := range overview.Settings.ExtraURLs {
		if !seen[u] {
			seen[u] = true
			out.Entries = append(out.Entries, domain.SitemapEntry{Loc: u})
		}
	}
	return out, nil
}

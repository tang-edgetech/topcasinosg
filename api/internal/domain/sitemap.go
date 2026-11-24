package domain

import "time"

// Sitemap: the website's /sitemap.xml, built from published content. Each
// content type is listed or not by default (SitemapSettings.Types), and any
// single item can override that with "include" or "exclude".
const (
	SitemapModeDefault = "default"
	SitemapModeInclude = "include"
	SitemapModeExclude = "exclude"

	// SitemapTypeListing: the fixed list pages (/casinos, /guides, /news,
	// /blacklist), ids from SitemapListings.
	SitemapTypeListing = "listing"
)

// SitemapTypes: everything the sitemap can list, in display order.
var SitemapTypes = []string{SeoEntityPage, SeoEntityCasino, SeoEntityGuide, SeoEntityNews, SeoEntityBonus, SitemapTypeListing}

// SitemapListing is one fixed list page of the website.
type SitemapListing struct {
	ID   int64
	Name string
	Path string
}

var SitemapListings = []SitemapListing{
	{ID: 1, Name: "Casino reviews list", Path: "/casinos"},
	{ID: 2, Name: "Guides list", Path: "/guides"},
	{ID: 3, Name: "News list", Path: "/news"},
	{ID: 4, Name: "Blacklist", Path: "/blacklist"},
}

// SitemapSettings is the single settings row.
type SitemapSettings struct {
	Enabled   bool
	Types     []string
	ExtraURLs []string
	UpdatedAt time.Time
}

// TypeOn reports whether a content type is listed by default.
func (s *SitemapSettings) TypeOn(t string) bool {
	for _, x := range s.Types {
		if x == t {
			return true
		}
	}
	return false
}

// Why an item is or isn't in the sitemap.
const (
	SitemapReasonListed      = "listed"      // its type is on
	SitemapReasonIncluded    = "included"    // always include
	SitemapReasonExcluded    = "excluded"    // exclude
	SitemapReasonTypeOff     = "type_off"    // its type is off
	SitemapReasonNoindex     = "noindex"     // Hide from search results
	SitemapReasonRedirected  = "redirected"  // an active redirect sends it elsewhere
	SitemapReasonOff         = "sitemap_off" // the whole sitemap is off
	SitemapReasonSiteNoindex = "site_noindex"
	SitemapReasonUnpublished = "unpublished" // draft or scheduled for later
)

// SitemapItem is one published page or item that could be listed.
type SitemapItem struct {
	EntityType string
	EntityID   int64
	Name       string
	Path       string // starts with "/"
	UpdatedAt  time.Time
	Mode       string
	Listed     bool
	Reason     string
}

// SitemapEntry is one address of the finished sitemap.
type SitemapEntry struct {
	Loc     string
	LastMod *time.Time
}

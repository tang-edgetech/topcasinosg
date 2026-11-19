package domain

import "time"

// Redirect sends a visitor from an old or unwanted address of the site
// (FromPath, e.g. "/guides") to another page or website (ToURL, a path such
// as "/sg/guides" or a full https:// address). Applied by the website before
// any page renders (web/src/proxy.ts), so it works for built-in pages too.
type Redirect struct {
	ID         int64
	FromPath   string
	ToURL      string
	StatusCode int // RedirectPermanent or RedirectTemporary
	Active     bool
	Note       string
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

const (
	RedirectPermanent = 301 // the page has moved for good; search engines move its ranking
	RedirectTemporary = 302 // for now only; search engines keep the old address
)

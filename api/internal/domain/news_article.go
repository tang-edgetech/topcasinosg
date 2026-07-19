package domain

import "time"

// NewsArticle is global content (no region scoping, like Blacklist) with a
// slug + cover image (like Casino/Guides) for the site's blog/news section.
type NewsArticle struct {
	ID           int64
	Title        string
	Slug         string
	CoverMediaID *int64
	Excerpt      string
	Content      string
	Status       ContentStatus
	PublishAt    *time.Time
	CreatedBy    *int64
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

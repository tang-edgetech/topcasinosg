package domain

import "time"

// Guide is an editorial article. A nil RegionID means it's a global guide
// shown on the site-wide /guides index; a non-nil RegionID means it also
// shows under /{region}/guides — same table, not a duplicated content type
// (see Bonus for the region-scoped-only reference shape).
type Guide struct {
	ID           int64
	RegionID     *int64
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

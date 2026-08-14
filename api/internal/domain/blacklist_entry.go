package domain

import "time"

// BlacklistEntry has no foreign key to casinos or media, just the shared
// draft/scheduled/published workflow over a handful of text fields. A nil
// RegionID means it's a global entry shown on the site-wide /blacklist
// index; a non-nil RegionID means it also shows under /{region}/blacklist —
// same nullable-region pattern as Guide.
type BlacklistEntry struct {
	ID        int64
	RegionID  *int64
	Name      string
	Reason    string
	Details   string
	Status    ContentStatus
	PublishAt *time.Time
	CreatedBy *int64
	CreatedAt time.Time
	UpdatedAt time.Time
}

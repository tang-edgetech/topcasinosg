package domain

import "time"

// BlacklistEntry has no foreign key to casinos, just the shared
// draft/scheduled/published workflow over a handful of text fields plus an
// optional logo. A nil RegionID means it's a global entry shown on the
// site-wide /blacklist index; a non-nil RegionID means it also shows under
// /{region}/blacklist — same nullable-region pattern as Guide.
type BlacklistEntry struct {
	ID          int64
	RegionID    *int64
	Name        string
	LogoMediaID *int64
	// LogoURL is resolved via a LEFT JOIN against media in every repo read
	// path (mirrors Casino) — never set on write.
	LogoURL   *string
	Rating    *float64
	Reason    string
	Reasons   []string
	Details   string
	Status    ContentStatus
	PublishAt *time.Time
	CreatedBy *int64
	CreatedAt time.Time
	UpdatedAt time.Time
}

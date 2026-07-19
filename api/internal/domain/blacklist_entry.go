package domain

import "time"

// BlacklistEntry is the simplest content type in the system — no region
// scoping and no foreign keys to casinos or media, just the shared
// draft/scheduled/published workflow over a handful of text fields.
type BlacklistEntry struct {
	ID        int64
	Name      string
	Reason    string
	Details   string
	Status    ContentStatus
	PublishAt *time.Time
	CreatedBy *int64
	CreatedAt time.Time
	UpdatedAt time.Time
}

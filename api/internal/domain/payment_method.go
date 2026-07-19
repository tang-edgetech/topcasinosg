package domain

import "time"

// PaymentMethod is region-scoped content, simpler than Bonus — no type enum,
// no casino tie-in, no code/date range. Just a name/description/icon plus
// the standard draft/scheduled/published workflow.
type PaymentMethod struct {
	ID          int64
	RegionID    int64
	Name        string
	Description string
	IconMediaID *int64
	Status      ContentStatus
	PublishAt   *time.Time
	CreatedBy   *int64
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

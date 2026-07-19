package domain

import "time"

// RTPCategory mirrors the game categories RTP entries are tracked against
// (slots, table games, live dealer, and everything else).
type RTPCategory string

const (
	RTPCategorySlot  RTPCategory = "slot"
	RTPCategoryTable RTPCategory = "table"
	RTPCategoryLive  RTPCategory = "live"
	RTPCategoryOther RTPCategory = "other"
)

func (c RTPCategory) Valid() bool {
	switch c {
	case RTPCategorySlot, RTPCategoryTable, RTPCategoryLive, RTPCategoryOther:
		return true
	default:
		return false
	}
}

// RTPEntry is region-scoped content (like Bonuses) — draft/scheduled/published
// + publish_at, optionally tied to a region and/or casino.
type RTPEntry struct {
	ID            int64
	RegionID      int64
	CasinoID      *int64
	GameName      string
	Category      RTPCategory
	RTPPercentage float64
	Status        ContentStatus
	PublishAt     *time.Time
	CreatedBy     *int64
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

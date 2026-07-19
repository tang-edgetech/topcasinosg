package domain

import "time"

// Region is deliberately a DB row, not a hardcoded list — adding Philippines
// later is an admin action, not a code change or redeploy. See web/'s
// [region] dynamic route.
type Region struct {
	ID          int64
	Code        string
	Name        string
	FlagMediaID *int64
	// FlagURL is denormalized in via a JOIN on media at read-time (like
	// Casino's attachRegionsBatch) — not a real column on regions.
	FlagURL   *string
	IsActive  bool
	SortOrder int
	CreatedAt time.Time
	UpdatedAt time.Time
}

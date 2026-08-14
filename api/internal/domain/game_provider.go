package domain

import "time"

// GameProvider is a managed logo list (e.g. Pragmatic Play, Evolution
// Gaming) shown on a casino's review page (Figma "Game Providers" section).
// Same shape as Region minus code/is_active — no URL slug or activation
// lifecycle needed for a logo entry.
type GameProvider struct {
	ID          int64
	Name        string
	LogoMediaID *int64
	// LogoURL is denormalized in via a JOIN on media at read-time (like
	// Region.FlagURL) — not a real column on game_providers.
	LogoURL   *string
	SortOrder int
	CreatedAt time.Time
	UpdatedAt time.Time
}

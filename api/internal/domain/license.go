package domain

import "time"

// License is a managed logo list (e.g. PAGCOR, MGA, Curacao eGaming) shown
// on a casino's review page (Figma "Licences" section). Same shape as
// GameProvider — see game_provider.go.
type License struct {
	ID          int64
	Name        string
	LogoMediaID *int64
	// LogoURL is denormalized in via a JOIN on media at read-time (like
	// GameProvider.LogoURL) — not a real column on licenses.
	LogoURL   *string
	SortOrder int
	CreatedAt time.Time
	UpdatedAt time.Time
}

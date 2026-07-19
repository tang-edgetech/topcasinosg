package service

import "errors"

// Shared across content services (Regions, Casinos, Guides, News, ...) where
// a unique field (code, slug) collides with an existing row.
var ErrAlreadyExists = errors.New("already exists")

// Shared by every content type with the draft/scheduled/published workflow.
var (
	ErrInvalidContentStatus = errors.New("status must be 'draft', 'scheduled', or 'published'")
	ErrPublishAtRequired    = errors.New("publishAt is required when status is 'scheduled'")
)

// MenuItemService validation.
var (
	ErrInvalidMenuLocation        = errors.New("location must be 'header' or 'footer'")
	ErrInvalidMenuSourceType      = errors.New("sourceType must be 'static', 'dynamic_regions', or 'dynamic_casinos'")
	ErrMenuParentLocationMismatch = errors.New("parent item belongs to a different location")
)

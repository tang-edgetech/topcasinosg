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

// PageService validation.
var (
	ErrInvalidBlockType = errors.New("unknown block type")
	ErrInvalidFieldType = errors.New("field type must be 'text', 'richtext', 'image', or 'button'")
	ErrHomeSlugLocked   = errors.New("the homepage's slug must stay 'home' with no parent")
	ErrInvalidParent    = errors.New("a page cannot be its own parent or a descendant of itself")
)

// CasinoService validation.
var (
	ErrInvalidRiskStatus = errors.New("riskStatus must be 'low', 'medium', or 'high'")
	ErrInvalidSafeIndex  = errors.New("safeIndex must be between 0 and 100")
	ErrInvalidGameType   = errors.New("supportedGames contains an unknown game type")
)

// SidebarService validation — the 3 sections are fixed at the schema level;
// a save can only update them, never add/remove/rename one.
var ErrInvalidSidebarSections = errors.New("sidebar sections must match the existing fixed set of sections")

// SnippetService validation.
var (
	ErrInvalidSnippetLocation  = errors.New("location must be 'head', 'body', or 'footer'")
	ErrInvalidSnippetKind      = errors.New("kind must be 'global' or 'code'")
	ErrInvalidCodeType         = errors.New("codeType is required (html/css/js/universal) for 'code' snippets and must be omitted for 'global' ones")
	ErrInvalidSnippetPriority  = errors.New("priority must be between 0 and 100")
	ErrInvalidSnippetCondition = errors.New("invalid targeting condition")
)

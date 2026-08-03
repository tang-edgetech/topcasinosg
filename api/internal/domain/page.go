package domain

import "time"

// Page is a flexible, block-based page (Homepage, About, ...) built from an
// ordered list of Sections, each holding its own ordered Fields. See
// api/internal/db/migrations/0016_pages.sql for the full schema rationale.
type Page struct {
	ID              int64
	Slug            string
	Title           string
	MetaTitle       string
	MetaDescription string
	// HeadSnippet/BodySnippet/FooterSnippet are raw HTML/JS scoped to just
	// this page, layered on top of the site-wide Snippets (see
	// domain.SiteSnippet). Editing these three requires Super Admin — see
	// PageService.UpdateSnippets and the superAdminOnly route in server.go —
	// while the rest of a page (including MetaTitle/MetaDescription)
	// stays editable by any content-management role.
	HeadSnippet   string
	BodySnippet   string
	FooterSnippet string
	Status        ContentStatus
	PublishAt     *time.Time
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

// KnownBlockTypes is not enforced by the database (block_type is a plain
// VARCHAR so new block types never need a migration) — it's just the set the
// admin page builder currently offers and the public site knows how to
// render. Add a new block by: adding its key/label here, teaching the admin
// field editor its field shape, and adding a render case in web/.
var KnownBlockTypes = []string{
	"hero",
	"rich_text",
	"icon_box_group",
	"image_gallery",
	"cta",
	"logo_strip",
	"stats_counter",
	"faq",
}

// PageSection is one visual block on a page. CustomClass/CustomID are the
// admin-editable extras layered on top of the canonical per-block-type class
// the frontend always applies first, so reused block types (e.g. every
// icon_box_group, like "Our Review Process") stay visually consistent by
// default while still being individually tweakable.
type PageSection struct {
	ID          int64
	PageID      int64
	BlockType   string
	CustomClass string
	CustomID    string
	SortOrder   int
	Fields      []PageSectionField
}

// PageSectionField is one EAV-style value. ItemIndex groups fields into
// repeatable items within a section (e.g. icon_box_group's N boxes, or
// image_gallery's N images) — a section-level singular field (its own
// heading) always uses ItemIndex 0.
type PageSectionField struct {
	ID        int64
	SectionID int64
	ItemIndex int
	FieldKey  string
	FieldType string
	TextValue string
	MediaID   *int64
	// MediaURL is denormalized in via a JOIN at read-time (like Region's
	// FlagURL) — not a real column on this table.
	MediaURL  *string
	URLValue  string
	SortOrder int
}

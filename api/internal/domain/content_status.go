package domain

// ContentStatus is shared by every content type that supports the
// draft/scheduled/published workflow (Casinos, Bonuses, Payment Methods,
// RTP entries, Guides, Blacklist entries, News).
type ContentStatus string

const (
	ContentStatusDraft     ContentStatus = "draft"
	ContentStatusScheduled ContentStatus = "scheduled"
	ContentStatusPublished ContentStatus = "published"
)

func (s ContentStatus) Valid() bool {
	switch s {
	case ContentStatusDraft, ContentStatusScheduled, ContentStatusPublished:
		return true
	default:
		return false
	}
}

package domain

import (
	"strings"
	"time"
)

// API key scopes: the parts of the site a key may use through the Content
// API (/api/v1). A "Needs approval" key only has pages, news and media:
// media is uploaded straight into the Media Library, pages and news become
// proposals (ContentChange). A "Direct" key may have any scope and uses the
// admin endpoints of each one (see server/direct_api.go).
const (
	APIScopePages          = "pages"
	APIScopeNews           = "news"
	APIScopeMedia          = "media"
	APIScopeCasinos        = "casinos"
	APIScopeBonuses        = "bonuses"
	APIScopePaymentMethods = "payment_methods"
	APIScopeRTP            = "rtp"
	APIScopeGuides         = "guides"
	APIScopeBlacklist      = "blacklist"
	APIScopeRegions        = "regions"
	APIScopeNavigation     = "navigation"
	APIScopeSnippets       = "snippets"
	APIScopeSettings       = "settings"
)

var KnownAPIScopes = []string{
	APIScopePages, APIScopeNews, APIScopeMedia, APIScopeCasinos, APIScopeBonuses, APIScopePaymentMethods, APIScopeRTP,
	APIScopeGuides, APIScopeBlacklist, APIScopeRegions, APIScopeNavigation, APIScopeSnippets, APIScopeSettings,
}

// ReviewAPIScopes are the scopes a "Needs approval" key may have.
var ReviewAPIScopes = []string{APIScopePages, APIScopeNews, APIScopeMedia}

// API key modes: a "review" key's page and news changes wait in AI Changes
// for an admin; a "direct" key's changes go live at once, and what it
// deletes goes to the Recycle Bin.
const (
	APIKeyModeReview = "review"
	APIKeyModeDirect = "direct"
)

// APIKeyPrefix starts every key, so a leaked one is easy to recognise.
const APIKeyPrefix = "tcs_"

// APIKey lets a tool use the Content API. Only a hash of the key is stored;
// Prefix is its first characters, shown so admins can tell keys apart. A
// key acts for the admin who created it (CreatedBy) and stops working when
// that admin is disabled or removed.
type APIKey struct {
	ID            int64
	Name          string
	Prefix        string
	Mode          string
	Scopes        []string
	CreatedByID   *int64
	CreatedByName string
	CreatedAt     time.Time
	LastUsedAt    *time.Time
	RevokedAt     *time.Time
}

func (k *APIKey) IsDirect() bool { return k.Mode == APIKeyModeDirect }

func (k *APIKey) HasScope(scope string) bool {
	for _, s := range k.Scopes {
		if s == scope {
			return true
		}
	}
	return false
}

// ParseAPIScopes splits the stored comma-separated scopes.
func ParseAPIScopes(v string) []string {
	var scopes []string
	for _, s := range strings.Split(v, ",") {
		if s = strings.TrimSpace(s); s != "" {
			scopes = append(scopes, s)
		}
	}
	return scopes
}

const (
	ContentChangePage = "page"
	ContentChangeNews = "news"

	ContentChangeCreate = "create"
	ContentChangeUpdate = "update"

	ContentChangePending   = "pending"
	ContentChangeApproved  = "approved"
	ContentChangeRejected  = "rejected"
	ContentChangeWithdrawn = "withdrawn"
)

// ContentChange is a change proposed through the Content API. It waits as
// pending until an admin approves (it is applied: a new page or article as a
// draft, an update straight to the existing one) or rejects it. Payload is
// the proposed content as JSON (see service.PageChange / service.NewsChange);
// BaseHash fingerprints the content it was based on, and Outdated is set
// when that content has been edited since.
type ContentChange struct {
	ID             int64
	APIKeyID       *int64
	APIKeyName     string
	ContentType    string
	Action         string
	TargetID       *int64
	Label          string
	Note           string
	Payload        []byte
	BaseHash       string
	Status         string
	ReviewNote     string
	ReviewedByID   *int64
	ReviewedByName string
	ReviewedAt     *time.Time
	ResultID       *int64
	CreatedAt      time.Time
	Outdated       bool
	// Warnings are notes on a proposal just made (see
	// service.ContentChangeService.ProposePage); they aren't stored.
	Warnings []string
}

// MaxPageRevisions is how many saved versions each page keeps.
const MaxPageRevisions = 10

// Page revision sources: who made the save that a revision records.
const (
	PageRevisionEditor   = "editor"
	PageRevisionAIChange = "ai_change"
	PageRevisionOriginal = "original"
)

// PageRevision is one saved version of a page's sections.
type PageRevision struct {
	ID          int64
	PageID      int64
	Sections    []PageSection
	SavedByID   *int64
	SavedByName string
	Source      string
	CreatedAt   time.Time
}

// RecycleBinDays is how long a deleted item waits in the Recycle Bin before
// it is deleted for good.
const RecycleBinDays = 30

// RecycleBinItem is something a Direct API key deleted. The item itself is
// kept, switched off the site (status draft, or a snippet made inactive),
// until it is restored or RecycleBinDays have passed. ItemType is its admin
// route ("pages", "casinos", ...); PreviousStatus and PreviousPublishAt are
// what restoring puts back ("active"/"inactive" for a snippet).
type RecycleBinItem struct {
	ID                int64
	ItemType          string
	ItemID            int64
	Label             string
	PreviousStatus    string
	PreviousPublishAt *time.Time
	DeletedByID       *int64
	DeletedByName     string
	APIKeyID          *int64
	APIKeyName        string
	DeletedAt         time.Time
}

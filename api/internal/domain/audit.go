package domain

import "time"

const (
	AuditActionCreate      = "create"
	AuditActionUpdate      = "update"
	AuditActionDelete      = "delete"
	AuditActionLogin       = "login"
	AuditActionLoginFailed = "login_failed"
	AuditActionLogout      = "logout"

	AuditEntityAuth = "auth"

	AuditRetentionDays = 365
)

// AuditChanges maps a field name to {"from": old, "to": new}. A create has
// only "to" values, a delete only "from" values.
type AuditChanges map[string]map[string]any

// AuditLog is one append-only activity entry. Restricted entries (anything a
// Super Admin did, or anything done to a Super Admin account) are visible
// to Super Admins only — see CanSeeSuperAdmins.
type AuditLog struct {
	ID          int64
	ActorID     *int64
	ActorName   string
	ActorRole   string
	Action      string
	EntityType  string
	EntityID    *int64
	EntityLabel string
	Changes     AuditChanges
	Restricted  bool
	IPAddress   string
	UserAgent   string
	CreatedAt   time.Time
}

type AuditFilter struct {
	ActorID           *int64
	EntityType        string
	Action            string
	From              *time.Time
	To                *time.Time
	IncludeRestricted bool
	OnlyActorID       *int64
	Page              int
	PageSize          int
}

type AuditActor struct {
	ID   int64
	Name string
}

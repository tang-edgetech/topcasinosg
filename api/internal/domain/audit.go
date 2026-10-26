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

	AuditStatusOK           = 200
	AuditStatusFailedSignIn = 401
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
	IPPort      *int
	UserAgent   string
	// RequestMethod and RequestPath are the admin request that was made;
	// StatusCode 400 and above marks a failed one, with ErrorMessage being
	// the error the admin saw.
	RequestMethod string
	RequestPath   string
	StatusCode    int
	ErrorMessage  string
	CreatedAt     time.Time
}

type AuditFilter struct {
	ActorID           *int64
	EntityType        string
	Action            string
	From              *time.Time
	To                *time.Time
	ErrorsOnly        bool
	IncludeRestricted bool
	OnlyActorID       *int64
	Page              int
	PageSize          int
}

type AuditActor struct {
	ID   int64
	Name string
}

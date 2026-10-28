package domain

import (
	"regexp"
	"strings"
	"time"
)

type Role string

const (
	RoleSuperAdmin Role = "super_admin"
	RoleAdmin      Role = "admin"
	RoleEditor     Role = "editor"
)

func (r Role) Valid() bool {
	switch r {
	case RoleSuperAdmin, RoleAdmin, RoleEditor:
		return true
	default:
		return false
	}
}

type Status string

const (
	StatusActive   Status = "active"
	StatusDisabled Status = "disabled"
	StatusDeleted  Status = "deleted"
)

// usernamePattern: 3–30 lowercase letters, digits, underscores, hyphens or
// periods. Usernames are unique, like emails; either one signs a user in.
var usernamePattern = regexp.MustCompile(`^[a-z0-9._-]{3,30}$`)

func NormalizeUsername(username string) string {
	return strings.ToLower(strings.TrimSpace(username))
}

func ValidUsername(username string) bool {
	return usernamePattern.MatchString(username)
}

type Theme string

const (
	ThemeLight Theme = "light"
	ThemeDark  Theme = "dark"
)

func (t Theme) Valid() bool {
	return t == ThemeLight || t == ThemeDark
}

// AdminUser mirrors the admin_users table. PasswordHash is never serialized
// to JSON — handlers build their own response DTOs.
type AdminUser struct {
	ID              int64
	Email           string
	Username        string
	PasswordHash    string
	FullName        string
	Role            Role
	ThemePreference Theme
	Status          Status
	// OTPDeviceCount is the number of confirmed 2FA devices (admin_user_otp_devices).
	OTPDeviceCount int
	// LockedSeconds is how long a sign-in lockout has left (0: not locked),
	// worked out by the DB so it uses the DB clock that set it.
	LockedSeconds      int
	MustChangePassword bool
	CreatedBy          *int64
	CreatedAt          time.Time
	UpdatedAt          time.Time
}

func (u AdminUser) OTPEnrolled() bool {
	return u.OTPDeviceCount > 0
}

// MaxOTPDevices is how many authenticator apps one user can register.
const MaxOTPDevices = 2

// OTPDevice is one registered authenticator app. ConfirmedAt is nil while
// its setup is still waiting for the first code.
type OTPDevice struct {
	ID              int64
	UserID          int64
	Name            string
	SecretEncrypted []byte
	ConfirmedAt     *time.Time
	LastUsedAt      *time.Time
	CreatedAt       time.Time
}

// DefaultAccount is one of the starting accounts every deployment must have.
type DefaultAccount struct {
	Username string
	Email    string
	FullName string
	Role     Role
}

// DefaultAccountPassword is only used when a default account is (re)created;
// an existing account's password is never touched. Change it after the first
// sign-in on every environment.
const DefaultAccountPassword = "Admin@1234"

var DefaultAccounts = []DefaultAccount{
	{Username: "dev-admin", Email: "dev-admin@topcasinosg.com.sg", FullName: "Dev Admin", Role: RoleSuperAdmin},
	{Username: "dev-admin-2", Email: "dev-admin-2@topcasinosg.com.sg", FullName: "Dev Admin 2", Role: RoleSuperAdmin},
	{Username: "super-admin", Email: "super-admin@topcasinosg.com.sg", FullName: "Super Admin", Role: RoleAdmin},
}

// CanSeeSuperAdmins: Super Admin is hidden from every other role — not
// listed, not assignable, absent from the activity log — so to an Admin the
// role simply doesn't exist.
func CanSeeSuperAdmins(actorRole Role) bool {
	return actorRole == RoleSuperAdmin
}

// CanManage reports whether actor can manage a user with target's role.
// Admins have full control over Admins and Editors; Super Admins over everyone.
func CanManage(actorRole Role, targetRole Role) bool {
	switch actorRole {
	case RoleSuperAdmin:
		return true
	case RoleAdmin:
		return targetRole == RoleAdmin || targetRole == RoleEditor
	default:
		return false
	}
}

// AssignableRoles lists the roles actor is allowed to create/assign.
func AssignableRoles(actorRole Role) []Role {
	switch actorRole {
	case RoleSuperAdmin:
		return []Role{RoleSuperAdmin, RoleAdmin, RoleEditor}
	case RoleAdmin:
		return []Role{RoleAdmin, RoleEditor}
	default:
		return nil
	}
}

// Session is one signed-in browser (admin_sessions). Its refresh tokens
// rotate; the session keeps its id until it is signed out or expires.
type Session struct {
	ID         string
	UserID     int64
	IPAddress  string
	UserAgent  string
	CreatedAt  time.Time
	LastSeenAt time.Time
	ExpiresAt  time.Time
}

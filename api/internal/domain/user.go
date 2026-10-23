package domain

import "time"

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

type Theme string

const (
	ThemeLight Theme = "light"
	ThemeDark  Theme = "dark"
)

func (t Theme) Valid() bool {
	return t == ThemeLight || t == ThemeDark
}

// AdminUser mirrors the admin_users table. PasswordHash and OTPSecretEncrypted
// are never serialized to JSON — handlers build their own response DTOs.
type AdminUser struct {
	ID                 int64
	Email              string
	PasswordHash       string
	FullName           string
	Role               Role
	ThemePreference    Theme
	Status             Status
	OTPSecretEncrypted []byte
	OTPConfirmedAt     *time.Time
	CreatedBy          *int64
	CreatedAt          time.Time
	UpdatedAt          time.Time
}

func (u AdminUser) OTPEnrolled() bool {
	return u.OTPConfirmedAt != nil
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

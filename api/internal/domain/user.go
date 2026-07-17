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
	CanManageAdmins    bool
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

// CanManage reports whether actor can manage a user with target's role,
// honoring the "Crown" flag: an Admin without it may only manage Editors.
func CanManage(actorRole Role, actorCanManageAdmins bool, targetRole Role) bool {
	switch actorRole {
	case RoleSuperAdmin:
		return true
	case RoleAdmin:
		if targetRole == RoleEditor {
			return true
		}
		if targetRole == RoleAdmin {
			return actorCanManageAdmins
		}
		return false
	default:
		return false
	}
}

// AssignableRoles lists the roles actor is allowed to create/assign.
func AssignableRoles(actorRole Role, actorCanManageAdmins bool) []Role {
	switch actorRole {
	case RoleSuperAdmin:
		return []Role{RoleSuperAdmin, RoleAdmin, RoleEditor}
	case RoleAdmin:
		if actorCanManageAdmins {
			return []Role{RoleAdmin, RoleEditor}
		}
		return []Role{RoleEditor}
	default:
		return nil
	}
}

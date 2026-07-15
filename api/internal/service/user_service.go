package service

import (
	"context"
	"errors"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
	"github.com/tang-edgetech/topcasinosg/api/internal/security"
)

var (
	ErrForbidden            = errors.New("not allowed to manage this account")
	ErrEmailTaken           = errors.New("email is already in use")
	ErrInvalidRole          = errors.New("role is not assignable by this account")
	ErrCannotActOnSelf      = errors.New("cannot perform this action on your own account")
	ErrWrongCurrentPassword = errors.New("current password is incorrect")
)

type UserService struct {
	users         *repository.UserRepo
	refreshTokens *repository.RefreshTokenRepo
	settings      *repository.SettingsRepo
}

func NewUserService(users *repository.UserRepo, refreshTokens *repository.RefreshTokenRepo, settings *repository.SettingsRepo) *UserService {
	return &UserService{users: users, refreshTokens: refreshTokens, settings: settings}
}

// visibleRoles mirrors domain.AssignableRoles: what an actor may see is
// exactly what they may manage. Editors get nothing — they have no access to
// user management at all, enforced again at the route level.
func visibleRoles(actor *domain.AdminUser) []domain.Role {
	return domain.AssignableRoles(actor.Role, actor.CanManageAdmins)
}

func (s *UserService) List(ctx context.Context, actor *domain.AdminUser) ([]domain.AdminUser, error) {
	roles := visibleRoles(actor)
	if len(roles) == 0 {
		return nil, nil
	}
	return s.users.ListByRoles(ctx, roles)
}

func (s *UserService) Create(ctx context.Context, actor *domain.AdminUser, email, password, fullName string, role domain.Role) (*domain.AdminUser, error) {
	if !role.Valid() || !roleAssignable(actor, role) {
		return nil, ErrInvalidRole
	}
	exists, err := s.users.ExistsEmail(ctx, email, 0)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrEmailTaken
	}
	hash, err := security.HashPassword(password)
	if err != nil {
		return nil, err
	}

	actorID := actor.ID
	user := &domain.AdminUser{
		Email:        email,
		PasswordHash: hash,
		FullName:     fullName,
		Role:         role,
		Status:       domain.StatusActive,
		CreatedBy:    &actorID,
	}
	id, err := s.users.Create(ctx, user)
	if err != nil {
		return nil, err
	}
	return s.users.GetByID(ctx, id)
}

func roleAssignable(actor *domain.AdminUser, role domain.Role) bool {
	for _, r := range domain.AssignableRoles(actor.Role, actor.CanManageAdmins) {
		if r == role {
			return true
		}
	}
	return false
}

func (s *UserService) requireManage(ctx context.Context, actor *domain.AdminUser, targetID int64) (*domain.AdminUser, error) {
	target, err := s.users.GetByID(ctx, targetID)
	if err != nil {
		return nil, err
	}
	if !domain.CanManage(actor.Role, actor.CanManageAdmins, target.Role) {
		return nil, ErrForbidden
	}
	return target, nil
}

func (s *UserService) UpdateProfile(ctx context.Context, actor *domain.AdminUser, targetID int64, email, fullName string) error {
	if _, err := s.requireManage(ctx, actor, targetID); err != nil {
		return err
	}
	exists, err := s.users.ExistsEmail(ctx, email, targetID)
	if err != nil {
		return err
	}
	if exists {
		return ErrEmailTaken
	}
	return s.users.UpdateProfile(ctx, targetID, email, fullName)
}

func (s *UserService) SetStatus(ctx context.Context, actor *domain.AdminUser, targetID int64, status domain.Status) error {
	if targetID == actor.ID {
		return ErrCannotActOnSelf
	}
	if _, err := s.requireManage(ctx, actor, targetID); err != nil {
		return err
	}
	if err := s.users.UpdateStatus(ctx, targetID, status); err != nil {
		return err
	}
	if status != domain.StatusActive {
		return s.refreshTokens.RevokeAllForUser(ctx, targetID)
	}
	return nil
}

// SetCanManageAdmins toggles the "Crown" — Super Admin only, and only ever
// meaningful on an Admin account.
func (s *UserService) SetCanManageAdmins(ctx context.Context, actor *domain.AdminUser, targetID int64, enabled bool) error {
	if actor.Role != domain.RoleSuperAdmin {
		return ErrForbidden
	}
	target, err := s.users.GetByID(ctx, targetID)
	if err != nil {
		return err
	}
	if target.Role != domain.RoleAdmin {
		return ErrForbidden
	}
	return s.users.UpdateCanManageAdmins(ctx, targetID, enabled)
}

func (s *UserService) SelfChangePassword(ctx context.Context, actor *domain.AdminUser, currentPassword, newPassword string) error {
	if !security.VerifyPassword(actor.PasswordHash, currentPassword) {
		return ErrWrongCurrentPassword
	}
	hash, err := security.HashPassword(newPassword)
	if err != nil {
		return err
	}
	return s.users.UpdatePassword(ctx, actor.ID, hash)
}

// AdminResetPassword is the "higher role helps lower role" path — no current
// password is required, and it revokes the target's sessions so a possibly
// compromised session can't linger.
func (s *UserService) AdminResetPassword(ctx context.Context, actor *domain.AdminUser, targetID int64, newPassword string) error {
	if targetID == actor.ID {
		return ErrCannotActOnSelf
	}
	if _, err := s.requireManage(ctx, actor, targetID); err != nil {
		return err
	}
	hash, err := security.HashPassword(newPassword)
	if err != nil {
		return err
	}
	if err := s.users.UpdatePassword(ctx, targetID, hash); err != nil {
		return err
	}
	return s.refreshTokens.RevokeAllForUser(ctx, targetID)
}

// ResetOTP clears a lower role's TOTP enrollment so they re-scan a fresh QR
// on next login — used when they lose their authenticator device.
func (s *UserService) ResetOTP(ctx context.Context, actor *domain.AdminUser, targetID int64) error {
	if targetID == actor.ID {
		return ErrCannotActOnSelf
	}
	if _, err := s.requireManage(ctx, actor, targetID); err != nil {
		return err
	}
	if err := s.users.ResetOTP(ctx, targetID); err != nil {
		return err
	}
	return s.refreshTokens.RevokeAllForUser(ctx, targetID)
}

func (s *UserService) GetTwoFactorEnabled(ctx context.Context, actor *domain.AdminUser) (bool, error) {
	if actor.Role != domain.RoleSuperAdmin {
		return false, ErrForbidden
	}
	return s.settings.Is2FAEnabled(ctx)
}

func (s *UserService) SetTwoFactorEnabled(ctx context.Context, actor *domain.AdminUser, enabled bool) error {
	if actor.Role != domain.RoleSuperAdmin {
		return ErrForbidden
	}
	value := "false"
	if enabled {
		value = "true"
	}
	return s.settings.Set(ctx, repository.SettingTwoFactorEnabled, value)
}

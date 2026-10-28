package service

import (
	"context"
	"errors"
	"strings"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
	"github.com/tang-edgetech/topcasinosg/api/internal/security"
)

var (
	ErrForbidden            = errors.New("not allowed to manage this account")
	ErrEmailTaken           = errors.New("this email can't be used")
	ErrUsernameTaken        = errors.New("this username is already taken")
	ErrInvalidUsername      = errors.New("username must be 3–30 characters: lowercase letters, numbers, underscores, hyphens or periods")
	ErrUserNotFound         = errors.New("user not found")
	ErrInvalidRole          = errors.New("role is not assignable by this account")
	ErrCannotActOnSelf      = errors.New("cannot perform this action on your own account")
	ErrWrongCurrentPassword = errors.New("current password is incorrect")
	ErrInvalidTheme         = errors.New("theme must be 'light' or 'dark'")
	ErrFullNameRequired     = errors.New("display name cannot be empty")
	ErrSamePassword         = errors.New("choose a password different from the current one")
)

// WeakPasswordError: the password breaks Settings > Security's password rules.
type WeakPasswordError struct{ Problem string }

func (e *WeakPasswordError) Error() string { return e.Problem }

type UserService struct {
	users         *repository.UserRepo
	otpDevices    *repository.OTPDeviceRepo
	refreshTokens *repository.RefreshTokenRepo
	siteSettings  *repository.SiteSettingsRepo
}

func NewUserService(users *repository.UserRepo, otpDevices *repository.OTPDeviceRepo, refreshTokens *repository.RefreshTokenRepo, siteSettings *repository.SiteSettingsRepo) *UserService {
	return &UserService{users: users, otpDevices: otpDevices, refreshTokens: refreshTokens, siteSettings: siteSettings}
}

// passwordPolicy checks a new password against Settings > Security and
// returns the policy, for its ForcePasswordChange.
func (s *UserService) passwordPolicy(ctx context.Context, password string) (domain.SecurityPolicy, error) {
	settings, err := s.siteSettings.Get(ctx)
	if err != nil {
		return domain.SecurityPolicy{}, err
	}
	if problem := settings.Security.PasswordProblem(password); problem != "" {
		return settings.Security, &WeakPasswordError{Problem: problem}
	}
	return settings.Security, nil
}

// visibleRoles mirrors domain.AssignableRoles: what an actor may see is
// exactly what they may manage. Editors get nothing — they have no access to
// user management at all, enforced again at the route level.
func visibleRoles(actor *domain.AdminUser) []domain.Role {
	return domain.AssignableRoles(actor.Role)
}

func (s *UserService) List(ctx context.Context, actor *domain.AdminUser) ([]domain.AdminUser, error) {
	roles := visibleRoles(actor)
	if len(roles) == 0 {
		return nil, nil
	}
	return s.users.ListByRoles(ctx, roles)
}

func (s *UserService) Create(ctx context.Context, actor *domain.AdminUser, email, username, password, fullName string, role domain.Role) (*domain.AdminUser, error) {
	if !role.Valid() || !roleAssignable(actor, role) {
		return nil, ErrInvalidRole
	}
	username = domain.NormalizeUsername(username)
	if err := s.checkIdentity(ctx, email, username, 0); err != nil {
		return nil, err
	}
	policy, err := s.passwordPolicy(ctx, password)
	if err != nil {
		return nil, err
	}
	hash, err := security.HashPassword(password)
	if err != nil {
		return nil, err
	}

	actorID := actor.ID
	user := &domain.AdminUser{
		Email:        email,
		Username:     username,
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
	if policy.ForcePasswordChange {
		if err := s.users.SetMustChangePassword(ctx, id, true); err != nil {
			return nil, err
		}
	}
	return s.users.GetByID(ctx, id)
}

// checkIdentity validates the username and makes sure neither the email nor
// the username belongs to another account (excludeID is the account itself).
func (s *UserService) checkIdentity(ctx context.Context, email, username string, excludeID int64) error {
	if !domain.ValidUsername(username) {
		return ErrInvalidUsername
	}
	emailTaken, err := s.users.ExistsEmail(ctx, email, excludeID)
	if err != nil {
		return err
	}
	if emailTaken {
		return ErrEmailTaken
	}
	usernameTaken, err := s.users.ExistsUsername(ctx, username, excludeID)
	if err != nil {
		return err
	}
	if usernameTaken {
		return ErrUsernameTaken
	}
	return nil
}

func roleAssignable(actor *domain.AdminUser, role domain.Role) bool {
	for _, r := range domain.AssignableRoles(actor.Role) {
		if r == role {
			return true
		}
	}
	return false
}

func (s *UserService) requireManage(ctx context.Context, actor *domain.AdminUser, targetID int64) (*domain.AdminUser, error) {
	target, err := s.users.GetByID(ctx, targetID)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}
	if target.Role == domain.RoleSuperAdmin && !domain.CanSeeSuperAdmins(actor.Role) {
		return nil, ErrUserNotFound
	}
	if !domain.CanManage(actor.Role, target.Role) {
		return nil, ErrForbidden
	}
	return target, nil
}

// Get returns one account the actor may manage; a hidden Super Admin is
// reported as not found.
func (s *UserService) Get(ctx context.Context, actor *domain.AdminUser, targetID int64) (*domain.AdminUser, error) {
	return s.requireManage(ctx, actor, targetID)
}

func (s *UserService) UpdateProfile(ctx context.Context, actor *domain.AdminUser, targetID int64, email, username, fullName string) error {
	if _, err := s.requireManage(ctx, actor, targetID); err != nil {
		return err
	}
	fullName = strings.TrimSpace(fullName)
	if fullName == "" {
		return ErrFullNameRequired
	}
	username = domain.NormalizeUsername(username)
	if err := s.checkIdentity(ctx, email, username, targetID); err != nil {
		return err
	}
	return s.users.UpdateProfile(ctx, targetID, email, username, fullName)
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

func (s *UserService) SelfChangePassword(ctx context.Context, actor *domain.AdminUser, currentPassword, newPassword string) error {
	if !security.VerifyPassword(actor.PasswordHash, currentPassword) {
		return ErrWrongCurrentPassword
	}
	if newPassword == currentPassword {
		return ErrSamePassword
	}
	if _, err := s.passwordPolicy(ctx, newPassword); err != nil {
		return err
	}
	hash, err := security.HashPassword(newPassword)
	if err != nil {
		return err
	}
	if err := s.users.UpdatePassword(ctx, actor.ID, hash); err != nil {
		return err
	}
	return s.users.SetMustChangePassword(ctx, actor.ID, false)
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
	policy, err := s.passwordPolicy(ctx, newPassword)
	if err != nil {
		return err
	}
	hash, err := security.HashPassword(newPassword)
	if err != nil {
		return err
	}
	if err := s.users.UpdatePassword(ctx, targetID, hash); err != nil {
		return err
	}
	if err := s.users.SetMustChangePassword(ctx, targetID, policy.ForcePasswordChange); err != nil {
		return err
	}
	if err := s.users.ClearFailedLogins(ctx, targetID); err != nil {
		return err
	}
	return s.refreshTokens.RevokeAllForUser(ctx, targetID)
}

// ResetOTP removes all of a lower role's authenticator apps so they scan a
// fresh QR on next login — used when they lose their devices.
func (s *UserService) ResetOTP(ctx context.Context, actor *domain.AdminUser, targetID int64) error {
	if targetID == actor.ID {
		return ErrCannotActOnSelf
	}
	if _, err := s.requireManage(ctx, actor, targetID); err != nil {
		return err
	}
	if err := s.otpDevices.DeleteAllForUser(ctx, targetID); err != nil {
		return err
	}
	return s.refreshTokens.RevokeAllForUser(ctx, targetID)
}

// EnsureDefaultAccounts runs on every API start, so each deployment always
// has the default accounts: one that is missing (never created, or deleted)
// is created again with DefaultAccountPassword. Accounts that exist keep
// their password, status and details. Returns the usernames it created.
// With forceDefaultPasswordChange (production), an account still on
// DefaultAccountPassword must change it at its next sign-in.
func (s *UserService) EnsureDefaultAccounts(ctx context.Context, forceDefaultPasswordChange bool) ([]string, error) {
	var created []string
	for _, account := range domain.DefaultAccounts {
		exists, err := s.users.ExistsUsername(ctx, account.Username, 0)
		if err != nil {
			return created, err
		}
		if exists {
			if forceDefaultPasswordChange {
				if err := s.flagDefaultPassword(ctx, account.Username); err != nil {
					return created, err
				}
			}
			continue
		}
		email := account.Email
		emailTaken, err := s.users.ExistsEmail(ctx, email, 0)
		if err != nil {
			return created, err
		}
		if emailTaken {
			email = account.Username + "+default@topcasinosg.com.sg"
		}
		hash, err := security.HashPassword(domain.DefaultAccountPassword)
		if err != nil {
			return created, err
		}
		id, err := s.users.Create(ctx, &domain.AdminUser{
			Email:        email,
			Username:     account.Username,
			PasswordHash: hash,
			FullName:     account.FullName,
			Role:         account.Role,
			Status:       domain.StatusActive,
		})
		if err != nil {
			return created, err
		}
		if err := s.users.SetMustChangePassword(ctx, id, forceDefaultPasswordChange); err != nil {
			return created, err
		}
		created = append(created, account.Username)
	}
	return created, nil
}

// SetTheme is self-only — there's no product requirement for anyone to set
// another user's theme, it's a personal display preference.
func (s *UserService) SetTheme(ctx context.Context, actor *domain.AdminUser, theme domain.Theme) error {
	if !theme.Valid() {
		return ErrInvalidTheme
	}
	return s.users.UpdateTheme(ctx, actor.ID, theme)
}

// SelfUpdateProfile lets any authenticated user rename themselves — unlike
// UpdateProfile (which goes through requireManage and so, by domain.CanManage's
// rules, can't ever target the actor's own row for admin/editor), this is
// always self, so no manage-permission check applies. Email intentionally
// isn't editable here — that's still an admin-managed field via UpdateProfile.
func (s *UserService) SelfUpdateProfile(ctx context.Context, actor *domain.AdminUser, fullName string) error {
	fullName = strings.TrimSpace(fullName)
	if fullName == "" {
		return ErrFullNameRequired
	}
	return s.users.UpdateFullName(ctx, actor.ID, fullName)
}

// flagDefaultPassword makes a default account still on
// DefaultAccountPassword (which is in the repo) change it at its next
// sign-in.
func (s *UserService) flagDefaultPassword(ctx context.Context, username string) error {
	user, err := s.users.GetByUsername(ctx, username)
	if err != nil {
		return err
	}
	if user.MustChangePassword || !security.VerifyPassword(user.PasswordHash, domain.DefaultAccountPassword) {
		return nil
	}
	return s.users.SetMustChangePassword(ctx, user.ID, true)
}

// Unlock lifts a failed sign-in lockout.
func (s *UserService) Unlock(ctx context.Context, actor *domain.AdminUser, targetID int64) error {
	if _, err := s.requireManage(ctx, actor, targetID); err != nil {
		return err
	}
	return s.users.ClearFailedLogins(ctx, targetID)
}

// SignOutEverywhere ends every session of a lower role's account, e.g. after
// a lost laptop. Their password and 2FA stay as they are.
func (s *UserService) SignOutEverywhere(ctx context.Context, actor *domain.AdminUser, targetID int64) error {
	if targetID == actor.ID {
		return ErrCannotActOnSelf
	}
	if _, err := s.requireManage(ctx, actor, targetID); err != nil {
		return err
	}
	return s.refreshTokens.RevokeAllForUser(ctx, targetID)
}

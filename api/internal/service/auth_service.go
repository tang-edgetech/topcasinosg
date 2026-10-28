package service

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/config"
	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
	"github.com/tang-edgetech/topcasinosg/api/internal/security"
)

const RefreshTokenTTL = 7 * 24 * time.Hour

var (
	ErrInvalidCredentials = errors.New("invalid email, username or password")
	ErrAccountNotActive   = errors.New("this account is inactive")
	ErrAlreadyBootstapped = errors.New("an admin account already exists")
	ErrInvalidOTP         = errors.New("invalid or expired code")
	// ErrTwoFactorRequired: 2FA is on and this session wasn't signed in with
	// a code (it predates the switch), so the user must sign in again.
	ErrTwoFactorRequired = errors.New("two-factor authentication is required — please sign in again")
	ErrOTPDeviceLimit    = errors.New("you can register up to 2 authenticator apps — remove one first")
	ErrOTPLastDevice     = errors.New("two-factor authentication is required, so you must keep at least one authenticator app")
	ErrOTPNoPendingSetup = errors.New("no authenticator setup in progress — start again")
	ErrOTPDeviceNotFound = errors.New("authenticator app not found")
	ErrOTPDeviceName     = errors.New("name must be 1–60 characters")
	ErrSessionNotFound   = errors.New("session not found or already signed out")
)

// AccountLockedError: too many wrong passwords or 2FA codes in a row (see
// domain.SecurityPolicy). JustLocked is set on the attempt that locked it.
type AccountLockedError struct {
	Seconds    int
	JustLocked bool
}

func (e *AccountLockedError) Error() string {
	minutes := max(1, (e.Seconds+59)/60)
	unit := "minutes"
	if minutes == 1 {
		unit = "minute"
	}
	return fmt.Sprintf("too many failed sign-in attempts — this account is locked, try again in %d %s", minutes, unit)
}

// ClientInfo is where a sign-in or refresh came from, shown in the session
// list.
type ClientInfo struct {
	IP        string
	UserAgent string
}

// LoginOutcome captures every branch Login/VerifyOTP/ConfirmOTPSetup can end
// in. Exactly one of (EphemeralToken) or (AccessToken+RefreshToken) is set,
// selected by Status.
type LoginOutcome struct {
	Status         string // "ok" | "otp_required" | "otp_setup_required"
	User           *domain.AdminUser
	EphemeralToken string
	AccessToken    string
	RefreshToken   string
}

type AuthService struct {
	users         *repository.UserRepo
	otpDevices    *repository.OTPDeviceRepo
	siteSettings  *repository.SiteSettingsRepo
	refreshTokens *repository.RefreshTokenRepo
	sessions      *repository.SessionRepo
	jwt           *security.JWTIssuer
	secretbox     *security.Secretbox
	cfg           config.Config
}

func NewAuthService(
	users *repository.UserRepo,
	otpDevices *repository.OTPDeviceRepo,
	siteSettings *repository.SiteSettingsRepo,
	refreshTokens *repository.RefreshTokenRepo,
	sessions *repository.SessionRepo,
	jwt *security.JWTIssuer,
	secretbox *security.Secretbox,
	cfg config.Config,
) *AuthService {
	return &AuthService{users: users, otpDevices: otpDevices, siteSettings: siteSettings, refreshTokens: refreshTokens, sessions: sessions, jwt: jwt, secretbox: secretbox, cfg: cfg}
}

func (s *AuthService) NeedsBootstrap(ctx context.Context) (bool, error) {
	count, err := s.users.CountAll(ctx)
	if err != nil {
		return false, err
	}
	return count == 0, nil
}

// BootstrapInput bundles the first Super Admin's credentials with the
// site-wide settings the product requires be configured in the same
// one-time setup flow, before any admin account exists.
type BootstrapInput struct {
	Email    string
	Password string
	FullName string

	SiteURL   string
	SiteTitle string
	SEOIndex  bool
	SEOFollow bool
	Timezone  string
	Language  domain.Language
}

func (s *AuthService) Bootstrap(ctx context.Context, input BootstrapInput) (*domain.AdminUser, error) {
	needsBootstrap, err := s.NeedsBootstrap(ctx)
	if err != nil {
		return nil, err
	}
	if !needsBootstrap {
		return nil, ErrAlreadyBootstapped
	}

	hash, err := security.HashPassword(input.Password)
	if err != nil {
		return nil, err
	}

	user := &domain.AdminUser{
		Email:        input.Email,
		Username:     usernameFromEmail(input.Email),
		PasswordHash: hash,
		FullName:     input.FullName,
		Role:         domain.RoleSuperAdmin,
		Status:       domain.StatusActive,
	}
	id, err := s.users.Create(ctx, user)
	if err != nil {
		return nil, err
	}
	user.ID = id

	if err := s.siteSettings.Update(ctx, &domain.SiteSettings{
		SiteURL:   input.SiteURL,
		SiteTitle: input.SiteTitle,
		SEOIndex:  input.SEOIndex,
		SEOFollow: input.SEOFollow,
		Timezone:  input.Timezone,
		Language:  input.Language,
	}); err != nil {
		return nil, err
	}

	return user, nil
}

var usernameInvalidChars = regexp.MustCompile(`[^a-z0-9._-]`)

// usernameFromEmail derives a starting username from an email's local part,
// the same rule migration 0070 used for existing accounts.
func usernameFromEmail(email string) string {
	local, _, _ := strings.Cut(strings.ToLower(email), "@")
	username := usernameInvalidChars.ReplaceAllString(local, "")
	if len(username) > 30 {
		username = username[:30]
	}
	if len(username) < 3 {
		username = "admin"
	}
	return username
}

// TwoFactorRequired applies the product decision that 2FA is force-disabled
// outside production, no matter what the DB setting says.
func (s *AuthService) TwoFactorRequired(ctx context.Context) (bool, error) {
	if !s.cfg.IsProduction() {
		return false, nil
	}
	settings, err := s.siteSettings.Get(ctx)
	if err != nil {
		return false, err
	}
	return settings.TwoFactorEnabled, nil
}

// FindByLogin looks an account up by what was typed into the sign-in form:
// an email when it contains "@", otherwise a username.
func FindByLogin(ctx context.Context, users *repository.UserRepo, login string) (*domain.AdminUser, error) {
	login = strings.TrimSpace(login)
	if strings.Contains(login, "@") {
		return users.GetByEmail(ctx, login)
	}
	return users.GetByUsername(ctx, domain.NormalizeUsername(login))
}

// checkLocked refuses a sign-in step while the account is locked out, even
// with the right password, so guessing can't carry on during the lockout.
func checkLocked(user *domain.AdminUser) error {
	if user.LockedSeconds > 0 {
		return &AccountLockedError{Seconds: user.LockedSeconds}
	}
	return nil
}

// failedSignIn counts a wrong password or 2FA code against the account and
// returns the error to answer with: wrongErr, or the lockout it triggered.
func (s *AuthService) failedSignIn(ctx context.Context, user *domain.AdminUser, wrongErr error) error {
	settings, err := s.siteSettings.Get(ctx)
	if err != nil {
		return err
	}
	policy := settings.Security
	locked, err := s.users.RecordFailedLogin(ctx, user.ID, policy.LockoutAttempts, policy.LockoutMinutes)
	if err != nil {
		return err
	}
	if locked {
		return &AccountLockedError{Seconds: policy.LockoutMinutes * 60, JustLocked: true}
	}
	return wrongErr
}

func (s *AuthService) Login(ctx context.Context, login, password string, client ClientInfo) (*LoginOutcome, error) {
	user, err := FindByLogin(ctx, s.users, login)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrInvalidCredentials
	}
	if err != nil {
		return nil, err
	}
	if err := checkLocked(user); err != nil {
		return nil, err
	}
	if !security.VerifyPassword(user.PasswordHash, password) {
		return nil, s.failedSignIn(ctx, user, ErrInvalidCredentials)
	}
	if user.Status != domain.StatusActive {
		return nil, ErrAccountNotActive
	}

	required, err := s.TwoFactorRequired(ctx)
	if err != nil {
		return nil, err
	}
	if !required {
		return s.issueSession(ctx, user, false, client)
	}

	if user.OTPEnrolled() {
		token, err := s.jwt.GenerateEphemeralToken(user.ID, security.PurposeOTPVerify)
		if err != nil {
			return nil, err
		}
		return &LoginOutcome{Status: "otp_required", User: user, EphemeralToken: token}, nil
	}

	token, err := s.jwt.GenerateEphemeralToken(user.ID, security.PurposeOTPSetup)
	if err != nil {
		return nil, err
	}
	return &LoginOutcome{Status: "otp_setup_required", User: user, EphemeralToken: token}, nil
}

func (s *AuthService) VerifyOTP(ctx context.Context, ephemeralToken, code string, client ClientInfo) (*LoginOutcome, error) {
	claims, err := s.jwt.ParseEphemeralToken(ephemeralToken, security.PurposeOTPVerify)
	if err != nil {
		return nil, err
	}
	user, err := s.users.GetByID(ctx, claims.UserID)
	if err != nil {
		return nil, err
	}
	if user.Status != domain.StatusActive {
		return nil, ErrAccountNotActive
	}
	if err := checkLocked(user); err != nil {
		return nil, err
	}
	devices, err := s.otpDevices.ListConfirmed(ctx, user.ID)
	if err != nil {
		return nil, err
	}
	device := s.matchOTPDevice(devices, code)
	if device == nil {
		return nil, s.failedSignIn(ctx, user, ErrInvalidOTP)
	}
	if err := s.otpDevices.MarkUsed(ctx, device.ID); err != nil {
		return nil, err
	}
	return s.issueSession(ctx, user, true, client)
}

// SetupOTP starts enrolling the first device for the user identified by an
// "otp_setup_required" ephemeral token: a fresh secret, stored unconfirmed.
func (s *AuthService) SetupOTP(ctx context.Context, ephemeralToken string) (secret, otpauthURL string, err error) {
	claims, err := s.jwt.ParseEphemeralToken(ephemeralToken, security.PurposeOTPSetup)
	if err != nil {
		return "", "", err
	}
	user, err := s.users.GetByID(ctx, claims.UserID)
	if err != nil {
		return "", "", err
	}
	return s.startDeviceSetup(ctx, user, "Authenticator app")
}

func (s *AuthService) ConfirmOTPSetup(ctx context.Context, ephemeralToken, code string, client ClientInfo) (*LoginOutcome, error) {
	claims, err := s.jwt.ParseEphemeralToken(ephemeralToken, security.PurposeOTPSetup)
	if err != nil {
		return nil, err
	}
	user, err := s.users.GetByID(ctx, claims.UserID)
	if err != nil {
		return nil, err
	}
	if user.Status != domain.StatusActive {
		return nil, ErrAccountNotActive
	}
	if err := checkLocked(user); err != nil {
		return nil, err
	}
	if err := s.confirmDeviceSetup(ctx, user, code); err != nil {
		if errors.Is(err, ErrInvalidOTP) {
			return nil, s.failedSignIn(ctx, user, err)
		}
		return nil, err
	}
	return s.issueSession(ctx, user, true, client)
}

func (s *AuthService) startDeviceSetup(ctx context.Context, user *domain.AdminUser, name string) (secret, otpauthURL string, err error) {
	secret, otpauthURL, err = security.GenerateTOTPSecret("Top Casino SG", user.Email)
	if err != nil {
		return "", "", err
	}
	encrypted, err := s.secretbox.Encrypt(secret)
	if err != nil {
		return "", "", err
	}
	if err := s.otpDevices.CreatePending(ctx, user.ID, name, encrypted); err != nil {
		return "", "", err
	}
	return secret, otpauthURL, nil
}

// confirmDeviceSetup enrolls the user's pending device once its first code
// checks out, still within the device limit.
func (s *AuthService) confirmDeviceSetup(ctx context.Context, user *domain.AdminUser, code string) error {
	pending, err := s.otpDevices.GetPending(ctx, user.ID)
	if errors.Is(err, repository.ErrNotFound) {
		return ErrOTPNoPendingSetup
	}
	if err != nil {
		return err
	}
	if s.matchOTPDevice([]domain.OTPDevice{*pending}, code) == nil {
		return ErrInvalidOTP
	}
	devices, err := s.otpDevices.ListConfirmed(ctx, user.ID)
	if err != nil {
		return err
	}
	if len(devices) >= domain.MaxOTPDevices {
		return ErrOTPDeviceLimit
	}
	return s.otpDevices.Confirm(ctx, pending.ID)
}

// matchOTPDevice returns the device whose current code is code, if any.
func (s *AuthService) matchOTPDevice(devices []domain.OTPDevice, code string) *domain.OTPDevice {
	for i := range devices {
		secret, err := s.secretbox.Decrypt(devices[i].SecretEncrypted)
		if err != nil {
			continue
		}
		if security.ValidateTOTPCode(secret, code) {
			return &devices[i]
		}
	}
	return nil
}

// ListOTPDevices returns the signed-in user's enrolled authenticator apps.
func (s *AuthService) ListOTPDevices(ctx context.Context, user *domain.AdminUser) ([]domain.OTPDevice, error) {
	return s.otpDevices.ListConfirmed(ctx, user.ID)
}

// StartOTPDeviceSetup begins adding an authenticator app from My Account.
// The current password is asked again, so a signed-in browser left
// unattended can't be used to add someone else's phone.
func (s *AuthService) StartOTPDeviceSetup(ctx context.Context, user *domain.AdminUser, name, password string) (secret, otpauthURL string, err error) {
	name = strings.TrimSpace(name)
	if name == "" || len([]rune(name)) > 60 {
		return "", "", ErrOTPDeviceName
	}
	if !security.VerifyPassword(user.PasswordHash, password) {
		return "", "", ErrWrongCurrentPassword
	}
	devices, err := s.otpDevices.ListConfirmed(ctx, user.ID)
	if err != nil {
		return "", "", err
	}
	if len(devices) >= domain.MaxOTPDevices {
		return "", "", ErrOTPDeviceLimit
	}
	return s.startDeviceSetup(ctx, user, name)
}

func (s *AuthService) ConfirmOTPDeviceSetup(ctx context.Context, user *domain.AdminUser, code string) error {
	return s.confirmDeviceSetup(ctx, user, code)
}

// RemoveOTPDevice deletes one of the user's authenticator apps. While 2FA is
// required the last one can't go: the user would be locked out next sign-in.
func (s *AuthService) RemoveOTPDevice(ctx context.Context, user *domain.AdminUser, deviceID int64, password string) error {
	if !security.VerifyPassword(user.PasswordHash, password) {
		return ErrWrongCurrentPassword
	}
	devices, err := s.otpDevices.ListConfirmed(ctx, user.ID)
	if err != nil {
		return err
	}
	found := false
	for _, d := range devices {
		found = found || d.ID == deviceID
	}
	if !found {
		return ErrOTPDeviceNotFound
	}
	if len(devices) == 1 {
		required, err := s.TwoFactorRequired(ctx)
		if err != nil {
			return err
		}
		if required {
			return ErrOTPLastDevice
		}
	}
	return s.otpDevices.Delete(ctx, user.ID, deviceID)
}

// issueSession signs a user in on a new session (one row in admin_sessions)
// and clears any failed sign-in count.
func (s *AuthService) issueSession(ctx context.Context, user *domain.AdminUser, otpVerified bool, client ClientInfo) (*LoginOutcome, error) {
	sessionID, err := security.GenerateOpaqueToken()
	if err != nil {
		return nil, err
	}
	// admin_sessions.id is CHAR(32).
	sessionID = security.HashToken(sessionID)[:32]
	if err := s.sessions.Create(ctx, &domain.Session{
		ID: sessionID, UserID: user.ID, IPAddress: client.IP, UserAgent: client.UserAgent,
		ExpiresAt: time.Now().Add(RefreshTokenTTL),
	}); err != nil {
		return nil, err
	}
	if err := s.users.ClearFailedLogins(ctx, user.ID); err != nil {
		return nil, err
	}
	return s.issueTokens(ctx, user, sessionID, otpVerified)
}

// issueTokens hands out a new access+refresh pair for an existing session.
func (s *AuthService) issueTokens(ctx context.Context, user *domain.AdminUser, sessionID string, otpVerified bool) (*LoginOutcome, error) {
	accessToken, err := s.jwt.GenerateAccessToken(user.ID, string(user.Role), otpVerified, sessionID)
	if err != nil {
		return nil, err
	}
	refreshToken, err := security.GenerateOpaqueToken()
	if err != nil {
		return nil, err
	}
	if err := s.refreshTokens.Create(ctx, user.ID, sessionID, security.HashToken(refreshToken), otpVerified, time.Now().Add(RefreshTokenTTL)); err != nil {
		return nil, err
	}
	return &LoginOutcome{Status: "ok", User: user, AccessToken: accessToken, RefreshToken: refreshToken}, nil
}

// Refresh rotates a refresh token: the old one is revoked and a new
// access+refresh pair is issued on the same session, so a stolen-but-used
// token is a dead end. While 2FA is required, a session that wasn't signed
// in with a code can't be refreshed: its owner has to sign in again and go
// through 2FA.
func (s *AuthService) Refresh(ctx context.Context, refreshToken string, client ClientInfo) (*LoginOutcome, error) {
	hash := security.HashToken(refreshToken)
	token, err := s.refreshTokens.GetValid(ctx, hash)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrInvalidCredentials
	}
	if err != nil {
		return nil, err
	}
	user, err := s.users.GetByID(ctx, token.UserID)
	if err != nil {
		return nil, err
	}
	if user.Status != domain.StatusActive {
		return nil, ErrAccountNotActive
	}
	claimed, err := s.refreshTokens.Claim(ctx, hash)
	if err != nil {
		return nil, err
	}
	if !claimed {
		return nil, ErrInvalidCredentials
	}
	if !token.OTPVerified {
		required, err := s.TwoFactorRequired(ctx)
		if err != nil {
			return nil, err
		}
		if required {
			return nil, ErrTwoFactorRequired
		}
	}
	if err := s.sessions.Touch(ctx, token.SessionID, client.IP, client.UserAgent, time.Now().Add(RefreshTokenTTL)); err != nil {
		return nil, err
	}
	return s.issueTokens(ctx, user, token.SessionID, token.OTPVerified)
}

// Logout signs the refresh token's session out and reports whose it was (0
// when the token was already invalid), so the sign-out can be audited.
func (s *AuthService) Logout(ctx context.Context, refreshToken string) (int64, error) {
	if refreshToken == "" {
		return 0, nil
	}
	token, err := s.refreshTokens.GetValid(ctx, security.HashToken(refreshToken))
	if err != nil {
		return 0, nil
	}
	_, err = s.sessions.Revoke(ctx, token.UserID, token.SessionID)
	return token.UserID, err
}

// SessionActive is the per-request check behind signing a session out:
// middleware.Authenticate turns away access tokens of a signed-out session.
func (s *AuthService) SessionActive(ctx context.Context, userID int64, sessionID string) (bool, error) {
	if sessionID == "" {
		return false, nil
	}
	return s.sessions.Active(ctx, userID, sessionID)
}

func (s *AuthService) ListSessions(ctx context.Context, user *domain.AdminUser) ([]domain.Session, error) {
	return s.sessions.ListActive(ctx, user.ID)
}

func (s *AuthService) RevokeSession(ctx context.Context, user *domain.AdminUser, sessionID string) error {
	found, err := s.sessions.Revoke(ctx, user.ID, sessionID)
	if err != nil {
		return err
	}
	if !found {
		return ErrSessionNotFound
	}
	return nil
}

// RevokeOtherSessions is My Account's "Sign out all other devices".
func (s *AuthService) RevokeOtherSessions(ctx context.Context, user *domain.AdminUser, currentSessionID string) (int64, error) {
	return s.sessions.RevokeOthers(ctx, user.ID, currentSessionID)
}

// PendingUserID identifies whose half-finished 2FA sign-in an ephemeral token
// belongs to, so a wrong code is logged against the right account.
func (s *AuthService) PendingUserID(ephemeralToken string) int64 {
	for _, purpose := range []string{security.PurposeOTPVerify, security.PurposeOTPSetup} {
		if claims, err := s.jwt.ParseEphemeralToken(ephemeralToken, purpose); err == nil {
			return claims.UserID
		}
	}
	return 0
}

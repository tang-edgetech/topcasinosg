package service

import (
	"context"
	"errors"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/config"
	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
	"github.com/tang-edgetech/topcasinosg/api/internal/security"
)

const RefreshTokenTTL = 7 * 24 * time.Hour

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrAccountNotActive   = errors.New("account is disabled")
	ErrAlreadyBootstapped = errors.New("an admin account already exists")
	ErrInvalidOTP         = errors.New("invalid or expired code")
)

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
	settings      *repository.SettingsRepo
	refreshTokens *repository.RefreshTokenRepo
	jwt           *security.JWTIssuer
	secretbox     *security.Secretbox
	cfg           config.Config
}

func NewAuthService(
	users *repository.UserRepo,
	settings *repository.SettingsRepo,
	refreshTokens *repository.RefreshTokenRepo,
	jwt *security.JWTIssuer,
	secretbox *security.Secretbox,
	cfg config.Config,
) *AuthService {
	return &AuthService{users: users, settings: settings, refreshTokens: refreshTokens, jwt: jwt, secretbox: secretbox, cfg: cfg}
}

func (s *AuthService) NeedsBootstrap(ctx context.Context) (bool, error) {
	count, err := s.users.CountAll(ctx)
	if err != nil {
		return false, err
	}
	return count == 0, nil
}

func (s *AuthService) Bootstrap(ctx context.Context, email, password, fullName string) (*domain.AdminUser, error) {
	needsBootstrap, err := s.NeedsBootstrap(ctx)
	if err != nil {
		return nil, err
	}
	if !needsBootstrap {
		return nil, ErrAlreadyBootstapped
	}

	hash, err := security.HashPassword(password)
	if err != nil {
		return nil, err
	}

	user := &domain.AdminUser{
		Email:        email,
		PasswordHash: hash,
		FullName:     fullName,
		Role:         domain.RoleSuperAdmin,
		Status:       domain.StatusActive,
	}
	id, err := s.users.Create(ctx, user)
	if err != nil {
		return nil, err
	}
	user.ID = id
	return user, nil
}

// twoFactorRequired applies the product decision that 2FA is force-disabled
// outside production, no matter what the DB setting says.
func (s *AuthService) twoFactorRequired(ctx context.Context) (bool, error) {
	if !s.cfg.IsProduction() {
		return false, nil
	}
	return s.settings.Is2FAEnabled(ctx)
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*LoginOutcome, error) {
	user, err := s.users.GetByEmail(ctx, email)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrInvalidCredentials
	}
	if err != nil {
		return nil, err
	}
	if !security.VerifyPassword(user.PasswordHash, password) {
		return nil, ErrInvalidCredentials
	}
	if user.Status != domain.StatusActive {
		return nil, ErrAccountNotActive
	}

	required, err := s.twoFactorRequired(ctx)
	if err != nil {
		return nil, err
	}
	if !required {
		return s.issueSession(ctx, user)
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

func (s *AuthService) VerifyOTP(ctx context.Context, ephemeralToken, code string) (*LoginOutcome, error) {
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
	if !s.validateStoredOTP(user, code) {
		return nil, ErrInvalidOTP
	}
	return s.issueSession(ctx, user)
}

// SetupOTP generates and stores (unconfirmed) a fresh TOTP secret for the
// user identified by an "otp_setup_required" ephemeral token.
func (s *AuthService) SetupOTP(ctx context.Context, ephemeralToken string) (secret, otpauthURL string, err error) {
	claims, err := s.jwt.ParseEphemeralToken(ephemeralToken, security.PurposeOTPSetup)
	if err != nil {
		return "", "", err
	}
	user, err := s.users.GetByID(ctx, claims.UserID)
	if err != nil {
		return "", "", err
	}

	secret, otpauthURL, err = security.GenerateTOTPSecret("Top Casino SG", user.Email)
	if err != nil {
		return "", "", err
	}
	encrypted, err := s.secretbox.Encrypt(secret)
	if err != nil {
		return "", "", err
	}
	if err := s.users.SetOTPSecret(ctx, user.ID, encrypted); err != nil {
		return "", "", err
	}
	return secret, otpauthURL, nil
}

func (s *AuthService) ConfirmOTPSetup(ctx context.Context, ephemeralToken, code string) (*LoginOutcome, error) {
	claims, err := s.jwt.ParseEphemeralToken(ephemeralToken, security.PurposeOTPSetup)
	if err != nil {
		return nil, err
	}
	user, err := s.users.GetByID(ctx, claims.UserID)
	if err != nil {
		return nil, err
	}
	if !s.validateStoredOTP(user, code) {
		return nil, ErrInvalidOTP
	}
	if err := s.users.ConfirmOTP(ctx, user.ID); err != nil {
		return nil, err
	}
	return s.issueSession(ctx, user)
}

func (s *AuthService) validateStoredOTP(user *domain.AdminUser, code string) bool {
	if len(user.OTPSecretEncrypted) == 0 {
		return false
	}
	secret, err := s.secretbox.Decrypt(user.OTPSecretEncrypted)
	if err != nil {
		return false
	}
	return security.ValidateTOTPCode(secret, code)
}

func (s *AuthService) issueSession(ctx context.Context, user *domain.AdminUser) (*LoginOutcome, error) {
	accessToken, err := s.jwt.GenerateAccessToken(user.ID, string(user.Role), user.CanManageAdmins)
	if err != nil {
		return nil, err
	}
	refreshToken, err := security.GenerateOpaqueToken()
	if err != nil {
		return nil, err
	}
	if err := s.refreshTokens.Create(ctx, user.ID, security.HashToken(refreshToken), time.Now().Add(RefreshTokenTTL)); err != nil {
		return nil, err
	}
	return &LoginOutcome{Status: "ok", User: user, AccessToken: accessToken, RefreshToken: refreshToken}, nil
}

// Refresh rotates a refresh token: the old one is revoked and a new
// access+refresh pair is issued, so a stolen-but-used token is a dead end.
func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (*LoginOutcome, error) {
	hash := security.HashToken(refreshToken)
	userID, err := s.refreshTokens.GetValidUserID(ctx, hash)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrInvalidCredentials
	}
	if err != nil {
		return nil, err
	}
	user, err := s.users.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if user.Status != domain.StatusActive {
		return nil, ErrAccountNotActive
	}
	if err := s.refreshTokens.Revoke(ctx, hash); err != nil {
		return nil, err
	}
	return s.issueSession(ctx, user)
}

func (s *AuthService) Logout(ctx context.Context, refreshToken string) error {
	if refreshToken == "" {
		return nil
	}
	return s.refreshTokens.Revoke(ctx, security.HashToken(refreshToken))
}

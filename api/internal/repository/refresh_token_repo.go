package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"
)

type RefreshTokenRepo struct {
	db *sql.DB
}

func NewRefreshTokenRepo(db *sql.DB) *RefreshTokenRepo {
	return &RefreshTokenRepo{db: db}
}

// Create stores a new session's refresh token. otpVerified records whether
// that session was signed in with a 2FA code.
func (r *RefreshTokenRepo) Create(ctx context.Context, userID int64, tokenHash string, otpVerified bool, expiresAt time.Time) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO refresh_tokens (admin_user_id, token_hash, otp_verified, expires_at) VALUES (?, ?, ?, ?)`,
		userID, tokenHash, otpVerified, expiresAt,
	)
	return err
}

// GetValid returns the owning admin_user_id and whether the session was
// 2FA-verified, if tokenHash is unrevoked and unexpired; ErrNotFound otherwise.
func (r *RefreshTokenRepo) GetValid(ctx context.Context, tokenHash string) (userID int64, otpVerified bool, err error) {
	err = r.db.QueryRowContext(ctx, `
		SELECT admin_user_id, otp_verified FROM refresh_tokens
		WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()`,
		tokenHash,
	).Scan(&userID, &otpVerified)
	if errors.Is(err, sql.ErrNoRows) {
		return 0, false, ErrNotFound
	}
	return userID, otpVerified, err
}

func (r *RefreshTokenRepo) Revoke(ctx context.Context, tokenHash string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?`, tokenHash,
	)
	return err
}

// RevokeAllForUser is used on password reset / account disable / OTP reset so
// existing sessions can't outlive a security-relevant change.
func (r *RefreshTokenRepo) RevokeAllForUser(ctx context.Context, userID int64) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE refresh_tokens SET revoked_at = NOW() WHERE admin_user_id = ? AND revoked_at IS NULL`, userID,
	)
	return err
}

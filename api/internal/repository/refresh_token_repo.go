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

// RefreshToken is a valid refresh token's owner and session. OTPVerified
// records whether that session was signed in with a 2FA code.
type RefreshToken struct {
	UserID      int64
	SessionID   string
	OTPVerified bool
}

// Create stores a session's newest refresh token.
func (r *RefreshTokenRepo) Create(ctx context.Context, userID int64, sessionID, tokenHash string, otpVerified bool, expiresAt time.Time) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO refresh_tokens (admin_user_id, session_id, token_hash, otp_verified, expires_at) VALUES (?, ?, ?, ?, ?)`,
		userID, sessionID, tokenHash, otpVerified, expiresAt,
	)
	return err
}

// GetValid returns tokenHash's token if it is unrevoked, unexpired and its
// session is still signed in; ErrNotFound otherwise.
func (r *RefreshTokenRepo) GetValid(ctx context.Context, tokenHash string) (*RefreshToken, error) {
	var t RefreshToken
	err := r.db.QueryRowContext(ctx, `
		SELECT rt.admin_user_id, rt.session_id, rt.otp_verified
		FROM refresh_tokens rt
		JOIN admin_sessions s ON s.id = rt.session_id AND s.revoked_at IS NULL
		WHERE rt.token_hash = ? AND rt.revoked_at IS NULL AND rt.expires_at > NOW()`,
		tokenHash,
	).Scan(&t.UserID, &t.SessionID, &t.OTPVerified)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &t, nil
}

// Claim revokes a refresh token for rotation, reporting false when another
// request already used it (refresh tokens are single-use).
func (r *RefreshTokenRepo) Claim(ctx context.Context, tokenHash string) (bool, error) {
	res, err := r.db.ExecContext(ctx,
		`UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ? AND revoked_at IS NULL`, tokenHash,
	)
	if err != nil {
		return false, err
	}
	n, err := res.RowsAffected()
	return n > 0, err
}

// RevokeAllForUser signs a user out everywhere: on password reset, account
// disable, 2FA reset and "Sign out everywhere", so existing sessions can't
// outlive a security-relevant change.
func (r *RefreshTokenRepo) RevokeAllForUser(ctx context.Context, userID int64) error {
	if _, err := r.db.ExecContext(ctx,
		`UPDATE admin_sessions SET revoked_at = NOW() WHERE admin_user_id = ? AND revoked_at IS NULL`, userID,
	); err != nil {
		return err
	}
	_, err := r.db.ExecContext(ctx,
		`UPDATE refresh_tokens SET revoked_at = NOW() WHERE admin_user_id = ? AND revoked_at IS NULL`, userID,
	)
	return err
}

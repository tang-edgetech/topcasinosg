package repository

import (
	"context"
	"database/sql"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

// SessionRepo stores admin_sessions: one row per signed-in browser, which
// outlives its rotating refresh tokens (see migration 0080).
type SessionRepo struct {
	db *sql.DB
}

func NewSessionRepo(db *sql.DB) *SessionRepo {
	return &SessionRepo{db: db}
}

func (r *SessionRepo) Create(ctx context.Context, s *domain.Session) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO admin_sessions (id, admin_user_id, ip_address, user_agent, expires_at)
		VALUES (?, ?, ?, ?, ?)`,
		s.ID, s.UserID, truncate(s.IPAddress, 45), truncate(s.UserAgent, 255), s.ExpiresAt,
	)
	return err
}

// Touch records a refresh: the session is in use from this address until
// the new refresh token's expiry.
func (r *SessionRepo) Touch(ctx context.Context, id, ip, userAgent string, expiresAt time.Time) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE admin_sessions SET last_seen_at = NOW(), ip_address = ?, user_agent = ?, expires_at = ?
		WHERE id = ?`,
		truncate(ip, 45), truncate(userAgent, 255), expiresAt, id,
	)
	return err
}

// Active reports whether a user's session is still signed in.
func (r *SessionRepo) Active(ctx context.Context, userID int64, id string) (bool, error) {
	var n int
	err := r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM admin_sessions
		WHERE id = ? AND admin_user_id = ? AND revoked_at IS NULL AND expires_at > NOW()`,
		id, userID,
	).Scan(&n)
	return n > 0, err
}

func (r *SessionRepo) ListActive(ctx context.Context, userID int64) ([]domain.Session, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, admin_user_id, ip_address, user_agent, created_at, last_seen_at, expires_at
		FROM admin_sessions
		WHERE admin_user_id = ? AND revoked_at IS NULL AND expires_at > NOW()
		ORDER BY last_seen_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	sessions := []domain.Session{}
	for rows.Next() {
		var s domain.Session
		if err := rows.Scan(&s.ID, &s.UserID, &s.IPAddress, &s.UserAgent, &s.CreatedAt, &s.LastSeenAt, &s.ExpiresAt); err != nil {
			return nil, err
		}
		sessions = append(sessions, s)
	}
	return sessions, rows.Err()
}

// Revoke signs one of a user's sessions out, with its refresh tokens.
// found is false when it wasn't an active session of that user.
func (r *SessionRepo) Revoke(ctx context.Context, userID int64, id string) (found bool, err error) {
	res, err := r.db.ExecContext(ctx, `
		UPDATE admin_sessions SET revoked_at = NOW()
		WHERE id = ? AND admin_user_id = ? AND revoked_at IS NULL`, id, userID)
	if err != nil {
		return false, err
	}
	n, err := res.RowsAffected()
	if err != nil || n == 0 {
		return false, err
	}
	_, err = r.db.ExecContext(ctx, `UPDATE refresh_tokens SET revoked_at = NOW() WHERE session_id = ? AND revoked_at IS NULL`, id)
	return true, err
}

// RevokeOthers signs out every session of a user except keepID, returning
// how many were signed out.
func (r *SessionRepo) RevokeOthers(ctx context.Context, userID int64, keepID string) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
		UPDATE admin_sessions SET revoked_at = NOW()
		WHERE admin_user_id = ? AND id != ? AND revoked_at IS NULL AND expires_at > NOW()`, userID, keepID)
	if err != nil {
		return 0, err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return 0, err
	}
	_, err = r.db.ExecContext(ctx, `
		UPDATE refresh_tokens SET revoked_at = NOW()
		WHERE admin_user_id = ? AND revoked_at IS NULL AND (session_id IS NULL OR session_id != ?)`, userID, keepID)
	return n, err
}

func truncate(s string, n int) string {
	if r := []rune(s); len(r) > n {
		return string(r[:n])
	}
	return s
}

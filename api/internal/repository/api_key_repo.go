package repository

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type APIKeyRepo struct {
	db *sql.DB
}

func NewAPIKeyRepo(db *sql.DB) *APIKeyRepo {
	return &APIKeyRepo{db: db}
}

const apiKeyColumns = `k.id, k.name, k.key_prefix, k.mode, k.scopes, k.created_by, COALESCE(u.full_name, ''), k.created_at, k.last_used_at, k.revoked_at`

func scanAPIKey(row interface{ Scan(...any) error }) (*domain.APIKey, error) {
	var k domain.APIKey
	var scopes string
	if err := row.Scan(&k.ID, &k.Name, &k.Prefix, &k.Mode, &scopes, &k.CreatedByID, &k.CreatedByName, &k.CreatedAt, &k.LastUsedAt, &k.RevokedAt); err != nil {
		return nil, err
	}
	k.Scopes = domain.ParseAPIScopes(scopes)
	return &k, nil
}

func (r *APIKeyRepo) Create(ctx context.Context, k *domain.APIKey, keyHash string) (int64, error) {
	res, err := r.db.ExecContext(ctx,
		`INSERT INTO api_keys (name, key_prefix, key_hash, mode, scopes, created_by) VALUES (?, ?, ?, ?, ?, ?)`,
		k.Name, k.Prefix, keyHash, k.Mode, strings.Join(k.Scopes, ","), k.CreatedByID,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *APIKeyRepo) GetByID(ctx context.Context, id int64) (*domain.APIKey, error) {
	k, err := scanAPIKey(r.db.QueryRowContext(ctx,
		`SELECT `+apiKeyColumns+` FROM api_keys k LEFT JOIN admin_users u ON u.id = k.created_by WHERE k.id = ?`, id))
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return k, err
}

// GetActiveByHash finds a key that hasn't been revoked.
func (r *APIKeyRepo) GetActiveByHash(ctx context.Context, keyHash string) (*domain.APIKey, error) {
	k, err := scanAPIKey(r.db.QueryRowContext(ctx,
		`SELECT `+apiKeyColumns+` FROM api_keys k LEFT JOIN admin_users u ON u.id = k.created_by
		WHERE k.key_hash = ? AND k.revoked_at IS NULL`, keyHash))
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return k, err
}

// List returns every key, newest first, revoked ones included.
func (r *APIKeyRepo) List(ctx context.Context) ([]domain.APIKey, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT `+apiKeyColumns+` FROM api_keys k LEFT JOIN admin_users u ON u.id = k.created_by ORDER BY k.revoked_at IS NOT NULL, k.id DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var keys []domain.APIKey
	for rows.Next() {
		k, err := scanAPIKey(rows)
		if err != nil {
			return nil, err
		}
		keys = append(keys, *k)
	}
	return keys, rows.Err()
}

// TouchLastUsed records a request, at most once a minute per key.
func (r *APIKeyRepo) TouchLastUsed(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE api_keys SET last_used_at = UTC_TIMESTAMP()
		WHERE id = ? AND (last_used_at IS NULL OR last_used_at < UTC_TIMESTAMP() - INTERVAL 1 MINUTE)`, id)
	return err
}

func (r *APIKeyRepo) Revoke(ctx context.Context, id int64) error {
	res, err := r.db.ExecContext(ctx, `UPDATE api_keys SET revoked_at = UTC_TIMESTAMP() WHERE id = ? AND revoked_at IS NULL`, id)
	if err != nil {
		return err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return ErrNotFound
	}
	return nil
}

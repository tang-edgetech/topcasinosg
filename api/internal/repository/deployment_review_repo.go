package repository

import (
	"context"
	"database/sql"
	"time"
)

// DeploymentReview is what admins did with one deployment from deploy.log.
type DeploymentReview struct {
	Key            string
	ResolvedAt     *time.Time
	ResolvedByName string
	ResolutionNote string
	Removed        bool
}

type DeploymentReviewRepo struct {
	db *sql.DB
}

func NewDeploymentReviewRepo(db *sql.DB) *DeploymentReviewRepo {
	return &DeploymentReviewRepo{db: db}
}

// All returns every review by deploy key. The table only grows by one row per
// deploy an admin touches, so reading it whole is fine.
func (r *DeploymentReviewRepo) All(ctx context.Context) (map[string]DeploymentReview, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT d.deploy_key, d.resolved_at, COALESCE(u.full_name, ''), d.resolution_note, d.removed_at IS NOT NULL
		FROM deployment_reviews d LEFT JOIN admin_users u ON u.id = d.resolved_by`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := map[string]DeploymentReview{}
	for rows.Next() {
		var rv DeploymentReview
		if err := rows.Scan(&rv.Key, &rv.ResolvedAt, &rv.ResolvedByName, &rv.ResolutionNote, &rv.Removed); err != nil {
			return nil, err
		}
		out[rv.Key] = rv
	}
	return out, rows.Err()
}

func (r *DeploymentReviewRepo) Resolve(ctx context.Context, key string, by int64, note string) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO deployment_reviews (deploy_key, resolved_at, resolved_by, resolution_note) VALUES (?, UTC_TIMESTAMP(), ?, ?)
		ON DUPLICATE KEY UPDATE resolved_at = VALUES(resolved_at), resolved_by = VALUES(resolved_by), resolution_note = VALUES(resolution_note)`,
		key, by, note)
	return err
}

func (r *DeploymentReviewRepo) Remove(ctx context.Context, key string, by int64) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO deployment_reviews (deploy_key, removed_at, removed_by) VALUES (?, UTC_TIMESTAMP(), ?)
		ON DUPLICATE KEY UPDATE removed_at = VALUES(removed_at), removed_by = VALUES(removed_by)`,
		key, by)
	return err
}

func (r *DeploymentReviewRepo) Limit(ctx context.Context) (int, error) {
	var limit int
	err := r.db.QueryRowContext(ctx, `SELECT deployment_list_limit FROM site_settings WHERE id = 1`).Scan(&limit)
	return limit, err
}

func (r *DeploymentReviewRepo) SetLimit(ctx context.Context, limit int) error {
	_, err := r.db.ExecContext(ctx, `UPDATE site_settings SET deployment_list_limit = ? WHERE id = 1`, limit)
	return err
}

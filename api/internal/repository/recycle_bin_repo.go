package repository

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

// RecycleBinRepo stores what Direct API keys deleted (domain.RecycleBinItem).
type RecycleBinRepo struct {
	db *sql.DB
}

func NewRecycleBinRepo(db *sql.DB) *RecycleBinRepo {
	return &RecycleBinRepo{db: db}
}

const recycleBinColumns = `b.id, b.item_type, b.item_id, b.label, b.previous_status, b.previous_publish_at,
	b.deleted_by, COALESCE(u.full_name, ''), b.api_key_id, b.api_key_name, b.deleted_at`

func scanRecycleBinItem(row interface{ Scan(...any) error }) (*domain.RecycleBinItem, error) {
	var b domain.RecycleBinItem
	err := row.Scan(&b.ID, &b.ItemType, &b.ItemID, &b.Label, &b.PreviousStatus, &b.PreviousPublishAt,
		&b.DeletedByID, &b.DeletedByName, &b.APIKeyID, &b.APIKeyName, &b.DeletedAt)
	if err != nil {
		return nil, err
	}
	return &b, nil
}

// ErrAlreadyInBin: the item is in the Recycle Bin already.
var ErrAlreadyInBin = errors.New("already in the Recycle Bin")

// Add puts an item in the bin; ErrAlreadyInBin when it's already there.
func (r *RecycleBinRepo) Add(ctx context.Context, b *domain.RecycleBinItem) (int64, error) {
	res, err := r.db.ExecContext(ctx,
		`INSERT INTO recycle_bin (item_type, item_id, label, previous_status, previous_publish_at, deleted_by, api_key_id, api_key_name, deleted_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP())
		ON DUPLICATE KEY UPDATE id = id`,
		b.ItemType, b.ItemID, b.Label, b.PreviousStatus, b.PreviousPublishAt, b.DeletedByID, b.APIKeyID, b.APIKeyName,
	)
	if err != nil {
		return 0, err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return 0, ErrAlreadyInBin
	}
	return res.LastInsertId()
}

func (r *RecycleBinRepo) Get(ctx context.Context, id int64) (*domain.RecycleBinItem, error) {
	b, err := scanRecycleBinItem(r.db.QueryRowContext(ctx,
		`SELECT `+recycleBinColumns+` FROM recycle_bin b LEFT JOIN admin_users u ON u.id = b.deleted_by WHERE b.id = ?`, id))
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return b, err
}

// List returns the bin, newest first. olderThan, when set, keeps only items
// deleted before it (the ones due to be emptied).
func (r *RecycleBinRepo) List(ctx context.Context, olderThan *time.Time) ([]domain.RecycleBinItem, error) {
	query := `SELECT ` + recycleBinColumns + ` FROM recycle_bin b LEFT JOIN admin_users u ON u.id = b.deleted_by`
	var args []any
	if olderThan != nil {
		query += ` WHERE b.deleted_at < ?`
		args = append(args, *olderThan)
	}
	rows, err := r.db.QueryContext(ctx, query+` ORDER BY b.id DESC`, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []domain.RecycleBinItem
	for rows.Next() {
		b, err := scanRecycleBinItem(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *b)
	}
	return items, rows.Err()
}

func (r *RecycleBinRepo) Remove(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM recycle_bin WHERE id = ?`, id)
	return err
}

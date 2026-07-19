package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type BlacklistEntryRepo struct {
	db *sql.DB
}

func NewBlacklistEntryRepo(db *sql.DB) *BlacklistEntryRepo {
	return &BlacklistEntryRepo{db: db}
}

const blacklistEntryColumns = `id, name, reason, details, status, publish_at, created_by, created_at, updated_at`

func scanBlacklistEntry(row interface{ Scan(...any) error }) (*domain.BlacklistEntry, error) {
	var e domain.BlacklistEntry
	if err := row.Scan(
		&e.ID, &e.Name, &e.Reason, &e.Details, &e.Status, &e.PublishAt, &e.CreatedBy, &e.CreatedAt, &e.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &e, nil
}

func (r *BlacklistEntryRepo) Create(ctx context.Context, e *domain.BlacklistEntry) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
		INSERT INTO blacklist_entries (name, reason, details, status, publish_at, created_by)
		VALUES (?, ?, ?, ?, ?, ?)`,
		e.Name, e.Reason, e.Details, e.Status, e.PublishAt, e.CreatedBy,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *BlacklistEntryRepo) Update(ctx context.Context, e *domain.BlacklistEntry) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE blacklist_entries SET name = ?, reason = ?, details = ?
		WHERE id = ?`,
		e.Name, e.Reason, e.Details, e.ID,
	)
	return err
}

func (r *BlacklistEntryRepo) GetByID(ctx context.Context, id int64) (*domain.BlacklistEntry, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+blacklistEntryColumns+` FROM blacklist_entries WHERE id = ?`, id)
	e, err := scanBlacklistEntry(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return e, err
}

func (r *BlacklistEntryRepo) ListAdmin(ctx context.Context, limit, offset int) ([]domain.BlacklistEntry, int, error) {
	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM blacklist_entries`).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.QueryContext(ctx,
		`SELECT `+blacklistEntryColumns+` FROM blacklist_entries ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
		limit, offset,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var items []domain.BlacklistEntry
	for rows.Next() {
		e, err := scanBlacklistEntry(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, *e)
	}
	return items, total, rows.Err()
}

// ListPublished is the public website's read for /blacklist. There is no
// region scoping at all for this content type, so no join is needed.
func (r *BlacklistEntryRepo) ListPublished(ctx context.Context, limit, offset int) ([]domain.BlacklistEntry, int, error) {
	countQuery := `SELECT COUNT(*) FROM blacklist_entries WHERE ` + EffectivelyPublishedSQL
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery).Scan(&total); err != nil {
		return nil, 0, err
	}

	listQuery := `SELECT ` + blacklistEntryColumns + ` FROM blacklist_entries WHERE ` + EffectivelyPublishedSQL +
		` ORDER BY created_at DESC LIMIT ? OFFSET ?`
	rows, err := r.db.QueryContext(ctx, listQuery, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var items []domain.BlacklistEntry
	for rows.Next() {
		e, err := scanBlacklistEntry(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, *e)
	}
	return items, total, rows.Err()
}

func (r *BlacklistEntryRepo) SetStatus(ctx context.Context, id int64, status domain.ContentStatus, publishAt *string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE blacklist_entries SET status = ?, publish_at = ? WHERE id = ?`, status, publishAt, id)
	return err
}

func (r *BlacklistEntryRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM blacklist_entries WHERE id = ?`, id)
	return err
}

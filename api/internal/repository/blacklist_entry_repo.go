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

const blacklistEntryColumns = `id, region_id, name, reason, details, status, publish_at, created_by, created_at, updated_at`

// Same columns, prefixed for queries that JOIN blacklist_entries against
// another table (region filtering) where an unqualified column name would be
// ambiguous.
const blacklistEntryColumnsPrefixed = `e.id, e.region_id, e.name, e.reason, e.details, e.status, e.publish_at,
	e.created_by, e.created_at, e.updated_at`

func scanBlacklistEntry(row interface{ Scan(...any) error }) (*domain.BlacklistEntry, error) {
	var e domain.BlacklistEntry
	if err := row.Scan(
		&e.ID, &e.RegionID, &e.Name, &e.Reason, &e.Details, &e.Status, &e.PublishAt, &e.CreatedBy, &e.CreatedAt, &e.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &e, nil
}

func (r *BlacklistEntryRepo) Create(ctx context.Context, e *domain.BlacklistEntry) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
		INSERT INTO blacklist_entries (region_id, name, reason, details, status, publish_at, created_by)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		e.RegionID, e.Name, e.Reason, e.Details, e.Status, e.PublishAt, e.CreatedBy,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *BlacklistEntryRepo) Update(ctx context.Context, e *domain.BlacklistEntry) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE blacklist_entries SET region_id = ?, name = ?, reason = ?, details = ?
		WHERE id = ?`,
		e.RegionID, e.Name, e.Reason, e.Details, e.ID,
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

// ListAdmin returns every blacklist entry regardless of status, for the
// dashboard, optionally filtered to a single region. A nil regionID returns
// everything (both global and region-scoped entries) — a caller wanting only
// global entries would need a different query.
func (r *BlacklistEntryRepo) ListAdmin(ctx context.Context, regionID *int64, limit, offset int) ([]domain.BlacklistEntry, int, error) {
	where, args := "", []any{}
	if regionID != nil {
		where = "WHERE region_id = ?"
		args = append(args, *regionID)
	}

	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM blacklist_entries `+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.QueryContext(ctx,
		`SELECT `+blacklistEntryColumns+` FROM blacklist_entries `+where+` ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
		append(args, limit, offset)...,
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

// ListPublished is the public website's listing: the global /blacklist index
// when regionCode is nil (region_id IS NULL rows only), or /{region}/blacklist
// when set (entries scoped to that region via a join on regions.code).
func (r *BlacklistEntryRepo) ListPublished(ctx context.Context, regionCode *string, limit, offset int) ([]domain.BlacklistEntry, int, error) {
	if regionCode == nil {
		countQuery := `SELECT COUNT(*) FROM blacklist_entries WHERE region_id IS NULL AND ` + EffectivelyPublishedSQL
		var total int
		if err := r.db.QueryRowContext(ctx, countQuery).Scan(&total); err != nil {
			return nil, 0, err
		}

		listQuery := `SELECT ` + blacklistEntryColumns + ` FROM blacklist_entries WHERE region_id IS NULL AND ` +
			EffectivelyPublishedSQL + ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
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

	countQuery := `SELECT COUNT(*) FROM blacklist_entries e JOIN regions rg ON rg.id = e.region_id
		WHERE rg.code = ? AND ` + EffectivelyPublishedSQL
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, *regionCode).Scan(&total); err != nil {
		return nil, 0, err
	}

	listQuery := `SELECT ` + blacklistEntryColumnsPrefixed + ` FROM blacklist_entries e JOIN regions rg ON rg.id = e.region_id
		WHERE rg.code = ? AND ` + EffectivelyPublishedSQL + ` ORDER BY e.created_at DESC LIMIT ? OFFSET ?`
	rows, err := r.db.QueryContext(ctx, listQuery, *regionCode, limit, offset)
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

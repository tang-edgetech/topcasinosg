package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type BlacklistEntryRepo struct {
	db *sql.DB
}

func NewBlacklistEntryRepo(db *sql.DB) *BlacklistEntryRepo {
	return &BlacklistEntryRepo{db: db}
}

// Always prefixed: media.url is joined in via blacklistEntryFromClause for the
// logo (mirrors CasinoRepo), and media shares column names like created_at.
const blacklistEntryColumns = `e.id, e.region_id, e.name, e.logo_media_id, media.url, e.rating, e.reason, e.reasons,
	e.details, e.status, e.publish_at, e.created_by, e.created_at, e.updated_at`
const blacklistEntryFromClause = `blacklist_entries e LEFT JOIN media ON media.id = e.logo_media_id`

func scanBlacklistEntry(row interface{ Scan(...any) error }) (*domain.BlacklistEntry, error) {
	var e domain.BlacklistEntry
	var logoURL, reasonsJSON sql.NullString
	if err := row.Scan(
		&e.ID, &e.RegionID, &e.Name, &e.LogoMediaID, &logoURL, &e.Rating, &e.Reason, &reasonsJSON,
		&e.Details, &e.Status, &e.PublishAt, &e.CreatedBy, &e.CreatedAt, &e.UpdatedAt,
	); err != nil {
		return nil, err
	}
	if logoURL.Valid {
		e.LogoURL = &logoURL.String
	}
	if reasonsJSON.Valid && reasonsJSON.String != "" {
		_ = json.Unmarshal([]byte(reasonsJSON.String), &e.Reasons)
	}
	return &e, nil
}

func (r *BlacklistEntryRepo) Create(ctx context.Context, e *domain.BlacklistEntry) (int64, error) {
	reasonsJSON, _ := json.Marshal(e.Reasons)
	res, err := r.db.ExecContext(ctx, `
		INSERT INTO blacklist_entries (region_id, name, logo_media_id, rating, reason, reasons, details, status,
			publish_at, created_by)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		e.RegionID, e.Name, e.LogoMediaID, e.Rating, e.Reason, reasonsJSON, e.Details, e.Status, e.PublishAt, e.CreatedBy,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

// Update always overwrites region_id from e.RegionID (nil clears it back to
// a global entry). This mirrors every other *int64/nullable field on this
// struct (and the same full-replace convention used by GuideRepo.Update) —
// the admin form always submits the complete entry, never a partial patch,
// so there's no "omitted vs explicitly cleared" ambiguity to resolve here.
// A presence-detecting fix (distinguishing "key absent from JSON" from
// "key present with value null") would need a wrapper type around a single
// nullable scalar, which would be inconsistent with how every other
// nullable field in this codebase is handled.
func (r *BlacklistEntryRepo) Update(ctx context.Context, e *domain.BlacklistEntry) error {
	reasonsJSON, _ := json.Marshal(e.Reasons)
	_, err := r.db.ExecContext(ctx, `
		UPDATE blacklist_entries SET region_id = ?, name = ?, logo_media_id = ?, rating = ?, reason = ?, reasons = ?,
			details = ?
		WHERE id = ?`,
		e.RegionID, e.Name, e.LogoMediaID, e.Rating, e.Reason, reasonsJSON, e.Details, e.ID,
	)
	return err
}

func (r *BlacklistEntryRepo) GetByID(ctx context.Context, id int64) (*domain.BlacklistEntry, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+blacklistEntryColumns+` FROM `+blacklistEntryFromClause+` WHERE e.id = ?`, id)
	e, err := scanBlacklistEntry(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return e, err
}

func (r *BlacklistEntryRepo) scanAll(rows *sql.Rows) ([]domain.BlacklistEntry, error) {
	defer rows.Close()
	var items []domain.BlacklistEntry
	for rows.Next() {
		e, err := scanBlacklistEntry(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *e)
	}
	return items, rows.Err()
}

// ListAdmin returns every blacklist entry regardless of status, for the
// dashboard, optionally filtered to a single region. A nil regionID returns
// everything (both global and region-scoped entries) — a caller wanting only
// global entries would need a different query.
func (r *BlacklistEntryRepo) ListAdmin(ctx context.Context, regionID *int64, limit, offset int) ([]domain.BlacklistEntry, int, error) {
	where, args := "", []any{}
	if regionID != nil {
		where = "WHERE e.region_id = ?"
		args = append(args, *regionID)
	}

	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM blacklist_entries e `+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.QueryContext(ctx,
		`SELECT `+blacklistEntryColumns+` FROM `+blacklistEntryFromClause+` `+where+` ORDER BY e.updated_at DESC LIMIT ? OFFSET ?`,
		append(args, limit, offset)...,
	)
	if err != nil {
		return nil, 0, err
	}
	items, err := r.scanAll(rows)
	return items, total, err
}

// ListPublished is the public website's listing: the global /blacklist index
// when regionCode is nil (region_id IS NULL rows only), or /{region}/blacklist
// when set (entries scoped to that region via a join on regions.code).
func (r *BlacklistEntryRepo) ListPublished(ctx context.Context, regionCode *string, limit, offset int) ([]domain.BlacklistEntry, int, error) {
	joinClause, where, args := "", `e.region_id IS NULL`, []any{}
	if regionCode != nil {
		joinClause = `JOIN regions rg ON rg.id = e.region_id`
		where = `rg.code = ?`
		args = append(args, *regionCode)
	}

	countQuery := `SELECT COUNT(*) FROM blacklist_entries e ` + joinClause + ` WHERE ` + where + ` AND ` + EffectivelyPublishedSQL
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	listQuery := `SELECT ` + blacklistEntryColumns + ` FROM ` + blacklistEntryFromClause + ` ` + joinClause +
		` WHERE ` + where + ` AND ` + EffectivelyPublishedSQL + ` ORDER BY e.created_at DESC LIMIT ? OFFSET ?`
	rows, err := r.db.QueryContext(ctx, listQuery, append(args, limit, offset)...)
	if err != nil {
		return nil, 0, err
	}
	items, err := r.scanAll(rows)
	return items, total, err
}

func (r *BlacklistEntryRepo) SetStatus(ctx context.Context, id int64, status domain.ContentStatus, publishAt *string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE blacklist_entries SET status = ?, publish_at = ? WHERE id = ?`, status, publishAt, id)
	return err
}

func (r *BlacklistEntryRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM blacklist_entries WHERE id = ?`, id)
	return err
}

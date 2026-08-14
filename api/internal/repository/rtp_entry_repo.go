package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type RTPEntryRepo struct {
	db *sql.DB
}

func NewRTPEntryRepo(db *sql.DB) *RTPEntryRepo {
	return &RTPEntryRepo{db: db}
}

const rtpEntryColumns = `id, region_id, casino_id, game_name, category, rtp_percentage,
	status, publish_at, created_by, created_at, updated_at`

func scanRTPEntry(row interface{ Scan(...any) error }) (*domain.RTPEntry, error) {
	var e domain.RTPEntry
	if err := row.Scan(
		&e.ID, &e.RegionID, &e.CasinoID, &e.GameName, &e.Category, &e.RTPPercentage,
		&e.Status, &e.PublishAt, &e.CreatedBy, &e.CreatedAt, &e.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &e, nil
}

func (r *RTPEntryRepo) Create(ctx context.Context, e *domain.RTPEntry) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
		INSERT INTO rtp_entries (region_id, casino_id, game_name, category, rtp_percentage,
			status, publish_at, created_by)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		e.RegionID, e.CasinoID, e.GameName, e.Category, e.RTPPercentage,
		e.Status, e.PublishAt, e.CreatedBy,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *RTPEntryRepo) Update(ctx context.Context, e *domain.RTPEntry) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE rtp_entries SET region_id = ?, casino_id = ?, game_name = ?, category = ?, rtp_percentage = ?
		WHERE id = ?`,
		e.RegionID, e.CasinoID, e.GameName, e.Category, e.RTPPercentage, e.ID,
	)
	return err
}

func (r *RTPEntryRepo) GetByID(ctx context.Context, id int64) (*domain.RTPEntry, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+rtpEntryColumns+` FROM rtp_entries WHERE id = ?`, id)
	e, err := scanRTPEntry(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return e, err
}

func (r *RTPEntryRepo) ListAdmin(ctx context.Context, regionID *int64, limit, offset int) ([]domain.RTPEntry, int, error) {
	where, args := "", []any{}
	if regionID != nil {
		where = "WHERE region_id = ?"
		args = append(args, *regionID)
	}

	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM rtp_entries `+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.QueryContext(ctx,
		`SELECT `+rtpEntryColumns+` FROM rtp_entries `+where+` ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
		append(args, limit, offset)...,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var items []domain.RTPEntry
	for rows.Next() {
		e, err := scanRTPEntry(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, *e)
	}
	return items, total, rows.Err()
}

// ListPublished is the public website's read for /{region}/rtp.
func (r *RTPEntryRepo) ListPublished(ctx context.Context, regionCode string, limit, offset int) ([]domain.RTPEntry, int, error) {
	countQuery := `SELECT COUNT(*) FROM rtp_entries e JOIN regions rg ON rg.id = e.region_id
		WHERE rg.code = ? AND ` + EffectivelyPublishedSQL
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, regionCode).Scan(&total); err != nil {
		return nil, 0, err
	}

	listQuery := `SELECT ` + prefixedRTPEntryColumns + ` FROM rtp_entries e JOIN regions rg ON rg.id = e.region_id
		WHERE rg.code = ? AND ` + EffectivelyPublishedSQL + ` ORDER BY e.game_name ASC LIMIT ? OFFSET ?`
	rows, err := r.db.QueryContext(ctx, listQuery, regionCode, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var items []domain.RTPEntry
	for rows.Next() {
		e, err := scanRTPEntry(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, *e)
	}
	return items, total, rows.Err()
}

const prefixedRTPEntryColumns = `e.id, e.region_id, e.casino_id, e.game_name, e.category, e.rtp_percentage,
	e.status, e.publish_at, e.created_by, e.created_at, e.updated_at`

// ListPublishedByCasino is the public website's read for a single casino's
// review page (/casinos/[slug]) — every published RTP entry tied to that
// casino, regardless of region.
func (r *RTPEntryRepo) ListPublishedByCasino(ctx context.Context, casinoID int64, limit, offset int) ([]domain.RTPEntry, int, error) {
	countQuery := `SELECT COUNT(*) FROM rtp_entries WHERE casino_id = ? AND ` + EffectivelyPublishedSQL
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, casinoID).Scan(&total); err != nil {
		return nil, 0, err
	}

	listQuery := `SELECT ` + rtpEntryColumns + ` FROM rtp_entries WHERE casino_id = ? AND ` + EffectivelyPublishedSQL +
		` ORDER BY game_name ASC LIMIT ? OFFSET ?`
	rows, err := r.db.QueryContext(ctx, listQuery, casinoID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var items []domain.RTPEntry
	for rows.Next() {
		e, err := scanRTPEntry(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, *e)
	}
	return items, total, rows.Err()
}

func (r *RTPEntryRepo) SetStatus(ctx context.Context, id int64, status domain.ContentStatus, publishAt *string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE rtp_entries SET status = ?, publish_at = ? WHERE id = ?`, status, publishAt, id)
	return err
}

func (r *RTPEntryRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM rtp_entries WHERE id = ?`, id)
	return err
}

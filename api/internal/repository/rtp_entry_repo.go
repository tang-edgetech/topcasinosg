package repository

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type RTPEntryRepo struct {
	db *sql.DB
}

func NewRTPEntryRepo(db *sql.DB) *RTPEntryRepo {
	return &RTPEntryRepo{db: db}
}

const rtpEntryColumns = `e.id, e.region_id, e.casino_id, e.game_provider_id, e.image_media_id, e.game_name, e.category,
	e.rtp_percentage, e.status, e.publish_at, e.created_by, e.created_at, e.updated_at,
	gp.name, m.url, c.name, c.slug, c.cta_url`

const rtpEntryFromClause = `rtp_entries e
	LEFT JOIN game_providers gp ON gp.id = e.game_provider_id
	LEFT JOIN media m ON m.id = e.image_media_id
	LEFT JOIN casinos c ON c.id = e.casino_id`

func scanRTPEntry(row interface{ Scan(...any) error }) (*domain.RTPEntry, error) {
	var e domain.RTPEntry
	if err := row.Scan(
		&e.ID, &e.RegionID, &e.CasinoID, &e.GameProviderID, &e.ImageMediaID, &e.GameName, &e.Category,
		&e.RTPPercentage, &e.Status, &e.PublishAt, &e.CreatedBy, &e.CreatedAt, &e.UpdatedAt,
		&e.GameProviderName, &e.ImageURL, &e.CasinoName, &e.CasinoSlug, &e.CasinoCTAURL,
	); err != nil {
		return nil, err
	}
	return &e, nil
}

func (r *RTPEntryRepo) scanAll(rows *sql.Rows) ([]domain.RTPEntry, error) {
	defer rows.Close()
	var items []domain.RTPEntry
	for rows.Next() {
		e, err := scanRTPEntry(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *e)
	}
	return items, rows.Err()
}

func (r *RTPEntryRepo) Create(ctx context.Context, e *domain.RTPEntry) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
		INSERT INTO rtp_entries (region_id, casino_id, game_provider_id, image_media_id, game_name, category,
			rtp_percentage, status, publish_at, created_by)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		e.RegionID, e.CasinoID, e.GameProviderID, e.ImageMediaID, e.GameName, e.Category,
		e.RTPPercentage, e.Status, e.PublishAt, e.CreatedBy,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *RTPEntryRepo) Update(ctx context.Context, e *domain.RTPEntry) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE rtp_entries SET region_id = ?, casino_id = ?, game_provider_id = ?, image_media_id = ?,
			game_name = ?, category = ?, rtp_percentage = ?
		WHERE id = ?`,
		e.RegionID, e.CasinoID, e.GameProviderID, e.ImageMediaID, e.GameName, e.Category, e.RTPPercentage, e.ID,
	)
	return err
}

func (r *RTPEntryRepo) GetByID(ctx context.Context, id int64) (*domain.RTPEntry, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+rtpEntryColumns+` FROM `+rtpEntryFromClause+` WHERE e.id = ?`, id)
	e, err := scanRTPEntry(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return e, err
}

func (r *RTPEntryRepo) ListAdmin(ctx context.Context, regionID *int64, limit, offset int) ([]domain.RTPEntry, int, error) {
	where, args := "", []any{}
	if regionID != nil {
		where = "WHERE e.region_id = ?"
		args = append(args, *regionID)
	}

	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM rtp_entries e `+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.QueryContext(ctx,
		`SELECT `+rtpEntryColumns+` FROM `+rtpEntryFromClause+` `+where+` ORDER BY e.updated_at DESC LIMIT ? OFFSET ?`,
		append(args, limit, offset)...,
	)
	if err != nil {
		return nil, 0, err
	}
	items, err := r.scanAll(rows)
	return items, total, err
}

// ListPublished is the public website's read for /{region}/rtp — highest RTP
// first, optionally narrowed to some categories (e.g. table + live for the
// "Table Games" slider).
func (r *RTPEntryRepo) ListPublished(ctx context.Context, regionCode string, categories []domain.RTPCategory, limit, offset int) ([]domain.RTPEntry, int, error) {
	where := `JOIN regions rg ON rg.id = e.region_id WHERE rg.code = ? AND ` + EffectivelyPublishedSQLFor("e")
	args := []any{regionCode}
	if len(categories) > 0 {
		where += ` AND e.category IN (?` + strings.Repeat(", ?", len(categories)-1) + `)`
		for _, c := range categories {
			args = append(args, c)
		}
	}

	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM rtp_entries e `+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.QueryContext(ctx,
		`SELECT `+rtpEntryColumns+` FROM `+rtpEntryFromClause+` `+where+` ORDER BY e.rtp_percentage DESC, e.game_name ASC LIMIT ? OFFSET ?`,
		append(args, limit, offset)...,
	)
	if err != nil {
		return nil, 0, err
	}
	items, err := r.scanAll(rows)
	return items, total, err
}

// ListPublishedByCasino is the public website's read for a single casino's
// review page (/casinos/[slug]) — every published RTP entry tied to that
// casino, regardless of region.
func (r *RTPEntryRepo) ListPublishedByCasino(ctx context.Context, casinoID int64, limit, offset int) ([]domain.RTPEntry, int, error) {
	where := `WHERE e.casino_id = ? AND ` + EffectivelyPublishedSQLFor("e")

	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM rtp_entries e `+where, casinoID).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.QueryContext(ctx,
		`SELECT `+rtpEntryColumns+` FROM `+rtpEntryFromClause+` `+where+` ORDER BY e.game_name ASC LIMIT ? OFFSET ?`,
		casinoID, limit, offset,
	)
	if err != nil {
		return nil, 0, err
	}
	items, err := r.scanAll(rows)
	return items, total, err
}

func (r *RTPEntryRepo) SetStatus(ctx context.Context, id int64, status domain.ContentStatus, publishAt *string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE rtp_entries SET status = ?, publish_at = ? WHERE id = ?`, status, publishAt, id)
	return err
}

func (r *RTPEntryRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM rtp_entries WHERE id = ?`, id)
	return err
}

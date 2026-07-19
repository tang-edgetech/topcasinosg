package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type GuideRepo struct {
	db *sql.DB
}

func NewGuideRepo(db *sql.DB) *GuideRepo {
	return &GuideRepo{db: db}
}

const guideColumns = `id, region_id, title, slug, cover_media_id, excerpt, content, status, publish_at,
	created_by, created_at, updated_at`

// Same columns, prefixed for queries that JOIN guides against another table
// (region filtering) where an unqualified column name would be ambiguous.
const guideColumnsPrefixed = `g.id, g.region_id, g.title, g.slug, g.cover_media_id, g.excerpt, g.content, g.status,
	g.publish_at, g.created_by, g.created_at, g.updated_at`

func scanGuide(row interface{ Scan(...any) error }) (*domain.Guide, error) {
	var g domain.Guide
	if err := row.Scan(
		&g.ID, &g.RegionID, &g.Title, &g.Slug, &g.CoverMediaID, &g.Excerpt, &g.Content, &g.Status, &g.PublishAt,
		&g.CreatedBy, &g.CreatedAt, &g.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &g, nil
}

func (r *GuideRepo) Create(ctx context.Context, g *domain.Guide) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
		INSERT INTO guides (region_id, title, slug, cover_media_id, excerpt, content, status, publish_at, created_by)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		g.RegionID, g.Title, g.Slug, g.CoverMediaID, g.Excerpt, g.Content, g.Status, g.PublishAt, g.CreatedBy,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *GuideRepo) Update(ctx context.Context, g *domain.Guide) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE guides SET region_id = ?, title = ?, slug = ?, cover_media_id = ?, excerpt = ?, content = ?
		WHERE id = ?`,
		g.RegionID, g.Title, g.Slug, g.CoverMediaID, g.Excerpt, g.Content, g.ID,
	)
	return err
}

func (r *GuideRepo) GetByID(ctx context.Context, id int64) (*domain.Guide, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+guideColumns+` FROM guides WHERE id = ?`, id)
	g, err := scanGuide(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return g, err
}

func (r *GuideRepo) ExistsSlug(ctx context.Context, slug string, excludeID int64) (bool, error) {
	var count int
	err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM guides WHERE slug = ? AND id != ?`, slug, excludeID).Scan(&count)
	return count > 0, err
}

// GetPublishedBySlug is the public website's read for a single guide page —
// 404s (via ErrNotFound) if it exists but isn't effectively published.
func (r *GuideRepo) GetPublishedBySlug(ctx context.Context, slug string) (*domain.Guide, error) {
	row := r.db.QueryRowContext(ctx,
		`SELECT `+guideColumns+` FROM guides WHERE slug = ? AND `+EffectivelyPublishedSQL, slug,
	)
	g, err := scanGuide(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return g, err
}

// ListAdmin returns every guide regardless of status, for the dashboard,
// optionally filtered to a single region. A nil regionID returns everything
// (both global and region-scoped guides) — a caller wanting only global
// guides would need a different query.
func (r *GuideRepo) ListAdmin(ctx context.Context, regionID *int64, limit, offset int) ([]domain.Guide, int, error) {
	where, args := "", []any{}
	if regionID != nil {
		where = "WHERE region_id = ?"
		args = append(args, *regionID)
	}

	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM guides `+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.QueryContext(ctx,
		`SELECT `+guideColumns+` FROM guides `+where+` ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
		append(args, limit, offset)...,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var items []domain.Guide
	for rows.Next() {
		g, err := scanGuide(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, *g)
	}
	return items, total, rows.Err()
}

// ListPublished is the public website's listing: the global /guides index
// when regionCode is nil (region_id IS NULL rows only), or /{region}/guides
// when set (guides scoped to that region via a join on regions.code).
func (r *GuideRepo) ListPublished(ctx context.Context, regionCode *string, limit, offset int) ([]domain.Guide, int, error) {
	if regionCode == nil {
		countQuery := `SELECT COUNT(*) FROM guides WHERE region_id IS NULL AND ` + EffectivelyPublishedSQL
		var total int
		if err := r.db.QueryRowContext(ctx, countQuery).Scan(&total); err != nil {
			return nil, 0, err
		}

		listQuery := `SELECT ` + guideColumns + ` FROM guides WHERE region_id IS NULL AND ` + EffectivelyPublishedSQL +
			` ORDER BY created_at DESC LIMIT ? OFFSET ?`
		rows, err := r.db.QueryContext(ctx, listQuery, limit, offset)
		if err != nil {
			return nil, 0, err
		}
		defer rows.Close()

		var items []domain.Guide
		for rows.Next() {
			g, err := scanGuide(rows)
			if err != nil {
				return nil, 0, err
			}
			items = append(items, *g)
		}
		return items, total, rows.Err()
	}

	countQuery := `SELECT COUNT(*) FROM guides g JOIN regions rg ON rg.id = g.region_id
		WHERE rg.code = ? AND ` + EffectivelyPublishedSQL
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, *regionCode).Scan(&total); err != nil {
		return nil, 0, err
	}

	listQuery := `SELECT ` + guideColumnsPrefixed + ` FROM guides g JOIN regions rg ON rg.id = g.region_id
		WHERE rg.code = ? AND ` + EffectivelyPublishedSQL + ` ORDER BY g.created_at DESC LIMIT ? OFFSET ?`
	rows, err := r.db.QueryContext(ctx, listQuery, *regionCode, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var items []domain.Guide
	for rows.Next() {
		g, err := scanGuide(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, *g)
	}
	return items, total, rows.Err()
}

func (r *GuideRepo) SetStatus(ctx context.Context, id int64, status domain.ContentStatus, publishAt *string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE guides SET status = ?, publish_at = ? WHERE id = ?`, status, publishAt, id)
	return err
}

func (r *GuideRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM guides WHERE id = ?`, id)
	return err
}

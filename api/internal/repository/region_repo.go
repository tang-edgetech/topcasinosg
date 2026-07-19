package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type RegionRepo struct {
	db *sql.DB
}

func NewRegionRepo(db *sql.DB) *RegionRepo {
	return &RegionRepo{db: db}
}

const regionColumns = `regions.id, regions.code, regions.name, regions.flag_media_id, media.url, regions.is_active, regions.sort_order, regions.created_at, regions.updated_at`
const regionFromClause = `regions LEFT JOIN media ON media.id = regions.flag_media_id`

func scanRegion(row interface{ Scan(...any) error }) (*domain.Region, error) {
	var r domain.Region
	if err := row.Scan(&r.ID, &r.Code, &r.Name, &r.FlagMediaID, &r.FlagURL, &r.IsActive, &r.SortOrder, &r.CreatedAt, &r.UpdatedAt); err != nil {
		return nil, err
	}
	return &r, nil
}

// List returns every region (including inactive) for the dashboard.
func (r *RegionRepo) List(ctx context.Context) ([]domain.Region, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT `+regionColumns+` FROM `+regionFromClause+` ORDER BY regions.sort_order, regions.name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var regions []domain.Region
	for rows.Next() {
		reg, err := scanRegion(rows)
		if err != nil {
			return nil, err
		}
		regions = append(regions, *reg)
	}
	return regions, rows.Err()
}

// ListActive is what the public website uses to render nav/region switchers.
func (r *RegionRepo) ListActive(ctx context.Context) ([]domain.Region, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT `+regionColumns+` FROM `+regionFromClause+` WHERE regions.is_active = TRUE ORDER BY regions.sort_order, regions.name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var regions []domain.Region
	for rows.Next() {
		reg, err := scanRegion(rows)
		if err != nil {
			return nil, err
		}
		regions = append(regions, *reg)
	}
	return regions, rows.Err()
}

func (r *RegionRepo) GetByCode(ctx context.Context, code string) (*domain.Region, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+regionColumns+` FROM `+regionFromClause+` WHERE regions.code = ?`, code)
	reg, err := scanRegion(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return reg, err
}

func (r *RegionRepo) GetByID(ctx context.Context, id int64) (*domain.Region, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+regionColumns+` FROM `+regionFromClause+` WHERE regions.id = ?`, id)
	reg, err := scanRegion(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return reg, err
}

func (r *RegionRepo) ExistsCode(ctx context.Context, code string, excludeID int64) (bool, error) {
	var count int
	err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM regions WHERE code = ? AND id != ?`, code, excludeID).Scan(&count)
	return count > 0, err
}

func (r *RegionRepo) Create(ctx context.Context, reg *domain.Region) (int64, error) {
	res, err := r.db.ExecContext(ctx,
		`INSERT INTO regions (code, name, flag_media_id, sort_order) VALUES (?, ?, ?, ?)`,
		reg.Code, reg.Name, reg.FlagMediaID, reg.SortOrder,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *RegionRepo) Update(ctx context.Context, id int64, code, name string, flagMediaID *int64, sortOrder int) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE regions SET code = ?, name = ?, flag_media_id = ?, sort_order = ? WHERE id = ?`, code, name, flagMediaID, sortOrder, id,
	)
	return err
}

func (r *RegionRepo) SetActive(ctx context.Context, id int64, active bool) error {
	_, err := r.db.ExecContext(ctx, `UPDATE regions SET is_active = ? WHERE id = ?`, active, id)
	return err
}

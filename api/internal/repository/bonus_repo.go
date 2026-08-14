package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type BonusRepo struct {
	db *sql.DB
}

func NewBonusRepo(db *sql.DB) *BonusRepo {
	return &BonusRepo{db: db}
}

const bonusColumns = `id, region_id, casino_id, bonus_type, title, terms, code, valid_from, valid_until,
	status, publish_at, created_by, created_at, updated_at`

func scanBonus(row interface{ Scan(...any) error }) (*domain.Bonus, error) {
	var b domain.Bonus
	if err := row.Scan(
		&b.ID, &b.RegionID, &b.CasinoID, &b.BonusType, &b.Title, &b.Terms, &b.Code, &b.ValidFrom, &b.ValidUntil,
		&b.Status, &b.PublishAt, &b.CreatedBy, &b.CreatedAt, &b.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &b, nil
}

func (r *BonusRepo) Create(ctx context.Context, b *domain.Bonus) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
		INSERT INTO bonuses (region_id, casino_id, bonus_type, title, terms, code, valid_from, valid_until,
			status, publish_at, created_by)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		b.RegionID, b.CasinoID, b.BonusType, b.Title, b.Terms, b.Code, b.ValidFrom, b.ValidUntil,
		b.Status, b.PublishAt, b.CreatedBy,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *BonusRepo) Update(ctx context.Context, b *domain.Bonus) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE bonuses SET region_id = ?, casino_id = ?, bonus_type = ?, title = ?, terms = ?, code = ?,
			valid_from = ?, valid_until = ?
		WHERE id = ?`,
		b.RegionID, b.CasinoID, b.BonusType, b.Title, b.Terms, b.Code, b.ValidFrom, b.ValidUntil, b.ID,
	)
	return err
}

func (r *BonusRepo) GetByID(ctx context.Context, id int64) (*domain.Bonus, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+bonusColumns+` FROM bonuses WHERE id = ?`, id)
	b, err := scanBonus(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return b, err
}

func (r *BonusRepo) ListAdmin(ctx context.Context, regionID *int64, limit, offset int) ([]domain.Bonus, int, error) {
	where, args := "", []any{}
	if regionID != nil {
		where = "WHERE region_id = ?"
		args = append(args, *regionID)
	}

	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM bonuses `+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.QueryContext(ctx,
		`SELECT `+bonusColumns+` FROM bonuses `+where+` ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
		append(args, limit, offset)...,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var items []domain.Bonus
	for rows.Next() {
		b, err := scanBonus(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, *b)
	}
	return items, total, rows.Err()
}

// ListPublished is the public website's read for /{region}/bonuses.
func (r *BonusRepo) ListPublished(ctx context.Context, regionCode string, limit, offset int) ([]domain.Bonus, int, error) {
	countQuery := `SELECT COUNT(*) FROM bonuses b JOIN regions rg ON rg.id = b.region_id
		WHERE rg.code = ? AND ` + EffectivelyPublishedSQL
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, regionCode).Scan(&total); err != nil {
		return nil, 0, err
	}

	listQuery := `SELECT ` + prefixedBonusColumns + ` FROM bonuses b JOIN regions rg ON rg.id = b.region_id
		WHERE rg.code = ? AND ` + EffectivelyPublishedSQL + ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?`
	rows, err := r.db.QueryContext(ctx, listQuery, regionCode, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var items []domain.Bonus
	for rows.Next() {
		b, err := scanBonus(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, *b)
	}
	return items, total, rows.Err()
}

const prefixedBonusColumns = `b.id, b.region_id, b.casino_id, b.bonus_type, b.title, b.terms, b.code, b.valid_from,
	b.valid_until, b.status, b.publish_at, b.created_by, b.created_at, b.updated_at`

// ListPublishedByCasino is the public website's read for a single casino's
// review page (/casinos/[slug]) — every published bonus tied to that casino,
// regardless of region, since a casino page isn't region-scoped by URL.
func (r *BonusRepo) ListPublishedByCasino(ctx context.Context, casinoID int64, limit, offset int) ([]domain.Bonus, int, error) {
	countQuery := `SELECT COUNT(*) FROM bonuses WHERE casino_id = ? AND ` + EffectivelyPublishedSQL
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, casinoID).Scan(&total); err != nil {
		return nil, 0, err
	}

	listQuery := `SELECT ` + bonusColumns + ` FROM bonuses WHERE casino_id = ? AND ` + EffectivelyPublishedSQL +
		` ORDER BY created_at DESC LIMIT ? OFFSET ?`
	rows, err := r.db.QueryContext(ctx, listQuery, casinoID, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var items []domain.Bonus
	for rows.Next() {
		b, err := scanBonus(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, *b)
	}
	return items, total, rows.Err()
}

func (r *BonusRepo) SetStatus(ctx context.Context, id int64, status domain.ContentStatus, publishAt *string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE bonuses SET status = ?, publish_at = ? WHERE id = ?`, status, publishAt, id)
	return err
}

func (r *BonusRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM bonuses WHERE id = ?`, id)
	return err
}

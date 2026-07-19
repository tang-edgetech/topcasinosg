package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type PaymentMethodRepo struct {
	db *sql.DB
}

func NewPaymentMethodRepo(db *sql.DB) *PaymentMethodRepo {
	return &PaymentMethodRepo{db: db}
}

const paymentMethodColumns = `id, region_id, name, description, icon_media_id,
	status, publish_at, created_by, created_at, updated_at`

func scanPaymentMethod(row interface{ Scan(...any) error }) (*domain.PaymentMethod, error) {
	var pm domain.PaymentMethod
	if err := row.Scan(
		&pm.ID, &pm.RegionID, &pm.Name, &pm.Description, &pm.IconMediaID,
		&pm.Status, &pm.PublishAt, &pm.CreatedBy, &pm.CreatedAt, &pm.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &pm, nil
}

func (r *PaymentMethodRepo) Create(ctx context.Context, pm *domain.PaymentMethod) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
		INSERT INTO payment_methods (region_id, name, description, icon_media_id,
			status, publish_at, created_by)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		pm.RegionID, pm.Name, pm.Description, pm.IconMediaID,
		pm.Status, pm.PublishAt, pm.CreatedBy,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *PaymentMethodRepo) Update(ctx context.Context, pm *domain.PaymentMethod) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE payment_methods SET region_id = ?, name = ?, description = ?, icon_media_id = ?
		WHERE id = ?`,
		pm.RegionID, pm.Name, pm.Description, pm.IconMediaID, pm.ID,
	)
	return err
}

func (r *PaymentMethodRepo) GetByID(ctx context.Context, id int64) (*domain.PaymentMethod, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+paymentMethodColumns+` FROM payment_methods WHERE id = ?`, id)
	pm, err := scanPaymentMethod(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return pm, err
}

func (r *PaymentMethodRepo) ListAdmin(ctx context.Context, regionID *int64, limit, offset int) ([]domain.PaymentMethod, int, error) {
	where, args := "", []any{}
	if regionID != nil {
		where = "WHERE region_id = ?"
		args = append(args, *regionID)
	}

	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM payment_methods `+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.QueryContext(ctx,
		`SELECT `+paymentMethodColumns+` FROM payment_methods `+where+` ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
		append(args, limit, offset)...,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var items []domain.PaymentMethod
	for rows.Next() {
		pm, err := scanPaymentMethod(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, *pm)
	}
	return items, total, rows.Err()
}

// ListPublished is the public website's read for /{region}/payment-methods.
func (r *PaymentMethodRepo) ListPublished(ctx context.Context, regionCode string, limit, offset int) ([]domain.PaymentMethod, int, error) {
	countQuery := `SELECT COUNT(*) FROM payment_methods pm JOIN regions rg ON rg.id = pm.region_id
		WHERE rg.code = ? AND ` + EffectivelyPublishedSQL
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, regionCode).Scan(&total); err != nil {
		return nil, 0, err
	}

	listQuery := `SELECT ` + prefixedPaymentMethodColumns + ` FROM payment_methods pm JOIN regions rg ON rg.id = pm.region_id
		WHERE rg.code = ? AND ` + EffectivelyPublishedSQL + ` ORDER BY pm.created_at DESC LIMIT ? OFFSET ?`
	rows, err := r.db.QueryContext(ctx, listQuery, regionCode, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var items []domain.PaymentMethod
	for rows.Next() {
		pm, err := scanPaymentMethod(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, *pm)
	}
	return items, total, rows.Err()
}

const prefixedPaymentMethodColumns = `pm.id, pm.region_id, pm.name, pm.description, pm.icon_media_id,
	pm.status, pm.publish_at, pm.created_by, pm.created_at, pm.updated_at`

func (r *PaymentMethodRepo) SetStatus(ctx context.Context, id int64, status domain.ContentStatus, publishAt *string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE payment_methods SET status = ?, publish_at = ? WHERE id = ?`, status, publishAt, id)
	return err
}

func (r *PaymentMethodRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM payment_methods WHERE id = ?`, id)
	return err
}

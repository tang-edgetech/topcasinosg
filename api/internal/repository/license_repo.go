package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type LicenseRepo struct {
	db *sql.DB
}

func NewLicenseRepo(db *sql.DB) *LicenseRepo {
	return &LicenseRepo{db: db}
}

const licenseColumns = `licenses.id, licenses.name, licenses.logo_media_id, media.url,
	licenses.sort_order, licenses.created_at, licenses.updated_at`
const licenseFromClause = `licenses LEFT JOIN media ON media.id = licenses.logo_media_id`

func scanLicense(row interface{ Scan(...any) error }) (*domain.License, error) {
	var l domain.License
	if err := row.Scan(&l.ID, &l.Name, &l.LogoMediaID, &l.LogoURL, &l.SortOrder, &l.CreatedAt, &l.UpdatedAt); err != nil {
		return nil, err
	}
	return &l, nil
}

// List returns every license, for both the admin dashboard and the public
// website — there's no draft/active distinction for this entity.
func (r *LicenseRepo) List(ctx context.Context) ([]domain.License, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT `+licenseColumns+` FROM `+licenseFromClause+` ORDER BY licenses.sort_order, licenses.name`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var licenses []domain.License
	for rows.Next() {
		l, err := scanLicense(rows)
		if err != nil {
			return nil, err
		}
		licenses = append(licenses, *l)
	}
	return licenses, rows.Err()
}

func (r *LicenseRepo) GetByID(ctx context.Context, id int64) (*domain.License, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+licenseColumns+` FROM `+licenseFromClause+` WHERE licenses.id = ?`, id)
	l, err := scanLicense(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return l, err
}

func (r *LicenseRepo) Create(ctx context.Context, l *domain.License) (int64, error) {
	res, err := r.db.ExecContext(ctx,
		`INSERT INTO licenses (name, logo_media_id, sort_order) VALUES (?, ?, ?)`,
		l.Name, l.LogoMediaID, l.SortOrder,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *LicenseRepo) Update(ctx context.Context, id int64, name string, logoMediaID *int64, sortOrder int) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE licenses SET name = ?, logo_media_id = ?, sort_order = ? WHERE id = ?`, name, logoMediaID, sortOrder, id,
	)
	return err
}

func (r *LicenseRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM licenses WHERE id = ?`, id)
	return err
}

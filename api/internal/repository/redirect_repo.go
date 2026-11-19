package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/go-sql-driver/mysql"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

// ErrRedirectExists: from_path is unique (letter case ignored).
var ErrRedirectExists = errors.New("another redirect already starts from this address")

type RedirectRepo struct {
	db *sql.DB
}

func NewRedirectRepo(db *sql.DB) *RedirectRepo {
	return &RedirectRepo{db: db}
}

const redirectColumns = `id, from_path, to_url, status_code, is_active, note, created_at, updated_at`

func scanRedirect(row interface{ Scan(...any) error }) (*domain.Redirect, error) {
	var r domain.Redirect
	if err := row.Scan(&r.ID, &r.FromPath, &r.ToURL, &r.StatusCode, &r.Active, &r.Note, &r.CreatedAt, &r.UpdatedAt); err != nil {
		return nil, err
	}
	return &r, nil
}

// List returns every redirect, or only the active ones (for the website).
func (r *RedirectRepo) List(ctx context.Context, activeOnly bool) ([]domain.Redirect, error) {
	query := `SELECT ` + redirectColumns + ` FROM redirects`
	if activeOnly {
		query += ` WHERE is_active = 1`
	}
	rows, err := r.db.QueryContext(ctx, query+` ORDER BY from_path`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	list := []domain.Redirect{}
	for rows.Next() {
		item, err := scanRedirect(rows)
		if err != nil {
			return nil, err
		}
		list = append(list, *item)
	}
	return list, rows.Err()
}

func (r *RedirectRepo) GetByID(ctx context.Context, id int64) (*domain.Redirect, error) {
	item, err := scanRedirect(r.db.QueryRowContext(ctx, `SELECT `+redirectColumns+` FROM redirects WHERE id = ?`, id))
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return item, err
}

func (r *RedirectRepo) Create(ctx context.Context, in *domain.Redirect) (int64, error) {
	res, err := r.db.ExecContext(ctx,
		`INSERT INTO redirects (from_path, to_url, status_code, is_active, note) VALUES (?, ?, ?, ?, ?)`,
		in.FromPath, in.ToURL, in.StatusCode, in.Active, in.Note,
	)
	if err != nil {
		return 0, duplicateRedirect(err)
	}
	return res.LastInsertId()
}

func (r *RedirectRepo) Update(ctx context.Context, id int64, in *domain.Redirect) error {
	res, err := r.db.ExecContext(ctx,
		`UPDATE redirects SET from_path = ?, to_url = ?, status_code = ?, is_active = ?, note = ? WHERE id = ?`,
		in.FromPath, in.ToURL, in.StatusCode, in.Active, in.Note, id,
	)
	if err != nil {
		return duplicateRedirect(err)
	}
	if n, _ := res.RowsAffected(); n == 0 {
		if _, err := r.GetByID(ctx, id); err != nil {
			return err
		}
	}
	return nil
}

func (r *RedirectRepo) Delete(ctx context.Context, id int64) error {
	res, err := r.db.ExecContext(ctx, `DELETE FROM redirects WHERE id = ?`, id)
	if err != nil {
		return err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return ErrNotFound
	}
	return nil
}

func duplicateRedirect(err error) error {
	var me *mysql.MySQLError
	if errors.As(err, &me) && me.Number == 1062 {
		return ErrRedirectExists
	}
	return err
}

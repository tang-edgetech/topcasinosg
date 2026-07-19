package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type MenuItemRepo struct {
	db *sql.DB
}

func NewMenuItemRepo(db *sql.DB) *MenuItemRepo {
	return &MenuItemRepo{db: db}
}

const menuItemColumns = `id, location, parent_id, label, href, source_type, sort_order, created_at, updated_at`

func scanMenuItem(row interface{ Scan(...any) error }) (*domain.MenuItem, error) {
	var m domain.MenuItem
	if err := row.Scan(&m.ID, &m.Location, &m.ParentID, &m.Label, &m.Href, &m.SourceType, &m.SortOrder, &m.CreatedAt, &m.UpdatedAt); err != nil {
		return nil, err
	}
	return &m, nil
}

// ListByLocation returns every node for a location as a flat, parent-ordered
// list — callers build the tree client-side (the set is always small, a few
// dozen rows at most).
func (r *MenuItemRepo) ListByLocation(ctx context.Context, location domain.MenuLocation) ([]domain.MenuItem, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT `+menuItemColumns+` FROM menu_items WHERE location = ? ORDER BY parent_id IS NOT NULL, parent_id, sort_order, id`,
		location,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []domain.MenuItem
	for rows.Next() {
		item, err := scanMenuItem(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, *item)
	}
	return items, rows.Err()
}

func (r *MenuItemRepo) GetByID(ctx context.Context, id int64) (*domain.MenuItem, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+menuItemColumns+` FROM menu_items WHERE id = ?`, id)
	item, err := scanMenuItem(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return item, err
}

func (r *MenuItemRepo) Create(ctx context.Context, item *domain.MenuItem) (int64, error) {
	res, err := r.db.ExecContext(ctx,
		`INSERT INTO menu_items (location, parent_id, label, href, source_type, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
		item.Location, item.ParentID, item.Label, item.Href, item.SourceType, item.SortOrder,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *MenuItemRepo) Update(ctx context.Context, id int64, label string, href *string, sourceType domain.MenuItemSourceType, sortOrder int) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE menu_items SET label = ?, href = ?, source_type = ?, sort_order = ? WHERE id = ?`,
		label, href, sourceType, sortOrder, id,
	)
	return err
}

// Delete cascades to every descendant via the parent_id FK's ON DELETE
// CASCADE — deleting a tab/column removes its columns/links in one query.
func (r *MenuItemRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM menu_items WHERE id = ?`, id)
	return err
}

package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

// ComponentRepo stores Components and their revisions (0093_components.sql).
type ComponentRepo struct {
	db *sql.DB
}

func NewComponentRepo(db *sql.DB) *ComponentRepo {
	return &ComponentRepo{db: db}
}

// componentUsageSQL counts the pages placing component c: a "component"
// block whose componentId field is its id.
const componentUsageSQL = `(
		SELECT COUNT(DISTINCT s.page_id) FROM page_sections s
		JOIN page_section_fields f ON f.section_id = s.id AND f.item_index = 0 AND f.field_key = 'componentId'
		WHERE s.block_type = 'component' AND CAST(f.text_value AS UNSIGNED) = c.id
	)`

const componentColumns = `c.id, c.name, c.description, c.html, c.css, c.js, c.settings, c.created_at, c.updated_at, ` + componentUsageSQL

func scanComponent(row interface{ Scan(...any) error }) (*domain.Component, error) {
	var c domain.Component
	var settings string
	if err := row.Scan(&c.ID, &c.Name, &c.Description, &c.HTML, &c.CSS, &c.JS, &settings, &c.CreatedAt, &c.UpdatedAt, &c.UsageCount); err != nil {
		return nil, err
	}
	c.Settings = []domain.ComponentSetting{}
	if settings != "" {
		if err := json.Unmarshal([]byte(settings), &c.Settings); err != nil {
			return nil, err
		}
	}
	return &c, nil
}

func (r *ComponentRepo) List(ctx context.Context) ([]domain.Component, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT `+componentColumns+` FROM components c ORDER BY c.name, c.id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	components := []domain.Component{}
	for rows.Next() {
		c, err := scanComponent(rows)
		if err != nil {
			return nil, err
		}
		components = append(components, *c)
	}
	return components, rows.Err()
}

func (r *ComponentRepo) GetByID(ctx context.Context, id int64) (*domain.Component, error) {
	c, err := scanComponent(r.db.QueryRowContext(ctx, `SELECT `+componentColumns+` FROM components c WHERE c.id = ?`, id))
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return c, err
}

// NameTaken reports another component (not exceptID) with this name.
func (r *ComponentRepo) NameTaken(ctx context.Context, name string, exceptID int64) (bool, error) {
	var n int
	err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM components WHERE name = ? AND id <> ?`, name, exceptID).Scan(&n)
	return n > 0, err
}

// UsedOn lists the pages (any kind: pages, global sections, templates) that
// place the component.
func (r *ComponentRepo) UsedOn(ctx context.Context, id int64) ([]domain.Page, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT DISTINCT p.id, p.title, p.slug, p.kind FROM page_sections s
		JOIN page_section_fields f ON f.section_id = s.id AND f.item_index = 0 AND f.field_key = 'componentId'
		JOIN pages p ON p.id = s.page_id
		WHERE s.block_type = 'component' AND CAST(f.text_value AS UNSIGNED) = ?
		ORDER BY p.title, p.id`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	pages := []domain.Page{}
	for rows.Next() {
		var p domain.Page
		if err := rows.Scan(&p.ID, &p.Title, &p.Slug, &p.Kind); err != nil {
			return nil, err
		}
		pages = append(pages, p)
	}
	return pages, rows.Err()
}

func encodeSettings(settings []domain.ComponentSetting) (string, error) {
	if settings == nil {
		settings = []domain.ComponentSetting{}
	}
	b, err := json.Marshal(settings)
	return string(b), err
}

// Create inserts the component and records it as its first revision.
func (r *ComponentRepo) Create(ctx context.Context, c *domain.Component, savedBy *int64) (int64, error) {
	settings, err := encodeSettings(c.Settings)
	if err != nil {
		return 0, err
	}
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()
	res, err := tx.ExecContext(ctx,
		`INSERT INTO components (name, description, html, css, js, settings) VALUES (?, ?, ?, ?, ?, ?)`,
		c.Name, c.Description, c.HTML, c.CSS, c.JS, settings)
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}
	if err := addComponentRevision(ctx, tx, id, c.Snapshot(), savedBy); err != nil {
		return 0, err
	}
	return id, tx.Commit()
}

// Update saves the component and records the result as a new revision.
func (r *ComponentRepo) Update(ctx context.Context, id int64, c *domain.Component, savedBy *int64) error {
	settings, err := encodeSettings(c.Settings)
	if err != nil {
		return err
	}
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	res, err := tx.ExecContext(ctx,
		`UPDATE components SET name = ?, description = ?, html = ?, css = ?, js = ?, settings = ? WHERE id = ?`,
		c.Name, c.Description, c.HTML, c.CSS, c.JS, settings, id)
	if err != nil {
		return err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		var exists int
		if err := tx.QueryRowContext(ctx, `SELECT COUNT(*) FROM components WHERE id = ?`, id).Scan(&exists); err != nil {
			return err
		}
		if exists == 0 {
			return ErrNotFound
		}
	}
	if err := addComponentRevision(ctx, tx, id, c.Snapshot(), savedBy); err != nil {
		return err
	}
	return tx.Commit()
}

func addComponentRevision(ctx context.Context, tx *sql.Tx, componentID int64, snapshot domain.ComponentSnapshot, savedBy *int64) error {
	encoded, err := json.Marshal(snapshot)
	if err != nil {
		return err
	}
	if _, err := tx.ExecContext(ctx,
		`INSERT INTO component_revisions (component_id, snapshot, saved_by) VALUES (?, ?, ?)`, componentID, encoded, savedBy,
	); err != nil {
		return err
	}
	_, err = tx.ExecContext(ctx, `
		DELETE FROM component_revisions WHERE component_id = ? AND id NOT IN (
			SELECT id FROM (SELECT id FROM component_revisions WHERE component_id = ? ORDER BY id DESC LIMIT ?) AS keep
		)`, componentID, componentID, domain.MaxComponentRevisions)
	return err
}

// ListRevisions returns a component's saved versions, newest first.
func (r *ComponentRepo) ListRevisions(ctx context.Context, componentID int64) ([]domain.ComponentRevision, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT rv.id, rv.component_id, rv.snapshot, rv.saved_by, COALESCE(u.full_name, ''), rv.created_at
		FROM component_revisions rv LEFT JOIN admin_users u ON u.id = rv.saved_by
		WHERE rv.component_id = ? ORDER BY rv.id DESC`, componentID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	revisions := []domain.ComponentRevision{}
	for rows.Next() {
		var rv domain.ComponentRevision
		var snapshot []byte
		if err := rows.Scan(&rv.ID, &rv.ComponentID, &snapshot, &rv.SavedByID, &rv.SavedByName, &rv.CreatedAt); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(snapshot, &rv.Snapshot); err != nil {
			return nil, err
		}
		revisions = append(revisions, rv)
	}
	return revisions, rows.Err()
}

func (r *ComponentRepo) Delete(ctx context.Context, id int64) error {
	res, err := r.db.ExecContext(ctx, `DELETE FROM components WHERE id = ?`, id)
	if err != nil {
		return err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return ErrNotFound
	}
	return nil
}

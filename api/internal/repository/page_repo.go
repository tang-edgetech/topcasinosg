package repository

import (
	"context"
	"database/sql"
	"errors"
	"sort"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type PageRepo struct {
	db *sql.DB
}

func NewPageRepo(db *sql.DB) *PageRepo {
	return &PageRepo{db: db}
}

const pageColumns = `id, slug, title, meta_title, meta_description,
	head_snippet, body_snippet, footer_snippet, status, publish_at, created_at, updated_at`

func scanPage(row interface{ Scan(...any) error }) (*domain.Page, error) {
	var p domain.Page
	if err := row.Scan(
		&p.ID, &p.Slug, &p.Title, &p.MetaTitle, &p.MetaDescription,
		&p.HeadSnippet, &p.BodySnippet, &p.FooterSnippet, &p.Status, &p.PublishAt, &p.CreatedAt, &p.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PageRepo) List(ctx context.Context) ([]domain.Page, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT `+pageColumns+` FROM pages ORDER BY title`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var pages []domain.Page
	for rows.Next() {
		p, err := scanPage(rows)
		if err != nil {
			return nil, err
		}
		pages = append(pages, *p)
	}
	return pages, rows.Err()
}

func (r *PageRepo) GetByID(ctx context.Context, id int64) (*domain.Page, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+pageColumns+` FROM pages WHERE id = ?`, id)
	p, err := scanPage(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return p, err
}

// GetPublishedBySlug is the public website's read — only effectively
// published pages are visible, computed live (see EffectivelyPublishedSQL).
func (r *PageRepo) GetPublishedBySlug(ctx context.Context, slug string) (*domain.Page, error) {
	row := r.db.QueryRowContext(ctx,
		`SELECT `+pageColumns+` FROM pages WHERE slug = ? AND `+EffectivelyPublishedSQL, slug,
	)
	p, err := scanPage(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return p, err
}

func (r *PageRepo) ExistsSlug(ctx context.Context, slug string, excludeID int64) (bool, error) {
	var count int
	err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM pages WHERE slug = ? AND id != ?`, slug, excludeID).Scan(&count)
	return count > 0, err
}

func (r *PageRepo) Create(ctx context.Context, p *domain.Page) (int64, error) {
	res, err := r.db.ExecContext(ctx,
		`INSERT INTO pages (slug, title, meta_title, meta_description, status, publish_at) VALUES (?, ?, ?, ?, ?, ?)`,
		p.Slug, p.Title, p.MetaTitle, p.MetaDescription, p.Status, p.PublishAt,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

// UpdateDetails is the "Page Details" tab's save — title + slug only. Split
// out from SEO/snippet fields so those two other tabs (different admin
// forms, and for snippets a different permission tier) never clobber each
// other's columns by round-tripping stale values.
func (r *PageRepo) UpdateDetails(ctx context.Context, id int64, title, slug string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE pages SET title = ?, slug = ? WHERE id = ?`, title, slug, id)
	return err
}

func (r *PageRepo) UpdateSEO(ctx context.Context, id int64, metaTitle, metaDescription string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE pages SET meta_title = ?, meta_description = ? WHERE id = ?`,
		metaTitle, metaDescription, id,
	)
	return err
}

func (r *PageRepo) UpdateSnippets(ctx context.Context, id int64, head, body, footer string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE pages SET head_snippet = ?, body_snippet = ?, footer_snippet = ? WHERE id = ?`,
		head, body, footer, id,
	)
	return err
}

func (r *PageRepo) SetStatus(ctx context.Context, id int64, status domain.ContentStatus, publishAt *string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE pages SET status = ?, publish_at = ? WHERE id = ?`, status, publishAt, id)
	return err
}

// Delete cascades to page_sections and page_section_fields via their FKs.
func (r *PageRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM pages WHERE id = ?`, id)
	return err
}

const sectionFieldColumns = `psf.id, psf.section_id, psf.item_index, psf.field_key, psf.field_type, psf.text_value, psf.media_id, media.url, psf.url_value, psf.sort_order`

// GetSectionsWithFields assembles the full block tree for one page: every
// section ordered by sort_order, each with its fields ordered by
// (item_index, sort_order) — used both by the admin editor (to load the
// current tree) and the public site (to render it).
func (r *PageRepo) GetSectionsWithFields(ctx context.Context, pageID int64) ([]domain.PageSection, error) {
	sectionRows, err := r.db.QueryContext(ctx,
		`SELECT id, page_id, block_type, custom_class, custom_id, sort_order FROM page_sections WHERE page_id = ? ORDER BY sort_order, id`,
		pageID,
	)
	if err != nil {
		return nil, err
	}
	defer sectionRows.Close()

	var sections []domain.PageSection
	sectionByID := make(map[int64]*domain.PageSection)
	var sectionIDs []any
	for sectionRows.Next() {
		var s domain.PageSection
		if err := sectionRows.Scan(&s.ID, &s.PageID, &s.BlockType, &s.CustomClass, &s.CustomID, &s.SortOrder); err != nil {
			return nil, err
		}
		s.Fields = []domain.PageSectionField{}
		sections = append(sections, s)
		sectionIDs = append(sectionIDs, s.ID)
	}
	if err := sectionRows.Err(); err != nil {
		return nil, err
	}
	for i := range sections {
		sectionByID[sections[i].ID] = &sections[i]
	}
	if len(sectionIDs) == 0 {
		return sections, nil
	}

	placeholders := make([]string, len(sectionIDs))
	for i := range placeholders {
		placeholders[i] = "?"
	}
	query := `SELECT ` + sectionFieldColumns + ` FROM page_section_fields psf
		LEFT JOIN media ON media.id = psf.media_id
		WHERE psf.section_id IN (` + joinPlaceholders(placeholders) + `)
		ORDER BY psf.section_id, psf.item_index, psf.sort_order, psf.id`
	fieldRows, err := r.db.QueryContext(ctx, query, sectionIDs...)
	if err != nil {
		return nil, err
	}
	defer fieldRows.Close()

	for fieldRows.Next() {
		var f domain.PageSectionField
		if err := fieldRows.Scan(&f.ID, &f.SectionID, &f.ItemIndex, &f.FieldKey, &f.FieldType, &f.TextValue, &f.MediaID, &f.MediaURL, &f.URLValue, &f.SortOrder); err != nil {
			return nil, err
		}
		if s, ok := sectionByID[f.SectionID]; ok {
			s.Fields = append(s.Fields, f)
		}
	}
	return sections, fieldRows.Err()
}

func joinPlaceholders(parts []string) string {
	out := ""
	for i, p := range parts {
		if i > 0 {
			out += ","
		}
		out += p
	}
	return out
}

// ReplaceSections fully replaces a page's section/field tree in one
// transaction — simpler and less error-prone than diffing adds/reorders/
// removals against the previous tree, and section/field IDs have no
// external references worth preserving across a save.
func (r *PageRepo) ReplaceSections(ctx context.Context, pageID int64, sections []domain.PageSection) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, `DELETE FROM page_sections WHERE page_id = ?`, pageID); err != nil {
		return err
	}

	sort.SliceStable(sections, func(i, j int) bool { return sections[i].SortOrder < sections[j].SortOrder })
	for _, section := range sections {
		res, err := tx.ExecContext(ctx,
			`INSERT INTO page_sections (page_id, block_type, custom_class, custom_id, sort_order) VALUES (?, ?, ?, ?, ?)`,
			pageID, section.BlockType, section.CustomClass, section.CustomID, section.SortOrder,
		)
		if err != nil {
			return err
		}
		sectionID, err := res.LastInsertId()
		if err != nil {
			return err
		}
		for _, field := range section.Fields {
			if _, err := tx.ExecContext(ctx,
				`INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, media_id, url_value, sort_order)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
				sectionID, field.ItemIndex, field.FieldKey, field.FieldType, field.TextValue, field.MediaID, field.URLValue, field.SortOrder,
			); err != nil {
				return err
			}
		}
	}
	return tx.Commit()
}

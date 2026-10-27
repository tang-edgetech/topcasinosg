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

const pageColumns = `id, parent_id, kind, sort_order, slug, title, meta_title, meta_description,
	head_snippet, body_snippet, footer_snippet, status, publish_at, created_at, updated_at`

func scanPage(row interface{ Scan(...any) error }) (*domain.Page, error) {
	var p domain.Page
	if err := row.Scan(
		&p.ID, &p.ParentID, &p.Kind, &p.SortOrder, &p.Slug, &p.Title, &p.MetaTitle, &p.MetaDescription,
		&p.HeadSnippet, &p.BodySnippet, &p.FooterSnippet, &p.Status, &p.PublishAt, &p.CreatedAt, &p.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &p, nil
}

// List orders by each page's position among its siblings (see SortOrder),
// not flat across the whole table - the admin's tree view groups by parent
// anyway, so a global ORDER BY only needs to keep siblings in the right
// relative order, which parent_key + sort_order does directly.
func (r *PageRepo) List(ctx context.Context) ([]domain.Page, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT `+pageColumns+` FROM pages WHERE kind = 'page' ORDER BY parent_key, sort_order, id`)
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

// GetPublishedBySlug is the public website's read for a ROOT page (no
// parent) — only effectively published pages are visible, computed live
// (see EffectivelyPublishedSQL). Kept for the single-segment case; deeper
// paths resolve via ResolvePath/PathNodes below instead.
func (r *PageRepo) GetPublishedBySlug(ctx context.Context, slug string) (*domain.Page, error) {
	row := r.db.QueryRowContext(ctx,
		`SELECT `+pageColumns+` FROM pages WHERE slug = ? AND parent_id IS NULL AND kind = 'page' AND `+EffectivelyPublishedSQL, slug,
	)
	p, err := scanPage(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return p, err
}

// GetPublishedByID mirrors GetPublishedBySlug but by primary key - used once
// a full path has already been resolved to a leaf page id (see
// PageService.ResolvePath), since the walk itself only needs slug/parent_id,
// not full row data, for every ancestor along the way.
func (r *PageRepo) GetPublishedByID(ctx context.Context, id int64) (*domain.Page, error) {
	row := r.db.QueryRowContext(ctx,
		`SELECT `+pageColumns+` FROM pages WHERE id = ? AND kind = 'page' AND `+EffectivelyPublishedSQL, id,
	)
	p, err := scanPage(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return p, err
}

// ExistsSlugUnderParent checks sibling-uniqueness (same parent, including
// two root pages both having a nil parent) rather than global uniqueness -
// see the 0028 migration's parent_key column for why a plain nullable
// parent_id can't be compared with `=` here (NULL never equals NULL in SQL).
func (r *PageRepo) ExistsSlugUnderParent(ctx context.Context, slug string, parentID *int64, excludeID int64) (bool, error) {
	var count int
	err := r.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM pages WHERE slug = ? AND parent_key = COALESCE(?, 0) AND id != ?`,
		slug, parentID, excludeID,
	).Scan(&count)
	return count > 0, err
}

// PathNode is the minimal shape needed to resolve a URL path to a page id
// (or to compute every page's full path for the admin list) - deliberately
// not the full domain.Page, since this is fetched for every page at once
// regardless of publish status (an unpublished page can still be a real
// ancestor segment; its own leaf-page visibility is checked separately via
// GetPublishedByID once resolution finds it).
type PathNode struct {
	ID       int64
	ParentID *int64
	Slug     string
}

func (r *PageRepo) ListPathNodes(ctx context.Context) ([]PathNode, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT id, parent_id, slug FROM pages WHERE kind = 'page'`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var nodes []PathNode
	for rows.Next() {
		var n PathNode
		if err := rows.Scan(&n.ID, &n.ParentID, &n.Slug); err != nil {
			return nil, err
		}
		nodes = append(nodes, n)
	}
	return nodes, rows.Err()
}

// NextSortOrder places a brand-new page at the end of its sibling group
// (one past whatever the highest sort_order among those siblings already
// is) rather than defaulting to 0 and jumping to the front of a
// since-reordered list.
func (r *PageRepo) NextSortOrder(ctx context.Context, parentID *int64) (int, error) {
	var max sql.NullInt64
	err := r.db.QueryRowContext(ctx,
		`SELECT MAX(sort_order) FROM pages WHERE parent_key = COALESCE(?, 0)`, parentID,
	).Scan(&max)
	if err != nil {
		return 0, err
	}
	if !max.Valid {
		return 0, nil
	}
	return int(max.Int64) + 1, nil
}

func (r *PageRepo) Create(ctx context.Context, p *domain.Page) (int64, error) {
	res, err := r.db.ExecContext(ctx,
		`INSERT INTO pages (parent_id, kind, sort_order, slug, title, meta_title, meta_description, status, publish_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		p.ParentID, pageKindOrDefault(p.Kind), p.SortOrder, p.Slug, p.Title, p.MetaTitle, p.MetaDescription, p.Status, p.PublishAt,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func pageKindOrDefault(kind string) string {
	if kind == "" {
		return domain.PageKindPage
	}
	return kind
}

// ListGlobals returns every global section with how many pages place it
// (a global_section block whose globalId field is its id).
func (r *PageRepo) ListGlobals(ctx context.Context) ([]domain.GlobalSection, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT p.id, p.title, p.updated_at, `+globalUsageSQL+`
		FROM pages p WHERE p.kind = 'global' ORDER BY p.title, p.id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	globals := []domain.GlobalSection{}
	for rows.Next() {
		var g domain.GlobalSection
		if err := rows.Scan(&g.ID, &g.Name, &g.UpdatedAt, &g.UsageCount); err != nil {
			return nil, err
		}
		globals = append(globals, g)
	}
	return globals, rows.Err()
}

const globalUsageSQL = `(
			SELECT COUNT(DISTINCT s.page_id) FROM page_sections s
			JOIN page_section_fields f ON f.section_id = s.id AND f.item_index = 0 AND f.field_key = 'globalId'
			WHERE s.block_type = 'global_section' AND CAST(f.text_value AS UNSIGNED) = p.id
		)`

func (r *PageRepo) GetGlobal(ctx context.Context, id int64) (*domain.GlobalSection, error) {
	var g domain.GlobalSection
	err := r.db.QueryRowContext(ctx,
		`SELECT p.id, p.title, p.updated_at, `+globalUsageSQL+` FROM pages p WHERE p.id = ? AND p.kind = 'global'`, id,
	).Scan(&g.ID, &g.Name, &g.UpdatedAt, &g.UsageCount)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return &g, err
}

func (r *PageRepo) RenameGlobal(ctx context.Context, id int64, name string) error {
	res, err := r.db.ExecContext(ctx, `UPDATE pages SET title = ? WHERE id = ? AND kind = 'global'`, name, id)
	if err != nil {
		return err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		if _, err := r.GetGlobal(ctx, id); err != nil {
			return err
		}
	}
	return nil
}

// UpdateDetails is the "Page Details" tab's save — title + slug + parent.
// Split out from SEO/snippet fields so those two other tabs (different admin
// forms, and for snippets a different permission tier) never clobber each
// other's columns by round-tripping stale values. Moving a page to a new
// parent here doesn't touch sort_order - it lands at whatever position it
// already had, among whichever siblings it's now grouped with; reordering
// within a level is Reorder's job, not this one's.
func (r *PageRepo) UpdateDetails(ctx context.Context, id int64, title, slug string, parentID *int64) error {
	_, err := r.db.ExecContext(ctx, `UPDATE pages SET title = ?, slug = ?, parent_id = ? WHERE id = ?`, title, slug, parentID, id)
	return err
}

// Reorder persists a full sibling order in one transaction - every id in
// orderedIDs gets sort_order set to its index, but ONLY if it's actually a
// child of parentID (the `parent_key` guard on the UPDATE); an id that
// doesn't belong there is silently skipped (0 rows affected) rather than
// erroring, since a stale client sending a slightly-out-of-date list is a
// no-op for those entries, not data corruption.
func (r *PageRepo) Reorder(ctx context.Context, parentID *int64, orderedIDs []int64) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for i, id := range orderedIDs {
		if _, err := tx.ExecContext(ctx,
			`UPDATE pages SET sort_order = ? WHERE id = ? AND parent_key = COALESCE(?, 0)`,
			i, id, parentID,
		); err != nil {
			return err
		}
	}
	return tx.Commit()
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
	if _, err := r.db.ExecContext(ctx, `DELETE FROM pages WHERE id = ?`, id); err != nil {
		return err
	}
	return deleteSeoMeta(ctx, r.db, domain.SeoEntityPage, id)
}

const sectionFieldColumns = `psf.id, psf.section_id, psf.item_index, psf.field_key, psf.field_type, psf.text_value, psf.media_id, media.url, psf.url_value, psf.sort_order`

// GetSectionsWithFields assembles the full block tree for one page: every
// section ordered by sort_order, each with its fields ordered by
// (item_index, sort_order) — used both by the admin editor (to load the
// current tree) and the public site (to render it).
func (r *PageRepo) GetSectionsWithFields(ctx context.Context, pageID int64) ([]domain.PageSection, error) {
	sectionRows, err := r.db.QueryContext(ctx,
		`SELECT id, page_id, block_type, custom_class, custom_id, in_container, sort_order FROM page_sections WHERE page_id = ? ORDER BY sort_order, id`,
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
		if err := sectionRows.Scan(&s.ID, &s.PageID, &s.BlockType, &s.CustomClass, &s.CustomID, &s.InContainer, &s.SortOrder); err != nil {
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
			`INSERT INTO page_sections (page_id, block_type, custom_class, custom_id, in_container, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
			pageID, section.BlockType, section.CustomClass, section.CustomID, section.InContainer, section.SortOrder,
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

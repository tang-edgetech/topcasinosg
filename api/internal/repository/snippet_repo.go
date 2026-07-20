package repository

import (
	"context"
	"database/sql"
	"errors"
	"sort"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type SnippetRepo struct {
	db *sql.DB
}

func NewSnippetRepo(db *sql.DB) *SnippetRepo {
	return &SnippetRepo{db: db}
}

const snippetColumns = `id, name, kind, code_type, location, content, is_active, sort_order, priority, created_at, updated_at`

func scanSnippet(row interface{ Scan(...any) error }) (*domain.SiteSnippet, error) {
	var s domain.SiteSnippet
	var codeType sql.NullString
	if err := row.Scan(
		&s.ID, &s.Name, &s.Kind, &codeType, &s.Location, &s.Content, &s.IsActive, &s.SortOrder, &s.Priority,
		&s.CreatedAt, &s.UpdatedAt,
	); err != nil {
		return nil, err
	}
	if codeType.Valid {
		ct := domain.CodeType(codeType.String)
		s.CodeType = &ct
	}
	return &s, nil
}

func (r *SnippetRepo) List(ctx context.Context) ([]domain.SiteSnippet, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT `+snippetColumns+` FROM site_snippets ORDER BY kind, location, sort_order, priority, id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var snippets []domain.SiteSnippet
	var ids []any
	byID := map[int64]*domain.SiteSnippet{}
	for rows.Next() {
		s, err := scanSnippet(rows)
		if err != nil {
			return nil, err
		}
		snippets = append(snippets, *s)
		ids = append(ids, s.ID)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	for i := range snippets {
		byID[snippets[i].ID] = &snippets[i]
	}

	conditions, err := r.conditionsForSnippetIDs(ctx, ids)
	if err != nil {
		return nil, err
	}
	for _, c := range conditions {
		if s, ok := byID[c.SnippetID]; ok {
			s.Conditions = append(s.Conditions, c)
		}
	}
	return snippets, nil
}

func (r *SnippetRepo) GetByID(ctx context.Context, id int64) (*domain.SiteSnippet, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+snippetColumns+` FROM site_snippets WHERE id = ?`, id)
	s, err := scanSnippet(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	conditions, err := r.conditionsForSnippetIDs(ctx, []any{id})
	if err != nil {
		return nil, err
	}
	s.Conditions = conditions
	return s, nil
}

func (r *SnippetRepo) conditionsForSnippetIDs(ctx context.Context, ids []any) ([]domain.SnippetCondition, error) {
	if len(ids) == 0 {
		return nil, nil
	}
	placeholders := make([]string, len(ids))
	for i := range placeholders {
		placeholders[i] = "?"
	}
	query := `SELECT id, snippet_id, field, operator, page_id, value, sort_order FROM snippet_conditions
		WHERE snippet_id IN (` + joinPlaceholders(placeholders) + `) ORDER BY snippet_id, sort_order, id`
	rows, err := r.db.QueryContext(ctx, query, ids...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var conditions []domain.SnippetCondition
	for rows.Next() {
		var c domain.SnippetCondition
		if err := rows.Scan(&c.ID, &c.SnippetID, &c.Field, &c.Operator, &c.PageID, &c.Value, &c.SortOrder); err != nil {
			return nil, err
		}
		conditions = append(conditions, c)
	}
	return conditions, rows.Err()
}

func (r *SnippetRepo) Create(ctx context.Context, s *domain.SiteSnippet) (int64, error) {
	res, err := r.db.ExecContext(ctx,
		`INSERT INTO site_snippets (name, kind, code_type, location, content, is_active, sort_order, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		s.Name, s.Kind, s.CodeType, s.Location, s.Content, s.IsActive, s.SortOrder, s.Priority,
	)
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}
	if err := r.replaceConditions(ctx, r.db, id, s.Conditions); err != nil {
		return 0, err
	}
	return id, nil
}

func (r *SnippetRepo) Update(ctx context.Context, id int64, s *domain.SiteSnippet) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx,
		`UPDATE site_snippets SET name = ?, kind = ?, code_type = ?, location = ?, content = ?, sort_order = ?, priority = ? WHERE id = ?`,
		s.Name, s.Kind, s.CodeType, s.Location, s.Content, s.SortOrder, s.Priority, id,
	); err != nil {
		return err
	}
	if err := r.replaceConditions(ctx, tx, id, s.Conditions); err != nil {
		return err
	}
	return tx.Commit()
}

// replaceConditions fully replaces a snippet's condition rows in one go —
// same rationale as PageRepo.ReplaceSections: condition IDs have no
// external references worth preserving across a save.
func (r *SnippetRepo) replaceConditions(ctx context.Context, exec interface {
	ExecContext(context.Context, string, ...any) (sql.Result, error)
}, snippetID int64, conditions []domain.SnippetCondition) error {
	if _, err := exec.ExecContext(ctx, `DELETE FROM snippet_conditions WHERE snippet_id = ?`, snippetID); err != nil {
		return err
	}
	sort.SliceStable(conditions, func(i, j int) bool { return conditions[i].SortOrder < conditions[j].SortOrder })
	for _, c := range conditions {
		if _, err := exec.ExecContext(ctx,
			`INSERT INTO snippet_conditions (snippet_id, field, operator, page_id, value, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
			snippetID, c.Field, c.Operator, c.PageID, c.Value, c.SortOrder,
		); err != nil {
			return err
		}
	}
	return nil
}

func (r *SnippetRepo) SetActive(ctx context.Context, id int64, active bool) error {
	_, err := r.db.ExecContext(ctx, `UPDATE site_snippets SET is_active = ? WHERE id = ?`, active, id)
	return err
}

func (r *SnippetRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM site_snippets WHERE id = ?`, id)
	return err
}

// ResolvePageIDForPath maps a request path to a Pages-CMS page id, for
// "Page is/is not" condition matching. Only "/" (the Homepage) is backed by
// the Pages CMS today — every other route returns nil, which correctly
// makes "Page is X" always false and "Page is not X" always true there.
func (r *SnippetRepo) ResolvePageIDForPath(ctx context.Context, path string) (*int64, error) {
	if path != "/" {
		return nil, nil
	}
	var id int64
	err := r.db.QueryRowContext(ctx, `SELECT id FROM pages WHERE slug = 'home'`).Scan(&id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &id, nil
}

// ListMatchingGrouped is the public website's read: every active 'global'
// snippet unconditionally, plus every active 'code' snippet whose
// conditions (if any) all match this request — grouped by location, global
// rows first (by sort_order) then code rows (by priority ascending).
func (r *SnippetRepo) ListMatchingGrouped(ctx context.Context, path string) (map[domain.SnippetLocation][]string, error) {
	currentPageID, err := r.ResolvePageIDForPath(ctx, path)
	if err != nil {
		return nil, err
	}

	snippets, err := r.List(ctx)
	if err != nil {
		return nil, err
	}

	grouped := map[domain.SnippetLocation][]string{}
	var globalByLoc, codeByLoc = map[domain.SnippetLocation][]domain.SiteSnippet{}, map[domain.SnippetLocation][]domain.SiteSnippet{}
	for _, s := range snippets {
		if !s.IsActive {
			continue
		}
		if s.Kind == domain.SnippetKindGlobal {
			globalByLoc[s.Location] = append(globalByLoc[s.Location], s)
			continue
		}
		matches := true
		for _, c := range s.Conditions {
			if !c.Matches(currentPageID, path) {
				matches = false
				break
			}
		}
		if matches {
			codeByLoc[s.Location] = append(codeByLoc[s.Location], s)
		}
	}

	for _, loc := range []domain.SnippetLocation{domain.SnippetLocationHead, domain.SnippetLocationBody, domain.SnippetLocationFooter} {
		global := globalByLoc[loc]
		sort.SliceStable(global, func(i, j int) bool { return global[i].SortOrder < global[j].SortOrder })
		code := codeByLoc[loc]
		sort.SliceStable(code, func(i, j int) bool { return code[i].Priority < code[j].Priority })

		var content []string
		for _, s := range global {
			content = append(content, renderSnippetContent(s))
		}
		for _, s := range code {
			content = append(content, renderSnippetContent(s))
		}
		if len(content) > 0 {
			grouped[loc] = content
		}
	}
	return grouped, nil
}

// renderSnippetContent auto-wraps css/js code types so the admin can paste
// bare CSS/JS without their own <style>/<script> tags; html/universal (and
// every 'global' row, which has no code_type) render exactly as pasted.
func renderSnippetContent(s domain.SiteSnippet) string {
	if s.CodeType == nil {
		return s.Content
	}
	switch *s.CodeType {
	case domain.CodeTypeCSS:
		return "<style>" + s.Content + "</style>"
	case domain.CodeTypeJS:
		return "<script>" + s.Content + "</script>"
	default:
		return s.Content
	}
}

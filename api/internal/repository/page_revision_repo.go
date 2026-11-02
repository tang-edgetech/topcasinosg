package repository

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"sort"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

// revisionSections is how a page's sections are stored in a revision: in
// display order, without database ids or the looked-up media URLs, so two
// saves of the same content compare equal.
func revisionSections(sections []domain.PageSection) []domain.PageSection {
	ordered := make([]domain.PageSection, len(sections))
	copy(ordered, sections)
	sort.SliceStable(ordered, func(i, j int) bool { return ordered[i].SortOrder < ordered[j].SortOrder })
	out := make([]domain.PageSection, len(ordered))
	for i, s := range ordered {
		fields := make([]domain.PageSectionField, len(s.Fields))
		for j, f := range s.Fields {
			f.ID, f.SectionID, f.MediaURL = 0, 0, nil
			fields[j] = f
		}
		s.ID, s.PageID, s.SortOrder, s.Fields = 0, 0, i, fields
		out[i] = s
	}
	return out
}

// addPageRevision keeps the sections being saved as the page's newest
// revision, unless they match it already (a save with no changes). The
// first time a page gets a revision, what it held before is kept too, so
// the very first edit can be undone. Only the newest
// domain.MaxPageRevisions are kept.
func addPageRevision(ctx context.Context, tx *sql.Tx, pageID int64, previous, sections []domain.PageSection, revision *domain.PageRevision) error {
	encoded, err := json.Marshal(revisionSections(sections))
	if err != nil {
		return err
	}
	var latest []byte
	err = tx.QueryRowContext(ctx, `SELECT sections FROM page_revisions WHERE page_id = ? ORDER BY id DESC LIMIT 1`, pageID).Scan(&latest)
	switch {
	case err == sql.ErrNoRows:
		if len(previous) > 0 {
			original, err := json.Marshal(revisionSections(previous))
			if err != nil {
				return err
			}
			if !bytes.Equal(original, encoded) {
				if _, err := tx.ExecContext(ctx,
					`INSERT INTO page_revisions (page_id, sections, saved_by, source) VALUES (?, ?, NULL, ?)`,
					pageID, original, domain.PageRevisionOriginal,
				); err != nil {
					return err
				}
			}
		}
	case err != nil:
		return err
	case bytes.Equal(latest, encoded):
		return nil
	}
	if _, err := tx.ExecContext(ctx,
		`INSERT INTO page_revisions (page_id, sections, saved_by, source) VALUES (?, ?, ?, ?)`,
		pageID, encoded, revision.SavedByID, revision.Source,
	); err != nil {
		return err
	}
	// MariaDB can't LIMIT inside an IN subquery, hence the derived table.
	_, err = tx.ExecContext(ctx, `
		DELETE FROM page_revisions WHERE page_id = ? AND id NOT IN (
			SELECT id FROM (SELECT id FROM page_revisions WHERE page_id = ? ORDER BY id DESC LIMIT ?) AS keep
		)`, pageID, pageID, domain.MaxPageRevisions)
	return err
}

// ListRevisions returns a page's saved versions, newest first.
func (r *PageRepo) ListRevisions(ctx context.Context, pageID int64) ([]domain.PageRevision, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT rv.id, rv.page_id, rv.sections, rv.saved_by, COALESCE(u.full_name, ''), rv.source, rv.created_at
		FROM page_revisions rv LEFT JOIN admin_users u ON u.id = rv.saved_by
		WHERE rv.page_id = ? ORDER BY rv.id DESC`, pageID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var revisions []domain.PageRevision
	for rows.Next() {
		var rv domain.PageRevision
		var sections []byte
		if err := rows.Scan(&rv.ID, &rv.PageID, &sections, &rv.SavedByID, &rv.SavedByName, &rv.Source, &rv.CreatedAt); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(sections, &rv.Sections); err != nil {
			return nil, err
		}
		revisions = append(revisions, rv)
	}
	return revisions, rows.Err()
}

// FieldUsage is one field key as it's used by a block type across every
// stored page: its type, whether it repeats per item (itemIndex above 0),
// how many sections use it, and a short example value.
type FieldUsage struct {
	BlockType  string
	FieldKey   string
	FieldType  string
	Repeatable bool
	Sections   int
	Example    string
}

// FieldCatalog lists every block type's fields as they're actually used,
// which the Content API serves as its schema.
func (r *PageRepo) FieldCatalog(ctx context.Context) ([]FieldUsage, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT ps.block_type, psf.field_key, psf.field_type, MAX(psf.item_index) > 0, COUNT(DISTINCT ps.id),
			COALESCE(SUBSTRING(MIN(NULLIF(CASE WHEN psf.field_type = 'image' THEN '' ELSE psf.text_value END, '')), 1, 80), '')
		FROM page_section_fields psf JOIN page_sections ps ON ps.id = psf.section_id
		GROUP BY ps.block_type, psf.field_key, psf.field_type
		ORDER BY ps.block_type, MIN(psf.sort_order), psf.field_key`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []FieldUsage
	for rows.Next() {
		var u FieldUsage
		if err := rows.Scan(&u.BlockType, &u.FieldKey, &u.FieldType, &u.Repeatable, &u.Sections, &u.Example); err != nil {
			return nil, err
		}
		out = append(out, u)
	}
	return out, rows.Err()
}

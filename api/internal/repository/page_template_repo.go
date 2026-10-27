package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

// ListTemplates returns every section template with its section count and
// the distinct block types it holds (so the editor can hide templates that
// can't go where it is inserting, e.g. a container inside a container).
func (r *PageRepo) ListTemplates(ctx context.Context) ([]domain.SectionTemplate, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT p.id, p.title, p.updated_at, COUNT(s.id), COALESCE(GROUP_CONCAT(DISTINCT s.block_type), '')
		FROM pages p LEFT JOIN page_sections s ON s.page_id = p.id
		WHERE p.kind = 'template'
		GROUP BY p.id, p.title, p.updated_at
		ORDER BY p.title, p.id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	templates := []domain.SectionTemplate{}
	for rows.Next() {
		var t domain.SectionTemplate
		var blockTypes string
		if err := rows.Scan(&t.ID, &t.Name, &t.UpdatedAt, &t.SectionCount, &blockTypes); err != nil {
			return nil, err
		}
		t.BlockTypes = []string{}
		if blockTypes != "" {
			t.BlockTypes = strings.Split(blockTypes, ",")
		}
		templates = append(templates, t)
	}
	return templates, rows.Err()
}

func (r *PageRepo) TemplateExists(ctx context.Context, id int64) error {
	var found int64
	err := r.db.QueryRowContext(ctx, `SELECT id FROM pages WHERE id = ? AND kind = 'template'`, id).Scan(&found)
	if errors.Is(err, sql.ErrNoRows) {
		return ErrNotFound
	}
	return err
}

// CreatePreview stores a page's unsaved sections under a token hash until
// expiresAt, clearing out previews that have already expired.
func (r *PageRepo) CreatePreview(ctx context.Context, tokenHash string, pageID int64, sections []domain.PageSection, expiresAt time.Time) error {
	payload, err := json.Marshal(sections)
	if err != nil {
		return err
	}
	if _, err := r.db.ExecContext(ctx, `DELETE FROM page_previews WHERE expires_at < UTC_TIMESTAMP()`); err != nil {
		return err
	}
	_, err = r.db.ExecContext(ctx,
		`INSERT INTO page_previews (token_hash, page_id, sections, expires_at) VALUES (?, ?, ?, ?)`,
		tokenHash, pageID, string(payload), expiresAt.UTC().Format("2006-01-02 15:04:05"),
	)
	return err
}

// GetPreview returns an unexpired preview's page id and sections, with each
// image field's media URL filled in from the media library.
func (r *PageRepo) GetPreview(ctx context.Context, tokenHash string) (int64, []domain.PageSection, error) {
	var pageID int64
	var payload string
	err := r.db.QueryRowContext(ctx,
		`SELECT page_id, sections FROM page_previews WHERE token_hash = ? AND expires_at >= UTC_TIMESTAMP()`, tokenHash,
	).Scan(&pageID, &payload)
	if errors.Is(err, sql.ErrNoRows) {
		return 0, nil, ErrNotFound
	}
	if err != nil {
		return 0, nil, err
	}
	var sections []domain.PageSection
	if err := json.Unmarshal([]byte(payload), &sections); err != nil {
		return 0, nil, err
	}
	if err := r.fillMediaURLs(ctx, sections); err != nil {
		return 0, nil, err
	}
	return pageID, sections, nil
}

func (r *PageRepo) fillMediaURLs(ctx context.Context, sections []domain.PageSection) error {
	ids := []any{}
	seen := map[int64]bool{}
	for _, s := range sections {
		for _, f := range s.Fields {
			if f.MediaID != nil && !seen[*f.MediaID] {
				seen[*f.MediaID] = true
				ids = append(ids, *f.MediaID)
			}
		}
	}
	if len(ids) == 0 {
		return nil
	}
	placeholders := make([]string, len(ids))
	for i := range placeholders {
		placeholders[i] = "?"
	}
	rows, err := r.db.QueryContext(ctx, `SELECT id, url FROM media WHERE id IN (`+joinPlaceholders(placeholders)+`)`, ids...)
	if err != nil {
		return err
	}
	defer rows.Close()
	urls := map[int64]string{}
	for rows.Next() {
		var id int64
		var url string
		if err := rows.Scan(&id, &url); err != nil {
			return err
		}
		urls[id] = url
	}
	if err := rows.Err(); err != nil {
		return err
	}
	for i := range sections {
		for j := range sections[i].Fields {
			f := &sections[i].Fields[j]
			if f.MediaID == nil {
				continue
			}
			if url, ok := urls[*f.MediaID]; ok {
				f.MediaURL = &url
			}
		}
	}
	return nil
}

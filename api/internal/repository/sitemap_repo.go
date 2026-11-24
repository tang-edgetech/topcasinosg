package repository

import (
	"context"
	"database/sql"
	"errors"
	"strconv"
	"strings"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

// SitemapRepo reads what the sitemap can list and stores its settings and
// each item's include/exclude choice.
type SitemapRepo struct {
	db *sql.DB
}

func NewSitemapRepo(db *sql.DB) *SitemapRepo {
	return &SitemapRepo{db: db}
}

func (r *SitemapRepo) GetSettings(ctx context.Context) (*domain.SitemapSettings, error) {
	var (
		s     domain.SitemapSettings
		types string
		extra sql.NullString
	)
	err := r.db.QueryRowContext(ctx, `SELECT enabled, types, extra_urls, updated_at FROM sitemap_settings WHERE id = 1`).
		Scan(&s.Enabled, &types, &extra, &s.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return &domain.SitemapSettings{Enabled: true, Types: append([]string(nil), domain.SitemapTypes...)}, nil
	}
	if err != nil {
		return nil, err
	}
	s.Types = splitNonEmpty(types, ",")
	s.ExtraURLs = splitNonEmpty(extra.String, "\n")
	return &s, nil
}

func (r *SitemapRepo) SaveSettings(ctx context.Context, s *domain.SitemapSettings) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO sitemap_settings (id, enabled, types, extra_urls) VALUES (1, ?, ?, NULLIF(?, ''))
		ON DUPLICATE KEY UPDATE enabled = VALUES(enabled), types = VALUES(types), extra_urls = VALUES(extra_urls)`,
		s.Enabled, strings.Join(s.Types, ","), strings.Join(s.ExtraURLs, "\n"))
	return err
}

func splitNonEmpty(s, sep string) []string {
	var out []string
	for _, part := range strings.Split(s, sep) {
		if part = strings.TrimSpace(part); part != "" {
			out = append(out, part)
		}
	}
	return out
}

// SitemapKey is how item choices and noindex flags are keyed: "type:id".
func SitemapKey(entityType string, id int64) string {
	return entityType + ":" + strconv.FormatInt(id, 10)
}

// Modes returns every item's own choice, keyed by SitemapKey.
func (r *SitemapRepo) Modes(ctx context.Context) (map[string]string, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT entity_type, entity_id, mode FROM sitemap_entries`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := map[string]string{}
	for rows.Next() {
		var (
			t, mode string
			id      int64
		)
		if err := rows.Scan(&t, &id, &mode); err != nil {
			return nil, err
		}
		out[SitemapKey(t, id)] = mode
	}
	return out, rows.Err()
}

// SetMode stores an item's choice; "default" removes it.
func (r *SitemapRepo) SetMode(ctx context.Context, entityType string, id int64, mode string) error {
	if mode == domain.SitemapModeDefault {
		_, err := r.db.ExecContext(ctx, `DELETE FROM sitemap_entries WHERE entity_type = ? AND entity_id = ?`, entityType, id)
		return err
	}
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO sitemap_entries (entity_type, entity_id, mode) VALUES (?, ?, ?)
		ON DUPLICATE KEY UPDATE mode = VALUES(mode)`, entityType, id, mode)
	return err
}

// ItemExists checks a page, casino, guide, news article or bonus; the table
// name comes from the fixed seoEntityTables map, never from the request.
func (r *SitemapRepo) ItemExists(ctx context.Context, entityType string, id int64) error {
	table, ok := seoEntityTables[entityType]
	if !ok {
		return ErrNotFound
	}
	var found int64
	err := r.db.QueryRowContext(ctx, `SELECT id FROM `+table+` WHERE id = ?`, id).Scan(&found)
	if errors.Is(err, sql.ErrNoRows) {
		return ErrNotFound
	}
	return err
}

// Noindex returns the items set to "Hide from search results", keyed by
// SitemapKey.
func (r *SitemapRepo) Noindex(ctx context.Context) (map[string]bool, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT entity_type, entity_id FROM seo_meta WHERE robots_noindex = 1`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := map[string]bool{}
	for rows.Next() {
		var (
			t  string
			id int64
		)
		if err := rows.Scan(&t, &id); err != nil {
			return nil, err
		}
		out[SitemapKey(t, id)] = true
	}
	return out, rows.Err()
}

// RedirectedPaths returns the active redirects' old addresses, as
// NormalizeSitemapPath gives them (redirects ignore case and a trailing slash).
func (r *SitemapRepo) RedirectedPaths(ctx context.Context) (map[string]bool, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT from_path FROM redirects WHERE is_active = 1`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := map[string]bool{}
	for rows.Next() {
		var p string
		if err := rows.Scan(&p); err != nil {
			return nil, err
		}
		out[NormalizeSitemapPath(p)] = true
	}
	return out, rows.Err()
}

// NormalizeSitemapPath: lower case, no trailing slash ("/" stays "/").
func NormalizeSitemapPath(p string) string {
	p = strings.ToLower(strings.TrimSpace(p))
	if len(p) > 1 {
		p = strings.TrimRight(p, "/")
	}
	if p == "" {
		return "/"
	}
	return p
}

// SitemapPage is one page of the Pages tree.
type SitemapPage struct {
	ID        int64
	ParentID  *int64
	Slug      string
	Title     string
	Live      bool
	UpdatedAt time.Time
}

// Pages returns every page (not globals or templates), live or not: an
// unpublished page can still be part of a live page's address.
func (r *SitemapRepo) Pages(ctx context.Context) ([]SitemapPage, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, parent_id, slug, title, `+EffectivelyPublishedSQL+`, updated_at
		FROM pages WHERE kind = 'page' ORDER BY sort_order, id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []SitemapPage
	for rows.Next() {
		var p SitemapPage
		if err := rows.Scan(&p.ID, &p.ParentID, &p.Slug, &p.Title, &p.Live, &p.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

// SitemapRecord is one live casino, guide, news article or bonus.
type SitemapRecord struct {
	ID        int64
	Slug      string
	Name      string
	UpdatedAt time.Time
}

// sitemapRecordQueries: the live rows of each type. Guides and bonuses can
// have several rows with one slug (a version per region) that the website
// shows at the one address /guides/{slug} (or /bonuses/{slug}); the row
// without a region, else the oldest, stands for that address.
var sitemapRecordQueries = map[string]string{
	domain.SeoEntityCasino: `SELECT id, slug, name, updated_at FROM casinos WHERE ` + EffectivelyPublishedSQL + ` ORDER BY name, id`,
	domain.SeoEntityNews:   `SELECT id, slug, title, updated_at FROM news_articles WHERE ` + EffectivelyPublishedSQL + ` ORDER BY id`,
	domain.SeoEntityGuide:  `SELECT id, slug, title, updated_at FROM guides WHERE ` + EffectivelyPublishedSQL + ` ORDER BY region_id IS NOT NULL, id`,
	domain.SeoEntityBonus:  `SELECT id, slug, title, updated_at FROM bonuses WHERE ` + EffectivelyPublishedSQL + ` ORDER BY region_id IS NOT NULL, id`,
}

// Records returns the live items of one type, one per address, each with
// the newest date of the rows behind it.
func (r *SitemapRepo) Records(ctx context.Context, entityType string) ([]SitemapRecord, error) {
	query, ok := sitemapRecordQueries[entityType]
	if !ok {
		return nil, ErrNotFound
	}
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []SitemapRecord
	bySlug := map[string]int{}
	for rows.Next() {
		var rec SitemapRecord
		if err := rows.Scan(&rec.ID, &rec.Slug, &rec.Name, &rec.UpdatedAt); err != nil {
			return nil, err
		}
		if rec.Slug == "" {
			continue
		}
		if i, seen := bySlug[rec.Slug]; seen {
			if rec.UpdatedAt.After(out[i].UpdatedAt) {
				out[i].UpdatedAt = rec.UpdatedAt
			}
			continue
		}
		bySlug[rec.Slug] = len(out)
		out = append(out, rec)
	}
	return out, rows.Err()
}

// ListingUpdated returns when the content behind each fixed list page last
// changed, by listing id; missing when it has none.
func (r *SitemapRepo) ListingUpdated(ctx context.Context) (map[int64]time.Time, error) {
	queries := map[int64]string{
		1: `SELECT MAX(updated_at) FROM casinos WHERE ` + EffectivelyPublishedSQL,
		2: `SELECT MAX(updated_at) FROM guides WHERE ` + EffectivelyPublishedSQL,
		3: `SELECT MAX(updated_at) FROM news_articles WHERE ` + EffectivelyPublishedSQL,
		4: `SELECT MAX(updated_at) FROM blacklist_entries WHERE ` + EffectivelyPublishedSQL,
	}
	out := map[int64]time.Time{}
	for id, q := range queries {
		var t sql.NullTime
		if err := r.db.QueryRowContext(ctx, q).Scan(&t); err != nil {
			return nil, err
		}
		if t.Valid {
			out[id] = t.Time
		}
	}
	return out, nil
}

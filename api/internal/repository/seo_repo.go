package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type SeoRepo struct {
	db *sql.DB
}

func NewSeoRepo(db *sql.DB) *SeoRepo {
	return &SeoRepo{db: db}
}

// Get returns an item's SEO overrides, or an empty SeoMeta when it has none.
func (r *SeoRepo) Get(ctx context.Context, entityType string, entityID int64) (*domain.SeoMeta, error) {
	m := domain.SeoMeta{EntityType: entityType, EntityID: entityID}
	err := r.db.QueryRowContext(ctx, `
		SELECT s.meta_title, s.meta_description, s.keywords, s.og_title, s.og_description, s.og_image_media_id, media.url,
			s.canonical_url, s.robots_noindex, s.robots_nofollow, s.article_author
		FROM seo_meta s LEFT JOIN media ON media.id = s.og_image_media_id
		WHERE s.entity_type = ? AND s.entity_id = ?`, entityType, entityID,
	).Scan(&m.MetaTitle, &m.MetaDescription, &m.Keywords, &m.OGTitle, &m.OGDescription, &m.OGImageMediaID, &m.OGImageURL,
		&m.CanonicalURL, &m.RobotsNoindex, &m.RobotsNofollow, &m.ArticleAuthor)
	if errors.Is(err, sql.ErrNoRows) {
		return &m, nil
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *SeoRepo) Upsert(ctx context.Context, m *domain.SeoMeta) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO seo_meta (entity_type, entity_id, meta_title, meta_description, keywords, og_title, og_description,
			og_image_media_id, canonical_url, robots_noindex, robots_nofollow, article_author)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			meta_title = VALUES(meta_title), meta_description = VALUES(meta_description), keywords = VALUES(keywords),
			og_title = VALUES(og_title), og_description = VALUES(og_description), og_image_media_id = VALUES(og_image_media_id),
			canonical_url = VALUES(canonical_url), robots_noindex = VALUES(robots_noindex),
			robots_nofollow = VALUES(robots_nofollow), article_author = VALUES(article_author)`,
		m.EntityType, m.EntityID, m.MetaTitle, m.MetaDescription, m.Keywords, m.OGTitle, m.OGDescription,
		m.OGImageMediaID, m.CanonicalURL, m.RobotsNoindex, m.RobotsNofollow, m.ArticleAuthor,
	)
	return err
}

// deleteSeoMeta removes an item's SEO row; each content type's Delete calls
// it, since (entity_type, entity_id) can't be a foreign key.
func deleteSeoMeta(ctx context.Context, exec interface {
	ExecContext(context.Context, string, ...any) (sql.Result, error)
}, entityType string, entityID int64) error {
	_, err := exec.ExecContext(ctx, `DELETE FROM seo_meta WHERE entity_type = ? AND entity_id = ?`, entityType, entityID)
	return err
}

var seoEntityTables = map[string]string{
	domain.SeoEntityPage:   "pages",
	domain.SeoEntityCasino: "casinos",
	domain.SeoEntityGuide:  "guides",
	domain.SeoEntityNews:   "news_articles",
	domain.SeoEntityBonus:  "bonuses",
}

// EntityExists checks the item an SEO row belongs to; the table name comes
// from the fixed map above, never from the request.
func (r *SeoRepo) EntityExists(ctx context.Context, entityType string, entityID int64) error {
	table, ok := seoEntityTables[entityType]
	if !ok {
		return ErrNotFound
	}
	var found int64
	err := r.db.QueryRowContext(ctx, `SELECT id FROM `+table+` WHERE id = ?`, entityID).Scan(&found)
	if errors.Is(err, sql.ErrNoRows) {
		return ErrNotFound
	}
	return err
}

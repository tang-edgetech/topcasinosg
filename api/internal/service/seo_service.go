package service

import (
	"context"
	"errors"
	"strings"
	"unicode/utf8"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

var (
	ErrInvalidSeoEntity    = errors.New("SEO settings are only available for pages, casinos, guides, news and bonuses")
	ErrInvalidCanonicalURL = errors.New("canonical URL must be a full http(s) address or a path starting with /")
	ErrSeoFieldTooLong     = errors.New("one of the SEO fields is too long")
)

const (
	seoTitleMaxLength       = 255
	seoDescriptionMaxLength = 500
	seoKeywordsMaxLength    = 500
	seoURLMaxLength         = 500
	seoAuthorMaxLength      = 150
)

// SeoService manages per-item SEO and social sharing overrides. Anyone who
// can edit the content can edit its SEO (same tier as the item itself).
type SeoService struct {
	seo *repository.SeoRepo
}

func NewSeoService(seo *repository.SeoRepo) *SeoService {
	return &SeoService{seo: seo}
}

func isSeoEntityType(entityType string) bool {
	for _, t := range domain.SeoEntityTypes {
		if t == entityType {
			return true
		}
	}
	return false
}

func (s *SeoService) Get(ctx context.Context, entityType string, entityID int64) (*domain.SeoMeta, error) {
	if !isSeoEntityType(entityType) {
		return nil, ErrInvalidSeoEntity
	}
	return s.seo.Get(ctx, entityType, entityID)
}

// Save validates and stores an item's SEO overrides (trimmed; empty means
// "use the default"). The item itself must exist.
func (s *SeoService) Save(ctx context.Context, m *domain.SeoMeta) error {
	if !isSeoEntityType(m.EntityType) {
		return ErrInvalidSeoEntity
	}
	if err := s.seo.EntityExists(ctx, m.EntityType, m.EntityID); err != nil {
		return err
	}
	fields := []*string{&m.MetaTitle, &m.MetaDescription, &m.Keywords, &m.OGTitle, &m.OGDescription, &m.CanonicalURL, &m.ArticleAuthor}
	for _, f := range fields {
		*f = strings.TrimSpace(*f)
	}
	limits := map[*string]int{
		&m.MetaTitle: seoTitleMaxLength, &m.MetaDescription: seoDescriptionMaxLength, &m.Keywords: seoKeywordsMaxLength,
		&m.OGTitle: seoTitleMaxLength, &m.OGDescription: seoDescriptionMaxLength, &m.CanonicalURL: seoURLMaxLength,
		&m.ArticleAuthor: seoAuthorMaxLength,
	}
	for f, max := range limits {
		if utf8.RuneCountInString(*f) > max {
			return ErrSeoFieldTooLong
		}
	}
	if m.CanonicalURL != "" && !isWebURL(m.CanonicalURL) && !(strings.HasPrefix(m.CanonicalURL, "/") && !strings.HasPrefix(m.CanonicalURL, "//")) {
		return ErrInvalidCanonicalURL
	}
	return s.seo.Upsert(ctx, m)
}

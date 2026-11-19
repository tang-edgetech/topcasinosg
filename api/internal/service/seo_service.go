package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"unicode/utf8"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

var (
	ErrInvalidSeoEntity    = errors.New("SEO settings are only available for pages, casinos, guides, news and bonuses")
	ErrInvalidCanonicalURL = errors.New("canonical URL must be a full http(s) address or a path starting with /")
	ErrSeoFieldTooLong     = errors.New("one of the SEO fields is too long")
	// ErrInvalidSchemaJSON is wrapped with what is wrong.
	ErrInvalidSchemaJSON = errors.New("the Schema box must hold valid JSON-LD")
)

const (
	seoTitleMaxLength       = 255
	seoDescriptionMaxLength = 500
	seoKeywordsMaxLength    = 500
	seoURLMaxLength         = 500
	seoAuthorMaxLength      = 150
	seoSchemaMaxBytes       = 100_000
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
	schema, err := NormalizeSchemaJSON(m.SchemaJSON)
	if err != nil {
		return err
	}
	m.SchemaJSON = schema
	if m.CanonicalURL != "" && !isWebURL(m.CanonicalURL) && !(strings.HasPrefix(m.CanonicalURL, "/") && !strings.HasPrefix(m.CanonicalURL, "//")) {
		return ErrInvalidCanonicalURL
	}
	return s.seo.Upsert(ctx, m)
}

// A pasted <script type="application/ld+json"> … </script> wrapper.
var schemaScriptTag = regexp.MustCompile(`(?is)^<script[^>]*>(.*)</script>$`)

// NormalizeSchemaJSON checks the Schema box: empty, or schema.org JSON-LD as
// one object or an array of objects. A <script> wrapper around it, as
// schema generators often give it, is taken off. Returned trimmed, as typed
// (so the admin sees their own layout again).
func NormalizeSchemaJSON(raw string) (string, error) {
	s := strings.TrimSpace(raw)
	if m := schemaScriptTag.FindStringSubmatch(s); m != nil {
		s = strings.TrimSpace(m[1])
	}
	if s == "" {
		return "", nil
	}
	if len(s) > seoSchemaMaxBytes {
		return "", fmt.Errorf("%w: it is longer than %d characters", ErrInvalidSchemaJSON, seoSchemaMaxBytes)
	}
	var v any
	dec := json.NewDecoder(strings.NewReader(s))
	if err := dec.Decode(&v); err != nil {
		var syntax *json.SyntaxError
		if errors.As(err, &syntax) {
			line := 1 + strings.Count(s[:min(int(syntax.Offset), len(s))], "\n")
			return "", fmt.Errorf("%w: %s (line %d)", ErrInvalidSchemaJSON, syntax.Error(), line)
		}
		return "", fmt.Errorf("%w: %s", ErrInvalidSchemaJSON, err.Error())
	}
	if dec.More() {
		return "", fmt.Errorf("%w: there is more than one JSON value; put several schemas in one [ … ] list", ErrInvalidSchemaJSON)
	}
	switch val := v.(type) {
	case map[string]any:
	case []any:
		for _, item := range val {
			if _, ok := item.(map[string]any); !ok {
				return "", fmt.Errorf("%w: every item in the [ … ] list must be a { … } object", ErrInvalidSchemaJSON)
			}
		}
	default:
		return "", fmt.Errorf("%w: it must be a { … } object or a [ … ] list of them", ErrInvalidSchemaJSON)
	}
	return s, nil
}

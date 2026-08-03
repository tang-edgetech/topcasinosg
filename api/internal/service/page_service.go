package service

import (
	"context"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

// PageService manages the flexible block-based page builder (Homepage,
// About, ...). Content-management roles (Super Admin, Admin, Editor) can all
// edit pages, same tier as Casinos/Guides/News — a page is content, not
// site-structural config like Regions or Navigation.
type PageService struct {
	pages *repository.PageRepo
}

func NewPageService(pages *repository.PageRepo) *PageService {
	return &PageService{pages: pages}
}

func (s *PageService) List(ctx context.Context) ([]domain.Page, error) {
	return s.pages.List(ctx)
}

func (s *PageService) GetByID(ctx context.Context, id int64) (*domain.Page, error) {
	return s.pages.GetByID(ctx, id)
}

func (s *PageService) GetPublishedBySlug(ctx context.Context, slug string) (*domain.Page, error) {
	return s.pages.GetPublishedBySlug(ctx, slug)
}

func (s *PageService) Sections(ctx context.Context, pageID int64) ([]domain.PageSection, error) {
	return s.pages.GetSectionsWithFields(ctx, pageID)
}

type PageInput struct {
	Slug            string
	Title           string
	MetaTitle       string
	MetaDescription string
}

func (s *PageService) Create(ctx context.Context, in PageInput) (*domain.Page, error) {
	exists, err := s.pages.ExistsSlug(ctx, in.Slug, 0)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrAlreadyExists
	}
	id, err := s.pages.Create(ctx, &domain.Page{
		Slug: in.Slug, Title: in.Title, MetaTitle: in.MetaTitle, MetaDescription: in.MetaDescription,
		Status: domain.ContentStatusDraft,
	})
	if err != nil {
		return nil, err
	}
	return s.pages.GetByID(ctx, id)
}

// Update is the "Page Details" tab's save — title + slug. The Homepage's
// slug must stay "home" (the public site's / route looks it up by that
// exact slug) — enforced here, not just client-side, since this is a
// contentStaff-reachable endpoint.
func (s *PageService) Update(ctx context.Context, id int64, in PageInput) error {
	current, err := s.pages.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if current.Slug == "home" && in.Slug != "home" {
		return ErrHomeSlugLocked
	}
	exists, err := s.pages.ExistsSlug(ctx, in.Slug, id)
	if err != nil {
		return err
	}
	if exists {
		return ErrAlreadyExists
	}
	return s.pages.UpdateDetails(ctx, id, in.Title, in.Slug)
}

type SEOInput struct {
	MetaTitle       string
	MetaDescription string
}

func (s *PageService) UpdateSEO(ctx context.Context, id int64, in SEOInput) error {
	return s.pages.UpdateSEO(ctx, id, in.MetaTitle, in.MetaDescription)
}

type SnippetsInput struct {
	HeadSnippet   string
	BodySnippet   string
	FooterSnippet string
}

func (s *PageService) UpdateSnippets(ctx context.Context, id int64, in SnippetsInput) error {
	return s.pages.UpdateSnippets(ctx, id, in.HeadSnippet, in.BodySnippet, in.FooterSnippet)
}

func (s *PageService) SetStatus(ctx context.Context, id int64, status domain.ContentStatus, publishAt *time.Time) error {
	if !status.Valid() {
		return ErrInvalidContentStatus
	}
	if status == domain.ContentStatusScheduled && publishAt == nil {
		return ErrPublishAtRequired
	}
	var publishAtStr *string
	if publishAt != nil {
		v := publishAt.UTC().Format("2006-01-02 15:04:05")
		publishAtStr = &v
	}
	return s.pages.SetStatus(ctx, id, status, publishAtStr)
}

func (s *PageService) Delete(ctx context.Context, id int64) error {
	return s.pages.Delete(ctx, id)
}

// ReplaceSections validates the whole submitted block tree before writing
// anything — an unknown field_type/empty block_type fails the entire save
// rather than silently persisting a section the frontend won't know how to
// render.
func (s *PageService) ReplaceSections(ctx context.Context, pageID int64, sections []domain.PageSection) error {
	for i := range sections {
		if !isKnownBlockType(sections[i].BlockType) {
			return ErrInvalidBlockType
		}
		for j := range sections[i].Fields {
			if !isKnownFieldType(sections[i].Fields[j].FieldType) {
				return ErrInvalidFieldType
			}
		}
	}
	return s.pages.ReplaceSections(ctx, pageID, sections)
}

func isKnownBlockType(t string) bool {
	for _, known := range domain.KnownBlockTypes {
		if t == known {
			return true
		}
	}
	return false
}

func isKnownFieldType(t string) bool {
	switch t {
	case "text", "richtext", "image", "button":
		return true
	default:
		return false
	}
}

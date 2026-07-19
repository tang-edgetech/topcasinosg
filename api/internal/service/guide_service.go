package service

import (
	"context"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

// GuideService — any content-management role (including Editor) may
// create/edit, matching "Editor: add/edit/delete contents".
type GuideService struct {
	guides *repository.GuideRepo
}

func NewGuideService(guides *repository.GuideRepo) *GuideService {
	return &GuideService{guides: guides}
}

type GuideInput struct {
	RegionID     *int64
	Title        string
	Slug         string
	CoverMediaID *int64
	Excerpt      string
	Content      string
}

func (s *GuideService) Create(ctx context.Context, actor *domain.AdminUser, in GuideInput) (*domain.Guide, error) {
	exists, err := s.guides.ExistsSlug(ctx, in.Slug, 0)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrAlreadyExists
	}

	actorID := actor.ID
	g := &domain.Guide{
		RegionID: in.RegionID, Title: in.Title, Slug: in.Slug, CoverMediaID: in.CoverMediaID, Excerpt: in.Excerpt,
		Content: in.Content, Status: domain.ContentStatusDraft, CreatedBy: &actorID,
	}
	id, err := s.guides.Create(ctx, g)
	if err != nil {
		return nil, err
	}
	return s.guides.GetByID(ctx, id)
}

func (s *GuideService) Update(ctx context.Context, id int64, in GuideInput) error {
	exists, err := s.guides.ExistsSlug(ctx, in.Slug, id)
	if err != nil {
		return err
	}
	if exists {
		return ErrAlreadyExists
	}
	return s.guides.Update(ctx, &domain.Guide{
		ID: id, RegionID: in.RegionID, Title: in.Title, Slug: in.Slug, CoverMediaID: in.CoverMediaID,
		Excerpt: in.Excerpt, Content: in.Content,
	})
}

func (s *GuideService) Get(ctx context.Context, id int64) (*domain.Guide, error) {
	return s.guides.GetByID(ctx, id)
}

func (s *GuideService) GetPublishedBySlug(ctx context.Context, slug string) (*domain.Guide, error) {
	return s.guides.GetPublishedBySlug(ctx, slug)
}

func (s *GuideService) ListAdmin(ctx context.Context, regionID *int64, page, pageSize int) ([]domain.Guide, int, error) {
	page, pageSize = normalizePaging(page, pageSize)
	return s.guides.ListAdmin(ctx, regionID, pageSize, (page-1)*pageSize)
}

func (s *GuideService) ListPublished(ctx context.Context, regionCode *string, page, pageSize int) ([]domain.Guide, int, error) {
	page, pageSize = normalizePaging(page, pageSize)
	return s.guides.ListPublished(ctx, regionCode, pageSize, (page-1)*pageSize)
}

func (s *GuideService) SetStatus(ctx context.Context, id int64, status domain.ContentStatus, publishAt *time.Time) error {
	if !status.Valid() {
		return ErrInvalidContentStatus
	}
	if status == domain.ContentStatusScheduled && publishAt == nil {
		return ErrPublishAtRequired
	}
	var publishAtStr *string
	if publishAt != nil {
		s := publishAt.UTC().Format("2006-01-02 15:04:05")
		publishAtStr = &s
	}
	return s.guides.SetStatus(ctx, id, status, publishAtStr)
}

func (s *GuideService) Delete(ctx context.Context, id int64) error {
	return s.guides.Delete(ctx, id)
}

package service

import (
	"context"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

// NewsArticleService — any content-management role (including Editor) may
// create/edit, matching "Editor: add/edit/delete contents".
type NewsArticleService struct {
	news *repository.NewsArticleRepo
}

func NewNewsArticleService(news *repository.NewsArticleRepo) *NewsArticleService {
	return &NewsArticleService{news: news}
}

type NewsArticleInput struct {
	Title        string
	Slug         string
	CoverMediaID *int64
	Excerpt      string
	Content      string
}

func (s *NewsArticleService) Create(ctx context.Context, actor *domain.AdminUser, in NewsArticleInput) (*domain.NewsArticle, error) {
	exists, err := s.news.ExistsSlug(ctx, in.Slug, 0)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrAlreadyExists
	}

	actorID := actor.ID
	n := &domain.NewsArticle{
		Title: in.Title, Slug: in.Slug, CoverMediaID: in.CoverMediaID, Excerpt: in.Excerpt, Content: in.Content,
		Status: domain.ContentStatusDraft, CreatedBy: &actorID,
	}
	id, err := s.news.Create(ctx, n)
	if err != nil {
		return nil, err
	}
	return s.news.GetByID(ctx, id)
}

func (s *NewsArticleService) Update(ctx context.Context, id int64, in NewsArticleInput) error {
	exists, err := s.news.ExistsSlug(ctx, in.Slug, id)
	if err != nil {
		return err
	}
	if exists {
		return ErrAlreadyExists
	}
	return s.news.Update(ctx, &domain.NewsArticle{
		ID: id, Title: in.Title, Slug: in.Slug, CoverMediaID: in.CoverMediaID, Excerpt: in.Excerpt, Content: in.Content,
	})
}

func (s *NewsArticleService) Get(ctx context.Context, id int64) (*domain.NewsArticle, error) {
	return s.news.GetByID(ctx, id)
}

func (s *NewsArticleService) GetPublishedBySlug(ctx context.Context, slug string) (*domain.NewsArticle, error) {
	return s.news.GetPublishedBySlug(ctx, slug)
}

func (s *NewsArticleService) ListAdmin(ctx context.Context, page, pageSize int) ([]domain.NewsArticle, int, error) {
	page, pageSize = normalizePaging(page, pageSize)
	return s.news.ListAdmin(ctx, pageSize, (page-1)*pageSize)
}

func (s *NewsArticleService) ListPublished(ctx context.Context, page, pageSize int) ([]domain.NewsArticle, int, error) {
	page, pageSize = normalizePaging(page, pageSize)
	return s.news.ListPublished(ctx, pageSize, (page-1)*pageSize)
}

func (s *NewsArticleService) SetStatus(ctx context.Context, id int64, status domain.ContentStatus, publishAt *time.Time) error {
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
	return s.news.SetStatus(ctx, id, status, publishAtStr)
}

func (s *NewsArticleService) Delete(ctx context.Context, id int64) error {
	return s.news.Delete(ctx, id)
}

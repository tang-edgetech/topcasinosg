package service

import (
	"context"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

// CasinoService — any content-management role (including Editor) may
// create/edit, matching "Editor: add/edit/delete contents".
type CasinoService struct {
	casinos *repository.CasinoRepo
}

func NewCasinoService(casinos *repository.CasinoRepo) *CasinoService {
	return &CasinoService{casinos: casinos}
}

type CasinoInput struct {
	Slug           string
	Name           string
	LogoMediaID    *int64
	Rating         float64
	Summary        string
	Content        string
	Languages      []string
	PaymentMethods []string
	PayoutSpeed    string
	CTAURL         string
	RegionIDs      []int64
}

func (s *CasinoService) Create(ctx context.Context, actor *domain.AdminUser, in CasinoInput) (*domain.Casino, error) {
	exists, err := s.casinos.ExistsSlug(ctx, in.Slug, 0)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrAlreadyExists
	}

	actorID := actor.ID
	c := &domain.Casino{
		Slug: in.Slug, Name: in.Name, LogoMediaID: in.LogoMediaID, Rating: in.Rating, Summary: in.Summary,
		Content: in.Content, Languages: in.Languages, PaymentMethods: in.PaymentMethods, PayoutSpeed: in.PayoutSpeed,
		CTAURL: in.CTAURL, Status: domain.ContentStatusDraft, CreatedBy: &actorID, RegionIDs: in.RegionIDs,
	}
	id, err := s.casinos.Create(ctx, c)
	if err != nil {
		return nil, err
	}
	return s.casinos.GetByID(ctx, id)
}

func (s *CasinoService) Update(ctx context.Context, id int64, in CasinoInput) error {
	exists, err := s.casinos.ExistsSlug(ctx, in.Slug, id)
	if err != nil {
		return err
	}
	if exists {
		return ErrAlreadyExists
	}
	return s.casinos.Update(ctx, &domain.Casino{
		ID: id, Slug: in.Slug, Name: in.Name, LogoMediaID: in.LogoMediaID, Rating: in.Rating, Summary: in.Summary,
		Content: in.Content, Languages: in.Languages, PaymentMethods: in.PaymentMethods, PayoutSpeed: in.PayoutSpeed,
		CTAURL: in.CTAURL, RegionIDs: in.RegionIDs,
	})
}

func (s *CasinoService) Get(ctx context.Context, id int64) (*domain.Casino, error) {
	return s.casinos.GetByID(ctx, id)
}

func (s *CasinoService) GetPublishedBySlug(ctx context.Context, slug string) (*domain.Casino, error) {
	return s.casinos.GetPublishedBySlug(ctx, slug)
}

func (s *CasinoService) ListAdmin(ctx context.Context, page, pageSize int) ([]domain.Casino, int, error) {
	page, pageSize = normalizePaging(page, pageSize)
	return s.casinos.ListAdmin(ctx, pageSize, (page-1)*pageSize)
}

func (s *CasinoService) ListPublished(ctx context.Context, regionCode *string, page, pageSize int) ([]domain.Casino, int, error) {
	page, pageSize = normalizePaging(page, pageSize)
	return s.casinos.ListPublished(ctx, regionCode, pageSize, (page-1)*pageSize)
}

func (s *CasinoService) SetStatus(ctx context.Context, id int64, status domain.ContentStatus, publishAt *time.Time) error {
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
	return s.casinos.SetStatus(ctx, id, status, publishAtStr)
}

func (s *CasinoService) Delete(ctx context.Context, id int64) error {
	return s.casinos.Delete(ctx, id)
}

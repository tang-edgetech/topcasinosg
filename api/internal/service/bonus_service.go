package service

import (
	"context"
	"errors"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

var ErrInvalidBonusType = errors.New("invalid bonus type")

// BonusService — any content-management role may create/edit (Editors
// included), same as Casinos.
type BonusService struct {
	bonuses *repository.BonusRepo
}

func NewBonusService(bonuses *repository.BonusRepo) *BonusService {
	return &BonusService{bonuses: bonuses}
}

type BonusInput struct {
	RegionID   int64
	CasinoID   *int64
	BonusType  domain.BonusType
	Title      string
	Terms      string
	Code       *string
	ValidFrom  *time.Time
	ValidUntil *time.Time
}

func (s *BonusService) Create(ctx context.Context, actor *domain.AdminUser, in BonusInput) (*domain.Bonus, error) {
	if !in.BonusType.Valid() {
		return nil, ErrInvalidBonusType
	}
	actorID := actor.ID
	b := &domain.Bonus{
		RegionID: in.RegionID, CasinoID: in.CasinoID, BonusType: in.BonusType, Title: in.Title, Terms: in.Terms,
		Code: in.Code, ValidFrom: in.ValidFrom, ValidUntil: in.ValidUntil, Status: domain.ContentStatusDraft, CreatedBy: &actorID,
	}
	id, err := s.bonuses.Create(ctx, b)
	if err != nil {
		return nil, err
	}
	return s.bonuses.GetByID(ctx, id)
}

func (s *BonusService) Update(ctx context.Context, id int64, in BonusInput) error {
	if !in.BonusType.Valid() {
		return ErrInvalidBonusType
	}
	return s.bonuses.Update(ctx, &domain.Bonus{
		ID: id, RegionID: in.RegionID, CasinoID: in.CasinoID, BonusType: in.BonusType, Title: in.Title,
		Terms: in.Terms, Code: in.Code, ValidFrom: in.ValidFrom, ValidUntil: in.ValidUntil,
	})
}

func (s *BonusService) Get(ctx context.Context, id int64) (*domain.Bonus, error) {
	return s.bonuses.GetByID(ctx, id)
}

func (s *BonusService) ListAdmin(ctx context.Context, regionID *int64, page, pageSize int) ([]domain.Bonus, int, error) {
	page, pageSize = normalizePaging(page, pageSize)
	return s.bonuses.ListAdmin(ctx, regionID, pageSize, (page-1)*pageSize)
}

func (s *BonusService) ListPublished(ctx context.Context, regionCode string, page, pageSize int) ([]domain.Bonus, int, error) {
	page, pageSize = normalizePaging(page, pageSize)
	return s.bonuses.ListPublished(ctx, regionCode, pageSize, (page-1)*pageSize)
}

func (s *BonusService) ListPublishedByCasino(ctx context.Context, casinoID int64, page, pageSize int) ([]domain.Bonus, int, error) {
	page, pageSize = normalizePaging(page, pageSize)
	return s.bonuses.ListPublishedByCasino(ctx, casinoID, pageSize, (page-1)*pageSize)
}

func (s *BonusService) SetStatus(ctx context.Context, id int64, status domain.ContentStatus, publishAt *time.Time) error {
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
	return s.bonuses.SetStatus(ctx, id, status, publishAtStr)
}

func (s *BonusService) Delete(ctx context.Context, id int64) error {
	return s.bonuses.Delete(ctx, id)
}

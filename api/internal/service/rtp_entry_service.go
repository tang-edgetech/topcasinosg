package service

import (
	"context"
	"errors"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

var ErrInvalidRTPCategory = errors.New("invalid rtp category")

// RTPEntryService — any content-management role may create/edit (Editors
// included), same as Bonuses/Casinos.
type RTPEntryService struct {
	entries *repository.RTPEntryRepo
}

func NewRTPEntryService(entries *repository.RTPEntryRepo) *RTPEntryService {
	return &RTPEntryService{entries: entries}
}

type RTPEntryInput struct {
	RegionID      int64
	CasinoID      *int64
	GameName      string
	Category      domain.RTPCategory
	RTPPercentage float64
}

func (s *RTPEntryService) Create(ctx context.Context, actor *domain.AdminUser, in RTPEntryInput) (*domain.RTPEntry, error) {
	if !in.Category.Valid() {
		return nil, ErrInvalidRTPCategory
	}
	actorID := actor.ID
	e := &domain.RTPEntry{
		RegionID: in.RegionID, CasinoID: in.CasinoID, GameName: in.GameName, Category: in.Category,
		RTPPercentage: in.RTPPercentage, Status: domain.ContentStatusDraft, CreatedBy: &actorID,
	}
	id, err := s.entries.Create(ctx, e)
	if err != nil {
		return nil, err
	}
	return s.entries.GetByID(ctx, id)
}

func (s *RTPEntryService) Update(ctx context.Context, id int64, in RTPEntryInput) error {
	if !in.Category.Valid() {
		return ErrInvalidRTPCategory
	}
	return s.entries.Update(ctx, &domain.RTPEntry{
		ID: id, RegionID: in.RegionID, CasinoID: in.CasinoID, GameName: in.GameName, Category: in.Category,
		RTPPercentage: in.RTPPercentage,
	})
}

func (s *RTPEntryService) Get(ctx context.Context, id int64) (*domain.RTPEntry, error) {
	return s.entries.GetByID(ctx, id)
}

func (s *RTPEntryService) ListAdmin(ctx context.Context, regionID *int64, page, pageSize int) ([]domain.RTPEntry, int, error) {
	page, pageSize = normalizePaging(page, pageSize)
	return s.entries.ListAdmin(ctx, regionID, pageSize, (page-1)*pageSize)
}

func (s *RTPEntryService) ListPublished(ctx context.Context, regionCode string, page, pageSize int) ([]domain.RTPEntry, int, error) {
	page, pageSize = normalizePaging(page, pageSize)
	return s.entries.ListPublished(ctx, regionCode, pageSize, (page-1)*pageSize)
}

func (s *RTPEntryService) SetStatus(ctx context.Context, id int64, status domain.ContentStatus, publishAt *time.Time) error {
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
	return s.entries.SetStatus(ctx, id, status, publishAtStr)
}

func (s *RTPEntryService) Delete(ctx context.Context, id int64) error {
	return s.entries.Delete(ctx, id)
}

package service

import (
	"context"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

// BlacklistEntryService — any content-management role may create/edit
// (Editors included), same as Bonuses/Casinos.
type BlacklistEntryService struct {
	entries *repository.BlacklistEntryRepo
}

func NewBlacklistEntryService(entries *repository.BlacklistEntryRepo) *BlacklistEntryService {
	return &BlacklistEntryService{entries: entries}
}

type BlacklistEntryInput struct {
	RegionID *int64
	Name     string
	Reason   string
	Details  string
}

func (s *BlacklistEntryService) Create(ctx context.Context, actor *domain.AdminUser, in BlacklistEntryInput) (*domain.BlacklistEntry, error) {
	actorID := actor.ID
	e := &domain.BlacklistEntry{
		RegionID: in.RegionID, Name: in.Name, Reason: in.Reason, Details: in.Details,
		Status: domain.ContentStatusDraft, CreatedBy: &actorID,
	}
	id, err := s.entries.Create(ctx, e)
	if err != nil {
		return nil, err
	}
	return s.entries.GetByID(ctx, id)
}

func (s *BlacklistEntryService) Update(ctx context.Context, id int64, in BlacklistEntryInput) error {
	return s.entries.Update(ctx, &domain.BlacklistEntry{
		ID: id, RegionID: in.RegionID, Name: in.Name, Reason: in.Reason, Details: in.Details,
	})
}

func (s *BlacklistEntryService) Get(ctx context.Context, id int64) (*domain.BlacklistEntry, error) {
	return s.entries.GetByID(ctx, id)
}

func (s *BlacklistEntryService) ListAdmin(ctx context.Context, regionID *int64, page, pageSize int) ([]domain.BlacklistEntry, int, error) {
	page, pageSize = normalizePaging(page, pageSize)
	return s.entries.ListAdmin(ctx, regionID, pageSize, (page-1)*pageSize)
}

func (s *BlacklistEntryService) ListPublished(ctx context.Context, regionCode *string, page, pageSize int) ([]domain.BlacklistEntry, int, error) {
	page, pageSize = normalizePaging(page, pageSize)
	return s.entries.ListPublished(ctx, regionCode, pageSize, (page-1)*pageSize)
}

func (s *BlacklistEntryService) SetStatus(ctx context.Context, id int64, status domain.ContentStatus, publishAt *time.Time) error {
	if !status.Valid() {
		return ErrInvalidContentStatus
	}
	if status == domain.ContentStatusScheduled && publishAt == nil {
		return ErrPublishAtRequired
	}
	var publishAtStr *string
	if publishAt != nil {
		formatted := publishAt.UTC().Format("2006-01-02 15:04:05")
		publishAtStr = &formatted
	}
	return s.entries.SetStatus(ctx, id, status, publishAtStr)
}

func (s *BlacklistEntryService) Delete(ctx context.Context, id int64) error {
	return s.entries.Delete(ctx, id)
}

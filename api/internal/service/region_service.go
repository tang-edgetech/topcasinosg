package service

import (
	"context"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

// RegionService — reads are open to any content-management role (Editors
// need to pick a region when adding a Bonus/Guide/etc.); structural changes
// (create/rename/activate) are Super Admin + Admin only, same tier as site
// settings, since a region affects site structure, not just one piece of
// content.
type RegionService struct {
	regions *repository.RegionRepo
}

func NewRegionService(regions *repository.RegionRepo) *RegionService {
	return &RegionService{regions: regions}
}

func (s *RegionService) List(ctx context.Context) ([]domain.Region, error) {
	return s.regions.List(ctx)
}

func (s *RegionService) ListActive(ctx context.Context) ([]domain.Region, error) {
	return s.regions.ListActive(ctx)
}

func (s *RegionService) GetByCode(ctx context.Context, code string) (*domain.Region, error) {
	return s.regions.GetByCode(ctx, code)
}

func requireManageRole(actor *domain.AdminUser) error {
	if actor.Role != domain.RoleSuperAdmin && actor.Role != domain.RoleAdmin {
		return ErrForbidden
	}
	return nil
}

func (s *RegionService) Create(ctx context.Context, actor *domain.AdminUser, code, name string, flagMediaID *int64, sortOrder int) (*domain.Region, error) {
	if err := requireManageRole(actor); err != nil {
		return nil, err
	}
	exists, err := s.regions.ExistsCode(ctx, code, 0)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrAlreadyExists
	}
	id, err := s.regions.Create(ctx, &domain.Region{Code: code, Name: name, FlagMediaID: flagMediaID, SortOrder: sortOrder})
	if err != nil {
		return nil, err
	}
	return s.regions.GetByID(ctx, id)
}

func (s *RegionService) Update(ctx context.Context, actor *domain.AdminUser, id int64, code, name string, flagMediaID *int64, sortOrder int) error {
	if err := requireManageRole(actor); err != nil {
		return err
	}
	exists, err := s.regions.ExistsCode(ctx, code, id)
	if err != nil {
		return err
	}
	if exists {
		return ErrAlreadyExists
	}
	return s.regions.Update(ctx, id, code, name, flagMediaID, sortOrder)
}

func (s *RegionService) SetActive(ctx context.Context, actor *domain.AdminUser, id int64, active bool) error {
	if err := requireManageRole(actor); err != nil {
		return err
	}
	return s.regions.SetActive(ctx, id, active)
}

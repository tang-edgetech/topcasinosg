package service

import (
	"context"
	"strings"

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

// RegionInput is the editable part of a Region (create and update).
type RegionInput struct {
	Code         string
	Name         string
	Demonym      string
	CurrencyCode string
	FlagMediaID  *int64
	SortOrder    int
}

func (in RegionInput) toRegion() *domain.Region {
	return &domain.Region{
		Code:         strings.TrimSpace(in.Code),
		Name:         strings.TrimSpace(in.Name),
		Demonym:      strings.TrimSpace(in.Demonym),
		CurrencyCode: strings.ToUpper(strings.TrimSpace(in.CurrencyCode)),
		FlagMediaID:  in.FlagMediaID,
		SortOrder:    in.SortOrder,
	}
}

func requireManageRole(actor *domain.AdminUser) error {
	if actor.Role != domain.RoleSuperAdmin && actor.Role != domain.RoleAdmin {
		return ErrForbidden
	}
	return nil
}

func (s *RegionService) Create(ctx context.Context, actor *domain.AdminUser, in RegionInput) (*domain.Region, error) {
	if err := requireManageRole(actor); err != nil {
		return nil, err
	}
	reg := in.toRegion()
	exists, err := s.regions.ExistsCode(ctx, reg.Code, 0)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrAlreadyExists
	}
	id, err := s.regions.Create(ctx, reg)
	if err != nil {
		return nil, err
	}
	return s.regions.GetByID(ctx, id)
}

func (s *RegionService) Update(ctx context.Context, actor *domain.AdminUser, id int64, in RegionInput) error {
	if err := requireManageRole(actor); err != nil {
		return err
	}
	reg := in.toRegion()
	exists, err := s.regions.ExistsCode(ctx, reg.Code, id)
	if err != nil {
		return err
	}
	if exists {
		return ErrAlreadyExists
	}
	return s.regions.Update(ctx, id, reg)
}

func (s *RegionService) SetActive(ctx context.Context, actor *domain.AdminUser, id int64, active bool) error {
	if err := requireManageRole(actor); err != nil {
		return err
	}
	return s.regions.SetActive(ctx, id, active)
}

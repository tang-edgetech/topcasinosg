package service

import (
	"context"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

// GameProviderService — reads are open to any content-management role
// (Editors need the list to pick providers when editing a Casino);
// create/edit/delete are Super Admin + Admin only, same tier as Regions,
// since this is a shared master list, not one piece of content.
type GameProviderService struct {
	providers *repository.GameProviderRepo
}

func NewGameProviderService(providers *repository.GameProviderRepo) *GameProviderService {
	return &GameProviderService{providers: providers}
}

func (s *GameProviderService) List(ctx context.Context) ([]domain.GameProvider, error) {
	return s.providers.List(ctx)
}

func (s *GameProviderService) Create(ctx context.Context, actor *domain.AdminUser, name string, logoMediaID *int64, sortOrder int) (*domain.GameProvider, error) {
	if err := requireManageRole(actor); err != nil {
		return nil, err
	}
	id, err := s.providers.Create(ctx, &domain.GameProvider{Name: name, LogoMediaID: logoMediaID, SortOrder: sortOrder})
	if err != nil {
		return nil, err
	}
	return s.providers.GetByID(ctx, id)
}

func (s *GameProviderService) Update(ctx context.Context, actor *domain.AdminUser, id int64, name string, logoMediaID *int64, sortOrder int) error {
	if err := requireManageRole(actor); err != nil {
		return err
	}
	return s.providers.Update(ctx, id, name, logoMediaID, sortOrder)
}

func (s *GameProviderService) Delete(ctx context.Context, actor *domain.AdminUser, id int64) error {
	if err := requireManageRole(actor); err != nil {
		return err
	}
	return s.providers.Delete(ctx, id)
}

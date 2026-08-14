package service

import (
	"context"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

// LicenseService — same access pattern as GameProviderService: reads open to
// any content-management role, create/edit/delete Super Admin + Admin only.
type LicenseService struct {
	licenses *repository.LicenseRepo
}

func NewLicenseService(licenses *repository.LicenseRepo) *LicenseService {
	return &LicenseService{licenses: licenses}
}

func (s *LicenseService) List(ctx context.Context) ([]domain.License, error) {
	return s.licenses.List(ctx)
}

func (s *LicenseService) Create(ctx context.Context, actor *domain.AdminUser, name string, logoMediaID *int64, sortOrder int) (*domain.License, error) {
	if err := requireManageRole(actor); err != nil {
		return nil, err
	}
	id, err := s.licenses.Create(ctx, &domain.License{Name: name, LogoMediaID: logoMediaID, SortOrder: sortOrder})
	if err != nil {
		return nil, err
	}
	return s.licenses.GetByID(ctx, id)
}

func (s *LicenseService) Update(ctx context.Context, actor *domain.AdminUser, id int64, name string, logoMediaID *int64, sortOrder int) error {
	if err := requireManageRole(actor); err != nil {
		return err
	}
	return s.licenses.Update(ctx, id, name, logoMediaID, sortOrder)
}

func (s *LicenseService) Delete(ctx context.Context, actor *domain.AdminUser, id int64) error {
	if err := requireManageRole(actor); err != nil {
		return err
	}
	return s.licenses.Delete(ctx, id)
}

package service

import (
	"context"
	"errors"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

var ErrInvalidLanguage = errors.New("language must be 'en' or 'cn'")

// SiteSettingsService — reads are public (the login page needs the site title
// and logo before anyone is authenticated); writes are Super Admin only.
type SiteSettingsService struct {
	settings *repository.SiteSettingsRepo
}

func NewSiteSettingsService(settings *repository.SiteSettingsRepo) *SiteSettingsService {
	return &SiteSettingsService{settings: settings}
}

func (s *SiteSettingsService) Get(ctx context.Context) (*domain.SiteSettings, error) {
	return s.settings.Get(ctx)
}

func (s *SiteSettingsService) Update(ctx context.Context, actor *domain.AdminUser, next *domain.SiteSettings) error {
	if actor.Role != domain.RoleSuperAdmin {
		return ErrForbidden
	}
	if !next.Language.Valid() {
		return ErrInvalidLanguage
	}
	return s.settings.Update(ctx, next)
}

func (s *SiteSettingsService) SetLogoURL(ctx context.Context, actor *domain.AdminUser, url string) error {
	if actor.Role != domain.RoleSuperAdmin {
		return ErrForbidden
	}
	return s.settings.UpdateLogoURL(ctx, url)
}

func (s *SiteSettingsService) SetFaviconURL(ctx context.Context, actor *domain.AdminUser, url string) error {
	if actor.Role != domain.RoleSuperAdmin {
		return ErrForbidden
	}
	return s.settings.UpdateFaviconURL(ctx, url)
}

func (s *SiteSettingsService) SetTwoFactorEnabled(ctx context.Context, actor *domain.AdminUser, enabled bool) error {
	if actor.Role != domain.RoleSuperAdmin {
		return ErrForbidden
	}
	return s.settings.SetTwoFactorEnabled(ctx, enabled)
}

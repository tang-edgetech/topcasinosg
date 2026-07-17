package repository

import (
	"context"
	"database/sql"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type SiteSettingsRepo struct {
	db *sql.DB
}

func NewSiteSettingsRepo(db *sql.DB) *SiteSettingsRepo {
	return &SiteSettingsRepo{db: db}
}

const siteSettingsColumns = `site_url, site_title, seo_index, seo_follow, timezone, language,
	logo_url, favicon_url, two_factor_enabled, updated_at`

func (r *SiteSettingsRepo) Get(ctx context.Context) (*domain.SiteSettings, error) {
	var s domain.SiteSettings
	err := r.db.QueryRowContext(ctx, `SELECT `+siteSettingsColumns+` FROM site_settings WHERE id = 1`).Scan(
		&s.SiteURL, &s.SiteTitle, &s.SEOIndex, &s.SEOFollow, &s.Timezone, &s.Language,
		&s.LogoURL, &s.FaviconURL, &s.TwoFactorEnabled, &s.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *SiteSettingsRepo) Update(ctx context.Context, s *domain.SiteSettings) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE site_settings SET
			site_url = ?, site_title = ?, seo_index = ?, seo_follow = ?,
			timezone = ?, language = ?
		WHERE id = 1`,
		s.SiteURL, s.SiteTitle, s.SEOIndex, s.SEOFollow, s.Timezone, s.Language,
	)
	return err
}

func (r *SiteSettingsRepo) UpdateLogoURL(ctx context.Context, url string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE site_settings SET logo_url = ? WHERE id = 1`, url)
	return err
}

func (r *SiteSettingsRepo) UpdateFaviconURL(ctx context.Context, url string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE site_settings SET favicon_url = ? WHERE id = 1`, url)
	return err
}

func (r *SiteSettingsRepo) SetTwoFactorEnabled(ctx context.Context, enabled bool) error {
	_, err := r.db.ExecContext(ctx, `UPDATE site_settings SET two_factor_enabled = ? WHERE id = 1`, enabled)
	return err
}

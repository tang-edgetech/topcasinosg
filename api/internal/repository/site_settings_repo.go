package repository

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type SiteSettingsRepo struct {
	db *sql.DB
}

func NewSiteSettingsRepo(db *sql.DB) *SiteSettingsRepo {
	return &SiteSettingsRepo{db: db}
}

const siteSettingsColumns = `site_url, site_title, seo_index, seo_follow, timezone, language,
	logo_url, favicon_url, og_image_url, twitter_handle, two_factor_enabled,
	footer_description, contact_address, contact_email, facebook_url, skype_url, footer_config, updated_at`

func (r *SiteSettingsRepo) Get(ctx context.Context) (*domain.SiteSettings, error) {
	var s domain.SiteSettings
	var footerConfig sql.NullString
	err := r.db.QueryRowContext(ctx, `SELECT `+siteSettingsColumns+` FROM site_settings WHERE id = 1`).Scan(
		&s.SiteURL, &s.SiteTitle, &s.SEOIndex, &s.SEOFollow, &s.Timezone, &s.Language,
		&s.LogoURL, &s.FaviconURL, &s.OGImageURL, &s.TwitterHandle, &s.TwoFactorEnabled,
		&s.FooterDescription, &s.ContactAddress, &s.ContactEmail, &s.FacebookURL, &s.SkypeURL, &footerConfig, &s.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	// Never edited (NULL) or unreadable: the defaults, i.e. the footer as it
	// was before it became editable.
	s.Footer = domain.DefaultFooterConfig()
	if footerConfig.Valid && footerConfig.String != "" {
		var stored domain.FooterConfig
		if json.Unmarshal([]byte(footerConfig.String), &stored) == nil {
			s.Footer = stored
		}
	}
	return &s, nil
}

// UpdateFooter saves the Footer page: the brand/contact block and the
// footer config together.
func (r *SiteSettingsRepo) UpdateFooter(ctx context.Context, fc domain.FooterContact, config domain.FooterConfig) error {
	encoded, err := json.Marshal(config)
	if err != nil {
		return err
	}
	_, err = r.db.ExecContext(ctx, `
		UPDATE site_settings SET
			footer_description = ?, contact_address = ?, contact_email = ?,
			facebook_url = ?, skype_url = ?, footer_config = ?
		WHERE id = 1`,
		fc.FooterDescription, fc.ContactAddress, fc.ContactEmail, fc.FacebookURL, fc.SkypeURL, string(encoded),
	)
	return err
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

func (r *SiteSettingsRepo) UpdateSocialDefaults(ctx context.Context, sd domain.SocialDefaults) error {
	_, err := r.db.ExecContext(ctx, `UPDATE site_settings SET og_image_url = ?, twitter_handle = ? WHERE id = 1`, sd.OGImageURL, sd.TwitterHandle)
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

package service

import (
	"context"
	"errors"
	"net/mail"
	"net/url"
	"regexp"
	"strings"
	"unicode/utf8"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

const (
	maxFooterDescriptionLength = 1000
	maxContactFieldLength      = 500
)

var (
	ErrInvalidLanguage          = errors.New("language must be 'en' or 'cn'")
	ErrFooterDescriptionTooLong = errors.New("footer description must be at most 1000 characters")
	ErrContactFieldTooLong      = errors.New("address, email, and social URLs must be at most 500 characters")
	ErrInvalidContactEmail      = errors.New("contact email must be a valid email address")
	ErrInvalidFacebookURL       = errors.New("Facebook URL must start with http:// or https://")
	ErrInvalidSkypeURL          = errors.New("Skype URL must start with http://, https://, or skype:")
	ErrInvalidTwitterHandle     = errors.New("X/Twitter handle must be 1-15 letters, numbers or underscores")
	ErrInvalidShareImage        = errors.New("share image must be an uploaded file or a full http(s) address")
	ErrInvalidFooterLayout      = errors.New("brand block position must be 'left' or 'right'")
	ErrFooterTextTooLong        = errors.New("footer bottom bar text must be at most 200 characters each")
	ErrTooManyFooterBadges      = errors.New("the footer can show at most 12 badges")
	ErrInvalidFooterBadge       = errors.New("each badge needs a name (up to 100 characters) and an image; links must be http(s) or start with /")
)

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

func canEditSiteSettings(actor *domain.AdminUser) bool {
	return actor.Role == domain.RoleSuperAdmin || actor.Role == domain.RoleAdmin
}

func (s *SiteSettingsService) Update(ctx context.Context, actor *domain.AdminUser, next *domain.SiteSettings) error {
	if !canEditSiteSettings(actor) {
		return ErrForbidden
	}
	if !next.Language.Valid() {
		return ErrInvalidLanguage
	}
	sd, err := normalizeSocialDefaults(next.SocialDefaults)
	if err != nil {
		return err
	}
	if err := s.settings.Update(ctx, next); err != nil {
		return err
	}
	return s.settings.UpdateSocialDefaults(ctx, sd)
}

// UpdateFooter saves the Footer page: the brand/contact block and the
// footer's layout, bottom bar text and badges.
func (s *SiteSettingsService) UpdateFooter(ctx context.Context, actor *domain.AdminUser, contact domain.FooterContact, config domain.FooterConfig) error {
	if !canEditSiteSettings(actor) {
		return ErrForbidden
	}
	fc, err := normalizeFooterContact(contact)
	if err != nil {
		return err
	}
	cfg, err := normalizeFooterConfig(config)
	if err != nil {
		return err
	}
	return s.settings.UpdateFooter(ctx, fc, cfg)
}

const (
	maxFooterTextLength      = 200
	maxFooterBadgeNameLength = 100
)

func normalizeFooterConfig(cfg domain.FooterConfig) (domain.FooterConfig, error) {
	if cfg.Layout.BrandPosition != domain.FooterBrandLeft && cfg.Layout.BrandPosition != domain.FooterBrandRight {
		return cfg, ErrInvalidFooterLayout
	}
	cfg.CertifiedByLabel = strings.TrimSpace(cfg.CertifiedByLabel)
	cfg.Copyright = strings.TrimSpace(cfg.Copyright)
	cfg.PoweredBy = strings.TrimSpace(cfg.PoweredBy)
	for _, text := range []string{cfg.CertifiedByLabel, cfg.Copyright, cfg.PoweredBy} {
		if utf8.RuneCountInString(text) > maxFooterTextLength {
			return cfg, ErrFooterTextTooLong
		}
	}
	if len(cfg.Badges) > domain.MaxFooterBadges {
		return cfg, ErrTooManyFooterBadges
	}
	badges := make([]domain.FooterBadge, 0, len(cfg.Badges))
	for _, b := range cfg.Badges {
		b = domain.FooterBadge{Name: strings.TrimSpace(b.Name), ImageURL: strings.TrimSpace(b.ImageURL), LinkURL: strings.TrimSpace(b.LinkURL)}
		if b.Name == "" || utf8.RuneCountInString(b.Name) > maxFooterBadgeNameLength {
			return cfg, ErrInvalidFooterBadge
		}
		if !isWebURL(b.ImageURL) && !isSitePath(b.ImageURL) {
			return cfg, ErrInvalidFooterBadge
		}
		if b.LinkURL != "" && !isWebURL(b.LinkURL) && !isSitePath(b.LinkURL) {
			return cfg, ErrInvalidFooterBadge
		}
		badges = append(badges, b)
	}
	cfg.Badges = badges
	return cfg, nil
}

// isSitePath: a path on this site ("/uploads/x.png"), not a protocol-relative URL.
func isSitePath(value string) bool {
	return strings.HasPrefix(value, "/") && !strings.HasPrefix(value, "//")
}

var twitterHandlePattern = regexp.MustCompile(`^[A-Za-z0-9_]{1,15}$`)

// normalizeSocialDefaults stores the handle without its "@" and accepts a
// share image that is an uploaded file path (/uploads/...) or a full URL.
func normalizeSocialDefaults(sd domain.SocialDefaults) (domain.SocialDefaults, error) {
	sd.TwitterHandle = strings.TrimPrefix(strings.TrimSpace(sd.TwitterHandle), "@")
	if sd.TwitterHandle != "" && !twitterHandlePattern.MatchString(sd.TwitterHandle) {
		return sd, ErrInvalidTwitterHandle
	}
	if sd.OGImageURL != nil {
		image := strings.TrimSpace(*sd.OGImageURL)
		switch {
		case image == "":
			sd.OGImageURL = nil
		case isWebURL(image) || (strings.HasPrefix(image, "/") && !strings.HasPrefix(image, "//")):
			sd.OGImageURL = &image
		default:
			return sd, ErrInvalidShareImage
		}
	}
	return sd, nil
}

func normalizeFooterContact(fc domain.FooterContact) (domain.FooterContact, error) {
	fc = domain.FooterContact{
		FooterDescription: strings.TrimSpace(fc.FooterDescription),
		ContactAddress:    strings.TrimSpace(fc.ContactAddress),
		ContactEmail:      strings.TrimSpace(fc.ContactEmail),
		FacebookURL:       strings.TrimSpace(fc.FacebookURL),
		SkypeURL:          strings.TrimSpace(fc.SkypeURL),
	}
	if utf8.RuneCountInString(fc.FooterDescription) > maxFooterDescriptionLength {
		return fc, ErrFooterDescriptionTooLong
	}
	for _, value := range []string{fc.ContactAddress, fc.ContactEmail, fc.FacebookURL, fc.SkypeURL} {
		if utf8.RuneCountInString(value) > maxContactFieldLength {
			return fc, ErrContactFieldTooLong
		}
	}
	if fc.ContactEmail != "" && !isEmailAddress(fc.ContactEmail) {
		return fc, ErrInvalidContactEmail
	}
	if fc.FacebookURL != "" && !isWebURL(fc.FacebookURL) {
		return fc, ErrInvalidFacebookURL
	}
	if fc.SkypeURL != "" && !isWebURL(fc.SkypeURL) && !isSkypeURI(fc.SkypeURL) {
		return fc, ErrInvalidSkypeURL
	}
	return fc, nil
}

func isEmailAddress(value string) bool {
	addr, err := mail.ParseAddress(value)
	return err == nil && addr.Address == value
}

func isWebURL(value string) bool {
	u, err := url.Parse(value)
	return err == nil && (u.Scheme == "http" || u.Scheme == "https") && u.Host != ""
}

func isSkypeURI(value string) bool {
	return strings.HasPrefix(value, "skype:") && len(value) > len("skype:")
}

func (s *SiteSettingsService) SetLogoURL(ctx context.Context, actor *domain.AdminUser, url string) error {
	if !canEditSiteSettings(actor) {
		return ErrForbidden
	}
	return s.settings.UpdateLogoURL(ctx, url)
}

func (s *SiteSettingsService) SetFaviconURL(ctx context.Context, actor *domain.AdminUser, url string) error {
	if !canEditSiteSettings(actor) {
		return ErrForbidden
	}
	return s.settings.UpdateFaviconURL(ctx, url)
}

func (s *SiteSettingsService) SetTwoFactorEnabled(ctx context.Context, actor *domain.AdminUser, enabled bool) error {
	if !canEditSiteSettings(actor) {
		return ErrForbidden
	}
	return s.settings.SetTwoFactorEnabled(ctx, enabled)
}

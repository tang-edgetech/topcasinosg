package service

import (
	"context"
	"errors"
	"net/mail"
	"net/url"
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
	fc, err := normalizeFooterContact(next.FooterContact)
	if err != nil {
		return err
	}
	if err := s.settings.Update(ctx, next); err != nil {
		return err
	}
	return s.settings.UpdateFooterContact(ctx, fc)
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

package service

import (
	"context"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"unicode"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

// ErrInvalidRedirect is wrapped with what is wrong, for the admin to read.
var ErrInvalidRedirect = errors.New("invalid redirect")

const (
	maxRedirectFrom = 500
	maxRedirectTo   = 1000
	maxRedirectNote = 255
	// Longest chain followed when looking for a loop.
	maxRedirectHops = 20
)

// Addresses of the site that must never be redirected: the website's own
// files and endpoints, and the page preview.
var reservedRedirectPrefixes = []string{"/api/", "/_next/", "/preview/"}

// RedirectService — Admin > Redirects. Anyone in the backoffice can see the
// list; only Super Admin and Admin can change it, since a wrong redirect can
// send the whole site's visitors away.
type RedirectService struct {
	redirects *repository.RedirectRepo
}

func NewRedirectService(redirects *repository.RedirectRepo) *RedirectService {
	return &RedirectService{redirects: redirects}
}

type RedirectInput struct {
	FromPath   string
	ToURL      string
	StatusCode int
	Active     bool
	Note       string
}

func (s *RedirectService) List(ctx context.Context) ([]domain.Redirect, error) {
	return s.redirects.List(ctx, false)
}

// ListActive is what the website applies.
func (s *RedirectService) ListActive(ctx context.Context) ([]domain.Redirect, error) {
	return s.redirects.List(ctx, true)
}

func (s *RedirectService) Get(ctx context.Context, id int64) (*domain.Redirect, error) {
	return s.redirects.GetByID(ctx, id)
}

func (s *RedirectService) Create(ctx context.Context, actor *domain.AdminUser, in RedirectInput) (*domain.Redirect, error) {
	if err := requireManageRole(actor); err != nil {
		return nil, err
	}
	item, err := s.check(ctx, 0, in)
	if err != nil {
		return nil, err
	}
	id, err := s.redirects.Create(ctx, item)
	if err != nil {
		return nil, err
	}
	return s.redirects.GetByID(ctx, id)
}

func (s *RedirectService) Update(ctx context.Context, actor *domain.AdminUser, id int64, in RedirectInput) (*domain.Redirect, error) {
	if err := requireManageRole(actor); err != nil {
		return nil, err
	}
	if _, err := s.redirects.GetByID(ctx, id); err != nil {
		return nil, err
	}
	item, err := s.check(ctx, id, in)
	if err != nil {
		return nil, err
	}
	if err := s.redirects.Update(ctx, id, item); err != nil {
		return nil, err
	}
	return s.redirects.GetByID(ctx, id)
}

func (s *RedirectService) Delete(ctx context.Context, actor *domain.AdminUser, id int64) error {
	if err := requireManageRole(actor); err != nil {
		return err
	}
	return s.redirects.Delete(ctx, id)
}

// check validates and tidies the input, and refuses a redirect that would
// send visitors round in a circle with the other active ones.
func (s *RedirectService) check(ctx context.Context, id int64, in RedirectInput) (*domain.Redirect, error) {
	from, err := NormalizeRedirectFrom(in.FromPath)
	if err != nil {
		return nil, err
	}
	to, err := normalizeRedirectTo(in.ToURL)
	if err != nil {
		return nil, err
	}
	if in.StatusCode == 0 {
		in.StatusCode = domain.RedirectPermanent
	}
	if in.StatusCode != domain.RedirectPermanent && in.StatusCode != domain.RedirectTemporary {
		return nil, fmt.Errorf("%w: the type must be 301 (permanent) or 302 (temporary)", ErrInvalidRedirect)
	}
	note := strings.TrimSpace(in.Note)
	if len(note) > maxRedirectNote {
		return nil, fmt.Errorf("%w: the note is longer than %d characters", ErrInvalidRedirect, maxRedirectNote)
	}
	if target, ok := sitePath(to); ok && strings.EqualFold(target, from) {
		return nil, fmt.Errorf("%w: a page can't redirect to itself", ErrInvalidRedirect)
	}
	item := &domain.Redirect{FromPath: from, ToURL: to, StatusCode: in.StatusCode, Active: in.Active, Note: note}
	if item.Active {
		others, err := s.redirects.List(ctx, true)
		if err != nil {
			return nil, err
		}
		if err := checkRedirectLoop(item, id, others); err != nil {
			return nil, err
		}
	}
	return item, nil
}

// NormalizeRedirectFrom turns what the admin typed (a path, or a full
// address of the site copied from the browser) into the path matched:
// no query or #part, no trailing slash.
func NormalizeRedirectFrom(raw string) (string, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return "", fmt.Errorf("%w: enter the old address", ErrInvalidRedirect)
	}
	if hasSpace(raw) {
		return "", fmt.Errorf("%w: the old address can't contain spaces", ErrInvalidRedirect)
	}
	if lower := strings.ToLower(raw); strings.HasPrefix(lower, "http://") || strings.HasPrefix(lower, "https://") {
		u, err := url.Parse(raw)
		if err != nil || u.Host == "" {
			return "", fmt.Errorf("%w: the old address isn't a valid address", ErrInvalidRedirect)
		}
		raw = u.EscapedPath()
		if raw == "" {
			raw = "/"
		}
	}
	if i := strings.IndexAny(raw, "?#"); i >= 0 {
		raw = raw[:i]
	}
	if !strings.HasPrefix(raw, "/") || strings.HasPrefix(raw, "//") {
		return "", fmt.Errorf("%w: the old address must start with / (like /guides)", ErrInvalidRedirect)
	}
	raw = strings.TrimRight(raw, "/")
	if raw == "" {
		return "", fmt.Errorf("%w: the homepage can't be redirected", ErrInvalidRedirect)
	}
	lower := strings.ToLower(raw) + "/"
	for _, p := range reservedRedirectPrefixes {
		if strings.HasPrefix(lower, p) {
			return "", fmt.Errorf("%w: addresses starting with %s are used by the website itself", ErrInvalidRedirect, strings.TrimSuffix(p, "/"))
		}
	}
	if len(raw) > maxRedirectFrom {
		return "", fmt.Errorf("%w: the old address is longer than %d characters", ErrInvalidRedirect, maxRedirectFrom)
	}
	return raw, nil
}

func normalizeRedirectTo(raw string) (string, error) {
	raw = strings.TrimSpace(raw)
	switch {
	case raw == "":
		return "", fmt.Errorf("%w: enter the new address", ErrInvalidRedirect)
	case hasSpace(raw):
		return "", fmt.Errorf("%w: the new address can't contain spaces", ErrInvalidRedirect)
	case len(raw) > maxRedirectTo:
		return "", fmt.Errorf("%w: the new address is longer than %d characters", ErrInvalidRedirect, maxRedirectTo)
	case strings.HasPrefix(raw, "/") && !strings.HasPrefix(raw, "//"):
		return raw, nil
	}
	u, err := url.Parse(raw)
	if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" {
		return "", fmt.Errorf("%w: the new address must be a page of this site starting with / or a full https:// address", ErrInvalidRedirect)
	}
	return raw, nil
}

// sitePath is the path of a target on this site ("/x/?y" -> "/x"); false
// for another website.
func sitePath(to string) (string, bool) {
	if !strings.HasPrefix(to, "/") {
		return "", false
	}
	if i := strings.IndexAny(to, "?#"); i >= 0 {
		to = to[:i]
	}
	if p := strings.TrimRight(to, "/"); p != "" {
		return p, true
	}
	return "/", true
}

// checkRedirectLoop follows item's target through the other active
// redirects (skipping the one being edited, id) and fails if it comes back
// to where it started.
func checkRedirectLoop(item *domain.Redirect, id int64, others []domain.Redirect) error {
	next := map[string]string{}
	for _, o := range others {
		if o.ID != id {
			next[strings.ToLower(o.FromPath)] = o.ToURL
		}
	}
	start := strings.ToLower(item.FromPath)
	to := item.ToURL
	for hop := 0; hop < maxRedirectHops; hop++ {
		path, ok := sitePath(to)
		if !ok {
			return nil
		}
		path = strings.ToLower(path)
		if path == start {
			return fmt.Errorf("%w: this would send visitors round in a circle with the other redirects", ErrInvalidRedirect)
		}
		if to, ok = next[path]; !ok {
			return nil
		}
	}
	return fmt.Errorf("%w: this joins a chain of more than %d redirects", ErrInvalidRedirect, maxRedirectHops)
}

func hasSpace(s string) bool {
	return strings.IndexFunc(s, unicode.IsSpace) >= 0
}

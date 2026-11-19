package service

import (
	"errors"
	"testing"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

func TestNormalizeRedirectFrom(t *testing.T) {
	ok := map[string]string{
		"/guides":             "/guides",
		" /guides/ ":          "/guides",
		"/Old-Page?ref=x#top": "/Old-Page",
		"https://www.topcasinosg.com.sg/news/old/": "/news/old",
		"/previews": "/previews",
	}
	for in, want := range ok {
		got, err := NormalizeRedirectFrom(in)
		if err != nil || got != want {
			t.Errorf("NormalizeRedirectFrom(%q) = %q, %v; want %q", in, got, err, want)
		}
	}
	for _, in := range []string{"", "guides", "//evil.com/x", "/", "https://topcasinosg.com.sg/", "/api/casinos", "/_next/static/x", "/preview/5", "/a b"} {
		if _, err := NormalizeRedirectFrom(in); !errors.Is(err, ErrInvalidRedirect) {
			t.Errorf("NormalizeRedirectFrom(%q) = %v; want ErrInvalidRedirect", in, err)
		}
	}
}

func TestNormalizeRedirectTo(t *testing.T) {
	for _, in := range []string{"/sg/guides", "/", "/x?y=1", "https://example.com/a", "http://example.com"} {
		if _, err := normalizeRedirectTo(in); err != nil {
			t.Errorf("normalizeRedirectTo(%q) = %v", in, err)
		}
	}
	for _, in := range []string{"", "guides", "//evil.com", "javascript:alert(1)", "ftp://x.com", "https://", "/a b"} {
		if _, err := normalizeRedirectTo(in); !errors.Is(err, ErrInvalidRedirect) {
			t.Errorf("normalizeRedirectTo(%q) = %v; want ErrInvalidRedirect", in, err)
		}
	}
}

func TestCheckRedirectLoop(t *testing.T) {
	others := []domain.Redirect{
		{ID: 1, FromPath: "/b", ToURL: "/c"},
		{ID: 2, FromPath: "/c", ToURL: "/A/"},
		{ID: 3, FromPath: "/d", ToURL: "https://example.com/d"},
	}
	if err := checkRedirectLoop(&domain.Redirect{FromPath: "/a", ToURL: "/b"}, 0, others); !errors.Is(err, ErrInvalidRedirect) {
		t.Errorf("a->b->c->a: got %v, want a loop error", err)
	}
	if err := checkRedirectLoop(&domain.Redirect{FromPath: "/a", ToURL: "/d"}, 0, others); err != nil {
		t.Errorf("a->d->other site: %v", err)
	}
	// Editing redirect 2 itself: its old target doesn't count.
	if err := checkRedirectLoop(&domain.Redirect{FromPath: "/c", ToURL: "/z"}, 2, others); err != nil {
		t.Errorf("edit of 2: %v", err)
	}
}

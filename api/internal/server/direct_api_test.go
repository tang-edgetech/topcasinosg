package server

import (
	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestAskedForDryRun(t *testing.T) {
	cases := []struct {
		name, url, contentType, body string
		want                         bool
	}{
		{"body true", "/api/v1/regions/6", "application/json", `{"dryRun":true,"name":"X"}`, true},
		{"body string true", "/api/v1/regions/6", "application/json", `{"dryRun":"true"}`, true},
		{"body 1", "/api/v1/regions/6", "application/json", `{"dryRun": 1}`, true},
		{"body false means apply", "/api/v1/regions/6", "application/json", `{"name":"X","dryRun":false}`, false},
		{"body null means apply", "/api/v1/regions/6", "application/json", `{"dryRun":null}`, false},
		{"query", "/api/v1/regions/6?dryRun=true", "application/json", `{"name":"X"}`, true},
		{"query 1", "/api/v1/casinos/1?dryRun=1", "", "", true},
		{"query false means apply", "/api/v1/casinos/1?dryRun=false", "", "", false},
		{"plain update", "/api/v1/regions/6", "application/json", `{"name":"X"}`, false},
		{"nested dryRun is a value, not the flag", "/api/v1/snippets/1", "application/json", `{"content":{"dryRun":true}}`, false},
		{"not JSON", "/api/v1/regions/6", "application/json", `not json`, false},
		{"no body", "/api/v1/regions/6/active", "", "", false},
		{"multipart is not read", "/api/v1/settings/site/logo", "multipart/form-data; boundary=x", `{"dryRun":true}`, false},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			r := httptest.NewRequest(http.MethodPut, c.url, strings.NewReader(c.body))
			if c.contentType != "" {
				r.Header.Set("Content-Type", c.contentType)
			}
			got, err := askedForDryRun(httptest.NewRecorder(), r)
			if err != nil {
				t.Fatalf("error: %v", err)
			}
			if got != c.want {
				t.Fatalf("askedForDryRun = %v, want %v", got, c.want)
			}
			if !strings.Contains(c.url, "dryRun") {
				rest, _ := io.ReadAll(r.Body)
				if string(rest) != c.body {
					t.Fatalf("body not kept for the admin handler: got %q, want %q", rest, c.body)
				}
			}
		})
	}
}

func TestAskedForDryRunTooLarge(t *testing.T) {
	body := `{"name":"` + strings.Repeat("x", maxDirectJSONBody) + `"}`
	r := httptest.NewRequest(http.MethodPut, "/api/v1/regions/6", strings.NewReader(body))
	r.Header.Set("Content-Type", "application/json")
	if _, err := askedForDryRun(httptest.NewRecorder(), r); err == nil {
		t.Fatal("want an error for a body over the limit")
	}
}

func TestDirectScope(t *testing.T) {
	cases := []struct {
		path  string
		scope string
		ok    bool
	}{
		{"redirects", domain.APIScopeNavigation, true},
		{"redirects/7", domain.APIScopeNavigation, true},
		{"menu-items", domain.APIScopeNavigation, true},
		{"seo/page/12", domain.APIScopePages, true},
		{"pages/12/snippets", domain.APIScopeSnippets, true},
		{"users", "", false},
		{"api-keys", "", false},
	}
	for _, c := range cases {
		scope, ok := directScope(c.path)
		if ok != c.ok || scope != c.scope {
			t.Errorf("directScope(%q) = %q, %v; want %q, %v", c.path, scope, ok, c.scope, c.ok)
		}
	}
}

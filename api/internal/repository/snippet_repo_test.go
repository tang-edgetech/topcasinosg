package repository

import (
	"strings"
	"testing"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

func TestRenderSnippetContentWrapsByCodeType(t *testing.T) {
	codeType := func(t domain.CodeType) *domain.CodeType { return &t }
	tests := []struct {
		name     string
		codeType *domain.CodeType
		want     []string
	}{
		{"global as pasted", nil, []string{"BODY"}},
		{"html as pasted", codeType(domain.CodeTypeHTML), []string{"BODY"}},
		{"css", codeType(domain.CodeTypeCSS), []string{"<style>BODY</style>"}},
		{"js", codeType(domain.CodeTypeJS), []string{"<script>BODY</script>"}},
		{"jquery", codeType(domain.CodeTypeJQuery), []string{
			"<script>(function(run){", "code.jquery.com/jquery-3.7.1.min.js", "s.integrity=",
			"(function($){$(function(){\nBODY\n});});</script>",
		}},
	}
	for _, tt := range tests {
		got := renderSnippetContent(domain.SiteSnippet{CodeType: tt.codeType, Content: "BODY"})
		for _, want := range tt.want {
			if !strings.Contains(got, want) {
				t.Errorf("%s: %q does not contain %q", tt.name, got, want)
			}
		}
		if tt.codeType == nil || *tt.codeType == domain.CodeTypeHTML {
			if got != "BODY" {
				t.Errorf("%s: got %q, want content unchanged", tt.name, got)
			}
		}
	}
}

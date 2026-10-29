package service

import (
	"errors"
	"testing"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

func TestSnippetInputValidateRequiresNameAndContent(t *testing.T) {
	html := domain.CodeTypeHTML
	code := SnippetInput{Name: "GTM", Kind: domain.SnippetKindCode, CodeType: &html, Location: domain.SnippetLocationHead, Content: "<b>x</b>"}
	global := SnippetInput{Name: "GTM", Kind: domain.SnippetKindGlobal, Location: domain.SnippetLocationHead, Content: "<b>x</b>"}

	tests := []struct {
		name   string
		mutate func(SnippetInput) SnippetInput
		want   error
	}{
		{"valid", func(in SnippetInput) SnippetInput { return in }, nil},
		{"empty name", func(in SnippetInput) SnippetInput { in.Name = ""; return in }, ErrSnippetNameRequired},
		{"whitespace name", func(in SnippetInput) SnippetInput { in.Name = " \t\n"; return in }, ErrSnippetNameRequired},
		{"empty content", func(in SnippetInput) SnippetInput { in.Content = ""; return in }, ErrSnippetContentRequired},
		{"whitespace content", func(in SnippetInput) SnippetInput { in.Content = "  \r\n "; return in }, ErrSnippetContentRequired},
	}
	for _, base := range []SnippetInput{code, global} {
		for _, tt := range tests {
			err := tt.mutate(base).validate()
			if (tt.want == nil && err != nil) || (tt.want != nil && !errors.Is(err, tt.want)) {
				t.Errorf("%s/%s: got %v, want %v", base.Kind, tt.name, err, tt.want)
			}
		}
	}
}

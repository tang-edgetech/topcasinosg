package service

import (
	"errors"
	"testing"
)

func TestNormalizeSchemaJSON(t *testing.T) {
	ok := map[string]string{
		"":                                   "",
		"  ":                                 "",
		`{"@type":"FAQPage"}`:                `{"@type":"FAQPage"}`,
		` [ {"@type":"A"}, {"@type":"B"} ] `: `[ {"@type":"A"}, {"@type":"B"} ]`,
		`<script type="application/ld+json">{"@type":"Organization"}</script>`: `{"@type":"Organization"}`,
	}
	for in, want := range ok {
		got, err := NormalizeSchemaJSON(in)
		if err != nil || got != want {
			t.Errorf("NormalizeSchemaJSON(%q) = %q, %v; want %q", in, got, err, want)
		}
	}
	for _, in := range []string{`{"@type":"A",}`, `"text"`, `42`, `[1, 2]`, `{"a":1} {"b":2}`, "{\n\"a\": }"} {
		if _, err := NormalizeSchemaJSON(in); !errors.Is(err, ErrInvalidSchemaJSON) {
			t.Errorf("NormalizeSchemaJSON(%q) = %v; want ErrInvalidSchemaJSON", in, err)
		}
	}
}

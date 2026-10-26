package service

import (
	"strings"
	"testing"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

func testImportSpec() domain.ImportType {
	min, max := importRange(0, 10)
	return domain.ImportType{
		Key: "things", Label: "Things", MatchBy: "slug",
		Columns: []domain.ImportColumn{
			{Key: "slug", Kind: importKindSlug, Required: true},
			{Key: "rating", Kind: importKindNumber, Min: min, Max: max},
			{Key: "tags", Kind: importKindList, Values: []string{"a", "b"}},
			{Key: "live", Kind: importKindBoolean},
		},
	}
}

func TestParseImportCSVHeader(t *testing.T) {
	tests := []struct {
		name     string
		csv      string
		wantErrs int
		wantRows int
	}{
		{"exact header", "slug,rating,tags,live\nabc,5,a|b,yes\n", 0, 1},
		{"any column order", "live,tags,rating,slug\nno,a,1,abc\n", 0, 1},
		{"BOM and blank lines", "\xef\xbb\xbfslug,rating,tags,live\n\nabc,,,\n", 0, 1},
		{"missing column", "slug,rating,tags\nabc,5,a\n", 1, 0},
		{"unknown column", "slug,rating,tags,live,extra\nabc,5,a,yes,x\n", 1, 0},
		{"wrong cell count", "slug,rating,tags,live\nabc,5\n", 1, 0},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			rows, errs := parseImportCSV(testImportSpec(), []byte(tt.csv))
			if len(errs) != tt.wantErrs || len(rows) != tt.wantRows {
				t.Fatalf("got %d rows, errors %v; want %d rows, %d errors", len(rows), errs, tt.wantRows, tt.wantErrs)
			}
		})
	}
}

func TestParseImportJSON(t *testing.T) {
	tests := []struct {
		name    string
		json    string
		wantErr string
	}{
		{"valid", `{"type":"things","items":[{"slug":"abc","rating":5,"tags":["a"],"live":true}]}`, ""},
		{"nulls for optional", `{"type":"things","items":[{"slug":"abc","rating":null,"tags":null,"live":null}]}`, ""},
		{"wrong type", `{"type":"casinos","items":[]}`, `"type": "things"`},
		{"number as text", `{"type":"things","items":[{"slug":"abc","rating":"5","tags":[],"live":true}]}`, "must be a number"},
		{"list as text", `{"type":"things","items":[{"slug":"abc","rating":5,"tags":"a|b","live":true}]}`, "must be a list"},
		{"missing field", `{"type":"things","items":[{"slug":"abc","rating":5,"tags":[]}]}`, `"live" column is missing`},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, errs := parseImportJSON(testImportSpec(), []byte(tt.json))
			if tt.wantErr == "" {
				if len(errs) > 0 {
					t.Fatalf("unexpected errors: %v", errs)
				}
				return
			}
			if len(errs) == 0 || !strings.Contains(errs[0].Message, tt.wantErr) {
				t.Fatalf("errors %v; want one containing %q", errs, tt.wantErr)
			}
		})
	}
}

func TestValidateImportCell(t *testing.T) {
	spec := testImportSpec()
	lk := &importLookups{regionIDs: map[string]int64{"th": 1}}
	region := domain.ImportColumn{Key: "region", Kind: importKindRegion}
	tests := []struct {
		name  string
		col   domain.ImportColumn
		value string
		ok    bool
	}{
		{"required present", spec.Columns[0], "my-slug", true},
		{"required empty", spec.Columns[0], "", false},
		{"bad slug", spec.Columns[0], "My Slug", false},
		{"number in range", spec.Columns[1], "9.5", true},
		{"number out of range", spec.Columns[1], "11", false},
		{"not a number", spec.Columns[1], "high", false},
		{"allowed list", spec.Columns[2], "a|b", true},
		{"list value not allowed", spec.Columns[2], "a|c", false},
		{"boolean", spec.Columns[3], "Yes", true},
		{"bad boolean", spec.Columns[3], "maybe", false},
		{"known region", region, "TH", true},
		{"unknown region", region, "xx", false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			msg := validateImportCell(tt.col, tt.value, lk)
			if (msg == "") != tt.ok {
				t.Fatalf("validateImportCell(%q) = %q; want ok=%v", tt.value, msg, tt.ok)
			}
		})
	}
}

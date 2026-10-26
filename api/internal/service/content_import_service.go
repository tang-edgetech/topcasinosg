package service

import (
	"bytes"
	"context"
	"encoding/csv"
	"encoding/json"
	"errors"
	"fmt"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

var (
	ErrUnknownImportType = errors.New("unknown import type")
	ErrImportFileType    = errors.New("the file must be a .csv or .json file")
)

const (
	importListSeparator  = "|"
	importDateLayout     = "2006-01-02"
	importMaxRows        = 5000
	importLookupPageSize = 5000
	importMaxErrors      = 200
	importFormatCSV      = "csv"
	importFormatJSON     = "json"
)

const (
	importKindText      = "text"
	importKindHTML      = "html"
	importKindSlug      = "slug"
	importKindInteger   = "integer"
	importKindNumber    = "number"
	importKindBoolean   = "boolean"
	importKindEnum      = "enum"
	importKindList      = "list"
	importKindDate      = "date"
	importKindRegion    = "region"
	importKindRegions   = "regions"
	importKindCasino    = "casino"
	importKindProvider  = "provider"
	importKindProviders = "providers"
	importKindLicenses  = "licenses"
)

var importSlugPattern = regexp.MustCompile(`^[a-z0-9-]+$`)

// ContentImportService imports one content type at a time from a CSV or
// JSON file that must follow that type's exact format (contentImportTypes).
// Every row is checked first - columns, required values, numbers, allowed
// values, dates and references to regions, casinos, providers and licenses;
// if anything is wrong nothing is written and every problem is reported by
// row. Otherwise rows matching an existing item (ImportType.MatchBy) update
// it, keeping what the file doesn't cover such as images, and the rest are
// created, all through the normal services.
type ContentImportService struct {
	regions        *RegionService
	providers      *GameProviderService
	licenses       *LicenseService
	casinos        *CasinoService
	bonuses        *BonusService
	paymentMethods *PaymentMethodService
	rtp            *RTPEntryService
	blacklist      *BlacklistEntryService
	guides         *GuideService
	news           *NewsArticleService
}

func NewContentImportService(
	regions *RegionService,
	providers *GameProviderService,
	licenses *LicenseService,
	casinos *CasinoService,
	bonuses *BonusService,
	paymentMethods *PaymentMethodService,
	rtp *RTPEntryService,
	blacklist *BlacklistEntryService,
	guides *GuideService,
	news *NewsArticleService,
) *ContentImportService {
	return &ContentImportService{
		regions: regions, providers: providers, licenses: licenses, casinos: casinos, bonuses: bonuses,
		paymentMethods: paymentMethods, rtp: rtp, blacklist: blacklist, guides: guides, news: news,
	}
}

// Types lists every importable content type with its format.
func (s *ContentImportService) Types() []domain.ImportType {
	defs := s.definitions()
	types := make([]domain.ImportType, len(defs))
	for i, def := range defs {
		types[i] = def.spec
	}
	return types
}

// importDef is one content type: its format, how a row's match key is built,
// and plan, which loads the existing items and returns whether a key exists
// and how to write a row.
type importDef struct {
	spec domain.ImportType
	key  func(r importRow) string
	plan func(ctx context.Context, lk *importLookups) (*importPlan, error)
}

type importPlan struct {
	exists func(key string) bool
	write  func(ctx context.Context, actor *domain.AdminUser, r importRow, lk *importLookups) error
}

func (s *ContentImportService) definition(key string) (importDef, bool) {
	for _, def := range s.definitions() {
		if def.spec.Key == key {
			return def, true
		}
	}
	return importDef{}, false
}

// Import checks a file and, unless dryRun or a check fails, writes it.
func (s *ContentImportService) Import(ctx context.Context, actor *domain.AdminUser, typeKey, filename string, data []byte, dryRun bool) (*domain.ImportReport, error) {
	def, ok := s.definition(typeKey)
	if !ok {
		return nil, ErrUnknownImportType
	}
	if def.spec.AdminOnly {
		if err := requireManageRole(actor); err != nil {
			return nil, err
		}
	}

	format, err := importFormat(filename)
	if err != nil {
		return nil, err
	}
	report := &domain.ImportReport{Type: def.spec.Key, Format: format, DryRun: dryRun, Errors: []domain.ImportRowError{}}

	var rows []importRow
	if format == importFormatCSV {
		rows, report.Errors = parseImportCSV(def.spec, data)
	} else {
		rows, report.Errors = parseImportJSON(def.spec, data)
	}
	report.Rows = len(rows)
	if len(report.Errors) > 0 {
		return report, nil
	}
	if len(rows) == 0 {
		report.Errors = append(report.Errors, domain.ImportRowError{Message: "the file has no rows to import"})
		return report, nil
	}
	if len(rows) > importMaxRows {
		report.Errors = append(report.Errors, domain.ImportRowError{Message: fmt.Sprintf("the file has %d rows; import at most %d at a time", len(rows), importMaxRows)})
		return report, nil
	}

	lk, err := s.lookups(ctx)
	if err != nil {
		return nil, err
	}
	report.Errors = validateImportRows(def, rows, lk)
	if len(report.Errors) > 0 {
		return report, nil
	}

	plan, err := def.plan(ctx, lk)
	if err != nil {
		return nil, err
	}
	for _, r := range rows {
		if plan.exists(def.key(r)) {
			report.Updated++
		} else {
			report.Created++
		}
	}
	if dryRun {
		return report, nil
	}

	report.Created, report.Updated = 0, 0
	for _, r := range rows {
		existed := plan.exists(def.key(r))
		if err := plan.write(ctx, actor, r, lk); err != nil {
			report.Errors = append(report.Errors, domain.ImportRowError{Row: r.line, Message: err.Error()})
			continue
		}
		if existed {
			report.Updated++
		} else {
			report.Created++
		}
	}
	report.Applied = report.Created+report.Updated > 0
	return report, nil
}

func importFormat(filename string) (string, error) {
	switch strings.ToLower(filepath.Ext(filename)) {
	case ".csv":
		return importFormatCSV, nil
	case ".json":
		return importFormatJSON, nil
	default:
		return "", ErrImportFileType
	}
}

// importRow is one row's cells as text (JSON values are converted to the CSV
// cell form while parsing), plus its CSV line / JSON item number.
type importRow struct {
	line  int
	cells map[string]string
}

func (r importRow) text(key string) string { return strings.TrimSpace(r.cells[key]) }

func (r importRow) has(key string) bool { return r.text(key) != "" }

func (r importRow) list(key string) []string {
	out := []string{}
	for _, part := range strings.Split(r.text(key), importListSeparator) {
		if part = strings.TrimSpace(part); part != "" {
			out = append(out, part)
		}
	}
	return out
}

func (r importRow) number(key string) float64 {
	n, _ := strconv.ParseFloat(r.text(key), 64)
	return n
}

func (r importRow) numberPtr(key string) *float64 {
	if !r.has(key) {
		return nil
	}
	n := r.number(key)
	return &n
}

func (r importRow) integer(key string, fallback int) int {
	if !r.has(key) {
		return fallback
	}
	n, _ := strconv.Atoi(r.text(key))
	return n
}

func (r importRow) integerPtr(key string) *int {
	if !r.has(key) {
		return nil
	}
	n := r.integer(key, 0)
	return &n
}

func (r importRow) boolean(key string, fallback bool) bool {
	switch strings.ToLower(r.text(key)) {
	case "yes", "true", "1":
		return true
	case "no", "false", "0":
		return false
	default:
		return fallback
	}
}

func (r importRow) date(key string) *time.Time {
	if !r.has(key) {
		return nil
	}
	t, err := time.Parse(importDateLayout, r.text(key))
	if err != nil {
		return nil
	}
	return &t
}

func (r importRow) textPtr(key string) *string {
	if !r.has(key) {
		return nil
	}
	v := r.text(key)
	return &v
}

func importColumnKeys(spec domain.ImportType) []string {
	keys := make([]string, len(spec.Columns))
	for i, c := range spec.Columns {
		keys[i] = c.Key
	}
	return keys
}

func parseImportCSV(spec domain.ImportType, data []byte) ([]importRow, []domain.ImportRowError) {
	reader := csv.NewReader(bytes.NewReader(bytes.TrimPrefix(data, []byte("\xef\xbb\xbf"))))
	reader.FieldsPerRecord = -1
	records, err := reader.ReadAll()
	if err != nil {
		return nil, []domain.ImportRowError{{Message: "the CSV file could not be read: " + err.Error()}}
	}
	if len(records) == 0 {
		return nil, []domain.ImportRowError{{Message: "the file is empty; it needs the header row: " + strings.Join(importColumnKeys(spec), ",")}}
	}

	header := make([]string, len(records[0]))
	for i, h := range records[0] {
		header[i] = strings.TrimSpace(h)
	}
	if errs := checkImportFields(spec, header, 1); len(errs) > 0 {
		return nil, errs
	}

	var rows []importRow
	errs := []domain.ImportRowError{}
	for i, record := range records[1:] {
		line := i + 2
		if strings.TrimSpace(strings.Join(record, "")) == "" {
			continue
		}
		if len(record) != len(header) {
			errs = append(errs, domain.ImportRowError{Row: line, Message: fmt.Sprintf("has %d cells; every row needs %d, one per column", len(record), len(header))})
			continue
		}
		cells := make(map[string]string, len(header))
		for j, key := range header {
			cells[key] = record[j]
		}
		rows = append(rows, importRow{line: line, cells: cells})
	}
	return rows, errs
}

// checkImportFields requires exactly the type's columns: none missing,
// none unknown, none twice.
func checkImportFields(spec domain.ImportType, fields []string, row int) []domain.ImportRowError {
	known := make(map[string]bool, len(spec.Columns))
	for _, c := range spec.Columns {
		known[c.Key] = true
	}
	errs := []domain.ImportRowError{}
	seen := make(map[string]bool, len(fields))
	for _, f := range fields {
		switch {
		case !known[f]:
			errs = append(errs, domain.ImportRowError{Row: row, Column: f, Message: fmt.Sprintf("%q is not a column of this format", f)})
		case seen[f]:
			errs = append(errs, domain.ImportRowError{Row: row, Column: f, Message: fmt.Sprintf("%q appears more than once", f)})
		}
		seen[f] = true
	}
	for _, c := range spec.Columns {
		if !seen[c.Key] {
			errs = append(errs, domain.ImportRowError{Row: row, Column: c.Key, Message: fmt.Sprintf("the %q column is missing", c.Key)})
		}
	}
	return errs
}

func parseImportJSON(spec domain.ImportType, data []byte) ([]importRow, []domain.ImportRowError) {
	var doc struct {
		Type  *string                       `json:"type"`
		Items *[]map[string]json.RawMessage `json:"items"`
	}
	if err := json.Unmarshal(bytes.TrimPrefix(data, []byte("\xef\xbb\xbf")), &doc); err != nil {
		return nil, []domain.ImportRowError{{Message: "the JSON file could not be read: " + err.Error()}}
	}
	if doc.Type == nil || *doc.Type != spec.Key {
		return nil, []domain.ImportRowError{{Message: fmt.Sprintf(`the file must start with "type": %q (this is the %s format)`, spec.Key, spec.Label)}}
	}
	if doc.Items == nil {
		return nil, []domain.ImportRowError{{Message: `the file needs an "items" list`}}
	}

	kinds := make(map[string]string, len(spec.Columns))
	for _, c := range spec.Columns {
		kinds[c.Key] = c.Kind
	}
	var rows []importRow
	errs := []domain.ImportRowError{}
	for i, item := range *doc.Items {
		number := i + 1
		fields := make([]string, 0, len(item))
		for key := range item {
			fields = append(fields, key)
		}
		sort.Strings(fields)
		if fieldErrs := checkImportFields(spec, fields, number); len(fieldErrs) > 0 {
			errs = append(errs, fieldErrs...)
			continue
		}
		cells := make(map[string]string, len(item))
		for key, raw := range item {
			value, err := importJSONCell(kinds[key], raw)
			if err != "" {
				errs = append(errs, domain.ImportRowError{Row: number, Column: key, Message: err})
				continue
			}
			cells[key] = value
		}
		rows = append(rows, importRow{line: number, cells: cells})
	}
	return rows, errs
}

func isImportListKind(kind string) bool {
	switch kind {
	case importKindList, importKindRegions, importKindProviders, importKindLicenses:
		return true
	}
	return false
}

// importJSONCell converts one JSON value to the CSV cell form after checking
// it has the JSON type its kind needs.
func importJSONCell(kind string, raw json.RawMessage) (string, string) {
	if string(bytes.TrimSpace(raw)) == "null" {
		return "", ""
	}
	switch {
	case isImportListKind(kind):
		var items []string
		if err := json.Unmarshal(raw, &items); err != nil {
			return "", `must be a list of text values, e.g. ["a", "b"]`
		}
		for _, item := range items {
			if strings.Contains(item, importListSeparator) {
				return "", "list values can't contain |"
			}
		}
		return strings.Join(items, importListSeparator), ""
	case kind == importKindInteger || kind == importKindNumber:
		var n float64
		if err := json.Unmarshal(raw, &n); err != nil {
			return "", "must be a number (without quotes)"
		}
		return strconv.FormatFloat(n, 'f', -1, 64), ""
	case kind == importKindBoolean:
		var b bool
		if err := json.Unmarshal(raw, &b); err != nil {
			return "", "must be true or false (without quotes)"
		}
		return strconv.FormatBool(b), ""
	default:
		var s string
		if err := json.Unmarshal(raw, &s); err != nil {
			return "", "must be text in quotes"
		}
		return s, ""
	}
}

// importLookups resolves the references import rows use by code/slug/name.
type importLookups struct {
	regionIDs   map[string]int64
	regionCodes map[int64]string
	casinoIDs   map[string]int64
	casinoSlugs map[int64]string
	providerIDs map[string]int64
	licenseIDs  map[string]int64
}

func (s *ContentImportService) lookups(ctx context.Context) (*importLookups, error) {
	lk := &importLookups{
		regionIDs: map[string]int64{}, regionCodes: map[int64]string{}, casinoIDs: map[string]int64{},
		casinoSlugs: map[int64]string{}, providerIDs: map[string]int64{}, licenseIDs: map[string]int64{},
	}
	regions, err := s.regions.List(ctx)
	if err != nil {
		return nil, err
	}
	for _, r := range regions {
		lk.regionIDs[strings.ToLower(r.Code)] = r.ID
		lk.regionCodes[r.ID] = strings.ToLower(r.Code)
	}
	casinos, _, err := s.casinos.ListAdmin(ctx, 1, importLookupPageSize)
	if err != nil {
		return nil, err
	}
	for _, c := range casinos {
		lk.casinoIDs[c.Slug] = c.ID
		lk.casinoSlugs[c.ID] = c.Slug
	}
	providers, err := s.providers.List(ctx)
	if err != nil {
		return nil, err
	}
	for _, p := range providers {
		lk.providerIDs[strings.ToLower(p.Name)] = p.ID
	}
	licenses, err := s.licenses.List(ctx)
	if err != nil {
		return nil, err
	}
	for _, l := range licenses {
		lk.licenseIDs[strings.ToLower(l.Name)] = l.ID
	}
	return lk, nil
}

func (lk *importLookups) region(code string) int64 { return lk.regionIDs[strings.ToLower(code)] }

func (lk *importLookups) regionPtr(code string) *int64 {
	if code == "" {
		return nil
	}
	id := lk.region(code)
	return &id
}

func (lk *importLookups) regionList(codes []string) []int64 {
	ids := make([]int64, 0, len(codes))
	for _, c := range codes {
		ids = append(ids, lk.region(c))
	}
	return ids
}

func (lk *importLookups) regionCodeOf(id *int64) string {
	if id == nil {
		return ""
	}
	return lk.regionCodes[*id]
}

func (lk *importLookups) casinoPtr(slug string) *int64 {
	if slug == "" {
		return nil
	}
	id := lk.casinoIDs[slug]
	return &id
}

func (lk *importLookups) providerPtr(name string) *int64 {
	if name == "" {
		return nil
	}
	id := lk.providerIDs[strings.ToLower(name)]
	return &id
}

func (lk *importLookups) providerList(names []string) []int64 {
	ids := make([]int64, 0, len(names))
	for _, n := range names {
		ids = append(ids, lk.providerIDs[strings.ToLower(n)])
	}
	return ids
}

func (lk *importLookups) licenseList(names []string) []int64 {
	ids := make([]int64, 0, len(names))
	for _, n := range names {
		ids = append(ids, lk.licenseIDs[strings.ToLower(n)])
	}
	return ids
}

func validateImportRows(def importDef, rows []importRow, lk *importLookups) []domain.ImportRowError {
	errs := []domain.ImportRowError{}
	firstLine := map[string]int{}
	for _, r := range rows {
		for _, col := range def.spec.Columns {
			if msg := validateImportCell(col, r.text(col.Key), lk); msg != "" {
				errs = append(errs, domain.ImportRowError{Row: r.line, Column: col.Key, Message: msg})
			}
		}
		key := def.key(r)
		if line, dup := firstLine[key]; dup {
			errs = append(errs, domain.ImportRowError{Row: r.line, Message: fmt.Sprintf("is the same item as row %d (matched by %s); each item may appear only once", line, def.spec.MatchBy)})
		} else {
			firstLine[key] = r.line
		}
		if len(errs) >= importMaxErrors {
			return append(errs, domain.ImportRowError{Message: fmt.Sprintf("stopped after %d problems; fix these and check again", importMaxErrors)})
		}
	}
	return errs
}

func validateImportCell(col domain.ImportColumn, value string, lk *importLookups) string {
	if value == "" {
		if col.Required {
			return "is required"
		}
		return ""
	}
	if col.MaxLength > 0 && utf8.RuneCountInString(value) > col.MaxLength {
		return fmt.Sprintf("is longer than %d characters", col.MaxLength)
	}

	switch col.Kind {
	case importKindSlug:
		if !importSlugPattern.MatchString(value) {
			return "may only use lowercase letters, numbers and hyphens (e.g. my-casino)"
		}
	case importKindInteger:
		n, err := strconv.Atoi(value)
		if err != nil {
			return "must be a whole number"
		}
		return importRangeError(col, float64(n))
	case importKindNumber:
		n, err := strconv.ParseFloat(value, 64)
		if err != nil {
			return "must be a number"
		}
		return importRangeError(col, n)
	case importKindBoolean:
		switch strings.ToLower(value) {
		case "yes", "no", "true", "false", "1", "0":
		default:
			return "must be yes or no"
		}
	case importKindEnum:
		if !contains(col.Values, value) {
			return "must be one of: " + strings.Join(col.Values, ", ")
		}
	case importKindList:
		if len(col.Values) > 0 {
			for _, item := range (importRow{cells: map[string]string{col.Key: value}}).list(col.Key) {
				if !contains(col.Values, item) {
					return fmt.Sprintf("%q is not allowed; use: %s", item, strings.Join(col.Values, ", "))
				}
			}
		}
	case importKindDate:
		if _, err := time.Parse(importDateLayout, value); err != nil {
			return "must be a date written like 2026-12-31"
		}
	case importKindRegion:
		if _, ok := lk.regionIDs[strings.ToLower(value)]; !ok {
			return fmt.Sprintf("no region has the code %q", value)
		}
	case importKindRegions:
		for _, code := range (importRow{cells: map[string]string{col.Key: value}}).list(col.Key) {
			if _, ok := lk.regionIDs[strings.ToLower(code)]; !ok {
				return fmt.Sprintf("no region has the code %q", code)
			}
		}
	case importKindCasino:
		if _, ok := lk.casinoIDs[value]; !ok {
			return fmt.Sprintf("no casino has the slug %q", value)
		}
	case importKindProvider:
		if _, ok := lk.providerIDs[strings.ToLower(value)]; !ok {
			return fmt.Sprintf("no game provider is named %q", value)
		}
	case importKindProviders:
		for _, name := range (importRow{cells: map[string]string{col.Key: value}}).list(col.Key) {
			if _, ok := lk.providerIDs[strings.ToLower(name)]; !ok {
				return fmt.Sprintf("no game provider is named %q", name)
			}
		}
	case importKindLicenses:
		for _, name := range (importRow{cells: map[string]string{col.Key: value}}).list(col.Key) {
			if _, ok := lk.licenseIDs[strings.ToLower(name)]; !ok {
				return fmt.Sprintf("no license is named %q", name)
			}
		}
	}
	return ""
}

func importRangeError(col domain.ImportColumn, n float64) string {
	switch {
	case col.Min != nil && col.Max != nil && (n < *col.Min || n > *col.Max):
		return fmt.Sprintf("must be between %s and %s", formatImportNumber(*col.Min), formatImportNumber(*col.Max))
	case col.Min != nil && n < *col.Min:
		return fmt.Sprintf("must be at least %s", formatImportNumber(*col.Min))
	case col.Max != nil && n > *col.Max:
		return fmt.Sprintf("must be at most %s", formatImportNumber(*col.Max))
	}
	return ""
}

func formatImportNumber(n float64) string { return strconv.FormatFloat(n, 'f', -1, 64) }

// applyImportStatus publishes or un-publishes when the row says so; an empty
// status keeps new items as drafts and existing items as they are.
func applyImportStatus(ctx context.Context, r importRow, id int64, set func(context.Context, int64, domain.ContentStatus, *time.Time) error) error {
	if !r.has("status") {
		return nil
	}
	return set(ctx, id, domain.ContentStatus(r.text("status")), nil)
}

package domain

// ImportType describes one content type's import format: the exact columns
// (CSV header / JSON fields) a file must have and how existing items are
// matched (MatchBy) so a row updates instead of creating a duplicate. The
// admin shows it as the format guide and builds the templates from it.
type ImportType struct {
	Key       string         `json:"key"`
	Label     string         `json:"label"`
	MatchBy   string         `json:"matchBy"`
	AdminOnly bool           `json:"adminOnly"`
	Columns   []ImportColumn `json:"columns"`
}

// ImportColumn is one field of an import row. Kind says how the value is
// written: text, html, slug, integer, number, boolean, enum, list, date,
// region (a region code), regions, casino (a casino slug), provider,
// providers, licenses (names). Lists are |-separated in CSV and arrays in
// JSON; numbers and booleans are JSON numbers/booleans. Example is the CSV
// cell form.
type ImportColumn struct {
	Key       string   `json:"key"`
	Kind      string   `json:"kind"`
	Required  bool     `json:"required"`
	Values    []string `json:"values,omitempty"`
	Min       *float64 `json:"min,omitempty"`
	Max       *float64 `json:"max,omitempty"`
	MaxLength int      `json:"maxLength,omitempty"`
	Help      string   `json:"help"`
	Example   string   `json:"example"`
}

// ImportRowError points at one problem: Row is the CSV line (the header is
// line 1) or the JSON item number; 0 means the file as a whole.
type ImportRowError struct {
	Row     int    `json:"row"`
	Column  string `json:"column,omitempty"`
	Message string `json:"message"`
}

// ImportReport is the outcome of checking (and, unless DryRun or there were
// errors, applying) an import file. Applied is true only when rows were
// written.
type ImportReport struct {
	Type    string           `json:"type"`
	Format  string           `json:"format"`
	DryRun  bool             `json:"dryRun"`
	Rows    int              `json:"rows"`
	Created int              `json:"created"`
	Updated int              `json:"updated"`
	Applied bool             `json:"applied"`
	Errors  []ImportRowError `json:"errors"`
}

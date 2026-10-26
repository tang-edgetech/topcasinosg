package domain

import "time"

// TransferFormat is bumped whenever the bundle layout changes in a way an
// older API can't read.
const TransferFormat = 1

type TransferMode string

const (
	// TransferModeMerge creates missing items and updates matching ones;
	// nothing in the target is deleted.
	TransferModeMerge TransferMode = "merge"
	// TransferModeReplace wipes the target's content first, so it ends up an
	// exact copy of the bundle. Only allowed for whole-backoffice bundles.
	TransferModeReplace TransferMode = "replace"
)

// TransferSelection says what to export: everything, or specific items per
// catalog group (item IDs as the catalog lists them).
type TransferSelection struct {
	Whole bool
	Items map[string][]string
}

// TransferRow is one database row, column → value. Values are JSON-friendly:
// numbers, strings or nil.
type TransferRow map[string]any

// TransferBundle is the data.json inside an export zip. Selected lists the
// source IDs the user picked per table; every other row is a dependency that
// is only created when the target doesn't have it yet. A whole bundle treats
// every row as selected.
type TransferBundle struct {
	Format     int                      `json:"format"`
	AppVersion string                   `json:"appVersion"`
	ExportedAt time.Time                `json:"exportedAt"`
	Source     string                   `json:"source"`
	Whole      bool                     `json:"whole"`
	Selected   map[string][]int64       `json:"selected"`
	Users      map[string]string        `json:"users"`
	Tables     map[string][]TransferRow `json:"tables"`
	Files      []string                 `json:"files"`
}

// TransferTableReport counts what happened to one table. Linked rows already
// existed in the target and were used as-is (dependencies).
type TransferTableReport struct {
	Created int `json:"created"`
	Updated int `json:"updated"`
	Linked  int `json:"linked"`
	Deleted int `json:"deleted"`
}

type TransferReport struct {
	Name       string                         `json:"name"`
	Mode       TransferMode                   `json:"mode"`
	DryRun     bool                           `json:"dryRun"`
	Whole      bool                           `json:"whole"`
	Source     string                         `json:"source"`
	AppVersion string                         `json:"appVersion"`
	ExportedAt time.Time                      `json:"exportedAt"`
	Tables     map[string]TransferTableReport `json:"tables"`
	Files      int                            `json:"files"`
	Warnings   []string                       `json:"warnings"`
}

type TransferCatalogItem struct {
	ID     string
	Label  string
	Detail string
}

type TransferCatalogGroup struct {
	Key   string
	Label string
	Items []TransferCatalogItem
}

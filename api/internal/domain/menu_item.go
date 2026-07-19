package domain

import "time"

type MenuLocation string

const (
	MenuLocationHeader MenuLocation = "header"
	MenuLocationFooter MenuLocation = "footer"
)

func (l MenuLocation) Valid() bool {
	return l == MenuLocationHeader || l == MenuLocationFooter
}

// MenuItemSourceType lets a column's links come from live CMS data (regions,
// casinos) instead of admin-typed static links, while still being edited
// through the same tree — see MenuItem.SourceType.
type MenuItemSourceType string

const (
	MenuItemSourceStatic         MenuItemSourceType = "static"
	MenuItemSourceDynamicRegions MenuItemSourceType = "dynamic_regions"
	MenuItemSourceDynamicCasinos MenuItemSourceType = "dynamic_casinos"
)

func (t MenuItemSourceType) Valid() bool {
	switch t {
	case MenuItemSourceStatic, MenuItemSourceDynamicRegions, MenuItemSourceDynamicCasinos:
		return true
	default:
		return false
	}
}

// MenuItem is a single self-referential tree node covering both the header
// mega-menu (3 levels: tab -> column -> link) and the footer (2 levels:
// column -> link) with one schema. A node with children and no Href is a
// grouping/heading; a node with an Href is a clickable leaf. SourceType
// overrides a node's children with live data fetched from the public API
// instead of its static children (see web/'s Header.tsx and Footer.tsx).
type MenuItem struct {
	ID         int64
	Location   MenuLocation
	ParentID   *int64
	Label      string
	Href       *string
	SourceType MenuItemSourceType
	SortOrder  int
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

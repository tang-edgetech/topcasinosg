package domain

import (
	"strings"
	"time"
)

// SiteSnippet is a raw HTML/JS block injected into the site. Location is
// deliberately an enum (unlike page_sections' block_type) since there are
// exactly 3 real injection points a browser document has — head, top of
// body, bottom of body — and that's not expected to grow the way page block
// types do.
//
// Kind splits the feature in two, matching the admin's "Header & Footer" vs
// "Code" tabs:
//   - KindGlobal: today's original behavior — unconditional, every page.
//   - KindCode: has a CodeType (for the admin's own organization/auto-
//     wrapping — see web/'s snippet renderer), a Priority (lower runs
//     first, admin range 0-100), and Conditions that gate whether it
//     applies to a given request at all (see SnippetCondition).
type SiteSnippet struct {
	ID         int64
	Name       string
	Kind       SnippetKind
	CodeType   *CodeType
	Location   SnippetLocation
	Content    string
	IsActive   bool
	SortOrder  int
	Priority   int
	Conditions []SnippetCondition
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

type SnippetKind string

const (
	SnippetKindGlobal SnippetKind = "global"
	SnippetKindCode   SnippetKind = "code"
)

func (k SnippetKind) Valid() bool {
	return k == SnippetKindGlobal || k == SnippetKindCode
}

// CodeType has no runtime effect beyond auto-wrapping (css -> <style>, js ->
// <script>) — there's no PHP (or any server-side) interpreter in this
// stack, so this is a fixed 4-value set, not an open VARCHAR like
// page_sections.block_type.
type CodeType string

const (
	CodeTypeHTML      CodeType = "html"
	CodeTypeCSS       CodeType = "css"
	CodeTypeJS        CodeType = "js"
	CodeTypeUniversal CodeType = "universal"
)

func (t CodeType) Valid() bool {
	switch t {
	case CodeTypeHTML, CodeTypeCSS, CodeTypeJS, CodeTypeUniversal:
		return true
	default:
		return false
	}
}

type SnippetLocation string

const (
	SnippetLocationHead   SnippetLocation = "head"
	SnippetLocationBody   SnippetLocation = "body"
	SnippetLocationFooter SnippetLocation = "footer"
)

func (l SnippetLocation) Valid() bool {
	switch l {
	case SnippetLocationHead, SnippetLocationBody, SnippetLocationFooter:
		return true
	default:
		return false
	}
}

// SnippetCondition is one targeting rule on a KindCode snippet. All of a
// snippet's conditions must match (AND) for it to apply to a request; zero
// conditions means it applies everywhere, same reach as a KindGlobal
// snippet.
type SnippetCondition struct {
	ID        int64
	SnippetID int64
	Field     ConditionField
	Operator  ConditionOperator
	PageID    *int64
	Value     string
	SortOrder int
}

type ConditionField string

const (
	ConditionFieldPage ConditionField = "page"
	ConditionFieldURL  ConditionField = "url"
)

type ConditionOperator string

const (
	ConditionOperatorIs         ConditionOperator = "is"
	ConditionOperatorIsNot      ConditionOperator = "is_not"
	ConditionOperatorContains   ConditionOperator = "contains"
	ConditionOperatorNotContain ConditionOperator = "not_contains"
)

// Valid enforces that "page" conditions only use is/is_not (a page either
// is or isn't the current one — "contains" has no meaning for an ID
// comparison) while "url" conditions can use any of the 4 operators.
func (c SnippetCondition) Valid() bool {
	if !c.Field.validField() {
		return false
	}
	switch c.Field {
	case ConditionFieldPage:
		return c.Operator == ConditionOperatorIs || c.Operator == ConditionOperatorIsNot
	case ConditionFieldURL:
		switch c.Operator {
		case ConditionOperatorIs, ConditionOperatorIsNot, ConditionOperatorContains, ConditionOperatorNotContain:
			return true
		}
	}
	return false
}

func (f ConditionField) validField() bool {
	return f == ConditionFieldPage || f == ConditionFieldURL
}

// Matches evaluates this single condition against the current request's
// resolved page id (nil if the current route isn't backed by the Pages
// CMS — see PageRepo.ResolvePageIDForPath) and raw path.
func (c SnippetCondition) Matches(currentPageID *int64, path string) bool {
	switch c.Field {
	case ConditionFieldPage:
		isSamePage := currentPageID != nil && c.PageID != nil && *currentPageID == *c.PageID
		if c.Operator == ConditionOperatorIsNot {
			return !isSamePage
		}
		return isSamePage
	case ConditionFieldURL:
		switch c.Operator {
		case ConditionOperatorIs:
			return path == c.Value
		case ConditionOperatorIsNot:
			return path != c.Value
		case ConditionOperatorContains:
			return c.Value != "" && strings.Contains(path, c.Value)
		case ConditionOperatorNotContain:
			return c.Value == "" || !strings.Contains(path, c.Value)
		}
	}
	return false
}

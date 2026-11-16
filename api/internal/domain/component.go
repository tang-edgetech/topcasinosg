package domain

import (
	"regexp"
	"time"
)

// Component is a reusable page element written as HTML, CSS and JavaScript
// (admin Components): a calculator, a number generator, a quiz... It is made
// once and placed on any page with a "component" block (BlockTypeComponent),
// whose componentId field picks it. Settings are the component's own
// options, filled in per placement (a heading, a starting tab...), so one
// component can look different on each page while its code stays in one
// place. Editing a component changes every page that places it.
//
// The public site runs it like a custom_code block: in a sandboxed iframe
// that can't reach the page, its cookies or the backoffice
// (web/src/components/sections/ComponentBlock.tsx).
type Component struct {
	ID          int64
	Name        string
	Description string
	HTML        string
	CSS         string
	JS          string
	Settings    []ComponentSetting
	// UsageCount is how many pages place it (read-time only).
	UsageCount int
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

// ComponentSetting is one option a placement can fill in. Its value reaches
// the component's code two ways: {{key}} in the HTML is replaced by it
// (HTML-escaped, except richtext), and window.settings.key holds it in the
// JavaScript. An empty value falls back to Default.
type ComponentSetting struct {
	Key     string                   `json:"key"`
	Label   string                   `json:"label"`
	Type    ComponentSettingType     `json:"type"`
	Default string                   `json:"default"`
	Help    string                   `json:"help,omitempty"`
	Options []ComponentSettingOption `json:"options,omitempty"`
}

type ComponentSettingOption struct {
	Value string `json:"value"`
	Label string `json:"label"`
}

type ComponentSettingType string

const (
	ComponentSettingText     ComponentSettingType = "text"
	ComponentSettingTextarea ComponentSettingType = "textarea"
	ComponentSettingRichtext ComponentSettingType = "richtext"
	ComponentSettingNumber   ComponentSettingType = "number"
	ComponentSettingSelect   ComponentSettingType = "select"
	ComponentSettingToggle   ComponentSettingType = "toggle"
)

func (t ComponentSettingType) Valid() bool {
	switch t {
	case ComponentSettingText, ComponentSettingTextarea, ComponentSettingRichtext,
		ComponentSettingNumber, ComponentSettingSelect, ComponentSettingToggle:
		return true
	}
	return false
}

// FieldType is how a placement stores the setting's value.
func (t ComponentSettingType) FieldType() string {
	if t == ComponentSettingRichtext {
		return "richtext"
	}
	return "text"
}

// BlockTypeComponent places a Component on a page; its "componentId" field
// holds the component's id and its other fields are the setting values.
const BlockTypeComponent = "component"

// ComponentIDField is the component block's field naming the component.
const ComponentIDField = "componentId"

const (
	MaxComponentSettings       = 30
	MaxComponentSettingOptions = 50
	MaxComponentRevisions      = 10
)

// ComponentSettingKeyPattern: camelCase, so it reads well as
// window.settings.key and {{key}}.
var ComponentSettingKeyPattern = regexp.MustCompile(`^[a-z][a-zA-Z0-9]{0,39}$`)

// reservedStyleKey matches the Style tab's fields (stPadding, stBgColor...),
// which every section can carry, so a setting can't use those names.
var reservedStyleKey = regexp.MustCompile(`^st[A-Z]`)

// ReservedComponentSettingKey reports keys a setting can't use because a
// placed section already uses them for something else.
func ReservedComponentSettingKey(key string) bool {
	switch key {
	case ComponentIDField, "panelTitle", "settings":
		return true
	}
	return reservedStyleKey.MatchString(key)
}

// ComponentSnapshot is the editable part of a component, stored as JSON on
// a revision.
type ComponentSnapshot struct {
	Name        string             `json:"name"`
	Description string             `json:"description"`
	HTML        string             `json:"html"`
	CSS         string             `json:"css"`
	JS          string             `json:"js"`
	Settings    []ComponentSetting `json:"settings"`
}

func (c *Component) Snapshot() ComponentSnapshot {
	return ComponentSnapshot{Name: c.Name, Description: c.Description, HTML: c.HTML, CSS: c.CSS, JS: c.JS, Settings: c.Settings}
}

// ComponentRevision is one saved version of a component.
type ComponentRevision struct {
	ID          int64
	ComponentID int64
	Snapshot    ComponentSnapshot
	SavedByID   *int64
	SavedByName string
	CreatedAt   time.Time
}

package service

import (
	"errors"
	"strings"
	"testing"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

func validComponent() ComponentInput {
	return ComponentInput{
		Name: " Lucky Number Generator ",
		HTML: "<h2>{{heading}}</h2>",
		Settings: []domain.ComponentSetting{
			{Key: "heading", Label: "Heading", Type: domain.ComponentSettingText, Default: "Lucky"},
			{Key: "defaultTab", Type: domain.ComponentSettingSelect, Default: "toto", Options: []domain.ComponentSettingOption{{Value: "toto"}, {Value: "4d", Label: "4D"}}},
			{Key: "showNote", Type: domain.ComponentSettingToggle, Default: "yes"},
			{Key: "count", Type: domain.ComponentSettingNumber, Default: "6"},
		},
	}
}

func TestComponentNormalizeAcceptsAndTidies(t *testing.T) {
	in := validComponent()
	if err := in.normalize(); err != nil {
		t.Fatalf("valid component refused: %v", err)
	}
	if in.Name != "Lucky Number Generator" {
		t.Errorf("name not trimmed: %q", in.Name)
	}
	if in.Settings[1].Label != "defaultTab" || in.Settings[1].Options[0].Label != "toto" {
		t.Errorf("empty labels should fall back to the key/value: %+v", in.Settings[1])
	}
}

func TestComponentNormalizeRefuses(t *testing.T) {
	cases := map[string]func(*ComponentInput){
		"no name":            func(c *ComponentInput) { c.Name = "  " },
		"no code":            func(c *ComponentInput) { c.HTML, c.JS = " ", "" },
		"code too large":     func(c *ComponentInput) { c.JS = strings.Repeat("x", domain.CustomCodeMaxBytes+1) },
		"bad key":            func(c *ComponentInput) { c.Settings[0].Key = "Heading" },
		"key with dash":      func(c *ComponentInput) { c.Settings[0].Key = "my-heading" },
		"reserved key":       func(c *ComponentInput) { c.Settings[0].Key = "componentId" },
		"style key":          func(c *ComponentInput) { c.Settings[0].Key = "stPadding" },
		"duplicate key":      func(c *ComponentInput) { c.Settings[1].Key = "heading" },
		"unknown type":       func(c *ComponentInput) { c.Settings[0].Type = "colour" },
		"select no options":  func(c *ComponentInput) { c.Settings[1].Options = nil },
		"default not option": func(c *ComponentInput) { c.Settings[1].Default = "lotto" },
		"duplicate option":   func(c *ComponentInput) { c.Settings[1].Options[1].Value = "toto" },
		"toggle default":     func(c *ComponentInput) { c.Settings[2].Default = "maybe" },
		"number default":     func(c *ComponentInput) { c.Settings[3].Default = "six" },
	}
	for name, change := range cases {
		in := validComponent()
		change(&in)
		if err := in.normalize(); !errors.Is(err, ErrInvalidComponent) {
			t.Errorf("%s: got %v, want ErrInvalidComponent", name, err)
		}
	}
}

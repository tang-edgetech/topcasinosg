package service

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

// ErrInvalidComponent wraps every reason a component can't be saved, with
// the reason in the message (admin Components shows it as is).
var ErrInvalidComponent = errors.New("invalid component")

// ErrComponentInUse: a component placed on pages can't be deleted.
var ErrComponentInUse = errors.New("this component is still placed on some pages; remove it from them first")

func invalidComponent(format string, args ...any) error {
	return fmt.Errorf("%w: %s", ErrInvalidComponent, fmt.Sprintf(format, args...))
}

// ComponentService manages Components (admin Components). Creating,
// editing and deleting them is for Super Admins and Admins (server.go);
// editors only place them on pages.
type ComponentService struct {
	components *repository.ComponentRepo
}

func NewComponentService(components *repository.ComponentRepo) *ComponentService {
	return &ComponentService{components: components}
}

type ComponentInput struct {
	Name        string
	Description string
	HTML        string
	CSS         string
	JS          string
	Settings    []domain.ComponentSetting
}

// normalize trims what should be trimmed and validates everything before
// anything is written.
func (in *ComponentInput) normalize() error {
	in.Name = strings.TrimSpace(in.Name)
	in.Description = strings.TrimSpace(in.Description)
	if in.Name == "" {
		return invalidComponent("a component needs a name")
	}
	if len([]rune(in.Name)) > 150 {
		return invalidComponent("the name can be at most 150 characters")
	}
	if len([]rune(in.Description)) > 500 {
		return invalidComponent("the description can be at most 500 characters")
	}
	if strings.TrimSpace(in.HTML) == "" && strings.TrimSpace(in.JS) == "" {
		return invalidComponent("a component needs some HTML or JavaScript")
	}
	for name, code := range map[string]string{"HTML": in.HTML, "CSS": in.CSS, "JavaScript": in.JS} {
		if len(code) > domain.CustomCodeMaxBytes {
			return invalidComponent("the %s is %d KB; it can be at most %d KB (load big libraries from a CDN instead)", name, len(code)/1024, domain.CustomCodeMaxBytes/1024)
		}
	}
	if len(in.Settings) > domain.MaxComponentSettings {
		return invalidComponent("a component can have at most %d settings", domain.MaxComponentSettings)
	}
	seen := map[string]bool{}
	for i := range in.Settings {
		s := &in.Settings[i]
		s.Key = strings.TrimSpace(s.Key)
		s.Label = strings.TrimSpace(s.Label)
		s.Help = strings.TrimSpace(s.Help)
		where := fmt.Sprintf("setting %d", i+1)
		if s.Key != "" {
			where = fmt.Sprintf("setting %q", s.Key)
		}
		if !domain.ComponentSettingKeyPattern.MatchString(s.Key) {
			return invalidComponent("%s: the key must start with a small letter and use only letters and numbers, like heading or defaultTab", where)
		}
		if domain.ReservedComponentSettingKey(s.Key) {
			return invalidComponent("%s: %q is used by every page block, choose another key", where, s.Key)
		}
		if seen[s.Key] {
			return invalidComponent("%s: two settings have the same key", where)
		}
		seen[s.Key] = true
		if s.Label == "" {
			s.Label = s.Key
		}
		if !s.Type.Valid() {
			return invalidComponent("%s: type must be text, textarea, richtext, number, select or toggle", where)
		}
		if s.Type != domain.ComponentSettingSelect {
			s.Options = nil
		}
		switch s.Type {
		case domain.ComponentSettingSelect:
			if len(s.Options) == 0 || len(s.Options) > domain.MaxComponentSettingOptions {
				return invalidComponent("%s: a select needs 1 to %d options", where, domain.MaxComponentSettingOptions)
			}
			values := map[string]bool{}
			for j := range s.Options {
				o := &s.Options[j]
				o.Value = strings.TrimSpace(o.Value)
				o.Label = strings.TrimSpace(o.Label)
				if o.Value == "" {
					return invalidComponent("%s: option %d needs a value", where, j+1)
				}
				if values[o.Value] {
					return invalidComponent("%s: two options have the value %q", where, o.Value)
				}
				values[o.Value] = true
				if o.Label == "" {
					o.Label = o.Value
				}
			}
			if s.Default != "" && !values[s.Default] {
				return invalidComponent("%s: the default %q isn't one of its options", where, s.Default)
			}
		case domain.ComponentSettingToggle:
			if s.Default != "" && s.Default != "yes" && s.Default != "no" {
				return invalidComponent("%s: a toggle's default is yes or no", where)
			}
		case domain.ComponentSettingNumber:
			if s.Default != "" {
				if _, err := strconv.ParseFloat(strings.TrimSpace(s.Default), 64); err != nil {
					return invalidComponent("%s: the default must be a number", where)
				}
			}
		}
	}
	if in.Settings == nil {
		in.Settings = []domain.ComponentSetting{}
	}
	return nil
}

func (s *ComponentService) List(ctx context.Context) ([]domain.Component, error) {
	return s.components.List(ctx)
}

func (s *ComponentService) Get(ctx context.Context, id int64) (*domain.Component, error) {
	return s.components.GetByID(ctx, id)
}

func (s *ComponentService) UsedOn(ctx context.Context, id int64) ([]domain.Page, error) {
	if _, err := s.components.GetByID(ctx, id); err != nil {
		return nil, err
	}
	return s.components.UsedOn(ctx, id)
}

func (s *ComponentService) Revisions(ctx context.Context, id int64) ([]domain.ComponentRevision, error) {
	if _, err := s.components.GetByID(ctx, id); err != nil {
		return nil, err
	}
	return s.components.ListRevisions(ctx, id)
}

func (in ComponentInput) component() *domain.Component {
	return &domain.Component{Name: in.Name, Description: in.Description, HTML: in.HTML, CSS: in.CSS, JS: in.JS, Settings: in.Settings}
}

func (s *ComponentService) Create(ctx context.Context, in ComponentInput, savedBy *int64) (*domain.Component, error) {
	if err := in.normalize(); err != nil {
		return nil, err
	}
	if taken, err := s.components.NameTaken(ctx, in.Name, 0); err != nil {
		return nil, err
	} else if taken {
		return nil, ErrAlreadyExists
	}
	id, err := s.components.Create(ctx, in.component(), savedBy)
	if err != nil {
		return nil, err
	}
	return s.components.GetByID(ctx, id)
}

func (s *ComponentService) Update(ctx context.Context, id int64, in ComponentInput, savedBy *int64) (*domain.Component, error) {
	if err := in.normalize(); err != nil {
		return nil, err
	}
	if _, err := s.components.GetByID(ctx, id); err != nil {
		return nil, err
	}
	if taken, err := s.components.NameTaken(ctx, in.Name, id); err != nil {
		return nil, err
	} else if taken {
		return nil, ErrAlreadyExists
	}
	if err := s.components.Update(ctx, id, in.component(), savedBy); err != nil {
		return nil, err
	}
	return s.components.GetByID(ctx, id)
}

// Delete refuses while any page places the component, so deleting never
// leaves a hole in a live page.
func (s *ComponentService) Delete(ctx context.Context, id int64) error {
	c, err := s.components.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if c.UsageCount > 0 {
		return ErrComponentInUse
	}
	return s.components.Delete(ctx, id)
}

// CheckPlacement checks a "component" block's fields against its
// component: componentId names an existing component, every other field
// is one of its settings (Style tab fields and panelTitle aside), and a
// select or toggle holds one of its values. The message names the problem
// and the valid choices, for an AI tool to fix and resend.
func (s *ComponentService) CheckPlacement(ctx context.Context, where string, fields []FieldInput) error {
	var idText string
	for _, f := range fields {
		if f.ItemIndex == 0 && f.FieldKey == domain.ComponentIDField {
			idText = strings.TrimSpace(f.TextValue)
		}
	}
	id, err := strconv.ParseInt(idText, 10, 64)
	if err != nil || id <= 0 {
		return invalid("%s: a component block needs a componentId field with a component's id (GET /api/v1/components)", where)
	}
	c, err := s.components.GetByID(ctx, id)
	if errors.Is(err, repository.ErrNotFound) {
		return invalid("%s: there is no component %d (GET /api/v1/components)", where, id)
	}
	if err != nil {
		return err
	}
	settings := map[string]domain.ComponentSetting{}
	keys := make([]string, 0, len(c.Settings))
	for _, st := range c.Settings {
		settings[st.Key] = st
		keys = append(keys, st.Key)
	}
	for j, f := range fields {
		fwhere := fmt.Sprintf("%s.fields[%d]", where, j)
		if f.FieldKey == domain.ComponentIDField || f.FieldKey == "panelTitle" || domain.ReservedComponentSettingKey(f.FieldKey) {
			continue
		}
		st, ok := settings[f.FieldKey]
		if !ok {
			list := "none"
			if len(keys) > 0 {
				list = strings.Join(keys, ", ")
			}
			return invalid("%s: component %q has no setting %q. Its settings: %s", fwhere, c.Name, f.FieldKey, list)
		}
		if f.ItemIndex != 0 {
			return invalid("%s: component settings go on itemIndex 0", fwhere)
		}
		value := strings.TrimSpace(f.TextValue)
		switch st.Type {
		case domain.ComponentSettingSelect:
			if value != "" {
				allowed := make([]string, len(st.Options))
				found := false
				for i, o := range st.Options {
					allowed[i] = o.Value
					found = found || o.Value == value
				}
				if !found {
					return invalid("%s: %q must be one of: %s", fwhere, f.FieldKey, strings.Join(allowed, ", "))
				}
			}
		case domain.ComponentSettingToggle:
			if value != "" && value != "yes" && value != "no" {
				return invalid("%s: %q must be yes or no", fwhere, f.FieldKey)
			}
		case domain.ComponentSettingNumber:
			if value != "" {
				if _, err := strconv.ParseFloat(value, 64); err != nil {
					return invalid("%s: %q must be a number", fwhere, f.FieldKey)
				}
			}
		}
	}
	return nil
}

package service

import (
	"errors"
	"testing"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

func TestValidateContainersNesting(t *testing.T) {
	at := func(blockType string, depth int) domain.PageSection {
		return domain.PageSection{BlockType: blockType, Depth: depth}
	}
	container := func(depth int) domain.PageSection { return at(domain.BlockTypeContainer, depth) }
	tests := []struct {
		name     string
		sections []domain.PageSection
		ok       bool
	}{
		{"flat page", []domain.PageSection{container(0), at("hero", 1), at("faq", 1)}, true},
		{"old InContainer only", []domain.PageSection{container(0), {BlockType: "hero", InContainer: true}}, true},
		{"two columns", []domain.PageSection{container(0), container(1), at("image", 2), container(1), at("title_set", 2), at("button_group", 2)}, true},
		{"back out a level", []domain.PageSection{container(0), container(1), at("image", 2), at("faq", 1)}, true},
		{"four levels", []domain.PageSection{container(0), container(1), container(2), container(3), at("image", 4)}, true},
		{"skips a level", []domain.PageSection{container(0), at("image", 2)}, false},
		{"under a component", []domain.PageSection{container(0), at("hero", 1), at("image", 2)}, false},
		{"too deep", []domain.PageSection{container(0), container(1), container(2), container(3), container(4)}, false},
		{"level 1 with no container", []domain.PageSection{at("hero", 1)}, false},
		{"after leaving a column", []domain.PageSection{container(0), container(1), at("image", 2), at("faq", 1), at("hero", 2)}, false},
	}
	for _, tt := range tests {
		for i := range tt.sections {
			tt.sections[i].SortOrder = i
		}
		err := validateContainers(tt.sections)
		if tt.ok && err != nil {
			t.Errorf("%s: unexpected error %v", tt.name, err)
		}
		if !tt.ok && !errors.Is(err, ErrInvalidContainer) {
			t.Errorf("%s: got %v, want ErrInvalidContainer", tt.name, err)
		}
	}
}

func TestNormalizeSectionDepths(t *testing.T) {
	sections := []domain.PageSection{{InContainer: true}, {Depth: 2}, {}}
	domain.NormalizeSectionDepths(sections)
	if sections[0].Depth != 1 || !sections[0].InContainer {
		t.Errorf("InContainer only: got depth %d", sections[0].Depth)
	}
	if !sections[1].InContainer {
		t.Error("depth 2 should be InContainer")
	}
	if sections[2].Depth != 0 || sections[2].InContainer {
		t.Error("level 0 changed")
	}
}

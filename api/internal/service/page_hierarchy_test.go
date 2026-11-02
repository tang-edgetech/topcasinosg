package service

import (
	"errors"
	"testing"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

func TestValidateHierarchyAllowsOnlyContainersAtLevelZero(t *testing.T) {
	container := domain.PageSection{BlockType: domain.BlockTypeContainer}
	global := domain.PageSection{BlockType: domain.BlockTypeGlobalSection}
	inside := func(blockType string) domain.PageSection {
		return domain.PageSection{BlockType: blockType, InContainer: true}
	}
	tests := []struct {
		name     string
		sections []domain.PageSection
		ok       bool
	}{
		{"empty page", nil, true},
		{"container with components", []domain.PageSection{container, inside("hero"), inside("rich_text")}, true},
		{"global section at level 0", []domain.PageSection{global, container, inside("faq")}, true},
		{"global section inside a container", []domain.PageSection{container, inside(domain.BlockTypeGlobalSection)}, true},
		{"component at level 0", []domain.PageSection{{BlockType: "hero"}}, false},
		{"component after a container's children", []domain.PageSection{container, inside("hero"), {BlockType: "faq"}}, false},
	}
	for _, tt := range tests {
		err := validateHierarchy(tt.sections)
		if tt.ok && err != nil {
			t.Errorf("%s: unexpected error %v", tt.name, err)
		}
		if !tt.ok && !errors.Is(err, ErrComponentOutsideContainer) {
			t.Errorf("%s: got %v, want ErrComponentOutsideContainer", tt.name, err)
		}
	}
}

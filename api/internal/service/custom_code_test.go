package service

import (
	"errors"
	"strings"
	"testing"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

func customCodeSections(fieldKey, value string) []domain.PageSection {
	return []domain.PageSection{
		{BlockType: domain.BlockTypeContainer, Depth: 0},
		{BlockType: domain.BlockTypeCustomCode, Depth: 1, InContainer: true, Fields: []domain.PageSectionField{
			{FieldKey: fieldKey, FieldType: "text", TextValue: value},
		}},
	}
}

func TestCustomCodeSizeCap(t *testing.T) {
	atLimit := strings.Repeat("a", domain.CustomCodeMaxBytes)
	over := atLimit + "a"

	for _, key := range domain.CustomCodeFields {
		if err := validateSections(customCodeSections(key, atLimit)); err != nil {
			t.Errorf("%s at the limit: got %v, want it accepted", key, err)
		}
		if err := validateSections(customCodeSections(key, over)); !errors.Is(err, ErrCustomCodeTooLarge) {
			t.Errorf("%s over the limit: got %v, want ErrCustomCodeTooLarge", key, err)
		}
	}
	// Other fields of the block, and the same keys on other blocks, aren't capped.
	if err := validateSections(customCodeSections("title", over)); err != nil {
		t.Errorf("title over the limit: got %v, want it accepted", err)
	}
	if customCodeTooLarge("text", "html", over) {
		t.Error("an html field on another block type was capped")
	}
}

package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/security"
)

const pagePreviewLifetime = time.Hour

// validateSections is the shared check for any section tree before it is
// stored: containers placed correctly, and only known block/field types.
func validateSections(sections []domain.PageSection) error {
	if err := validateContainers(sections); err != nil {
		return err
	}
	for i := range sections {
		if !isKnownBlockType(sections[i].BlockType) {
			return ErrInvalidBlockType
		}
		for j := range sections[i].Fields {
			if !isKnownFieldType(sections[i].Fields[j].FieldType) {
				return ErrInvalidFieldType
			}
		}
	}
	return nil
}

func (s *PageService) ListTemplates(ctx context.Context) ([]domain.SectionTemplate, error) {
	return s.pages.ListTemplates(ctx)
}

// CreateTemplate saves a copy of the given sections as a named template.
// Inserting it later copies its sections into the page; editing the page
// never changes the template, and the template never changes pages.
func (s *PageService) CreateTemplate(ctx context.Context, name string, sections []domain.PageSection) (int64, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return 0, ErrTemplateNameRequired
	}
	if len(sections) == 0 {
		return 0, ErrTemplateEmpty
	}
	if err := validateSections(sections); err != nil {
		return 0, err
	}
	id, err := s.pages.Create(ctx, &domain.Page{
		Kind:   domain.PageKindTemplate,
		Slug:   fmt.Sprintf("_template-%d", time.Now().UnixNano()),
		Title:  name,
		Status: domain.ContentStatusDraft,
	})
	if err != nil {
		return 0, err
	}
	if err := s.pages.ReplaceSections(ctx, id, sections); err != nil {
		_ = s.pages.Delete(ctx, id)
		return 0, err
	}
	return id, nil
}

func (s *PageService) TemplateSections(ctx context.Context, id int64) ([]domain.PageSection, error) {
	if err := s.pages.TemplateExists(ctx, id); err != nil {
		return nil, err
	}
	return s.pages.GetSectionsWithFields(ctx, id)
}

func (s *PageService) DeleteTemplate(ctx context.Context, id int64) error {
	if err := s.pages.TemplateExists(ctx, id); err != nil {
		return err
	}
	return s.pages.Delete(ctx, id)
}

// CreatePreview keeps a page's unsaved sections for an hour under a random
// token, which the public site renders at /preview/{token}. Only the
// token's hash is stored.
func (s *PageService) CreatePreview(ctx context.Context, pageID int64, sections []domain.PageSection) (string, error) {
	if _, err := s.pages.GetByID(ctx, pageID); err != nil {
		return "", err
	}
	if err := validateSections(sections); err != nil {
		return "", err
	}
	token, err := security.GenerateOpaqueToken()
	if err != nil {
		return "", err
	}
	if err := s.pages.CreatePreview(ctx, security.HashToken(token), pageID, sections, time.Now().Add(pagePreviewLifetime)); err != nil {
		return "", err
	}
	return token, nil
}

func (s *PageService) GetPreview(ctx context.Context, token string) (*domain.Page, []domain.PageSection, error) {
	pageID, sections, err := s.pages.GetPreview(ctx, security.HashToken(token))
	if err != nil {
		return nil, nil, err
	}
	page, err := s.pages.GetByID(ctx, pageID)
	if err != nil {
		return nil, nil, err
	}
	for i := range sections {
		sections[i].ID = int64(i + 1)
	}
	return page, sections, nil
}

package service

import (
	"context"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

// SidebarService — same requireManageRole gate as Region/GameProvider/
// License: this is structural site-wide config, not day-to-day content.
type SidebarService struct {
	sidebar *repository.SidebarRepo
}

func NewSidebarService(sidebar *repository.SidebarRepo) *SidebarService {
	return &SidebarService{sidebar: sidebar}
}

func (s *SidebarService) GetAll(ctx context.Context) ([]domain.SidebarSection, error) {
	return s.sidebar.GetAll(ctx)
}

// ReplaceAll rejects a save that renames/adds/removes a section — the 3
// sections are fixed at the schema level (seeded once in the migration),
// so every submitted section must match an existing ID.
func (s *SidebarService) ReplaceAll(ctx context.Context, actor *domain.AdminUser, sections []domain.SidebarSection) error {
	if err := requireManageRole(actor); err != nil {
		return err
	}
	existing, err := s.sidebar.GetAll(ctx)
	if err != nil {
		return err
	}
	existingIDs := make(map[int64]bool, len(existing))
	for _, e := range existing {
		existingIDs[e.ID] = true
	}
	if len(sections) != len(existing) {
		return ErrInvalidSidebarSections
	}
	for _, s := range sections {
		if !existingIDs[s.ID] {
			return ErrInvalidSidebarSections
		}
	}
	return s.sidebar.ReplaceAll(ctx, sections)
}

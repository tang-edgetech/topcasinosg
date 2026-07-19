package service

import (
	"context"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

// MenuItemService manages the header mega-menu and footer link tree.
// Reads (List) are open to any authenticated content-staff role so the page
// itself can be read-only-viewed, but writes are Super Admin + Admin only —
// site navigation is structural, same tier as Regions and Site Settings.
type MenuItemService struct {
	items *repository.MenuItemRepo
}

func NewMenuItemService(items *repository.MenuItemRepo) *MenuItemService {
	return &MenuItemService{items: items}
}

func (s *MenuItemService) ListByLocation(ctx context.Context, location domain.MenuLocation) ([]domain.MenuItem, error) {
	return s.items.ListByLocation(ctx, location)
}

func (s *MenuItemService) Create(ctx context.Context, actor *domain.AdminUser, item *domain.MenuItem) (*domain.MenuItem, error) {
	if err := requireManageRole(actor); err != nil {
		return nil, err
	}
	if !item.Location.Valid() {
		return nil, ErrInvalidMenuLocation
	}
	if !item.SourceType.Valid() {
		return nil, ErrInvalidMenuSourceType
	}
	if item.ParentID != nil {
		parent, err := s.items.GetByID(ctx, *item.ParentID)
		if err != nil {
			return nil, err
		}
		if parent.Location != item.Location {
			return nil, ErrMenuParentLocationMismatch
		}
	}
	id, err := s.items.Create(ctx, item)
	if err != nil {
		return nil, err
	}
	return s.items.GetByID(ctx, id)
}

func (s *MenuItemService) Update(ctx context.Context, actor *domain.AdminUser, id int64, label string, href *string, sourceType domain.MenuItemSourceType, sortOrder int) error {
	if err := requireManageRole(actor); err != nil {
		return err
	}
	if !sourceType.Valid() {
		return ErrInvalidMenuSourceType
	}
	return s.items.Update(ctx, id, label, href, sourceType, sortOrder)
}

func (s *MenuItemService) Delete(ctx context.Context, actor *domain.AdminUser, id int64) error {
	if err := requireManageRole(actor); err != nil {
		return err
	}
	return s.items.Delete(ctx, id)
}

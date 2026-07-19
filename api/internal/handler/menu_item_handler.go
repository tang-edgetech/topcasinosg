package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/httpx"
	"github.com/tang-edgetech/topcasinosg/api/internal/middleware"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

type MenuItemHandler struct {
	items *service.MenuItemService
}

func NewMenuItemHandler(items *service.MenuItemService) *MenuItemHandler {
	return &MenuItemHandler{items: items}
}

// MenuItemDTO is a flat row — used by the admin tree editor, which needs
// ParentID to know where each node sits without re-deriving it from nesting.
type MenuItemDTO struct {
	ID         int64   `json:"id"`
	Location   string  `json:"location"`
	ParentID   *int64  `json:"parentId"`
	Label      string  `json:"label"`
	Href       *string `json:"href"`
	SourceType string  `json:"sourceType"`
	SortOrder  int     `json:"sortOrder"`
}

func toMenuItemDTO(m *domain.MenuItem) MenuItemDTO {
	return MenuItemDTO{
		ID:         m.ID,
		Location:   string(m.Location),
		ParentID:   m.ParentID,
		Label:      m.Label,
		Href:       m.Href,
		SourceType: string(m.SourceType),
		SortOrder:  m.SortOrder,
	}
}

// MenuNodeDTO is the nested shape the public site consumes directly — no
// parentId needed since the tree structure already encodes it.
type MenuNodeDTO struct {
	ID         int64         `json:"id"`
	Label      string        `json:"label"`
	Href       *string       `json:"href"`
	SourceType string        `json:"sourceType"`
	Children   []MenuNodeDTO `json:"children"`
}

func buildMenuTree(items []domain.MenuItem) []MenuNodeDTO {
	childrenByParent := make(map[int64][]domain.MenuItem)
	var roots []domain.MenuItem
	for _, item := range items {
		if item.ParentID == nil {
			roots = append(roots, item)
		} else {
			childrenByParent[*item.ParentID] = append(childrenByParent[*item.ParentID], item)
		}
	}

	var build func(nodes []domain.MenuItem) []MenuNodeDTO
	build = func(nodes []domain.MenuItem) []MenuNodeDTO {
		out := make([]MenuNodeDTO, len(nodes))
		for i, n := range nodes {
			out[i] = MenuNodeDTO{
				ID:         n.ID,
				Label:      n.Label,
				Href:       n.Href,
				SourceType: string(n.SourceType),
				Children:   build(childrenByParent[n.ID]),
			}
		}
		return out
	}
	return build(roots)
}

func menuItemErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrForbidden):
		return http.StatusForbidden
	case errors.Is(err, service.ErrInvalidMenuLocation), errors.Is(err, service.ErrInvalidMenuSourceType), errors.Is(err, service.ErrMenuParentLocationMismatch):
		return http.StatusBadRequest
	case errors.Is(err, repository.ErrNotFound):
		return http.StatusNotFound
	default:
		return http.StatusInternalServerError
	}
}

func parseMenuLocation(r *http.Request) (domain.MenuLocation, bool) {
	loc := domain.MenuLocation(r.URL.Query().Get("location"))
	return loc, loc.Valid()
}

// List — admin tree editor, flat rows for one location.
func (h *MenuItemHandler) List(w http.ResponseWriter, r *http.Request) {
	location, ok := parseMenuLocation(r)
	if !ok {
		response.Err(w, http.StatusBadRequest, "location must be 'header' or 'footer'")
		return
	}
	items, err := h.items.ListByLocation(r.Context(), location)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load menu items")
		return
	}
	dtos := make([]MenuItemDTO, len(items))
	for i := range items {
		dtos[i] = toMenuItemDTO(&items[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"menuItems": dtos})
}

// ListPublic — nested tree, no auth, consumed directly by web/'s Header and
// Footer components.
func (h *MenuItemHandler) ListPublic(w http.ResponseWriter, r *http.Request) {
	location, ok := parseMenuLocation(r)
	if !ok {
		response.Err(w, http.StatusBadRequest, "location must be 'header' or 'footer'")
		return
	}
	items, err := h.items.ListByLocation(r.Context(), location)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load menu")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"items": buildMenuTree(items)})
}

type menuItemRequest struct {
	Location   string  `json:"location"`
	ParentID   *int64  `json:"parentId"`
	Label      string  `json:"label"`
	Href       *string `json:"href"`
	SourceType string  `json:"sourceType"`
	SortOrder  int     `json:"sortOrder"`
}

func (h *MenuItemHandler) Create(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	var req menuItemRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	sourceType := req.SourceType
	if sourceType == "" {
		sourceType = string(domain.MenuItemSourceStatic)
	}
	item := &domain.MenuItem{
		Location:   domain.MenuLocation(req.Location),
		ParentID:   req.ParentID,
		Label:      req.Label,
		Href:       req.Href,
		SourceType: domain.MenuItemSourceType(sourceType),
		SortOrder:  req.SortOrder,
	}
	created, err := h.items.Create(r.Context(), actor, item)
	if err != nil {
		response.Err(w, menuItemErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{"menuItem": toMenuItemDTO(created)})
}

func (h *MenuItemHandler) Update(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid menu item id")
		return
	}
	var req menuItemRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	sourceType := req.SourceType
	if sourceType == "" {
		sourceType = string(domain.MenuItemSourceStatic)
	}
	if err := h.items.Update(r.Context(), actor, id, req.Label, req.Href, domain.MenuItemSourceType(sourceType), req.SortOrder); err != nil {
		response.Err(w, menuItemErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *MenuItemHandler) Delete(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid menu item id")
		return
	}
	if err := h.items.Delete(r.Context(), actor, id); err != nil {
		response.Err(w, menuItemErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

package handler

import (
	"errors"
	"net/http"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/httpx"
	"github.com/tang-edgetech/topcasinosg/api/internal/middleware"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

type SidebarHandler struct {
	sidebar *service.SidebarService
}

func NewSidebarHandler(sidebar *service.SidebarService) *SidebarHandler {
	return &SidebarHandler{sidebar: sidebar}
}

type SidebarLinkDTO struct {
	ID          int64  `json:"id"`
	Label       string `json:"label"`
	URL         string `json:"url"`
	HasDropdown bool   `json:"hasDropdown"`
	SortOrder   int    `json:"sortOrder"`
}

type SidebarSectionDTO struct {
	ID        int64            `json:"id"`
	Key       string           `json:"key"`
	Heading   string           `json:"heading"`
	SortOrder int              `json:"sortOrder"`
	Links     []SidebarLinkDTO `json:"links"`
}

func toSidebarSectionDTO(s *domain.SidebarSection) SidebarSectionDTO {
	links := make([]SidebarLinkDTO, len(s.Links))
	for i, l := range s.Links {
		links[i] = SidebarLinkDTO{ID: l.ID, Label: l.Label, URL: l.URL, HasDropdown: l.HasDropdown, SortOrder: l.SortOrder}
	}
	return SidebarSectionDTO{ID: s.ID, Key: string(s.Key), Heading: s.Heading, SortOrder: s.SortOrder, Links: links}
}

func sidebarErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrForbidden):
		return http.StatusForbidden
	case errors.Is(err, service.ErrInvalidSidebarSections):
		return http.StatusBadRequest
	default:
		return http.StatusInternalServerError
	}
}

// Get serves both the public site (fetched on every non-Home page) and the
// admin editor — same shape, no auth-gated fields to hide.
func (h *SidebarHandler) Get(w http.ResponseWriter, r *http.Request) {
	sections, err := h.sidebar.GetAll(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load sidebar")
		return
	}
	dtos := make([]SidebarSectionDTO, len(sections))
	for i := range sections {
		dtos[i] = toSidebarSectionDTO(&sections[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"sections": dtos})
}

type sidebarLinkRequest struct {
	Label       string `json:"label"`
	URL         string `json:"url"`
	HasDropdown bool   `json:"hasDropdown"`
	SortOrder   int    `json:"sortOrder"`
}

type sidebarSectionRequest struct {
	ID        int64                `json:"id"`
	Heading   string               `json:"heading"`
	SortOrder int                  `json:"sortOrder"`
	Links     []sidebarLinkRequest `json:"links"`
}

func (h *SidebarHandler) Replace(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	var req struct {
		Sections []sidebarSectionRequest `json:"sections"`
	}
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}

	sections := make([]domain.SidebarSection, len(req.Sections))
	for i, s := range req.Sections {
		links := make([]domain.SidebarLink, len(s.Links))
		for j, l := range s.Links {
			links[j] = domain.SidebarLink{SectionID: s.ID, Label: l.Label, URL: l.URL, HasDropdown: l.HasDropdown, SortOrder: l.SortOrder}
		}
		sections[i] = domain.SidebarSection{ID: s.ID, Heading: s.Heading, SortOrder: s.SortOrder, Links: links}
	}

	if err := h.sidebar.ReplaceAll(r.Context(), actor, sections); err != nil {
		response.Err(w, sidebarErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

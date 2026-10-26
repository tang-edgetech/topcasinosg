package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/httpx"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
)

type GlobalSectionDTO struct {
	ID         int64     `json:"id"`
	Name       string    `json:"name"`
	UsageCount int       `json:"usageCount"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

func toGlobalSectionDTO(g domain.GlobalSection) GlobalSectionDTO {
	return GlobalSectionDTO{ID: g.ID, Name: g.Name, UsageCount: g.UsageCount, UpdatedAt: g.UpdatedAt}
}

type globalSectionRequest struct {
	Name     string           `json:"name"`
	Sections []PageSectionDTO `json:"sections"`
}

func (h *PageHandler) ListGlobals(w http.ResponseWriter, r *http.Request) {
	globals, err := h.pages.ListGlobals(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load global sections")
		return
	}
	dtos := make([]GlobalSectionDTO, len(globals))
	for i, g := range globals {
		dtos[i] = toGlobalSectionDTO(g)
	}
	response.JSON(w, http.StatusOK, map[string]any{"globalSections": dtos})
}

// CreateGlobal makes a new global section, optionally starting from the
// sections it is sent (the page editor's "Save as Global Section").
func (h *PageHandler) CreateGlobal(w http.ResponseWriter, r *http.Request) {
	var req globalSectionRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	global, err := h.pages.CreateGlobal(r.Context(), req.Name, toDomainSections(req.Sections, 0))
	if err != nil {
		response.Err(w, pageErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{"globalSection": toGlobalSectionDTO(*global)})
}

func (h *PageHandler) RenameGlobal(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid global section id")
		return
	}
	var req globalSectionRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.pages.RenameGlobal(r.Context(), id, req.Name); err != nil {
		response.Err(w, pageErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *PageHandler) DeleteGlobal(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid global section id")
		return
	}
	if err := h.pages.DeleteGlobal(r.Context(), id); err != nil {
		response.Err(w, pageErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

// GetGlobalPublic — the public website's read of one global section's
// sections, rendered wherever a page places it.
func (h *PageHandler) GetGlobalPublic(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid global section id")
		return
	}
	sections, err := h.pages.GlobalSections(r.Context(), id)
	if err != nil {
		response.Err(w, pageErrorStatus(err), "global section not found")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"sections": toSectionDTOs(sections)})
}

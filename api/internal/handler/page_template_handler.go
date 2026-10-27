package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/httpx"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
)

type SectionTemplateDTO struct {
	ID           int64     `json:"id"`
	Name         string    `json:"name"`
	SectionCount int       `json:"sectionCount"`
	BlockTypes   []string  `json:"blockTypes"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

func toSectionTemplateDTO(t domain.SectionTemplate) SectionTemplateDTO {
	return SectionTemplateDTO{ID: t.ID, Name: t.Name, SectionCount: t.SectionCount, BlockTypes: t.BlockTypes, UpdatedAt: t.UpdatedAt}
}

func (h *PageHandler) ListTemplates(w http.ResponseWriter, r *http.Request) {
	templates, err := h.pages.ListTemplates(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load templates")
		return
	}
	dtos := make([]SectionTemplateDTO, len(templates))
	for i, t := range templates {
		dtos[i] = toSectionTemplateDTO(t)
	}
	response.JSON(w, http.StatusOK, map[string]any{"templates": dtos})
}

func (h *PageHandler) CreateTemplate(w http.ResponseWriter, r *http.Request) {
	var req globalSectionRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	id, err := h.pages.CreateTemplate(r.Context(), req.Name, toDomainSections(req.Sections, 0))
	if err != nil {
		response.Err(w, pageErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{"template": map[string]any{"id": id, "name": req.Name}})
}

func (h *PageHandler) GetTemplate(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid template id")
		return
	}
	sections, err := h.pages.TemplateSections(r.Context(), id)
	if err != nil {
		response.Err(w, pageErrorStatus(err), "template not found")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"sections": toSectionDTOs(sections)})
}

func (h *PageHandler) DeleteTemplate(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid template id")
		return
	}
	if err := h.pages.DeleteTemplate(r.Context(), id); err != nil {
		response.Err(w, pageErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

// CreatePreview stores the editor's unsaved sections and returns the token
// the public site's /preview/{token} route renders.
func (h *PageHandler) CreatePreview(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid page id")
		return
	}
	var req replaceSectionsRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	token, err := h.pages.CreatePreview(r.Context(), id, toDomainSections(req.Sections, id))
	if err != nil {
		response.Err(w, pageErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, map[string]string{"token": token})
}

// GetPreviewPublic — the public site's read of a preview. The token is the
// only key, it expires after an hour, and the page is never indexed.
func (h *PageHandler) GetPreviewPublic(w http.ResponseWriter, r *http.Request) {
	page, sections, err := h.pages.GetPreview(r.Context(), r.PathValue("token"))
	if err != nil {
		response.Err(w, pageErrorStatus(err), "preview not found or expired")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"page": toPageDTO(page, nil), "sections": toSectionDTOs(sections)})
}

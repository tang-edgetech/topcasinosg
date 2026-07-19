package handler

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/httpx"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

type GuideHandler struct {
	guides *service.GuideService
}

func NewGuideHandler(guides *service.GuideService) *GuideHandler {
	return &GuideHandler{guides: guides}
}

type GuideDTO struct {
	ID           int64      `json:"id"`
	RegionID     *int64     `json:"regionId"`
	Title        string     `json:"title"`
	Slug         string     `json:"slug"`
	CoverMediaID *int64     `json:"coverMediaId"`
	Excerpt      string     `json:"excerpt"`
	Content      string     `json:"content"`
	Status       string     `json:"status"`
	PublishAt    *time.Time `json:"publishAt"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
}

func toGuideDTO(g *domain.Guide) GuideDTO {
	return GuideDTO{
		ID: g.ID, RegionID: g.RegionID, Title: g.Title, Slug: g.Slug, CoverMediaID: g.CoverMediaID,
		Excerpt: g.Excerpt, Content: g.Content, Status: string(g.Status), PublishAt: g.PublishAt,
		CreatedAt: g.CreatedAt, UpdatedAt: g.UpdatedAt,
	}
}

func guideErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrAlreadyExists):
		return http.StatusConflict
	case errors.Is(err, service.ErrInvalidContentStatus), errors.Is(err, service.ErrPublishAtRequired):
		return http.StatusBadRequest
	case errors.Is(err, repository.ErrNotFound):
		return http.StatusNotFound
	default:
		return http.StatusInternalServerError
	}
}

type guideRequest struct {
	RegionID     *int64 `json:"regionId"`
	Title        string `json:"title"`
	Slug         string `json:"slug"`
	CoverMediaID *int64 `json:"coverMediaId"`
	Excerpt      string `json:"excerpt"`
	Content      string `json:"content"`
}

func (req guideRequest) toInput() service.GuideInput {
	return service.GuideInput{
		RegionID: req.RegionID, Title: req.Title, Slug: req.Slug, CoverMediaID: req.CoverMediaID,
		Excerpt: req.Excerpt, Content: req.Content,
	}
}

func (h *GuideHandler) Create(w http.ResponseWriter, r *http.Request) {
	actor := requireActor(r)
	var req guideRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	guide, err := h.guides.Create(r.Context(), actor, req.toInput())
	if err != nil {
		response.Err(w, guideErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{"guide": toGuideDTO(guide)})
}

func (h *GuideHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid guide id")
		return
	}
	var req guideRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.guides.Update(r.Context(), id, req.toInput()); err != nil {
		response.Err(w, guideErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *GuideHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid guide id")
		return
	}
	guide, err := h.guides.Get(r.Context(), id)
	if err != nil {
		response.Err(w, guideErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"guide": toGuideDTO(guide)})
}

func (h *GuideHandler) GetPublic(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	guide, err := h.guides.GetPublishedBySlug(r.Context(), slug)
	if err != nil {
		response.Err(w, guideErrorStatus(err), "guide not found")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"guide": toGuideDTO(guide)})
}

func (h *GuideHandler) List(w http.ResponseWriter, r *http.Request) {
	page, pageSize := parsePaging(r)
	var regionID *int64
	if v := r.URL.Query().Get("regionId"); v != "" {
		if id, err := strconv.ParseInt(v, 10, 64); err == nil {
			regionID = &id
		}
	}
	items, total, err := h.guides.ListAdmin(r.Context(), regionID, page, pageSize)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load guides")
		return
	}
	dtos := make([]GuideDTO, len(items))
	for i := range items {
		dtos[i] = toGuideDTO(&items[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"guides": dtos, "total": total})
}

// ListPublic serves both the global /guides index (no region param) and
// /{region}/guides (region param set) — unlike Bonuses, region is optional
// here since Guides can be global.
func (h *GuideHandler) ListPublic(w http.ResponseWriter, r *http.Request) {
	page, pageSize := parsePaging(r)
	var regionCode *string
	if code := r.URL.Query().Get("region"); code != "" {
		regionCode = &code
	}
	items, total, err := h.guides.ListPublished(r.Context(), regionCode, page, pageSize)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load guides")
		return
	}
	dtos := make([]GuideDTO, len(items))
	for i := range items {
		dtos[i] = toGuideDTO(&items[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"guides": dtos, "total": total})
}

type setGuideStatusRequest struct {
	Status    string     `json:"status"`
	PublishAt *time.Time `json:"publishAt"`
}

func (h *GuideHandler) SetStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid guide id")
		return
	}
	var req setGuideStatusRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.guides.SetStatus(r.Context(), id, domain.ContentStatus(req.Status), req.PublishAt); err != nil {
		response.Err(w, guideErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *GuideHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid guide id")
		return
	}
	if err := h.guides.Delete(r.Context(), id); err != nil {
		response.Err(w, guideErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

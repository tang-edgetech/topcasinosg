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

type RTPEntryHandler struct {
	entries *service.RTPEntryService
}

func NewRTPEntryHandler(entries *service.RTPEntryService) *RTPEntryHandler {
	return &RTPEntryHandler{entries: entries}
}

type RTPEntryDTO struct {
	ID            int64      `json:"id"`
	RegionID      int64      `json:"regionId"`
	CasinoID      *int64     `json:"casinoId"`
	GameName      string     `json:"gameName"`
	Category      string     `json:"category"`
	RTPPercentage float64    `json:"rtpPercentage"`
	Status        string     `json:"status"`
	PublishAt     *time.Time `json:"publishAt"`
	CreatedAt     time.Time  `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`
}

func toRTPEntryDTO(e *domain.RTPEntry) RTPEntryDTO {
	return RTPEntryDTO{
		ID: e.ID, RegionID: e.RegionID, CasinoID: e.CasinoID, GameName: e.GameName, Category: string(e.Category),
		RTPPercentage: e.RTPPercentage, Status: string(e.Status), PublishAt: e.PublishAt,
		CreatedAt: e.CreatedAt, UpdatedAt: e.UpdatedAt,
	}
}

func rtpEntryErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrInvalidRTPCategory), errors.Is(err, service.ErrInvalidContentStatus), errors.Is(err, service.ErrPublishAtRequired):
		return http.StatusBadRequest
	case errors.Is(err, repository.ErrNotFound):
		return http.StatusNotFound
	default:
		return http.StatusInternalServerError
	}
}

type rtpEntryRequest struct {
	RegionID      int64   `json:"regionId"`
	CasinoID      *int64  `json:"casinoId"`
	GameName      string  `json:"gameName"`
	Category      string  `json:"category"`
	RTPPercentage float64 `json:"rtpPercentage"`
}

func (req rtpEntryRequest) toInput() service.RTPEntryInput {
	return service.RTPEntryInput{
		RegionID: req.RegionID, CasinoID: req.CasinoID, GameName: req.GameName,
		Category: domain.RTPCategory(req.Category), RTPPercentage: req.RTPPercentage,
	}
}

func (h *RTPEntryHandler) Create(w http.ResponseWriter, r *http.Request) {
	actor := requireActor(r)
	var req rtpEntryRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	entry, err := h.entries.Create(r.Context(), actor, req.toInput())
	if err != nil {
		response.Err(w, rtpEntryErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{"rtpEntry": toRTPEntryDTO(entry)})
}

func (h *RTPEntryHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid rtp entry id")
		return
	}
	var req rtpEntryRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.entries.Update(r.Context(), id, req.toInput()); err != nil {
		response.Err(w, rtpEntryErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *RTPEntryHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid rtp entry id")
		return
	}
	entry, err := h.entries.Get(r.Context(), id)
	if err != nil {
		response.Err(w, rtpEntryErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"rtpEntry": toRTPEntryDTO(entry)})
}

func (h *RTPEntryHandler) List(w http.ResponseWriter, r *http.Request) {
	page, pageSize := parsePaging(r)
	var regionID *int64
	if v := r.URL.Query().Get("regionId"); v != "" {
		if id, err := strconv.ParseInt(v, 10, 64); err == nil {
			regionID = &id
		}
	}
	items, total, err := h.entries.ListAdmin(r.Context(), regionID, page, pageSize)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load rtp entries")
		return
	}
	dtos := make([]RTPEntryDTO, len(items))
	for i := range items {
		dtos[i] = toRTPEntryDTO(&items[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"rtpEntries": dtos, "total": total})
}

func (h *RTPEntryHandler) ListPublic(w http.ResponseWriter, r *http.Request) {
	regionCode := r.URL.Query().Get("region")
	if regionCode == "" {
		response.Err(w, http.StatusBadRequest, "region is required")
		return
	}
	page, pageSize := parsePaging(r)
	items, total, err := h.entries.ListPublished(r.Context(), regionCode, page, pageSize)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load rtp entries")
		return
	}
	dtos := make([]RTPEntryDTO, len(items))
	for i := range items {
		dtos[i] = toRTPEntryDTO(&items[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"rtpEntries": dtos, "total": total})
}

type setRTPEntryStatusRequest struct {
	Status    string     `json:"status"`
	PublishAt *time.Time `json:"publishAt"`
}

func (h *RTPEntryHandler) SetStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid rtp entry id")
		return
	}
	var req setRTPEntryStatusRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.entries.SetStatus(r.Context(), id, domain.ContentStatus(req.Status), req.PublishAt); err != nil {
		response.Err(w, rtpEntryErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *RTPEntryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid rtp entry id")
		return
	}
	if err := h.entries.Delete(r.Context(), id); err != nil {
		response.Err(w, rtpEntryErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

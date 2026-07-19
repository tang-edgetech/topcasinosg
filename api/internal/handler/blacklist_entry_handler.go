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

type BlacklistEntryHandler struct {
	entries *service.BlacklistEntryService
}

func NewBlacklistEntryHandler(entries *service.BlacklistEntryService) *BlacklistEntryHandler {
	return &BlacklistEntryHandler{entries: entries}
}

type BlacklistEntryDTO struct {
	ID        int64      `json:"id"`
	Name      string     `json:"name"`
	Reason    string     `json:"reason"`
	Details   string     `json:"details"`
	Status    string     `json:"status"`
	PublishAt *time.Time `json:"publishAt"`
	CreatedAt time.Time  `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
}

func toBlacklistEntryDTO(e *domain.BlacklistEntry) BlacklistEntryDTO {
	return BlacklistEntryDTO{
		ID: e.ID, Name: e.Name, Reason: e.Reason, Details: e.Details, Status: string(e.Status),
		PublishAt: e.PublishAt, CreatedAt: e.CreatedAt, UpdatedAt: e.UpdatedAt,
	}
}

func blacklistEntryErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrInvalidContentStatus), errors.Is(err, service.ErrPublishAtRequired):
		return http.StatusBadRequest
	case errors.Is(err, repository.ErrNotFound):
		return http.StatusNotFound
	default:
		return http.StatusInternalServerError
	}
}

type blacklistEntryRequest struct {
	Name    string `json:"name"`
	Reason  string `json:"reason"`
	Details string `json:"details"`
}

func (req blacklistEntryRequest) toInput() service.BlacklistEntryInput {
	return service.BlacklistEntryInput{Name: req.Name, Reason: req.Reason, Details: req.Details}
}

func (h *BlacklistEntryHandler) Create(w http.ResponseWriter, r *http.Request) {
	actor := requireActor(r)
	var req blacklistEntryRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	entry, err := h.entries.Create(r.Context(), actor, req.toInput())
	if err != nil {
		response.Err(w, blacklistEntryErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{"blacklistEntry": toBlacklistEntryDTO(entry)})
}

func (h *BlacklistEntryHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid blacklist entry id")
		return
	}
	var req blacklistEntryRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.entries.Update(r.Context(), id, req.toInput()); err != nil {
		response.Err(w, blacklistEntryErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *BlacklistEntryHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid blacklist entry id")
		return
	}
	entry, err := h.entries.Get(r.Context(), id)
	if err != nil {
		response.Err(w, blacklistEntryErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"blacklistEntry": toBlacklistEntryDTO(entry)})
}

func (h *BlacklistEntryHandler) List(w http.ResponseWriter, r *http.Request) {
	page, pageSize := parsePaging(r)
	items, total, err := h.entries.ListAdmin(r.Context(), page, pageSize)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load blacklist entries")
		return
	}
	dtos := make([]BlacklistEntryDTO, len(items))
	for i := range items {
		dtos[i] = toBlacklistEntryDTO(&items[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"blacklistEntries": dtos, "total": total})
}

func (h *BlacklistEntryHandler) ListPublic(w http.ResponseWriter, r *http.Request) {
	page, pageSize := parsePaging(r)
	items, total, err := h.entries.ListPublished(r.Context(), page, pageSize)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load blacklist entries")
		return
	}
	dtos := make([]BlacklistEntryDTO, len(items))
	for i := range items {
		dtos[i] = toBlacklistEntryDTO(&items[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"blacklistEntries": dtos, "total": total})
}

type setBlacklistEntryStatusRequest struct {
	Status    string     `json:"status"`
	PublishAt *time.Time `json:"publishAt"`
}

func (h *BlacklistEntryHandler) SetStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid blacklist entry id")
		return
	}
	var req setBlacklistEntryStatusRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.entries.SetStatus(r.Context(), id, domain.ContentStatus(req.Status), req.PublishAt); err != nil {
		response.Err(w, blacklistEntryErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *BlacklistEntryHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid blacklist entry id")
		return
	}
	if err := h.entries.Delete(r.Context(), id); err != nil {
		response.Err(w, blacklistEntryErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

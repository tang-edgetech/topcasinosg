package handler

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/httpx"
	"github.com/tang-edgetech/topcasinosg/api/internal/middleware"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

type GameProviderHandler struct {
	providers *service.GameProviderService
}

func NewGameProviderHandler(providers *service.GameProviderService) *GameProviderHandler {
	return &GameProviderHandler{providers: providers}
}

type GameProviderDTO struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	LogoMediaID *int64    `json:"logoMediaId"`
	LogoURL     *string   `json:"logoUrl"`
	SortOrder   int       `json:"sortOrder"`
	CreatedAt   time.Time `json:"createdAt"`
}

func toGameProviderDTO(p *domain.GameProvider) GameProviderDTO {
	return GameProviderDTO{
		ID: p.ID, Name: p.Name, LogoMediaID: p.LogoMediaID, LogoURL: p.LogoURL, SortOrder: p.SortOrder,
		CreatedAt: p.CreatedAt,
	}
}

func gameProviderErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrForbidden):
		return http.StatusForbidden
	default:
		return http.StatusInternalServerError
	}
}

// List serves both the dashboard (management) and the public website — no
// draft/active distinction exists for this entity, unlike Region.
func (h *GameProviderHandler) List(w http.ResponseWriter, r *http.Request) {
	providers, err := h.providers.List(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load game providers")
		return
	}
	dtos := make([]GameProviderDTO, len(providers))
	for i := range providers {
		dtos[i] = toGameProviderDTO(&providers[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"gameProviders": dtos})
}

type gameProviderRequest struct {
	Name        string `json:"name"`
	LogoMediaID *int64 `json:"logoMediaId"`
	SortOrder   int    `json:"sortOrder"`
}

func (h *GameProviderHandler) Create(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	var req gameProviderRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	provider, err := h.providers.Create(r.Context(), actor, req.Name, req.LogoMediaID, req.SortOrder)
	if err != nil {
		response.Err(w, gameProviderErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{"gameProvider": toGameProviderDTO(provider)})
}

func (h *GameProviderHandler) Update(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid game provider id")
		return
	}
	var req gameProviderRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.providers.Update(r.Context(), actor, id, req.Name, req.LogoMediaID, req.SortOrder); err != nil {
		response.Err(w, gameProviderErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *GameProviderHandler) Delete(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid game provider id")
		return
	}
	if err := h.providers.Delete(r.Context(), actor, id); err != nil {
		response.Err(w, gameProviderErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

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

type RegionHandler struct {
	regions *service.RegionService
}

func NewRegionHandler(regions *service.RegionService) *RegionHandler {
	return &RegionHandler{regions: regions}
}

type RegionDTO struct {
	ID          int64     `json:"id"`
	Code        string    `json:"code"`
	Name        string    `json:"name"`
	FlagMediaID *int64    `json:"flagMediaId"`
	FlagURL     *string   `json:"flagUrl"`
	IsActive    bool      `json:"isActive"`
	SortOrder   int       `json:"sortOrder"`
	CreatedAt   time.Time `json:"createdAt"`
}

func toRegionDTO(r *domain.Region) RegionDTO {
	return RegionDTO{
		ID:          r.ID,
		Code:        r.Code,
		Name:        r.Name,
		FlagMediaID: r.FlagMediaID,
		FlagURL:     r.FlagURL,
		IsActive:    r.IsActive,
		SortOrder:   r.SortOrder,
		CreatedAt:   r.CreatedAt,
	}
}

func toRegionDTOs(regions []domain.Region) []RegionDTO {
	dtos := make([]RegionDTO, len(regions))
	for i := range regions {
		dtos[i] = toRegionDTO(&regions[i])
	}
	return dtos
}

func regionErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrForbidden):
		return http.StatusForbidden
	case errors.Is(err, service.ErrAlreadyExists):
		return http.StatusConflict
	default:
		return http.StatusInternalServerError
	}
}

// List — dashboard use, includes inactive regions (management view).
func (h *RegionHandler) List(w http.ResponseWriter, r *http.Request) {
	regions, err := h.regions.List(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load regions")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"regions": toRegionDTOs(regions)})
}

// ListPublic — website use, active regions only, no auth required.
func (h *RegionHandler) ListPublic(w http.ResponseWriter, r *http.Request) {
	regions, err := h.regions.ListActive(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load regions")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"regions": toRegionDTOs(regions)})
}

type regionRequest struct {
	Code        string `json:"code"`
	Name        string `json:"name"`
	FlagMediaID *int64 `json:"flagMediaId"`
	SortOrder   int    `json:"sortOrder"`
}

func (h *RegionHandler) Create(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	var req regionRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	region, err := h.regions.Create(r.Context(), actor, req.Code, req.Name, req.FlagMediaID, req.SortOrder)
	if err != nil {
		response.Err(w, regionErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{"region": toRegionDTO(region)})
}

func (h *RegionHandler) Update(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid region id")
		return
	}
	var req regionRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.regions.Update(r.Context(), actor, id, req.Code, req.Name, req.FlagMediaID, req.SortOrder); err != nil {
		response.Err(w, regionErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

type setRegionActiveRequest struct {
	Active bool `json:"active"`
}

func (h *RegionHandler) SetActive(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid region id")
		return
	}
	var req setRegionActiveRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.regions.SetActive(r.Context(), actor, id, req.Active); err != nil {
		response.Err(w, regionErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

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

type LicenseHandler struct {
	licenses *service.LicenseService
}

func NewLicenseHandler(licenses *service.LicenseService) *LicenseHandler {
	return &LicenseHandler{licenses: licenses}
}

type LicenseDTO struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	LogoMediaID *int64    `json:"logoMediaId"`
	LogoURL     *string   `json:"logoUrl"`
	SortOrder   int       `json:"sortOrder"`
	CreatedAt   time.Time `json:"createdAt"`
}

func toLicenseDTO(l *domain.License) LicenseDTO {
	return LicenseDTO{
		ID: l.ID, Name: l.Name, LogoMediaID: l.LogoMediaID, LogoURL: l.LogoURL, SortOrder: l.SortOrder,
		CreatedAt: l.CreatedAt,
	}
}

func licenseErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrForbidden):
		return http.StatusForbidden
	default:
		return http.StatusInternalServerError
	}
}

// List serves both the dashboard (management) and the public website — no
// draft/active distinction exists for this entity, unlike Region.
func (h *LicenseHandler) List(w http.ResponseWriter, r *http.Request) {
	licenses, err := h.licenses.List(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load licenses")
		return
	}
	dtos := make([]LicenseDTO, len(licenses))
	for i := range licenses {
		dtos[i] = toLicenseDTO(&licenses[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"licenses": dtos})
}

type licenseRequest struct {
	Name        string `json:"name"`
	LogoMediaID *int64 `json:"logoMediaId"`
	SortOrder   int    `json:"sortOrder"`
}

func (h *LicenseHandler) Create(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	var req licenseRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	license, err := h.licenses.Create(r.Context(), actor, req.Name, req.LogoMediaID, req.SortOrder)
	if err != nil {
		response.Err(w, licenseErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{"license": toLicenseDTO(license)})
}

func (h *LicenseHandler) Update(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid license id")
		return
	}
	var req licenseRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.licenses.Update(r.Context(), actor, id, req.Name, req.LogoMediaID, req.SortOrder); err != nil {
		response.Err(w, licenseErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *LicenseHandler) Delete(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid license id")
		return
	}
	if err := h.licenses.Delete(r.Context(), actor, id); err != nil {
		response.Err(w, licenseErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

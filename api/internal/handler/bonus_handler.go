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

type BonusHandler struct {
	bonuses *service.BonusService
}

func NewBonusHandler(bonuses *service.BonusService) *BonusHandler {
	return &BonusHandler{bonuses: bonuses}
}

type BonusDTO struct {
	ID         int64      `json:"id"`
	RegionID   int64      `json:"regionId"`
	CasinoID   *int64     `json:"casinoId"`
	BonusType  string     `json:"bonusType"`
	Title      string     `json:"title"`
	Terms      string     `json:"terms"`
	Code       *string    `json:"code"`
	ValidFrom  *time.Time `json:"validFrom"`
	ValidUntil *time.Time `json:"validUntil"`
	Status     string     `json:"status"`
	PublishAt  *time.Time `json:"publishAt"`
	CreatedAt  time.Time  `json:"createdAt"`
	UpdatedAt  time.Time  `json:"updatedAt"`
}

func toBonusDTO(b *domain.Bonus) BonusDTO {
	return BonusDTO{
		ID: b.ID, RegionID: b.RegionID, CasinoID: b.CasinoID, BonusType: string(b.BonusType), Title: b.Title,
		Terms: b.Terms, Code: b.Code, ValidFrom: b.ValidFrom, ValidUntil: b.ValidUntil, Status: string(b.Status),
		PublishAt: b.PublishAt, CreatedAt: b.CreatedAt, UpdatedAt: b.UpdatedAt,
	}
}

func bonusErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrInvalidBonusType), errors.Is(err, service.ErrInvalidContentStatus), errors.Is(err, service.ErrPublishAtRequired):
		return http.StatusBadRequest
	case errors.Is(err, repository.ErrNotFound):
		return http.StatusNotFound
	default:
		return http.StatusInternalServerError
	}
}

type bonusRequest struct {
	RegionID   int64      `json:"regionId"`
	CasinoID   *int64     `json:"casinoId"`
	BonusType  string     `json:"bonusType"`
	Title      string     `json:"title"`
	Terms      string     `json:"terms"`
	Code       *string    `json:"code"`
	ValidFrom  *time.Time `json:"validFrom"`
	ValidUntil *time.Time `json:"validUntil"`
}

func (req bonusRequest) toInput() service.BonusInput {
	return service.BonusInput{
		RegionID: req.RegionID, CasinoID: req.CasinoID, BonusType: domain.BonusType(req.BonusType), Title: req.Title,
		Terms: req.Terms, Code: req.Code, ValidFrom: req.ValidFrom, ValidUntil: req.ValidUntil,
	}
}

func (h *BonusHandler) Create(w http.ResponseWriter, r *http.Request) {
	actor := requireActor(r)
	var req bonusRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	bonus, err := h.bonuses.Create(r.Context(), actor, req.toInput())
	if err != nil {
		response.Err(w, bonusErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{"bonus": toBonusDTO(bonus)})
}

func (h *BonusHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid bonus id")
		return
	}
	var req bonusRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.bonuses.Update(r.Context(), id, req.toInput()); err != nil {
		response.Err(w, bonusErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *BonusHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid bonus id")
		return
	}
	bonus, err := h.bonuses.Get(r.Context(), id)
	if err != nil {
		response.Err(w, bonusErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"bonus": toBonusDTO(bonus)})
}

func (h *BonusHandler) List(w http.ResponseWriter, r *http.Request) {
	page, pageSize := parsePaging(r)
	var regionID *int64
	if v := r.URL.Query().Get("regionId"); v != "" {
		if id, err := strconv.ParseInt(v, 10, 64); err == nil {
			regionID = &id
		}
	}
	items, total, err := h.bonuses.ListAdmin(r.Context(), regionID, page, pageSize)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load bonuses")
		return
	}
	dtos := make([]BonusDTO, len(items))
	for i := range items {
		dtos[i] = toBonusDTO(&items[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"bonuses": dtos, "total": total})
}

// ListPublic serves /{region}/bonuses (region required) or, when a casinoId
// is given instead, a single casino's bonuses for its review page —
// independent of region, since /casinos/[slug] isn't region-scoped by URL.
func (h *BonusHandler) ListPublic(w http.ResponseWriter, r *http.Request) {
	page, pageSize := parsePaging(r)

	if v := r.URL.Query().Get("casinoId"); v != "" {
		casinoID, err := strconv.ParseInt(v, 10, 64)
		if err != nil {
			response.Err(w, http.StatusBadRequest, "invalid casinoId")
			return
		}
		items, total, err := h.bonuses.ListPublishedByCasino(r.Context(), casinoID, page, pageSize)
		if err != nil {
			response.Err(w, http.StatusInternalServerError, "could not load bonuses")
			return
		}
		dtos := make([]BonusDTO, len(items))
		for i := range items {
			dtos[i] = toBonusDTO(&items[i])
		}
		response.JSON(w, http.StatusOK, map[string]any{"bonuses": dtos, "total": total})
		return
	}

	regionCode := r.URL.Query().Get("region")
	if regionCode == "" {
		response.Err(w, http.StatusBadRequest, "region or casinoId is required")
		return
	}
	var bonusType *string
	if v := r.URL.Query().Get("bonusType"); v != "" {
		bonusType = &v
	}
	items, total, err := h.bonuses.ListPublished(r.Context(), regionCode, bonusType, page, pageSize)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load bonuses")
		return
	}
	dtos := make([]BonusDTO, len(items))
	for i := range items {
		dtos[i] = toBonusDTO(&items[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"bonuses": dtos, "total": total})
}

type setBonusStatusRequest struct {
	Status    string     `json:"status"`
	PublishAt *time.Time `json:"publishAt"`
}

func (h *BonusHandler) SetStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid bonus id")
		return
	}
	var req setBonusStatusRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.bonuses.SetStatus(r.Context(), id, domain.ContentStatus(req.Status), req.PublishAt); err != nil {
		response.Err(w, bonusErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *BonusHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid bonus id")
		return
	}
	if err := h.bonuses.Delete(r.Context(), id); err != nil {
		response.Err(w, bonusErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

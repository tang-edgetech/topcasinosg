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

type PaymentMethodHandler struct {
	paymentMethods *service.PaymentMethodService
}

func NewPaymentMethodHandler(paymentMethods *service.PaymentMethodService) *PaymentMethodHandler {
	return &PaymentMethodHandler{paymentMethods: paymentMethods}
}

type PaymentMethodDTO struct {
	ID          int64      `json:"id"`
	RegionID    int64      `json:"regionId"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	IconMediaID *int64     `json:"iconMediaId"`
	Status      string     `json:"status"`
	PublishAt   *time.Time `json:"publishAt"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

func toPaymentMethodDTO(pm *domain.PaymentMethod) PaymentMethodDTO {
	return PaymentMethodDTO{
		ID: pm.ID, RegionID: pm.RegionID, Name: pm.Name, Description: pm.Description, IconMediaID: pm.IconMediaID,
		Status: string(pm.Status), PublishAt: pm.PublishAt, CreatedAt: pm.CreatedAt, UpdatedAt: pm.UpdatedAt,
	}
}

func paymentMethodErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrInvalidContentStatus), errors.Is(err, service.ErrPublishAtRequired):
		return http.StatusBadRequest
	case errors.Is(err, repository.ErrNotFound):
		return http.StatusNotFound
	default:
		return http.StatusInternalServerError
	}
}

type paymentMethodRequest struct {
	RegionID    int64  `json:"regionId"`
	Name        string `json:"name"`
	Description string `json:"description"`
	IconMediaID *int64 `json:"iconMediaId"`
}

func (req paymentMethodRequest) toInput() service.PaymentMethodInput {
	return service.PaymentMethodInput{
		RegionID: req.RegionID, Name: req.Name, Description: req.Description, IconMediaID: req.IconMediaID,
	}
}

func (h *PaymentMethodHandler) Create(w http.ResponseWriter, r *http.Request) {
	actor := requireActor(r)
	var req paymentMethodRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	pm, err := h.paymentMethods.Create(r.Context(), actor, req.toInput())
	if err != nil {
		response.Err(w, paymentMethodErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{"paymentMethod": toPaymentMethodDTO(pm)})
}

func (h *PaymentMethodHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid payment method id")
		return
	}
	var req paymentMethodRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.paymentMethods.Update(r.Context(), id, req.toInput()); err != nil {
		response.Err(w, paymentMethodErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *PaymentMethodHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid payment method id")
		return
	}
	pm, err := h.paymentMethods.Get(r.Context(), id)
	if err != nil {
		response.Err(w, paymentMethodErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"paymentMethod": toPaymentMethodDTO(pm)})
}

func (h *PaymentMethodHandler) List(w http.ResponseWriter, r *http.Request) {
	page, pageSize := parsePaging(r)
	var regionID *int64
	if v := r.URL.Query().Get("regionId"); v != "" {
		if id, err := strconv.ParseInt(v, 10, 64); err == nil {
			regionID = &id
		}
	}
	items, total, err := h.paymentMethods.ListAdmin(r.Context(), regionID, page, pageSize)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load payment methods")
		return
	}
	dtos := make([]PaymentMethodDTO, len(items))
	for i := range items {
		dtos[i] = toPaymentMethodDTO(&items[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"paymentMethods": dtos, "total": total})
}

func (h *PaymentMethodHandler) ListPublic(w http.ResponseWriter, r *http.Request) {
	regionCode := r.URL.Query().Get("region")
	if regionCode == "" {
		response.Err(w, http.StatusBadRequest, "region is required")
		return
	}
	page, pageSize := parsePaging(r)
	items, total, err := h.paymentMethods.ListPublished(r.Context(), regionCode, page, pageSize)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load payment methods")
		return
	}
	dtos := make([]PaymentMethodDTO, len(items))
	for i := range items {
		dtos[i] = toPaymentMethodDTO(&items[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"paymentMethods": dtos, "total": total})
}

type setPaymentMethodStatusRequest struct {
	Status    string     `json:"status"`
	PublishAt *time.Time `json:"publishAt"`
}

func (h *PaymentMethodHandler) SetStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid payment method id")
		return
	}
	var req setPaymentMethodStatusRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.paymentMethods.SetStatus(r.Context(), id, domain.ContentStatus(req.Status), req.PublishAt); err != nil {
		response.Err(w, paymentMethodErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *PaymentMethodHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid payment method id")
		return
	}
	if err := h.paymentMethods.Delete(r.Context(), id); err != nil {
		response.Err(w, paymentMethodErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

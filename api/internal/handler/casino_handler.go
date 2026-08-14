package handler

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/httpx"
	"github.com/tang-edgetech/topcasinosg/api/internal/middleware"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

type CasinoHandler struct {
	casinos *service.CasinoService
}

func NewCasinoHandler(casinos *service.CasinoService) *CasinoHandler {
	return &CasinoHandler{casinos: casinos}
}

type CasinoDTO struct {
	ID             int64      `json:"id"`
	Slug           string     `json:"slug"`
	Name           string     `json:"name"`
	LogoMediaID    *int64     `json:"logoMediaId"`
	Rating         float64    `json:"rating"`
	Summary        string     `json:"summary"`
	Content        string     `json:"content"`
	Languages      []string   `json:"languages"`
	PaymentMethods []string   `json:"paymentMethods"`
	Pros           []string   `json:"pros"`
	Cons           []string   `json:"cons"`
	SafeIndex      *int       `json:"safeIndex"`
	RiskStatus     *string    `json:"riskStatus"`
	SupportedGames []string   `json:"supportedGames"`
	PayoutSpeed    string     `json:"payoutSpeed"`
	CTAURL         string     `json:"ctaUrl"`
	Status         string     `json:"status"`
	PublishAt       *time.Time `json:"publishAt"`
	RegionIDs       []int64    `json:"regionIds"`
	GameProviderIDs []int64    `json:"gameProviderIds"`
	LicenseIDs      []int64    `json:"licenseIds"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}

func toCasinoDTO(c *domain.Casino) CasinoDTO {
	var riskStatus *string
	if c.RiskStatus != nil {
		s := string(*c.RiskStatus)
		riskStatus = &s
	}
	return CasinoDTO{
		ID: c.ID, Slug: c.Slug, Name: c.Name, LogoMediaID: c.LogoMediaID, Rating: c.Rating, Summary: c.Summary,
		Content: c.Content, Languages: c.Languages, PaymentMethods: c.PaymentMethods, Pros: c.Pros, Cons: c.Cons,
		SafeIndex: c.SafeIndex, RiskStatus: riskStatus, SupportedGames: c.SupportedGames, PayoutSpeed: c.PayoutSpeed,
		CTAURL: c.CTAURL, Status: string(c.Status), PublishAt: c.PublishAt, RegionIDs: c.RegionIDs,
		GameProviderIDs: c.GameProviderIDs, LicenseIDs: c.LicenseIDs, CreatedAt: c.CreatedAt, UpdatedAt: c.UpdatedAt,
	}
}

func casinoErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrAlreadyExists):
		return http.StatusConflict
	case errors.Is(err, service.ErrInvalidContentStatus), errors.Is(err, service.ErrPublishAtRequired),
		errors.Is(err, service.ErrInvalidRiskStatus), errors.Is(err, service.ErrInvalidSafeIndex),
		errors.Is(err, service.ErrInvalidGameType):
		return http.StatusBadRequest
	case errors.Is(err, repository.ErrNotFound):
		return http.StatusNotFound
	default:
		return http.StatusInternalServerError
	}
}

type casinoRequest struct {
	Slug           string   `json:"slug"`
	Name           string   `json:"name"`
	LogoMediaID    *int64   `json:"logoMediaId"`
	Rating         float64  `json:"rating"`
	Summary        string   `json:"summary"`
	Content        string   `json:"content"`
	Languages      []string `json:"languages"`
	PaymentMethods []string `json:"paymentMethods"`
	Pros           []string `json:"pros"`
	Cons           []string `json:"cons"`
	SafeIndex      *int     `json:"safeIndex"`
	RiskStatus     *string  `json:"riskStatus"`
	SupportedGames []string `json:"supportedGames"`
	PayoutSpeed     string   `json:"payoutSpeed"`
	CTAURL          string   `json:"ctaUrl"`
	RegionIDs       []int64  `json:"regionIds"`
	GameProviderIDs []int64  `json:"gameProviderIds"`
	LicenseIDs      []int64  `json:"licenseIds"`
}

func (req casinoRequest) toInput() service.CasinoInput {
	var riskStatus *domain.RiskStatus
	if req.RiskStatus != nil {
		rs := domain.RiskStatus(*req.RiskStatus)
		riskStatus = &rs
	}
	return service.CasinoInput{
		Slug: req.Slug, Name: req.Name, LogoMediaID: req.LogoMediaID, Rating: req.Rating, Summary: req.Summary,
		Content: req.Content, Languages: req.Languages, PaymentMethods: req.PaymentMethods, Pros: req.Pros, Cons: req.Cons,
		SafeIndex: req.SafeIndex, RiskStatus: riskStatus, SupportedGames: req.SupportedGames,
		PayoutSpeed: req.PayoutSpeed, CTAURL: req.CTAURL, RegionIDs: req.RegionIDs, GameProviderIDs: req.GameProviderIDs,
		LicenseIDs: req.LicenseIDs,
	}
}

func (h *CasinoHandler) Create(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	var req casinoRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	casino, err := h.casinos.Create(r.Context(), actor, req.toInput())
	if err != nil {
		response.Err(w, casinoErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{"casino": toCasinoDTO(casino)})
}

func (h *CasinoHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid casino id")
		return
	}
	var req casinoRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.casinos.Update(r.Context(), id, req.toInput()); err != nil {
		response.Err(w, casinoErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *CasinoHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid casino id")
		return
	}
	casino, err := h.casinos.Get(r.Context(), id)
	if err != nil {
		response.Err(w, casinoErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"casino": toCasinoDTO(casino)})
}

func (h *CasinoHandler) GetPublic(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	casino, err := h.casinos.GetPublishedBySlug(r.Context(), slug)
	if err != nil {
		response.Err(w, casinoErrorStatus(err), "casino not found")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"casino": toCasinoDTO(casino)})
}

func parsePaging(r *http.Request) (page, pageSize int) {
	page, _ = strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ = strconv.Atoi(r.URL.Query().Get("pageSize"))
	return
}

func (h *CasinoHandler) List(w http.ResponseWriter, r *http.Request) {
	page, pageSize := parsePaging(r)
	items, total, err := h.casinos.ListAdmin(r.Context(), page, pageSize)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load casinos")
		return
	}
	dtos := make([]CasinoDTO, len(items))
	for i := range items {
		dtos[i] = toCasinoDTO(&items[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"casinos": dtos, "total": total})
}

func (h *CasinoHandler) ListPublic(w http.ResponseWriter, r *http.Request) {
	page, pageSize := parsePaging(r)
	var regionCode *string
	if code := r.URL.Query().Get("region"); code != "" {
		regionCode = &code
	}
	items, total, err := h.casinos.ListPublished(r.Context(), regionCode, page, pageSize)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load casinos")
		return
	}
	dtos := make([]CasinoDTO, len(items))
	for i := range items {
		dtos[i] = toCasinoDTO(&items[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"casinos": dtos, "total": total})
}

type setCasinoStatusRequest struct {
	Status    string     `json:"status"`
	PublishAt *time.Time `json:"publishAt"`
}

func (h *CasinoHandler) SetStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid casino id")
		return
	}
	var req setCasinoStatusRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.casinos.SetStatus(r.Context(), id, domain.ContentStatus(req.Status), req.PublishAt); err != nil {
		response.Err(w, casinoErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *CasinoHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid casino id")
		return
	}
	if err := h.casinos.Delete(r.Context(), id); err != nil {
		response.Err(w, casinoErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

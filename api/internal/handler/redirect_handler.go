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

// RedirectHandler — Admin > Redirects, and the active list the website
// applies (web/src/proxy.ts).
type RedirectHandler struct {
	redirects *service.RedirectService
}

func NewRedirectHandler(redirects *service.RedirectService) *RedirectHandler {
	return &RedirectHandler{redirects: redirects}
}

type RedirectDTO struct {
	ID         int64     `json:"id"`
	FromPath   string    `json:"fromPath"`
	ToURL      string    `json:"toUrl"`
	StatusCode int       `json:"statusCode"`
	Active     bool      `json:"active"`
	Note       string    `json:"note"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

func toRedirectDTO(r *domain.Redirect) RedirectDTO {
	return RedirectDTO{
		ID: r.ID, FromPath: r.FromPath, ToURL: r.ToURL, StatusCode: r.StatusCode, Active: r.Active, Note: r.Note,
		CreatedAt: r.CreatedAt, UpdatedAt: r.UpdatedAt,
	}
}

// PublicRedirectDTO is all the website needs.
type PublicRedirectDTO struct {
	From   string `json:"from"`
	To     string `json:"to"`
	Status int    `json:"status"`
}

func redirectErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrForbidden):
		return http.StatusForbidden
	case errors.Is(err, service.ErrInvalidRedirect):
		return http.StatusBadRequest
	case errors.Is(err, repository.ErrRedirectExists):
		return http.StatusConflict
	case errors.Is(err, repository.ErrNotFound):
		return http.StatusNotFound
	default:
		return http.StatusInternalServerError
	}
}

func (h *RedirectHandler) fail(w http.ResponseWriter, err error) {
	if status := redirectErrorStatus(err); status != http.StatusInternalServerError {
		response.Err(w, status, err.Error())
		return
	}
	response.ServerErr(w, err, "could not save the redirect")
}

// ListPublic — the website's active redirects; no sign-in.
func (h *RedirectHandler) ListPublic(w http.ResponseWriter, r *http.Request) {
	list, err := h.redirects.ListActive(r.Context())
	if err != nil {
		response.ServerErr(w, err, "could not load redirects")
		return
	}
	out := make([]PublicRedirectDTO, len(list))
	for i, item := range list {
		out[i] = PublicRedirectDTO{From: item.FromPath, To: item.ToURL, Status: item.StatusCode}
	}
	response.JSON(w, http.StatusOK, map[string]any{"redirects": out})
}

func (h *RedirectHandler) List(w http.ResponseWriter, r *http.Request) {
	list, err := h.redirects.List(r.Context())
	if err != nil {
		response.ServerErr(w, err, "could not load redirects")
		return
	}
	out := make([]RedirectDTO, len(list))
	for i := range list {
		out[i] = toRedirectDTO(&list[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"redirects": out})
}

func (h *RedirectHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, ok := redirectID(w, r)
	if !ok {
		return
	}
	item, err := h.redirects.Get(r.Context(), id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			response.Err(w, http.StatusNotFound, "redirect not found")
			return
		}
		response.ServerErr(w, err, "could not load the redirect")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"redirect": toRedirectDTO(item)})
}

type redirectRequest struct {
	FromPath   string `json:"fromPath"`
	ToURL      string `json:"toUrl"`
	StatusCode int    `json:"statusCode"`
	Active     *bool  `json:"active"`
	Note       string `json:"note"`
}

func (req redirectRequest) input() service.RedirectInput {
	active := req.Active == nil || *req.Active // on unless switched off
	return service.RedirectInput{FromPath: req.FromPath, ToURL: req.ToURL, StatusCode: req.StatusCode, Active: active, Note: req.Note}
}

func (h *RedirectHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req redirectRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	item, err := h.redirects.Create(r.Context(), middleware.UserFromContext(r.Context()), req.input())
	if err != nil {
		h.fail(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{"redirect": toRedirectDTO(item)})
}

func (h *RedirectHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, ok := redirectID(w, r)
	if !ok {
		return
	}
	var req redirectRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	item, err := h.redirects.Update(r.Context(), middleware.UserFromContext(r.Context()), id, req.input())
	if err != nil {
		h.fail(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"redirect": toRedirectDTO(item)})
}

func (h *RedirectHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, ok := redirectID(w, r)
	if !ok {
		return
	}
	if err := h.redirects.Delete(r.Context(), middleware.UserFromContext(r.Context()), id); err != nil {
		h.fail(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

func redirectID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id < 1 {
		response.Err(w, http.StatusBadRequest, "invalid redirect id")
		return 0, false
	}
	return id, true
}

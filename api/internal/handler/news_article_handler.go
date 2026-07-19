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

type NewsArticleHandler struct {
	news *service.NewsArticleService
}

func NewNewsArticleHandler(news *service.NewsArticleService) *NewsArticleHandler {
	return &NewsArticleHandler{news: news}
}

type NewsArticleDTO struct {
	ID           int64      `json:"id"`
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

func toNewsArticleDTO(n *domain.NewsArticle) NewsArticleDTO {
	return NewsArticleDTO{
		ID: n.ID, Title: n.Title, Slug: n.Slug, CoverMediaID: n.CoverMediaID, Excerpt: n.Excerpt, Content: n.Content,
		Status: string(n.Status), PublishAt: n.PublishAt, CreatedAt: n.CreatedAt, UpdatedAt: n.UpdatedAt,
	}
}

func newsArticleErrorStatus(err error) int {
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

type newsArticleRequest struct {
	Title        string `json:"title"`
	Slug         string `json:"slug"`
	CoverMediaID *int64 `json:"coverMediaId"`
	Excerpt      string `json:"excerpt"`
	Content      string `json:"content"`
}

func (req newsArticleRequest) toInput() service.NewsArticleInput {
	return service.NewsArticleInput{
		Title: req.Title, Slug: req.Slug, CoverMediaID: req.CoverMediaID, Excerpt: req.Excerpt, Content: req.Content,
	}
}

func (h *NewsArticleHandler) Create(w http.ResponseWriter, r *http.Request) {
	actor := requireActor(r)
	var req newsArticleRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	article, err := h.news.Create(r.Context(), actor, req.toInput())
	if err != nil {
		response.Err(w, newsArticleErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{"newsArticle": toNewsArticleDTO(article)})
}

func (h *NewsArticleHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid news article id")
		return
	}
	var req newsArticleRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.news.Update(r.Context(), id, req.toInput()); err != nil {
		response.Err(w, newsArticleErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *NewsArticleHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid news article id")
		return
	}
	article, err := h.news.Get(r.Context(), id)
	if err != nil {
		response.Err(w, newsArticleErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"newsArticle": toNewsArticleDTO(article)})
}

func (h *NewsArticleHandler) GetPublic(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	article, err := h.news.GetPublishedBySlug(r.Context(), slug)
	if err != nil {
		response.Err(w, newsArticleErrorStatus(err), "news article not found")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"newsArticle": toNewsArticleDTO(article)})
}

func (h *NewsArticleHandler) List(w http.ResponseWriter, r *http.Request) {
	page, pageSize := parsePaging(r)
	items, total, err := h.news.ListAdmin(r.Context(), page, pageSize)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load news articles")
		return
	}
	dtos := make([]NewsArticleDTO, len(items))
	for i := range items {
		dtos[i] = toNewsArticleDTO(&items[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"newsArticles": dtos, "total": total})
}

func (h *NewsArticleHandler) ListPublic(w http.ResponseWriter, r *http.Request) {
	page, pageSize := parsePaging(r)
	items, total, err := h.news.ListPublished(r.Context(), page, pageSize)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load news articles")
		return
	}
	dtos := make([]NewsArticleDTO, len(items))
	for i := range items {
		dtos[i] = toNewsArticleDTO(&items[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"newsArticles": dtos, "total": total})
}

type setNewsArticleStatusRequest struct {
	Status    string     `json:"status"`
	PublishAt *time.Time `json:"publishAt"`
}

func (h *NewsArticleHandler) SetStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid news article id")
		return
	}
	var req setNewsArticleStatusRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.news.SetStatus(r.Context(), id, domain.ContentStatus(req.Status), req.PublishAt); err != nil {
		response.Err(w, newsArticleErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *NewsArticleHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid news article id")
		return
	}
	if err := h.news.Delete(r.Context(), id); err != nil {
		response.Err(w, newsArticleErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

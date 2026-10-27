package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/httpx"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

type SeoHandler struct {
	seo *service.SeoService
}

func NewSeoHandler(seo *service.SeoService) *SeoHandler {
	return &SeoHandler{seo: seo}
}

type SeoMetaDTO struct {
	MetaTitle       string  `json:"metaTitle"`
	MetaDescription string  `json:"metaDescription"`
	Keywords        string  `json:"keywords"`
	OGTitle         string  `json:"ogTitle"`
	OGDescription   string  `json:"ogDescription"`
	OGImageMediaID  *int64  `json:"ogImageMediaId"`
	OGImageURL      *string `json:"ogImageUrl"`
	CanonicalURL    string  `json:"canonicalUrl"`
	RobotsNoindex   bool    `json:"robotsNoindex"`
	RobotsNofollow  bool    `json:"robotsNofollow"`
	ArticleAuthor   string  `json:"articleAuthor"`
}

func toSeoMetaDTO(m *domain.SeoMeta) SeoMetaDTO {
	return SeoMetaDTO{
		MetaTitle: m.MetaTitle, MetaDescription: m.MetaDescription, Keywords: m.Keywords,
		OGTitle: m.OGTitle, OGDescription: m.OGDescription, OGImageMediaID: m.OGImageMediaID, OGImageURL: m.OGImageURL,
		CanonicalURL: m.CanonicalURL, RobotsNoindex: m.RobotsNoindex, RobotsNofollow: m.RobotsNofollow, ArticleAuthor: m.ArticleAuthor,
	}
}

func seoErrorStatus(err error) int {
	switch {
	case errors.Is(err, repository.ErrNotFound):
		return http.StatusNotFound
	case errors.Is(err, service.ErrInvalidSeoEntity), errors.Is(err, service.ErrInvalidCanonicalURL), errors.Is(err, service.ErrSeoFieldTooLong):
		return http.StatusBadRequest
	default:
		return http.StatusInternalServerError
	}
}

func seoTarget(r *http.Request) (string, int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	return r.PathValue("type"), id, err == nil && id > 0
}

// Get serves both the admin editor and the public site (an item without
// overrides returns all-empty values, so the site uses its defaults).
func (h *SeoHandler) Get(w http.ResponseWriter, r *http.Request) {
	entityType, id, ok := seoTarget(r)
	if !ok {
		response.Err(w, http.StatusBadRequest, "invalid id")
		return
	}
	meta, err := h.seo.Get(r.Context(), entityType, id)
	if err != nil {
		response.Err(w, seoErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"seo": toSeoMetaDTO(meta)})
}

func (h *SeoHandler) Save(w http.ResponseWriter, r *http.Request) {
	entityType, id, ok := seoTarget(r)
	if !ok {
		response.Err(w, http.StatusBadRequest, "invalid id")
		return
	}
	var req SeoMetaDTO
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	meta := &domain.SeoMeta{
		EntityType: entityType, EntityID: id,
		MetaTitle: req.MetaTitle, MetaDescription: req.MetaDescription, Keywords: req.Keywords,
		OGTitle: req.OGTitle, OGDescription: req.OGDescription, OGImageMediaID: req.OGImageMediaID,
		CanonicalURL: req.CanonicalURL, RobotsNoindex: req.RobotsNoindex, RobotsNofollow: req.RobotsNofollow, ArticleAuthor: req.ArticleAuthor,
	}
	if err := h.seo.Save(r.Context(), meta); err != nil {
		response.Err(w, seoErrorStatus(err), err.Error())
		return
	}
	saved, err := h.seo.Get(r.Context(), entityType, id)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load SEO settings")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"seo": toSeoMetaDTO(saved)})
}

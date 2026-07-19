package handler

import (
	"errors"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/httpx"
	"github.com/tang-edgetech/topcasinosg/api/internal/middleware"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
	"github.com/tang-edgetech/topcasinosg/api/internal/storage"
)

type SiteSettingsHandler struct {
	settings *service.SiteSettingsService
	storage  storage.Storage
}

func NewSiteSettingsHandler(settings *service.SiteSettingsService, store storage.Storage) *SiteSettingsHandler {
	return &SiteSettingsHandler{settings: settings, storage: store}
}

type siteSettingsDTO struct {
	SiteURL          string  `json:"siteUrl"`
	SiteTitle        string  `json:"siteTitle"`
	SEOIndex         bool    `json:"seoIndex"`
	SEOFollow        bool    `json:"seoFollow"`
	Timezone         string  `json:"timezone"`
	Language         string  `json:"language"`
	LogoURL          *string `json:"logoUrl"`
	FaviconURL       *string `json:"faviconUrl"`
	TwoFactorEnabled bool    `json:"twoFactorEnabled"`
}

func toSiteSettingsDTO(s *domain.SiteSettings) siteSettingsDTO {
	return siteSettingsDTO{
		SiteURL:          s.SiteURL,
		SiteTitle:        s.SiteTitle,
		SEOIndex:         s.SEOIndex,
		SEOFollow:        s.SEOFollow,
		Timezone:         s.Timezone,
		Language:         string(s.Language),
		LogoURL:          s.LogoURL,
		FaviconURL:       s.FaviconURL,
		TwoFactorEnabled: s.TwoFactorEnabled,
	}
}

func siteSettingsErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrForbidden):
		return http.StatusForbidden
	case errors.Is(err, service.ErrInvalidLanguage):
		return http.StatusBadRequest
	default:
		return http.StatusInternalServerError
	}
}

func (h *SiteSettingsHandler) Get(w http.ResponseWriter, r *http.Request) {
	settings, err := h.settings.Get(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load site settings")
		return
	}
	response.JSON(w, http.StatusOK, toSiteSettingsDTO(settings))
}

type updateSiteSettingsRequest struct {
	SiteURL   string `json:"siteUrl"`
	SiteTitle string `json:"siteTitle"`
	SEOIndex  bool   `json:"seoIndex"`
	SEOFollow bool   `json:"seoFollow"`
	Timezone  string `json:"timezone"`
	Language  string `json:"language"`
}

func (h *SiteSettingsHandler) Update(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	var req updateSiteSettingsRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	next := &domain.SiteSettings{
		SiteURL:   req.SiteURL,
		SiteTitle: req.SiteTitle,
		SEOIndex:  req.SEOIndex,
		SEOFollow: req.SEOFollow,
		Timezone:  req.Timezone,
		Language:  domain.Language(req.Language),
	}
	if err := h.settings.Update(r.Context(), actor, next); err != nil {
		response.Err(w, siteSettingsErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

type setTwoFactorRequest struct {
	Enabled bool `json:"enabled"`
}

func (h *SiteSettingsHandler) SetTwoFactorEnabled(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	var req setTwoFactorRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.settings.SetTwoFactorEnabled(r.Context(), actor, req.Enabled); err != nil {
		response.Err(w, siteSettingsErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

var allowedImageExt = map[string]bool{".png": true, ".jpg": true, ".jpeg": true, ".svg": true, ".webp": true, ".ico": true}

func (h *SiteSettingsHandler) UploadLogo(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	url, ok := h.saveUpload(w, r, "logo")
	if !ok {
		return
	}
	if err := h.settings.SetLogoURL(r.Context(), actor, url); err != nil {
		response.Err(w, siteSettingsErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]string{"logoUrl": url})
}

func (h *SiteSettingsHandler) UploadFavicon(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	url, ok := h.saveUpload(w, r, "favicon")
	if !ok {
		return
	}
	if err := h.settings.SetFaviconURL(r.Context(), actor, url); err != nil {
		response.Err(w, siteSettingsErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]string{"faviconUrl": url})
}

type setImageURLRequest struct {
	URL string `json:"url"`
}

// SetLogo points the site logo at an already-uploaded Media Library file
// instead of accepting a fresh multipart upload (see UploadLogo).
func (h *SiteSettingsHandler) SetLogo(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	var req setImageURLRequest
	if err := httpx.DecodeJSON(r, &req); err != nil || req.URL == "" {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.settings.SetLogoURL(r.Context(), actor, req.URL); err != nil {
		response.Err(w, siteSettingsErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]string{"logoUrl": req.URL})
}

// SetFavicon points the site favicon at an already-uploaded Media Library
// file instead of accepting a fresh multipart upload (see UploadFavicon).
func (h *SiteSettingsHandler) SetFavicon(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	var req setImageURLRequest
	if err := httpx.DecodeJSON(r, &req); err != nil || req.URL == "" {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.settings.SetFaviconURL(r.Context(), actor, req.URL); err != nil {
		response.Err(w, siteSettingsErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]string{"faviconUrl": req.URL})
}

func (h *SiteSettingsHandler) saveUpload(w http.ResponseWriter, r *http.Request, field string) (string, bool) {
	const maxUploadSize = 5 << 20 // 5MB
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)
	if err := r.ParseMultipartForm(maxUploadSize); err != nil {
		response.Err(w, http.StatusBadRequest, "file too large or invalid form")
		return "", false
	}

	file, header, err := r.FormFile(field)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "missing file field \""+field+"\"")
		return "", false
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedImageExt[ext] {
		response.Err(w, http.StatusBadRequest, "unsupported file type")
		return "", false
	}

	filename, err := storage.GenerateFilename(field, ext)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not generate file name")
		return "", false
	}

	url, err := h.storage.Save(r.Context(), filename, file)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not save file")
		return "", false
	}

	return url, true
}

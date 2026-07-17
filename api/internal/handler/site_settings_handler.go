package handler

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/tang-edgetech/topcasinosg/api/internal/config"
	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/httpx"
	"github.com/tang-edgetech/topcasinosg/api/internal/middleware"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

type SiteSettingsHandler struct {
	settings *service.SiteSettingsService
	cfg      config.Config
}

func NewSiteSettingsHandler(settings *service.SiteSettingsService, cfg config.Config) *SiteSettingsHandler {
	return &SiteSettingsHandler{settings: settings, cfg: cfg}
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

	nameBytes := make([]byte, 16)
	if _, err := rand.Read(nameBytes); err != nil {
		response.Err(w, http.StatusInternalServerError, "could not generate file name")
		return "", false
	}
	filename := field + "-" + hex.EncodeToString(nameBytes) + ext

	if err := os.MkdirAll(h.cfg.UploadDir, 0o755); err != nil {
		response.Err(w, http.StatusInternalServerError, "could not prepare upload directory")
		return "", false
	}
	dst, err := os.Create(filepath.Join(h.cfg.UploadDir, filename))
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not save file")
		return "", false
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		response.Err(w, http.StatusInternalServerError, "could not save file")
		return "", false
	}

	return "/uploads/" + filename, true
}

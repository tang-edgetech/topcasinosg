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

// SitemapHandler — Settings > Sitemap, the Sitemap box in each item's SEO
// tab, and the list the website turns into /sitemap.xml.
type SitemapHandler struct {
	sitemap *service.SitemapService
}

func NewSitemapHandler(sitemap *service.SitemapService) *SitemapHandler {
	return &SitemapHandler{sitemap: sitemap}
}

type SitemapSettingsDTO struct {
	Enabled   bool      `json:"enabled"`
	Types     []string  `json:"types"`
	ExtraURLs []string  `json:"extraUrls"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type SitemapItemDTO struct {
	EntityType string     `json:"entityType"`
	EntityID   int64      `json:"entityId"`
	Name       string     `json:"name"`
	Path       string     `json:"path"`
	UpdatedAt  *time.Time `json:"updatedAt"`
	Mode       string     `json:"mode"`
	Listed     bool       `json:"listed"`
	Reason     string     `json:"reason"`
}

func toSitemapSettingsDTO(s *domain.SitemapSettings) SitemapSettingsDTO {
	types := s.Types
	if types == nil {
		types = []string{}
	}
	extra := s.ExtraURLs
	if extra == nil {
		extra = []string{}
	}
	return SitemapSettingsDTO{Enabled: s.Enabled, Types: types, ExtraURLs: extra, UpdatedAt: s.UpdatedAt}
}

func toSitemapItemDTO(i domain.SitemapItem) SitemapItemDTO {
	dto := SitemapItemDTO{
		EntityType: i.EntityType, EntityID: i.EntityID, Name: i.Name, Path: i.Path,
		Mode: i.Mode, Listed: i.Listed, Reason: i.Reason,
	}
	if !i.UpdatedAt.IsZero() {
		t := i.UpdatedAt
		dto.UpdatedAt = &t
	}
	return dto
}

func sitemapErrorStatus(err error) int {
	switch {
	case errors.Is(err, repository.ErrNotFound):
		return http.StatusNotFound
	case errors.Is(err, service.ErrInvalidSitemapItem), errors.Is(err, service.ErrInvalidSitemapMode),
		errors.Is(err, service.ErrInvalidSitemapType), errors.Is(err, service.ErrInvalidSitemapURL),
		errors.Is(err, service.ErrTooManySitemapURLs), errors.Is(err, service.ErrTooManySitemapItems):
		return http.StatusBadRequest
	default:
		return http.StatusInternalServerError
	}
}

func (h *SitemapHandler) fail(w http.ResponseWriter, err error, fallback string) {
	if status := sitemapErrorStatus(err); status != http.StatusInternalServerError {
		response.Err(w, status, err.Error())
		return
	}
	response.ServerErr(w, err, fallback)
}

// Overview: GET /api/admin/sitemap — settings and every live page or item.
func (h *SitemapHandler) Overview(w http.ResponseWriter, r *http.Request) {
	overview, err := h.sitemap.Overview(r.Context())
	if err != nil {
		h.fail(w, err, "could not load the sitemap")
		return
	}
	items := make([]SitemapItemDTO, 0, len(overview.Items))
	for _, i := range overview.Items {
		items = append(items, toSitemapItemDTO(i))
	}
	response.JSON(w, http.StatusOK, map[string]any{
		"settings":    toSitemapSettingsDTO(overview.Settings),
		"siteNoindex": overview.SiteNoindex,
		"items":       items,
	})
}

// UpdateSettings: PUT /api/admin/sitemap/settings.
func (h *SitemapHandler) UpdateSettings(w http.ResponseWriter, r *http.Request) {
	// A field left out keeps its current value, so an API key that sends
	// only {"types": [...]} doesn't switch the sitemap off by accident.
	var req struct {
		Enabled   *bool     `json:"enabled"`
		Types     *[]string `json:"types"`
		ExtraURLs *[]string `json:"extraUrls"`
	}
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	current, err := h.sitemap.Settings(r.Context())
	if err != nil {
		h.fail(w, err, "could not load the sitemap settings")
		return
	}
	enabled, types, extra := current.Enabled, current.Types, current.ExtraURLs
	if req.Enabled != nil {
		enabled = *req.Enabled
	}
	if req.Types != nil {
		types = *req.Types
	}
	if req.ExtraURLs != nil {
		extra = *req.ExtraURLs
	}
	settings, err := h.sitemap.UpdateSettings(r.Context(), enabled, types, extra)
	if err != nil {
		h.fail(w, err, "could not save the sitemap settings")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"settings": toSitemapSettingsDTO(settings)})
}

// SetModes: PUT /api/admin/sitemap/items — {items: [{entityType, entityId,
// mode: default|include|exclude}]}; all or nothing.
func (h *SitemapHandler) SetModes(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Items []struct {
			EntityType string `json:"entityType"`
			EntityID   int64  `json:"entityId"`
			Mode       string `json:"mode"`
		} `json:"items"`
	}
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	changes := make([]service.SitemapModeChange, 0, len(req.Items))
	for _, i := range req.Items {
		changes = append(changes, service.SitemapModeChange{EntityType: i.EntityType, EntityID: i.EntityID, Mode: i.Mode})
	}
	if err := h.sitemap.SetModes(r.Context(), changes); err != nil {
		h.fail(w, err, "could not save the sitemap choices")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"updated": len(changes)})
}

// ItemStatus: GET /api/admin/sitemap/items/{type}/{id} — one item's Sitemap box.
func (h *SitemapHandler) ItemStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id <= 0 {
		response.Err(w, http.StatusBadRequest, "invalid id")
		return
	}
	status, err := h.sitemap.ItemStatus(r.Context(), r.PathValue("type"), id)
	if err != nil {
		h.fail(w, err, "could not load the sitemap setting")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{
		"item":      toSitemapItemDTO(status.Item),
		"sitemapOn": status.SitemapOn,
		"typeOn":    status.TypeOn,
	})
}

// Public: GET /api/sitemap — the addresses the website lists in
// /sitemap.xml (paths, or full URLs for extra addresses).
func (h *SitemapHandler) Public(w http.ResponseWriter, r *http.Request) {
	sitemap, err := h.sitemap.Public(r.Context())
	if err != nil {
		response.ServerErr(w, err, "could not build the sitemap")
		return
	}
	type entry struct {
		Loc     string  `json:"loc"`
		LastMod *string `json:"lastmod"`
	}
	entries := make([]entry, 0, len(sitemap.Entries))
	for _, e := range sitemap.Entries {
		out := entry{Loc: e.Loc}
		if e.LastMod != nil {
			d := e.LastMod.Format("2006-01-02")
			out.LastMod = &d
		}
		entries = append(entries, out)
	}
	response.JSON(w, http.StatusOK, map[string]any{"enabled": sitemap.Enabled, "urls": entries})
}

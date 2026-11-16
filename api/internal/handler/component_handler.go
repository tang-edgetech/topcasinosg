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

// ComponentHandler serves Components: the admin's Components section
// (/api/admin/components), the public site's read of one component
// (/api/components/{id}) and the Content API's reads (/api/v1/components).
type ComponentHandler struct {
	components *service.ComponentService
}

func NewComponentHandler(components *service.ComponentService) *ComponentHandler {
	return &ComponentHandler{components: components}
}

type ComponentDTO struct {
	ID          int64                     `json:"id"`
	Name        string                    `json:"name"`
	Description string                    `json:"description"`
	HTML        string                    `json:"html"`
	CSS         string                    `json:"css"`
	JS          string                    `json:"js"`
	Settings    []domain.ComponentSetting `json:"settings"`
	UsageCount  int                       `json:"usageCount"`
	CreatedAt   time.Time                 `json:"createdAt"`
	UpdatedAt   time.Time                 `json:"updatedAt"`
}

func toComponentDTO(c *domain.Component) ComponentDTO {
	return ComponentDTO{
		ID: c.ID, Name: c.Name, Description: c.Description, HTML: c.HTML, CSS: c.CSS, JS: c.JS,
		Settings: c.Settings, UsageCount: c.UsageCount, CreatedAt: c.CreatedAt, UpdatedAt: c.UpdatedAt,
	}
}

// componentSummaryDTO is a component without its code, for lists.
type componentSummaryDTO struct {
	ID          int64                     `json:"id"`
	Name        string                    `json:"name"`
	Description string                    `json:"description"`
	Settings    []domain.ComponentSetting `json:"settings"`
	UsageCount  int                       `json:"usageCount"`
	UpdatedAt   time.Time                 `json:"updatedAt"`
}

func toComponentSummary(c *domain.Component) componentSummaryDTO {
	return componentSummaryDTO{ID: c.ID, Name: c.Name, Description: c.Description, Settings: c.Settings, UsageCount: c.UsageCount, UpdatedAt: c.UpdatedAt}
}

type componentRequest struct {
	Name        string                    `json:"name"`
	Description string                    `json:"description"`
	HTML        string                    `json:"html"`
	CSS         string                    `json:"css"`
	JS          string                    `json:"js"`
	Settings    []domain.ComponentSetting `json:"settings"`
}

func (req componentRequest) input() service.ComponentInput {
	return service.ComponentInput{Name: req.Name, Description: req.Description, HTML: req.HTML, CSS: req.CSS, JS: req.JS, Settings: req.Settings}
}

func componentError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, repository.ErrNotFound):
		response.Err(w, http.StatusNotFound, "component not found")
	case errors.Is(err, service.ErrInvalidComponent):
		response.Err(w, http.StatusBadRequest, err.Error())
	case errors.Is(err, service.ErrAlreadyExists):
		response.Err(w, http.StatusConflict, "another component already has this name")
	case errors.Is(err, service.ErrComponentInUse):
		response.Err(w, http.StatusConflict, err.Error())
	default:
		response.Err(w, http.StatusInternalServerError, "could not save the component")
	}
}

func componentID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id < 1 {
		response.Err(w, http.StatusBadRequest, "invalid component id")
		return 0, false
	}
	return id, true
}

// List is every component with its settings and how many pages place it
// (no code, so the page builder's picker stays light).
func (h *ComponentHandler) List(w http.ResponseWriter, r *http.Request) {
	components, err := h.components.List(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load components")
		return
	}
	dtos := make([]componentSummaryDTO, len(components))
	for i := range components {
		dtos[i] = toComponentSummary(&components[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"components": dtos})
}

func (h *ComponentHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, ok := componentID(w, r)
	if !ok {
		return
	}
	c, err := h.components.Get(r.Context(), id)
	if err != nil {
		componentError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"component": toComponentDTO(c)})
}

// UsedOn lists the pages, global sections and templates placing it.
func (h *ComponentHandler) UsedOn(w http.ResponseWriter, r *http.Request) {
	id, ok := componentID(w, r)
	if !ok {
		return
	}
	pages, err := h.components.UsedOn(r.Context(), id)
	if err != nil {
		componentError(w, err)
		return
	}
	type usedOnDTO struct {
		ID    int64  `json:"id"`
		Title string `json:"title"`
		Slug  string `json:"slug"`
		Kind  string `json:"kind"`
	}
	dtos := make([]usedOnDTO, len(pages))
	for i, p := range pages {
		dtos[i] = usedOnDTO{ID: p.ID, Title: p.Title, Slug: p.Slug, Kind: p.Kind}
	}
	response.JSON(w, http.StatusOK, map[string]any{"pages": dtos})
}

type componentRevisionDTO struct {
	ID          int64                     `json:"id"`
	SavedByName string                    `json:"savedByName"`
	CreatedAt   time.Time                 `json:"createdAt"`
	Name        string                    `json:"name"`
	Description string                    `json:"description"`
	HTML        string                    `json:"html"`
	CSS         string                    `json:"css"`
	JS          string                    `json:"js"`
	Settings    []domain.ComponentSetting `json:"settings"`
}

func (h *ComponentHandler) Revisions(w http.ResponseWriter, r *http.Request) {
	id, ok := componentID(w, r)
	if !ok {
		return
	}
	revisions, err := h.components.Revisions(r.Context(), id)
	if err != nil {
		componentError(w, err)
		return
	}
	dtos := make([]componentRevisionDTO, len(revisions))
	for i, rv := range revisions {
		s := rv.Snapshot
		if s.Settings == nil {
			s.Settings = []domain.ComponentSetting{}
		}
		dtos[i] = componentRevisionDTO{
			ID: rv.ID, SavedByName: rv.SavedByName, CreatedAt: rv.CreatedAt,
			Name: s.Name, Description: s.Description, HTML: s.HTML, CSS: s.CSS, JS: s.JS, Settings: s.Settings,
		}
	}
	response.JSON(w, http.StatusOK, map[string]any{"revisions": dtos})
}

func (h *ComponentHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req componentRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	c, err := h.components.Create(r.Context(), req.input(), actorID(r))
	if err != nil {
		componentError(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{"component": toComponentDTO(c)})
}

func (h *ComponentHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, ok := componentID(w, r)
	if !ok {
		return
	}
	var req componentRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	c, err := h.components.Update(r.Context(), id, req.input(), actorID(r))
	if err != nil {
		componentError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"component": toComponentDTO(c)})
}

func (h *ComponentHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, ok := componentID(w, r)
	if !ok {
		return
	}
	if err := h.components.Delete(r.Context(), id); err != nil {
		componentError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

// publicComponentDTO is what the public site needs to run a component.
type publicComponentDTO struct {
	ID       int64                     `json:"id"`
	Name     string                    `json:"name"`
	HTML     string                    `json:"html"`
	CSS      string                    `json:"css"`
	JS       string                    `json:"js"`
	Settings []domain.ComponentSetting `json:"settings"`
}

// GetPublic is one component for the public site to render. Its code is
// already public: it runs in visitors' browsers.
func (h *ComponentHandler) GetPublic(w http.ResponseWriter, r *http.Request) {
	id, ok := componentID(w, r)
	if !ok {
		return
	}
	c, err := h.components.Get(r.Context(), id)
	if err != nil {
		componentError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"component": publicComponentDTO{
		ID: c.ID, Name: c.Name, HTML: c.HTML, CSS: c.CSS, JS: c.JS, Settings: c.Settings,
	}})
}

// APIList is GET /api/v1/components: what can be placed with a
// "component" block, and the settings each placement can fill in.
func (h *ComponentHandler) APIList(w http.ResponseWriter, r *http.Request) {
	components, err := h.components.List(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load components")
		return
	}
	dtos := make([]componentSummaryDTO, len(components))
	for i := range components {
		dtos[i] = toComponentSummary(&components[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{
		"about":      componentAbout,
		"components": dtos,
	})
}

// APIGet is GET /api/v1/components/{id}: one component with its code, to
// read how it works. Components are made and changed by the site's
// developers in the backoffice, not through the Content API.
func (h *ComponentHandler) APIGet(w http.ResponseWriter, r *http.Request) {
	id, ok := componentID(w, r)
	if !ok {
		return
	}
	c, err := h.components.Get(r.Context(), id)
	if err != nil {
		componentError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"component": toComponentDTO(c)})
}

const componentAbout = "Place one on a page with a section of blockType \"component\" inside a container: a text field \"componentId\" with the component's id, plus one text field per setting you want to fill (fieldKey = the setting's key, on itemIndex 0; richtext settings use fieldType richtext). Settings left out use their default. A select setting takes one of its options' values, a toggle yes or no. Components themselves are made and changed by the site's developers in the backoffice (Components), not through this API."

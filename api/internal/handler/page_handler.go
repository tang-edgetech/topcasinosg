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

type PageHandler struct {
	pages *service.PageService
}

func NewPageHandler(pages *service.PageService) *PageHandler {
	return &PageHandler{pages: pages}
}

type PageDTO struct {
	ID              int64      `json:"id"`
	ParentID        *int64     `json:"parentId"`
	Slug            string     `json:"slug"`
	// Path is the page's full URL path (every ancestor's slug, root-first,
	// then this page's own) - computed, not stored; see PageService.PathsByID.
	// Empty when the DTO is built without a paths map (e.g. GetPublic, which
	// only ever needs the single resolved page, not the whole tree).
	Path            string     `json:"path"`
	Title           string     `json:"title"`
	MetaTitle       string     `json:"metaTitle"`
	MetaDescription string     `json:"metaDescription"`
	HeadSnippet     string     `json:"headSnippet"`
	BodySnippet     string     `json:"bodySnippet"`
	FooterSnippet   string     `json:"footerSnippet"`
	Status          string     `json:"status"`
	PublishAt       *time.Time `json:"publishAt"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}

func toPageDTO(p *domain.Page, paths map[int64]string) PageDTO {
	return PageDTO{
		ID: p.ID, ParentID: p.ParentID, Slug: p.Slug, Path: paths[p.ID], Title: p.Title,
		MetaTitle: p.MetaTitle, MetaDescription: p.MetaDescription,
		HeadSnippet: p.HeadSnippet, BodySnippet: p.BodySnippet, FooterSnippet: p.FooterSnippet,
		Status: string(p.Status), PublishAt: p.PublishAt, CreatedAt: p.CreatedAt, UpdatedAt: p.UpdatedAt,
	}
}

type PageSectionFieldDTO struct {
	ItemIndex int     `json:"itemIndex"`
	FieldKey  string  `json:"fieldKey"`
	FieldType string  `json:"fieldType"`
	TextValue string  `json:"textValue"`
	MediaID   *int64  `json:"mediaId"`
	MediaURL  *string `json:"mediaUrl"`
	URLValue  string  `json:"urlValue"`
	SortOrder int     `json:"sortOrder"`
}

type PageSectionDTO struct {
	ID          int64                 `json:"id"`
	BlockType   string                `json:"blockType"`
	CustomClass string                `json:"customClass"`
	CustomID    string                `json:"customId"`
	SortOrder   int                   `json:"sortOrder"`
	Fields      []PageSectionFieldDTO `json:"fields"`
}

func toSectionDTOs(sections []domain.PageSection) []PageSectionDTO {
	dtos := make([]PageSectionDTO, len(sections))
	for i, s := range sections {
		fields := make([]PageSectionFieldDTO, len(s.Fields))
		for j, f := range s.Fields {
			fields[j] = PageSectionFieldDTO{
				ItemIndex: f.ItemIndex, FieldKey: f.FieldKey, FieldType: f.FieldType, TextValue: f.TextValue,
				MediaID: f.MediaID, MediaURL: f.MediaURL, URLValue: f.URLValue, SortOrder: f.SortOrder,
			}
		}
		dtos[i] = PageSectionDTO{
			ID: s.ID, BlockType: s.BlockType, CustomClass: s.CustomClass, CustomID: s.CustomID,
			SortOrder: s.SortOrder, Fields: fields,
		}
	}
	return dtos
}

func pageErrorStatus(err error) int {
	switch {
	case errors.Is(err, repository.ErrNotFound):
		return http.StatusNotFound
	case errors.Is(err, service.ErrAlreadyExists):
		return http.StatusConflict
	case errors.Is(err, service.ErrInvalidContentStatus), errors.Is(err, service.ErrPublishAtRequired),
		errors.Is(err, service.ErrInvalidBlockType), errors.Is(err, service.ErrInvalidFieldType),
		errors.Is(err, service.ErrHomeSlugLocked), errors.Is(err, service.ErrInvalidParent):
		return http.StatusBadRequest
	default:
		return http.StatusInternalServerError
	}
}

func (h *PageHandler) List(w http.ResponseWriter, r *http.Request) {
	pages, err := h.pages.List(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load pages")
		return
	}
	paths, err := h.pages.PathsByID(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not compute page paths")
		return
	}
	dtos := make([]PageDTO, len(pages))
	for i := range pages {
		dtos[i] = toPageDTO(&pages[i], paths)
	}
	response.JSON(w, http.StatusOK, map[string]any{"pages": dtos})
}

func (h *PageHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid page id")
		return
	}
	page, err := h.pages.GetByID(r.Context(), id)
	if err != nil {
		response.Err(w, pageErrorStatus(err), "page not found")
		return
	}
	sections, err := h.pages.Sections(r.Context(), id)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load page sections")
		return
	}
	paths, err := h.pages.PathsByID(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not compute page paths")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"page": toPageDTO(page, paths), "sections": toSectionDTOs(sections)})
}

// GetPublic — the public website's read. No auth; only the resolved leaf
// page's own status is checked (see PageService.ResolvePath) — a page one
// or more levels deep is looked up by its FULL path (e.g. "legal/privacy-
// policy"), a root page by its own slug alone, same mechanism either way.
func (h *PageHandler) GetPublic(w http.ResponseWriter, r *http.Request) {
	path := r.PathValue("path")
	page, err := h.pages.ResolvePath(r.Context(), path)
	if err != nil {
		response.Err(w, pageErrorStatus(err), "page not found")
		return
	}
	sections, err := h.pages.Sections(r.Context(), page.ID)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load page sections")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"page": toPageDTO(page, nil), "sections": toSectionDTOs(sections)})
}

type pageRequest struct {
	ParentID        *int64 `json:"parentId"`
	Slug            string `json:"slug"`
	Title           string `json:"title"`
	MetaTitle       string `json:"metaTitle"`
	MetaDescription string `json:"metaDescription"`
}

func (h *PageHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req pageRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	page, err := h.pages.Create(r.Context(), service.PageInput{
		ParentID: req.ParentID, Slug: req.Slug, Title: req.Title, MetaTitle: req.MetaTitle, MetaDescription: req.MetaDescription,
	})
	if err != nil {
		response.Err(w, pageErrorStatus(err), err.Error())
		return
	}
	paths, err := h.pages.PathsByID(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not compute page paths")
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{"page": toPageDTO(page, paths)})
}

func (h *PageHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid page id")
		return
	}
	var req pageRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.pages.Update(r.Context(), id, service.PageInput{
		ParentID: req.ParentID, Slug: req.Slug, Title: req.Title, MetaTitle: req.MetaTitle, MetaDescription: req.MetaDescription,
	}); err != nil {
		response.Err(w, pageErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

type seoRequest struct {
	MetaTitle       string `json:"metaTitle"`
	MetaDescription string `json:"metaDescription"`
}

func (h *PageHandler) UpdateSEO(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid page id")
		return
	}
	var req seoRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.pages.UpdateSEO(r.Context(), id, service.SEOInput{
		MetaTitle: req.MetaTitle, MetaDescription: req.MetaDescription,
	}); err != nil {
		response.Err(w, pageErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

type snippetsRequest struct {
	HeadSnippet   string `json:"headSnippet"`
	BodySnippet   string `json:"bodySnippet"`
	FooterSnippet string `json:"footerSnippet"`
}

func (h *PageHandler) UpdateSnippets(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid page id")
		return
	}
	var req snippetsRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.pages.UpdateSnippets(r.Context(), id, service.SnippetsInput{
		HeadSnippet: req.HeadSnippet, BodySnippet: req.BodySnippet, FooterSnippet: req.FooterSnippet,
	}); err != nil {
		response.Err(w, pageErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

type setPageStatusRequest struct {
	Status    string     `json:"status"`
	PublishAt *time.Time `json:"publishAt"`
}

func (h *PageHandler) SetStatus(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid page id")
		return
	}
	var req setPageStatusRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.pages.SetStatus(r.Context(), id, domain.ContentStatus(req.Status), req.PublishAt); err != nil {
		response.Err(w, pageErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *PageHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid page id")
		return
	}
	if err := h.pages.Delete(r.Context(), id); err != nil {
		response.Err(w, pageErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

type replaceSectionsRequest struct {
	Sections []PageSectionDTO `json:"sections"`
}

func (h *PageHandler) ReplaceSections(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid page id")
		return
	}
	var req replaceSectionsRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}

	sections := make([]domain.PageSection, len(req.Sections))
	for i, s := range req.Sections {
		fields := make([]domain.PageSectionField, len(s.Fields))
		for j, f := range s.Fields {
			fields[j] = domain.PageSectionField{
				ItemIndex: f.ItemIndex, FieldKey: f.FieldKey, FieldType: f.FieldType, TextValue: f.TextValue,
				MediaID: f.MediaID, URLValue: f.URLValue, SortOrder: f.SortOrder,
			}
		}
		sections[i] = domain.PageSection{
			PageID: id, BlockType: s.BlockType, CustomClass: s.CustomClass, CustomID: s.CustomID,
			SortOrder: s.SortOrder, Fields: fields,
		}
	}

	if err := h.pages.ReplaceSections(r.Context(), id, sections); err != nil {
		response.Err(w, pageErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

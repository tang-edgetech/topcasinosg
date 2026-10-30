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

type SnippetHandler struct {
	snippets *service.SnippetService
}

func NewSnippetHandler(snippets *service.SnippetService) *SnippetHandler {
	return &SnippetHandler{snippets: snippets}
}

type ConditionDTO struct {
	ID int64 `json:"id"`
	// GroupIndex: conditions in one group combine with AND, groups with OR.
	GroupIndex int    `json:"groupIndex"`
	Field      string `json:"field"`
	Operator   string `json:"operator"`
	PageID     *int64 `json:"pageId"`
	Value      string `json:"value"`
	SortOrder  int    `json:"sortOrder"`
}

type SnippetDTO struct {
	ID         int64          `json:"id"`
	Name       string         `json:"name"`
	Kind       string         `json:"kind"`
	CodeType   *string        `json:"codeType"`
	Location   string         `json:"location"`
	Content    string         `json:"content"`
	IsActive   bool           `json:"isActive"`
	SortOrder  int            `json:"sortOrder"`
	Priority   int            `json:"priority"`
	Conditions []ConditionDTO `json:"conditions"`
	CreatedAt  time.Time      `json:"createdAt"`
	UpdatedAt  time.Time      `json:"updatedAt"`
}

func toCodeTypeDTO(t *domain.CodeType) *string {
	if t == nil {
		return nil
	}
	v := string(*t)
	return &v
}

func toConditionDTOs(in []domain.SnippetCondition) []ConditionDTO {
	conditions := make([]ConditionDTO, len(in))
	for i, c := range in {
		conditions[i] = ConditionDTO{
			ID: c.ID, GroupIndex: c.GroupIndex, Field: string(c.Field), Operator: string(c.Operator), PageID: c.PageID, Value: c.Value, SortOrder: c.SortOrder,
		}
	}
	return conditions
}

func toSnippetDTO(s *domain.SiteSnippet) SnippetDTO {
	codeType := toCodeTypeDTO(s.CodeType)
	conditions := toConditionDTOs(s.Conditions)
	return SnippetDTO{
		ID: s.ID, Name: s.Name, Kind: string(s.Kind), CodeType: codeType, Location: string(s.Location), Content: s.Content,
		IsActive: s.IsActive, SortOrder: s.SortOrder, Priority: s.Priority, Conditions: conditions,
		CreatedAt: s.CreatedAt, UpdatedAt: s.UpdatedAt,
	}
}

func snippetErrorStatus(err error) int {
	switch {
	case errors.Is(err, repository.ErrNotFound):
		return http.StatusNotFound
	case errors.Is(err, service.ErrInvalidSnippetLocation), errors.Is(err, service.ErrInvalidSnippetKind),
		errors.Is(err, service.ErrInvalidCodeType), errors.Is(err, service.ErrInvalidSnippetPriority),
		errors.Is(err, service.ErrInvalidSnippetCondition), errors.Is(err, service.ErrSnippetNameRequired),
		errors.Is(err, service.ErrSnippetContentRequired):
		return http.StatusBadRequest
	default:
		return http.StatusInternalServerError
	}
}

// SnippetRevisionDTO is one saved version, with the fields the admin form
// loads back when restoring it.
type SnippetRevisionDTO struct {
	ID          int64          `json:"id"`
	SavedByName string         `json:"savedByName"`
	CreatedAt   time.Time      `json:"createdAt"`
	Name        string         `json:"name"`
	CodeType    *string        `json:"codeType"`
	Location    string         `json:"location"`
	Content     string         `json:"content"`
	SortOrder   int            `json:"sortOrder"`
	Priority    int            `json:"priority"`
	Conditions  []ConditionDTO `json:"conditions"`
}

// actorID is the signed-in admin's id, recorded on the revision a save makes.
func actorID(r *http.Request) *int64 {
	if actor := requireActor(r); actor != nil {
		return &actor.ID
	}
	return nil
}

func (h *SnippetHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid snippet id")
		return
	}
	snippet, err := h.snippets.GetByID(r.Context(), id)
	if err != nil {
		response.Err(w, snippetErrorStatus(err), "could not load snippet")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"snippet": toSnippetDTO(snippet)})
}

func (h *SnippetHandler) Revisions(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid snippet id")
		return
	}
	revisions, err := h.snippets.Revisions(r.Context(), id)
	if err != nil {
		response.Err(w, snippetErrorStatus(err), "could not load revisions")
		return
	}
	dtos := make([]SnippetRevisionDTO, len(revisions))
	for i, rv := range revisions {
		snap := rv.Snapshot
		dtos[i] = SnippetRevisionDTO{
			ID: rv.ID, SavedByName: rv.SavedByName, CreatedAt: rv.CreatedAt,
			Name: snap.Name, CodeType: toCodeTypeDTO(snap.CodeType), Location: string(snap.Location), Content: snap.Content,
			SortOrder: snap.SortOrder, Priority: snap.Priority, Conditions: toConditionDTOs(snap.Conditions),
		}
	}
	response.JSON(w, http.StatusOK, map[string]any{"revisions": dtos})
}

func (h *SnippetHandler) List(w http.ResponseWriter, r *http.Request) {
	snippets, err := h.snippets.List(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load snippets")
		return
	}
	dtos := make([]SnippetDTO, len(snippets))
	for i := range snippets {
		dtos[i] = toSnippetDTO(&snippets[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"snippets": dtos})
}

// GetPublic — every page load's read. No auth. `path` is the requesting
// page's pathname (web/'s proxy.ts forwards it via headers()) so 'code'
// snippets' targeting conditions can be evaluated against the real request.
func (h *SnippetHandler) GetPublic(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Query().Get("path")
	if path == "" {
		path = "/"
	}
	grouped, err := h.snippets.ListMatchingGrouped(r.Context(), path)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load snippets")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{
		"head":   grouped[domain.SnippetLocationHead],
		"body":   grouped[domain.SnippetLocationBody],
		"footer": grouped[domain.SnippetLocationFooter],
	})
}

type conditionRequest struct {
	GroupIndex int    `json:"groupIndex"`
	Field      string `json:"field"`
	Operator   string `json:"operator"`
	PageID     *int64 `json:"pageId"`
	Value      string `json:"value"`
	SortOrder  int    `json:"sortOrder"`
}

type snippetRequest struct {
	Name       string             `json:"name"`
	Kind       string             `json:"kind"`
	CodeType   *string            `json:"codeType"`
	Location   string             `json:"location"`
	Content    string             `json:"content"`
	SortOrder  int                `json:"sortOrder"`
	Priority   int                `json:"priority"`
	Conditions []conditionRequest `json:"conditions"`
}

func toSnippetInput(req snippetRequest) service.SnippetInput {
	var codeType *domain.CodeType
	if req.CodeType != nil {
		ct := domain.CodeType(*req.CodeType)
		codeType = &ct
	}
	conditions := make([]service.ConditionInput, len(req.Conditions))
	for i, c := range req.Conditions {
		conditions[i] = service.ConditionInput{
			GroupIndex: c.GroupIndex, Field: domain.ConditionField(c.Field), Operator: domain.ConditionOperator(c.Operator),
			PageID: c.PageID, Value: c.Value, SortOrder: c.SortOrder,
		}
	}
	return service.SnippetInput{
		Name: req.Name, Kind: domain.SnippetKind(req.Kind), CodeType: codeType, Location: domain.SnippetLocation(req.Location),
		Content: req.Content, SortOrder: req.SortOrder, Priority: req.Priority, Conditions: conditions,
	}
}

func (h *SnippetHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req snippetRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	snippet, err := h.snippets.Create(r.Context(), toSnippetInput(req), actorID(r))
	if err != nil {
		response.Err(w, snippetErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{"snippet": toSnippetDTO(snippet)})
}

func (h *SnippetHandler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid snippet id")
		return
	}
	var req snippetRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.snippets.Update(r.Context(), id, toSnippetInput(req), actorID(r)); err != nil {
		response.Err(w, snippetErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

type setSnippetActiveRequest struct {
	Active bool `json:"active"`
}

func (h *SnippetHandler) SetActive(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid snippet id")
		return
	}
	var req setSnippetActiveRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.snippets.SetActive(r.Context(), id, req.Active); err != nil {
		response.Err(w, snippetErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *SnippetHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid snippet id")
		return
	}
	if err := h.snippets.Delete(r.Context(), id); err != nil {
		response.Err(w, snippetErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

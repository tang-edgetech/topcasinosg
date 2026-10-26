package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/middleware"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

type AuditHandler struct {
	audit *service.AuditService
}

func NewAuditHandler(audit *service.AuditService) *AuditHandler {
	return &AuditHandler{audit: audit}
}

type AuditLogDTO struct {
	ID          int64               `json:"id"`
	ActorID     *int64              `json:"actorId"`
	ActorName   string              `json:"actorName"`
	ActorRole   string              `json:"actorRole"`
	Action      string              `json:"action"`
	EntityType  string              `json:"entityType"`
	EntityID    *int64              `json:"entityId"`
	EntityLabel string              `json:"entityLabel"`
	Changes     domain.AuditChanges `json:"changes"`
	IPAddress   string              `json:"ipAddress"`
	IPPort      *int                `json:"ipPort"`
	UserAgent   string              `json:"userAgent"`
	Method      string              `json:"method"`
	Path        string              `json:"path"`
	StatusCode  int                 `json:"statusCode"`
	Error       string              `json:"error"`
	CreatedAt   time.Time           `json:"createdAt"`
}

type AuditActorDTO struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

func toAuditLogDTO(l *domain.AuditLog) AuditLogDTO {
	return AuditLogDTO{
		ID:          l.ID,
		ActorID:     l.ActorID,
		ActorName:   l.ActorName,
		ActorRole:   l.ActorRole,
		Action:      l.Action,
		EntityType:  l.EntityType,
		EntityID:    l.EntityID,
		EntityLabel: l.EntityLabel,
		Changes:     l.Changes,
		IPAddress:   l.IPAddress,
		IPPort:      l.IPPort,
		UserAgent:   l.UserAgent,
		Method:      l.RequestMethod,
		Path:        l.RequestPath,
		StatusCode:  l.StatusCode,
		Error:       l.ErrorMessage,
		CreatedAt:   l.CreatedAt,
	}
}

func parseQueryTime(r *http.Request, key string) *time.Time {
	value, err := time.Parse(time.RFC3339, r.URL.Query().Get(key))
	if err != nil {
		return nil
	}
	return &value
}

func (h *AuditHandler) List(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	page, pageSize := parsePaging(r)
	query := r.URL.Query()
	filter := domain.AuditFilter{
		EntityType: query.Get("entityType"),
		Action:     query.Get("action"),
		From:       parseQueryTime(r, "from"),
		To:         parseQueryTime(r, "to"),
		ErrorsOnly: query.Get("outcome") == "error",
		Page:       page,
		PageSize:   pageSize,
	}
	if actorID, err := strconv.ParseInt(query.Get("actorId"), 10, 64); err == nil {
		filter.ActorID = &actorID
	}

	logs, total, err := h.audit.List(r.Context(), actor, filter)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load activity")
		return
	}
	dtos := make([]AuditLogDTO, len(logs))
	for i := range logs {
		dtos[i] = toAuditLogDTO(&logs[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"logs": dtos, "total": total})
}

func (h *AuditHandler) Actors(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	actors, err := h.audit.Actors(r.Context(), actor)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load users")
		return
	}
	dtos := make([]AuditActorDTO, len(actors))
	for i, a := range actors {
		dtos[i] = AuditActorDTO{ID: a.ID, Name: a.Name}
	}
	response.JSON(w, http.StatusOK, map[string]any{"actors": dtos})
}

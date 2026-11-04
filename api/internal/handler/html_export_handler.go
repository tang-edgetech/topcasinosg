package handler

import (
	"context"
	"errors"
	"io"
	"net/http"
	"strings"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/middleware"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

// HTMLExportHandler: Settings > HTML Export (Super Admin only) saves the
// whole public website as a zip of HTML files (service.HTMLExportService).
type HTMLExportHandler struct {
	exports *service.HTMLExportService
	audit   *service.AuditService
}

func NewHTMLExportHandler(exports *service.HTMLExportService, audit *service.AuditService) *HTMLExportHandler {
	return &HTMLExportHandler{exports: exports, audit: audit}
}

func (h *HTMLExportHandler) Status(w http.ResponseWriter, r *http.Request) {
	response.JSON(w, http.StatusOK, map[string]any{"export": h.exports.Status()})
}

func (h *HTMLExportHandler) Start(w http.ResponseWriter, r *http.Request) {
	status, err := h.exports.Start(r.Context(), requireActor(r), requestOrigin(r))
	switch {
	case errors.Is(err, service.ErrHTMLExportRunning):
		response.Err(w, http.StatusConflict, err.Error())
	case errors.Is(err, service.ErrHTMLExportSiteURL):
		response.Err(w, http.StatusBadRequest, err.Error())
	case err != nil:
		response.Err(w, http.StatusInternalServerError, "could not start the export")
	default:
		response.JSON(w, http.StatusAccepted, map[string]any{"export": status})
	}
}

func (h *HTMLExportHandler) Cancel(w http.ResponseWriter, r *http.Request) {
	h.exports.Cancel()
	response.JSON(w, http.StatusOK, map[string]any{"export": h.exports.Status()})
}

// Download sends the last finished zip. GETs aren't in the activity log by
// themselves, so this one is recorded here.
func (h *HTMLExportHandler) Download(w http.ResponseWriter, r *http.Request) {
	file, name, err := h.exports.File()
	if err != nil {
		response.Err(w, http.StatusNotFound, err.Error())
		return
	}
	defer file.Close()
	actor := requireActor(r)
	ip, port := middleware.ClientAddress(r)
	h.audit.Record(context.WithoutCancel(r.Context()), &domain.AuditLog{
		ActorID: &actor.ID, ActorName: actor.FullName, ActorRole: string(actor.Role),
		Action: "download", EntityType: "html-export", EntityLabel: name,
		IPAddress: ip, IPPort: port, UserAgent: r.UserAgent(), RequestMethod: r.Method, RequestPath: r.URL.RequestURI(), StatusCode: http.StatusOK,
	})
	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", `attachment; filename="`+name+`"`)
	w.Header().Set("Cache-Control", "no-store")
	if info, err := file.Stat(); err == nil {
		http.ServeContent(w, r, name, info.ModTime(), file)
		return
	}
	_, _ = io.Copy(w, file)
}

// requestOrigin is this API's public address as the browser called it
// (behind the proxy, from X-Forwarded-Proto / X-Forwarded-Host).
func requestOrigin(r *http.Request) string {
	scheme := "http"
	if r.TLS != nil || strings.EqualFold(r.Header.Get("X-Forwarded-Proto"), "https") {
		scheme = "https"
	}
	host := r.Host
	if forwarded := strings.TrimSpace(strings.Split(r.Header.Get("X-Forwarded-Host"), ",")[0]); forwarded != "" {
		host = forwarded
	}
	return scheme + "://" + host
}

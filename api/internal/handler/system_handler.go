package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/tang-edgetech/topcasinosg/api/internal/response"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

// SystemHandler serves Settings > Log: versions, deploys and log files.
type SystemHandler struct {
	system *service.SystemService
}

func NewSystemHandler(system *service.SystemService) *SystemHandler {
	return &SystemHandler{system: system}
}

func (h *SystemHandler) Status(w http.ResponseWriter, r *http.Request) {
	response.JSON(w, http.StatusOK, h.system.Status(r.Context()))
}

// Log returns the end of one log file: ?lines=200 (up to 2000) and
// ?errors=1 for error lines only.
func (h *SystemHandler) Log(w http.ResponseWriter, r *http.Request) {
	lines, err := strconv.Atoi(r.URL.Query().Get("lines"))
	if err != nil || lines <= 0 {
		lines = 200
	}
	tail, err := h.system.Tail(r.PathValue("key"), lines, r.URL.Query().Get("errors") == "1")
	if errors.Is(err, service.ErrUnknownLogFile) {
		response.Err(w, http.StatusNotFound, "Unknown log file.")
		return
	}
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "Could not read the log file.")
		return
	}
	response.JSON(w, http.StatusOK, tail)
}

package handler

import (
	"errors"
	"net/http"

	"github.com/tang-edgetech/topcasinosg/api/internal/httpx"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

// SystemHandler serves Settings > Log: versions and deploys, and resolving or
// removing deploys from the list.
type SystemHandler struct {
	system *service.SystemService
}

func NewSystemHandler(system *service.SystemService) *SystemHandler {
	return &SystemHandler{system: system}
}

func (h *SystemHandler) Status(w http.ResponseWriter, r *http.Request) {
	status, err := h.system.Status(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "Could not load the server status.")
		return
	}
	response.JSON(w, http.StatusOK, status)
}

func deploymentErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrDeploymentNotFound):
		return http.StatusNotFound
	case errors.Is(err, service.ErrDeploymentNotResolvable), errors.Is(err, service.ErrDeploymentNeedsResolving),
		errors.Is(err, service.ErrDeploymentRunning), errors.Is(err, service.ErrInvalidDeploymentLimit):
		return http.StatusBadRequest
	default:
		return http.StatusInternalServerError
	}
}

func deploymentErrorMessage(err error) string {
	if deploymentErrorStatus(err) == http.StatusInternalServerError {
		return "Could not update the deployment list."
	}
	return err.Error()
}

type deploymentLimitRequest struct {
	Limit int `json:"limit"`
}

func (h *SystemHandler) SetDeploymentLimit(w http.ResponseWriter, r *http.Request) {
	var req deploymentLimitRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.system.SetDeploymentLimit(r.Context(), req.Limit); err != nil {
		response.Err(w, deploymentErrorStatus(err), deploymentErrorMessage(err))
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

// The deployment id ("<log timestamp>|<commit>") goes in the body, not the
// path, since it holds a space and a "|".
type deploymentActionRequest struct {
	ID   string `json:"id"`
	Note string `json:"note"`
}

func (h *SystemHandler) ResolveDeployment(w http.ResponseWriter, r *http.Request) {
	var req deploymentActionRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.system.ResolveDeployment(r.Context(), req.ID, requireActor(r).ID, req.Note); err != nil {
		response.Err(w, deploymentErrorStatus(err), deploymentErrorMessage(err))
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"resolved": true})
}

func (h *SystemHandler) RemoveDeployment(w http.ResponseWriter, r *http.Request) {
	var req deploymentActionRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.system.RemoveDeployment(r.Context(), req.ID, requireActor(r).ID); err != nil {
		response.Err(w, deploymentErrorStatus(err), deploymentErrorMessage(err))
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"removed": true})
}

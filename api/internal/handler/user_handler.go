package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/httpx"
	"github.com/tang-edgetech/topcasinosg/api/internal/middleware"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

type UserHandler struct {
	users *service.UserService
}

func NewUserHandler(users *service.UserService) *UserHandler {
	return &UserHandler{users: users}
}

func userErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrForbidden), errors.Is(err, service.ErrInvalidRole), errors.Is(err, service.ErrCannotActOnSelf):
		return http.StatusForbidden
	case errors.Is(err, service.ErrEmailTaken):
		return http.StatusConflict
	case errors.Is(err, service.ErrWrongCurrentPassword):
		return http.StatusUnauthorized
	default:
		return http.StatusInternalServerError
	}
}

func pathID(r *http.Request) (int64, error) {
	return strconv.ParseInt(r.PathValue("id"), 10, 64)
}

func (h *UserHandler) List(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	users, err := h.users.List(r.Context(), actor)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load users")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"users": toUserDTOs(users)})
}

type createUserRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"fullName"`
	Role     string `json:"role"`
}

func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	var req createUserRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if len(req.Password) < 8 {
		response.Err(w, http.StatusBadRequest, "password must be at least 8 characters")
		return
	}

	user, err := h.users.Create(r.Context(), actor, req.Email, req.Password, req.FullName, domain.Role(req.Role))
	if err != nil {
		response.Err(w, userErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{"user": toUserDTO(user)})
}

type updateProfileRequest struct {
	Email    string `json:"email"`
	FullName string `json:"fullName"`
}

func (h *UserHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	id, err := pathID(r)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid user id")
		return
	}
	var req updateProfileRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.users.UpdateProfile(r.Context(), actor, id, req.Email, req.FullName); err != nil {
		response.Err(w, userErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

type setStatusRequest struct {
	Status string `json:"status"`
}

func (h *UserHandler) SetStatus(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	id, err := pathID(r)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid user id")
		return
	}
	var req setStatusRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	status := domain.Status(req.Status)
	if status != domain.StatusActive && status != domain.StatusDisabled && status != domain.StatusDeleted {
		response.Err(w, http.StatusBadRequest, "invalid status")
		return
	}
	if err := h.users.SetStatus(r.Context(), actor, id, status); err != nil {
		response.Err(w, userErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

type setCrownRequest struct {
	Enabled bool `json:"enabled"`
}

func (h *UserHandler) SetCrown(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	id, err := pathID(r)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid user id")
		return
	}
	var req setCrownRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.users.SetCanManageAdmins(r.Context(), actor, id, req.Enabled); err != nil {
		response.Err(w, userErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

type resetPasswordRequest struct {
	NewPassword string `json:"newPassword"`
}

func (h *UserHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	id, err := pathID(r)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid user id")
		return
	}
	var req resetPasswordRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if len(req.NewPassword) < 8 {
		response.Err(w, http.StatusBadRequest, "password must be at least 8 characters")
		return
	}
	if err := h.users.AdminResetPassword(r.Context(), actor, id, req.NewPassword); err != nil {
		response.Err(w, userErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *UserHandler) ResetOTP(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	id, err := pathID(r)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid user id")
		return
	}
	if err := h.users.ResetOTP(r.Context(), actor, id); err != nil {
		response.Err(w, userErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

type selfChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}

func (h *UserHandler) SelfChangePassword(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	var req selfChangePasswordRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if len(req.NewPassword) < 8 {
		response.Err(w, http.StatusBadRequest, "password must be at least 8 characters")
		return
	}
	if err := h.users.SelfChangePassword(r.Context(), actor, req.CurrentPassword, req.NewPassword); err != nil {
		response.Err(w, userErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *UserHandler) GetTwoFactorEnabled(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	enabled, err := h.users.GetTwoFactorEnabled(r.Context(), actor)
	if err != nil {
		response.Err(w, userErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"enabled": enabled})
}

type setTwoFactorRequest struct {
	Enabled bool `json:"enabled"`
}

func (h *UserHandler) SetTwoFactorEnabled(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())
	var req setTwoFactorRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.users.SetTwoFactorEnabled(r.Context(), actor, req.Enabled); err != nil {
		response.Err(w, userErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

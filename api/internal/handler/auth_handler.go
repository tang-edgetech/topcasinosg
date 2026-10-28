package handler

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/config"
	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/httpx"
	"github.com/tang-edgetech/topcasinosg/api/internal/middleware"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
	"github.com/tang-edgetech/topcasinosg/api/internal/security"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

type AuthHandler struct {
	auth  *service.AuthService
	audit *service.AuditService
	cfg   config.Config
}

func NewAuthHandler(auth *service.AuthService, audit *service.AuditService, cfg config.Config) *AuthHandler {
	return &AuthHandler{auth: auth, audit: audit, cfg: cfg}
}

func (h *AuthHandler) recordAuth(r *http.Request, action string, userID int64, login string) {
	ip, port := middleware.ClientAddress(r)
	h.audit.RecordAuth(context.WithoutCancel(r.Context()), service.AuthEvent{
		Action: action, UserID: userID, Login: login, IP: ip, Port: port,
		UserAgent: r.UserAgent(), Method: r.Method, Path: r.URL.Path,
	})
}

func (h *AuthHandler) recordSignedIn(r *http.Request, outcome *service.LoginOutcome) {
	if outcome.Status == "ok" && outcome.User != nil {
		h.recordAuth(r, domain.AuditActionLogin, outcome.User.ID, "")
	}
}

func authErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrInvalidCredentials), errors.Is(err, service.ErrInvalidOTP), errors.Is(err, security.ErrInvalidToken),
		errors.Is(err, service.ErrTwoFactorRequired):
		return http.StatusUnauthorized
	case errors.Is(err, service.ErrOTPNoPendingSetup), errors.Is(err, service.ErrOTPDeviceLimit):
		return http.StatusBadRequest
	case errors.Is(err, service.ErrAccountNotActive):
		return http.StatusForbidden
	case errors.Is(err, service.ErrAlreadyBootstapped):
		return http.StatusConflict
	default:
		return http.StatusInternalServerError
	}
}

func (h *AuthHandler) BootstrapStatus(w http.ResponseWriter, r *http.Request) {
	needsBootstrap, err := h.auth.NeedsBootstrap(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not check setup status")
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"needsBootstrap": needsBootstrap})
}

type bootstrapRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	FullName string `json:"fullName"`

	SiteURL   string `json:"siteUrl"`
	SiteTitle string `json:"siteTitle"`
	SEOIndex  bool   `json:"seoIndex"`
	SEOFollow bool   `json:"seoFollow"`
	Timezone  string `json:"timezone"`
	Language  string `json:"language"`
}

func (h *AuthHandler) Bootstrap(w http.ResponseWriter, r *http.Request) {
	var req bootstrapRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if len(req.Password) < 8 {
		response.Err(w, http.StatusBadRequest, "password must be at least 8 characters")
		return
	}

	if _, err := h.auth.Bootstrap(r.Context(), service.BootstrapInput{
		Email:    req.Email,
		Password: req.Password,
		FullName: req.FullName,

		SiteURL:   req.SiteURL,
		SiteTitle: req.SiteTitle,
		SEOIndex:  req.SEOIndex,
		SEOFollow: req.SEOFollow,
		Timezone:  req.Timezone,
		Language:  domain.Language(req.Language),
	}); err != nil {
		response.Err(w, authErrorStatus(err), err.Error())
		return
	}

	// Re-fetch via Login rather than reusing the just-created struct so the
	// response reflects DB-generated fields (created_at, etc.).
	outcome, err := h.auth.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		response.Err(w, authErrorStatus(err), err.Error())
		return
	}
	h.recordSignedIn(r, outcome)
	httpx.SetSessionCookies(w, h.cfg, outcome)
	response.JSON(w, http.StatusCreated, map[string]any{"user": toUserDTO(outcome.User)})
}

// Login is an email or a username.
type loginRequest struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}

	outcome, err := h.auth.Login(r.Context(), req.Login, req.Password)
	if err != nil {
		h.recordAuth(r, domain.AuditActionLoginFailed, 0, req.Login)
		response.Err(w, authErrorStatus(err), err.Error())
		return
	}
	h.recordSignedIn(r, outcome)
	h.respondOutcome(w, outcome)
}

type otpEphemeralRequest struct {
	EphemeralToken string `json:"ephemeralToken"`
	Code           string `json:"code"`
}

func (h *AuthHandler) VerifyOTP(w http.ResponseWriter, r *http.Request) {
	var req otpEphemeralRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	outcome, err := h.auth.VerifyOTP(r.Context(), req.EphemeralToken, req.Code)
	if err != nil {
		h.recordAuth(r, domain.AuditActionLoginFailed, h.auth.PendingUserID(req.EphemeralToken), "")
		response.Err(w, authErrorStatus(err), err.Error())
		return
	}
	h.recordSignedIn(r, outcome)
	h.respondOutcome(w, outcome)
}

type otpSetupRequest struct {
	EphemeralToken string `json:"ephemeralToken"`
}

func (h *AuthHandler) SetupOTP(w http.ResponseWriter, r *http.Request) {
	var req otpSetupRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	secret, otpauthURL, err := h.auth.SetupOTP(r.Context(), req.EphemeralToken)
	if err != nil {
		response.Err(w, authErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]string{"secret": secret, "otpauthUrl": otpauthURL})
}

func (h *AuthHandler) ConfirmOTPSetup(w http.ResponseWriter, r *http.Request) {
	var req otpEphemeralRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	outcome, err := h.auth.ConfirmOTPSetup(r.Context(), req.EphemeralToken, req.Code)
	if err != nil {
		h.recordAuth(r, domain.AuditActionLoginFailed, h.auth.PendingUserID(req.EphemeralToken), "")
		response.Err(w, authErrorStatus(err), err.Error())
		return
	}
	h.recordSignedIn(r, outcome)
	h.respondOutcome(w, outcome)
}

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(h.cfg.CookieName(httpx.RefreshCookieName))
	if err != nil {
		response.Err(w, http.StatusUnauthorized, "not authenticated")
		return
	}
	outcome, err := h.auth.Refresh(r.Context(), cookie.Value)
	if err != nil {
		httpx.ClearSessionCookies(w, h.cfg)
		response.Err(w, authErrorStatus(err), err.Error())
		return
	}
	h.respondOutcome(w, outcome)
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	if cookie, err := r.Cookie(h.cfg.CookieName(httpx.RefreshCookieName)); err == nil {
		if userID, _ := h.auth.Logout(r.Context(), cookie.Value); userID > 0 {
			h.recordAuth(r, domain.AuditActionLogout, userID, "")
		}
	}
	httpx.ClearSessionCookies(w, h.cfg)
	response.JSON(w, http.StatusOK, map[string]bool{"loggedOut": true})
}

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	response.JSON(w, http.StatusOK, map[string]any{"user": toUserDTO(user)})
}

// respondOutcome sends either the completed session (cookies set) or the
// intermediate OTP step the frontend must render next.
func (h *AuthHandler) respondOutcome(w http.ResponseWriter, outcome *service.LoginOutcome) {
	if outcome.Status == "ok" {
		httpx.SetSessionCookies(w, h.cfg, outcome)
		response.JSON(w, http.StatusOK, map[string]any{"status": outcome.Status, "user": toUserDTO(outcome.User)})
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"status": outcome.Status, "ephemeralToken": outcome.EphemeralToken})
}

// OTPDeviceDTO is one of the signed-in user's authenticator apps. The secret
// never leaves the API after setup.
type OTPDeviceDTO struct {
	ID          int64      `json:"id"`
	Name        string     `json:"name"`
	ConfirmedAt *time.Time `json:"confirmedAt"`
	LastUsedAt  *time.Time `json:"lastUsedAt"`
}

// otpDeviceErrorStatus maps My Account 2FA errors. A wrong password or code
// is a 400 here, not a 401: the session is fine, and a 401 would make the
// admin app try to refresh it first.
func otpDeviceErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrWrongCurrentPassword), errors.Is(err, service.ErrInvalidOTP),
		errors.Is(err, service.ErrOTPDeviceLimit), errors.Is(err, service.ErrOTPLastDevice),
		errors.Is(err, service.ErrOTPNoPendingSetup), errors.Is(err, service.ErrOTPDeviceName):
		return http.StatusBadRequest
	case errors.Is(err, service.ErrOTPDeviceNotFound):
		return http.StatusNotFound
	default:
		return http.StatusInternalServerError
	}
}

func (h *AuthHandler) ListOTPDevices(w http.ResponseWriter, r *http.Request) {
	user := middleware.UserFromContext(r.Context())
	devices, err := h.auth.ListOTPDevices(r.Context(), user)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load authenticator apps")
		return
	}
	required, err := h.auth.TwoFactorRequired(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load authenticator apps")
		return
	}
	dtos := make([]OTPDeviceDTO, len(devices))
	for i, d := range devices {
		dtos[i] = OTPDeviceDTO{ID: d.ID, Name: d.Name, ConfirmedAt: d.ConfirmedAt, LastUsedAt: d.LastUsedAt}
	}
	response.JSON(w, http.StatusOK, map[string]any{"devices": dtos, "maxDevices": domain.MaxOTPDevices, "required": required})
}

type otpDeviceSetupRequest struct {
	Name     string `json:"name"`
	Password string `json:"password"`
}

func (h *AuthHandler) StartOTPDeviceSetup(w http.ResponseWriter, r *http.Request) {
	var req otpDeviceSetupRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	secret, otpauthURL, err := h.auth.StartOTPDeviceSetup(r.Context(), middleware.UserFromContext(r.Context()), req.Name, req.Password)
	if err != nil {
		response.Err(w, otpDeviceErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]string{"secret": secret, "otpauthUrl": otpauthURL})
}

type otpDeviceConfirmRequest struct {
	Code string `json:"code"`
}

func (h *AuthHandler) ConfirmOTPDeviceSetup(w http.ResponseWriter, r *http.Request) {
	var req otpDeviceConfirmRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.auth.ConfirmOTPDeviceSetup(r.Context(), middleware.UserFromContext(r.Context()), req.Code); err != nil {
		response.Err(w, otpDeviceErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"confirmed": true})
}

type otpDeviceRemoveRequest struct {
	Password string `json:"password"`
}

func (h *AuthHandler) RemoveOTPDevice(w http.ResponseWriter, r *http.Request) {
	id, err := pathID(r)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid id")
		return
	}
	var req otpDeviceRemoveRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.auth.RemoveOTPDevice(r.Context(), middleware.UserFromContext(r.Context()), id, req.Password); err != nil {
		response.Err(w, otpDeviceErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"removed": true})
}

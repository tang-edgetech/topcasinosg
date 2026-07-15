// Package server wires routes to handlers. Route groups (public site, admin,
// shared) will be added here as each feature lands.
package server

import (
	"net/http"

	"github.com/tang-edgetech/topcasinosg/api/internal/config"
	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/handler"
	"github.com/tang-edgetech/topcasinosg/api/internal/middleware"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
	"github.com/tang-edgetech/topcasinosg/api/internal/security"
)

type Deps struct {
	Config      config.Config
	JWT         *security.JWTIssuer
	Users       *repository.UserRepo
	AuthHandler *handler.AuthHandler
	UserHandler *handler.UserHandler
}

func NewRouter(deps Deps) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", handler.Health)

	// Auth — public.
	mux.HandleFunc("GET /api/admin/auth/bootstrap-status", deps.AuthHandler.BootstrapStatus)
	mux.HandleFunc("POST /api/admin/auth/bootstrap", deps.AuthHandler.Bootstrap)
	mux.HandleFunc("POST /api/admin/auth/login", deps.AuthHandler.Login)
	mux.HandleFunc("POST /api/admin/auth/otp/verify", deps.AuthHandler.VerifyOTP)
	mux.HandleFunc("POST /api/admin/auth/otp/setup", deps.AuthHandler.SetupOTP)
	mux.HandleFunc("POST /api/admin/auth/otp/confirm", deps.AuthHandler.ConfirmOTPSetup)
	mux.HandleFunc("POST /api/admin/auth/refresh", deps.AuthHandler.Refresh)
	mux.HandleFunc("POST /api/admin/auth/logout", deps.AuthHandler.Logout)

	authenticate := middleware.Authenticate(deps.JWT, deps.Users)
	staffOnly := middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin)

	mux.Handle("GET /api/admin/auth/me", authenticate(http.HandlerFunc(deps.AuthHandler.Me)))

	// Account — any authenticated admin user, self-service only.
	mux.Handle("POST /api/admin/account/password", authenticate(http.HandlerFunc(deps.UserHandler.SelfChangePassword)))

	// Users — Super Admin and Admin only; Editors have no access at all.
	mux.Handle("GET /api/admin/users", authenticate(staffOnly(http.HandlerFunc(deps.UserHandler.List))))
	mux.Handle("POST /api/admin/users", authenticate(staffOnly(http.HandlerFunc(deps.UserHandler.Create))))
	mux.Handle("PUT /api/admin/users/{id}", authenticate(staffOnly(http.HandlerFunc(deps.UserHandler.UpdateProfile))))
	mux.Handle("PUT /api/admin/users/{id}/status", authenticate(staffOnly(http.HandlerFunc(deps.UserHandler.SetStatus))))
	mux.Handle("PUT /api/admin/users/{id}/crown", authenticate(staffOnly(http.HandlerFunc(deps.UserHandler.SetCrown))))
	mux.Handle("POST /api/admin/users/{id}/reset-password", authenticate(staffOnly(http.HandlerFunc(deps.UserHandler.ResetPassword))))
	mux.Handle("POST /api/admin/users/{id}/reset-otp", authenticate(staffOnly(http.HandlerFunc(deps.UserHandler.ResetOTP))))

	// Settings — Super Admin only (enforced again inside the service).
	mux.Handle("GET /api/admin/settings/2fa", authenticate(staffOnly(http.HandlerFunc(deps.UserHandler.GetTwoFactorEnabled))))
	mux.Handle("PUT /api/admin/settings/2fa", authenticate(staffOnly(http.HandlerFunc(deps.UserHandler.SetTwoFactorEnabled))))

	return middleware.CORS(deps.Config.CORSAllowedOrigin)(mux)
}

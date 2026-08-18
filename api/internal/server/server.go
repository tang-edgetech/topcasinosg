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
	Config                config.Config
	JWT                   *security.JWTIssuer
	Users                 *repository.UserRepo
	AuthHandler           *handler.AuthHandler
	UserHandler           *handler.UserHandler
	SiteSettingsHandler   *handler.SiteSettingsHandler
	MediaHandler          *handler.MediaHandler
	RegionHandler         *handler.RegionHandler
	GameProviderHandler   *handler.GameProviderHandler
	LicenseHandler        *handler.LicenseHandler
	CasinoHandler         *handler.CasinoHandler
	BonusHandler          *handler.BonusHandler
	PaymentMethodHandler  *handler.PaymentMethodHandler
	RTPEntryHandler       *handler.RTPEntryHandler
	GuideHandler          *handler.GuideHandler
	BlacklistEntryHandler *handler.BlacklistEntryHandler
	NewsArticleHandler    *handler.NewsArticleHandler
	MenuItemHandler       *handler.MenuItemHandler
	PageHandler           *handler.PageHandler
	SnippetHandler        *handler.SnippetHandler
	SidebarHandler        *handler.SidebarHandler
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

	// Site settings — readable by anyone (login page needs the title/logo
	// before authentication exists).
	mux.HandleFunc("GET /api/admin/settings/site", deps.SiteSettingsHandler.Get)

	// Static file serving for uploaded logo/favicon.
	mux.Handle("GET /uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir(deps.Config.UploadDir))))

	// Public content reads — no auth. This is what web/ consumes.
	mux.HandleFunc("GET /api/regions", deps.RegionHandler.ListPublic)
	mux.HandleFunc("GET /api/game-providers", deps.GameProviderHandler.List)
	mux.HandleFunc("GET /api/licenses", deps.LicenseHandler.List)
	mux.HandleFunc("GET /api/sidebar", deps.SidebarHandler.Get)
	mux.HandleFunc("GET /api/casinos", deps.CasinoHandler.ListPublic)
	mux.HandleFunc("GET /api/casinos/{slug}", deps.CasinoHandler.GetPublic)
	mux.HandleFunc("GET /api/bonuses", deps.BonusHandler.ListPublic)
	mux.HandleFunc("GET /api/payment-methods", deps.PaymentMethodHandler.ListPublic)
	mux.HandleFunc("GET /api/rtp", deps.RTPEntryHandler.ListPublic)
	mux.HandleFunc("GET /api/guides", deps.GuideHandler.ListPublic)
	mux.HandleFunc("GET /api/guides/{slug}", deps.GuideHandler.GetPublic)
	mux.HandleFunc("GET /api/blacklist", deps.BlacklistEntryHandler.ListPublic)
	mux.HandleFunc("GET /api/news", deps.NewsArticleHandler.ListPublic)
	mux.HandleFunc("GET /api/news/{slug}", deps.NewsArticleHandler.GetPublic)
	mux.HandleFunc("GET /api/menus", deps.MenuItemHandler.ListPublic)
	mux.HandleFunc("GET /api/pages/{slug}", deps.PageHandler.GetPublic)
	mux.HandleFunc("GET /api/snippets", deps.SnippetHandler.GetPublic)

	authenticate := middleware.Authenticate(deps.JWT, deps.Users)
	staffOnly := middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin)
	superAdminOnly := middleware.RequireRoles(domain.RoleSuperAdmin)
	// Content-management roles: Editors manage content (including media),
	// just not other admin accounts — see internal/domain/user.go.
	contentStaff := middleware.RequireRoles(domain.RoleSuperAdmin, domain.RoleAdmin, domain.RoleEditor)

	mux.Handle("GET /api/admin/auth/me", authenticate(http.HandlerFunc(deps.AuthHandler.Me)))

	// Account — any authenticated admin user, self-service only.
	mux.Handle("POST /api/admin/account/password", authenticate(http.HandlerFunc(deps.UserHandler.SelfChangePassword)))
	mux.Handle("PUT /api/admin/account/theme", authenticate(http.HandlerFunc(deps.UserHandler.SetTheme)))

	// Users — Super Admin and Admin only; Editors have no access at all.
	mux.Handle("GET /api/admin/users", authenticate(staffOnly(http.HandlerFunc(deps.UserHandler.List))))
	mux.Handle("POST /api/admin/users", authenticate(staffOnly(http.HandlerFunc(deps.UserHandler.Create))))
	mux.Handle("PUT /api/admin/users/{id}", authenticate(staffOnly(http.HandlerFunc(deps.UserHandler.UpdateProfile))))
	mux.Handle("PUT /api/admin/users/{id}/status", authenticate(staffOnly(http.HandlerFunc(deps.UserHandler.SetStatus))))
	mux.Handle("PUT /api/admin/users/{id}/crown", authenticate(staffOnly(http.HandlerFunc(deps.UserHandler.SetCrown))))
	mux.Handle("POST /api/admin/users/{id}/reset-password", authenticate(staffOnly(http.HandlerFunc(deps.UserHandler.ResetPassword))))
	mux.Handle("POST /api/admin/users/{id}/reset-otp", authenticate(staffOnly(http.HandlerFunc(deps.UserHandler.ResetOTP))))

	// Site settings — Super Admin only.
	mux.Handle("PUT /api/admin/settings/site", authenticate(superAdminOnly(http.HandlerFunc(deps.SiteSettingsHandler.Update))))
	mux.Handle("PUT /api/admin/settings/2fa", authenticate(superAdminOnly(http.HandlerFunc(deps.SiteSettingsHandler.SetTwoFactorEnabled))))
	mux.Handle("POST /api/admin/settings/site/logo", authenticate(superAdminOnly(http.HandlerFunc(deps.SiteSettingsHandler.UploadLogo))))
	mux.Handle("POST /api/admin/settings/site/favicon", authenticate(superAdminOnly(http.HandlerFunc(deps.SiteSettingsHandler.UploadFavicon))))
	mux.Handle("PUT /api/admin/settings/site/logo", authenticate(superAdminOnly(http.HandlerFunc(deps.SiteSettingsHandler.SetLogo))))
	mux.Handle("PUT /api/admin/settings/site/favicon", authenticate(superAdminOnly(http.HandlerFunc(deps.SiteSettingsHandler.SetFavicon))))

	// Snippets — Super Admin only. Raw HTML/JS injected into every page;
	// same trust tier as Settings, not a content-editing capability.
	mux.Handle("GET /api/admin/snippets", authenticate(superAdminOnly(http.HandlerFunc(deps.SnippetHandler.List))))
	mux.Handle("POST /api/admin/snippets", authenticate(superAdminOnly(http.HandlerFunc(deps.SnippetHandler.Create))))
	mux.Handle("PUT /api/admin/snippets/{id}", authenticate(superAdminOnly(http.HandlerFunc(deps.SnippetHandler.Update))))
	mux.Handle("PUT /api/admin/snippets/{id}/active", authenticate(superAdminOnly(http.HandlerFunc(deps.SnippetHandler.SetActive))))
	mux.Handle("DELETE /api/admin/snippets/{id}", authenticate(superAdminOnly(http.HandlerFunc(deps.SnippetHandler.Delete))))

	// Media library — any content-management role.
	mux.Handle("GET /api/admin/media", authenticate(contentStaff(http.HandlerFunc(deps.MediaHandler.List))))
	mux.Handle("POST /api/admin/media", authenticate(contentStaff(http.HandlerFunc(deps.MediaHandler.Upload))))
	mux.Handle("PUT /api/admin/media/{id}", authenticate(contentStaff(http.HandlerFunc(deps.MediaHandler.UpdateMetadata))))
	mux.Handle("DELETE /api/admin/media/{id}", authenticate(contentStaff(http.HandlerFunc(deps.MediaHandler.Delete))))

	// Regions — readable by any content-staff (Editors pick a region when
	// adding a Bonus/Guide/etc.); structural changes gated inside the
	// service to Super Admin + Admin only.
	mux.Handle("GET /api/admin/regions", authenticate(contentStaff(http.HandlerFunc(deps.RegionHandler.List))))
	mux.Handle("POST /api/admin/regions", authenticate(contentStaff(http.HandlerFunc(deps.RegionHandler.Create))))
	mux.Handle("PUT /api/admin/regions/{id}", authenticate(contentStaff(http.HandlerFunc(deps.RegionHandler.Update))))
	mux.Handle("PUT /api/admin/regions/{id}/active", authenticate(contentStaff(http.HandlerFunc(deps.RegionHandler.SetActive))))

	// Game Providers — readable by any content-staff (Editors pick providers
	// when editing a Casino); create/edit/delete restricted to Super
	// Admin/Admin inside GameProviderService itself, same two-layer pattern
	// as Regions above.
	mux.Handle("GET /api/admin/game-providers", authenticate(contentStaff(http.HandlerFunc(deps.GameProviderHandler.List))))
	mux.Handle("POST /api/admin/game-providers", authenticate(contentStaff(http.HandlerFunc(deps.GameProviderHandler.Create))))
	mux.Handle("PUT /api/admin/game-providers/{id}", authenticate(contentStaff(http.HandlerFunc(deps.GameProviderHandler.Update))))
	mux.Handle("DELETE /api/admin/game-providers/{id}", authenticate(contentStaff(http.HandlerFunc(deps.GameProviderHandler.Delete))))

	// Licenses — same two-layer access pattern as Game Providers above.
	mux.Handle("GET /api/admin/licenses", authenticate(contentStaff(http.HandlerFunc(deps.LicenseHandler.List))))
	mux.Handle("POST /api/admin/licenses", authenticate(contentStaff(http.HandlerFunc(deps.LicenseHandler.Create))))
	mux.Handle("PUT /api/admin/licenses/{id}", authenticate(contentStaff(http.HandlerFunc(deps.LicenseHandler.Update))))
	mux.Handle("DELETE /api/admin/licenses/{id}", authenticate(contentStaff(http.HandlerFunc(deps.LicenseHandler.Delete))))

	// Sidebar — the 3 sections are fixed (never created/deleted), so there's
	// just a read + one bulk-replace endpoint, not full CRUD.
	mux.Handle("GET /api/admin/sidebar", authenticate(contentStaff(http.HandlerFunc(deps.SidebarHandler.Get))))
	mux.Handle("PUT /api/admin/sidebar", authenticate(contentStaff(http.HandlerFunc(deps.SidebarHandler.Replace))))

	// Navigation (header mega-menu + footer) — Super Admin and Admin only,
	// same tier as Regions/Site Settings; Editors have no access at all.
	mux.Handle("GET /api/admin/menu-items", authenticate(staffOnly(http.HandlerFunc(deps.MenuItemHandler.List))))
	mux.Handle("POST /api/admin/menu-items", authenticate(staffOnly(http.HandlerFunc(deps.MenuItemHandler.Create))))
	mux.Handle("PUT /api/admin/menu-items/{id}", authenticate(staffOnly(http.HandlerFunc(deps.MenuItemHandler.Update))))
	mux.Handle("DELETE /api/admin/menu-items/{id}", authenticate(staffOnly(http.HandlerFunc(deps.MenuItemHandler.Delete))))

	// Casinos — any content-management role, matching "Editor: add/edit/
	// delete contents".
	mux.Handle("GET /api/admin/casinos", authenticate(contentStaff(http.HandlerFunc(deps.CasinoHandler.List))))
	mux.Handle("POST /api/admin/casinos", authenticate(contentStaff(http.HandlerFunc(deps.CasinoHandler.Create))))
	mux.Handle("GET /api/admin/casinos/{id}", authenticate(contentStaff(http.HandlerFunc(deps.CasinoHandler.Get))))
	mux.Handle("PUT /api/admin/casinos/{id}", authenticate(contentStaff(http.HandlerFunc(deps.CasinoHandler.Update))))
	mux.Handle("PUT /api/admin/casinos/{id}/status", authenticate(contentStaff(http.HandlerFunc(deps.CasinoHandler.SetStatus))))
	mux.Handle("DELETE /api/admin/casinos/{id}", authenticate(contentStaff(http.HandlerFunc(deps.CasinoHandler.Delete))))

	// Bonuses.
	mux.Handle("GET /api/admin/bonuses", authenticate(contentStaff(http.HandlerFunc(deps.BonusHandler.List))))
	mux.Handle("POST /api/admin/bonuses", authenticate(contentStaff(http.HandlerFunc(deps.BonusHandler.Create))))
	mux.Handle("GET /api/admin/bonuses/{id}", authenticate(contentStaff(http.HandlerFunc(deps.BonusHandler.Get))))
	mux.Handle("PUT /api/admin/bonuses/{id}", authenticate(contentStaff(http.HandlerFunc(deps.BonusHandler.Update))))
	mux.Handle("PUT /api/admin/bonuses/{id}/status", authenticate(contentStaff(http.HandlerFunc(deps.BonusHandler.SetStatus))))
	mux.Handle("DELETE /api/admin/bonuses/{id}", authenticate(contentStaff(http.HandlerFunc(deps.BonusHandler.Delete))))

	// Payment Methods.
	mux.Handle("GET /api/admin/payment-methods", authenticate(contentStaff(http.HandlerFunc(deps.PaymentMethodHandler.List))))
	mux.Handle("POST /api/admin/payment-methods", authenticate(contentStaff(http.HandlerFunc(deps.PaymentMethodHandler.Create))))
	mux.Handle("GET /api/admin/payment-methods/{id}", authenticate(contentStaff(http.HandlerFunc(deps.PaymentMethodHandler.Get))))
	mux.Handle("PUT /api/admin/payment-methods/{id}", authenticate(contentStaff(http.HandlerFunc(deps.PaymentMethodHandler.Update))))
	mux.Handle("PUT /api/admin/payment-methods/{id}/status", authenticate(contentStaff(http.HandlerFunc(deps.PaymentMethodHandler.SetStatus))))
	mux.Handle("DELETE /api/admin/payment-methods/{id}", authenticate(contentStaff(http.HandlerFunc(deps.PaymentMethodHandler.Delete))))

	// RTP entries.
	mux.Handle("GET /api/admin/rtp", authenticate(contentStaff(http.HandlerFunc(deps.RTPEntryHandler.List))))
	mux.Handle("POST /api/admin/rtp", authenticate(contentStaff(http.HandlerFunc(deps.RTPEntryHandler.Create))))
	mux.Handle("GET /api/admin/rtp/{id}", authenticate(contentStaff(http.HandlerFunc(deps.RTPEntryHandler.Get))))
	mux.Handle("PUT /api/admin/rtp/{id}", authenticate(contentStaff(http.HandlerFunc(deps.RTPEntryHandler.Update))))
	mux.Handle("PUT /api/admin/rtp/{id}/status", authenticate(contentStaff(http.HandlerFunc(deps.RTPEntryHandler.SetStatus))))
	mux.Handle("DELETE /api/admin/rtp/{id}", authenticate(contentStaff(http.HandlerFunc(deps.RTPEntryHandler.Delete))))

	// Pages (flexible page builder — Homepage, About, ...) — any
	// content-management role, same tier as Casinos/Guides/News.
	mux.Handle("GET /api/admin/pages", authenticate(contentStaff(http.HandlerFunc(deps.PageHandler.List))))
	mux.Handle("POST /api/admin/pages", authenticate(contentStaff(http.HandlerFunc(deps.PageHandler.Create))))
	mux.Handle("GET /api/admin/pages/{id}", authenticate(contentStaff(http.HandlerFunc(deps.PageHandler.Get))))
	mux.Handle("PUT /api/admin/pages/{id}", authenticate(contentStaff(http.HandlerFunc(deps.PageHandler.Update))))
	mux.Handle("PUT /api/admin/pages/{id}/seo", authenticate(contentStaff(http.HandlerFunc(deps.PageHandler.UpdateSEO))))
	mux.Handle("PUT /api/admin/pages/{id}/snippets", authenticate(superAdminOnly(http.HandlerFunc(deps.PageHandler.UpdateSnippets))))
	mux.Handle("PUT /api/admin/pages/{id}/status", authenticate(contentStaff(http.HandlerFunc(deps.PageHandler.SetStatus))))
	mux.Handle("PUT /api/admin/pages/{id}/sections", authenticate(contentStaff(http.HandlerFunc(deps.PageHandler.ReplaceSections))))
	mux.Handle("DELETE /api/admin/pages/{id}", authenticate(contentStaff(http.HandlerFunc(deps.PageHandler.Delete))))

	// Guides.
	mux.Handle("GET /api/admin/guides", authenticate(contentStaff(http.HandlerFunc(deps.GuideHandler.List))))
	mux.Handle("POST /api/admin/guides", authenticate(contentStaff(http.HandlerFunc(deps.GuideHandler.Create))))
	mux.Handle("GET /api/admin/guides/{id}", authenticate(contentStaff(http.HandlerFunc(deps.GuideHandler.Get))))
	mux.Handle("PUT /api/admin/guides/{id}", authenticate(contentStaff(http.HandlerFunc(deps.GuideHandler.Update))))
	mux.Handle("PUT /api/admin/guides/{id}/status", authenticate(contentStaff(http.HandlerFunc(deps.GuideHandler.SetStatus))))
	mux.Handle("DELETE /api/admin/guides/{id}", authenticate(contentStaff(http.HandlerFunc(deps.GuideHandler.Delete))))

	// Blacklist entries.
	mux.Handle("GET /api/admin/blacklist", authenticate(contentStaff(http.HandlerFunc(deps.BlacklistEntryHandler.List))))
	mux.Handle("POST /api/admin/blacklist", authenticate(contentStaff(http.HandlerFunc(deps.BlacklistEntryHandler.Create))))
	mux.Handle("GET /api/admin/blacklist/{id}", authenticate(contentStaff(http.HandlerFunc(deps.BlacklistEntryHandler.Get))))
	mux.Handle("PUT /api/admin/blacklist/{id}", authenticate(contentStaff(http.HandlerFunc(deps.BlacklistEntryHandler.Update))))
	mux.Handle("PUT /api/admin/blacklist/{id}/status", authenticate(contentStaff(http.HandlerFunc(deps.BlacklistEntryHandler.SetStatus))))
	mux.Handle("DELETE /api/admin/blacklist/{id}", authenticate(contentStaff(http.HandlerFunc(deps.BlacklistEntryHandler.Delete))))

	// News — any content-management role, matching "Editor: add/edit/delete contents".
	mux.Handle("GET /api/admin/news", authenticate(contentStaff(http.HandlerFunc(deps.NewsArticleHandler.List))))
	mux.Handle("POST /api/admin/news", authenticate(contentStaff(http.HandlerFunc(deps.NewsArticleHandler.Create))))
	mux.Handle("GET /api/admin/news/{id}", authenticate(contentStaff(http.HandlerFunc(deps.NewsArticleHandler.Get))))
	mux.Handle("PUT /api/admin/news/{id}", authenticate(contentStaff(http.HandlerFunc(deps.NewsArticleHandler.Update))))
	mux.Handle("PUT /api/admin/news/{id}/status", authenticate(contentStaff(http.HandlerFunc(deps.NewsArticleHandler.SetStatus))))
	mux.Handle("DELETE /api/admin/news/{id}", authenticate(contentStaff(http.HandlerFunc(deps.NewsArticleHandler.Delete))))

	return middleware.CORS(deps.Config.CORSAllowedOrigins)(mux)
}

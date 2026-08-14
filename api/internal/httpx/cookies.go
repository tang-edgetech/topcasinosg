package httpx

import (
	"net/http"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/config"
	"github.com/tang-edgetech/topcasinosg/api/internal/security"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

const (
	AccessCookieName  = "access_token"
	RefreshCookieName = "refresh_token"
	// HasSessionCookieName carries no secret — it's a plain readable flag so
	// the frontend can tell "no session" from "session, but expired" without
	// probing /api/admin/auth/me first. That probe would otherwise 401 on
	// every anonymous page load, which is correct REST behavior but noisy.
	HasSessionCookieName = "has_session"
)

// SetSessionCookies writes both auth cookies for a successful login/refresh.
// Secure is tied to environment, not request scheme, since the product
// decision is: production is HTTPS, localhost never sets Secure.
func SetSessionCookies(w http.ResponseWriter, cfg config.Config, outcome *service.LoginOutcome) {
	setCookie(w, cfg, AccessCookieName, outcome.AccessToken, security.AccessTokenTTL)
	setCookie(w, cfg, RefreshCookieName, outcome.RefreshToken, service.RefreshTokenTTL)
	setMarkerCookie(w, cfg, HasSessionCookieName, service.RefreshTokenTTL)
}

func ClearSessionCookies(w http.ResponseWriter, cfg config.Config) {
	deleteCookie(w, cfg, AccessCookieName)
	deleteCookie(w, cfg, RefreshCookieName)
	deleteCookie(w, cfg, HasSessionCookieName)
}

func setCookie(w http.ResponseWriter, cfg config.Config, name, value string, ttl time.Duration) {
	http.SetCookie(w, &http.Cookie{
		Name:     name,
		Value:    value,
		Path:     "/",
		Domain:   cfg.CookieDomain,
		MaxAge:   int(ttl.Seconds()),
		HttpOnly: true,
		Secure:   cfg.IsProduction(),
		SameSite: http.SameSiteStrictMode,
	})
}

func setMarkerCookie(w http.ResponseWriter, cfg config.Config, name string, ttl time.Duration) {
	http.SetCookie(w, &http.Cookie{
		Name:     name,
		Value:    "1",
		Path:     "/",
		Domain:   cfg.CookieDomain,
		MaxAge:   int(ttl.Seconds()),
		HttpOnly: false,
		Secure:   cfg.IsProduction(),
		SameSite: http.SameSiteStrictMode,
	})
}

func deleteCookie(w http.ResponseWriter, cfg config.Config, name string) {
	http.SetCookie(w, &http.Cookie{
		Name:     name,
		Value:    "",
		Path:     "/",
		Domain:   cfg.CookieDomain,
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   cfg.IsProduction(),
		SameSite: http.SameSiteStrictMode,
	})
}

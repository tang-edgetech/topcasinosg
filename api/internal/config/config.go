// Package config loads runtime configuration from environment variables.
package config

import (
	"os"
	"strings"
)

type Config struct {
	Port string
	Env  string

	DBDsn string

	// JWTSecret signs access tokens and the short-lived MFA/OTP-setup tokens.
	JWTSecret string
	// OTPEncryptionKey encrypts TOTP secrets at rest (32 bytes, AES-256-GCM).
	OTPEncryptionKey string

	// CORSAllowedOrigins lists every frontend origin allowed to call this API
	// with credentials (admin dashboard + public site, each on their own
	// scheme+host+port). A wildcard can't be combined with credentialed
	// requests, so this must stay an explicit allow-list, not "*".
	CORSAllowedOrigins []string
	// CookieDomain is left empty on localhost (host-only cookie) and set to
	// ".topcasinosg.com.sg" in production so the cookie is shared between the
	// admin and api subdomains.
	CookieDomain string
	// CookiePrefix keeps sessions apart when two environments share a cookie
	// domain (staging and live both on .topcasinosg.com.sg): e.g. "stg_".
	// The admin app must be built with the same NEXT_PUBLIC_COOKIE_PREFIX.
	CookiePrefix string

	// UploadDir stores logo/favicon uploads, served back at /uploads/.
	UploadDir string
}

func Load() Config {
	env := getEnv("APP_ENV", "development")

	return Config{
		Port:  getEnv("PORT", "8090"),
		Env:   env,
		DBDsn: getEnv("DB_DSN", "root:@tcp(127.0.0.1:3306)/topcasinosg?parseTime=true&multiStatements=true&charset=utf8mb4"),

		JWTSecret:        getEnv("JWT_SECRET", "dev-only-insecure-secret-change-me"),
		OTPEncryptionKey: getEnv("OTP_ENCRYPTION_KEY", "dev-only-insecure-32-byte-key!!!"),

		CORSAllowedOrigins: splitCSV(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:4000,http://localhost:4001")),
		CookieDomain:       getEnv("COOKIE_DOMAIN", ""),
		CookiePrefix:       getEnv("COOKIE_PREFIX", ""),

		UploadDir: getEnv("UPLOAD_DIR", "uploads"),
	}
}

func splitCSV(v string) []string {
	parts := strings.Split(v, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return out
}

// IsProduction gates behavior that must never run on localhost: the Secure
// cookie flag, and — per product decision — 2FA enforcement itself.
func (c Config) IsProduction() bool {
	return c.Env == "production"
}

func (c Config) CookieName(base string) string {
	return c.CookiePrefix + base
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

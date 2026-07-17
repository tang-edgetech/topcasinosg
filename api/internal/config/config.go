// Package config loads runtime configuration from environment variables.
package config

import "os"

type Config struct {
	Port string
	Env  string

	DBDsn string

	// JWTSecret signs access tokens and the short-lived MFA/OTP-setup tokens.
	JWTSecret string
	// OTPEncryptionKey encrypts TOTP secrets at rest (32 bytes, AES-256-GCM).
	OTPEncryptionKey string

	CORSAllowedOrigin string
	// CookieDomain is left empty on localhost (host-only cookie) and set to
	// ".topcasinosg.com.sg" in production so the cookie is shared between the
	// admin and api subdomains.
	CookieDomain string

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

		CORSAllowedOrigin: getEnv("CORS_ALLOWED_ORIGIN", "http://localhost:4001"),
		CookieDomain:      getEnv("COOKIE_DOMAIN", ""),

		UploadDir: getEnv("UPLOAD_DIR", "uploads"),
	}
}

// IsProduction gates behavior that must never run on localhost: the Secure
// cookie flag, and — per product decision — 2FA enforcement itself.
func (c Config) IsProduction() bool {
	return c.Env == "production"
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

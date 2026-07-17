package main

import (
	"log"
	"net/http"

	"github.com/tang-edgetech/topcasinosg/api/internal/config"
	"github.com/tang-edgetech/topcasinosg/api/internal/db"
	"github.com/tang-edgetech/topcasinosg/api/internal/handler"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
	"github.com/tang-edgetech/topcasinosg/api/internal/security"
	"github.com/tang-edgetech/topcasinosg/api/internal/server"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

func main() {
	cfg := config.Load()

	conn, err := db.Open(cfg.DBDsn)
	if err != nil {
		log.Fatalf("db: %v", err)
	}
	defer conn.Close()

	if err := db.Migrate(conn); err != nil {
		log.Fatalf("db migrate: %v", err)
	}

	users := repository.NewUserRepo(conn)
	siteSettings := repository.NewSiteSettingsRepo(conn)
	refreshTokens := repository.NewRefreshTokenRepo(conn)

	jwtIssuer := security.NewJWTIssuer(cfg.JWTSecret)
	secretbox, err := security.NewSecretbox(cfg.OTPEncryptionKey)
	if err != nil {
		log.Fatalf("secretbox: %v", err)
	}

	authService := service.NewAuthService(users, siteSettings, refreshTokens, jwtIssuer, secretbox, cfg)
	userService := service.NewUserService(users, refreshTokens)
	siteSettingsService := service.NewSiteSettingsService(siteSettings)

	deps := server.Deps{
		Config:              cfg,
		JWT:                 jwtIssuer,
		Users:               users,
		AuthHandler:         handler.NewAuthHandler(authService, cfg),
		UserHandler:         handler.NewUserHandler(userService),
		SiteSettingsHandler: handler.NewSiteSettingsHandler(siteSettingsService, cfg),
	}
	router := server.NewRouter(deps)

	log.Printf("topcasinosg-api listening on :%s (env=%s)", cfg.Port, cfg.Env)
	if err := http.ListenAndServe(":"+cfg.Port, router); err != nil {
		log.Fatal(err)
	}
}

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
	"github.com/tang-edgetech/topcasinosg/api/internal/storage"
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
	mediaRepo := repository.NewMediaRepo(conn)
	regionRepo := repository.NewRegionRepo(conn)
	casinoRepo := repository.NewCasinoRepo(conn)
	bonusRepo := repository.NewBonusRepo(conn)
	paymentMethodRepo := repository.NewPaymentMethodRepo(conn)
	rtpEntryRepo := repository.NewRTPEntryRepo(conn)
	guideRepo := repository.NewGuideRepo(conn)
	blacklistEntryRepo := repository.NewBlacklistEntryRepo(conn)
	newsArticleRepo := repository.NewNewsArticleRepo(conn)
	menuItemRepo := repository.NewMenuItemRepo(conn)
	pageRepo := repository.NewPageRepo(conn)
	snippetRepo := repository.NewSnippetRepo(conn)

	jwtIssuer := security.NewJWTIssuer(cfg.JWTSecret)
	secretbox, err := security.NewSecretbox(cfg.OTPEncryptionKey)
	if err != nil {
		log.Fatalf("secretbox: %v", err)
	}
	fileStorage := storage.NewLocalStorage(cfg.UploadDir)

	authService := service.NewAuthService(users, siteSettings, refreshTokens, jwtIssuer, secretbox, cfg)
	userService := service.NewUserService(users, refreshTokens)
	siteSettingsService := service.NewSiteSettingsService(siteSettings)
	mediaService := service.NewMediaService(mediaRepo, fileStorage)
	regionService := service.NewRegionService(regionRepo)
	casinoService := service.NewCasinoService(casinoRepo)
	bonusService := service.NewBonusService(bonusRepo)
	paymentMethodService := service.NewPaymentMethodService(paymentMethodRepo)
	rtpEntryService := service.NewRTPEntryService(rtpEntryRepo)
	guideService := service.NewGuideService(guideRepo)
	blacklistEntryService := service.NewBlacklistEntryService(blacklistEntryRepo)
	newsArticleService := service.NewNewsArticleService(newsArticleRepo)
	menuItemService := service.NewMenuItemService(menuItemRepo)
	pageService := service.NewPageService(pageRepo)
	snippetService := service.NewSnippetService(snippetRepo)

	deps := server.Deps{
		Config:                cfg,
		JWT:                   jwtIssuer,
		Users:                 users,
		AuthHandler:           handler.NewAuthHandler(authService, cfg),
		UserHandler:           handler.NewUserHandler(userService),
		SiteSettingsHandler:   handler.NewSiteSettingsHandler(siteSettingsService, fileStorage),
		MediaHandler:          handler.NewMediaHandler(mediaService),
		RegionHandler:         handler.NewRegionHandler(regionService),
		CasinoHandler:         handler.NewCasinoHandler(casinoService),
		BonusHandler:          handler.NewBonusHandler(bonusService),
		PaymentMethodHandler:  handler.NewPaymentMethodHandler(paymentMethodService),
		RTPEntryHandler:       handler.NewRTPEntryHandler(rtpEntryService),
		GuideHandler:          handler.NewGuideHandler(guideService),
		BlacklistEntryHandler: handler.NewBlacklistEntryHandler(blacklistEntryService),
		NewsArticleHandler:    handler.NewNewsArticleHandler(newsArticleService),
		MenuItemHandler:       handler.NewMenuItemHandler(menuItemService),
		PageHandler:           handler.NewPageHandler(pageService),
		SnippetHandler:        handler.NewSnippetHandler(snippetService),
	}
	router := server.NewRouter(deps)

	log.Printf("topcasinosg-api listening on :%s (env=%s)", cfg.Port, cfg.Env)
	if err := http.ListenAndServe(":"+cfg.Port, router); err != nil {
		log.Fatal(err)
	}
}

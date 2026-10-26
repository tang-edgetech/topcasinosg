package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/config"
	"github.com/tang-edgetech/topcasinosg/api/internal/db"
	"github.com/tang-edgetech/topcasinosg/api/internal/handler"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
	"github.com/tang-edgetech/topcasinosg/api/internal/security"
	"github.com/tang-edgetech/topcasinosg/api/internal/server"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
	"github.com/tang-edgetech/topcasinosg/api/internal/storage"
	"github.com/tang-edgetech/topcasinosg/api/internal/version"
)

const auditPurgeInterval = 24 * time.Hour

// purgeExpiredAuditLogs enforces the activity-log retention period once at
// startup and then daily. Safe to run on several API instances at once.
func purgeExpiredAuditLogs(audit *service.AuditService) {
	for {
		if removed, err := audit.PurgeExpired(context.Background()); err != nil {
			log.Printf("audit purge: %v", err)
		} else if removed > 0 {
			log.Printf("audit purge: removed %d expired entries", removed)
		}
		time.Sleep(auditPurgeInterval)
	}
}

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
	gameProviderRepo := repository.NewGameProviderRepo(conn)
	licenseRepo := repository.NewLicenseRepo(conn)
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
	sidebarRepo := repository.NewSidebarRepo(conn)
	auditRepo := repository.NewAuditRepo(conn)
	transferRepo := repository.NewTransferRepo(conn)

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
	gameProviderService := service.NewGameProviderService(gameProviderRepo)
	licenseService := service.NewLicenseService(licenseRepo)
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
	sidebarService := service.NewSidebarService(sidebarRepo)
	auditService := service.NewAuditService(auditRepo, users)
	go purgeExpiredAuditLogs(auditService)

	deps := server.Deps{
		Config:                cfg,
		JWT:                   jwtIssuer,
		Users:                 users,
		AuthHandler:           handler.NewAuthHandler(authService, auditService, cfg),
		UserHandler:           handler.NewUserHandler(userService),
		SiteSettingsHandler:   handler.NewSiteSettingsHandler(siteSettingsService, fileStorage),
		MediaHandler:          handler.NewMediaHandler(mediaService),
		RegionHandler:         handler.NewRegionHandler(regionService),
		GameProviderHandler:   handler.NewGameProviderHandler(gameProviderService),
		LicenseHandler:        handler.NewLicenseHandler(licenseService),
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
		SidebarHandler:        handler.NewSidebarHandler(sidebarService),
		AuditHandler:          handler.NewAuditHandler(auditService),
		TransferHandler:       handler.NewTransferHandler(service.NewTransferService(transferRepo, fileStorage)),
		Audit:                 auditService,
	}
	router := server.NewRouter(deps)

	log.Printf("topcasinosg-api %s listening on :%s (env=%s)", version.Version, cfg.Port, cfg.Env)
	if err := http.ListenAndServe(":"+cfg.Port, router); err != nil {
		log.Fatal(err)
	}
}

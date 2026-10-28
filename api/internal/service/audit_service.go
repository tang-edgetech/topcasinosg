package service

import (
	"context"
	"log"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

const maxAuditPageSize = 100

type AuditService struct {
	logs  *repository.AuditRepo
	users *repository.UserRepo
}

func NewAuditService(logs *repository.AuditRepo, users *repository.UserRepo) *AuditService {
	return &AuditService{logs: logs, users: users}
}

// Record never fails the caller: the action it describes has already
// happened, so a logging error is reported to the server log instead.
func (s *AuditService) Record(ctx context.Context, entry *domain.AuditLog) {
	if entry.ActorRole == string(domain.RoleSuperAdmin) {
		entry.Restricted = true
	}
	if err := s.logs.Insert(ctx, entry); err != nil {
		log.Printf("audit: could not record %s %s: %v", entry.Action, entry.EntityType, err)
	}
}

// AuthEvent is one sign-in, failed sign-in or sign-out, as seen by the API.
type AuthEvent struct {
	Action    string
	UserID    int64
	Login     string
	IP        string
	Port      *int
	UserAgent string
	Method    string
	Path      string
	// Error replaces the generic failed sign-in message (e.g. "account locked").
	Error string
}

// RecordAuth logs a sign-in event. The account is looked up by id, or by the
// email or username typed in for a failed attempt, so an event on a Super Admin account
// stays restricted even when nobody is signed in yet.
func (s *AuditService) RecordAuth(ctx context.Context, event AuthEvent) {
	entry := &domain.AuditLog{
		Action:        event.Action,
		EntityType:    domain.AuditEntityAuth,
		EntityLabel:   event.Login,
		IPAddress:     event.IP,
		IPPort:        event.Port,
		UserAgent:     event.UserAgent,
		RequestMethod: event.Method,
		RequestPath:   event.Path,
		StatusCode:    domain.AuditStatusOK,
	}
	if event.Action == domain.AuditActionLoginFailed {
		entry.StatusCode = domain.AuditStatusFailedSignIn
		entry.ErrorMessage = "sign-in failed: wrong email/username, password or 2FA code, or the account is inactive"
		if event.Error != "" {
			entry.ErrorMessage = "sign-in failed: " + event.Error
		}
	}
	var user *domain.AdminUser
	if event.UserID > 0 {
		user, _ = s.users.GetByID(ctx, event.UserID)
	} else if event.Login != "" {
		user, _ = FindByLogin(ctx, s.users, event.Login)
	}
	if user != nil {
		entry.ActorID = &user.ID
		entry.ActorName = user.FullName
		entry.ActorRole = string(user.Role)
		entry.EntityLabel = user.Email
	}
	s.Record(ctx, entry)
}

// applyVisibility: Super Admins see everything, Admins everything except
// restricted entries, Editors only their own activity.
func applyVisibility(actor *domain.AdminUser, f *domain.AuditFilter) {
	f.IncludeRestricted = domain.CanSeeSuperAdmins(actor.Role)
	f.OnlyActorID = nil
	if actor.Role == domain.RoleEditor {
		id := actor.ID
		f.OnlyActorID = &id
	}
}

func (s *AuditService) List(ctx context.Context, actor *domain.AdminUser, f domain.AuditFilter) ([]domain.AuditLog, int, error) {
	applyVisibility(actor, &f)
	f.Page, f.PageSize = normalizePaging(f.Page, f.PageSize)
	if f.PageSize > maxAuditPageSize {
		f.PageSize = maxAuditPageSize
	}
	return s.logs.List(ctx, f)
}

func (s *AuditService) Actors(ctx context.Context, actor *domain.AdminUser) ([]domain.AuditActor, error) {
	var f domain.AuditFilter
	applyVisibility(actor, &f)
	return s.logs.ListActors(ctx, f.IncludeRestricted, f.OnlyActorID)
}

func (s *AuditService) PurgeExpired(ctx context.Context) (int64, error) {
	cutoff := time.Now().AddDate(0, 0, -domain.AuditRetentionDays)
	return s.logs.DeleteOlderThan(ctx, cutoff)
}

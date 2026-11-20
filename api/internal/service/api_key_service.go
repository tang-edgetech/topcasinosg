package service

import (
	"context"
	"errors"
	"strings"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
	"github.com/tang-edgetech/topcasinosg/api/internal/security"
)

// APIKeyService manages the keys outside tools use for the Content API
// (/api/v1). Super Admins and Admins create and revoke them (see server.go);
// a key acts for the admin who created it.
type APIKeyService struct {
	keys  *repository.APIKeyRepo
	users *repository.UserRepo
}

func NewAPIKeyService(keys *repository.APIKeyRepo, users *repository.UserRepo) *APIKeyService {
	return &APIKeyService{keys: keys, users: users}
}

func (s *APIKeyService) List(ctx context.Context) ([]domain.APIKey, error) {
	return s.keys.List(ctx)
}

// Create returns the new key's record and the key itself, which is never
// stored or shown again. mode is domain.APIKeyModeReview (the default) or
// domain.APIKeyModeDirect; a review key may only have domain.ReviewAPIScopes.
func (s *APIKeyService) Create(ctx context.Context, actor *domain.AdminUser, name, mode string, scopes []string) (*domain.APIKey, string, error) {
	name, mode, clean, err := checkAPIKeySettings(name, mode, scopes)
	if err != nil {
		return nil, "", err
	}
	token, err := security.GenerateOpaqueToken()
	if err != nil {
		return nil, "", err
	}
	key := domain.APIKeyPrefix + token
	actorID := actor.ID
	id, err := s.keys.Create(ctx, &domain.APIKey{
		Name: name, Prefix: key[:len(domain.APIKeyPrefix)+6], Mode: mode, Scopes: clean, CreatedByID: &actorID,
	}, security.HashToken(key))
	if err != nil {
		return nil, "", err
	}
	created, err := s.keys.GetByID(ctx, id)
	return created, key, err
}

// Update changes a key's name, mode and areas. The key itself stays the
// same, so the tool using it keeps working, with the new permissions from
// its next request. A revoked key can't be changed.
func (s *APIKeyService) Update(ctx context.Context, id int64, name, mode string, scopes []string) (*domain.APIKey, error) {
	name, mode, clean, err := checkAPIKeySettings(name, mode, scopes)
	if err != nil {
		return nil, err
	}
	if err := s.keys.UpdateSettings(ctx, id, name, mode, clean); err != nil {
		return nil, err
	}
	return s.keys.GetByID(ctx, id)
}

// ErrAPIKeyDeleteNotAllowed: only a Super Admin or the admin who created a
// key may delete it.
var ErrAPIKeyDeleteNotAllowed = errors.New("only a Super Admin or the admin who created this key can delete it")

// Delete removes a key for good, active or revoked: a tool still using it
// stops working at once. Only a Super Admin or the key's creator may, and
// only after confirm (their 2FA code) passes. The key's AI Changes, Recycle
// Bin items and activity log entries stay; they keep its name.
func (s *APIKeyService) Delete(ctx context.Context, actor *domain.AdminUser, id int64, confirm func() error) error {
	key, err := s.keys.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if !CanDeleteAPIKey(actor, key) {
		return ErrAPIKeyDeleteNotAllowed
	}
	if err := confirm(); err != nil {
		return err
	}
	return s.keys.Delete(ctx, id)
}

// CanDeleteAPIKey: a Super Admin, or the admin who created the key.
func CanDeleteAPIKey(actor *domain.AdminUser, key *domain.APIKey) bool {
	if actor == nil {
		return false
	}
	return actor.Role == domain.RoleSuperAdmin || (key.CreatedByID != nil && *key.CreatedByID == actor.ID)
}

// checkAPIKeySettings validates and tidies a key's name, mode and areas.
func checkAPIKeySettings(name, mode string, scopes []string) (string, string, []string, error) {
	name = strings.TrimSpace(name)
	if name == "" || len(name) > 100 {
		return "", "", nil, ErrAPIKeyNameRequired
	}
	if mode == "" {
		mode = domain.APIKeyModeReview
	}
	allowed := domain.ReviewAPIScopes
	switch mode {
	case domain.APIKeyModeReview:
	case domain.APIKeyModeDirect:
		allowed = domain.KnownAPIScopes
	default:
		return "", "", nil, ErrInvalidAPIKeyMode
	}
	var clean []string
	for _, known := range allowed {
		for _, s := range scopes {
			if s == known {
				clean = append(clean, known)
				break
			}
		}
	}
	if len(clean) == 0 || len(clean) != len(uniqueStrings(scopes)) {
		return "", "", nil, ErrInvalidAPIScopes
	}
	return name, mode, clean, nil
}

func (s *APIKeyService) Revoke(ctx context.Context, id int64) error {
	return s.keys.Revoke(ctx, id)
}

// Authenticate resolves a key sent by a tool to the key and the admin it
// acts for. It fails for an unknown or revoked key, and for one whose admin
// is no longer active.
func (s *APIKeyService) Authenticate(ctx context.Context, raw string) (*domain.APIKey, *domain.AdminUser, error) {
	if !strings.HasPrefix(raw, domain.APIKeyPrefix) {
		return nil, nil, repository.ErrNotFound
	}
	key, err := s.keys.GetActiveByHash(ctx, security.HashToken(raw))
	if err != nil {
		return nil, nil, err
	}
	if key.CreatedByID == nil {
		return nil, nil, repository.ErrNotFound
	}
	owner, err := s.users.GetByID(ctx, *key.CreatedByID)
	if err != nil || owner.Status != domain.StatusActive {
		return nil, nil, repository.ErrNotFound
	}
	_ = s.keys.TouchLastUsed(ctx, key.ID)
	return key, owner, nil
}

func uniqueStrings(values []string) []string {
	seen := map[string]bool{}
	var out []string
	for _, v := range values {
		if !seen[v] {
			seen[v] = true
			out = append(out, v)
		}
	}
	return out
}

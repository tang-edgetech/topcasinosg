package service

import (
	"context"
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
// stored or shown again.
func (s *APIKeyService) Create(ctx context.Context, actor *domain.AdminUser, name string, scopes []string) (*domain.APIKey, string, error) {
	name = strings.TrimSpace(name)
	if name == "" || len(name) > 100 {
		return nil, "", ErrAPIKeyNameRequired
	}
	var clean []string
	for _, known := range domain.KnownAPIScopes {
		for _, s := range scopes {
			if s == known {
				clean = append(clean, known)
				break
			}
		}
	}
	if len(clean) == 0 || len(clean) != len(uniqueStrings(scopes)) {
		return nil, "", ErrInvalidAPIScopes
	}
	token, err := security.GenerateOpaqueToken()
	if err != nil {
		return nil, "", err
	}
	key := domain.APIKeyPrefix + token
	actorID := actor.ID
	id, err := s.keys.Create(ctx, &domain.APIKey{
		Name: name, Prefix: key[:len(domain.APIKeyPrefix)+6], Scopes: clean, CreatedByID: &actorID,
	}, security.HashToken(key))
	if err != nil {
		return nil, "", err
	}
	created, err := s.keys.GetByID(ctx, id)
	return created, key, err
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

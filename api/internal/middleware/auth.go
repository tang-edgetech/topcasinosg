package middleware

import (
	"context"
	"net/http"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
	"github.com/tang-edgetech/topcasinosg/api/internal/security"
)

type contextKey int

const userContextKey contextKey = iota

// Authenticate reads the access_token cookie, verifies it, and re-fetches the
// user from the DB (not just trusting the JWT claims) so a role change or an
// account disable takes effect immediately instead of waiting out the token's
// 15-minute lifetime.
func Authenticate(jwtIssuer *security.JWTIssuer, users *repository.UserRepo) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie("access_token")
			if err != nil {
				response.Err(w, http.StatusUnauthorized, "not authenticated")
				return
			}
			claims, err := jwtIssuer.ParseAccessToken(cookie.Value)
			if err != nil {
				response.Err(w, http.StatusUnauthorized, "session expired")
				return
			}
			user, err := users.GetByID(r.Context(), claims.UserID)
			if err != nil || user.Status != domain.StatusActive {
				response.Err(w, http.StatusUnauthorized, "not authenticated")
				return
			}

			ctx := context.WithValue(r.Context(), userContextKey, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func UserFromContext(ctx context.Context) *domain.AdminUser {
	user, _ := ctx.Value(userContextKey).(*domain.AdminUser)
	return user
}

// RequireRoles blocks access outright for roles not listed — used to keep
// Editors off the user-management endpoints entirely.
func RequireRoles(roles ...domain.Role) func(http.Handler) http.Handler {
	allowed := make(map[domain.Role]bool, len(roles))
	for _, r := range roles {
		allowed[r] = true
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user := UserFromContext(r.Context())
			if user == nil || !allowed[user.Role] {
				response.Err(w, http.StatusForbidden, "not allowed")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

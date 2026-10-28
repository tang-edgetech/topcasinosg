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

const (
	userContextKey contextKey = iota
	sessionContextKey
)

// Authenticate reads the access-token cookie (named accessCookie), verifies it, and re-fetches the
// user from the DB (not just trusting the JWT claims) so a role change or an
// account disable takes effect immediately instead of waiting out the token's
// 15-minute lifetime. Likewise, while 2FA is required (twoFactorRequired), a
// token from a session that wasn't signed in with a code is turned away, so
// switching 2FA on applies to everyone straight away. A token whose session
// (claims.SID) was signed out is refused too (sessionActive), so "Sign out"
// on another device takes effect at once; one without a session (issued
// before sessions existed) gets a 401 that makes the admin app refresh it.
func Authenticate(jwtIssuer *security.JWTIssuer, users *repository.UserRepo, twoFactorRequired func(context.Context) (bool, error), sessionActive func(ctx context.Context, userID int64, sessionID string) (bool, error), accessCookie string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie(accessCookie)
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
			active, err := sessionActive(r.Context(), claims.UserID, claims.SID)
			if err != nil {
				response.Err(w, http.StatusInternalServerError, "could not check the session")
				return
			}
			if !active {
				response.Err(w, http.StatusUnauthorized, "session expired")
				return
			}
			if !claims.OTP {
				required, err := twoFactorRequired(r.Context())
				if err != nil {
					response.Err(w, http.StatusInternalServerError, "could not check the 2FA setting")
					return
				}
				if required {
					response.Err(w, http.StatusUnauthorized, "two-factor authentication is required — please sign in again")
					return
				}
			}

			ctx := context.WithValue(r.Context(), userContextKey, user)
			ctx = context.WithValue(ctx, sessionContextKey, claims.SID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func UserFromContext(ctx context.Context) *domain.AdminUser {
	user, _ := ctx.Value(userContextKey).(*domain.AdminUser)
	return user
}

// SessionIDFromContext is the signed-in session's admin_sessions id.
func SessionIDFromContext(ctx context.Context) string {
	sid, _ := ctx.Value(sessionContextKey).(string)
	return sid
}

// ErrPasswordChangeRequired is what RequirePasswordChanged answers with; the
// admin app matches this text to send the user to the change-password page.
const ErrPasswordChangeRequired = "you must change your password before continuing"

// RequirePasswordChanged keeps a user who must change their password (a new
// account, an admin reset, or a default account on its default password)
// away from everything except the routes that let them do it.
func RequirePasswordChanged(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if user := UserFromContext(r.Context()); user != nil && user.MustChangePassword {
			response.Err(w, http.StatusForbidden, ErrPasswordChangeRequired)
			return
		}
		next.ServeHTTP(w, r)
	})
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

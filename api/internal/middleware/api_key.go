package middleware

import (
	"context"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
)

const apiKeyContextKey contextKey = 100

// APIKeyRequestsPerMinute caps each key, so a tool stuck in a loop can't
// flood the API.
const APIKeyRequestsPerMinute = 120

// APIKeyAuthenticator resolves a key to the key and the admin it acts for
// (service.APIKeyService.Authenticate).
type APIKeyAuthenticator func(ctx context.Context, raw string) (*domain.APIKey, *domain.AdminUser, error)

// AuthenticateAPIKey guards the Content API (/api/v1): the key comes in
// "Authorization: Bearer <key>" (or "X-API-Key"). The key and its admin are
// put in the request context; nothing here sets a cookie or a session.
func AuthenticateAPIKey(authenticate APIKeyAuthenticator) func(http.Handler) http.Handler {
	limiter := &apiKeyLimiter{windows: map[int64]*apiKeyWindow{}}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			raw := strings.TrimSpace(r.Header.Get("X-API-Key"))
			if auth := r.Header.Get("Authorization"); raw == "" && len(auth) > 7 && strings.EqualFold(auth[:7], "bearer ") {
				raw = strings.TrimSpace(auth[7:])
			}
			if raw == "" {
				response.Err(w, http.StatusUnauthorized, "missing API key: send it as \"Authorization: Bearer <key>\"")
				return
			}
			key, owner, err := authenticate(r.Context(), raw)
			if err != nil {
				response.Err(w, http.StatusUnauthorized, "this API key is not valid, has been revoked, or its admin account is no longer active")
				return
			}
			if wait, ok := limiter.allow(key.ID); !ok {
				w.Header().Set("Retry-After", strconv.Itoa(int(wait.Seconds())+1))
				response.Err(w, http.StatusTooManyRequests, "too many requests for this API key; wait a minute and try again")
				return
			}
			ctx := context.WithValue(r.Context(), apiKeyContextKey, key)
			ctx = context.WithValue(ctx, userContextKey, owner)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireScope lets a request through only when its key has the scope.
func RequireScope(scope string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			key := APIKeyFromContext(r.Context())
			if key == nil || !key.HasScope(scope) {
				response.Err(w, http.StatusForbidden, "this API key can't use "+scope+"; an admin can create a key that includes it")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func APIKeyFromContext(ctx context.Context) *domain.APIKey {
	key, _ := ctx.Value(apiKeyContextKey).(*domain.APIKey)
	return key
}

type apiKeyWindow struct {
	start time.Time
	count int
}

type apiKeyLimiter struct {
	mu      sync.Mutex
	windows map[int64]*apiKeyWindow
}

// allow counts a request in the key's current one-minute window.
func (l *apiKeyLimiter) allow(keyID int64) (time.Duration, bool) {
	l.mu.Lock()
	defer l.mu.Unlock()
	now := time.Now()
	win := l.windows[keyID]
	if win == nil || now.Sub(win.start) >= time.Minute {
		win = &apiKeyWindow{start: now}
		l.windows[keyID] = win
	}
	if win.count >= APIKeyRequestsPerMinute {
		return time.Minute - now.Sub(win.start), false
	}
	win.count++
	return 0, true
}

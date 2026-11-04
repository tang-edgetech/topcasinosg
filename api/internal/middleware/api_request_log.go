package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

const (
	apiCallContextKey contextKey = 101
	apiRoutePrefix               = "/api/v1/"
	unknownAPIKeyName            = "Unknown API key"
)

// apiCall follows one /api/v1 request: the key and admin once
// AuthenticateAPIKey knows them, and whether an activity entry with the
// request's details (a write's before/after) has already been recorded.
type apiCall struct {
	key      *domain.APIKey
	owner    *domain.AdminUser
	prefix   string
	recorded bool
}

func apiCallFrom(ctx context.Context) *apiCall {
	call, _ := ctx.Value(apiCallContextKey).(*apiCall)
	return call
}

// APIRequestLog records every Content API request in the activity log —
// reads, writes, dry runs and refused requests (bad key, missing scope,
// rate limit) alike — with the key, its admin, the IP address and, for a
// failed write, what was sent. Writes that the admin Audit middleware or the
// Content API handlers already record with their before/after (see
// StampAPIKey) aren't recorded twice. Mount it outside AuthenticateAPIKey.
func APIRequestLog(audit *service.AuditService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			call := &apiCall{}
			r = r.WithContext(context.WithValue(r.Context(), apiCallContextKey, call))
			read := r.Method == http.MethodGet || r.Method == http.MethodHead
			var body map[string]any
			if !read {
				body = readAuditBody(r)
			}
			path := strings.Trim(strings.TrimPrefix(r.URL.Path, apiRoutePrefix), "/")
			segments := strings.Split(path, "/")
			var entityID *int64
			if len(segments) > 1 {
				if id, err := strconv.ParseInt(segments[1], 10, 64); err == nil {
					entityID = &id
				}
			}

			// A single record's response is kept to name it in the entry.
			recorder := &auditResponseRecorder{ResponseWriter: w, status: http.StatusOK, keepBody: read && entityID != nil}
			next.ServeHTTP(recorder, r)
			if call.recorded {
				return
			}

			ip, port := ClientAddress(r)
			entry := &domain.AuditLog{
				Action:        apiAction(r, segments, entityID != nil, body),
				EntityType:    segments[0],
				EntityID:      entityID,
				IPAddress:     ip,
				IPPort:        port,
				UserAgent:     truncate(r.UserAgent(), maxAuditUserAgentLen),
				RequestMethod: r.Method,
				RequestPath:   truncate(r.URL.RequestURI(), maxAuditPathLen),
				StatusCode:    recorder.status,
			}
			if entry.EntityType == "" {
				entry.EntityType = "api"
			}
			if recorder.status >= http.StatusBadRequest {
				entry.ErrorMessage = truncate(envelopeErrorMessage(recorder.body.Bytes()), maxAuditErrorLen)
			} else if read && entityID != nil {
				entry.EntityLabel = nestedAuditLabel(DecodeEnvelopeData(recorder.body.Bytes()))
			}
			if body != nil {
				entry.Changes = diffAuditSnapshots(nil, body)
			}
			stampAPICall(r, call, entry)
			audit.Record(context.WithoutCancel(r.Context()), entry)
		})
	}
}

// nestedAuditLabel names a record, or the record inside a response such as
// {"page": {...}, "sections": [...]}.
func nestedAuditLabel(data map[string]any) string {
	if label := auditLabel(data); label != "" {
		return label
	}
	for _, value := range data {
		if record, ok := value.(map[string]any); ok {
			if label := auditLabel(record); label != "" {
				return label
			}
		}
	}
	return ""
}

// apiAction names an unrecorded request: "read" for a GET, "dry run" for a
// checked-but-not-saved change, the route's last word (pages/12/changes →
// "changes") or the method's verb otherwise.
func apiAction(r *http.Request, segments []string, hasID bool, body map[string]any) string {
	switch {
	case r.Method == http.MethodGet || r.Method == http.MethodHead:
		return domain.AuditActionRead
	case body["dryRun"] == true || r.URL.Query().Get("dryRun") == "true" || r.URL.Query().Get("dryRun") == "1":
		return domain.AuditActionDryRun
	case hasID && len(segments) > 2:
		return strings.Join(segments[2:], "/")
	}
	return map[string]string{
		http.MethodPost: domain.AuditActionCreate, http.MethodPut: domain.AuditActionUpdate,
		http.MethodPatch: domain.AuditActionUpdate, http.MethodDelete: domain.AuditActionDelete,
	}[r.Method]
}

// StampAPIKey marks an activity entry made during a Content API request as
// coming from that request's key: actor name "<admin> (API key: <name>)",
// the key's id and name, and source api or connector. The request's own
// summary entry (APIRequestLog) is then left out, as this one has the
// details. Outside a Content API request it does nothing.
func StampAPIKey(r *http.Request, entry *domain.AuditLog) {
	call := apiCallFrom(r.Context())
	if call == nil {
		return
	}
	call.recorded = true
	stampAPICall(r, call, entry)
}

func stampAPICall(r *http.Request, call *apiCall, entry *domain.AuditLog) {
	entry.Source = domain.AuditSourceAPI
	if strings.HasPrefix(r.UserAgent(), domain.AuditConnectorUserAgent) {
		entry.Source = domain.AuditSourceConnector
	}
	if call.key == nil {
		entry.ActorName = unknownAPIKeyName
		entry.APIKeyName = call.prefix
		return
	}
	entry.APIKeyID = &call.key.ID
	entry.APIKeyName = call.key.Name
	if call.owner != nil {
		id := call.owner.ID
		entry.ActorID = &id
		entry.ActorName = fmt.Sprintf("%s (API key: %s)", call.owner.FullName, call.key.Name)
		entry.ActorRole = string(call.owner.Role)
	}
}

// noteAPIKey tells the request's apiCall which key (or, for one that isn't
// valid, which key prefix) made it.
func noteAPIKey(ctx context.Context, raw string, key *domain.APIKey, owner *domain.AdminUser) {
	call := apiCallFrom(ctx)
	if call == nil {
		return
	}
	call.key, call.owner = key, owner
	// Only the prefix the API Keys screen shows; never the key itself.
	if key == nil && strings.HasPrefix(raw, domain.APIKeyPrefix) && len(raw) > len(domain.APIKeyPrefix)+6 {
		call.prefix = raw[:len(domain.APIKeyPrefix)+6] + "…"
	}
}

package middleware

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"reflect"
	"strconv"
	"strings"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

const (
	adminRoutePrefix      = "/api/admin/"
	auditIDSegment        = "{id}"
	maxAuditBodyBytes     = 1 << 20
	maxAuditValueBytes    = 4000
	auditTextPreviewChars = 300
	maxAuditUserAgentLen  = 255
	hiddenAuditValue      = "[hidden]"
)

var auditIgnoredFields = map[string]bool{"createdAt": true, "updatedAt": true}

var auditLabelFields = []string{"name", "title", "fullName", "email", "label", "question", "slug", "path", "code"}

// Snapshotter returns the record at an admin GET path as decoded JSON (the
// envelope's data), or nil when there is no such endpoint or it fails.
type Snapshotter func(r *http.Request, path string) map[string]any

// Audit records every successful state-changing admin request: who, what,
// which record and the field-level before/after. Before/after come from the
// resource's own admin GET endpoint, so the log shows exactly what the admin
// screens show; routes without one fall back to the submitted values.
// Mount it inside Authenticate so the actor is known.
func Audit(audit *service.AuditService, snapshot Snapshotter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == http.MethodGet || r.Method == http.MethodHead || r.Method == http.MethodOptions {
				next.ServeHTTP(w, r)
				return
			}
			actor := UserFromContext(r.Context())
			route := describeAuditRoute(r)
			if actor == nil || route.entityType == "" {
				next.ServeHTTP(w, r)
				return
			}

			var before map[string]any
			if route.snapshotPath != "" && !route.isCreate {
				before = snapshot(r, route.snapshotPath)
			}
			body := readAuditBody(r)

			recorder := &auditResponseRecorder{ResponseWriter: w, status: http.StatusOK, keepBody: route.isCreate}
			next.ServeHTTP(recorder, r)
			if recorder.status < 200 || recorder.status >= 300 {
				return
			}

			var after map[string]any
			switch {
			case route.isCreate:
				after = DecodeEnvelopeData(recorder.body.Bytes())
			case r.Method != http.MethodDelete && route.snapshotPath != "":
				after = snapshot(r, route.snapshotPath)
			}

			entry := &domain.AuditLog{
				ActorID:    &actor.ID,
				ActorName:  actor.FullName,
				ActorRole:  string(actor.Role),
				Action:     route.action,
				EntityType: route.entityType,
				EntityID:   route.entityID,
				IPAddress:  ClientIP(r),
				UserAgent:  truncate(r.UserAgent(), maxAuditUserAgentLen),
			}
			if entry.EntityID == nil {
				entry.EntityID = numericField(after, "id")
			}
			entry.EntityLabel = auditLabel(after, before)
			if before != nil || after != nil {
				entry.Changes = diffAuditSnapshots(before, after)
			} else if body != nil {
				entry.Changes = diffAuditSnapshots(nil, body)
			}
			if isSuperAdminRecord(before) || isSuperAdminRecord(after) {
				entry.Restricted = true
			}
			audit.Record(context.WithoutCancel(r.Context()), entry)
		})
	}
}

// ClientIP prefers X-Forwarded-For only when the direct peer is the local
// reverse proxy (Apache on the same host), so it can't be spoofed remotely.
func ClientIP(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		host = r.RemoteAddr
	}
	if ip := net.ParseIP(host); ip != nil && ip.IsLoopback() {
		if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
			return strings.TrimSpace(strings.Split(forwarded, ",")[0])
		}
	}
	return host
}

type auditRoute struct {
	entityType   string
	action       string
	entityID     *int64
	snapshotPath string
	isCreate     bool
}

// describeAuditRoute derives the log entry's subject from the matched route
// pattern, so new admin routes are audited without registering anything:
//
//	POST   /api/admin/casinos             → casinos, create
//	PUT    /api/admin/casinos/{id}        → casinos, update
//	PUT    /api/admin/casinos/{id}/status → casinos, status
//	DELETE /api/admin/casinos/{id}        → casinos, delete
//	PUT    /api/admin/settings/site/logo  → settings/site/logo, update
func describeAuditRoute(r *http.Request) auditRoute {
	_, path, _ := strings.Cut(r.Pattern, " ")
	if !strings.HasPrefix(path, adminRoutePrefix) {
		return auditRoute{}
	}
	segments := strings.Split(strings.TrimPrefix(path, adminRoutePrefix), "/")
	idIndex := -1
	for i, segment := range segments {
		if segment == auditIDSegment {
			idIndex = i
			break
		}
	}

	verb := map[string]string{
		http.MethodPost:   domain.AuditActionCreate,
		http.MethodPut:    domain.AuditActionUpdate,
		http.MethodPatch:  domain.AuditActionUpdate,
		http.MethodDelete: domain.AuditActionDelete,
	}[r.Method]

	if idIndex < 0 {
		route := auditRoute{entityType: strings.Join(segments, "/"), action: verb, snapshotPath: r.URL.Path}
		if len(segments) == 1 && r.Method == http.MethodPost {
			route.isCreate = true
			route.snapshotPath = ""
		}
		return route
	}

	route := auditRoute{entityType: strings.Join(segments[:idIndex], "/"), action: verb}
	if rest := segments[idIndex+1:]; len(rest) > 0 {
		route.action = strings.Join(rest, "/")
	}
	if id, err := strconv.ParseInt(r.PathValue("id"), 10, 64); err == nil {
		route.entityID = &id
		route.snapshotPath = adminRoutePrefix + route.entityType + "/" + strconv.FormatInt(id, 10)
	}
	return route
}

func readAuditBody(r *http.Request) map[string]any {
	if r.Body == nil || !strings.HasPrefix(r.Header.Get("Content-Type"), "application/json") {
		return nil
	}
	raw, err := io.ReadAll(io.LimitReader(r.Body, maxAuditBodyBytes+1))
	r.Body = io.NopCloser(io.MultiReader(bytes.NewReader(raw), r.Body))
	if err != nil || len(raw) > maxAuditBodyBytes {
		return nil
	}
	var body map[string]any
	if json.Unmarshal(raw, &body) != nil {
		return nil
	}
	return body
}

type auditResponseRecorder struct {
	http.ResponseWriter
	status   int
	keepBody bool
	body     bytes.Buffer
}

func (w *auditResponseRecorder) WriteHeader(status int) {
	w.status = status
	w.ResponseWriter.WriteHeader(status)
}

func (w *auditResponseRecorder) Write(p []byte) (int, error) {
	if w.keepBody && w.body.Len() < maxAuditBodyBytes {
		w.body.Write(p)
	}
	return w.ResponseWriter.Write(p)
}

// DecodeEnvelopeData unwraps {"success":true,"data":{"casino":{...}}} to the
// record itself; a data object with several keys is returned as-is.
func DecodeEnvelopeData(raw []byte) map[string]any {
	var envelope struct {
		Data map[string]any `json:"data"`
	}
	if json.Unmarshal(raw, &envelope) != nil || envelope.Data == nil {
		return nil
	}
	return unwrapSingleRecord(envelope.Data)
}

func unwrapSingleRecord(data map[string]any) map[string]any {
	if len(data) == 1 {
		for _, value := range data {
			if record, ok := value.(map[string]any); ok {
				return record
			}
		}
	}
	return data
}

func diffAuditSnapshots(before, after map[string]any) domain.AuditChanges {
	from := flattenAuditRecord("", before)
	to := flattenAuditRecord("", after)
	changes := domain.AuditChanges{}
	for key, oldValue := range from {
		newValue, stillThere := to[key]
		switch {
		case after == nil:
			if !isEmptyAuditValue(oldValue) {
				changes[key] = map[string]any{"from": auditDisplayValue(key, oldValue)}
			}
		case !stillThere:
			changes[key] = map[string]any{"from": auditDisplayValue(key, oldValue), "to": nil}
		case !reflect.DeepEqual(oldValue, newValue):
			changes[key] = map[string]any{"from": auditDisplayValue(key, oldValue), "to": auditDisplayValue(key, newValue)}
		}
	}
	for key, newValue := range to {
		if _, existed := from[key]; existed {
			continue
		}
		if before == nil && isEmptyAuditValue(newValue) {
			continue
		}
		changes[key] = map[string]any{"to": auditDisplayValue(key, newValue)}
	}
	return changes
}

func flattenAuditRecord(prefix string, record map[string]any) map[string]any {
	flat := map[string]any{}
	for key, value := range record {
		if auditIgnoredFields[key] {
			continue
		}
		path := key
		if prefix != "" {
			path = prefix + "." + key
		}
		if nested, ok := value.(map[string]any); ok {
			for nestedKey, nestedValue := range flattenAuditRecord(path, nested) {
				flat[nestedKey] = nestedValue
			}
			continue
		}
		flat[path] = value
	}
	return flat
}

func isEmptyAuditValue(value any) bool {
	switch v := value.(type) {
	case nil:
		return true
	case string:
		return v == ""
	case []any:
		return len(v) == 0
	}
	return false
}

func isSecretAuditField(path string) bool {
	field := strings.ToLower(path[strings.LastIndex(path, ".")+1:])
	return strings.Contains(field, "password") || strings.Contains(field, "secret") ||
		strings.Contains(field, "token") || field == "otp"
}

// auditDisplayValue hides secrets and shortens large values so one edit to a
// long article or a page's section list doesn't store the whole document twice.
func auditDisplayValue(path string, value any) any {
	if isSecretAuditField(path) {
		return hiddenAuditValue
	}
	encoded, err := json.Marshal(value)
	if err != nil || len(encoded) <= maxAuditValueBytes {
		return value
	}
	switch v := value.(type) {
	case string:
		return fmt.Sprintf("%s… (%d characters)", truncate(v, auditTextPreviewChars), len(v))
	case []any:
		return fmt.Sprintf("(%d items)", len(v))
	}
	return "(large value)"
}

func auditLabel(records ...map[string]any) string {
	for _, record := range records {
		for _, field := range auditLabelFields {
			if value, ok := record[field].(string); ok && value != "" {
				return truncate(value, 255)
			}
		}
	}
	return ""
}

func numericField(record map[string]any, field string) *int64 {
	if value, ok := record[field].(float64); ok {
		id := int64(value)
		return &id
	}
	return nil
}

func isSuperAdminRecord(record map[string]any) bool {
	role, _ := record["role"].(string)
	return role == string(domain.RoleSuperAdmin)
}

func truncate(value string, max int) string {
	runes := []rune(value)
	if len(runes) <= max {
		return value
	}
	return string(runes[:max])
}

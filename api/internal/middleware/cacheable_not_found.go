package middleware

import (
	"net/http"
	"strings"
)

// MissingOKParam is the query parameter (?missing=ok) with which a public
// GET asks for "not found" as a 200 instead of a 404. The body is the usual
// error envelope ({"success": false, ...}), and X-Not-Found: 1 is set.
//
// The public site needs this: Next.js caches a fetch only when it gets a 200,
// so once a page, article, bonus or guide is deleted, unpublished or renamed
// the site's 404 is never cached, and it keeps serving its last good copy
// for ever. With a cacheable "not found", the item disappears from the site
// once the site's short cache runs out (see getPage in web/src/lib/pages.ts).
const MissingOKParam = "missing"

// CacheableNotFound applies MissingOKParam to public GET requests (not the
// admin routes or the Content API).
func CacheableNotFound(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path
		if r.Method != http.MethodGet || r.URL.Query().Get(MissingOKParam) != "ok" ||
			strings.HasPrefix(path, adminRoutePrefix) || strings.HasPrefix(path, apiRoutePrefix) {
			next.ServeHTTP(w, r)
			return
		}
		next.ServeHTTP(&notFoundAs200{ResponseWriter: w}, r)
	})
}

type notFoundAs200 struct {
	http.ResponseWriter
}

func (w *notFoundAs200) WriteHeader(status int) {
	if status == http.StatusNotFound {
		w.Header().Set("X-Not-Found", "1")
		status = http.StatusOK
	}
	w.ResponseWriter.WriteHeader(status)
}

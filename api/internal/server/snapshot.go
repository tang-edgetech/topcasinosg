package server

import (
	"bytes"
	"net/http"

	"github.com/tang-edgetech/topcasinosg/api/internal/middleware"
)

type snapshotResponse struct {
	header http.Header
	status int
	body   bytes.Buffer
}

func (w *snapshotResponse) Header() http.Header         { return w.header }
func (w *snapshotResponse) WriteHeader(status int)      { w.status = status }
func (w *snapshotResponse) Write(p []byte) (int, error) { return w.body.Write(p) }

// adminSnapshotter reads a record through its own admin GET route, as the
// signed-in user, so audit before/after values match what the admin screens
// show and go through the same permission checks.
func adminSnapshotter(mux *http.ServeMux) middleware.Snapshotter {
	return func(r *http.Request, path string) map[string]any {
		req, err := http.NewRequestWithContext(r.Context(), http.MethodGet, path, nil)
		if err != nil {
			return nil
		}
		req.Header.Set("Cookie", r.Header.Get("Cookie"))
		res := &snapshotResponse{header: http.Header{}, status: http.StatusOK}
		mux.ServeHTTP(res, req)
		if res.status != http.StatusOK {
			return nil
		}
		return middleware.DecodeEnvelopeData(res.body.Bytes())
	}
}

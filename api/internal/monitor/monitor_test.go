package monitor

import (
	"bytes"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/response"
)

// fakeTelegram records sendMessage calls.
type fakeTelegram struct {
	mu   sync.Mutex
	msgs []string
	path string
}

func (f *fakeTelegram) handler(w http.ResponseWriter, r *http.Request) {
	var body struct {
		ChatID string `json:"chat_id"`
		Text   string `json:"text"`
	}
	json.NewDecoder(r.Body).Decode(&body)
	f.mu.Lock()
	f.msgs = append(f.msgs, body.Text)
	f.path = r.URL.Path
	f.mu.Unlock()
	w.Write([]byte(`{"ok":true}`))
}

func (f *fakeTelegram) waitFor(t *testing.T, n int) []string {
	t.Helper()
	deadline := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) {
		f.mu.Lock()
		if len(f.msgs) >= n {
			out := append([]string(nil), f.msgs...)
			f.mu.Unlock()
			return out
		}
		f.mu.Unlock()
		time.Sleep(10 * time.Millisecond)
	}
	f.mu.Lock()
	defer f.mu.Unlock()
	t.Fatalf("got %d messages, want %d: %q", len(f.msgs), n, f.msgs)
	return nil
}

func newTestTelegram(t *testing.T) (*Telegram, *fakeTelegram, *time.Time) {
	fake := &fakeTelegram{}
	srv := httptest.NewServer(http.HandlerFunc(fake.handler))
	t.Cleanup(srv.Close)
	tg := NewTelegram("123:SECRET", "-100", "", "API (test)", 10*time.Minute)
	tg.baseURL = srv.URL
	now := time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC)
	tg.now = func() time.Time { return now }
	return tg, fake, &now
}

func TestTelegramOffWithoutSettings(t *testing.T) {
	if NewTelegram("", "-100", "", "x", time.Minute) != nil || NewTelegram("tok", "", "", "x", time.Minute) != nil {
		t.Fatal("want nil (alerts off) when token or chat id is missing")
	}
	var tg *Telegram
	tg.Alert("k", "t", "d") // must not panic
	tg.Info("t", "d")
	if tg.Enabled() {
		t.Fatal("nil Telegram reports enabled")
	}
}

func TestTelegramDedupesAndSummarises(t *testing.T) {
	tg, fake, now := newTestTelegram(t)
	tg.Alert("500 GET /x", "HTTP 500: GET /x", "<b>details</b>")
	for range 4 {
		tg.Alert("500 GET /x", "HTTP 500: GET /x", "again")
	}
	tg.Alert("other", "Other problem", "")
	msgs := fake.waitFor(t, 2)
	if len(msgs) != 2 {
		t.Fatalf("repeats were sent: %q", msgs)
	}
	if !strings.Contains(msgs[0], "&lt;b&gt;details") {
		t.Errorf("details not HTML-escaped: %q", msgs[0])
	}
	if fake.path != "/bot123:SECRET/sendMessage" {
		t.Errorf("path = %q", fake.path)
	}

	*now = now.Add(11 * time.Minute)
	tg.flush()
	msgs = fake.waitFor(t, 3)
	if !strings.Contains(msgs[2], "Repeated 4 more times") {
		t.Errorf("summary = %q", msgs[2])
	}
	// After the cooldown the same key alerts again.
	*now = now.Add(11 * time.Minute)
	tg.Alert("500 GET /x", "HTTP 500: GET /x", "back")
	fake.waitFor(t, 4)
}

func TestTelegramHourlyCap(t *testing.T) {
	tg, fake, now := newTestTelegram(t)
	for i := range maxPerHour + 5 {
		tg.Alert(string(rune('a'+i)), "problem", "")
	}
	fake.waitFor(t, maxPerHour)
	time.Sleep(50 * time.Millisecond)
	if n := len(fake.waitFor(t, 0)); n != maxPerHour {
		t.Fatalf("sent %d, want cap %d", n, maxPerHour)
	}
	*now = now.Add(61 * time.Minute)
	tg.Alert("new", "problem", "")
	msgs := fake.waitFor(t, maxPerHour+2)
	if !strings.Contains(msgs[maxPerHour], "5 alerts were not sent") {
		t.Errorf("cap notice = %q", msgs[maxPerHour])
	}
}

func TestTelegramErrorsHideToken(t *testing.T) {
	tg := NewTelegram("123:SECRET", "-100", "", "x", time.Minute)
	tg.baseURL = "http://127.0.0.1:1" // nothing listens here
	err := tg.Send(t.Context(), "t", "d")
	if err == nil || strings.Contains(err.Error(), "SECRET") {
		t.Fatalf("err = %v", err)
	}
}

func newTestMonitor(t *testing.T, tg *Telegram) (*Monitor, *bytes.Buffer) {
	var buf bytes.Buffer
	m := &Monitor{
		Log:      slog.New(slog.NewJSONHandler(&buf, nil)),
		Alerts:   tg,
		slow:     50 * time.Millisecond,
		hung:     time.Hour,
		ignore:   []string{"/api/admin/exports/"},
		inflight: map[uint64]*inflightRequest{},
	}
	return m, &buf
}

func TestMiddlewarePanic5xxAndSlow(t *testing.T) {
	tg, fake, _ := newTestTelegram(t)
	m, logs := newTestMonitor(t, tg)
	mux := http.NewServeMux()
	mux.HandleFunc("GET /boom/{id}", func(http.ResponseWriter, *http.Request) { panic("kaboom") })
	mux.HandleFunc("GET /fail", func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusBadGateway) })
	mux.HandleFunc("GET /slow", func(w http.ResponseWriter, _ *http.Request) { time.Sleep(80 * time.Millisecond) })
	mux.HandleFunc("GET /api/admin/exports/x", func(w http.ResponseWriter, _ *http.Request) { time.Sleep(80 * time.Millisecond) })
	mux.HandleFunc("GET /ok", func(w http.ResponseWriter, _ *http.Request) { w.Write([]byte("ok")) })
	h := m.Middleware(mux)

	get := func(path string) int {
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, path, nil))
		return rec.Code
	}
	if code := get("/boom/7"); code != http.StatusInternalServerError {
		t.Errorf("panic answered %d, want 500", code)
	}
	get("/boom/8") // same route: de-duplicated
	if code := get("/fail"); code != http.StatusBadGateway {
		t.Errorf("/fail = %d", code)
	}
	get("/slow")
	get("/api/admin/exports/x") // ignored for slowness
	get("/ok")

	msgs := fake.waitFor(t, 3)
	time.Sleep(50 * time.Millisecond)
	all := strings.Join(fake.msgs, "\n---\n")
	for _, want := range []string{"Panic: GET /boom/{id}", "kaboom", "HTTP 502: GET /fail", "Slow request", "GET /slow"} {
		if !strings.Contains(all, want) {
			t.Errorf("alerts missing %q:\n%s", want, all)
		}
	}
	if len(msgs) != 3 || strings.Contains(all, "exports") {
		t.Errorf("unexpected alerts (%d): %s", len(msgs), all)
	}
	for _, want := range []string{`"msg":"panic"`, `"stack":`, `"msg":"server error"`, `"status":502`, `"msg":"slow request"`} {
		if !strings.Contains(logs.String(), want) {
			t.Errorf("log missing %s:\n%s", want, logs.String())
		}
	}
}

func TestHungRequestAlertsWhileRunning(t *testing.T) {
	tg, fake, _ := newTestTelegram(t)
	m, logs := newTestMonitor(t, tg)
	m.hung = 30 * time.Second
	start := time.Now()
	id := m.track(http.MethodGet, "/api/casinos/42", start)
	m.checkHung(start.Add(10 * time.Second))
	m.checkHung(start.Add(31 * time.Second))
	m.checkHung(start.Add(45 * time.Second)) // already alerted
	msgs := fake.waitFor(t, 1)
	if !strings.Contains(msgs[0], "Request still running after 31s: /api/casinos/{n}") {
		t.Errorf("alert = %q", msgs[0])
	}
	if !m.untrack(id) {
		t.Error("untrack should report the request was alerted as hung")
	}
	if !strings.Contains(logs.String(), `"msg":"hung request"`) {
		t.Errorf("log = %s", logs.String())
	}
}

func TestRotatingFile(t *testing.T) {
	path := filepath.Join(t.TempDir(), "logs", "api-error.log")
	f, err := OpenRotatingFile(path, 100, 2)
	if err != nil {
		t.Fatal(err)
	}
	line := []byte(strings.Repeat("x", 59) + "\n") // 60 bytes: one per file
	for range 5 {
		if _, err := f.Write(line); err != nil {
			t.Fatal(err)
		}
	}
	f.Close()
	for _, name := range []string{path, path + ".1", path + ".2"} {
		b, err := os.ReadFile(name)
		if err != nil || len(b) != 60 {
			t.Errorf("%s: %d bytes, err %v", name, len(b), err)
		}
	}
	if _, err := os.Stat(path + ".3"); err == nil {
		t.Error("kept more backups than asked")
	}
}

func TestNormalizePath(t *testing.T) {
	for in, want := range map[string]string{
		"/api/admin/casinos/12":      "/api/admin/casinos/{n}",
		"/api/admin/casinos/12/34":   "/api/admin/casinos/{n}/{n}",
		"/api/casinos/best-casino-1": "/api/casinos/best-casino-1",
	} {
		if got := normalizePath(in); got != want {
			t.Errorf("normalizePath(%q) = %q, want %q", in, got, want)
		}
	}
}

// wrapWriter stands in for middleware that wraps the writer (audit log).
type wrapWriter struct{ http.ResponseWriter }

func (w wrapWriter) Unwrap() http.ResponseWriter { return w.ResponseWriter }

func TestServerErrorCarriesCause(t *testing.T) {
	tg, fake, _ := newTestTelegram(t)
	m, logs := newTestMonitor(t, tg)
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/regions", func(w http.ResponseWriter, _ *http.Request) {
		response.ServerErr(wrapWriter{w}, errors.New("dial tcp 127.0.0.1:3306: connect: connection refused"), "could not load regions")
	})
	mux.HandleFunc("GET /api/casinos", func(w http.ResponseWriter, _ *http.Request) {
		response.Err(w, http.StatusInternalServerError, "Error 1054: Unknown column 'x'")
	})
	h := m.Middleware(mux)
	for _, p := range []string{"/api/regions", "/api/casinos"} {
		rec := httptest.NewRecorder()
		h.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, p, nil))
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("%s = %d", p, rec.Code)
		}
		if p == "/api/regions" && strings.Contains(rec.Body.String(), "3306") {
			t.Errorf("the visitor saw the internal error: %s", rec.Body.String())
		}
	}
	fake.waitFor(t, 2)
	all := strings.Join(fake.msgs, "\n---\n")
	for _, want := range []string{"error: dial tcp 127.0.0.1:3306: connect: connection refused", "error: Error 1054: Unknown column"} {
		if !strings.Contains(all, want) {
			t.Errorf("alerts missing %q:\n%s", want, all)
		}
	}
	if !strings.Contains(logs.String(), `"error":"dial tcp`) {
		t.Errorf("log missing the cause:\n%s", logs.String())
	}
}

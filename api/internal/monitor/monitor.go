package monitor

import (
	"context"
	"database/sql"
	"fmt"
	"io"
	"log"
	"log/slog"
	"net/http"
	"os"
	"regexp"
	"runtime/debug"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/config"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
)

// Monitor logs and alerts on what goes wrong while serving requests: panics,
// 5xx responses, slow requests, requests still running long after they
// should have finished, and the database becoming unreachable.
//
// It can't report the API process itself dying or never answering — the
// watchdog (deploy/cpanel/watchdog.sh) and an outside uptime monitor do.
type Monitor struct {
	Log    *slog.Logger
	Alerts *Telegram

	slow, hung time.Duration
	ignore     []string
	file       *RotatingFile

	nextID   atomic.Uint64
	mu       sync.Mutex
	inflight map[uint64]*inflightRequest
}

type inflightRequest struct {
	method, path string
	start        time.Time
	hungAlerted  bool
}

// New sets up the error log and Telegram alerts from cfg. It never fails:
// if the log file can't be opened, logs go to stderr (api.log) only.
func New(cfg config.Config) *Monitor {
	m := &Monitor{
		Alerts:   NewTelegram(cfg.TelegramBotToken, cfg.TelegramChatID, cfg.TelegramThreadID, cfg.AlertLabel, cfg.AlertCooldown),
		slow:     cfg.SlowRequest,
		hung:     cfg.HungRequest,
		ignore:   cfg.SlowRequestIgnore,
		inflight: map[uint64]*inflightRequest{},
	}
	var out io.Writer = os.Stderr
	if cfg.ErrorLogFile != "" {
		if f, err := OpenRotatingFile(cfg.ErrorLogFile, cfg.ErrorLogMaxBytes, cfg.ErrorLogBackups); err != nil {
			log.Printf("monitor: error log %s: %v (logging to stderr only)", cfg.ErrorLogFile, err)
		} else {
			m.file = f
			// Also to stderr, which cPanel's api-process.sh appends to api.log.
			out = io.MultiWriter(f, os.Stderr)
		}
	}
	m.Log = slog.New(slog.NewJSONHandler(out, &slog.HandlerOptions{Level: slog.LevelInfo}))
	if m.hung > 0 {
		go m.watchHung()
	}
	return m
}

// Close flushes nothing (writes are unbuffered) but closes the log file.
func (m *Monitor) Close() {
	if m.file != nil {
		m.file.Close()
	}
}

// Error logs an error and alerts on it, de-duplicated by key.
func (m *Monitor) Error(key, title, details string, attrs ...any) {
	m.Log.Error(title, append(attrs, "details", details)...)
	m.Alerts.Alert(key, title, details)
}

// Middleware wraps the whole router. It recovers panics (answering 500
// instead of dropping the connection), and logs and alerts on 5xx and slow
// responses.
func (m *Monitor) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w}
		path := r.URL.Path
		timed := !m.ignored(path)
		var id uint64
		if timed && m.hung > 0 {
			id = m.track(r.Method, path, start)
		}
		defer func() {
			hungAlerted := m.untrack(id)
			p := recover()
			if p == http.ErrAbortHandler {
				panic(p)
			}
			route := routeOf(r)
			dur := time.Since(start)
			attrs := []any{"method", r.Method, "path", path, "route", route, "duration_ms", dur.Milliseconds(), "ip", clientIP(r)}
			switch {
			case p != nil:
				stack := string(debug.Stack())
				m.Log.Error("panic", append(attrs, "panic", fmt.Sprint(p), "stack", stack)...)
				m.Alerts.Alert("panic "+route, "Panic: "+route, fmt.Sprintf("%s %s\n%v\n\n%s", r.Method, path, p, shortStack(stack)))
				if !rec.wroteHeader {
					response.Err(rec, http.StatusInternalServerError, "internal server error")
				}
			case rec.status() >= 500:
				m.Log.Error("server error", append(attrs, "status", rec.status())...)
				m.Alerts.Alert(fmt.Sprintf("%d %s", rec.status(), route), fmt.Sprintf("HTTP %d: %s", rec.status(), route),
					fmt.Sprintf("%s %s\ntook %s", r.Method, path, dur.Round(time.Millisecond)))
			case timed && m.slow > 0 && dur >= m.slow:
				m.Log.Warn("slow request", append(attrs, "status", rec.status())...)
				if !hungAlerted {
					m.Alerts.Alert("slow "+route, fmt.Sprintf("Slow request (%s): %s", dur.Round(100*time.Millisecond), route),
						fmt.Sprintf("%s %s\nstatus %d, limit %s", r.Method, path, rec.status(), m.slow))
				}
			}
			if hungAlerted && p == nil {
				m.Log.Warn("hung request finished", append(attrs, "status", rec.status())...)
			}
		}()
		next.ServeHTTP(rec, r)
	})
}

func (m *Monitor) ignored(path string) bool {
	for _, p := range m.ignore {
		if strings.HasPrefix(path, p) {
			return true
		}
	}
	return false
}

func (m *Monitor) track(method, path string, start time.Time) uint64 {
	id := m.nextID.Add(1)
	m.mu.Lock()
	m.inflight[id] = &inflightRequest{method: method, path: path, start: start}
	m.mu.Unlock()
	return id
}

// untrack reports whether the request was already alerted on as hung.
func (m *Monitor) untrack(id uint64) bool {
	if id == 0 {
		return false
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	req := m.inflight[id]
	delete(m.inflight, id)
	return req != nil && req.hungAlerted
}

// watchHung alerts on requests still running past the hung limit — the
// "page loads forever" case — while they are still stuck, not after.
func (m *Monitor) watchHung() {
	every := max(m.hung/4, time.Second)
	tick := time.NewTicker(every)
	defer tick.Stop()
	for range tick.C {
		m.checkHung(time.Now())
	}
}

func (m *Monitor) checkHung(now time.Time) {
	type hit struct {
		method, path string
		age          time.Duration
	}
	var fresh []hit
	stuck := 0
	m.mu.Lock()
	for _, req := range m.inflight {
		age := now.Sub(req.start)
		if age < m.hung {
			continue
		}
		stuck++
		if !req.hungAlerted {
			req.hungAlerted = true
			fresh = append(fresh, hit{req.method, req.path, age})
		}
	}
	m.mu.Unlock()
	sort.Slice(fresh, func(i, j int) bool { return fresh[i].age > fresh[j].age })
	for _, h := range fresh {
		key := "hung " + normalizePath(h.path)
		m.Log.Error("hung request", "method", h.method, "path", h.path, "running_ms", h.age.Milliseconds(), "stuck_total", stuck)
		m.Alerts.Alert(key, fmt.Sprintf("Request still running after %s: %s", h.age.Round(time.Second), normalizePath(h.path)),
			fmt.Sprintf("%s %s\n%d request(s) running longer than %s right now", h.method, h.path, stuck, m.hung))
	}
}

// WatchDB pings the database every interval and alerts when it stops
// answering and again when it is back.
func (m *Monitor) WatchDB(db *sql.DB, every time.Duration) {
	var downSince time.Time
	for {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		err := db.PingContext(ctx)
		cancel()
		switch {
		case err != nil:
			if downSince.IsZero() {
				downSince = time.Now()
			}
			m.Error("db down", "Database not answering", err.Error())
		case !downSince.IsZero():
			m.Log.Info("database reachable again", "down_for_ms", time.Since(downSince).Milliseconds())
			m.Alerts.Info("Database reachable again", "Was down for about "+roundDuration(time.Since(downSince)))
			downSince = time.Time{}
		}
		time.Sleep(every)
	}
}

// statusRecorder remembers the status code. Unwrap keeps
// http.ResponseController (flush, deadlines) working through it.
type statusRecorder struct {
	http.ResponseWriter
	code        int
	wroteHeader bool
}

func (s *statusRecorder) WriteHeader(code int) {
	if !s.wroteHeader {
		s.code, s.wroteHeader = code, true
	}
	s.ResponseWriter.WriteHeader(code)
}

func (s *statusRecorder) Write(p []byte) (int, error) {
	if !s.wroteHeader {
		s.code, s.wroteHeader = http.StatusOK, true
	}
	return s.ResponseWriter.Write(p)
}

func (s *statusRecorder) Flush() {
	if f, ok := s.ResponseWriter.(http.Flusher); ok {
		f.Flush()
	}
}

func (s *statusRecorder) Unwrap() http.ResponseWriter { return s.ResponseWriter }

func (s *statusRecorder) status() int {
	if !s.wroteHeader {
		return http.StatusOK
	}
	return s.code
}

// routeOf is the mux pattern that served r ("GET /api/casinos/{slug}"), so
// one broken route alerts once however many slugs hit it.
func routeOf(r *http.Request) string {
	if r.Pattern != "" {
		return r.Pattern
	}
	return r.Method + " " + normalizePath(r.URL.Path)
}

var idSegment = regexp.MustCompile(`/[0-9]+(/|$)`)

// normalizePath folds numeric ids, for alerts on requests not yet routed.
func normalizePath(p string) string {
	for {
		q := idSegment.ReplaceAllString(p, "/{n}$1")
		if q == p {
			return q
		}
		p = q
	}
}

func clientIP(r *http.Request) string {
	if v := r.Header.Get("CF-Connecting-IP"); v != "" {
		return v
	}
	if v := r.Header.Get("X-Forwarded-For"); v != "" {
		return strings.TrimSpace(strings.Split(v, ",")[0])
	}
	return r.RemoteAddr
}

// shortStack keeps the frames from this app, which say where it broke,
// and drops the runtime and net/http ones.
func shortStack(stack string) string {
	lines := strings.Split(stack, "\n")
	var out []string
	for i := 1; i+1 < len(lines); i += 2 {
		if strings.Contains(lines[i], "topcasinosg/api/") && !strings.Contains(lines[i], "/internal/monitor.") {
			out = append(out, strings.TrimSpace(lines[i]), "  "+strings.TrimSpace(lines[i+1]))
		}
		if len(out) >= 16 {
			break
		}
	}
	if len(out) == 0 {
		return stack
	}
	return strings.Join(out, "\n")
}

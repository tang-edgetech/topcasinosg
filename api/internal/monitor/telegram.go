// Package monitor reports server trouble: it writes warnings and errors to a
// rotating JSON log file and posts alerts to a Telegram group. Setup:
// docs/MONITORING.md.
package monitor

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"html"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
)

const (
	telegramAPI = "https://api.telegram.org"
	// maxPerHour caps the messages sent in any hour, whatever the alerts, so a
	// storm of different errors still can't flood the group.
	maxPerHour = 30
	// Telegram rejects messages over 4096 characters.
	maxMessageLen = 3800
)

// Telegram posts alerts to one chat. A nil or unconfigured *Telegram is
// valid and does nothing, so callers never check whether alerts are on.
//
// Alert de-duplicates by key: the first alert for a key is sent, repeats
// within the cooldown are only counted, and the count is sent as one
// follow-up once the cooldown ends.
type Telegram struct {
	token, chatID, threadID string
	label, host             string
	cooldown                time.Duration
	baseURL                 string
	client                  *http.Client
	queue                   chan string
	now                     func() time.Time

	mu         sync.Mutex
	keys       map[string]*alertState
	hourStart  time.Time
	hourSent   int
	hourDenied int
}

type alertState struct {
	lastSent   time.Time
	suppressed int
	title      string
}

// NewTelegram returns nil when the token or chat id is missing: alerts off.
func NewTelegram(token, chatID, threadID, label string, cooldown time.Duration) *Telegram {
	if token == "" || chatID == "" {
		return nil
	}
	host, _ := os.Hostname()
	t := &Telegram{
		token: token, chatID: chatID, threadID: threadID,
		label: label, host: host, cooldown: cooldown,
		baseURL: telegramAPI,
		client:  &http.Client{Timeout: 15 * time.Second},
		queue:   make(chan string, 100),
		now:     time.Now,
		keys:    map[string]*alertState{},
	}
	go t.sender()
	go t.flushLoop()
	return t
}

// Enabled reports whether alerts are sent at all.
func (t *Telegram) Enabled() bool { return t != nil }

// Alert queues a message unless the same key alerted within the cooldown.
// title is the first line (plain text); details follow it, in a monospace
// block. It never blocks: when the queue is full the alert is dropped.
func (t *Telegram) Alert(key, title, details string) {
	if t == nil {
		return
	}
	now := t.now()
	t.mu.Lock()
	st := t.keys[key]
	if st != nil && now.Sub(st.lastSent) < t.cooldown {
		st.suppressed++
		t.mu.Unlock()
		return
	}
	if !t.takeBudgetLocked(now) {
		t.mu.Unlock()
		return
	}
	if st == nil {
		st = &alertState{}
		t.keys[key] = st
	}
	st.lastSent, st.suppressed, st.title = now, 0, title
	t.mu.Unlock()
	t.enqueue(t.format("🔴", title, details))
}

// Info sends a one-off notice (no de-duplication beyond the hourly cap).
func (t *Telegram) Info(title, details string) {
	if t == nil {
		return
	}
	t.mu.Lock()
	ok := t.takeBudgetLocked(t.now())
	t.mu.Unlock()
	if ok {
		t.enqueue(t.format("🟢", title, details))
	}
}

// Send posts a message straight away and reports the result (for the test
// command; ordinary alerts go through Alert).
func (t *Telegram) Send(ctx context.Context, title, details string) error {
	if t == nil {
		return errors.New("telegram alerts are off: set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID")
	}
	return t.post(ctx, t.format("🧪", title, details))
}

func (t *Telegram) takeBudgetLocked(now time.Time) bool {
	if now.Sub(t.hourStart) >= time.Hour {
		if t.hourDenied > 0 {
			denied := t.hourDenied
			t.hourDenied = 0
			t.hourStart, t.hourSent = now, 1
			t.enqueue(t.format("⚠️", fmt.Sprintf("%d alerts were not sent in the last hour (limit %d an hour)", denied, maxPerHour), "Check api-error.log for the details."))
		} else {
			t.hourStart, t.hourSent = now, 0
		}
	}
	if t.hourSent >= maxPerHour {
		t.hourDenied++
		return false
	}
	t.hourSent++
	return true
}

// flushLoop sends one "happened N more times" follow-up per key whose
// repeats were held back, once its cooldown is over, and forgets keys that
// went quiet.
func (t *Telegram) flushLoop() {
	tick := time.NewTicker(30 * time.Second)
	defer tick.Stop()
	for range tick.C {
		t.flush()
	}
}

func (t *Telegram) flush() {
	now := t.now()
	var msgs []string
	t.mu.Lock()
	for key, st := range t.keys {
		if now.Sub(st.lastSent) < t.cooldown {
			continue
		}
		if st.suppressed == 0 {
			if now.Sub(st.lastSent) > 2*t.cooldown {
				delete(t.keys, key)
			}
			continue
		}
		if !t.takeBudgetLocked(now) {
			break
		}
		msgs = append(msgs, t.format("🔁",
			fmt.Sprintf("Repeated %d more times in the last %s: %s", st.suppressed, roundDuration(now.Sub(st.lastSent)), st.title), ""))
		st.lastSent, st.suppressed = now, 0
	}
	t.mu.Unlock()
	for _, m := range msgs {
		t.enqueue(m)
	}
}

func (t *Telegram) enqueue(msg string) {
	select {
	case t.queue <- msg:
	default:
		log.Printf("telegram: queue full, alert dropped")
	}
}

func (t *Telegram) sender() {
	for msg := range t.queue {
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		if err := t.post(ctx, msg); err != nil {
			log.Printf("telegram: %v", err)
		}
		cancel()
	}
}

func (t *Telegram) format(icon, title, details string) string {
	var b strings.Builder
	fmt.Fprintf(&b, "%s <b>%s</b>\n%s", icon, html.EscapeString(t.label), html.EscapeString(title))
	if details = strings.TrimSpace(details); details != "" {
		if len(details) > maxMessageLen {
			details = details[:maxMessageLen] + "\n…"
		}
		fmt.Fprintf(&b, "\n<pre>%s</pre>", html.EscapeString(details))
	}
	fmt.Fprintf(&b, "\n<i>%s · %s</i>", html.EscapeString(t.host), t.now().UTC().Format("2006-01-02 15:04:05 UTC"))
	return b.String()
}

// post calls sendMessage, retrying once when Telegram asks to slow down.
// Errors never contain the bot token.
func (t *Telegram) post(ctx context.Context, text string) error {
	payload := map[string]any{
		"chat_id":                  t.chatID,
		"text":                     text,
		"parse_mode":               "HTML",
		"disable_web_page_preview": true,
	}
	if t.threadID != "" {
		if id, err := strconv.Atoi(t.threadID); err == nil {
			payload["message_thread_id"] = id
		}
	}
	body, _ := json.Marshal(payload)
	for attempt := 0; ; attempt++ {
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, t.baseURL+"/bot"+t.token+"/sendMessage", bytes.NewReader(body))
		if err != nil {
			return t.redact(err)
		}
		req.Header.Set("Content-Type", "application/json")
		res, err := t.client.Do(req)
		if err != nil {
			return t.redact(err)
		}
		var out struct {
			OK          bool   `json:"ok"`
			Description string `json:"description"`
			Parameters  struct {
				RetryAfter int `json:"retry_after"`
			} `json:"parameters"`
		}
		_ = json.NewDecoder(io.LimitReader(res.Body, 64<<10)).Decode(&out)
		res.Body.Close()
		if out.OK {
			return nil
		}
		if res.StatusCode == http.StatusTooManyRequests && attempt == 0 && out.Parameters.RetryAfter > 0 && out.Parameters.RetryAfter <= 60 {
			select {
			case <-time.After(time.Duration(out.Parameters.RetryAfter) * time.Second):
				continue
			case <-ctx.Done():
				return ctx.Err()
			}
		}
		return fmt.Errorf("telegram sendMessage: HTTP %d: %s", res.StatusCode, t.redactString(out.Description))
	}
}

func (t *Telegram) redact(err error) error {
	return errors.New(t.redactString(err.Error()))
}

func (t *Telegram) redactString(s string) string {
	if t.token == "" {
		return s
	}
	return strings.ReplaceAll(s, t.token, "<token>")
}

func roundDuration(d time.Duration) string {
	if d < time.Minute {
		return d.Round(time.Second).String()
	}
	return d.Round(time.Minute).String()
}

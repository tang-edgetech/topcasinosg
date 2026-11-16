#!/usr/bin/env bash
# Uptime watchdog: checks the public site, the backoffice and the API from
# outside the apps and posts to Telegram when one is down (5xx, no answer,
# or no answer within WATCHDOG_TIMEOUT), slow, or back up. It also reports
# new error lines in ~/logs/*.log (failed deploys and builds, the API failing
# to start...) and a deploy that seems stuck. Runs from cron every minute; it
# is separate from the API on purpose, so it still alerts when the API
# process is dead. Setup: docs/MONITORING.md.
#   watchdog.sh          check every target, then the logs (what cron runs)
#   watchdog.sh logs     check only the logs and the deploy
#   watchdog.sh test     send a sample alert and exit
#   watchdog.sh status   print the last known state of each target
#
# Settings are read from api/.env (only TELEGRAM_* and WATCHDOG_* lines), or
# from the file in WATCHDOG_ENV_FILE. Without TELEGRAM_BOT_TOKEN and
# TELEGRAM_CHAT_ID it still checks and logs, but sends nothing.
set -uo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${WATCHDOG_ENV_FILE:-$REPO_DIR/api/.env}"

# Reads only the monitoring keys, literally (values may contain & or ()).
load_settings() {
  local line key value
  [ -f "$1" ] || return 0
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%$'\r'}"
    case "$line" in ''|'#'*) continue ;; esac
    key="${line%%=*}"; key="${key//[[:space:]]/}"; key="${key#export}"
    case "$key" in TELEGRAM_*|WATCHDOG_*) ;; PORT) key=API_PORT ;; *) continue ;; esac
    # Settings already in the environment win over the file.
    [ -n "${!key:-}" ] && continue
    value="${line#*=}"
    if [[ "$value" =~ ^\'(.*)\'$ || "$value" =~ ^\"(.*)\"$ ]]; then value="${BASH_REMATCH[1]}"; fi
    export "$key=$value"
  done < "$1"
}
load_settings "$ENV_FILE"

TOKEN="${TELEGRAM_BOT_TOKEN:-}"
CHAT_ID="${TELEGRAM_CHAT_ID:-}"
THREAD_ID="${TELEGRAM_THREAD_ID:-}"
TG_API="${WATCHDOG_TELEGRAM_API:-https://api.telegram.org}"  # changed only by tests
LABEL="${WATCHDOG_LABEL:-TopCasinoSG}"
# One target per line or space: name|url|text the body must contain (optional).
# A 2xx-4xx answer counts as up (a login redirect or a Cloudflare challenge
# still means the server answered); 5xx, a timeout or no connection is down.
# The API is checked on its local port (PORT in api/.env), not through
# Cloudflare: from this server that round trip can hang although the API is fine.
TARGETS="${WATCHDOG_TARGETS:-web|https://topcasinosg.com.sg/ admin|https://backoffice.topcasinosg.com.sg/ api|http://127.0.0.1:${API_PORT:-8090}/health|\"status\":\"ok\"}"
# For the same reason the https targets are sent straight to this server's
# Apache (curl --resolve) instead of through Cloudflare: "auto" uses the
# server's first IP address, an address uses that, "off" goes through DNS
# (and Cloudflare) like a visitor. The certificate isn't checked on that path.
ORIGIN_IP="${WATCHDOG_ORIGIN_IP:-auto}"
if [ "$ORIGIN_IP" = auto ]; then ORIGIN_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"; fi
[ "$ORIGIN_IP" = off ] && ORIGIN_IP=""
TIMEOUT="${WATCHDOG_TIMEOUT:-20}"          # seconds before "loading forever" counts as down
SLOW="${WATCHDOG_SLOW_SECONDS:-8}"         # slower than this is reported as slow
FAILS_BEFORE_ALERT="${WATCHDOG_FAILS_BEFORE_ALERT:-2}"  # consecutive failed checks
REMIND_MINUTES="${WATCHDOG_REMIND_MINUTES:-30}"         # repeat "still down" this often
STATE_DIR="${WATCHDOG_STATE_DIR:-$HOME/logs/watchdog}"
mkdir -p "$STATE_DIR"

log() { echo "[$(date '+%F %T')] $*"; }
# HTML-escapes for Telegram (sed, since bash 5.2 treats & specially in ${x//a/b}).
esc() { printf '%s' "$1" | sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g'; }

# Posts one message. The token goes to curl through stdin, so it never
# appears in the process list or in this script's output.
send() {
  local text="$1"
  if [ -z "$TOKEN" ] || [ -z "$CHAT_ID" ]; then log "telegram off (no TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID), not sent"; return 0; fi
  # The text goes through a file so its bytes (emoji) reach curl untouched.
  local textf; textf="$(mktemp)"; printf '%s' "$text" > "$textf"
  local args=(--data-urlencode "chat_id=$CHAT_ID" --data-urlencode "text@$(command -v cygpath >/dev/null && cygpath -w "$textf" || echo "$textf")" -d parse_mode=HTML -d disable_web_page_preview=true)
  [ -n "$THREAD_ID" ] && args+=(-d "message_thread_id=$THREAD_ID")
  local code
  code="$(printf 'url = "%s/bot%s/sendMessage"\n' "$TG_API" "$TOKEN" |
    curl -sS -K - --max-time 15 -o /dev/null -w '%{http_code}' "${args[@]}" 2>&1)"
  rm -f "$textf"
  if [ "$code" != "200" ]; then log "telegram send failed (HTTP ${code//$TOKEN/<token>})"; return 1; fi
}

message() { # icon, title, details
  local host; host="$(hostname 2>/dev/null || echo server)"
  local text="$1 <b>$(esc "$LABEL")</b>
$(esc "$2")"
  [ -n "${3:-}" ] && text+="
<pre>$(esc "$3")</pre>"
  text+="
<i>watchdog on $(esc "$host") · $(date -u '+%F %T UTC')</i>"
  send "$text"
}

minutes() { echo $(( ($1 + 59) / 60 )); }

check_target() {
  local name="$1" url="$2" expect="${3:-}"
  local state="$STATE_DIR/$name.state"
  local status=up fails=0 since=0 last_alert=0 last_slow=0
  [ -f "$state" ] && read -r status fails since last_alert last_slow < "$state"
  local now; now="$(date +%s)"

  local body errf; body="$(mktemp)"; errf="$(mktemp)"
  local out code secs err via=()
  if [ -n "$ORIGIN_IP" ] && [[ "$url" =~ ^https://([^/:]+)/ ]]; then
    via=(--resolve "${BASH_REMATCH[1]}:443:$ORIGIN_IP" -k)
  fi
  out="$(curl -sS -o "$body" -w '%{http_code} %{time_total}' --max-time "$TIMEOUT" ${via[@]+"${via[@]}"} \
    -A "TopCasinoSG-Watchdog/1.0" -H "Cache-Control: no-cache" "$url" 2>"$errf")"
  code="${out%% *}"; secs="${out#* }"
  [ -n "$secs" ] && [ "$secs" != "$out" ] || secs=0
  err=""
  if [ "$code" = "000" ] || [ -z "$code" ]; then
    err="no answer within ${TIMEOUT}s or connection failed: $(head -c 300 "$errf")"
  elif [ "$code" -ge 500 ] 2>/dev/null; then
    err="HTTP $code"
  elif [ -n "$expect" ] && ! grep -qF -- "$expect" "$body"; then
    err="HTTP $code but the reply doesn't contain $expect"
  fi
  rm -f "$body" "$errf"
  local ms; ms="$(awk -v s="$secs" 'BEGIN{printf "%d", s*1000}' 2>/dev/null || echo 0)"

  if [ -n "$err" ]; then
    fails=$((fails + 1))
    [ "$status" = up ] && since="$now"
    log "$name DOWN ($fails): $err — $url"
    if [ "$fails" -ge "$FAILS_BEFORE_ALERT" ]; then
      if [ "$status" = up ]; then
        message "🔴" "$name is DOWN" "$url
$err
failed $fails checks in a row" && last_alert="$now"
      elif [ $((now - last_alert)) -ge $((REMIND_MINUTES * 60)) ]; then
        message "🔴" "$name is STILL DOWN ($(minutes $((now - since))) min)" "$url
$err" && last_alert="$now"
      fi
      status=down
    fi
  else
    if [ "$status" = down ]; then
      log "$name back UP after $(minutes $((now - since))) min (HTTP $code, ${ms} ms)"
      message "🟢" "$name is back UP after about $(minutes $((now - since))) min" "$url
HTTP $code in ${ms} ms"
    elif [ "$fails" -gt 0 ]; then
      log "$name recovered after $fails failed check(s) (HTTP $code)"
    fi
    status=up; fails=0; since=0
    if awk -v s="$secs" -v l="$SLOW" 'BEGIN{exit !(s > l)}'; then
      log "$name SLOW: ${ms} ms — $url"
      if [ $((now - last_slow)) -ge $((REMIND_MINUTES * 60)) ]; then
        message "🟠" "$name is SLOW: ${ms} ms" "$url
HTTP $code, limit ${SLOW}s" && last_slow="$now"
      fi
    fi
  fi
  echo "$status $fails $since $last_alert $last_slow" > "$state"
}

# --- Server logs -----------------------------------------------------------
# Every run reads only what was added to each LOG_DIR/*.log since the last run
# and posts one message listing new error lines: failed deploys and builds,
# the API failing to start, and anything else that logs an error. The first
# time a file is seen it starts from its end, so old history isn't sent.
LOG_DIR="${WATCHDOG_LOG_DIR:-$HOME/logs}"
# Not read: this script's own log (its problems are already alerts), and
# api-error.log, whose lines are also in api.log.
LOG_SKIP="${WATCHDOG_LOG_SKIP:-watchdog.log api-error.log}"
# A plain line is an error when it matches this (case-insensitive) ...
LOG_ERRORS="${WATCHDOG_LOG_ERRORS:-error|failed|fatal|panic|exception|cannot |could not|denied|timed out|out of memory|killed|segmentation fault|npm err|connection refused|unable to|no such file or directory|no space left}"
# ... and doesn't match this. Lines of Next.js' route table are never errors.
LOG_IGNORE="${WATCHDOG_LOG_IGNORE:-telegram off|^[[:space:]]*[├└┌│○ƒ●]|0 errors}"
LOG_MAX_BYTES=$((2 * 1024 * 1024))  # read at most this much new log per file per run
# A deploy still running after this many minutes is reported as stuck.
DEPLOY_MAX_MINUTES="${WATCHDOG_DEPLOY_MAX_MINUTES:-30}"

# Prints "signature<TAB>line" for each error line read from stdin. JSON lines
# (the API's own log) count only at level ERROR, and not the ones the API
# already sends to Telegram itself. The signature drops times and numbers,
# so the same error again is recognised as a repeat.
error_lines() {
  awk -v errors="$LOG_ERRORS" -v ignore="$LOG_IGNORE" '
    {
      line = $0; sub(/\r$/, "", line)
      if (line ~ /^[[:space:]]*\{/) {
        if (line !~ /"level":"ERROR"/) next
        msg = ""
        if (match(line, /"msg":"[^"]*"/)) msg = substr(line, RSTART + 7, RLENGTH - 8)
        if (msg == "panic" || msg == "server error" || msg == "hung request" || msg == "Database not answering") next
        err = ""
        if (match(line, /"error":"[^"]*"/)) err = substr(line, RSTART + 9, RLENGTH - 10)
        sig = msg " " err
      } else {
        low = tolower(line)
        if (low !~ errors || low ~ ignore) next
        sig = line
        sub(/^\[[^]]*\][[:space:]]*/, "", sig)            # [2026-11-16 06:30:18]
        sub(/^[0-9][0-9\/: .TZ-]+[[:space:]]/, "", sig)   # 2026/11/16 06:30:16
      }
      gsub(/[0-9]+/, "#", sig)
      if (length(line) > 300) line = substr(line, 1, 300) "…"
      print sig "\t" line
    }'
}

check_logs() {
  [ -d "$LOG_DIR" ] || return 0
  local sent="$STATE_DIR/log-alerts.state" now; now="$(date +%s)"
  local keep=$((REMIND_MINUTES * 60))
  touch "$sent"
  local report="" held=0 f name skip
  for f in "$LOG_DIR"/*.log; do
    [ -f "$f" ] || continue
    name="$(basename "$f")"
    skip=0; for s in $LOG_SKIP; do [ "$name" = "$s" ] && skip=1; done
    [ "$skip" = 1 ] && continue

    local offf="$STATE_DIR/log-$name.offset" size off=-1
    size="$(wc -c < "$f" | tr -d ' ')"
    [ -f "$offf" ] && read -r off < "$offf"
    [[ "$off" =~ ^[0-9]+$ ]] || off=-1
    if [ "$off" -lt 0 ]; then echo "$size" > "$offf"; continue; fi   # first time: start at the end
    [ "$size" -lt "$off" ] && off=0                                    # rotated or emptied
    [ "$size" = "$off" ] && continue
    local skipped=0
    if [ $((size - off)) -gt "$LOG_MAX_BYTES" ]; then skipped=$((size - LOG_MAX_BYTES - off)); off=$((size - LOG_MAX_BYTES)); fi

    # Only whole lines: a line still being written is read next time.
    local chunk rest
    chunk="$(tail -c +$((off + 1)) "$f" | head -c $((size - off)); printf x)"; chunk="${chunk%x}"
    rest="${chunk##*$'\n'}"
    [ "$rest" = "$chunk" ] && continue  # no complete line yet
    local whole=$(( $(printf '%s' "$chunk" | wc -c) - $(printf '%s' "$rest" | wc -c) ))
    echo $((off + whole)) > "$offf"

    local found new="" count=0 more=0 sig line
    found="$(printf '%s' "${chunk%"$rest"}" | error_lines)"
    [ -n "$found" ] || continue
    while IFS=$'\t' read -r sig line; do
      # Reported in the last REMIND_MINUTES (this run included): held back.
      if awk -F'\t' -v s="$sig" -v since=$((now - keep)) '$1 >= since && $2 == s { f = 1 } END { exit !f }' "$sent"; then
        held=$((held + 1)); continue
      fi
      printf '%s\t%s\n' "$now" "$sig" >> "$sent"
      count=$((count + 1))
      if [ "$count" -le 5 ]; then new+="$line"$'\n'; else more=$((more + 1)); fi
    done <<< "$found"
    [ "$count" -gt 0 ] || continue
    report+="$name: $count new error line(s)"
    [ "$skipped" -gt 0 ] && report+=" (log grew fast: skipped $skipped bytes)"
    report+=$'\n'"$new"
    [ "$more" -gt 0 ] && report+="… and $more more"$'\n'
    report+=$'\n'
  done
  # Forget what was sent before the hold-back window.
  awk -F'\t' -v since=$((now - keep)) '$1 >= since' "$sent" > "$sent.tmp" && mv "$sent.tmp" "$sent"

  if [ -n "$report" ]; then
    [ "$held" -gt 0 ] && report+="($held repeat(s) of errors already reported held back)"
    log "new errors in the logs: $(printf '%s' "$report" | grep -c 'new error line') file(s)"
    message "🟠" "Errors in the server logs ($LOG_DIR)" "${report:0:3500}"
  fi
}

# A deploy that runs far longer than a build takes is probably stuck (a
# hung npm or go build), and blocks every later deploy. Found by its process,
# not by taking its lock, so a deploy starting meanwhile is never skipped.
check_deploy() {
  local state="$STATE_DIR/deploy.state" since=0 alerted=0 now running=0 d
  now="$(date +%s)"
  [ -f "$state" ] && read -r since alerted < "$state"
  for d in /proc/[0-9]*; do
    if tr '\0' ' ' < "$d/cmdline" 2>/dev/null | grep -Eq "(^|/)bash .*deploy/cpanel/deploy\.sh"; then running=1; break; fi
  done
  if [ "$running" = 1 ]; then
    [ "$since" = 0 ] && since="$now"
    local mins=$(( (now - since) / 60 ))
    if [ "$mins" -ge "$DEPLOY_MAX_MINUTES" ] && [ $((now - alerted)) -ge $((REMIND_MINUTES * 60)) ]; then
      log "deploy running for $mins min"
      message "🟠" "Deploy still running after $mins min: it may be stuck" "Later deploys wait until it ends.
Last lines of deploy.log:
$(tail -n 8 "$LOG_DIR/deploy.log" 2>/dev/null)" && alerted="$now"
    fi
  else
    if [ "$alerted" != 0 ]; then
      log "deploy finished after $(minutes $((now - since))) min"
      message "🟢" "The long deploy has finished (about $(minutes $((now - since))) min)" "$(tail -n 3 "$LOG_DIR/deploy.log" 2>/dev/null)"
    fi
    since=0; alerted=0
  fi
  echo "$since $alerted" > "$state"
}

case "${1:-check}" in
  test)
    if [ -z "$TOKEN" ] || [ -z "$CHAT_ID" ]; then
      echo "Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in $ENV_FILE first."; exit 1
    fi
    message "🧪" "Test alert from the watchdog" "If you can read this, uptime alerts reach this group." &&
      echo "Test alert sent." || exit 1
    ;;
  status)
    for f in "$STATE_DIR"/*.state; do [ -f "$f" ] && echo "$(basename "$f" .state): $(cat "$f")"; done
    ;;
  check)
    # One run at a time: if the previous run is still waiting on timeouts,
    # this one just exits.
    exec 9>"$STATE_DIR/watchdog.lock"
    if command -v flock >/dev/null; then flock -n 9 || exit 0; fi
    for t in $TARGETS; do
      IFS='|' read -r name url expect <<< "$t"
      [ -n "$name" ] && [ -n "$url" ] && check_target "$name" "$url" "$expect"
    done
    check_logs
    check_deploy
    ;;
  logs)
    # Only the log and deploy checks (what "check" also does after the sites).
    exec 9>"$STATE_DIR/watchdog.lock"
    if command -v flock >/dev/null; then flock -n 9 || exit 0; fi
    check_logs
    check_deploy
    ;;
  *) echo "usage: $0 [check|logs|test|status]"; exit 2 ;;
esac

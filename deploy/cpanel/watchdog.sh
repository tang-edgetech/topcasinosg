#!/usr/bin/env bash
# Uptime watchdog: checks the public site, the backoffice and the API from
# outside the apps and posts to Telegram when one is down (5xx, no answer,
# or no answer within WATCHDOG_TIMEOUT), slow, or back up. Runs from cron
# every minute; it is separate from the API on purpose, so it still alerts
# when the API process is dead. Setup: docs/MONITORING.md.
#   watchdog.sh          check every target once (what cron runs)
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
    ;;
  *) echo "usage: $0 [check|test|status]"; exit 2 ;;
esac

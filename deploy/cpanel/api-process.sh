#!/usr/bin/env bash
# Starts, stops and keeps alive the Go API binary (api/bin/api) on cPanel,
# where it runs as a background process behind api/server.cjs.
#   api-process.sh start | stop | restart | ensure | status | test-alert
# "ensure" starts it only when it isn't running — cron runs it every minute.
# Settings come from api/.env (see deploy/cpanel/api.env.example).
set -uo pipefail

# -P: the real path (no symlinks), as /proc/<pid>/exe shows it in api_pids.
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
API_DIR="$REPO_DIR/api"
PID_FILE="$API_DIR/tmp/api.pid"
LOG_DIR="${LOG_DIR:-$HOME/logs}"
mkdir -p "$API_DIR/tmp" "$LOG_DIR"

log() { echo "[$(date '+%F %T')] $*"; }

# Exports each KEY=value line of an .env file as is. Read literally rather
# than sourced, so values like DB_DSN (with & and parentheses) need no
# quoting; matching surrounding quotes are dropped.
load_env() {
  local line key value
  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%$'\r'}"
    case "$line" in ''|'#'*) continue ;; esac
    key="${line%%=*}"; key="${key//[[:space:]]/}"; key="${key#export}"
    value="${line#*=}"
    if [[ "$value" =~ ^\'(.*)\'$ || "$value" =~ ^\"(.*)\"$ ]]; then value="${BASH_REMATCH[1]}"; fi
    export "$key=$value"
  done < "$1"
}

API_BIN="$API_DIR/bin/api"

# The API processes running from this folder, found by their binary rather
# than the PID file alone: a start that lost a race (two starters at once)
# can leave the PID file naming a dead process while another copy serves.
# After a deploy swaps the binary, a running one shows as "... (deleted)".
api_pids() {
  local d exe
  for d in /proc/[0-9]*; do
    exe="$(readlink "$d/exe" 2>/dev/null)" || continue
    if [ "$exe" = "$API_BIN" ] || [ "$exe" = "$API_BIN (deleted)" ]; then echo "${d#/proc/}"; fi
  done
}

# Running when the PID file's process is alive, or, if it isn't, when an API
# from this folder is running anyway: that one is adopted into the PID file.
running() {
  if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then return 0; fi
  local pid; pid="$(api_pids | head -n 1)"
  [ -n "$pid" ] || return 1
  echo "$pid" > "$PID_FILE"
  log "api found running untracked (pid $pid), now tracked"
}

start() {
  if running; then log "api already running (pid $(cat "$PID_FILE"))"; return 0; fi
  if [ ! -x "$API_BIN" ]; then log "api/bin/api missing — run deploy.sh --force first"; return 1; fi
  if [ ! -f "$API_DIR/.env" ]; then log "api/.env missing — copy deploy/cpanel/api.env.example"; return 1; fi
  (
    cd "$API_DIR" || exit 1
    load_env ./.env
    # 8>&-: the API mustn't inherit the lock below, or it would hold it.
    nohup ./bin/api >> "$LOG_DIR/api.log" 2>&1 8>&- &
    echo $! > "$PID_FILE"
  )
  sleep 2
  if running; then log "api started (pid $(cat "$PID_FILE"))"; else log "api failed to start — see $LOG_DIR/api.log"; return 1; fi
}

stop() {
  local pids; pids="$( { [ -f "$PID_FILE" ] && cat "$PID_FILE"; api_pids; } | sort -u)"
  rm -f "$PID_FILE"
  [ -n "$pids" ] || return 0
  # shellcheck disable=SC2086
  kill $pids 2>/dev/null
  for _ in $(seq 1 20); do
    local alive=0 pid
    for pid in $pids; do kill -0 "$pid" 2>/dev/null && alive=1; done
    [ "$alive" = 0 ] && break
    sleep 0.5
  done
  # shellcheck disable=SC2086
  kill -9 $pids 2>/dev/null || true
  log "api stopped (pid $(echo $pids))"
}

# api.log is the API's stdout, kept open by the process in append mode, so
# it is rotated by copying and emptying it in place (keeping api.log.1-3).
# api-error.log is rotated by the API itself.
rotate_api_log() {
  local f="$LOG_DIR/api.log" max=$((20 * 1024 * 1024))
  [ -f "$f" ] && [ "$(stat -c %s "$f" 2>/dev/null || echo 0)" -gt "$max" ] || return 0
  rm -f "$f.3"; [ -f "$f.2" ] && mv "$f.2" "$f.3"; [ -f "$f.1" ] && mv "$f.1" "$f.2"
  cp "$f" "$f.1" && : > "$f"
  log "api.log rotated"
}

# Sends one sample Telegram alert with the settings in api/.env.
test_alert() {
  ( cd "$API_DIR" && load_env ./.env && ./bin/api telegram-test )
}

# One at a time: the deploy's restart, the keep-alive cron and the proxy
# (api/server.cjs, when the API stops answering) can all call this at once,
# and two starts together leave one copy failing on the port.
case "${1:-}" in
  start|stop|restart|ensure)
    exec 8>"$API_DIR/tmp/api-process.lock"
    flock -w 60 8 || { log "api-process.sh: another run is still busy, skipping ${1}"; exit 0; }
    ;;
esac

case "${1:-}" in
  start) start ;;
  stop) stop ;;
  restart) stop; start ;;
  ensure) rotate_api_log; running || start ;;
  status) if running; then echo "running (pid $(cat "$PID_FILE"))"; else echo "stopped"; exit 1; fi ;;
  test-alert) test_alert ;;
  *) echo "usage: $0 start|stop|restart|ensure|status|test-alert"; exit 2 ;;
esac

#!/usr/bin/env bash
# Starts, stops and keeps alive the Go API binary (api/bin/api) on cPanel,
# where it runs as a background process behind api/server.cjs.
#   api-process.sh start | stop | restart | ensure | status
# "ensure" starts it only when it isn't running — cron runs it every minute.
# Settings come from api/.env (see deploy/cpanel/api.env.example).
set -uo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
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

running() {
  [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null
}

start() {
  if running; then log "api already running (pid $(cat "$PID_FILE"))"; return 0; fi
  if [ ! -x "$API_DIR/bin/api" ]; then log "api/bin/api missing — run deploy.sh --force first"; return 1; fi
  if [ ! -f "$API_DIR/.env" ]; then log "api/.env missing — copy deploy/cpanel/api.env.example"; return 1; fi
  (
    cd "$API_DIR" || exit 1
    load_env ./.env
    nohup ./bin/api >> "$LOG_DIR/api.log" 2>&1 &
    echo $! > "$PID_FILE"
  )
  sleep 2
  if running; then log "api started (pid $(cat "$PID_FILE"))"; else log "api failed to start — see $LOG_DIR/api.log"; return 1; fi
}

stop() {
  if ! running; then rm -f "$PID_FILE"; return 0; fi
  local pid; pid="$(cat "$PID_FILE")"
  kill "$pid" 2>/dev/null
  for _ in $(seq 1 20); do kill -0 "$pid" 2>/dev/null || break; sleep 0.5; done
  kill -9 "$pid" 2>/dev/null || true
  rm -f "$PID_FILE"
  log "api stopped (pid $pid)"
}

case "${1:-}" in
  start) start ;;
  stop) stop ;;
  restart) stop; start ;;
  ensure) running || start ;;
  status) if running; then echo "running (pid $(cat "$PID_FILE"))"; else echo "stopped"; exit 1; fi ;;
  *) echo "usage: $0 start|stop|restart|ensure|status"; exit 2 ;;
esac

#!/usr/bin/env bash
# Pull-and-redeploy for the cPanel server, run by cron every 10 minutes:
#   */10 * * * * /bin/bash /home/topcasinosg/apps/topcasinosg/deploy/cpanel/deploy.sh >> /home/topcasinosg/logs/deploy.log 2>&1
# Does nothing unless origin/$BRANCH has a new commit. Then it rebuilds only
# what changed (web, admin, api) and restarts those apps. --force rebuilds
# all three (first deploy, or after changing api/.env or production.env).
# Setup and settings: deploy/cpanel/README.md.
set -euo pipefail

# Everything runs inside main(): bash reads the whole function before running
# it, so the git reset below can safely rewrite this file mid-run.
main() {

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BRANCH="${BRANCH:-main}"
# Preferred Node.js major version (see find_node below for where it's looked up).
NODE_VERSION="${NODE_VERSION:-22}"
GO="${GO:-$HOME/go-sdk/bin/go}"
LOG_DIR="${LOG_DIR:-$HOME/logs}"
mkdir -p "$LOG_DIR"

log() { echo "[$(date '+%F %T')] $*"; }

# One deploy at a time: a cron run that starts while a build is still going
# just exits.
exec 9>"$LOG_DIR/deploy.lock"
flock -n 9 || exit 0

FORCE=0
[ "${1:-}" = "--force" ] && FORCE=1

cd "$REPO_DIR"
git fetch --quiet origin "$BRANCH"
OLD="$(git rev-parse HEAD)"
NEW="$(git rev-parse "origin/$BRANCH")"
if [ "$OLD" = "$NEW" ] && [ "$FORCE" = 0 ]; then exit 0; fi

log "deploying $(git log -1 --format='%h %s' "$NEW") (was ${OLD:0:7})"
# The server copy is never edited by hand. Ignored files (api/.env,
# api/uploads, api/bin, node_modules, .next) are untouched by the reset.
git reset --hard --quiet "$NEW"
git fetch --quiet --tags origin

# Paths are from the repo root. -C matters: build_next calls this from inside
# an app folder, where git would read "admin/package.json" as
# admin/admin/package.json and never see a change.
changed() {
  [ "$FORCE" = 1 ] && return 0
  git -C "$REPO_DIR" diff --quiet "$OLD" "$NEW" -- "$@" && return 1 || return 0
}

# Public settings baked into both frontends at build time.
set -a; . "$REPO_DIR/deploy/cpanel/production.env"; set +a

restart_node_app() {
  local app_root="$1"
  mkdir -p "$app_root/tmp"
  touch "$app_root/tmp/restart.txt"
}

# Node.js for building an app. Two cPanel setups are supported:
# - CloudLinux "Setup Node.js App": a per-app environment in ~/nodevenv
#   (prints "venv <activate script>");
# - cPanel's Application Manager: the server's EasyApache Node.js in
#   /opt/cpanel/ea-nodejsNN (prints "path <bin dir>").
find_node() {
  local app_root="$1"
  local venv_dir="$HOME/nodevenv/${app_root#"$HOME"/}"
  if [ -f "$venv_dir/$NODE_VERSION/bin/activate" ]; then echo "venv $venv_dir/$NODE_VERSION/bin/activate"; return; fi
  # Not on NODE_VERSION: the version the app was created with, if only one.
  local found=("$venv_dir"/*/bin/activate)
  if [ "${#found[@]}" = 1 ] && [ -f "${found[0]}" ]; then echo "venv ${found[0]}"; return; fi
  if [ -x "/opt/cpanel/ea-nodejs$NODE_VERSION/bin/node" ]; then echo "path /opt/cpanel/ea-nodejs$NODE_VERSION/bin"; return; fi
  local newest
  newest="$(ls -d /opt/cpanel/ea-nodejs*/bin 2>/dev/null | sort -V | tail -n 1)"
  if [ -n "$newest" ] && [ -x "$newest/node" ]; then echo "path $newest"; return; fi
}

build_next() {
  local app="$1" app_root="$REPO_DIR/$1"
  local node
  node="$(find_node "$app_root")"
  if [ -z "$node" ]; then
    log "$app: no Node.js found — install ea-nodejs22 in WHM (EasyApache 4) or create the Node.js app in cPanel; see deploy/cpanel/README.md"
    return 1
  fi
  log "$app: building with ${node#* }"
  (
    case "$node" in
      # shellcheck disable=SC1090
      venv\ *) . "${node#venv }" ;;
      path\ *) export PATH="${node#path }:$PATH" ;;
    esac
    cd "$app_root"
    # Install whenever node_modules wasn't installed from this exact lockfile
    # (stamp written after a successful install), not only when this deploy
    # changed it — so a deploy after a failed or skipped install catches up.
    if changed "$app/package.json" "$app/package-lock.json" || [ ! -d node_modules/next ] \
      || ! cmp -s package-lock.json node_modules/.deploy-package-lock.json; then
      npm install --include=dev --no-audit --no-fund
      cp package-lock.json node_modules/.deploy-package-lock.json
    fi
    # Keep the last good build so a failed build doesn't take the site down.
    rm -rf .next.prev
    [ -d .next ] && cp -a .next .next.prev
    if ! NODE_ENV=production npx next build; then
      rm -rf .next
      [ -d .next.prev ] && mv .next.prev .next
      exit 1
    fi
  ) || { log "$app: build FAILED — still serving the previous build"; return 1; }
  restart_node_app "$app_root"
  log "$app: restarted"
}

build_api() {
  log "api: building"
  if ! (cd "$REPO_DIR/api" && mkdir -p bin && "$GO" build -o bin/api.new ./cmd/api); then
    log "api: build FAILED — still running the previous binary"
    return 1
  fi
  mv "$REPO_DIR/api/bin/api.new" "$REPO_DIR/api/bin/api"
  # 9>&-: the API keeps running after this script, and would otherwise
  # inherit the lock and block every later deploy.
  bash "$REPO_DIR/deploy/cpanel/api-process.sh" restart 9>&-
}

STATUS=0
if changed api; then build_api || STATUS=1; fi
if changed web shared deploy/cpanel; then build_next web || STATUS=1; fi
if changed admin shared deploy/cpanel VERSION; then build_next admin || STATUS=1; fi
# The proxy in front of the API only needs a restart when it changes.
if changed api/server.cjs; then restart_node_app "$REPO_DIR/api"; fi

if [ "$STATUS" = 0 ]; then log "done"; else log "finished with errors"; fi
return "$STATUS"
}

main "$@"
exit $?

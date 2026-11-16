#!/usr/bin/env bash
# Read-only health check for the cPanel server: load, the API, HTTPS on this
# server (what Cloudflare connects to), the server reaching Cloudflare, and
# recent errors. Changes nothing and prints no secrets. For 52x errors and
# "the site keeps going down":
#   bash deploy/cpanel/diagnose.sh 2>&1 | tee ~/diagnose.txt
APP="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DOMAINS="topcasinosg.com.sg backoffice.topcasinosg.com.sg backapi.topcasinosg.com.sg"
PORT="$(sed -n -E "s/^[[:space:]]*PORT[[:space:]]*=[[:space:]]*['\"]?([0-9]+).*/\1/p" "$APP/api/.env" 2>/dev/null | tail -n 1)"
MYIP="$(hostname -I 2>/dev/null | awk '{print $1}')"
h() { printf '\n===== %s =====\n' "$*"; }
t() { curl -s -o /dev/null -w '%{http_code} in %{time_total}s' -m "${2:-15}" "${@:3}" "$1" 2>/dev/null || true; }

h "1. Server load"
date -u; uptime; echo "CPUs: $(nproc 2>/dev/null)"
free -m
df -h "$HOME" /tmp 2>/dev/null
echo "My processes: $(ps -u "$USER" --no-headers 2>/dev/null | wc -l) (process limit: $(ulimit -u))"

h "2. Busiest processes of this account"
ps -u "$USER" -o pid,etime,pcpu,pmem,rss,args --sort=-pcpu 2>/dev/null | cut -c1-150 | head -12

h "3. API on this server"
bash "$APP/deploy/cpanel/api-process.sh" status
echo "health on 127.0.0.1:${PORT:-?}: $(t "http://127.0.0.1:${PORT:-8090}/health" 5)"

h "4. HTTPS on this server, as Cloudflare connects to it (server IP $MYIP)"
for d in $DOMAINS; do
  for ip in 127.0.0.1 $MYIP; do
    echo "$d via $ip: $(t "https://$d/" 20 -k --resolve "$d:443:$ip")"
  done
  echo | openssl s_client -connect "${MYIP:-127.0.0.1}:443" -servername "$d" 2>/dev/null |
    openssl x509 -noout -issuer -enddate -ext subjectAltName 2>/dev/null | sed 's/^/    /' | tr -s ' '
done

h "5. Ten quick hits on the main site, on this server (looking for stalls)"
for i in $(seq 1 10); do printf '%s  ' "$(t "https://topcasinosg.com.sg/" 20 -k --resolve "topcasinosg.com.sg:443:${MYIP:-127.0.0.1}")"; sleep 1; done; echo

h "6. This server reaching Cloudflare (out)"
echo "cloudflare.com trace: $(t https://www.cloudflare.com/cdn-cgi/trace 10)"
echo "1.1.1.1:             $(t https://1.1.1.1/ 10)"
for d in $DOMAINS; do echo "$d via Cloudflare: $(t "https://$d/" 15)"; done

h "7. Firewall"
[ -d /etc/csf ] && echo "CSF firewall is installed (only root/WHM can see its blocks)" || echo "no CSF found"

h "8. Recent API problems (~/logs/api-error.log)"
grep -v '"api started"' "$HOME/logs/api-error.log" 2>/dev/null | tail -n 10 | cut -c1-220

h "9. Last deploys and watchdog"
grep -E '\] (deploying|web: |admin: |api: |done|finished)' "$HOME/logs/deploy.log" 2>/dev/null | tail -n 6
for f in "$HOME"/logs/watchdog/*.state; do [ -f "$f" ] && echo "$(basename "$f" .state): $(cut -d' ' -f1-2 "$f")"; done
echo; echo "Done."

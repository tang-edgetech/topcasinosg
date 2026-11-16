# Server alerts and error logs

When the public site, the backoffice or the API breaks, a message arrives in a
Telegram group within a minute or two. Errors are also written to log files on
the server so you can see what happened afterwards.

## What is watched, and by what

| Problem | Caught by | Message |
| --- | --- | --- |
| API crash inside a request (a Go panic) | the API itself | 🔴 `Panic: GET /api/...` with where it broke |
| API answers with an error (HTTP 500–599) | the API itself | 🔴 `HTTP 500: GET /api/...` |
| API request slower than 5 s | the API itself | 🔴 `Slow request (7.2s): ...` |
| API request still running after 30 s ("loading forever") | the API itself, while it is still stuck | 🔴 `Request still running after 31s: ...` |
| Database not answering | the API itself (checks every minute) | 🔴 `Database not answering`, then 🟢 when it's back |
| API restarted (after a deploy, or after a crash) | the API itself | 🟢 `API started` |
| Site, backoffice or API **down**: error page (5xx), no answer, or no answer within 20 s | the watchdog (cron, every minute) | 🔴 `web is DOWN`, a reminder every 30 min, 🟢 `back UP` |
| Site, backoffice or API slow (over 8 s) | the watchdog | 🟠 `admin is SLOW` |
| New error lines in `~/logs/*.log`: a failed deploy or build (`build FAILED`, `finished with errors`), the API failing to start (`api failed to start`, `server stopped … address already in use`), npm or Go errors | the watchdog | 🟠 `Errors in the server logs`, with the lines, grouped by file |
| A deploy still running after 30 min (a stuck build blocks every later deploy) | the watchdog | 🟠 `Deploy still running after 31 min`, then 🟢 when it ends |
| A deploy finished | the watchdog, from `deploy-result.txt` | 🟢 `Deployed v1.0.45 (abc1234)` with the commit title, the previous commit, what was rebuilt, and whether the API now reports that commit; 🔴 `Deploy of v1.0.45 (abc1234) finished with errors` with the parts that failed (they keep serving the previous build) |
| The whole server is off | a hosted uptime monitor (optional, see the end) | from that service |

The API's own alerts can't fire when the API process is dead, so the watchdog
is a separate script run by cron. It asks this server's Apache for the site and
the backoffice by their domain names, so it also notices Apache, Passenger and
the Next.js apps failing, and it checks the API on its local port. It doesn't
go out through Cloudflare and back: from this server that round trip can hang
(November 2026: 30 s timeouts to `backapi.` while the API answered in 15 ms),
which would raise false alarms. Problems with Cloudflare itself, or with the
server's network, are what the outside monitor in step 7 is for.

**No spam.** The same problem is sent once, then held back for 10 minutes; if
it kept happening you get one "Repeated 37 more times" follow-up. The API sends
at most 30 messages an hour in total. The watchdog alerts after 2 failed checks
in a row (so a single blip is ignored), then reminds every 30 minutes until the
site is back.

**Log errors.** Each minute the watchdog reads only what was added to each log
since its last run, so old history is never sent (it starts at the end of a
file the first time it sees it). It skips its own `watchdog.log`, and
`api-error.log`, whose lines are also in `api.log`. In the API's JSON lines it
only counts level `ERROR`, and not the panics, 5xx, stuck requests and
database outages the API has already sent itself. The same error again (times
and numbers aside) is held back for 30 minutes, so an API that fails to start
every minute gives one message, not one a minute. Up to 5 lines per file are
shown; check `tail -n 50 ~/logs/<file>` for the rest.

**Which version is live.** Every deploy ends by writing `~/logs/deploy-result.txt`
(result, commit, release, what was rebuilt or failed), and the watchdog posts it
once. The release is the commit's CI tag (`v1.0.45`), or before CI has tagged
it, the last tag plus the commit (`v1.0.44-2-gb110136`). The API is built with
the same release and commit, so `curl -s http://127.0.0.1:<PORT>/health` and its
🟢 `API started` message show exactly what is running. Every other 🟢 message
ends with `Live: v1.0.45 (abc1234) <title>`.

## Log files (on the server, in `~/logs/`)

| File | What's in it |
| --- | --- |
| `api-error.log` | One JSON line per problem: panics (with the full stack), 5xx responses, slow and hung requests, database outages, API starts. Rotated by the API at 10 MB, keeping `api-error.log.1` … `.5`. |
| `api.log` | Everything the API prints, including the lines above. Rotated at 20 MB (keeps `.1`–`.3`). |
| `watchdog.log` | One line per failed or slow check, and recoveries. |
| `deploy.log`, `api-process.log` | Deploys, and API starts/stops. Errors in them are sent by the watchdog. |
| `deploy-result.txt` | How the last deploy ended (overwritten each time); the watchdog posts each new one. |

Look at the latest problems: `tail -n 50 ~/logs/api-error.log`.

---

## Setup (once)

### 1. Create the bot

1. In Telegram, open a chat with **@BotFather** (the blue tick one).
2. Send `/newbot`. Give it a name (e.g. *TopCasinoSG Alerts*) and a username
   ending in `bot` (e.g. `topcasinosg_alerts_bot`).
3. BotFather replies with a **token** like `123456789:AAH...`. This is a
   password: don't paste it in chats, tickets or the Git repo. It goes only in
   `api/.env` on the server (step 4).

### 2. Add the bot to the group

1. Create the group for server alerts (or open the existing one).
2. Group name → **Add members** → search the bot's username → add it.
3. Send any message in the group, e.g. `hello bot`, so the bot has something
   to see in the next step.

Bots in groups only see messages addressed to them by default; that's fine,
the bot only needs to *send*.

### 3. Get the group's chat id

Open this address in a browser, with your token in place of `<TOKEN>`:

```
https://api.telegram.org/bot<TOKEN>/getUpdates
```

Find `"chat":{"id":-100…` in the reply. The number, including the minus sign
(e.g. `-1001234567890`), is the chat id.

- If the reply is `{"ok":true,"result":[]}`, send another message in the
  group and reload.
- If the group was later upgraded to a "supergroup" the id changes; the
  old one gets an error mentioning `migrate_to_chat_id` — use that new id.
- Optional: in a group with **Topics** turned on, a topic's id is the number
  at the end of a link to a message in it; put it in `TELEGRAM_THREAD_ID` to
  post only in that topic.

### 4. Put the settings on the server

In cPanel → Terminal (as the `topcasinosg` user), edit `api/.env`:

```bash
nano /home/topcasinosg/public_html/topcasinosg.com.sg/api/.env
```

Add (or fill in) these lines:

```
TELEGRAM_BOT_TOKEN=123456789:AAH...your token...
TELEGRAM_CHAT_ID=-1001234567890
```

Save, then restart the API so it reads them:

```bash
bash /home/topcasinosg/public_html/topcasinosg.com.sg/deploy/cpanel/api-process.sh restart
```

Without these two lines everything still runs and logs; it just sends no
messages.

### 5. Send test alerts

```bash
bash /home/topcasinosg/public_html/topcasinosg.com.sg/deploy/cpanel/api-process.sh test-alert
bash /home/topcasinosg/public_html/topcasinosg.com.sg/deploy/cpanel/watchdog.sh test
```

Each prints `Test alert sent.` and a 🧪 message appears in the group. If not,
the error says why: `chat not found` = wrong chat id or the bot isn't in the
group; `Unauthorized` = wrong token. A 🟢 `API started` message also arrives
after the restart in step 4.

### 6. Turn on the watchdog

cPanel → **Cron Jobs → Add New Cron Job**, every minute (`* * * * *`):

```
/bin/bash /home/topcasinosg/public_html/topcasinosg.com.sg/deploy/cpanel/watchdog.sh >> /home/topcasinosg/logs/watchdog.log 2>&1
```

See what it last saw: `bash /home/topcasinosg/public_html/topcasinosg.com.sg/deploy/cpanel/watchdog.sh status`.

The same cron job also checks the logs and the deploy. To run only that part
by hand: `bash /home/topcasinosg/public_html/topcasinosg.com.sg/deploy/cpanel/watchdog.sh logs`.

### 7. Optional, recommended: an outside monitor

The watchdog runs on the same server, so if the whole server or its network
goes down, nothing on it can send a message. A free hosted monitor covers
that. **UptimeRobot** (free plan, checks every 5 minutes) can post straight to
Telegram:

1. Sign up at uptimerobot.com → **Integrations → Telegram** → follow its
   link to add *its* bot to the same group.
2. **Add New Monitor** → HTTP(s), one each for
   `https://topcasinosg.com.sg/`, `https://backoffice.topcasinosg.com.sg/`
   and `https://backapi.topcasinosg.com.sg/health` (for this one, use the
   *Keyword* type with keyword `"status":"ok"`).
3. Tick the Telegram contact on each monitor.

(Better Stack and similar services work the same way.)

---

## Settings

All optional except the first two. They go in `api/.env`; the watchdog reads
only the `TELEGRAM_*` and `WATCHDOG_*` lines from it.

| Setting | Default | Meaning |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | empty (off) | Token from BotFather. |
| `TELEGRAM_CHAT_ID` | empty (off) | The group's id (step 3). |
| `TELEGRAM_THREAD_ID` | empty | Topic id, for groups with Topics. |
| `ALERT_LABEL` | `TopCasinoSG API (production)` | First line of the API's messages — e.g. tell staging from live. |
| `ALERT_COOLDOWN_MINUTES` | `10` | How long the same problem stays quiet after being sent. |
| `SLOW_REQUEST_MS` | `5000` | An API request slower than this is reported. `0` turns it off. |
| `HUNG_REQUEST_SECONDS` | `30` | An API request still running after this is reported while stuck. `0` turns it off. |
| `SLOW_REQUEST_IGNORE` | export, import and HTML-export routes | Comma-separated path starts that are allowed to be slow. |
| `ERROR_LOG_FILE` | `~/logs/api-error.log` | Where the API writes its JSON error log. |
| `ERROR_LOG_MAX_MB` / `ERROR_LOG_BACKUPS` | `10` / `5` | Rotation size and how many old files to keep. |
| `WATCHDOG_TARGETS` | the site and backoffice domains, and the API at `127.0.0.1:<PORT>` | Space-separated `name\|url\|text-the-page-must-contain` (the text is optional). |
| `WATCHDOG_ORIGIN_IP` | `auto` (the server's first IP) | Where `https://` targets are sent instead of through DNS and Cloudflare. An IP address, `auto`, or `off` to check like a visitor. |
| `WATCHDOG_TIMEOUT` | `20` | Seconds to wait before a page counts as down. |
| `WATCHDOG_SLOW_SECONDS` | `8` | Slower than this is reported as slow. |
| `WATCHDOG_FAILS_BEFORE_ALERT` | `2` | Failed checks in a row before the DOWN message. |
| `WATCHDOG_REMIND_MINUTES` | `30` | How often "still down" / "slow" repeat. |
| `WATCHDOG_LABEL` | `TopCasinoSG` | First line of the watchdog's messages. |
| `WATCHDOG_LOG_DIR` | `~/logs` | The folder whose `*.log` files are checked for errors. |
| `WATCHDOG_LOG_SKIP` | `watchdog.log api-error.log` | Space-separated log files not to check. |
| `WATCHDOG_LOG_ERRORS` | `error\|failed\|fatal\|panic\|…` | What makes a plain line an error (a case-insensitive extended regex). |
| `WATCHDOG_LOG_IGNORE` | `telegram off\|…` | Lines matching this are never errors (regex, as above), e.g. to silence a known harmless message. |
| `WATCHDOG_DEPLOY_MAX_MINUTES` | `30` | A deploy running longer than this is reported as stuck. |

After changing an API setting, run `api-process.sh restart`. Watchdog
settings apply on its next run.

Locally (no `api/.env`), set them in your shell before `go run ./cmd/api`, or
test the bot with `TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=... go run ./cmd/api telegram-test`.

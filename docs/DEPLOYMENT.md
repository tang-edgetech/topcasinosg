# Deployment Setup Guide — WHM / cPanel + GitHub Actions

Status: **plan, not yet implemented.** Section 8 lists the code changes still needed
before the first deploy.

How TopCasinoSG goes from a push on GitHub to a running site on a WHM server:
staging on a subdomain first, the main domain later.

---

## 1. Requirements

| Item | Requirement |
|---|---|
| Server | **WHM with root access** (VPS or dedicated). A plain shared cPanel account can't keep the Go API running as a long-lived process. |
| SSH | Root or a sudo-capable user for the one-time setup, plus a dedicated deploy user for GitHub. |
| Node.js | 22 LTS (Next.js 16 needs ≥ 20.9). Install through WHM → EasyApache 4 → Node.js, or with nvm. |
| Go | Not needed on the server — GitHub Actions builds a Linux binary. |
| MySQL / MariaDB | The one bundled with WHM. Databases must be `utf8mb4`. |
| SSL | cPanel AutoSSL (free) on every subdomain. |

The system runs as **3 long-lived processes** per environment:

| Process | What | Built from |
|---|---|---|
| `api` | Go binary — JSON API, migrations, `/uploads/` | `api/` |
| `web` | Next.js public site | `web/` |
| `admin` | Next.js admin CMS | `admin/` |

---

## 2. Domains, databases, ports

| | Staging | Production |
|---|---|---|
| Public site (frontend) | `staging.topcasinosg.com.sg` | `topcasinosg.com.sg` (+ `www`) |
| Back office (admin) | `staging-backoffice.topcasinosg.com.sg` | `backoffice.topcasinosg.com.sg` |
| API | `staging-api.topcasinosg.com.sg` | `api.topcasinosg.com.sg` |
| Database | `<cpuser>_tcsg_staging` | `<cpuser>_tcsg_live` |
| Ports (localhost only) | web 4100 · admin 4101 · api 8190 | web 4000 · admin 4001 · api 8090 |
| Cookie prefix | `stg_` | none |

Staging and production never share a database, an uploads folder, secrets or ports.

- Every name is **one level** under `topcasinosg.com.sg` (`staging-backoffice`, not
  `backoffice.staging`), so Cloudflare's free certificate (`*.topcasinosg.com.sg`) covers it.
- Both environments share the cookie domain `.topcasinosg.com.sg`; the **cookie prefix**
  keeps a staging login from overwriting a live one in the same browser.
- Content moves between environments with **Back office → Export / Import** (local → staging
  → live), not by copying databases. See §9.

---

## 3. Release flow

```
push to main
  └─ GitHub Actions
       1. checks: go vet, go build, next build (admin + web)
       2. version: next tag v1.0.N is created (see §7)
       3. build staging artifacts (API URL baked into the Next builds)
       4. rsync to server → releases/<version>/
       5. mysqldump staging DB → backups/
       6. point "current" at the new release, restart the 3 services
       7. health check /health + both homepages
            └─ failed → point "current" back to the previous release, restart, mark run failed

"Deploy to production" (manual button, needs approval)
  └─ same steps for the chosen version, using the production env and folders
```

Production is **promoted, not auto-deployed**, so an unfinished push never reaches real
visitors. Approval is enforced with a GitHub Environment named `production`.

---

## 4. Server folder layout

```
/home/<cpuser>/apps/
├── staging/
│   ├── releases/
│   │   ├── v1.0.56/      api/bin/api · web/ (standalone) · admin/ (standalone)
│   │   └── v1.0.57/
│   ├── current -> releases/v1.0.57
│   ├── shared/
│   │   ├── api.env       secrets (never in Git)
│   │   └── uploads/      media, survives deploys
│   └── backups/          DB dump taken before every deploy
└── production/           same structure
```

Keep the last 5 releases. Rolling back means pointing `current` at an older release and
restarting. Migrations are additive, so older code still runs on the newer schema.

---

## 5. One-time server setup

### 5.1 Subdomains + SSL
cPanel → **Domains**: create the three staging subdomains. cPanel → **SSL/TLS Status** →
run AutoSSL.

### 5.2 Database
cPanel → **MySQL Databases**: create the database and a user with ALL PRIVILEGES on it.
Then set the database to utf8mb4:
```sql
ALTER DATABASE <cpuser>_tcsg_staging CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
The API applies migrations itself on every start.

> **Empty database, then import.** An empty database migrates cleanly, but it only gets the
> structure, the regions, menus and the shared region-template pages. To fill staging with
> real content: local back office → **Export / Import → Export → Whole backoffice**, then
> staging back office → **Import** that zip with **Replace everything**. Uploaded files travel
> inside the zip. Users are never copied — create the first staging user at `/setup`, as in §9 step 4.
>
> All times are stored in **UTC**: the API forces its MySQL session to UTC, so the server's
> own time zone doesn't matter. The admin and site convert to the viewer's local time.

### 5.3 Secrets file — `shared/api.env`
```
APP_ENV=production
PORT=8190
DB_DSN=<dbuser>:<dbpass>@tcp(127.0.0.1:3306)/<cpuser>_tcsg_staging?parseTime=true&multiStatements=true&charset=utf8mb4
JWT_SECRET=<64 random chars>
OTP_ENCRYPTION_KEY=<exactly 32 chars>
CORS_ALLOWED_ORIGINS=https://staging.topcasinosg.com.sg,https://staging-backoffice.topcasinosg.com.sg
COOKIE_DOMAIN=.topcasinosg.com.sg
COOKIE_PREFIX=stg_
UPLOAD_DIR=/home/<cpuser>/apps/staging/shared/uploads
```
Build-time values for the Next apps (baked in by GitHub Actions, §8):

| App | Staging | Production |
|---|---|---|
| web | `NEXT_PUBLIC_API_URL=https://staging-api.topcasinosg.com.sg` | `NEXT_PUBLIC_API_URL=https://api.topcasinosg.com.sg` |
| admin | same API URL · `NEXT_PUBLIC_WEB_URL=https://staging.topcasinosg.com.sg` · `NEXT_PUBLIC_COOKIE_PREFIX=stg_` | same API URL · `NEXT_PUBLIC_WEB_URL=https://topcasinosg.com.sg` · no prefix |

- Staging uses `APP_ENV=production` too: that turns on Secure cookies and 2FA enforcement.
- Generate secrets with `openssl rand -base64 48`, and use different values per environment.
- `chmod 600 api.env`.

### 5.4 systemd services (one per process, per environment)
`/etc/systemd/system/tcsg-staging-api.service`
```ini
[Unit]
Description=TopCasinoSG staging API
After=network.target mysql.service

[Service]
User=<cpuser>
WorkingDirectory=/home/<cpuser>/apps/staging/current/api
EnvironmentFile=/home/<cpuser>/apps/staging/shared/api.env
ExecStart=/home/<cpuser>/apps/staging/current/api/bin/api
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```
`tcsg-staging-web.service` / `tcsg-staging-admin.service` are the same, except:
```ini
WorkingDirectory=/home/<cpuser>/apps/staging/current/web
Environment=PORT=4100 HOSTNAME=127.0.0.1 NODE_ENV=production
ExecStart=/usr/bin/node server.js
```
Enable them: `systemctl daemon-reload && systemctl enable --now tcsg-staging-api tcsg-staging-web tcsg-staging-admin`.

Let the deploy user restart only these services (`visudo -f /etc/sudoers.d/tcsg-deploy`):
```
<cpuser> ALL=(root) NOPASSWD: /bin/systemctl restart tcsg-staging-*, /bin/systemctl restart tcsg-production-*
```

### 5.5 Apache reverse proxy (per subdomain)
WHM keeps custom vhost includes under `userdata`. For `staging.topcasinosg.com.sg`:
```
/etc/apache2/conf.d/userdata/ssl/2_4/<cpuser>/staging.topcasinosg.com.sg/proxy.conf
/etc/apache2/conf.d/userdata/std/2_4/<cpuser>/staging.topcasinosg.com.sg/proxy.conf
```
```apache
ProxyPreserveHost On
ProxyPass        /.well-known !
ProxyPass        / http://127.0.0.1:4100/
ProxyPassReverse / http://127.0.0.1:4100/
RequestHeader set X-Forwarded-Proto "https"
```
Repeat for `staging-backoffice` (4101) and `staging-api` (8190). Then apply:
```
/scripts/rebuildhttpdconf && /scripts/restartsrv_httpd
```
The `/.well-known` exclusion keeps AutoSSL renewals working.

### 5.6 Keep staging private
- On `staging` and `staging-backoffice`: cPanel → **Directory Privacy**, or an
  `AuthType Basic` block in the same `proxy.conf`.
- Global Settings → `noindex, nofollow` on.

### 5.7 Deploy key
On the server, as `<cpuser>`:
```
ssh-keygen -t ed25519 -f ~/.ssh/tcsg_deploy -N ""
cat ~/.ssh/tcsg_deploy.pub >> ~/.ssh/authorized_keys
```
Copy the **private** key into GitHub Secrets (§6), then delete it from the server.

---

## 6. GitHub settings

**Settings → Secrets and variables → Actions**

| Secret | Value |
|---|---|
| `DEPLOY_HOST` | server hostname or IP |
| `DEPLOY_USER` | `<cpuser>` |
| `DEPLOY_SSH_KEY` | private deploy key |
| `DEPLOY_PORT` | SSH port (often 22, sometimes custom) |

Database passwords and JWT secrets do **not** go in GitHub — they live only in `shared/api.env`.

**Settings → Environments**
- `staging` — no approval.
- `production` — required reviewer: the project owner.

**Settings → Branches → protect `main`**
Require a pull request and passing checks. No force-push.

---

## 7. Versioning

Format **`vMAJOR.MINOR.PATCH`**, starting at `v1.0.0`. **Already implemented.**

- `.github/workflows/version-tag.yml` runs on every push to `main` and creates the next Git
  tag: `v1.0.0 → v1.0.1 → v1.0.2`. A push with several commits counts once.
- MINOR or MAJOR changes when the `VERSION` file at the repo root is edited (e.g. `1.0` →
  `1.1`). The next push becomes `v1.1.0`, and PATCH counts up from there.
- **Admin build:** `admin/next.config.ts` reads `APP_VERSION`, `APP_COMMIT` and
  `APP_BUILD_DATE` from the environment. Without them (local dev) it shows the latest tag of
  the `VERSION` series plus `-dev`, e.g. `v1.0.57-dev`.
- **API build:** stamp it with
  `go build -ldflags "-X github.com/tang-edgetech/topcasinosg/api/internal/version.Version=$TAG -X github.com/tang-edgetech/topcasinosg/api/internal/version.Commit=$SHA -X github.com/tang-edgetech/topcasinosg/api/internal/version.BuildDate=$DATE"`.
  `/health` reports `version`, `commit` and `buildDate`.
- **Where it shows:** under the login card and at the bottom of the admin sidebar
  (`v1.0.3 · 23 Oct 2026`; hover for commit and API version). If the API runs a different
  release than the admin build, the API version is shown next to it (a half-finished deploy).
- The deploy workflow (§3) must run after the tag exists and pass the tag as `APP_VERSION`.

---

## 8. Code changes required before the first deploy

1. **Fail fast on missing secrets.** `api/internal/config/config.go` currently falls back
   to dev secrets when an env var is missing. With `APP_ENV=production`, it must refuse to
   start unless `DB_DSN`, `JWT_SECRET`, `OTP_ENCRYPTION_KEY` and `CORS_ALLOWED_ORIGINS` are set.
2. **Environment-specific cookie names** — done: `COOKIE_PREFIX` (API) and
   `NEXT_PUBLIC_COOKIE_PREFIX` (admin build) must match; `stg_` on staging, empty on live.
3. **Next.js standalone output.** Add `output: "standalone"` to both `next.config.ts`
   files, so a deploy ships `server.js` plus only the needed modules (copy `public/` and
   `.next/static/` alongside).
4. **Build-time values.** `NEXT_PUBLIC_API_URL` (plus `NEXT_PUBLIC_WEB_URL` and
   `NEXT_PUBLIC_COOKIE_PREFIX` in admin) are baked in at build time, so Actions builds once for
   staging and once for production (values in §5.3).
5. **Version plumbing** (§7) — done, except passing the tag into the deploy builds.
6. **Repo files:** `.github/workflows/ci-deploy.yml`, `deploy/remote-deploy.sh`,
   `deploy/systemd/*.service`, `deploy/apache/*.conf` templates.

---

## 9. Going live on the main domain

1. In cPanel, point the main domain + `www` at the server and create the `backoffice.` and
   `api.` subdomains, then run AutoSSL (or install the Cloudflare origin certificate).
2. Create the production database, `apps/production/shared/api.env` (new secrets,
   ports 4000/4001/8090, `COOKIE_DOMAIN=.topcasinosg.com.sg`, **no** `COOKIE_PREFIX`,
   `CORS_ALLOWED_ORIGINS=https://topcasinosg.com.sg,https://www.topcasinosg.com.sg,https://backoffice.topcasinosg.com.sg`),
   the systemd units and the Apache includes, exactly as in §5.
3. GitHub → Actions → **Deploy to production** → choose the version → approve.
4. First back-office login on production (`/setup` creates the first Super Admin) → set up 2FA.
5. Copy content: staging back office → **Export / Import → Whole backoffice** → download;
   production back office → **Import** → **Replace everything**. Check the preview first.
   Later, move single items (a new casino, an edited page) with **Choose items** + **Merge**.
6. Global Settings on production → set the site URL, turn **off** `noindex, nofollow`.
   Remove Basic Auth (never added on production).

---

## 10. Operations

| Task | How |
|---|---|
| Roll back | `ln -sfn releases/<older> current && sudo systemctl restart tcsg-<env>-*`, or re-run the workflow for an older tag. |
| Logs | `journalctl -u tcsg-staging-api -f` (same for web/admin). |
| Restore DB | `mysql <db> < backups/<file>.sql` |
| Daily backups | cPanel/WHM **Backup** (daily, keep 7–14 days) in addition to the per-deploy dump. Test a restore once. |
| Disk | Old releases are pruned to 5 by the deploy script; per-deploy DB dumps are kept for 14 days. |

---

## 11. Troubleshooting

| Symptom | Likely cause |
|---|---|
| 503 from Apache | The service is down — `systemctl status tcsg-<env>-<app>`. |
| Back-office login loops back to login | `COOKIE_DOMAIN` or `CORS_ALLOWED_ORIGINS` mismatch, the `https` scheme missing from the origins, or `COOKIE_PREFIX` ≠ the admin build's `NEXT_PUBLIC_COOKIE_PREFIX`. |
| Import rejected through Cloudflare (413) | Cloudflare's free plan caps uploads at 100 MB. Export fewer items per file, or import from a browser pointed straight at the server. |
| Images 404 | `UPLOAD_DIR` isn't pointing at `shared/uploads`. |
| Site shows old content after deploy | `current` didn't switch — check the deploy step log; Next services restarted? |
| AutoSSL fails | The `ProxyPass /.well-known !` line is missing. |

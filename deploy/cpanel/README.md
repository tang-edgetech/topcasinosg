# Deploying to cPanel

The live site runs on cPanel with Phusion Passenger serving Node.js apps —
either cPanel's **Application Manager** (startup file `app.js`, Node.js from
EasyApache) or CloudLinux's **Setup Node.js App** (startup file `server.cjs`).
`deploy.sh` works with both. One clone of this repo serves all three domains:

| Domain | App root / application path | What runs |
| --- | --- | --- |
| `topcasinosg.com.sg` | `apps/topcasinosg/web` | Next.js public site |
| `backoffice.topcasinosg.com.sg` | `apps/topcasinosg/admin` | Next.js backoffice |
| `backapi.topcasinosg.com.sg` | `apps/topcasinosg/api` | Node proxy → Go API |

- The code lives in `/home/topcasinosg/apps/topcasinosg`, **not** in
  `public_html`: anything under a document root can be downloaded, including
  `api/.env`. The domains' document roots stay empty; cPanel only writes an
  `.htaccess` there that hands requests to the Node app.
- cPanel can only host Node apps, so the Go API (`api/bin/api`) runs as a
  background process on `127.0.0.1:PORT` and `api/server.cjs` forwards
  `backapi.topcasinosg.com.sg` to it. `deploy/cpanel/api-process.sh` starts,
  restarts and keeps it alive.
- `deploy/cpanel/deploy.sh` runs from cron every 10 minutes. When `main` has a
  new commit it pulls, rebuilds only what changed and restarts those apps. A
  failed build keeps the previous version running.

## One-time setup

Run the commands in **cPanel → Terminal** (or SSH) as the `topcasinosg` user.

### 1. Database

1. **MySQL Databases**: create a database (e.g. `topcasinosg_live`) and a
   user, and give the user **All Privileges** on it.
2. Export your local database (XAMPP):

   ```bash
   /c/xampp/mysql/bin/mysqldump.exe -u root --default-character-set=utf8mb4 topcasinosg > topcasinosg.sql
   ```

3. **phpMyAdmin**: select the new database → Import → `topcasinosg.sql`.

The API applies any newer migrations itself when it starts. Don't run
`scripts/seed-demo` against the live API — it is for local demo data.

### 2. Clone the repo

The repo is private, so give the server a read-only deploy key:

```bash
ssh-keygen -t ed25519 -N "" -f ~/.ssh/topcasinosg_deploy
cat ~/.ssh/topcasinosg_deploy.pub
```

Add the printed key on GitHub: repo → Settings → Deploy keys → Add deploy key
(leave "Allow write access" off). Then:

```bash
cat >> ~/.ssh/config <<'EOF'
Host github.com
  IdentityFile ~/.ssh/topcasinosg_deploy
  IdentitiesOnly yes
EOF
mkdir -p ~/apps ~/logs
git clone git@github.com:tang-edgetech/topcasinosg.git ~/apps/topcasinosg
```

### 3. Go (to build the API)

```bash
mkdir -p ~/go-sdk
curl -sL https://go.dev/dl/go1.26.4.linux-amd64.tar.gz | tar -xz -C ~/go-sdk --strip-components=1
~/go-sdk/bin/go version
```

The version must match the `go` line in `api/go.mod`.

### 4. API settings and uploads

```bash
cp ~/apps/topcasinosg/deploy/cpanel/api.env.example ~/apps/topcasinosg/api/.env
chmod 600 ~/apps/topcasinosg/api/.env
openssl rand -base64 48   # JWT_SECRET
openssl rand -hex 16      # OTP_ENCRYPTION_KEY (32 characters)
```

Edit `api/.env` (cPanel File Manager or `nano`): the database name, user and
password from step 1, and the two generated secrets.

Copy your local `api/uploads/` folder to `~/apps/topcasinosg/api/uploads/`
(File Manager: upload a zip, then Extract). Without it, every uploaded image
on the site is missing.

### 5. Domains and SSL

1. **Domains**: add `backoffice.topcasinosg.com.sg` and
   `backapi.topcasinosg.com.sg` (any document root, e.g. the folders under
   `public_html/topcasinosg.com.sg/`).
2. **SSL/TLS Status**: run AutoSSL so all three domains have certificates.

### 6. The three Node.js apps

Use whichever of the two your cPanel has (search "node" in cPanel).

**Application Manager** (cPanel → Software). If it's missing, enable it in
WHM as root:

1. **WHM → Software → EasyApache 4 → Customize**: on **Apache Modules** turn
   on the Passenger module (`ea-apache24-mod-passenger`); on **Additional
   Packages** turn on `ea-nodejs22`. Review → Provision.
2. **WHM → Packages → Feature Manager**: edit the account's feature list
   (usually *default*), tick **Application Manager**, Save.

Then in **Application Manager → Register Application**, for each row of the
table at the top: application name (`web`, `admin`, `api`), deployment domain,
base application URL `/`, application path, deployment environment
**Production**. The startup file is the `app.js` already in each folder.

**Setup Node.js App** (CloudLinux): **Create Application** for each row with
Node.js **22**, Application mode **Production**, the application root and URL
from the table, and startup file `server.cjs`. Don't press "Run NPM Install" —
the first deploy does it.

### 7. First deploy

```bash
bash ~/apps/topcasinosg/deploy/cpanel/deploy.sh --force
```

This installs packages, builds the web, backoffice and API, starts the API and
restarts the apps. The first run takes several minutes. Then open the three
domains.

### 8. Cron jobs

**Cron Jobs → Add New Cron Job**, two entries:

| Schedule | Command |
| --- | --- |
| `*/10 * * * *` | `/bin/bash /home/topcasinosg/apps/topcasinosg/deploy/cpanel/deploy.sh >> /home/topcasinosg/logs/deploy.log 2>&1` |
| `* * * * *` | `/bin/bash /home/topcasinosg/apps/topcasinosg/deploy/cpanel/api-process.sh ensure >> /home/topcasinosg/logs/api-process.log 2>&1` |

The first deploys new commits; the second restarts the API if the host stops
it (e.g. after a server reboot).

### 9. Secure the admin accounts

The API creates `dev-admin`, `dev-admin-2` and `super-admin` with the default
password in `api/internal/domain/user.go`, which is in the repo. Sign in to
the backoffice and change all three passwords straight away. (A deleted default
account is recreated with that password on the next API start.)

## Day to day

- Push to `main` → live within about 10 minutes (plus build time).
- Logs: `~/logs/deploy.log` (deploys), `~/logs/api.log` (API output),
  `~/logs/api-process.log` (API starts/stops).
- Deploy now instead of waiting: `bash ~/apps/topcasinosg/deploy/cpanel/deploy.sh`.
- After editing `api/.env` or `deploy/cpanel/production.env`: run it with
  `--force` (frontend settings are baked in at build time).
- API only: `bash ~/apps/topcasinosg/deploy/cpanel/api-process.sh restart`
  (also `status`, `stop`).

## Troubleshooting

- **Build killed / "JavaScript heap out of memory"**: shared hosting limits
  memory per account. Ask the host to raise the limit for builds, or try
  `NODE_OPTIONS=--max-old-space-size=1536` in front of the deploy command.
- **503 "API is starting"** on backapi: the Go process is down. Check
  `~/logs/api.log` (usually a wrong `DB_DSN`), fix `api/.env`, then
  `api-process.sh restart`.
- **Backoffice login fails / logs straight out**: `COOKIE_DOMAIN` must be
  `.topcasinosg.com.sg` and `CORS_ALLOWED_ORIGINS` must list both https
  origins exactly.
- **"no Node.js found"** in the deploy log: neither EasyApache's
  `ea-nodejs22` nor a Setup Node.js App environment exists for that folder —
  see step 6.
- **Site shows the cPanel default page**: the domain has no registered Node.js
  app, or its application path doesn't match the folder in the table.

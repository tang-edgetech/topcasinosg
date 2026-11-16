// Runs a built Next.js app (web or admin) under cPanel's "Setup Node.js App"
// (Phusion Passenger). Passenger starts the app's startup file (web/server.cjs,
// admin/server.cjs) and routes the domain to whatever port it listens on, so
// this is the custom server from Next's docs: production mode, no dev build.
// The app's startup file passes its own require("next") so it resolves from
// that app's node_modules. See deploy/cpanel/README.md.
const { createServer } = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

// The PORT line of api/.env: the Go API listens on 127.0.0.1 there.
function apiPort(repoDir) {
  try {
    const line = fs
      .readFileSync(path.join(repoDir, "api", ".env"), "utf8")
      .split(/\r?\n/)
      .find((l) => /^\s*PORT\s*=/.test(l));
    return line ? Number(line.split("=")[1].trim().replace(/^['"]|['"]$/g, "")) || null : null;
  } catch {
    return null;
  }
}

module.exports = function startNextServer({ dir, next }) {
  const port = Number(process.env.PORT) || 3000;
  // Server-side fetches go straight to the API on this machine instead of out
  // through Cloudflare and back, which can hang (web/src/lib/api-url.ts).
  if (!process.env.API_INTERNAL_URL) {
    const api = apiPort(path.join(dir, ".."));
    if (api) process.env.API_INTERNAL_URL = `http://127.0.0.1:${api}`;
  }
  const app = next({ dev: false, dir });
  const handle = app.getRequestHandler();

  app.prepare().then(
    () => {
      createServer((req, res) => handle(req, res)).listen(port, () => {
        console.log(`> ${dir} ready on port ${port}`);
      });
    },
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
};

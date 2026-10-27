// Startup file for cPanel's "Setup Node.js App" on the API domain — see
// deploy/cpanel/README.md. cPanel can only host Node apps, so this is a small
// reverse proxy: the Go binary (bin/api) runs on its own as a background
// process on 127.0.0.1:PORT (PORT from api/.env), started and kept alive by
// deploy/cpanel/api-process.sh, and this forwards every request to it.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const API_PORT = readEnvPort(path.join(__dirname, ".env")) || 8090;
const PROCESS_SCRIPT = path.join(__dirname, "..", "deploy", "cpanel", "api-process.sh");

function readEnvPort(file) {
  try {
    const line = fs.readFileSync(file, "utf8").split(/\r?\n/).find((l) => /^\s*PORT\s*=/.test(l));
    return line ? Number(line.split("=")[1].trim().replace(/^['"]|['"]$/g, "")) : null;
  } catch {
    return null;
  }
}

// If the Go process is down, start it (at most once a minute) rather than
// waiting for the keep-alive cron.
let lastEnsure = 0;
function ensureApi() {
  if (Date.now() - lastEnsure < 60_000) return;
  lastEnsure = Date.now();
  spawn("bash", [PROCESS_SCRIPT, "ensure"], { detached: true, stdio: "ignore" }).unref();
}

http
  .createServer((req, res) => {
    const forwardedFor = [req.headers["x-forwarded-for"], req.socket.remoteAddress].filter(Boolean).join(", ");
    const upstream = http.request(
      {
        host: "127.0.0.1",
        port: API_PORT,
        method: req.method,
        path: req.url,
        headers: { ...req.headers, "x-forwarded-for": forwardedFor, "x-forwarded-proto": req.headers["x-forwarded-proto"] || "https" },
      },
      (upRes) => {
        res.writeHead(upRes.statusCode || 502, upRes.headers);
        upRes.pipe(res);
      },
    );
    upstream.on("error", (err) => {
      if (err.code === "ECONNREFUSED") ensureApi();
      if (!res.headersSent) res.writeHead(503, { "content-type": "application/json", "retry-after": "10" });
      res.end(JSON.stringify({ success: false, error: { message: "API is starting, try again shortly" } }));
    });
    req.pipe(upstream);
  })
  .listen(Number(process.env.PORT) || 3000);

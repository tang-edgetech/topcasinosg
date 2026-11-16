import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

// Server-side fetches reach the API on this machine (src/lib/api-url.ts).
// On the cPanel server the Go API's port is the PORT line of api/.env, so it
// is read here: this file is loaded by every `next build` and server start,
// whatever started them. On the live server, going out through Cloudflare
// and back to backapi. hangs, so without this the build times out.
if (!process.env.API_INTERNAL_URL) {
  try {
    const line = fs
      .readFileSync(path.join(__dirname, "..", "api", ".env"), "utf8")
      .split(/\r?\n/)
      .find((l) => /^\s*PORT\s*=/.test(l));
    const port = Number(line?.split("=")[1]?.trim().replace(/^['"]|['"]$/g, ""));
    if (port) process.env.API_INTERNAL_URL = `http://127.0.0.1:${port}`;
  } catch {
    // No api/.env (local development): use NEXT_PUBLIC_API_URL.
  }
}

const nextConfig: NextConfig = {
  // Allows importing shared/theme/tokens.css, which lives outside this app's
  // own directory in the monorepo root.
  turbopack: {
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;

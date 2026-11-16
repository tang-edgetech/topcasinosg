// Where this site's server code reaches the API.
//
// API_INTERNAL_URL (server-only, never sent to browsers) lets the server call
// the API on the same machine (http://127.0.0.1:<port>) instead of going out
// through Cloudflare and back: on the live server that round trip can hang,
// which made builds time out and pages load slowly. next.config.ts sets it
// from the PORT in api/.env, for builds and for the running site. Without it
// (local dev, no api/.env) the public NEXT_PUBLIC_API_URL is used.
export const PUBLIC_API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090").replace(/\/+$/, "");

export const API_BASE_URL =
  (typeof window === "undefined" && process.env.API_INTERNAL_URL?.replace(/\/+$/, "")) || PUBLIC_API_URL;

// API client + page-section helpers for the demo seed. Everything goes through
// the admin API (not raw SQL) so the API's own validation applies.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, "../..");
export const API = process.env.API_URL ?? "http://localhost:8090";

// Local dev only: signs in as a seeded default account, reading its password
// from the API source so it never has to be written down anywhere else.
function defaultCredentials() {
  const src = readFileSync(path.join(ROOT, "api/internal/domain/user.go"), "utf8");
  const password = src.match(/DefaultAccountPassword = "([^"]+)"/)?.[1];
  if (!password) throw new Error("could not find DefaultAccountPassword in api/internal/domain/user.go");
  return { login: process.env.SEED_LOGIN ?? "dev-admin", password: process.env.SEED_PASSWORD ?? password };
}

let cookies = new Map();

function cookieHeader() {
  return [...cookies].map(([k, v]) => `${k}=${v}`).join("; ");
}

function keepCookies(res) {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(";");
    const i = pair.indexOf("=");
    cookies.set(pair.slice(0, i).trim(), pair.slice(i + 1).trim());
  }
}

export async function login() {
  cookies = new Map();
  const res = await fetch(`${API}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(defaultCredentials()),
  });
  keepCookies(res);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`login failed (${res.status}): ${JSON.stringify(body)}`);
  if (!cookies.size) {
    throw new Error(`login set no session (${JSON.stringify(body?.data ?? body)}) - turn 2FA off for the seed account`);
  }
}

export async function api(method, url, body, retried = false) {
  const isForm = body instanceof FormData;
  const res = await fetch(`${API}${url}`, {
    method,
    headers: { Cookie: cookieHeader(), ...(body && !isForm ? { "Content-Type": "application/json" } : {}) },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  keepCookies(res);
  if (res.status === 401 && !retried) {
    await login();
    return api(method, url, body, true);
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`${method} ${url} -> ${res.status}: ${JSON.stringify(json?.error ?? json)}`);
    err.status = res.status;
    throw err;
  }
  return json?.data ?? json;
}

// Lists are wrapped as {<key>: [...], total}; take the first array. Pages of
// 100, the largest every list accepts (media caps there and falls back to 24
// for anything bigger).
export async function list(url) {
  const sep = url.includes("?") ? "&" : "?";
  const rows = [];
  for (let page = 1; ; page++) {
    const data = await api("GET", `${url}${sep}page=${page}&pageSize=100`);
    const batch = Array.isArray(data) ? data : (Object.values(data).find(Array.isArray) ?? []);
    rows.push(...batch);
    const total = typeof data?.total === "number" ? data.total : null;
    if (batch.length < 100 || (total !== null && rows.length >= total)) return rows;
  }
}

const first = (data) => (data && typeof data === "object" ? Object.values(data).find((v) => v && typeof v === "object" && "id" in v) : null);

// Create or update by a natural key, then publish when the type has a status.
export async function upsert({ listUrl, match, createUrl = listUrl, body, publish = true, existing }) {
  const rows = existing ?? (await list(listUrl));
  const found = rows.find(match);
  let row;
  if (found) {
    const updated = await api("PUT", `${createUrl}/${found.id}`, body);
    row = first(updated) ?? { ...found, ...body };
    row.id = found.id;
  } else {
    row = first(await api("POST", createUrl, body));
    if (existing) existing.push(row);
  }
  if (publish) await api("PUT", `${createUrl}/${row.id}/status`, { status: "published" });
  return row;
}

// ---------- media ----------

let mediaIndex = null;

const MIME = { ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" };

// Uploads once per filename (the media library's originalFilename), so
// re-runs reuse the existing upload.
async function upload(filename, data, alt) {
  if (!mediaIndex) {
    mediaIndex = new Map((await list("/api/admin/media")).map((m) => [m.originalFilename, m]));
  }
  const hit = mediaIndex.get(filename);
  if (hit) return hit.id;
  const form = new FormData();
  form.append("file", new Blob([data], { type: MIME[path.extname(filename)] }), filename);
  const media = first(await api("POST", "/api/admin/media", form));
  if (alt) await api("PUT", `/api/admin/media/${media.id}`, { title: filename.replace(/\.\w+$/, ""), altText: alt, description: "" });
  mediaIndex.set(filename, media);
  return media.id;
}

export const uploadSvg = (filename, svg, alt = "") => upload(filename, svg, alt);

// A file shipped in scripts/seed-demo/assets/ (e.g. partners' official logos).
export const uploadAsset = (filename, assetPath, alt = "") =>
  upload(filename, readFileSync(path.join(ROOT, "scripts/seed-demo/assets", assetPath)), alt);

export function mediaUrlOf(filename) {
  return mediaIndex?.get(filename)?.url ?? null;
}

// ---------- page sections ----------
// Field values: a string is a text field; rt()/img()/btn() mark the others.

export const rt = (html) => ({ $type: "richtext", textValue: html });
export const img = (mediaId) => ({ $type: "image", mediaId: mediaId ?? null });
export const btn = (label, url) => ({ $type: "button", textValue: label, urlValue: url });

function toFields(itemIndex, obj) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([fieldKey, v], i) => {
      const base = { itemIndex, fieldKey, sortOrder: i + 1, textValue: "", mediaId: null, urlValue: "" };
      if (typeof v === "object" && v.$type) {
        const { $type, ...rest } = v;
        return { ...base, fieldType: $type, ...rest };
      }
      return { ...base, fieldType: "text", textValue: String(v) };
    });
}

// section("faq", {heading: "FAQs"}, [{question, answer: rt(...)}, ...])
export function section(blockType, fields = {}, items = [], opts = {}) {
  return {
    blockType,
    customClass: opts.customClass ?? "",
    customId: opts.customId ?? "",
    inContainer: opts.inContainer ?? false,
    fields: [...toFields(0, fields), ...items.flatMap((item, i) => toFields(i + 1, item))],
  };
}

export async function upsertPage({ slug, parentId = null, title, metaTitle = "", metaDescription = "", sections, pages }) {
  const found = pages.find((p) => p.slug === slug && (p.parentId ?? null) === parentId);
  const body = { parentId, slug, title, metaTitle, metaDescription };
  let id;
  if (found) {
    await api("PUT", `/api/admin/pages/${found.id}`, body);
    id = found.id;
  } else {
    const created = first(await api("POST", "/api/admin/pages", body));
    pages.push(created);
    id = created.id;
  }
  if (sections) {
    await api("PUT", `/api/admin/pages/${id}/sections`, {
      sections: sections.map((s, i) => ({ id: 0, sortOrder: i, ...s })),
    });
  }
  await api("PUT", `/api/admin/pages/${id}/status`, { status: "published" });
  return id;
}

// Deterministic pseudo-random so re-runs produce the same data.
export function rng(seed) {
  let s = 0;
  for (const ch of String(seed)) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

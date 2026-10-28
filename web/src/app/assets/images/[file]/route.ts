import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

// The API's upload folder. The website and the API run on the same machine
// from one checkout, so by default it's ../api/uploads next to this app
// (the API's own default, UPLOAD_DIR=uploads, run from api/). WEB_UPLOAD_DIR
// overrides it when the folder lives elsewhere.
const UPLOAD_DIR = process.env.WEB_UPLOAD_DIR || path.join(process.cwd(), "..", "api", "uploads");

// Upload filenames as the API stores them (internal/storage): no paths.
const FILENAME = /^[A-Za-z0-9_-][A-Za-z0-9._-]*$/;

// The types the API accepts for upload (api/internal/service/media_service.go).
const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".csv": "text/csv",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".pdf": "application/pdf",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
};

// Upload filenames are unique and never reused, so a file never changes:
// browsers and CDNs may keep it for a year. The file is served on the
// site's own domain, so it must never run as a page (an SVG opened directly
// could otherwise run script here): sandboxed, no sniffing.
const BASE_HEADERS = {
  "Cache-Control": "public, max-age=31536000, immutable",
  "Content-Security-Policy": "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
  "X-Content-Type-Options": "nosniff",
};

// Uploaded media on this site's own domain: /assets/images/<file> serves the
// upload <file>, so pages never send visitors to the API's domain (see
// mediaUrl in src/lib/pages.ts). Read straight from the upload folder; if it
// isn't on this machine, ask the API for the file instead.
export async function GET(_request: NextRequest, ctx: RouteContext<"/assets/images/[file]">) {
  const { file } = await ctx.params;
  if (!FILENAME.test(file) || file.includes("..")) {
    return new Response("Not found", { status: 404 });
  }
  return (await fromDisk(file)) ?? (await fromApi(file));
}

async function fromDisk(file: string): Promise<Response | null> {
  const filePath = path.join(UPLOAD_DIR, file);
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return null;
    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream<Uint8Array>;
    return new Response(stream, {
      headers: {
        ...BASE_HEADERS,
        "Content-Type": CONTENT_TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream",
        "Content-Length": String(info.size),
        "Last-Modified": info.mtime.toUTCString(),
      },
    });
  } catch {
    return null;
  }
}

async function fromApi(file: string): Promise<Response> {
  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/uploads/${encodeURIComponent(file)}`, { cache: "no-store" });
  } catch {
    return new Response("Image unavailable", { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    return new Response("Not found", { status: upstream.status === 404 ? 404 : 502 });
  }
  const headers = new Headers(BASE_HEADERS);
  for (const name of ["content-type", "content-length", "last-modified"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  return new Response(upstream.body, { status: 200, headers });
}

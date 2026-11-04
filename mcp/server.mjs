#!/usr/bin/env node
// TopCasinoSG connector: an MCP server (stdio) that lets an AI app such as
// Claude Desktop read and edit site content through the Content API
// (/api/v1, api/internal/handler/content_api_handler.go) with an API key
// from Settings > API Keys. No dependencies: Node 18+ only.
//
// Settings come from the environment:
//   TOPCASINOSG_API_URL  the API (default: the live site, https://backapi.topcasinosg.com.sg)
//   TOPCASINOSG_API_KEY  the key (Bearer); never printed
import { AsyncLocalStorage } from "node:async_hooks";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { createInterface } from "node:readline";

const API_URL = (process.env.TOPCASINOSG_API_URL || "https://backapi.topcasinosg.com.sg").replace(/\/+$/, "");
const API_KEY = process.env.TOPCASINOSG_API_KEY || "";
const SERVER_INFO = { name: "topcasinosg", version: "1.0.0" };
const PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

// The site's Activity Log shows each call as made by the AI connector, in
// which AI app and by which tool: "topcasinosg-mcp/<version> (<app>; <tool>)"
// (domain.AuditConnectorUserAgent in the API).
let clientApp = "unknown app";
const currentTool = new AsyncLocalStorage();
const userAgent = () =>
  `topcasinosg-mcp/${SERVER_INFO.version} (${clientApp}; ${currentTool.getStore() ?? "no tool"}) node/${process.versions.node}`;

const INSTRUCTIONS = `This connector edits the TopCasinoSG website through its Content API.
How to work:
1. Call whoami first: it says whether the key is "Direct" (changes go live) or "Needs approval" (an admin approves each change), and which areas it can use.
2. Before building or changing page sections, call get_schema (filter with blockTypes) for the exact fields and allowed values.
3. To edit a page: get_page, change only what was asked, then save_page_sections with the WHOLE sections list (it replaces the page's list). Use dryRun true first when the change is large.
4. Build new content from containers holding widgets (kind "widget"); avoid "classic" block types.
5. New pages and articles are created as drafts. Ask the user before publishing, deleting or changing anything they did not ask for.`;

// --- API calls ---

async function api(method, path, body) {
  if (!API_KEY) throw new Error("TOPCASINOSG_API_KEY is not set in the connector's settings.");
  const headers = { Authorization: `Bearer ${API_KEY}`, Accept: "application/json", "User-Agent": userAgent() };
  let payload;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(`${API_URL}/api/v1${path}`, { method, headers, body: payload });
  } catch (err) {
    throw new Error(`Could not reach the API at ${API_URL}: ${err.message}`);
  }
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = undefined;
  }
  if (!res.ok) {
    const message = json?.error?.message || json?.message || text.slice(0, 300) || res.statusText;
    throw new Error(`${method} /api/v1${path} failed (${res.status}): ${message}`);
  }
  return json?.data ?? json ?? text;
}

const query = (params) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : "";
};

const MIME = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp", svg: "image/svg+xml", avif: "image/avif" };

// --- Tools ---

const id = { type: "integer", description: "The id." };
const sectionsSchema = {
  type: "array",
  description: "The page's whole section list, in page order (see get_schema). Each: {blockType, depth, customClass, customId, fields: [{itemIndex, fieldKey, fieldType, textValue, urlValue, mediaId}]}.",
  items: { type: "object" },
};

const TOOLS = [
  {
    name: "whoami",
    description: "What this API key is: Direct (changes go live) or Needs approval, which areas it can use, and what it can do. Call this first.",
    inputSchema: { type: "object", properties: {} },
    run: () => api("GET", "/me"),
  },
  {
    name: "get_schema",
    description:
      "How page content is built: rules, endpoints, field types, every block type with its exact fields and allowed values, and the style classes. Pass blockTypes to get only those blocks (the full schema is long).",
    inputSchema: {
      type: "object",
      properties: {
        blockTypes: { type: "array", items: { type: "string" }, description: "Only these block types, e.g. [\"container\", \"heading\", \"card\"]." },
        summary: { type: "boolean", description: "true: list block types with their kind and description only, without fields." },
      },
    },
    run: async ({ blockTypes, summary }) => {
      const schema = await api("GET", "/schema");
      let blocks = schema.blockTypes ?? [];
      if (Array.isArray(blockTypes) && blockTypes.length) blocks = blocks.filter((b) => blockTypes.includes(b.type));
      if (summary) blocks = blocks.map(({ type, kind, about }) => ({ type, kind, about }));
      return { ...schema, blockTypes: blocks };
    },
  },
  {
    name: "list_pages",
    description: "Every page with its id, path, title and status.",
    inputSchema: { type: "object", properties: {} },
    run: () => api("GET", "/pages"),
  },
  {
    name: "get_page",
    description: "One page with all its sections, in the shape save_page_sections takes back.",
    inputSchema: { type: "object", properties: { id }, required: ["id"] },
    run: ({ id }) => api("GET", `/pages/${id}`),
  },
  {
    name: "save_page_sections",
    description:
      "Change a page: send its WHOLE section list back, edited (anything left out is removed from the page). Can also change title, metaTitle and metaDescription. With a Needs-approval key this proposes the change for an admin to approve. dryRun true only checks it.",
    inputSchema: {
      type: "object",
      properties: {
        id,
        sections: sectionsSchema,
        title: { type: "string" },
        metaTitle: { type: "string" },
        metaDescription: { type: "string" },
        note: { type: "string", description: "Why: shown to the admin who reviews it." },
        dryRun: { type: "boolean", description: "true: check the change without saving it." },
      },
      required: ["id"],
    },
    run: ({ id, ...change }) => api("POST", `/pages/${id}/changes`, change),
  },
  {
    name: "create_page",
    description: "A new page, created as a draft. slug is lowercase words with hyphens; parentId puts it under another page.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        slug: { type: "string" },
        parentId: { type: "integer" },
        metaTitle: { type: "string" },
        metaDescription: { type: "string" },
        sections: sectionsSchema,
        note: { type: "string" },
        dryRun: { type: "boolean" },
      },
      required: ["title", "slug"],
    },
    run: (args) => api("POST", "/pages", args),
  },
  {
    name: "list_global_sections",
    description: "Reusable sections a page can include with a global_section block.",
    inputSchema: { type: "object", properties: {} },
    run: () => api("GET", "/global-sections"),
  },
  {
    name: "list_news",
    description: "News articles, newest first.",
    inputSchema: { type: "object", properties: { page: { type: "integer" }, pageSize: { type: "integer" } } },
    run: ({ page, pageSize }) => api("GET", `/news${query({ page, pageSize })}`),
  },
  {
    name: "get_news",
    description: "One news article with its full content (HTML).",
    inputSchema: { type: "object", properties: { id }, required: ["id"] },
    run: ({ id }) => api("GET", `/news/${id}`),
  },
  {
    name: "save_news",
    description:
      "Create a news article (no id; created as a draft) or change one (with id; fields left out stay as they are). content is HTML. With a Needs-approval key this proposes the change.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "integer", description: "The article to change; leave out for a new one." },
        title: { type: "string" },
        slug: { type: "string" },
        excerpt: { type: "string" },
        content: { type: "string", description: "HTML." },
        coverMediaId: { type: "integer" },
        note: { type: "string" },
        dryRun: { type: "boolean" },
      },
    },
    run: ({ id, ...change }) => (id ? api("POST", `/news/${id}/changes`, change) : api("POST", "/news", change)),
  },
  {
    name: "list_media",
    description: "Images in the Media Library, with their ids (for image fields' mediaId) and URLs.",
    inputSchema: { type: "object", properties: { page: { type: "integer" }, pageSize: { type: "integer" } } },
    run: ({ page, pageSize }) => api("GET", `/media${query({ page, pageSize })}`),
  },
  {
    name: "upload_image",
    description: "Add an image to the Media Library from a file on this computer (path) or a web address (url). Returns its mediaId.",
    inputSchema: {
      type: "object",
      properties: {
        path: { type: "string", description: "A file on this computer." },
        url: { type: "string", description: "An image on the web." },
        filename: { type: "string", description: "Name to store it under (optional)." },
      },
    },
    run: async ({ path, url, filename }) => {
      let bytes, name, type;
      if (path) {
        bytes = await readFile(path);
        name = filename || basename(path);
      } else if (url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Could not download ${url} (${res.status})`);
        bytes = Buffer.from(await res.arrayBuffer());
        type = res.headers.get("content-type")?.split(";")[0];
        name = filename || basename(new URL(url).pathname) || "image";
      } else throw new Error("Give either path or url.");
      type = MIME[name.split(".").pop()?.toLowerCase()] || type || "application/octet-stream";
      const form = new FormData();
      form.append("file", new Blob([bytes], { type }), name);
      return api("POST", "/media", form);
    },
  },
  {
    name: "list_my_changes",
    description: "Changes this key has sent, and whether an admin approved them (Needs-approval keys).",
    inputSchema: { type: "object", properties: {} },
    run: () => api("GET", "/changes"),
  },
  {
    name: "set_status",
    description:
      "Direct keys: publish or unpublish something. area is e.g. pages, news, casinos, bonuses, guides. status scheduled needs publishAt (ISO date-time). Only when the user asked for it.",
    inputSchema: {
      type: "object",
      properties: {
        area: { type: "string" },
        id,
        status: { type: "string", enum: ["draft", "published", "scheduled"] },
        publishAt: { type: "string" },
      },
      required: ["area", "id", "status"],
    },
    run: ({ area, id, status, publishAt }) => api("PUT", `/${area}/${id}/status`, { status, publishAt }),
  },
  {
    name: "api_request",
    description:
      "Any other Content API call this key allows (see whoami and get_schema's endpoints), e.g. GET /casinos, PUT /bonuses/12, GET /recycle-bin. path is relative to /api/v1. DELETE moves things to the Recycle Bin: only when the user asked.",
    inputSchema: {
      type: "object",
      properties: {
        method: { type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE"] },
        path: { type: "string", description: "e.g. /casinos?page=1" },
        body: { type: "object", description: "JSON body for POST/PUT/PATCH." },
      },
      required: ["method", "path"],
    },
    run: ({ method, path, body }) => {
      if (!/^\/[A-Za-z0-9\-_/?=&%.,]*$/.test(path) || path.includes("..")) throw new Error("path must be like /casinos or /casinos/12");
      return api(method, path, method === "GET" || method === "DELETE" ? undefined : body);
    },
  },
];

// --- MCP over stdio (JSON-RPC 2.0, one message per line) ---

function send(message) {
  process.stdout.write(JSON.stringify(message) + "\n");
}

async function handle(msg) {
  const { id: reqId, method, params } = msg;
  const isRequest = reqId !== undefined && reqId !== null;
  const reply = (result) => isRequest && send({ jsonrpc: "2.0", id: reqId, result });
  const fail = (code, message) => isRequest && send({ jsonrpc: "2.0", id: reqId, error: { code, message } });

  switch (method) {
    case "initialize": {
      const asked = params?.protocolVersion;
      const app = [params?.clientInfo?.name, params?.clientInfo?.version].filter(Boolean).join(" ");
      if (app) clientApp = app.replace(/[^\w .@+-]/g, "").slice(0, 60) || clientApp;
      return reply({
        protocolVersion: PROTOCOL_VERSIONS.includes(asked) ? asked : PROTOCOL_VERSIONS[0],
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      });
    }
    case "ping":
      return reply({});
    case "tools/list":
      return reply({ tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })) });
    case "tools/call": {
      const tool = TOOLS.find((t) => t.name === params?.name);
      if (!tool) return fail(-32602, `Unknown tool: ${params?.name}`);
      try {
        const result = await currentTool.run(tool.name, () => tool.run(params.arguments ?? {}));
        return reply({ content: [{ type: "text", text: typeof result === "string" ? result : JSON.stringify(result, null, 2) }] });
      } catch (err) {
        return reply({ content: [{ type: "text", text: err.message }], isError: true });
      }
    }
    default:
      if (method?.startsWith("notifications/")) return;
      return fail(-32601, `Method not found: ${method}`);
  }
}

const rl = createInterface({ input: process.stdin });
rl.on("line", (line) => {
  if (!line.trim()) return;
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
  }
  for (const m of Array.isArray(msg) ? msg : [msg]) handle(m).catch((err) => console.error(err));
});

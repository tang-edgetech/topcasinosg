import type { AuditLogDTO } from "@/lib/types";

export function formatClientAddress(log: Pick<AuditLogDTO, "ipAddress" | "ipPort">): string {
  if (!log.ipAddress) return "";
  if (log.ipPort === null) return log.ipAddress;
  return log.ipAddress.includes(":") ? `[${log.ipAddress}]:${log.ipPort}` : `${log.ipAddress}:${log.ipPort}`;
}

export function isFailedActivity(log: Pick<AuditLogDTO, "statusCode">): boolean {
  return log.statusCode >= 400;
}

function exportRecord(log: AuditLogDTO) {
  return {
    id: log.id,
    time: log.createdAt,
    user: log.actorName || null,
    role: log.actorRole || null,
    action: log.action,
    section: log.entityType,
    record: log.entityLabel || null,
    recordId: log.entityId,
    request: log.method ? `${log.method} ${log.path}` : null,
    status: log.statusCode || null,
    error: log.error || null,
    ip: formatClientAddress(log) || null,
    browser: log.userAgent || null,
    changes: log.changes ?? {},
  };
}

export function activityToJSON(logs: AuditLogDTO[]): string {
  return JSON.stringify(logs.map(exportRecord), null, 2);
}

const CSV_COLUMNS = ["id", "time", "user", "role", "action", "section", "record", "recordId", "request", "status", "error", "ip", "browser", "changes"] as const;

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function activityToCSV(logs: AuditLogDTO[]): string {
  const rows = logs.map(exportRecord).map((record) => CSV_COLUMNS.map((column) => csvCell(record[column])).join(","));
  return "﻿" + [CSV_COLUMNS.join(","), ...rows].join("\r\n");
}

// A ready-to-paste debugging brief: plain-language context first, then the
// entries as JSON, so it can be handed to Claude (or a developer) as-is.
export function activityDebugReport(logs: AuditLogDTO[], context: { site: string; filters: string }): string {
  const failed = logs.filter(isFailedActivity);
  const lines = [
    `## TopCasinoSG admin activity — ${logs.length} entr${logs.length === 1 ? "y" : "ies"}${failed.length > 0 ? `, ${failed.length} failed` : ""}`,
    "",
    `- Site: ${context.site}`,
    `- Filters: ${context.filters || "none"}`,
    `- Copied: ${new Date().toISOString()}`,
    "- Stack: Next.js admin (admin/) → Go API (api/, routes in internal/server/server.go), MySQL.",
    "- `status` is the API's HTTP status; `error` is the message the admin saw; `changes` holds what was submitted (secrets hidden).",
  ];
  if (failed.length > 0) {
    lines.push("", "### Failed requests");
    for (const log of failed) {
      lines.push(`- #${log.id} ${log.method} ${log.path} → ${log.statusCode}: ${log.error || "(no message)"}`);
    }
  }
  lines.push("", "### Entries", "```json", activityToJSON(logs), "```");
  return lines.join("\n");
}

export function downloadText(filename: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

import type { ImportColumnDTO, ImportTypeDTO } from "./types";
import { downloadText } from "./activityExport";

const LIST_KINDS = ["list", "regions", "providers", "licenses"];
const NUMBER_KINDS = ["integer", "number"];

function range(c: ImportColumnDTO): string {
  if (c.min !== undefined && c.max !== undefined) return `, ${c.min} to ${c.max}`;
  if (c.min !== undefined) return `, at least ${c.min}`;
  if (c.max !== undefined) return `, at most ${c.max}`;
  return "";
}

// Plain-language format of one import column, matching the API's checks
// (api/internal/service/content_import_service.go validateImportCell).
export function columnFormat(c: ImportColumnDTO): string {
  const allowed = c.values?.length ? `: ${c.values.join(", ")}` : "";
  switch (c.kind) {
    case "html":
      return "HTML text";
    case "slug":
      return `Lowercase letters, numbers and hyphens${c.maxLength ? `, up to ${c.maxLength}` : ""}`;
    case "integer":
      return `Whole number${range(c)}`;
    case "number":
      return `Number${range(c)}`;
    case "boolean":
      return "yes / no (JSON: true / false)";
    case "enum":
      return `One of${allowed}`;
    case "list":
      return `List, separated by | (JSON: array)${c.values?.length ? ` of${allowed}` : ""}`;
    case "date":
      return "Date, YYYY-MM-DD";
    case "region":
      return "Region code (e.g. th)";
    case "regions":
      return "Region codes, separated by | (JSON: array)";
    case "casino":
      return "Casino slug";
    case "provider":
      return "Game provider name";
    case "providers":
      return "Game provider names, separated by | (JSON: array)";
    case "licenses":
      return "License names, separated by | (JSON: array)";
    default:
      return `Text${c.maxLength ? `, up to ${c.maxLength} characters` : ""}`;
  }
}

function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function jsonValue(c: ImportColumnDTO): unknown {
  const example = c.example ?? "";
  if (LIST_KINDS.includes(c.kind)) return example ? example.split("|").map((v) => v.trim()).filter(Boolean) : [];
  if (example === "") return c.required ? "" : null;
  if (NUMBER_KINDS.includes(c.kind)) return Number(example);
  if (c.kind === "boolean") return ["yes", "true", "1"].includes(example.toLowerCase());
  return example;
}

// Template with the exact columns and one example row; delete or replace the
// example before importing. The CSV starts with a BOM so Excel reads UTF-8.
export function downloadImportTemplate(spec: ImportTypeDTO, format: "csv" | "json") {
  const base = `${spec.key.replace(/_/g, "-")}-import-template`;
  if (format === "csv") {
    const header = spec.columns.map((c) => c.key).join(",");
    const example = spec.columns.map((c) => csvCell(c.example ?? "")).join(",");
    downloadText(`${base}.csv`, `﻿${header}\r\n${example}\r\n`, "text/csv;charset=utf-8");
    return;
  }
  const item = Object.fromEntries(spec.columns.map((c) => [c.key, jsonValue(c)]));
  downloadText(`${base}.json`, `${JSON.stringify({ type: spec.key, items: [item] }, null, 2)}\n`, "application/json");
}

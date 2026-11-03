"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Input, Modal, App as AntApp } from "antd";
import { api, ApiError } from "@/lib/api";
import { useSiteSettings } from "@/lib/site-settings-context";
import PageHeading from "@/components/PageHeading";
import { BLOCK_TYPE_LABELS } from "../pages/BlockFields";
import type { ContentChangeDTO, ContentSectionInput, PageBlockType } from "@/lib/types";

dayjs.extend(relativeTime);

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;
const MUTED_CLASS = "text-sm text-text-muted dark:text-text-muted-dark";
const PRIMARY_BUTTON_CLASS =
  "btn cursor-pointer rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60";
const SECONDARY_BUTTON_CLASS =
  "btn cursor-pointer rounded-md border border-border px-4 py-2 text-sm font-semibold text-text dark:border-border-dark dark:text-text-dark disabled:cursor-not-allowed disabled:opacity-60";
const DANGER_BUTTON_CLASS =
  "btn cursor-pointer rounded-md border border-danger px-4 py-2 text-sm font-semibold text-danger disabled:cursor-not-allowed disabled:opacity-60";

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "pending", label: "Waiting for Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "", label: "All" },
];

const STATUS_STYLES: Record<ContentChangeDTO["status"], { label: string; className: string }> = {
  pending: { label: "Waiting", className: "bg-secondary-100 text-secondary-900" },
  approved: { label: "Approved", className: "bg-success-subtle text-success" },
  rejected: { label: "Rejected", className: "bg-danger/10 text-danger" },
  withdrawn: { label: "Withdrawn", className: "bg-surface-muted text-text-muted dark:bg-surface-muted-dark dark:text-text-muted-dark" },
};

interface ChangeDetail {
  change: ContentChangeDTO;
  current: (ContentChangeDTO["change"] & { coverUrl?: string | null }) | null;
}

function describe(c: ContentChangeDTO) {
  const what = c.contentType === "page" ? "Page" : "News article";
  return c.action === "create" ? `New ${what.toLowerCase()}` : `${what} update`;
}

// Text as a reviewer reads it: one line per paragraph, heading or list
// item, other HTML tags dropped.
function plain(value: string) {
  return value
    .replace(/<\/(p|h[1-6]|li|div|tr)>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

function fieldValue(f: ContentSectionInput["fields"][number]) {
  if (f.fieldType === "image") return f.mediaId ? `Image #${f.mediaId}` : "";
  if (f.fieldType === "button") return [plain(f.textValue), f.urlValue].filter(Boolean).join(" → ");
  return plain(f.textValue);
}

function sectionLabel(s: ContentSectionInput) {
  return BLOCK_TYPE_LABELS[s.blockType as PageBlockType] ?? s.blockType;
}

function sectionFields(s: ContentSectionInput | undefined) {
  const map = new Map<string, string>();
  for (const f of s?.fields ?? []) map.set(f.itemIndex > 0 ? `${f.fieldKey} #${f.itemIndex + 1}` : f.fieldKey, fieldValue(f));
  return map;
}

interface DiffRow {
  where: string;
  before: string;
  after: string;
}

// What a proposed section list changes, section by section in page order.
function diffSections(before: ContentSectionInput[], after: ContentSectionInput[]): DiffRow[] {
  const rows: DiffRow[] = [];
  for (let i = 0; i < Math.max(before.length, after.length); i++) {
    const b = before[i];
    const a = after[i];
    const where = `Section ${i + 1}`;
    if (!a) {
      rows.push({ where, before: `${sectionLabel(b)} (removed)`, after: "" });
      continue;
    }
    if (!b || b.blockType !== a.blockType || (b.depth ?? (b.inContainer ? 1 : 0)) !== (a.depth ?? (a.inContainer ? 1 : 0))) {
      const text = [...sectionFields(a).values()].filter(Boolean).join(" · ");
      rows.push({ where, before: b ? sectionLabel(b) : "", after: `${sectionLabel(a)}${text ? `: ${text}` : ""}` });
      continue;
    }
    const bf = sectionFields(b);
    const af = sectionFields(a);
    for (const key of new Set([...bf.keys(), ...af.keys()])) {
      if ((bf.get(key) ?? "") !== (af.get(key) ?? "")) {
        rows.push({ where: `${where} · ${sectionLabel(a)} · ${key}`, before: bf.get(key) ?? "", after: af.get(key) ?? "" });
      }
    }
    if (b.customClass !== a.customClass || b.customId !== a.customId) {
      rows.push({ where: `${where} · ${sectionLabel(a)} · style`, before: `${b.customClass} ${b.customId}`.trim(), after: `${a.customClass} ${a.customId}`.trim() });
    }
  }
  return rows;
}

function detailRows(detail: ChangeDetail): DiffRow[] {
  const { change, current } = detail;
  const proposed = change.change;
  const before = current ?? {};
  const rows: DiffRow[] = [];
  const simple: [string, keyof ContentChangeDTO["change"]][] =
    change.contentType === "page"
      ? [["Title", "title"], ["Slug", "slug"], ["SEO title", "metaTitle"], ["SEO description", "metaDescription"]]
      : [["Title", "title"], ["Slug", "slug"], ["Excerpt", "excerpt"], ["Content", "content"], ["Cover image", "coverMediaId"]];
  for (const [label, key] of simple) {
    const after = proposed[key];
    if (after === undefined || after === null) continue;
    const show = (v: unknown) => (v === undefined || v === null ? "" : key === "coverMediaId" ? `Image #${v}` : plain(String(v)));
    if (show(before[key]) !== show(after)) rows.push({ where: label, before: show(before[key]), after: show(after) });
  }
  if (proposed.sections) rows.push(...diffSections(before.sections ?? [], proposed.sections));
  return rows;
}

// AI Changes: what API keys (an AI assistant, usually) propose. Nothing
// changes on the site until it's approved here; new pages and articles are
// created as drafts. Data: /api/admin/content-changes.
export default function AIChangesPage() {
  const { message } = AntApp.useApp();
  const { settings } = useSiteSettings();
  const webBase = (WEB_URL || settings?.siteUrl || "").replace(/\/+$/, "");
  const [status, setStatus] = useState("pending");
  const router = useRouter();
  const [changes, setChanges] = useState<ContentChangeDTO[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<ChangeDetail | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    return api.get<{ changes: ContentChangeDTO[]; total: number }>(`/api/admin/content-changes?status=${status}&page=${page}&pageSize=20`).then(
      (data) => {
        setError("");
        setChanges(data.changes ?? []);
        setTotal(data.total);
      },
      (err) => setError(err instanceof ApiError ? err.message : "Could not load changes."),
    );
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function open(id: number) {
    try {
      setDetail(await api.get<ChangeDetail>(`/api/admin/content-changes/${id}`));
      setReviewNote("");
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not load this change.");
    }
  }

  async function preview(id: number) {
    const tab = window.open("", "_blank");
    try {
      const { token } = await api.post<{ token: string }>(`/api/admin/content-changes/${id}/preview`, {});
      const url = `${webBase}/preview/${token}`;
      if (tab) tab.location.href = url;
      else window.open(url, "_blank");
    } catch (err) {
      tab?.close();
      message.error(err instanceof ApiError ? err.message : "Could not open the preview.");
    }
  }

  async function review(action: "approve" | "reject", force = false) {
    if (!detail) return;
    setBusy(true);
    try {
      const result = await api.post<{ change: ContentChangeDTO }>(`/api/admin/content-changes/${detail.change.id}/${action}`, {
        note: reviewNote,
        force,
      });
      message.success(
        action === "reject"
          ? "Change rejected."
          : result.change.action === "create"
            ? "Approved — created as a draft. Open it to publish when ready."
            : "Approved — the change is now on the site.",
      );
      setDetail({ ...detail, change: result.change });
      window.dispatchEvent(new Event("ai-changes-updated"));
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && action === "approve" && detail.change.outdated && !force) {
        message.warning("This content was edited after the change was proposed.");
      } else {
        message.error(err instanceof ApiError ? err.message : "Could not save the review.");
      }
    } finally {
      setBusy(false);
    }
  }

  const c = detail?.change;
  const rows = detail ? detailRows(detail) : [];
  const resultHref = c?.resultId ? (c.contentType === "page" ? `/dashboard/pages/${c.resultId}` : `/dashboard/news/${c.resultId}`) : null;
  const pageCount = Math.max(1, Math.ceil(total / 20));

  return (
    <section id="ai-changes-page" className="ai-changes-page flex flex-col gap-6">
      <PageHeading title="AI Changes" help="aiChanges" />
      <p className={`${MUTED_CLASS} max-w-3xl`}>
        Changes proposed through the Content API, usually by an AI assistant. Nothing here is on the website until you approve it. Approving an
        update changes the live page or article straight away (the page keeps its previous version under Revisions); approving something new
        creates it as a draft for you to publish.
      </p>

      <nav className="flex flex-wrap gap-1 border-b border-border dark:border-border-dark" aria-label="Filter by status">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value || "all"}
            type="button"
            onClick={() => {
              setStatus(tab.value);
              setPage(1);
            }}
            aria-current={status === tab.value ? "page" : undefined}
            className={`-mb-px cursor-pointer border-b-2 px-4 py-2 text-sm font-semibold ${
              status === tab.value
                ? "border-primary-600 text-primary-700 dark:border-secondary-500 dark:text-text-dark"
                : "border-transparent text-text-muted hover:text-text dark:text-text-muted-dark dark:hover:text-text-dark"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {error && <p className="form-error text-sm text-danger">{error}</p>}

      {!changes ? (
        <p className={MUTED_CLASS}>Loading…</p>
      ) : changes.length === 0 ? (
        <p className={MUTED_CLASS}>{status === "pending" ? "Nothing waiting for review." : "No changes here."}</p>
      ) : (
        <ul id="ai-changes-list" className="flex flex-col divide-y divide-border rounded-lg border border-border dark:divide-border-dark dark:border-border-dark">
          {changes.map((change) => {
            const style = STATUS_STYLES[change.status];
            return (
              <li key={change.id} id={`ai-change-${change.id}`}>
                <button
                  type="button"
                  onClick={() => open(change.id)}
                  className="flex w-full cursor-pointer flex-wrap items-center gap-3 px-4 py-3 text-left hover:bg-surface-muted dark:hover:bg-surface-muted-dark"
                >
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${style.className}`}>{style.label}</span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold text-text dark:text-text-dark">{change.label || "(no title)"}</span>
                    <span className="truncate text-xs text-text-muted dark:text-text-muted-dark">
                      {describe(change)} · from {change.apiKeyName || "a removed key"} · {dayjs(change.createdAt).fromNow()}
                      {change.note && ` · “${change.note}”`}
                    </span>
                  </span>
                  {change.outdated && (
                    <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-semibold text-secondary-900">Edited since</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {pageCount > 1 && (
        <div className="flex items-center gap-3">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className={SECONDARY_BUTTON_CLASS}>
            Previous
          </button>
          <span className={MUTED_CLASS}>
            Page {page} of {pageCount}
          </span>
          <button type="button" disabled={page >= pageCount} onClick={() => setPage(page + 1)} className={SECONDARY_BUTTON_CLASS}>
            Next
          </button>
        </div>
      )}

      <Modal
        open={detail !== null}
        onCancel={() => setDetail(null)}
        title={c ? `${describe(c)}: ${c.label}` : ""}
        width={960}
        footer={null}
        destroyOnHidden
      >
        {c && (
          <div id="ai-change-detail" className="flex flex-col gap-5 py-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted dark:text-text-muted-dark">
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[c.status].className}`}>
                {STATUS_STYLES[c.status].label}
              </span>
              <span>From {c.apiKeyName || "a removed key"}</span>
              <span>{dayjs(c.createdAt).format("D MMM YYYY, HH:mm")}</span>
              {c.targetId && (
                <Link href={c.contentType === "page" ? `/dashboard/pages/${c.targetId}` : `/dashboard/news/${c.targetId}`} className="text-primary-600 underline">
                  Open the current {c.contentType === "page" ? "page" : "article"}
                </Link>
              )}
            </div>

            {c.note && (
              <div className="rounded-md bg-surface-muted p-3 text-sm text-text dark:bg-surface-muted-dark dark:text-text-dark">
                <span className="font-semibold">Why: </span>
                {c.note}
              </div>
            )}

            {c.outdated && c.status === "pending" && (
              <p className="rounded-md bg-secondary-100 p-3 text-sm text-secondary-900">
                Someone edited this {c.contentType === "page" ? "page" : "article"} after the change was proposed. The comparison below is
                against the latest version, and approving will replace those edits where they overlap.
              </p>
            )}

            <div className="flex flex-col gap-2">
              <h3 className="text-base font-bold text-text dark:text-text-dark">
                {c.action === "create" ? "What will be created" : `What changes (${rows.length})`}
              </h3>
              {rows.length === 0 ? (
                <p className={MUTED_CLASS}>No visible differences from the current version.</p>
              ) : (
                <div className="max-h-[50vh] overflow-auto rounded-lg border border-border dark:border-border-dark">
                  <table className="w-full table-fixed text-left text-sm">
                    <thead className="sticky top-0 bg-surface-muted text-xs text-text-muted uppercase dark:bg-surface-muted-dark dark:text-text-muted-dark">
                      <tr>
                        <th className="w-1/4 px-3 py-2 font-semibold">Where</th>
                        {c.action === "update" && <th className="px-3 py-2 font-semibold">Now</th>}
                        <th className="px-3 py-2 font-semibold">{c.action === "update" ? "Proposed" : "Content"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border align-top dark:divide-border-dark">
                      {rows.map((row, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 text-xs font-medium break-words text-text-muted dark:text-text-muted-dark">{row.where}</td>
                          {c.action === "update" && (
                            <td className="px-3 py-2 break-words whitespace-pre-line text-text dark:text-text-dark">
                              {row.before ? <span className="bg-danger/10">{row.before}</span> : <span className="text-text-muted italic">empty</span>}
                            </td>
                          )}
                          <td className="px-3 py-2 break-words whitespace-pre-line text-text dark:text-text-dark">
                            {row.after ? <span className="bg-success-subtle">{row.after}</span> : <span className="text-text-muted italic">empty</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {c.status === "pending" ? (
              <div className="flex flex-col gap-3 border-t border-border pt-4 dark:border-border-dark">
                <label className="flex flex-col gap-1.5 text-sm font-medium text-text dark:text-text-dark">
                  Note to the tool (optional)
                  <Input.TextArea
                    id="ai-change-review-note"
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    rows={2}
                    maxLength={1000}
                    placeholder="e.g. Shorter intro please, and keep the bonus amounts as they are."
                  />
                </label>
                <div className="flex flex-wrap justify-end gap-2">
                  {c.contentType === "page" && c.targetId && c.change.sections && (
                    <button type="button" id="ai-change-preview" onClick={() => preview(c.id)} className={SECONDARY_BUTTON_CLASS}>
                      Preview on Site
                    </button>
                  )}
                  <button type="button" id="ai-change-reject" disabled={busy} onClick={() => review("reject")} className={DANGER_BUTTON_CLASS}>
                    Reject
                  </button>
                  <button
                    type="button"
                    id="ai-change-approve"
                    disabled={busy}
                    onClick={() => review("approve", c.outdated)}
                    className={PRIMARY_BUTTON_CLASS}
                  >
                    {c.outdated ? "Approve Anyway" : c.action === "create" ? "Approve as Draft" : "Approve and Apply"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm text-text-muted dark:border-border-dark dark:text-text-muted-dark">
                <span>
                  {STATUS_STYLES[c.status].label}
                  {c.reviewedByName && ` by ${c.reviewedByName}`}
                  {c.reviewedAt && ` · ${dayjs(c.reviewedAt).format("D MMM YYYY, HH:mm")}`}
                  {c.reviewNote && ` · “${c.reviewNote}”`}
                </span>
                {resultHref && (
                  <button type="button" id="ai-change-open-result" onClick={() => router.push(resultHref)} className={PRIMARY_BUTTON_CLASS}>
                    Open {c.contentType === "page" ? "Page" : "Article"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}

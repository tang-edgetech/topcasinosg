"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import { useSiteSettings } from "@/lib/site-settings-context";
import type { PageRevisionDTO } from "@/lib/types";

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL;
const SMALL_BUTTON_CLASS =
  "btn cursor-pointer rounded-md border border-border bg-surface px-3 py-1 text-xs font-semibold text-text dark:border-border-dark dark:bg-surface-dark dark:text-text-dark disabled:opacity-60";

const SOURCE_LABELS: Record<PageRevisionDTO["source"], string> = {
  editor: "Saved in the editor",
  ai_change: "Approved AI change",
  original: "Before revisions were kept",
};

// A page's last saved versions (Edit Page > Revisions). Every save of the
// page content, in the editor or by approving an AI change, adds one.
// Restoring saves that version as the page content, which itself becomes
// the newest revision, so a restore can be undone the same way.
export default function PageRevisions({ pageId, active, onRestored }: { pageId: number; active: boolean; onRestored: () => void }) {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const { settings } = useSiteSettings();
  const webBase = (WEB_URL || settings?.siteUrl || "").replace(/\/+$/, "");
  const [revisions, setRevisions] = useState<PageRevisionDTO[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    api.get<{ revisions: PageRevisionDTO[] | null }>(`/api/admin/pages/${pageId}/revisions`).then(
      (data) => !cancelled && setRevisions(data.revisions ?? []),
      (err) => !cancelled && message.error(err instanceof ApiError ? err.message : "Could not load revisions."),
    );
    return () => {
      cancelled = true;
    };
  }, [pageId, active, message]);

  async function preview(rev: PageRevisionDTO) {
    const tab = window.open("", "_blank");
    try {
      const { token } = await api.post<{ token: string }>(`/api/admin/pages/${pageId}/preview`, { sections: rev.sections });
      const url = `${webBase}/preview/${token}`;
      if (tab) tab.location.href = url;
      else window.open(url, "_blank");
    } catch (err) {
      tab?.close();
      message.error(err instanceof ApiError ? err.message : "Could not open the preview.");
    }
  }

  async function restore(rev: PageRevisionDTO) {
    const ok = await confirm({
      title: "Restore Revision",
      message: `Replace the page content with the version from ${dayjs(rev.createdAt).format("D MMM YYYY, HH:mm")}? If the page is published, this shows on the website straight away. The current content stays in Revisions, so you can switch back.`,
      confirmLabel: "Restore",
    });
    if (!ok) return;
    setBusy(true);
    try {
      await api.put(`/api/admin/pages/${pageId}/sections`, { sections: rev.sections });
      message.success("Revision restored.");
      onRestored();
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not restore this revision.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div id="page-revisions" className="page-revisions flex flex-col gap-3">
      <p className="text-sm text-text-muted dark:text-text-muted-dark">
        The last 10 saved versions of this page&apos;s content. Older ones are removed automatically. Page Details and SEO aren&apos;t part of a
        revision.
      </p>
      {!revisions ? (
        <p className="text-sm text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : revisions.length === 0 ? (
        <p className="text-sm text-text-muted dark:text-text-muted-dark">No revisions yet — one is kept every time the page content is saved.</p>
      ) : (
        <ol className="flex flex-col divide-y divide-border rounded-lg border border-border dark:divide-border-dark dark:border-border-dark">
          {revisions.map((rev, i) => (
            <li key={rev.id} id={`page-revision-${rev.id}`} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-medium text-text dark:text-text-dark">
                  {dayjs(rev.createdAt).format("D MMM YYYY, HH:mm")}
                  {i === 0 && <span className="ml-2 rounded-full bg-success-subtle px-2 py-0.5 text-xs font-semibold text-success">Current</span>}
                </span>
                <span className="text-xs text-text-muted dark:text-text-muted-dark">
                  {SOURCE_LABELS[rev.source] ?? rev.source}
                  {rev.savedByName && ` · by ${rev.savedByName}`} · {rev.sections.length} section{rev.sections.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex gap-2">
                <button type="button" id={`page-revision-${rev.id}-preview`} onClick={() => preview(rev)} className={SMALL_BUTTON_CLASS}>
                  Preview
                </button>
                {i > 0 && (
                  <button
                    type="button"
                    id={`page-revision-${rev.id}-restore`}
                    disabled={busy}
                    onClick={() => restore(rev)}
                    className="btn cursor-pointer rounded-md bg-primary-900 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    Restore
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

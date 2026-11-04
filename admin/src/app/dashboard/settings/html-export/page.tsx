"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { App as AntApp, Button, Tag } from "antd";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import { isSuperAdmin } from "@/lib/roles";
import { formatFileSize } from "@/lib/format";
import { useConfirm } from "@/components/ConfirmDialog";
import type { HTMLExportDTO } from "@/lib/types";

const DATE_TIME_FORMAT = "D MMM YYYY, h:mm A";
const POLL_MS = 2000;

const CARD_CLASS = "rounded-lg border border-border p-4 dark:border-border-dark";
const HEADING_CLASS = "mb-1 text-lg font-bold text-text dark:text-text-dark";
const MUTED_CLASS = "text-sm text-text-muted dark:text-text-muted-dark";

const STATE_TAGS: Record<HTMLExportDTO["state"], { color: string; label: string }> = {
  idle: { color: "default", label: "Not run yet" },
  running: { color: "processing", label: "Exporting…" },
  done: { color: "success", label: "Ready" },
  failed: { color: "error", label: "Failed" },
};

// Settings > HTML Export (Super Admin only): saves the whole public website
// as a zip of HTML files, with its styles, scripts and images
// (api/internal/service/html_export_service.go). One export at a time; the
// latest zip is kept on the server for download.
export default function HTMLExportSettingsPage() {
  const { user } = useAuth();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [status, setStatus] = useState<HTMLExportDTO | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"" | "start" | "cancel" | "download">("");

  const running = status?.state === "running";
  const allowed = user ? isSuperAdmin(user) : false;

  // Load once, then keep polling while an export runs.
  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = () =>
      api.get<{ export: HTMLExportDTO }>("/api/admin/html-export").then(
        (data) => {
          if (cancelled) return;
          setStatus(data.export);
          setError("");
          if (data.export.state === "running") timer = setTimeout(load, POLL_MS);
        },
        (err) => !cancelled && setError(err instanceof ApiError ? err.message : "Could not load the export status."),
      );
    load();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [allowed, running]);

  if (!user) return null;
  if (!allowed) {
    return <p className={MUTED_CLASS}>Only a Super Admin can export the website.</p>;
  }

  async function start() {
    const ok = await confirm({
      title: "Export the whole website?",
      message: "This saves every public page, with its styles, scripts and images, as a zip. It usually takes under a minute. The previous export is replaced when this one finishes.",
      confirmLabel: "Start export",
    });
    if (!ok) return;
    setBusy("start");
    try {
      const data = await api.post<{ export: HTMLExportDTO }>("/api/admin/html-export");
      setStatus(data.export);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not start the export.");
    } finally {
      setBusy("");
    }
  }

  async function cancel() {
    setBusy("cancel");
    try {
      const data = await api.post<{ export: HTMLExportDTO }>("/api/admin/html-export/cancel");
      setStatus(data.export);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not cancel the export.");
    } finally {
      setBusy("");
    }
  }

  async function download() {
    if (!status?.fileName) return;
    setBusy("download");
    try {
      const blob = await api.download("/api/admin/html-export/download");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = status.fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not download the export.");
    } finally {
      setBusy("");
    }
  }

  const tag = status ? STATE_TAGS[status.state] : null;

  return (
    <section id="html-export-page" className="html-export-page flex max-w-3xl flex-col gap-4">
      <div className={CARD_CLASS}>
        <h2 className={HEADING_CLASS}>Export the website as HTML</h2>
        <p className={MUTED_CLASS}>
          Saves every public page as plain HTML files in one zip, with the styles, scripts, fonts and images they use. Unzip it and
          open index.html directly, use VS Code Live Server, put the folder in XAMPP&apos;s htdocs, or upload it to any web host (root
          or subfolder).
        </p>
        <ul className={`mt-2 list-disc pl-5 ${MUTED_CLASS}`}>
          <li>The copy is frozen at export time: later changes in the admin need a new export.</li>
          <li>Menus, sliders, tabs, the casino finder and the bonus calculator work offline.</li>
          <li>Cloudflare&apos;s analytics and email protection are left out, since they only work behind Cloudflare.</li>
          <li>The zip includes a README.txt on how to open it.</li>
        </ul>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button id="html-export-start" type="primary" loading={busy === "start"} disabled={running || !status} onClick={start}>
            Start export
          </Button>
          {running && (
            <Button id="html-export-cancel" danger loading={busy === "cancel"} onClick={cancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {status && (
        <div id="html-export-status" className={CARD_CLASS}>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={`${HEADING_CLASS} mb-0`}>{running ? "Export in progress" : "Latest export"}</h2>
            {tag && <Tag color={tag.color}>{tag.label}</Tag>}
          </div>

          <dl className="mt-3 grid grid-cols-[140px_1fr] gap-x-3 gap-y-1.5 text-sm text-text dark:text-text-dark">
            {status.siteUrl && (
              <>
                <dt className="text-text-muted dark:text-text-muted-dark">Website</dt>
                <dd className="break-all">{status.siteUrl}</dd>
              </>
            )}
            {status.startedAt && (
              <>
                <dt className="text-text-muted dark:text-text-muted-dark">Started</dt>
                <dd>
                  {dayjs(status.startedAt).format(DATE_TIME_FORMAT)}
                  {status.startedBy && ` by ${status.startedBy}`}
                </dd>
              </>
            )}
            {status.finishedAt && !running && (
              <>
                <dt className="text-text-muted dark:text-text-muted-dark">Finished</dt>
                <dd>{dayjs(status.finishedAt).format(DATE_TIME_FORMAT)}</dd>
              </>
            )}
            {(status.pages > 0 || running) && (
              <>
                <dt className="text-text-muted dark:text-text-muted-dark">Saved</dt>
                <dd>
                  {status.pages} pages, {status.files} other files ({formatFileSize(status.bytes)})
                  {running && status.queued > 0 && <span className="text-text-muted dark:text-text-muted-dark"> · {status.queued} to go</span>}
                </dd>
              </>
            )}
          </dl>

          {status.error && <p className="mt-3 text-sm text-danger">{status.error}</p>}

          {status.fileName && !running && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button id="html-export-download" type="primary" loading={busy === "download"} onClick={download}>
                Download zip ({formatFileSize(status.fileSize)})
              </Button>
              <span className={MUTED_CLASS}>{status.fileName}</span>
            </div>
          )}

          {status.failureCount > 0 && (
            <div id="html-export-failures" className="mt-4">
              <h3 className="text-sm font-semibold text-text dark:text-text-dark">
                {status.failureCount} link{status.failureCount === 1 ? "" : "s"} couldn&apos;t be saved
              </h3>
              <p className={MUTED_CLASS}>
                Usually links on the site to pages that are drafts or no longer exist (status 404): worth fixing on the site itself.
                {status.failureCount > status.failures.length && ` The first ${status.failures.length} are listed.`}
              </p>
              <ul className="mt-2 max-h-64 overflow-auto rounded-md border border-border text-[13px] dark:border-border-dark">
                {status.failures.map((f) => (
                  <li key={f.url} className="flex justify-between gap-3 border-b border-border px-3 py-1.5 last:border-b-0 dark:border-border-dark">
                    <span className="break-all font-mono">{f.url}</span>
                    <span className="shrink-0 text-text-muted dark:text-text-muted-dark">{f.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { api, ApiError } from "@/lib/api";
import type { CommitInfoDTO, DeploymentDTO, LogTailDTO, SystemStatusDTO } from "@/lib/types";

dayjs.extend(relativeTime);

const DATE_TIME_FORMAT = "D MMM YYYY, h:mm A";
const LINE_OPTIONS = [100, 200, 500, 1000, 2000];

const CARD_CLASS = "rounded-lg border border-border p-4 dark:border-border-dark";
const HEADING_CLASS = "mb-1 text-lg font-bold text-text dark:text-text-dark";
const MUTED_CLASS = "text-sm text-text-muted dark:text-text-muted-dark";
const INPUT_CLASS =
  "rounded-md border border-border bg-surface px-3 py-2 text-sm text-text dark:border-border-dark dark:bg-surface-dark dark:text-text-dark";
const SECONDARY_BUTTON_CLASS =
  "btn cursor-pointer rounded-md border border-border px-4 py-2 text-sm font-semibold text-text dark:border-border-dark dark:text-text-dark disabled:cursor-not-allowed disabled:opacity-60";

// Same words the API's "errors only" filter keeps (IsErrorLogLine in
// api/internal/service/system_service.go), for highlighting.
const ERROR_LINE = /\b(error|errors|err|fail|failed|failure|panic|fatal|denied|refused|cannot|can't|timeout|exception|killed)\b/i;

function formatTime(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = dayjs(iso);
  return `${d.format(DATE_TIME_FORMAT)} (${d.fromNow()})`;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// Settings > Log: what the server is running, recent deploys, and the cPanel
// log files (deploy/cpanel/README.md). Data: GET /api/admin/system/status.
export default function LogSettingsPage() {
  const [status, setStatus] = useState<SystemStatusDTO | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function load() {
    setLoading(true);
    setError("");
    return api.get<SystemStatusDTO>("/api/admin/system/status").then(
      (result) => {
        setStatus(result);
        setLoading(false);
      },
      (err) => {
        setError(err instanceof ApiError ? err.message : "Could not load the server status.");
        setLoading(false);
      },
    );
  }

  useEffect(() => {
    let cancelled = false;
    api.get<SystemStatusDTO>("/api/admin/system/status").then(
      (result) => !cancelled && setStatus(result),
      (err) => !cancelled && setError(err instanceof ApiError ? err.message : "Could not load the server status."),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="settings-log" className="settings-page flex flex-col gap-10">
      <div className="flex items-center justify-between gap-4">
        <p className={MUTED_CLASS}>Server time is shown in your browser&apos;s time zone.</p>
        <button type="button" onClick={load} disabled={loading} className={SECONDARY_BUTTON_CLASS}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      {error && <p className="form-error text-sm text-danger">{error}</p>}
      {status && (
        <>
          <VersionSection status={status} />
          <DeploymentsSection deployments={status.deployments} />
          <LogViewer status={status} />
        </>
      )}
    </section>
  );
}

function CommitLine({ commit }: { commit: CommitInfoDTO }) {
  return (
    <>
      <p className="font-mono text-sm font-semibold text-text dark:text-text-dark">{commit.short}</p>
      <p className="text-sm text-text dark:text-text-dark">{commit.subject}</p>
      <p className={MUTED_CLASS}>
        {commit.author} · {formatTime(commit.date)}
      </p>
    </>
  );
}

function VersionSection({ status }: { status: SystemStatusDTO }) {
  const { repo, api: build } = status;
  const apiBehind = repo.head && build.commit && !repo.head.hash.startsWith(build.commit) && !build.commit.startsWith(repo.head.hash);
  return (
    <div id="log-version" className="log-version">
      <h2 className={HEADING_CLASS}>Version</h2>
      <p className={`${MUTED_CLASS} mb-4`}>The code on the server compared with the latest commit on GitHub.</p>
      {repo.error && <p className="mb-4 text-sm text-danger">{repo.error}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        <div className={CARD_CLASS}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted dark:text-text-muted-dark">
            Deployed{repo.branch ? ` (${repo.branch})` : ""}
          </p>
          {repo.head ? <CommitLine commit={repo.head} /> : <p className={MUTED_CLASS}>Unknown</p>}
        </div>
        <div className={CARD_CLASS}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted dark:text-text-muted-dark">
            Latest on GitHub
          </p>
          {repo.remote ? (
            <>
              <CommitLine commit={repo.remote} />
              <p className={`mt-2 text-sm font-semibold ${repo.behind > 0 ? "text-secondary-800" : "text-success"}`}>
                {repo.behind > 0
                  ? `${repo.behind} commit${repo.behind === 1 ? "" : "s"} waiting to deploy`
                  : "Up to date"}
              </p>
              {repo.fetchedAt && <p className={MUTED_CLASS}>Checked {dayjs(repo.fetchedAt).fromNow()}</p>}
            </>
          ) : (
            <p className={MUTED_CLASS}>Not fetched yet.</p>
          )}
        </div>
        <div className={CARD_CLASS}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted dark:text-text-muted-dark">
            API process
          </p>
          <p className="font-mono text-sm font-semibold text-text dark:text-text-dark">
            {build.commit ? build.commit.slice(0, 7) : build.version}
            {build.modified && (
              <span
                className="ml-2 font-sans text-xs text-secondary-800"
                title="The checkout had uncommitted files when the API was built. They may be in the admin or website rather than the API."
              >
                (built with uncommitted files)
              </span>
            )}
          </p>
          <p className={MUTED_CLASS}>Started {formatTime(build.startedAt)}</p>
          {build.goVersion && <p className={MUTED_CLASS}>{build.goVersion}</p>}
          {apiBehind &&
            (build.apiChanged === false ? (
              <p className="mt-2 text-sm font-semibold text-success">
                API code is up to date — later commits only changed the admin or website.
              </p>
            ) : (
              <p className="mt-2 text-sm font-semibold text-secondary-800">
                {build.apiChanged
                  ? "The API code has changed since this build — restart the API or run a deploy to load it."
                  : "Built from a different commit than the deployed code — check the deploy log."}
              </p>
            ))}
        </div>
      </div>
    </div>
  );
}

const STATUS_STYLES: Record<DeploymentDTO["status"], { label: string; className: string }> = {
  success: { label: "Success", className: "bg-success-subtle text-success" },
  failed: { label: "Failed", className: "bg-danger/10 text-danger" },
  running: { label: "Running", className: "bg-secondary-100 text-secondary-900" },
  interrupted: { label: "Interrupted", className: "bg-surface-muted text-text-muted dark:bg-surface-muted-dark dark:text-text-muted-dark" },
};

function DeploymentsSection({ deployments }: { deployments: DeploymentDTO[] }) {
  return (
    <div id="log-deployments" className="log-deployments">
      <h2 className={HEADING_CLASS}>Latest Deployments</h2>
      <p className={`${MUTED_CLASS} mb-4`}>From deploy.log. Open a deployment to see each step.</p>
      {deployments.length === 0 ? (
        <p className={MUTED_CLASS}>No deployments logged yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {deployments.map((d) => {
            const style = STATUS_STYLES[d.status];
            const seconds = d.finishedAt ? dayjs(d.finishedAt).diff(dayjs(d.startedAt), "second") : null;
            return (
              <li key={`${d.startedAt}-${d.commit}`} className={CARD_CLASS}>
                <details>
                  <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1">
                    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${style.className}`}>{style.label}</span>
                    <span className="font-mono text-sm font-semibold text-text dark:text-text-dark">{d.commit}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-text dark:text-text-dark">{d.subject}</span>
                    <span className={MUTED_CLASS}>
                      {formatTime(d.startedAt)}
                      {seconds !== null && ` · ${seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`}`}
                    </span>
                  </summary>
                  <div className="mt-3 border-t border-border pt-3 dark:border-border-dark">
                    {d.previous && <p className={`${MUTED_CLASS} mb-2`}>Previous version: <span className="font-mono">{d.previous}</span></p>}
                    <ul className="flex flex-col gap-1 font-mono text-xs">
                      {d.steps.map((step, i) => (
                        <li key={i} className={ERROR_LINE.test(step) ? "text-danger" : "text-text dark:text-text-dark"}>
                          {step}
                        </li>
                      ))}
                      {d.steps.length === 0 && <li className={MUTED_CLASS}>No steps logged.</li>}
                    </ul>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function LogViewer({ status }: { status: SystemStatusDTO }) {
  const [key, setKey] = useState(status.logs[0]?.key ?? "api");
  const [lines, setLines] = useState(200);
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [reloads, setReloads] = useState(0);
  const [tail, setTail] = useState<LogTailDTO | null>(null);
  const [error, setError] = useState("");
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    let cancelled = false;
    api.get<LogTailDTO>(`/api/admin/system/logs/${key}?lines=${lines}${errorsOnly ? "&errors=1" : ""}`).then(
      (result) => {
        if (cancelled) return;
        setTail(result);
        setError("");
      },
      (err) => !cancelled && setError(err instanceof ApiError ? err.message : "Could not read the log file."),
    );
    return () => {
      cancelled = true;
    };
  }, [key, lines, errorsOnly, reloads, status]);

  // Newest lines are at the bottom.
  useEffect(() => {
    if (preRef.current) preRef.current.scrollTop = preRef.current.scrollHeight;
  }, [tail]);

  const current = status.logs.find((l) => l.key === key);

  return (
    <div id="log-files" className="log-files">
      <h2 className={HEADING_CLASS}>Log Files</h2>
      <p className={`${MUTED_CLASS} mb-4`}>
        The end of each log file in <span className="font-mono">{status.logDir}</span>, newest at the bottom.
      </p>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <select id="log-file" value={key} onChange={(e) => setKey(e.target.value)} className={INPUT_CLASS} aria-label="Log file">
          {status.logs.map((l) => (
            <option key={l.key} value={l.key}>
              {l.name}
              {l.exists ? ` (${formatSize(l.size)})` : " (not found)"}
            </option>
          ))}
        </select>
        <select
          id="log-lines"
          value={lines}
          onChange={(e) => setLines(Number(e.target.value))}
          className={INPUT_CLASS}
          aria-label="Number of lines"
        >
          {LINE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              Last {n} lines
            </option>
          ))}
        </select>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-text dark:text-text-dark">
          <input type="checkbox" checked={errorsOnly} onChange={(e) => setErrorsOnly(e.target.checked)} className="h-4 w-4" />
          Errors only
        </label>
        <button type="button" onClick={() => setReloads((n) => n + 1)} className={SECONDARY_BUTTON_CLASS}>
          Reload
        </button>
      </div>
      {current && (
        <p className={`${MUTED_CLASS} mb-2`}>
          {current.description}
          {tail?.modifiedAt && ` Last written ${dayjs(tail.modifiedAt).fromNow()}.`}
        </p>
      )}
      {error && <p className="mb-2 text-sm text-danger">{error}</p>}
      <pre
        ref={preRef}
        className="log-files__output h-[28rem] overflow-auto rounded-lg bg-surface-dark p-4 font-mono text-xs leading-5 text-text-dark"
      >
        {!tail
          ? "Loading…"
          : !tail.exists
            ? `${tail.name} doesn't exist yet in ${status.logDir}.`
            : tail.lines.length === 0
              ? errorsOnly
                ? "No error lines."
                : "The file is empty."
              : tail.lines.map((line, i) => (
                  <div key={i} className={ERROR_LINE.test(line) ? "text-danger" : undefined}>
                    {line || " "}
                  </div>
                ))}
      </pre>
      {tail?.partial && (
        <p className={`${MUTED_CLASS} mt-2`}>Only the last 2 MB of this file were read; older lines aren&apos;t shown.</p>
      )}
    </div>
  );
}

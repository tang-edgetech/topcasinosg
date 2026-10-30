"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Input, Modal, App as AntApp } from "antd";
import { api, ApiError } from "@/lib/api";
import { useConfirm } from "@/components/ConfirmDialog";
import type { CommitInfoDTO, DeploymentDTO, SystemStatusDTO } from "@/lib/types";

dayjs.extend(relativeTime);

const DATE_TIME_FORMAT = "D MMM YYYY, h:mm A";

const CARD_CLASS = "rounded-lg border border-border p-4 dark:border-border-dark";
const HEADING_CLASS = "mb-1 text-lg font-bold text-text dark:text-text-dark";
const MUTED_CLASS = "text-sm text-text-muted dark:text-text-muted-dark";
const INPUT_CLASS =
  "rounded-md border border-border bg-surface px-3 py-2 text-sm text-text dark:border-border-dark dark:bg-surface-dark dark:text-text-dark";
const SECONDARY_BUTTON_CLASS =
  "btn cursor-pointer rounded-md border border-border px-4 py-2 text-sm font-semibold text-text dark:border-border-dark dark:text-text-dark disabled:cursor-not-allowed disabled:opacity-60";

// Lines that look like errors, for highlighting deploy steps and build output.
const ERROR_LINE = /\b(error|errors|err|fail|failed|failure|panic|fatal|denied|refused|cannot|can't|timeout|exception|killed)\b/i;

function formatTime(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = dayjs(iso);
  return `${d.format(DATE_TIME_FORMAT)} (${d.fromNow()})`;
}

// Settings > Log: what the server is running and recent deploys
// (deploy/cpanel/README.md). Data: GET /api/admin/system/status.
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
          <DeploymentsSection status={status} onChanged={load} />
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

const LIMIT_OPTIONS = [5, 10, 20, 30, 50];

// A failed or interrupted deploy has to be resolved before it can be removed.
function needsResolving(d: DeploymentDTO) {
  return (d.status === "failed" || d.status === "interrupted") && !d.resolved;
}

function DeploymentsSection({ status, onChanged }: { status: SystemStatusDTO; onChanged: () => Promise<void> }) {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const { deployments, deploymentLimit, removed } = status;
  const [busy, setBusy] = useState(false);
  const [resolving, setResolving] = useState<DeploymentDTO | null>(null);
  const [note, setNote] = useState("");

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    try {
      await action();
      message.success(success);
      await onChanged();
      return true;
    } catch (err) {
      message.error(err instanceof ApiError ? err.message : "Could not update the deployment list.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  function changeLimit(limit: number) {
    run(() => api.put("/api/admin/system/deployments/limit", { limit }), `Showing up to ${limit} deployments.`);
  }

  async function handleRemove(d: DeploymentDTO) {
    const ok = await confirm({
      title: "Remove Deployment",
      message: `Remove ${d.commit} "${d.subject}" from this list? deploy.log on the server isn't changed.`,
      confirmLabel: "Remove",
      danger: true,
    });
    if (!ok) return;
    run(() => api.post("/api/admin/system/deployments/remove", { id: d.id }), "Removed from the list.");
  }

  async function handleResolve() {
    if (!resolving) return;
    const done = await run(
      () => api.post("/api/admin/system/deployments/resolve", { id: resolving.id, note }),
      "Marked resolved. It can be removed now.",
    );
    if (done) {
      setResolving(null);
      setNote("");
    }
  }

  return (
    <div id="log-deployments" className="log-deployments">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className={HEADING_CLASS}>Latest Deployments</h2>
          <p className={MUTED_CLASS}>
            From deploy.log. Open a deployment to see each step and its build output. Remove successful ones when you&apos;re done with
            them; a failed one must be marked resolved first.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-text dark:text-text-dark">
          Show
          <select
            id="log-deployment-limit"
            value={deploymentLimit}
            disabled={busy}
            onChange={(e) => changeLimit(Number(e.target.value))}
            className={INPUT_CLASS}
            aria-label="Deployments to show"
          >
            {[...new Set([...LIMIT_OPTIONS, deploymentLimit])]
              .sort((a, b) => a - b)
              .map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
          </select>
          items
        </label>
      </div>
      {deployments.length === 0 ? (
        <p className={MUTED_CLASS}>{removed > 0 ? "Every logged deployment has been removed from this list." : "No deployments logged yet."}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {deployments.map((d) => {
            const style = STATUS_STYLES[d.status];
            const seconds = d.finishedAt ? dayjs(d.finishedAt).diff(dayjs(d.startedAt), "second") : null;
            return (
              <li key={d.id} id={`deployment-${d.commit}`} className={`${CARD_CLASS} flex items-start gap-3`}>
                <details className="min-w-0 flex-1">
                  <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1">
                    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${style.className}`}>{style.label}</span>
                    {d.resolved && <span className="rounded bg-success-subtle px-2 py-0.5 text-xs font-semibold text-success">Resolved</span>}
                    <span className="font-mono text-sm font-semibold text-text dark:text-text-dark">{d.commit}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-text dark:text-text-dark">{d.subject}</span>
                    <span className={MUTED_CLASS}>
                      {formatTime(d.startedAt)}
                      {seconds !== null && ` · ${seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`}`}
                    </span>
                  </summary>
                  <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 dark:border-border-dark">
                    {d.resolved && (
                      <p className="text-sm text-text dark:text-text-dark">
                        <span className="font-semibold text-success">Resolved</span> {formatTime(d.resolved.at)}
                        {d.resolved.byName && ` by ${d.resolved.byName}`}
                        {d.resolved.note && <span className="mt-1 block whitespace-pre-wrap">{d.resolved.note}</span>}
                      </p>
                    )}
                    {d.previous && (
                      <p className={MUTED_CLASS}>
                        Previous version: <span className="font-mono">{d.previous}</span>
                      </p>
                    )}
                    <ul className="flex flex-col gap-1 font-mono text-xs">
                      {d.steps.map((step, i) => (
                        <li key={i} className={ERROR_LINE.test(step) ? "text-danger" : "text-text dark:text-text-dark"}>
                          {step}
                        </li>
                      ))}
                      {d.steps.length === 0 && <li className={MUTED_CLASS}>No steps logged.</li>}
                    </ul>
                    {d.output.length > 0 && (
                      <div>
                        <p className="mb-1 text-xs font-semibold tracking-wide text-text-muted uppercase dark:text-text-muted-dark">
                          Build output (last {d.output.length} lines)
                        </p>
                        <pre className="log-deployments__output max-h-80 overflow-auto rounded-lg bg-surface-dark p-3 font-mono text-xs leading-5 text-text-dark">
                          {d.output.map((line, i) => (
                            <div key={i} className={ERROR_LINE.test(line) ? "text-danger" : undefined}>
                              {line}
                            </div>
                          ))}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
                {d.status !== "running" && (
                  <div className="flex shrink-0 gap-2">
                    {needsResolving(d) ? (
                      <button
                        type="button"
                        id={`deployment-${d.commit}-resolve`}
                        disabled={busy}
                        onClick={() => {
                          setNote("");
                          setResolving(d);
                        }}
                        className="btn cursor-pointer rounded-md bg-primary-900 px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Mark resolved
                      </button>
                    ) : (
                      <button
                        type="button"
                        id={`deployment-${d.commit}-remove`}
                        disabled={busy}
                        onClick={() => handleRemove(d)}
                        className="btn cursor-pointer rounded-md border border-border px-3 py-1 text-xs font-semibold text-text disabled:cursor-not-allowed disabled:opacity-60 dark:border-border-dark dark:text-text-dark"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {removed > 0 && (
        <p className={`${MUTED_CLASS} mt-3`}>
          {removed} deployment{removed === 1 ? "" : "s"} removed from this list.
        </p>
      )}

      <Modal
        open={resolving !== null}
        title={resolving ? `Mark ${resolving.commit} resolved` : ""}
        okText="Mark resolved"
        confirmLoading={busy}
        onOk={handleResolve}
        onCancel={() => setResolving(null)}
      >
        <p className="mb-2 text-sm text-text dark:text-text-dark">
          Confirm the problem behind this {resolving?.status === "interrupted" ? "interrupted" : "failed"} deploy has been dealt with — for
          example a later deploy succeeded. After this it can be removed from the list.
        </p>
        <Input.TextArea
          id="deployment-resolve-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="What fixed it (optional), e.g. deploy.sh now runs npm install — fixed in dac9aa0."
        />
      </Modal>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Modal, App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { ComponentRevisionDTO } from "@/lib/types";

// What changed in a revision compared with the one saved before it.
function changedFields(rev: ComponentRevisionDTO, older: ComponentRevisionDTO | undefined): string[] {
  if (!older) return [];
  const changes: [string, boolean][] = [
    ["Name", rev.name !== older.name],
    ["Description", rev.description !== older.description],
    ["Settings", JSON.stringify(rev.settings) !== JSON.stringify(older.settings)],
    ["HTML", rev.html !== older.html],
    ["CSS", rev.css !== older.css],
    ["JavaScript", rev.js !== older.js],
  ];
  return changes.filter(([, changed]) => changed).map(([label]) => label);
}

// The last 10 saved versions of a component. Restoring loads one into the
// form; nothing changes on the site until the form is saved.
export default function ComponentRevisions({ componentId, onRestore }: { componentId: number; onRestore: (rev: ComponentRevisionDTO) => void }) {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [revisions, setRevisions] = useState<ComponentRevisionDTO[] | null>(null);
  const [viewing, setViewing] = useState<ComponentRevisionDTO | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.get<{ revisions: ComponentRevisionDTO[] | null }>(`/api/admin/components/${componentId}/revisions`).then(
      (data) => !cancelled && setRevisions(data.revisions ?? []),
      (err) => !cancelled && message.error(err instanceof ApiError ? err.message : "Could not load revisions."),
    );
    return () => {
      cancelled = true;
    };
  }, [componentId, message]);

  async function handleRestore(rev: ComponentRevisionDTO) {
    const ok = await confirm({
      title: "Restore Revision",
      message: `Load the version saved ${dayjs(rev.createdAt).format("D MMM YYYY, HH:mm")} into the form? The site doesn't change until you click Save.`,
      confirmLabel: "Load into form",
    });
    if (!ok) return;
    setViewing(null);
    onRestore(rev);
    message.info("Revision loaded. Review it, then Save to make it live.");
  }

  const muted = "text-xs text-text-muted dark:text-text-muted-dark";
  return (
    <div id="component-revisions" className="component-revisions flex flex-col gap-3 rounded-lg border border-border p-5 dark:border-border-dark">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-base font-bold text-text dark:text-text-dark">Revisions</h3>
        <span className={muted}>The last 10 saved versions. Older ones are removed automatically.</span>
      </div>
      {!revisions ? (
        <p className={muted}>Loading…</p>
      ) : revisions.length === 0 ? (
        <p className={muted}>No revisions yet.</p>
      ) : (
        <ol className="flex flex-col divide-y divide-border dark:divide-border-dark">
          {revisions.map((rev, i) => {
            const changes = changedFields(rev, revisions[i + 1]);
            return (
              <li key={rev.id} id={`component-revision-${rev.id}`} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-medium text-text dark:text-text-dark">
                    {dayjs(rev.createdAt).format("D MMM YYYY, HH:mm")}
                    {i === 0 && <span className="ml-2 rounded-full bg-success-subtle px-2 py-0.5 text-xs font-semibold text-success">Current</span>}
                  </span>
                  <span className={muted}>
                    {rev.savedByName ? `by ${rev.savedByName}` : "by the system"}
                    {changes.length > 0 && ` · Changed: ${changes.join(", ")}`}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setViewing(rev)}
                    className="btn cursor-pointer rounded-md border border-border bg-surface px-3 py-1 text-xs font-semibold text-text dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
                  >
                    View
                  </button>
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRestore(rev)}
                      className="btn cursor-pointer rounded-md bg-primary-900 px-3 py-1 text-xs font-semibold text-white"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <Modal
        open={viewing !== null}
        onCancel={() => setViewing(null)}
        title={viewing ? `${viewing.name} — ${dayjs(viewing.createdAt).format("D MMM YYYY, HH:mm")}` : ""}
        width={820}
        footer={null}
      >
        {viewing &&
          (
            [
              ["HTML", viewing.html],
              ["CSS", viewing.css],
              ["JavaScript", viewing.js],
              ["Settings", JSON.stringify(viewing.settings, null, 2)],
            ] as const
          ).map(([label, code]) => (
            <div key={label} className="mb-3">
              <div className="mb-1 text-xs font-semibold text-text-muted dark:text-text-muted-dark">{label}</div>
              <pre className="max-h-[30vh] overflow-auto rounded-md bg-surface-muted p-3 font-mono text-xs whitespace-pre text-text dark:bg-surface-muted-dark dark:text-text-dark">
                {code || "(empty)"}
              </pre>
            </div>
          ))}
      </Modal>
    </div>
  );
}

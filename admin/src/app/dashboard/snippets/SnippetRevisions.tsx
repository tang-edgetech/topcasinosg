"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Modal, App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { SnippetRevisionDTO } from "@/lib/types";

// What changed in a revision compared with the one saved before it.
function changedFields(rev: SnippetRevisionDTO, older: SnippetRevisionDTO | undefined): string[] {
  if (!older) return [];
  const targeting = (r: SnippetRevisionDTO) =>
    JSON.stringify(r.conditions.map((c) => [c.groupIndex, c.field, c.operator, c.pageId, c.value]));
  const changes: [string, boolean][] = [
    ["Name", rev.name !== older.name],
    ["Type", rev.codeType !== older.codeType],
    ["Location", rev.location !== older.location],
    ["Content", rev.content !== older.content],
    ["Priority", rev.priority !== older.priority],
    ["Sort Order", rev.sortOrder !== older.sortOrder],
    ["Targeting", targeting(rev) !== targeting(older)],
  ];
  return changes.filter(([, changed]) => changed).map(([label]) => label);
}

// The last few saved versions of a snippet, on its edit route. Restoring
// loads a version into the form above; nothing changes on the site until
// the form is saved (which itself becomes the newest revision).
export default function SnippetRevisions({ snippetId, onRestore }: { snippetId: number; onRestore: (rev: SnippetRevisionDTO) => void }) {
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [revisions, setRevisions] = useState<SnippetRevisionDTO[] | null>(null);
  const [viewing, setViewing] = useState<SnippetRevisionDTO | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.get<{ revisions: SnippetRevisionDTO[] | null }>(`/api/admin/snippets/${snippetId}/revisions`).then(
      (data) => !cancelled && setRevisions(data.revisions ?? []),
      (err) => !cancelled && message.error(err instanceof ApiError ? err.message : "Could not load revisions."),
    );
    return () => {
      cancelled = true;
    };
  }, [snippetId, message]);

  async function handleRestore(rev: SnippetRevisionDTO) {
    const ok = await confirm({
      title: "Restore Revision",
      message: `Load the version saved ${dayjs(rev.createdAt).format("D MMM YYYY, HH:mm")} into the form? The site doesn't change until you click Save.`,
      confirmLabel: "Load into form",
    });
    if (!ok) return;
    setViewing(null);
    onRestore(rev);
    message.info("Revision loaded — review it, then Save to make it live.");
  }

  return (
    <div id="snippet-revisions" className="snippet-revisions flex flex-col gap-3 rounded-lg border border-border p-5 dark:border-border-dark">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-base font-bold text-text dark:text-text-dark">Revisions</h3>
        <span className="text-xs text-text-muted dark:text-text-muted-dark">The last 5 saved versions. Older ones are removed automatically.</span>
      </div>
      {!revisions ? (
        <p className="text-sm text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : revisions.length === 0 ? (
        <p className="text-sm text-text-muted dark:text-text-muted-dark">No revisions yet — one is saved every time this snippet is saved.</p>
      ) : (
        <ol className="snippet-revisions__list flex flex-col divide-y divide-border dark:divide-border-dark">
          {revisions.map((rev, i) => {
            const changes = changedFields(rev, revisions[i + 1]);
            return (
              <li key={rev.id} id={`snippet-revision-${rev.id}`} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-medium text-text dark:text-text-dark">
                    {dayjs(rev.createdAt).format("D MMM YYYY, HH:mm")}
                    {i === 0 && (
                      <span className="ml-2 rounded-full bg-success-subtle px-2 py-0.5 text-xs font-semibold text-success">Current</span>
                    )}
                  </span>
                  <span className="text-xs text-text-muted dark:text-text-muted-dark">
                    {rev.savedByName ? `by ${rev.savedByName}` : "Before revisions were kept"}
                    {changes.length > 0 && ` · Changed: ${changes.join(", ")}`}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    id={`snippet-revision-${rev.id}-view`}
                    onClick={() => setViewing(rev)}
                    className="btn cursor-pointer rounded-md border border-border bg-surface px-3 py-1 text-xs font-semibold text-text dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
                  >
                    View
                  </button>
                  {i > 0 && (
                    <button
                      type="button"
                      id={`snippet-revision-${rev.id}-restore`}
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
        width={760}
        footer={null}
      >
        {viewing && (
          <pre className="max-h-[60vh] overflow-auto rounded-md bg-surface-muted p-3 font-mono text-xs whitespace-pre text-text dark:bg-surface-muted-dark dark:text-text-dark">
            {viewing.content}
          </pre>
        )}
      </Modal>
    </div>
  );
}

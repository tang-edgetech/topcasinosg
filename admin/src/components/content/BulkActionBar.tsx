"use client";

interface BulkAction {
  id: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

// Shared bulk-action bar for every list page's checkbox row-selection —
// appears once `rowSelection` has at least one key selected. Each page
// supplies its own `actions` (a page with no draft/publish workflow, e.g.
// Game Providers, only ever has a Delete action; one with a status workflow
// adds Publish/Set to Draft too) and its own delete-permission gating
// (whether "Delete" appears at all) rather than this component knowing
// about content types or roles.
export default function BulkActionBar({
  count,
  actions,
  onClear,
}: {
  count: number;
  actions: BulkAction[];
  onClear: () => void;
}) {
  if (count === 0) return null;

  return (
    <div className="bulk-action-bar flex items-center gap-3 rounded-md border border-border bg-surface-muted p-3 dark:border-border-dark dark:bg-surface-muted-dark">
      <span className="text-sm font-medium text-text dark:text-text-dark">{count} selected</span>
      {actions.map((a) => (
        <button
          key={a.id}
          type="button"
          id={a.id}
          onClick={a.onClick}
          className={`cursor-pointer rounded-md border px-3 py-1.5 text-sm font-medium ${
            a.danger
              ? "border-danger text-danger hover:bg-danger/10"
              : "border-border text-text hover:bg-surface dark:border-border-dark dark:text-text-dark dark:hover:bg-surface-dark"
          }`}
        >
          {a.label}
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="cursor-pointer text-sm font-medium text-text-muted hover:text-text dark:text-text-muted-dark dark:hover:text-text-dark"
      >
        Clear selection
      </button>
    </div>
  );
}

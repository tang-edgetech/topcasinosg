"use client";

export interface SaveAction {
  id: string;
  label: string;
  savingLabel?: string;
  onSave: () => void;
  saving?: boolean;
  disabled?: boolean;
  variant?: "primary" | "default";
}

// Renders whichever tab's save action(s) are currently registered, pinned
// top-right of #page-edit-page. Stays in flow at first (so it sits next to
// the page title) then sticks 32px from the viewport top once the tab's
// content scrolls past it — see EditPagePage for how each tab registers.
export default function SaveActionBar({ actions }: { actions: SaveAction[] }) {
  if (actions.length === 0) return null;

  return (
    <div id="page-edit-action-bar" className="page-edit-action-bar sticky top-8 z-20 flex justify-end gap-2">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          id={action.id}
          onClick={action.onSave}
          disabled={action.disabled || action.saving}
          className={
            action.variant === "default"
              ? "btn cursor-pointer rounded-md border border-border bg-surface px-4 py-2 text-sm font-semibold text-text shadow-sm hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark dark:hover:bg-surface-muted-dark"
              : "btn btn--primary cursor-pointer rounded-md bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          }
        >
          {action.saving ? (action.savingLabel ?? "Saving…") : action.label}
        </button>
      ))}
    </div>
  );
}

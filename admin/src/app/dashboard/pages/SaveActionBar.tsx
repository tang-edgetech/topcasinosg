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

// Renders whichever tab's actions are currently registered (Add Component,
// Save, Publish…) as a dock floating at the bottom-right of the screen, so
// they're always one click away however far down the page the editor is —
// see EditPagePage for how each tab registers.
export default function SaveActionBar({ actions }: { actions: SaveAction[] }) {
  if (actions.length === 0) return null;

  return (
    <div
      id="page-edit-action-bar"
      className="page-edit-action-bar fixed right-6 bottom-6 z-30 flex flex-wrap justify-end gap-2 rounded-xl border border-border bg-surface/95 p-2 shadow-lg backdrop-blur dark:border-border-dark dark:bg-surface-dark/95"
    >
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

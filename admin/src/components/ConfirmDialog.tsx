"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

// Every add/edit/status-change/delete/logout/reset action in the dashboard
// routes through this instead of window.confirm(), so the dialog matches the
// app's own styling (and dark mode) rather than the browser chrome.
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  function handle(result: boolean) {
    setOptions(null);
    resolver.current?.(result);
    resolver.current = null;
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <div
          id="confirm-dialog-overlay"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-primary-900/40 px-4"
        >
          <div className="confirm-dialog w-full max-w-sm rounded-lg bg-surface p-6 shadow-lg dark:bg-surface-dark">
            <h2 className="confirm-dialog__title mb-2 text-lg font-bold text-text dark:text-text-dark">
              {options.title}
            </h2>
            <p className="confirm-dialog__message mb-6 text-sm text-text-muted dark:text-text-muted-dark">
              {options.message}
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                id="confirm-dialog-cancel"
                onClick={() => handle(false)}
                className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-text-muted hover:text-text dark:text-text-muted-dark dark:hover:text-text-dark"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-dialog-confirm"
                onClick={() => handle(true)}
                className={`cursor-pointer rounded-md px-4 py-2 text-sm font-semibold text-white ${
                  options.danger ? "bg-danger" : "bg-primary-900"
                }`}
              >
                {options.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return ctx;
}

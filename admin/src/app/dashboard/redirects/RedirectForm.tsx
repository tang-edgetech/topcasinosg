"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { App as AntApp } from "antd";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { RedirectDTO } from "@/lib/types";

// Add or edit one redirect. The API checks and tidies the addresses
// (api/internal/service/redirect_service.go); its message is shown as is.
const INPUT =
  "rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark";
const LABEL = "text-sm font-medium text-text dark:text-text-dark";
const HINT = "text-xs text-text-muted dark:text-text-muted-dark";

export default function RedirectForm({ target }: { target: RedirectDTO | null }) {
  const router = useRouter();
  const { message } = AntApp.useApp();
  const confirm = useConfirm();
  const [fromPath, setFromPath] = useState(target?.fromPath ?? "");
  const [toUrl, setToUrl] = useState(target?.toUrl ?? "");
  const [statusCode, setStatusCode] = useState<301 | 302>(target?.statusCode ?? 301);
  const [active, setActive] = useState(target?.active ?? true);
  const [note, setNote] = useState(target?.note ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");
    const ok = await confirm({
      title: target ? "Save Changes" : "Add Redirect",
      message: `Send visitors from ${fromPath.trim()} to ${toUrl.trim()}${active ? "" : " (saved switched off)"}?`,
    });
    if (!ok) return;

    setSubmitting(true);
    const body = { fromPath, toUrl, statusCode, active, note };
    try {
      if (target) {
        await api.put(`/api/admin/redirects/${target.id}`, body);
        message.success("Saved. The website uses it within about a minute.");
      } else {
        await api.post("/api/admin/redirects", body);
        message.success("Redirect added. The website uses it within about a minute.");
      }
      router.push("/dashboard/redirects");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the redirect.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="redirect-form" className="redirect-form flex max-w-xl flex-col gap-4">
      <form id="redirect-form-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label htmlFor="redirect-form-from" className={LABEL}>
            Old Address
          </label>
          <input
            id="redirect-form-from"
            required
            value={fromPath}
            placeholder="/guides"
            onChange={(e) => setFromPath(e.target.value)}
            className={INPUT}
          />
          <p className={HINT}>The path after the domain, or paste the full address. Letter case and a trailing / don&apos;t matter.</p>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="redirect-form-to" className={LABEL}>
            New Address
          </label>
          <input
            id="redirect-form-to"
            required
            value={toUrl}
            placeholder="/sg/guides or https://…"
            onChange={(e) => setToUrl(e.target.value)}
            className={INPUT}
          />
          <p className={HINT}>A page of this site starting with /, or a full https:// address.</p>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className={`${LABEL} mb-1`}>Type</legend>
          <label className="flex items-start gap-2 text-sm text-text dark:text-text-dark">
            <input type="radio" name="redirect-type" id="redirect-form-301" checked={statusCode === 301} onChange={() => setStatusCode(301)} className="mt-1" />
            <span>
              <strong>301 Permanent</strong> — the page has moved for good; search engines move its ranking to the new address.
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm text-text dark:text-text-dark">
            <input type="radio" name="redirect-type" id="redirect-form-302" checked={statusCode === 302} onChange={() => setStatusCode(302)} className="mt-1" />
            <span>
              <strong>302 Temporary</strong> — for now only; search engines keep the old address.
            </span>
          </label>
        </fieldset>

        <label className="flex items-center gap-2 text-sm text-text dark:text-text-dark">
          <input type="checkbox" id="redirect-form-active" checked={active} onChange={(e) => setActive(e.target.checked)} />
          On (switch off to keep it without using it)
        </label>

        <div className="flex flex-col gap-1">
          <label htmlFor="redirect-form-note" className={LABEL}>
            Note <span className="font-normal text-text-muted dark:text-text-muted-dark">(optional)</span>
          </label>
          <input id="redirect-form-note" value={note} maxLength={255} onChange={(e) => setNote(e.target.value)} className={INPUT} />
        </div>

        {error && (
          <p id="redirect-form-error" className="text-sm text-danger">
            {error}
          </p>
        )}
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            id="redirect-form-cancel"
            onClick={() => router.push("/dashboard/redirects")}
            className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-text-muted dark:text-text-muted-dark"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="redirect-form-submit"
            disabled={submitting}
            className="btn btn--primary cursor-pointer rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

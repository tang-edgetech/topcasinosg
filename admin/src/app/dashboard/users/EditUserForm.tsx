"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { AdminUserDTO } from "@/lib/types";
import { titleCase } from "@/lib/format";

export default function EditUserForm({ target }: { target: AdminUserDTO }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [email, setEmail] = useState(target.email);
  const [fullName, setFullName] = useState(target.fullName);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");
    const ok = await confirm({ title: "Save Changes", message: `Update profile details for ${target.fullName}?` });
    if (!ok) return;

    setSubmitting(true);
    try {
      await api.put(`/api/admin/users/${target.id}`, { email, fullName });
      router.push("/dashboard/users");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update user.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="edit-user-form-page" className="edit-user-form-page w-full max-w-sm">
      <p className="mb-4 text-sm text-text-muted dark:text-text-muted-dark">{titleCase(target.role)}</p>
      <form id="edit-user-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="form-field flex flex-col gap-1">
          <label htmlFor="edit-user-full-name" className="text-sm font-medium text-text dark:text-text-dark">
            Full Name
          </label>
          <input
            id="edit-user-full-name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
          />
        </div>
        <div className="form-field flex flex-col gap-1">
          <label htmlFor="edit-user-email" className="text-sm font-medium text-text dark:text-text-dark">
            Email
          </label>
          <input
            id="edit-user-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
          />
        </div>
        {error && <p className="form-error text-sm text-danger">{error}</p>}
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            id="edit-user-cancel"
            onClick={() => router.push("/dashboard/users")}
            className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-text-muted dark:text-text-muted-dark"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="edit-user-submit"
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

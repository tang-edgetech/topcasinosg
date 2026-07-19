"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { AdminUserDTO, Role } from "@/lib/types";
import { assignableRoles } from "@/lib/roles";
import { titleCase } from "@/lib/format";
import PasswordInput from "@/components/PasswordInput";

export default function AddUserForm({ actor }: { actor: AdminUserDTO }) {
  const router = useRouter();
  const confirm = useConfirm();
  const roles = assignableRoles(actor);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(roles[roles.length - 1] ?? "editor");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");
    const ok = await confirm({ title: "Add User", message: `Create a new ${titleCase(role)} account for ${fullName}?` });
    if (!ok) return;

    setSubmitting(true);
    try {
      await api.post("/api/admin/users", { email, password, fullName, role });
      router.push("/dashboard/users");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create user.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="add-user-form-page" className="add-user-form-page w-full max-w-sm">
      <form id="add-user-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="form-field flex flex-col gap-1">
          <label htmlFor="add-user-full-name" className="text-sm font-medium text-text dark:text-text-dark">
            Full Name
          </label>
          <input
            id="add-user-full-name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
          />
        </div>
        <div className="form-field flex flex-col gap-1">
          <label htmlFor="add-user-email" className="text-sm font-medium text-text dark:text-text-dark">
            Email
          </label>
          <input
            id="add-user-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
          />
        </div>
        <div className="form-field flex flex-col gap-1">
          <label htmlFor="add-user-role" className="text-sm font-medium text-text dark:text-text-dark">
            Role
          </label>
          <select
            id="add-user-role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {titleCase(r)}
              </option>
            ))}
          </select>
        </div>
        <PasswordInput id="add-user-password" name="password" label="Temporary Password" value={password} onChange={setPassword} autoComplete="new-password" />
        {error && <p className="form-error text-sm text-danger">{error}</p>}
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            id="add-user-cancel"
            onClick={() => router.push("/dashboard/users")}
            className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-text-muted dark:text-text-muted-dark"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="add-user-submit"
            disabled={submitting}
            className="btn btn--primary cursor-pointer rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

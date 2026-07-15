"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import type { AdminUserDTO, Role } from "@/lib/types";
import { assignableRoles, canManage } from "@/lib/roles";
import PasswordInput from "@/components/PasswordInput";

export default function UsersPage() {
  const { user: actor } = useAuth();
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [resetPasswordTarget, setResetPasswordTarget] = useState<AdminUserDTO | null>(null);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await api.get<{ users: AdminUserDTO[] | null }>("/api/admin/users");
      setUsers(data.users ?? []);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!actor) return null;

  if (actor.role === "editor") {
    return (
      <section id="users-page" className="users-page">
        <p className="text-primary-500">You don&apos;t have access to this section.</p>
      </section>
    );
  }

  async function handleSetStatus(target: AdminUserDTO, status: "active" | "disabled" | "deleted") {
    if (status === "deleted" && !confirm(`Delete ${target.fullName}? This cannot be undone from here.`)) {
      return;
    }
    try {
      await api.put(`/api/admin/users/${target.id}/status`, { status });
      await loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update user.");
    }
  }

  async function handleToggleCrown(target: AdminUserDTO) {
    try {
      await api.put(`/api/admin/users/${target.id}/crown`, { enabled: !target.canManageAdmins });
      await loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update user.");
    }
  }

  async function handleResetOtp(target: AdminUserDTO) {
    if (!confirm(`Reset 2FA for ${target.fullName}? They will need to scan a new QR code next login.`)) {
      return;
    }
    try {
      await api.post(`/api/admin/users/${target.id}/reset-otp`);
      await loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reset 2FA.");
    }
  }

  return (
    <section id="users-page" className="users-page flex flex-col gap-6">
      <div className="users-page__header flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary-900">Users</h1>
        <button
          type="button"
          id="users-add-button"
          onClick={() => setShowAddForm(true)}
          className="btn btn--primary rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white"
        >
          + Add user
        </button>
      </div>

      {error && <p className="form-error text-sm text-danger">{error}</p>}

      {loading ? (
        <p className="text-primary-500">Loading…</p>
      ) : (
        <div className="users-table overflow-x-auto rounded-lg border border-primary-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-primary-50 text-primary-900">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">2FA</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((target) => (
                <UserRow
                  key={target.id}
                  actor={actor}
                  target={target}
                  onSetStatus={handleSetStatus}
                  onToggleCrown={handleToggleCrown}
                  onResetOtp={handleResetOtp}
                  onResetPassword={() => setResetPasswordTarget(target)}
                />
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-primary-500">
                    No users to show.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showAddForm && (
        <AddUserPanel
          actor={actor}
          onClose={() => setShowAddForm(false)}
          onCreated={() => {
            setShowAddForm(false);
            loadUsers();
          }}
        />
      )}

      {resetPasswordTarget && (
        <ResetPasswordPanel
          target={resetPasswordTarget}
          onClose={() => setResetPasswordTarget(null)}
          onReset={() => setResetPasswordTarget(null)}
        />
      )}
    </section>
  );
}

function UserRow({
  actor,
  target,
  onSetStatus,
  onToggleCrown,
  onResetOtp,
  onResetPassword,
}: {
  actor: AdminUserDTO;
  target: AdminUserDTO;
  onSetStatus: (target: AdminUserDTO, status: "active" | "disabled" | "deleted") => void;
  onToggleCrown: (target: AdminUserDTO) => void;
  onResetOtp: (target: AdminUserDTO) => void;
  onResetPassword: () => void;
}) {
  const isSelf = target.id === actor.id;
  const manageable = !isSelf && canManage(actor, target);

  return (
    <tr id={`user-row-${target.id}`} className="user-row border-t border-primary-100">
      <td className="px-4 py-3 text-primary-900">{target.fullName}</td>
      <td className="px-4 py-3 text-primary-500">{target.email}</td>
      <td className="px-4 py-3">
        <span className="capitalize text-primary-900">{target.role.replace("_", " ")}</span>
        {target.role === "admin" && actor.role === "super_admin" && (
          <button
            type="button"
            onClick={() => onToggleCrown(target)}
            title={target.canManageAdmins ? "Remove Crown (can manage other Admins)" : "Grant Crown (can manage other Admins)"}
            className="user-row__crown ml-2 text-secondary-600"
          >
            {target.canManageAdmins ? "👑" : "☆"}
          </button>
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={`user-row__status rounded-full px-2 py-0.5 text-xs font-medium ${
            target.status === "active" ? "bg-success-subtle text-success" : "bg-primary-50 text-primary-500"
          }`}
        >
          {target.status}
        </span>
      </td>
      <td className="px-4 py-3 text-primary-500">{target.otpEnrolled ? "Enrolled" : "Not enrolled"}</td>
      <td className="px-4 py-3">
        {isSelf ? (
          <span className="text-xs text-primary-300">This is you</span>
        ) : manageable ? (
          <div className="user-row__actions flex flex-wrap gap-2">
            <button type="button" onClick={onResetPassword} className="text-xs font-medium text-primary-500 hover:text-primary-900">
              Reset password
            </button>
            <button type="button" onClick={() => onResetOtp(target)} className="text-xs font-medium text-primary-500 hover:text-primary-900">
              Reset 2FA
            </button>
            {target.status === "active" ? (
              <button type="button" onClick={() => onSetStatus(target, "disabled")} className="text-xs font-medium text-primary-500 hover:text-primary-900">
                Disable
              </button>
            ) : (
              <button type="button" onClick={() => onSetStatus(target, "active")} className="text-xs font-medium text-primary-500 hover:text-primary-900">
                Enable
              </button>
            )}
            <button type="button" onClick={() => onSetStatus(target, "deleted")} className="text-xs font-medium text-danger hover:opacity-80">
              Delete
            </button>
          </div>
        ) : (
          <span className="text-xs text-primary-300">Not manageable</span>
        )}
      </td>
    </tr>
  );
}

function AddUserPanel({
  actor,
  onClose,
  onCreated,
}: {
  actor: AdminUserDTO;
  onClose: () => void;
  onCreated: () => void;
}) {
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
    setSubmitting(true);
    try {
      await api.post("/api/admin/users", { email, password, fullName, role });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create user.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="add-user-overlay" className="fixed inset-0 flex items-center justify-center bg-primary-900/40 px-4">
      <div className="add-user-panel w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold text-primary-900">Add user</h2>
        <form id="add-user-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="form-field flex flex-col gap-1">
            <label htmlFor="add-user-full-name" className="text-sm font-medium text-primary-900">
              Full name
            </label>
            <input
              id="add-user-full-name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-md border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-500"
            />
          </div>
          <div className="form-field flex flex-col gap-1">
            <label htmlFor="add-user-email" className="text-sm font-medium text-primary-900">
              Email
            </label>
            <input
              id="add-user-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-500"
            />
          </div>
          <div className="form-field flex flex-col gap-1">
            <label htmlFor="add-user-role" className="text-sm font-medium text-primary-900">
              Role
            </label>
            <select
              id="add-user-role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="rounded-md border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-500"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <PasswordInput id="add-user-password" name="password" label="Temporary password" value={password} onChange={setPassword} autoComplete="new-password" />
          {error && <p className="form-error text-sm text-danger">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" id="add-user-cancel" onClick={onClose} className="rounded-md px-4 py-2 text-sm font-medium text-primary-500">
              Cancel
            </button>
            <button type="submit" id="add-user-submit" disabled={submitting} className="btn btn--primary rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {submitting ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordPanel({
  target,
  onClose,
  onReset,
}: {
  target: AdminUserDTO;
  onClose: () => void;
  onReset: () => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/api/admin/users/${target.id}/reset-password`, { newPassword });
      onReset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reset password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="reset-password-overlay" className="fixed inset-0 flex items-center justify-center bg-primary-900/40 px-4">
      <div className="reset-password-panel w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-1 text-lg font-bold text-primary-900">Reset password</h2>
        <p className="mb-4 text-sm text-primary-500">For {target.fullName} ({target.email})</p>
        <form id="reset-password-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <PasswordInput id="reset-password-new" name="newPassword" label="New password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
          <PasswordInput id="reset-password-confirm" name="confirmPassword" label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
          {error && <p className="form-error text-sm text-danger">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" id="reset-password-cancel" onClick={onClose} className="rounded-md px-4 py-2 text-sm font-medium text-primary-500">
              Cancel
            </button>
            <button type="submit" id="reset-password-submit" disabled={submitting} className="btn btn--primary rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {submitting ? "Saving…" : "Reset password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
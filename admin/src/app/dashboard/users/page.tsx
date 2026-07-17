"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { AdminUserDTO, Role } from "@/lib/types";
import { assignableRoles, canManage } from "@/lib/roles";
import { titleCase } from "@/lib/format";
import PasswordInput from "@/components/PasswordInput";
import IconButton from "@/components/IconButton";
import { IconEdit, IconKey, IconShieldReset, IconPause, IconPlay, IconTrash, IconPlus, IconCrown } from "@/components/Icons";

export default function UsersPage() {
  const { user: actor } = useAuth();
  const confirm = useConfirm();
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUserDTO | null>(null);
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
        <p className="text-text-muted dark:text-text-muted-dark">You don&apos;t have access to this section.</p>
      </section>
    );
  }

  async function handleSetStatus(target: AdminUserDTO, status: "active" | "disabled" | "deleted") {
    const copy = {
      active: { title: "Enable User", message: `Re-enable ${target.fullName}'s account so they can sign in again?` },
      disabled: { title: "Disable User", message: `${target.fullName} will be signed out and unable to log in. Continue?` },
      deleted: { title: "Delete User", message: `Delete ${target.fullName}? This cannot be undone from here.` },
    }[status];
    const ok = await confirm({ ...copy, confirmLabel: titleCase(status === "active" ? "enable" : status), danger: status !== "active" });
    if (!ok) return;

    try {
      await api.put(`/api/admin/users/${target.id}/status`, { status });
      await loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update user.");
    }
  }

  async function handleToggleCrown(target: AdminUserDTO) {
    const next = !target.canManageAdmins;
    const ok = await confirm({
      title: next ? "Grant Crown" : "Remove Crown",
      message: next
        ? `${target.fullName} will be able to manage other Admin accounts.`
        : `${target.fullName} will only be able to manage Editor accounts.`,
      confirmLabel: next ? "Grant" : "Remove",
    });
    if (!ok) return;

    try {
      await api.put(`/api/admin/users/${target.id}/crown`, { enabled: next });
      await loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update user.");
    }
  }

  async function handleResetOtp(target: AdminUserDTO) {
    const ok = await confirm({
      title: "Reset Two-Factor Authentication",
      message: `${target.fullName} will need to scan a new QR code next time they log in.`,
      confirmLabel: "Reset 2FA",
      danger: true,
    });
    if (!ok) return;

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
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Users</h1>
        <IconButton id="users-add-button" title="Add User" onClick={() => setShowAddForm(true)} icon={<IconPlus />} />
      </div>

      {error && <p className="form-error text-sm text-danger">{error}</p>}

      {loading ? (
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : (
        <div className="users-table overflow-x-auto rounded-lg border border-border dark:border-border-dark">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-text dark:bg-surface-muted-dark dark:text-text-dark">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
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
                  onEdit={() => setEditTarget(target)}
                  onSetStatus={handleSetStatus}
                  onToggleCrown={handleToggleCrown}
                  onResetOtp={handleResetOtp}
                  onResetPassword={() => setResetPasswordTarget(target)}
                />
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-text-muted dark:text-text-muted-dark">
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

      {editTarget && (
        <EditUserPanel
          target={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
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
  onEdit,
  onSetStatus,
  onToggleCrown,
  onResetOtp,
  onResetPassword,
}: {
  actor: AdminUserDTO;
  target: AdminUserDTO;
  onEdit: () => void;
  onSetStatus: (target: AdminUserDTO, status: "active" | "disabled" | "deleted") => void;
  onToggleCrown: (target: AdminUserDTO) => void;
  onResetOtp: (target: AdminUserDTO) => void;
  onResetPassword: () => void;
}) {
  const isSelf = target.id === actor.id;
  const manageable = !isSelf && canManage(actor, target);

  return (
    <tr id={`user-row-${target.id}`} className="user-row border-t border-border dark:border-border-dark">
      <td className="px-4 py-3">
        <p className="user-row__name text-[15px] font-semibold leading-tight text-text dark:text-text-dark">
          {target.fullName}
        </p>
        <p className="user-row__email text-[13px] font-normal leading-tight text-text-muted dark:text-text-muted-dark">
          {target.email}
        </p>
      </td>
      <td className="px-4 py-3">
        <span className="text-text dark:text-text-dark">{titleCase(target.role)}</span>
        {target.role === "admin" && actor.role === "super_admin" && (
          <span className="ml-2 inline-flex align-middle">
            <IconButton
              id={`user-row-${target.id}-crown`}
              title={target.canManageAdmins ? "Remove Crown" : "Grant Crown"}
              onClick={() => onToggleCrown(target)}
              variant={target.canManageAdmins ? "primary" : "muted"}
              icon={<IconCrown width={14} height={14} />}
            />
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={`user-row__status rounded-full px-2 py-0.5 text-xs font-medium ${
            target.status === "active"
              ? "bg-success-subtle text-success"
              : "bg-surface-muted text-text-muted dark:bg-surface-muted-dark dark:text-text-muted-dark"
          }`}
        >
          {titleCase(target.status)}
        </span>
      </td>
      <td className="px-4 py-3 text-text-muted dark:text-text-muted-dark">
        {target.otpEnrolled ? "Enrolled" : "Not Enrolled"}
      </td>
      <td className="px-4 py-3">
        {isSelf ? (
          <span className="text-xs text-text-muted dark:text-text-muted-dark">You</span>
        ) : manageable ? (
          <div className="user-row__actions flex flex-wrap gap-2">
            <IconButton id={`user-row-${target.id}-edit`} title="Edit User" onClick={onEdit} icon={<IconEdit />} variant="muted" />
            <IconButton
              id={`user-row-${target.id}-reset-password`}
              title="Reset Password"
              onClick={onResetPassword}
              icon={<IconKey />}
              variant="muted"
            />
            <IconButton
              id={`user-row-${target.id}-reset-otp`}
              title="Reset 2FA"
              onClick={() => onResetOtp(target)}
              icon={<IconShieldReset />}
              variant="muted"
            />
            {target.status === "active" ? (
              <IconButton
                id={`user-row-${target.id}-disable`}
                title="Disable User"
                onClick={() => onSetStatus(target, "disabled")}
                icon={<IconPause />}
                variant="muted"
              />
            ) : (
              <IconButton
                id={`user-row-${target.id}-enable`}
                title="Enable User"
                onClick={() => onSetStatus(target, "active")}
                icon={<IconPlay />}
                variant="muted"
              />
            )}
            <IconButton
              id={`user-row-${target.id}-delete`}
              title="Delete User"
              onClick={() => onSetStatus(target, "deleted")}
              icon={<IconTrash />}
              variant="danger"
            />
          </div>
        ) : (
          <span className="text-xs text-text-muted dark:text-text-muted-dark">Not Manageable</span>
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
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create user.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="add-user-overlay" className="fixed inset-0 z-[90] flex items-center justify-center bg-primary-900/40 px-4">
      <div className="add-user-panel w-full max-w-sm rounded-lg bg-surface p-6 shadow-lg dark:bg-surface-dark">
        <h2 className="mb-4 text-lg font-bold text-text dark:text-text-dark">Add User</h2>
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
            <button type="button" id="add-user-cancel" onClick={onClose} className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-text-muted dark:text-text-muted-dark">
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
    </div>
  );
}

function EditUserPanel({
  target,
  onClose,
  onSaved,
}: {
  target: AdminUserDTO;
  onClose: () => void;
  onSaved: () => void;
}) {
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
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update user.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="edit-user-overlay" className="fixed inset-0 z-[90] flex items-center justify-center bg-primary-900/40 px-4">
      <div className="edit-user-panel w-full max-w-sm rounded-lg bg-surface p-6 shadow-lg dark:bg-surface-dark">
        <h2 className="mb-1 text-lg font-bold text-text dark:text-text-dark">Edit User</h2>
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
            <button type="button" id="edit-user-cancel" onClick={onClose} className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-text-muted dark:text-text-muted-dark">
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
  const confirm = useConfirm();
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
    const ok = await confirm({
      title: "Reset Password",
      message: `${target.fullName} will be signed out everywhere and must use the new password next login.`,
      confirmLabel: "Reset Password",
      danger: true,
    });
    if (!ok) return;

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
    <div id="reset-password-overlay" className="fixed inset-0 z-[90] flex items-center justify-center bg-primary-900/40 px-4">
      <div className="reset-password-panel w-full max-w-sm rounded-lg bg-surface p-6 shadow-lg dark:bg-surface-dark">
        <h2 className="mb-1 text-lg font-bold text-text dark:text-text-dark">Reset Password</h2>
        <p className="mb-4 text-sm text-text-muted dark:text-text-muted-dark">
          For {target.fullName} ({target.email})
        </p>
        <form id="reset-password-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <PasswordInput id="reset-password-new" name="newPassword" label="New Password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
          <PasswordInput id="reset-password-confirm" name="confirmPassword" label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
          {error && <p className="form-error text-sm text-danger">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" id="reset-password-cancel" onClick={onClose} className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium text-text-muted dark:text-text-muted-dark">
              Cancel
            </button>
            <button
              type="submit"
              id="reset-password-submit"
              disabled={submitting}
              className="btn btn--primary cursor-pointer rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

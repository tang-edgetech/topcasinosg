"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { AdminUserDTO } from "@/lib/types";
import { canManage } from "@/lib/roles";
import { titleCase } from "@/lib/format";
import PasswordInput from "@/components/PasswordInput";
import IconButton from "@/components/IconButton";
import { IconEdit, IconKey, IconShieldReset, IconPause, IconPlay, IconTrash, IconPlus, IconCrown } from "@/components/Icons";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/pagination";

export default function UsersPage() {
  const { user: actor } = useAuth();
  const confirm = useConfirm();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resetPasswordTarget, setResetPasswordTarget] = useState<AdminUserDTO | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

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
        <IconButton id="users-add-button" title="Add User" onClick={() => router.push("/dashboard/users/new")} icon={<IconPlus />} />
      </div>

      {error && <p className="form-error text-sm text-danger">{error}</p>}

      {loading ? (
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : (
        <>
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
                {users.slice((page - 1) * pageSize, page * pageSize).map((target) => (
                  <UserRow
                    key={target.id}
                    actor={actor}
                    target={target}
                    onEdit={() => router.push(`/dashboard/users/${target.id}`)}
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

          {users.length > 0 && (
            <div id="users-pagination" className="users-pagination flex items-center justify-between text-sm text-text-muted dark:text-text-muted-dark">
              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <select
                  id="users-page-size"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="cursor-pointer rounded-md border border-border bg-surface px-2 py-1 text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span>
                  {Math.min((page - 1) * pageSize + 1, users.length)}–{Math.min(page * pageSize, users.length)} of {users.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="users-page-prev"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="cursor-pointer rounded-md border border-border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-border-dark"
                >
                  Prev
                </button>
                <button
                  type="button"
                  id="users-page-next"
                  disabled={page * pageSize >= users.length}
                  onClick={() => setPage((p) => p + 1)}
                  className="cursor-pointer rounded-md border border-border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-border-dark"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
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
    <tr
      id={`user-row-${target.id}`}
      className={`user-row border-t border-border dark:border-border-dark ${
        target.status !== "active" ? "bg-surface-muted dark:bg-surface-muted-dark" : ""
      }`}
    >
      <td className="px-4 py-3">
        <div className="user-row__name-wrap relative inline-block">
          {target.canManageAdmins && (
            <span
              id={`user-row-${target.id}-crown-badge`}
              title="Can Manage Admins"
              className="user-row__crown-badge absolute -right-4 -top-2 text-yellow-400"
            >
              <IconCrown width={14} height={14} />
            </span>
          )}
          <p className="user-row__name text-[15px] font-semibold leading-tight text-text dark:text-text-dark">
            {target.fullName}
          </p>
        </div>
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

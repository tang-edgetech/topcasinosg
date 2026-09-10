"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "antd";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { AdminUserDTO } from "@/lib/types";
import { canManage } from "@/lib/roles";
import { titleCase } from "@/lib/format";
import { runBulkAction, bulkResultMessage } from "@/lib/bulk";
import PasswordInput from "@/components/PasswordInput";
import BulkActionBar from "@/components/content/BulkActionBar";
import IconButton from "@/components/IconButton";
import { IconEdit, IconKey, IconShieldReset, IconPause, IconPlay, IconTrash, IconPlus, IconCrown } from "@/components/Icons";
import { CLIENT_TABLE_PAGINATION } from "@/lib/pagination";

type UserStatusFilter = "all" | "active" | "disabled";

export default function UsersPage() {
  const { user: actor } = useAuth();
  const confirm = useConfirm();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resetPasswordTarget, setResetPasswordTarget] = useState<AdminUserDTO | null>(null);
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

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

  // Bulk actions can only ever apply to rows the actor is individually
  // allowed to manage (see canManage/isSelf below, same rule the per-row
  // Actions column already enforces) — filtering happens once here so both
  // the checkbox `getCheckboxProps` and the bulk handlers agree on it.
  const isManageable = (target: AdminUserDTO) => target.id !== actor.id && canManage(actor, target);
  const filtered = statusFilter === "all" ? users : users.filter((u) => u.status === statusFilter);
  const selectedUsers = users.filter((u) => selectedRowKeys.includes(u.id) && isManageable(u));

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

  async function handleBulkSetStatus(status: "active" | "disabled" | "deleted") {
    const copy = {
      active: "Enable",
      disabled: "Disable",
      deleted: "Delete",
    }[status];
    const ok = await confirm({
      title: `${copy} Users`,
      message: `${copy} ${selectedUsers.length} user(s)?`,
      confirmLabel: copy,
      danger: status !== "active",
    });
    if (!ok) return;
    const { succeeded, failed } = await runBulkAction(selectedUsers, (u) => api.put(`/api/admin/users/${u.id}/status`, { status }));
    setError(failed > 0 ? bulkResultMessage(succeeded, failed, "updated") : "");
    setSelectedRowKeys([]);
    loadUsers();
  }

  return (
    <section id="users-page" className="users-page flex flex-col gap-6">
      <div className="users-page__header flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">Users</h1>
        <IconButton id="users-add-button" title="Add User" onClick={() => router.push("/dashboard/users/new")} icon={<IconPlus />} />
      </div>

      {error && <p className="form-error text-sm text-danger">{error}</p>}

      <div className="flex items-center gap-3">
        <select
          id="users-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as UserStatusFilter)}
          className="cursor-pointer rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      <BulkActionBar
        count={selectedRowKeys.length}
        onClear={() => setSelectedRowKeys([])}
        actions={[
          { id: "users-bulk-enable", label: "Enable", onClick: () => handleBulkSetStatus("active") },
          { id: "users-bulk-disable", label: "Disable", onClick: () => handleBulkSetStatus("disabled") },
          { id: "users-bulk-delete", label: "Delete", onClick: () => handleBulkSetStatus("deleted"), danger: true },
        ]}
      />

      <Table
        id="users-table"
        rowKey="id"
        loading={loading}
        dataSource={filtered}
        pagination={CLIENT_TABLE_PAGINATION}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          getCheckboxProps: (target: AdminUserDTO) => ({ disabled: !isManageable(target) }),
        }}
        columns={[
          {
            title: "Name",
            key: "name",
            sorter: (a, b) => a.fullName.localeCompare(b.fullName),
            render: (_, target) => (
              <div>
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
                  <p className="user-row__name text-[15px] font-semibold leading-tight text-text dark:text-text-dark">{target.fullName}</p>
                </div>
                <p className="user-row__email text-[13px] font-normal leading-tight text-text-muted dark:text-text-muted-dark">{target.email}</p>
              </div>
            ),
          },
          {
            title: "Role",
            key: "role",
            sorter: (a, b) => a.role.localeCompare(b.role),
            render: (_, target) => (
              <>
                <span className="text-text dark:text-text-dark">{titleCase(target.role)}</span>
                {target.role === "admin" && actor.role === "super_admin" && (
                  <span className="ml-2 inline-flex align-middle">
                    <IconButton
                      id={`user-row-${target.id}-crown`}
                      title={target.canManageAdmins ? "Remove Crown" : "Grant Crown"}
                      onClick={() => handleToggleCrown(target)}
                      variant={target.canManageAdmins ? "primary" : "muted"}
                      icon={<IconCrown width={14} height={14} />}
                    />
                  </span>
                )}
              </>
            ),
          },
          {
            title: "Status",
            key: "status",
            sorter: (a, b) => a.status.localeCompare(b.status),
            render: (_, target) => (
              <span
                className={`user-row__status rounded-full px-2 py-0.5 text-xs font-medium ${
                  target.status === "active"
                    ? "bg-success-subtle text-success"
                    : "bg-surface-muted text-text-muted dark:bg-surface-muted-dark dark:text-text-muted-dark"
                }`}
              >
                {titleCase(target.status)}
              </span>
            ),
          },
          {
            title: "2FA",
            key: "otp",
            render: (_, target) => <span className="text-text-muted dark:text-text-muted-dark">{target.otpEnrolled ? "Enrolled" : "Not Enrolled"}</span>,
          },
          {
            title: "Actions",
            key: "actions",
            render: (_, target) => {
              const isSelf = target.id === actor.id;
              const manageable = isManageable(target);
              if (isSelf) return <span className="text-xs text-text-muted dark:text-text-muted-dark">You</span>;
              if (!manageable) return <span className="text-xs text-text-muted dark:text-text-muted-dark">Not Manageable</span>;
              return (
                <div className="user-row__actions flex flex-wrap gap-2">
                  <IconButton
                    id={`user-row-${target.id}-edit`}
                    title="Edit User"
                    onClick={() => router.push(`/dashboard/users/${target.id}`)}
                    icon={<IconEdit />}
                    variant="muted"
                  />
                  <IconButton
                    id={`user-row-${target.id}-reset-password`}
                    title="Reset Password"
                    onClick={() => setResetPasswordTarget(target)}
                    icon={<IconKey />}
                    variant="muted"
                  />
                  <IconButton
                    id={`user-row-${target.id}-reset-otp`}
                    title="Reset 2FA"
                    onClick={() => handleResetOtp(target)}
                    icon={<IconShieldReset />}
                    variant="muted"
                  />
                  {target.status === "active" ? (
                    <IconButton
                      id={`user-row-${target.id}-disable`}
                      title="Disable User"
                      onClick={() => handleSetStatus(target, "disabled")}
                      icon={<IconPause />}
                      variant="muted"
                    />
                  ) : (
                    <IconButton
                      id={`user-row-${target.id}-enable`}
                      title="Enable User"
                      onClick={() => handleSetStatus(target, "active")}
                      icon={<IconPlay />}
                      variant="muted"
                    />
                  )}
                  <IconButton
                    id={`user-row-${target.id}-delete`}
                    title="Delete User"
                    onClick={() => handleSetStatus(target, "deleted")}
                    icon={<IconTrash />}
                    variant="danger"
                  />
                </div>
              );
            },
          },
        ]}
      />

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

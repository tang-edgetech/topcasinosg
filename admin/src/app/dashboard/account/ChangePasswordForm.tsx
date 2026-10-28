"use client";

import { useState } from "react";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import { passwordRules } from "@/lib/password-rules";
import { useSiteSettings } from "@/lib/site-settings-context";
import PasswordInput from "@/components/PasswordInput";

// ChangePasswordForm is also the forced change-password screen
// (ForcedPasswordChange in app/dashboard/layout.tsx): there it skips the
// confirmation and calls onChanged.
export default function ChangePasswordForm({ forced = false, onChanged }: { forced?: boolean; onChanged?: () => void }) {
  const confirm = useConfirm();
  const { settings } = useSiteSettings();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (!forced) {
      const ok = await confirm({
        title: "Change Password",
        message: "You'll need to use the new password next time you sign in. Continue?",
        confirmLabel: "Change Password",
      });
      if (!ok) return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/admin/account/password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
      onChanged?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not change password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="change-password-section" className="change-password-section max-w-sm">
      {!forced && <h2 className="mb-4 text-lg font-bold text-text dark:text-text-dark">Change Password</h2>}
      <form id="change-password-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <PasswordInput
          id="change-password-current"
          name="currentPassword"
          label="Current Password"
          value={currentPassword}
          onChange={setCurrentPassword}
          autoComplete="current-password"
        />
        <PasswordInput
          id="change-password-new"
          name="newPassword"
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
        />
        <p id="change-password-rules" className="-mt-2 text-xs text-text-muted dark:text-text-muted-dark">
          {passwordRules(settings?.security)}
        </p>
        <PasswordInput
          id="change-password-confirm"
          name="confirmPassword"
          label="Repeat New Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
        />
        {error && <p className="form-error text-sm text-danger">{error}</p>}
        {success && <p className="text-sm text-success">Password updated.</p>}
        <button
          type="submit"
          disabled={submitting}
          className="btn btn--primary cursor-pointer self-start rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Change Password"}
        </button>
      </form>
    </div>
  );
}

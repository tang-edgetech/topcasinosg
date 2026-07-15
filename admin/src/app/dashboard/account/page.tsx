"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";
import PasswordInput from "@/components/PasswordInput";

export default function AccountPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <section id="account-page" className="account-page flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-primary-900">My account</h1>
        <p className="text-primary-500">
          {user.fullName} · {user.email} · <span className="capitalize">{user.role.replace("_", " ")}</span>
        </p>
        <p className="mt-1 text-sm text-primary-500">
          Two-factor authentication: {user.otpEnrolled ? "Enrolled" : "Not enrolled"}
        </p>
      </div>

      <ChangePasswordForm />

      {user.role === "super_admin" && <TwoFactorSettings />}
    </section>
  );
}

function ChangePasswordForm() {
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

    setSubmitting(true);
    try {
      await api.post("/api/admin/account/password", { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not change password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="change-password-section" className="change-password-section max-w-sm">
      <h2 className="mb-4 text-lg font-bold text-primary-900">Change password</h2>
      <form id="change-password-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <PasswordInput
          id="change-password-current"
          name="currentPassword"
          label="Current password"
          value={currentPassword}
          onChange={setCurrentPassword}
          autoComplete="current-password"
        />
        <PasswordInput
          id="change-password-new"
          name="newPassword"
          label="New password"
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
        />
        <PasswordInput
          id="change-password-confirm"
          name="confirmPassword"
          label="Repeat new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
        />
        {error && <p className="form-error text-sm text-danger">{error}</p>}
        {success && <p className="text-sm text-success">Password updated.</p>}
        <button
          type="submit"
          disabled={submitting}
          className="btn btn--primary self-start rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Change password"}
        </button>
      </form>
    </div>
  );
}

function TwoFactorSettings() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get<{ enabled: boolean }>("/api/admin/settings/2fa");
        setEnabled(data.enabled);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not load 2FA setting.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    setError("");
    try {
      await api.put("/api/admin/settings/2fa", { enabled: next });
    } catch (err) {
      setEnabled(!next);
      setError(err instanceof ApiError ? err.message : "Could not update 2FA setting.");
    }
  }

  return (
    <div id="two-factor-settings" className="two-factor-settings max-w-sm">
      <h2 className="mb-1 text-lg font-bold text-primary-900">Two-factor authentication</h2>
      <p className="mb-4 text-sm text-primary-500">
        When enabled, every admin user must set up an authenticator app. This is force-disabled outside of
        production, regardless of this setting.
      </p>
      {loading ? (
        <p className="text-primary-500">Loading…</p>
      ) : (
        <label className="two-factor-settings__toggle flex items-center gap-3">
          <input id="two-factor-toggle" type="checkbox" checked={enabled} onChange={handleToggle} className="h-4 w-4" />
          <span className="text-sm font-medium text-primary-900">
            Require 2FA for all admin users {enabled ? "(on)" : "(off)"}
          </span>
        </label>
      )}
      {error && <p className="form-error mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
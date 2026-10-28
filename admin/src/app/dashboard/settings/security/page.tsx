"use client";

import { useState } from "react";
import { useSiteSettings } from "@/lib/site-settings-context";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";

export default function SecuritySettingsPage() {
  return (
    <section id="settings-security" className="settings-page flex flex-col gap-10">
      <TwoFactorSettings />
    </section>
  );
}

function TwoFactorSettings() {
  const { settings, refresh } = useSiteSettings();
  const { refresh: refreshUser } = useAuth();
  const confirm = useConfirm();
  const [error, setError] = useState("");

  async function handleToggle() {
    const next = !settings?.twoFactorEnabled;
    const ok = await confirm({
      title: next ? "Enable Two-Factor Authentication" : "Disable Two-Factor Authentication",
      message: next
        ? "Everyone, including you, will be signed out and must sign in again with an authenticator code. Users without an authenticator app set it up straight after entering their password (production only)."
        : "Admin users will no longer be required to use two-factor authentication.",
      confirmLabel: next ? "Enable" : "Disable",
      danger: !next,
    });
    if (!ok) return;

    setError("");
    try {
      await api.put("/api/admin/settings/2fa", { enabled: next });
      await refresh();
      // Turning it on ends this session too (it wasn't signed in with a
      // code); re-checking it sends us to the sign-in page when it has.
      if (next) await refreshUser();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update 2FA setting.");
    }
  }

  return (
    <div id="two-factor-settings" className="two-factor-settings max-w-lg">
      <h2 className="mb-1 text-lg font-bold text-text dark:text-text-dark">Two-Factor Authentication</h2>
      <p className="mb-4 text-sm text-text-muted dark:text-text-muted-dark">
        When enabled, every admin user must set up an authenticator app. Force-disabled outside of production
        regardless of this setting.
      </p>
      <label className="two-factor-settings__toggle flex cursor-pointer items-center gap-3">
        <input
          id="two-factor-toggle"
          type="checkbox"
          checked={settings?.twoFactorEnabled ?? false}
          onChange={handleToggle}
          className="h-4 w-4 cursor-pointer"
        />
        <span className="text-sm font-medium text-text dark:text-text-dark">
          Require 2FA For All Admin Users {settings?.twoFactorEnabled ? "(On)" : "(Off)"}
        </span>
      </label>
      {error && <p className="form-error mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}

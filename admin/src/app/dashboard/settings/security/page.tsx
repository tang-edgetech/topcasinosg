"use client";

import { useState } from "react";
import type { SecurityPolicyDTO } from "@/lib/types";
import { useSiteSettings } from "@/lib/site-settings-context";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";

export default function SecuritySettingsPage() {
  const { settings } = useSiteSettings();
  return (
    <section id="settings-security" className="settings-page flex flex-col gap-10">
      <TwoFactorSettings />
      {settings?.security && <SecurityPolicySettings key={JSON.stringify(settings.security)} initial={settings.security} />}
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

const INPUT_CLASS =
  "w-24 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text dark:border-border-dark dark:bg-surface-dark dark:text-text-dark";
const LABEL_CLASS = "text-sm font-medium text-text dark:text-text-dark";
const MUTED_CLASS = "text-sm text-text-muted dark:text-text-muted-dark";

// Sign-in lockout and password rules (domain.SecurityPolicy in
// api/internal/domain/security_policy.go, which enforces them). Remounted
// with fresh values after a save (the key above).
function SecurityPolicySettings({ initial }: { initial: SecurityPolicyDTO }) {
  const { refresh } = useSiteSettings();
  const [policy, setPolicy] = useState<SecurityPolicyDTO>(initial);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const lockoutOn = policy.lockoutAttempts > 0;

  function update(patch: Partial<SecurityPolicyDTO>) {
    setPolicy((p) => ({ ...p, ...patch }));
    setSaved(false);
  }

  async function handleSave(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.put("/api/admin/settings/security", policy);
      setSaved(true);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save the security settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form id="security-policy-settings" className="security-policy-settings flex max-w-lg flex-col gap-8" onSubmit={handleSave}>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-lg font-bold text-text dark:text-text-dark">Failed Sign-In Lockout</legend>
        <p className={MUTED_CLASS}>
          Wrong passwords or 2FA codes in a row lock the account for a while, even with the right password. Admins can
          unlock it early from Users; each failed attempt is in the Activity Log.
        </p>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            id="security-lockout-toggle"
            type="checkbox"
            checked={lockoutOn}
            onChange={(e) => update({ lockoutAttempts: e.target.checked ? 5 : 0 })}
            className="h-4 w-4 cursor-pointer"
          />
          <span className={LABEL_CLASS}>Lock accounts after repeated failed sign-ins</span>
        </label>
        {lockoutOn && (
          <div className="flex flex-wrap items-center gap-2 pl-7 text-sm text-text dark:text-text-dark">
            After
            <input
              id="security-lockout-attempts"
              type="number"
              min={3}
              max={20}
              value={policy.lockoutAttempts}
              onChange={(e) => update({ lockoutAttempts: Number(e.target.value) })}
              className={INPUT_CLASS}
              aria-label="Failed attempts"
            />
            failed attempts, lock for
            <input
              id="security-lockout-minutes"
              type="number"
              min={1}
              max={1440}
              value={policy.lockoutMinutes}
              onChange={(e) => update({ lockoutMinutes: Number(e.target.value) })}
              className={INPUT_CLASS}
              aria-label="Lockout minutes"
            />
            minutes
          </div>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-lg font-bold text-text dark:text-text-dark">Password Rules</legend>
        <p className={MUTED_CLASS}>Apply to every password set from now on; existing passwords keep working.</p>
        <label className="flex flex-wrap items-center gap-2 text-sm text-text dark:text-text-dark">
          Minimum length
          <input
            id="security-password-min-length"
            type="number"
            min={8}
            max={72}
            value={policy.passwordMinLength}
            onChange={(e) => update({ passwordMinLength: Number(e.target.value) })}
            className={INPUT_CLASS}
          />
          characters
        </label>
        {(
          [
            ["passwordRequireMixed", "Require upper and lower case letters"],
            ["passwordRequireNumber", "Require a number"],
            ["passwordRequireSymbol", "Require a symbol"],
            ["forcePasswordChange", "New users and reset passwords must be changed at the next sign-in"],
          ] as const
        ).map(([field, label]) => (
          <label key={field} className="flex cursor-pointer items-center gap-3">
            <input
              id={`security-${field}`}
              type="checkbox"
              checked={policy[field]}
              onChange={(e) => update({ [field]: e.target.checked })}
              className="h-4 w-4 cursor-pointer"
            />
            <span className={LABEL_CLASS}>{label}</span>
          </label>
        ))}
        <p className={MUTED_CLASS}>
          On the live site, the default accounts must change their password while it is still the default one.
        </p>
      </fieldset>

      {error && <p className="form-error text-sm text-danger">{error}</p>}
      {saved && <p className="text-sm text-success">Security settings saved.</p>}
      <button
        id="security-policy-save"
        type="submit"
        disabled={saving}
        className="btn btn--primary cursor-pointer self-start rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save Security Settings"}
      </button>
    </form>
  );
}

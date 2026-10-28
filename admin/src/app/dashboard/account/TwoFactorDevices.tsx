"use client";

import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import QRCode from "qrcode";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { OTPDeviceDTO, OTPDevicesResponse, OTPSetupResponse } from "@/lib/types";
import PasswordInput from "@/components/PasswordInput";

const DATE_TIME_FORMAT = "D MMM YYYY, h:mm A";

const INPUT_CLASS =
  "rounded-md border border-border bg-surface px-3 py-2 text-sm text-text dark:border-border-dark dark:bg-surface-dark dark:text-text-dark";
const PRIMARY_BUTTON_CLASS =
  "btn btn--primary cursor-pointer self-start rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60";
const SECONDARY_BUTTON_CLASS =
  "btn cursor-pointer self-start rounded-md border border-border px-4 py-2 text-sm font-semibold text-text dark:border-border-dark dark:text-text-dark disabled:cursor-not-allowed disabled:opacity-60";

// Adding: password + name → QR code → first code. Removing: password.
type Mode = { kind: "idle" } | { kind: "add" } | { kind: "scan"; secret: string; qr: string } | { kind: "remove"; device: OTPDeviceDTO };

// My Account → Two-Factor Authentication: the user's authenticator apps (up
// to maxDevices), adding a second one, and removing one. The API asks for the
// current password again for both, and refuses to remove the last app while
// 2FA is required (see api/internal/service/auth_service.go).
export default function TwoFactorDevices() {
  const { refresh: refreshUser } = useAuth();
  const confirm = useConfirm();
  const [data, setData] = useState<OTPDevicesResponse | null>(null);
  const [mode, setMode] = useState<Mode>({ kind: "idle" });
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(
    () =>
      api.get<OTPDevicesResponse>("/api/admin/account/otp-devices").then(setData, (err) =>
        setError(err instanceof ApiError ? err.message : "Could not load authenticator apps."),
      ),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    api.get<OTPDevicesResponse>("/api/admin/account/otp-devices").then(
      (result) => !cancelled && setData(result),
      (err) => !cancelled && setError(err instanceof ApiError ? err.message : "Could not load authenticator apps."),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  function reset(next: Mode = { kind: "idle" }) {
    setMode(next);
    setName("");
    setPassword("");
    setCode("");
    setError("");
  }

  async function handleStart(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      const setup = await api.post<OTPSetupResponse>("/api/admin/account/otp-devices/setup", { name: name.trim(), password });
      setMode({ kind: "scan", secret: setup.secret, qr: await QRCode.toDataURL(setup.otpauthUrl) });
      setPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start the setup.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirm(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/api/admin/account/otp-devices/confirm", { code: code.trim() });
      reset();
      setNotice("Authenticator app added.");
      await Promise.all([load(), refreshUser()]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not confirm the code.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(e: React.SubmitEvent) {
    e.preventDefault();
    if (mode.kind !== "remove") return;
    const ok = await confirm({
      title: "Remove Authenticator App",
      message: `"${mode.device.name}" will no longer be able to sign in to this account. Continue?`,
      confirmLabel: "Remove",
      danger: true,
    });
    if (!ok) return;

    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      await api.post(`/api/admin/account/otp-devices/${mode.device.id}/remove`, { password });
      reset();
      setNotice("Authenticator app removed.");
      await Promise.all([load(), refreshUser()]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not remove the app.");
    } finally {
      setSubmitting(false);
    }
  }

  const devices = data?.devices ?? [];
  const maxDevices = data?.maxDevices ?? 2;
  const canAdd = data !== null && devices.length < maxDevices;
  // While 2FA is required, the API keeps the last app; don't offer it.
  const canRemove = data !== null && !(data.required && devices.length <= 1);

  return (
    <div id="two-factor-devices-section" className="two-factor-devices-section max-w-lg">
      <h2 className="mb-1 text-lg font-bold text-text dark:text-text-dark">Two-Factor Authentication</h2>
      <p className="mb-4 text-sm text-text-muted dark:text-text-muted-dark">
        Authenticator apps that can give you sign-in codes — up to {maxDevices}, for example your phone and a backup
        device.
        {data?.required && " Two-factor authentication is required for every admin user, so you must keep at least one."}
      </p>

      {data && (
        <ul id="two-factor-devices-list" className="two-factor-devices__list mb-4 flex flex-col gap-2">
          {devices.length === 0 && (
            <li className="text-sm text-text-muted dark:text-text-muted-dark">No authenticator app set up yet.</li>
          )}
          {devices.map((device) => (
            <li
              key={device.id}
              id={`two-factor-device-${device.id}`}
              className="two-factor-devices__item flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 dark:border-border-dark"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text dark:text-text-dark">{device.name}</p>
                <p className="text-xs text-text-muted dark:text-text-muted-dark">
                  Added {device.confirmedAt ? dayjs(device.confirmedAt).format(DATE_TIME_FORMAT) : "—"}
                  {device.lastUsedAt && ` · Last used ${dayjs(device.lastUsedAt).format(DATE_TIME_FORMAT)}`}
                </p>
              </div>
              {canRemove && mode.kind === "idle" && (
                <button
                  type="button"
                  id={`two-factor-device-${device.id}-remove`}
                  onClick={() => {
                    setNotice("");
                    reset({ kind: "remove", device });
                  }}
                  className="cursor-pointer text-sm font-semibold text-danger"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {notice && <p className="mb-3 text-sm text-success">{notice}</p>}

      {mode.kind === "idle" && canAdd && (
        <button
          type="button"
          id="two-factor-add-button"
          onClick={() => {
            setNotice("");
            reset({ kind: "add" });
          }}
          className={PRIMARY_BUTTON_CLASS}
        >
          Add Authenticator App
        </button>
      )}
      {mode.kind === "idle" && data && !canAdd && (
        <p className="text-sm text-text-muted dark:text-text-muted-dark">
          You have the maximum of {maxDevices} authenticator apps. Remove one to add another.
        </p>
      )}

      {mode.kind === "add" && (
        <form id="two-factor-add-form" className="flex flex-col gap-4" onSubmit={handleStart}>
          <label className="flex flex-col gap-1.5" htmlFor="two-factor-add-name">
            <span className="text-sm font-medium text-text dark:text-text-dark">Device name</span>
            <input
              id="two-factor-add-name"
              name="name"
              required
              maxLength={60}
              placeholder="e.g. Work phone"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={INPUT_CLASS}
            />
          </label>
          <PasswordInput
            id="two-factor-add-password"
            name="password"
            label="Current Password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
          {error && <p className="form-error text-sm text-danger">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className={PRIMARY_BUTTON_CLASS}>
              {submitting ? "Checking…" : "Continue"}
            </button>
            <button type="button" onClick={() => reset()} className={SECONDARY_BUTTON_CLASS}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {mode.kind === "scan" && (
        <form id="two-factor-confirm-form" className="flex flex-col gap-4" onSubmit={handleConfirm}>
          <p className="text-sm text-text-muted dark:text-text-muted-dark">
            Scan this QR code with the new authenticator app (e.g. Google Authenticator), or enter the key manually, then
            type the 6-digit code it shows.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mode.qr} alt="Scan with your authenticator app" width={200} height={200} className="otp-setup__qr" />
          <p className="otp-setup__secret break-all rounded-md bg-surface-muted px-3 py-2 text-center text-xs text-text dark:bg-surface-muted-dark dark:text-text-dark">
            {mode.secret}
          </p>
          <label className="flex flex-col gap-1.5" htmlFor="two-factor-confirm-code">
            <span className="text-sm font-medium text-text dark:text-text-dark">Code from the new app</span>
            <input
              id="two-factor-confirm-code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`${INPUT_CLASS} tracking-widest`}
            />
          </label>
          {error && <p className="form-error text-sm text-danger">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className={PRIMARY_BUTTON_CLASS}>
              {submitting ? "Confirming…" : "Confirm"}
            </button>
            <button type="button" onClick={() => reset()} className={SECONDARY_BUTTON_CLASS}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {mode.kind === "remove" && (
        <form id="two-factor-remove-form" className="flex flex-col gap-4" onSubmit={handleRemove}>
          <p className="text-sm text-text dark:text-text-dark">
            Remove <span className="font-semibold">{mode.device.name}</span>? Enter your password to confirm.
          </p>
          <PasswordInput
            id="two-factor-remove-password"
            name="password"
            label="Current Password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
          {error && <p className="form-error text-sm text-danger">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn--danger cursor-pointer self-start rounded-md bg-danger px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Removing…" : "Remove"}
            </button>
            <button type="button" onClick={() => reset()} className={SECONDARY_BUTTON_CLASS}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {mode.kind === "idle" && error && <p className="form-error mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}

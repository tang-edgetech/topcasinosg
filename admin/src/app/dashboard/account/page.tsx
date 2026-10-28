"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { titleCase } from "@/lib/format";
import TwoFactorDevices from "./TwoFactorDevices";
import ActiveSessions from "./ActiveSessions";
import ChangePasswordForm from "./ChangePasswordForm";

export default function AccountPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <section id="account-page" className="account-page flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-text dark:text-text-dark">My Account</h1>
        <p className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-[15px] font-semibold text-text dark:text-text-dark">{user.fullName}</span>
          <span className="text-[13px] font-normal text-text-muted dark:text-text-muted-dark">@{user.username}</span>
          <span className="text-[13px] font-normal text-text-muted dark:text-text-muted-dark">{user.email}</span>
          <span className="text-[13px] font-normal text-text-muted dark:text-text-muted-dark">
            {titleCase(user.role)}
          </span>
        </p>
      </div>

      <ChangeDisplayNameForm />
      <ChangePasswordForm />
      <TwoFactorDevices />
      <ActiveSessions />
    </section>
  );
}

function ChangeDisplayNameForm() {
  const { user, setFullName } = useAuth();
  const [value, setValue] = useState(user?.fullName ?? "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const trimmed = value.trim();
    if (!trimmed) {
      setError("Display name cannot be empty.");
      return;
    }

    setSubmitting(true);
    try {
      await setFullName(trimmed);
      setValue(trimmed);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update display name.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="change-display-name-section" className="change-display-name-section max-w-sm">
      <h2 className="mb-4 text-lg font-bold text-text dark:text-text-dark">Display Name</h2>
      <form id="change-display-name-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1.5" htmlFor="change-display-name-input">
          <span className="text-sm font-medium text-text dark:text-text-dark">Name</span>
          <input
            id="change-display-name-input"
            name="fullName"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
          />
        </label>
        {error && <p className="form-error text-sm text-danger">{error}</p>}
        {success && <p className="text-sm text-success">Display name updated.</p>}
        <button
          type="submit"
          disabled={submitting}
          className="btn btn--primary cursor-pointer self-start rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}


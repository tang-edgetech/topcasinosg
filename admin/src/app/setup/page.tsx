"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import PasswordInput from "@/components/PasswordInput";

export default function SetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  const [siteUrl, setSiteUrl] = useState("");
  const [siteTitle, setSiteTitle] = useState("");
  const [seoIndex, setSeoIndex] = useState(false);
  const [seoFollow, setSeoFollow] = useState(false);
  const [timezone, setTimezone] = useState("+08:00");
  const [language, setLanguage] = useState("en");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { needsBootstrap } = await api.get<{ needsBootstrap: boolean }>("/api/admin/auth/bootstrap-status");
        if (!needsBootstrap) {
          router.replace("/");
          return;
        }
      } finally {
        setChecking(false);
      }
    })();
  }, [router]);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/admin/auth/bootstrap", {
        email,
        password,
        fullName,
        siteUrl,
        siteTitle,
        seoIndex,
        seoFollow,
        timezone,
        language,
      });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <div id="setup-page" className="flex flex-1 items-center justify-center">
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      </div>
    );
  }

  return (
    <div id="setup-page" className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="auth-card w-full max-w-lg rounded-lg border border-border bg-surface p-8 shadow-sm dark:border-border-dark dark:bg-surface-dark">
        <h1 className="mb-2 text-xl font-bold text-text dark:text-text-dark">Initial Setup</h1>
        <p className="mb-6 text-sm text-text-muted dark:text-text-muted-dark">
          Configure the site and create the first Super Admin account. This screen won&apos;t be reachable again
          once complete.
        </p>

        <form id="setup-form" className="auth-form flex flex-col gap-6" onSubmit={handleSubmit}>
          <fieldset id="setup-site-settings" className="flex flex-col gap-4">
            <legend className="mb-1 text-sm font-semibold text-text dark:text-text-dark">Site Settings</legend>

            <div className="form-field flex flex-col gap-1">
              <label htmlFor="setup-site-title" className="text-sm font-medium text-text dark:text-text-dark">
                Site Title
              </label>
              <input
                id="setup-site-title"
                required
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
              />
            </div>

            <div className="form-field flex flex-col gap-1">
              <label htmlFor="setup-site-url" className="text-sm font-medium text-text dark:text-text-dark">
                Site URL
              </label>
              <input
                id="setup-site-url"
                type="url"
                required
                placeholder="https://topcasinosg.com.sg"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-field flex flex-col gap-1">
                <label htmlFor="setup-timezone" className="text-sm font-medium text-text dark:text-text-dark">
                  Timezone
                </label>
                <select
                  id="setup-timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
                >
                  <option value="+08:00">UTC +8:00 (Singapore)</option>
                  <option value="+00:00">UTC +0:00</option>
                  <option value="+01:00">UTC +1:00</option>
                  <option value="+05:30">UTC +5:30</option>
                  <option value="+09:00">UTC +9:00</option>
                </select>
              </div>

              <div className="form-field flex flex-col gap-1">
                <label htmlFor="setup-language" className="text-sm font-medium text-text dark:text-text-dark">
                  Language
                </label>
                <select
                  id="setup-language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
                >
                  <option value="en">English</option>
                  <option value="cn">Chinese</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-text dark:text-text-dark">
                <input
                  id="setup-seo-index"
                  type="checkbox"
                  checked={seoIndex}
                  onChange={(e) => setSeoIndex(e.target.checked)}
                  className="h-4 w-4 cursor-pointer"
                />
                Allow Search Engines To Index This Site
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-text dark:text-text-dark">
                <input
                  id="setup-seo-follow"
                  type="checkbox"
                  checked={seoFollow}
                  onChange={(e) => setSeoFollow(e.target.checked)}
                  className="h-4 w-4 cursor-pointer"
                />
                Allow Search Engines To Follow Links
              </label>
              <p className="text-xs text-text-muted dark:text-text-muted-dark">
                Both default off (noindex, nofollow) until you turn them on here or in Settings later.
              </p>
            </div>
          </fieldset>

          <fieldset id="setup-super-admin" className="flex flex-col gap-4">
            <legend className="mb-1 text-sm font-semibold text-text dark:text-text-dark">Super Admin Account</legend>

            <div className="form-field flex flex-col gap-1">
              <label htmlFor="setup-full-name" className="text-sm font-medium text-text dark:text-text-dark">
                Full Name
              </label>
              <input
                id="setup-full-name"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
              />
            </div>
            <div className="form-field flex flex-col gap-1">
              <label htmlFor="setup-email" className="text-sm font-medium text-text dark:text-text-dark">
                Email
              </label>
              <input
                id="setup-email"
                name="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-500 dark:border-border-dark dark:bg-surface-dark dark:text-text-dark"
              />
            </div>
            <PasswordInput
              id="setup-password"
              name="password"
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />
            <PasswordInput
              id="setup-confirm-password"
              name="confirmPassword"
              label="Confirm Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />
          </fieldset>

          {error && <p className="form-error text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn--primary cursor-pointer rounded-md bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}

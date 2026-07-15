"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import PasswordInput from "@/components/PasswordInput";

export default function SetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
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
      await api.post("/api/admin/auth/bootstrap", { email, password, fullName });
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
        <p className="text-primary-500">Loading…</p>
      </div>
    );
  }

  return (
    <div id="setup-page" className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="auth-card w-full max-w-sm rounded-lg border border-primary-100 p-8 shadow-sm">
        <h1 className="mb-2 text-xl font-bold text-primary-900">Create the Super Admin account</h1>
        <p className="mb-6 text-sm text-primary-500">
          This one-time setup creates the first account for the dev team. It won&apos;t be reachable again once
          created.
        </p>

        <form id="setup-form" className="auth-form flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="form-field flex flex-col gap-1">
            <label htmlFor="setup-full-name" className="text-sm font-medium text-primary-900">
              Full name
            </label>
            <input
              id="setup-full-name"
              name="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="rounded-md border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-500"
            />
          </div>
          <div className="form-field flex flex-col gap-1">
            <label htmlFor="setup-email" className="text-sm font-medium text-primary-900">
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
              className="rounded-md border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-500"
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
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
          />
          {error && <p className="form-error text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="btn btn--primary mt-2 rounded-md bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create Super Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
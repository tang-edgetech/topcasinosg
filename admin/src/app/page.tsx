"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { api, ApiError } from "@/lib/api";
import type { LoginResponse, OTPSetupResponse } from "@/lib/types";
import PasswordInput from "@/components/PasswordInput";
import BrandMark from "@/components/BrandMark";
import { useSiteSettings } from "@/lib/site-settings-context";

type Step = "checking" | "credentials" | "otp-verify" | "otp-setup";

export default function LoginPage() {
  const router = useRouter();
  const { settings } = useSiteSettings();
  const [step, setStep] = useState<Step>("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [ephemeralToken, setEphemeralToken] = useState("");
  const [otpSecret, setOtpSecret] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { needsBootstrap } = await api.get<{ needsBootstrap: boolean }>("/api/admin/auth/bootstrap-status");
        if (needsBootstrap) {
          router.replace("/setup");
          return;
        }
      } catch {
        // If the check itself fails, fall through to the login form rather
        // than trapping the operator on a blank screen.
      }

      try {
        await api.get("/api/admin/auth/me");
        router.replace("/dashboard");
      } catch {
        setStep("credentials");
      }
    })();
  }, [router]);

  async function handleLogin(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const outcome = await api.post<LoginResponse>("/api/admin/auth/login", { email, password });
      await handleOutcome(outcome);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOutcome(outcome: LoginResponse) {
    if (outcome.status === "ok") {
      router.replace("/dashboard");
      return;
    }
    if (outcome.status === "otp_required") {
      setEphemeralToken(outcome.ephemeralToken ?? "");
      setStep("otp-verify");
      return;
    }
    if (outcome.status === "otp_setup_required") {
      const token = outcome.ephemeralToken ?? "";
      setEphemeralToken(token);
      const setup = await api.post<OTPSetupResponse>("/api/admin/auth/otp/setup", { ephemeralToken: token });
      setOtpSecret(setup.secret);
      setQrDataUrl(await QRCode.toDataURL(setup.otpauthUrl));
      setStep("otp-setup");
    }
  }

  async function handleVerifyOtp(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const outcome = await api.post<LoginResponse>("/api/admin/auth/otp/verify", { ephemeralToken, code });
      await handleOutcome(outcome);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmOtpSetup(e: React.SubmitEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const outcome = await api.post<LoginResponse>("/api/admin/auth/otp/confirm", { ephemeralToken, code });
      await handleOutcome(outcome);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "checking") {
    return (
      <div id="login-page" className="flex flex-1 items-center justify-center">
        <p className="text-text-muted dark:text-text-muted-dark">Loading…</p>
      </div>
    );
  }

  return (
    <div id="login-page" className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="auth-card w-full max-w-sm rounded-lg border border-border bg-surface p-8 shadow-sm dark:border-border-dark dark:bg-surface-dark">
        <div className="mb-6 flex items-center gap-3">
          <BrandMark size={36} />
          <h1 className="text-xl font-bold text-text dark:text-text-dark">{settings?.siteTitle || "Top Casino SG"}</h1>
        </div>

        {step === "credentials" && (
          <form id="login-form" className="auth-form flex flex-col gap-4" onSubmit={handleLogin}>
            <div className="form-field flex flex-col gap-1">
              <label htmlFor="login-email" className="text-sm font-medium text-text dark:text-text-dark">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-md border border-border dark:border-border-dark px-3 py-2 text-sm text-text dark:text-text-dark outline-none focus:border-primary-500"
              />
            </div>
            <PasswordInput
              id="login-password"
              name="password"
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />
            {error && <p className="form-error text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn--primary mt-2 rounded-md bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}

        {step === "otp-verify" && (
          <form id="otp-verify-form" className="auth-form flex flex-col gap-4" onSubmit={handleVerifyOtp}>
            <p className="text-sm text-text-muted dark:text-text-muted-dark">Enter the 6-digit code from your authenticator app.</p>
            <div className="form-field flex flex-col gap-1">
              <label htmlFor="otp-verify-code" className="text-sm font-medium text-text dark:text-text-dark">
                Authentication code
              </label>
              <input
                id="otp-verify-code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="rounded-md border border-border dark:border-border-dark px-3 py-2 text-sm tracking-widest text-text dark:text-text-dark outline-none focus:border-primary-500"
              />
            </div>
            {error && <p className="form-error text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn--primary rounded-md bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Verifying…" : "Verify"}
            </button>
          </form>
        )}

        {step === "otp-setup" && (
          <form id="otp-setup-form" className="auth-form flex flex-col gap-4" onSubmit={handleConfirmOtpSetup}>
            <p className="text-sm text-text-muted dark:text-text-muted-dark">
              Two-factor authentication is required. Scan this QR code with your authenticator app (e.g. Google
              Authenticator), or enter the code manually.
            </p>
            {qrDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="Scan with your authenticator app" width={200} height={200} className="otp-setup__qr self-center" />
            )}
            <p className="otp-setup__secret break-all rounded-md bg-surface-muted dark:bg-surface-muted-dark px-3 py-2 text-center text-xs text-text dark:text-text-dark">
              {otpSecret}
            </p>
            <div className="form-field flex flex-col gap-1">
              <label htmlFor="otp-setup-code" className="text-sm font-medium text-text dark:text-text-dark">
                Enter the code shown in your app
              </label>
              <input
                id="otp-setup-code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="rounded-md border border-border dark:border-border-dark px-3 py-2 text-sm tracking-widest text-text dark:text-text-dark outline-none focus:border-primary-500"
              />
            </div>
            {error && <p className="form-error text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn--primary rounded-md bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Confirming…" : "Confirm & sign in"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
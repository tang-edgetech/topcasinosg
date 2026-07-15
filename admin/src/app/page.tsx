"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { api, ApiError } from "@/lib/api";
import type { LoginResponse, OTPSetupResponse } from "@/lib/types";
import PasswordInput from "@/components/PasswordInput";

type Step = "checking" | "credentials" | "otp-verify" | "otp-setup";

export default function LoginPage() {
  const router = useRouter();
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
        <p className="text-primary-500">Loading…</p>
      </div>
    );
  }

  return (
    <div id="login-page" className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="auth-card w-full max-w-sm rounded-lg border border-primary-100 p-8 shadow-sm">
        <h1 className="mb-6 text-xl font-bold text-primary-900">Top Casino SG — Backoffice</h1>

        {step === "credentials" && (
          <form id="login-form" className="auth-form flex flex-col gap-4" onSubmit={handleLogin}>
            <div className="form-field flex flex-col gap-1">
              <label htmlFor="login-email" className="text-sm font-medium text-primary-900">
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
                className="rounded-md border border-primary-200 px-3 py-2 text-sm text-primary-900 outline-none focus:border-primary-500"
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
              className="btn btn--primary mt-2 rounded-md bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}

        {step === "otp-verify" && (
          <form id="otp-verify-form" className="auth-form flex flex-col gap-4" onSubmit={handleVerifyOtp}>
            <p className="text-sm text-primary-500">Enter the 6-digit code from your authenticator app.</p>
            <div className="form-field flex flex-col gap-1">
              <label htmlFor="otp-verify-code" className="text-sm font-medium text-primary-900">
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
                className="rounded-md border border-primary-200 px-3 py-2 text-sm tracking-widest text-primary-900 outline-none focus:border-primary-500"
              />
            </div>
            {error && <p className="form-error text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn--primary rounded-md bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Verifying…" : "Verify"}
            </button>
          </form>
        )}

        {step === "otp-setup" && (
          <form id="otp-setup-form" className="auth-form flex flex-col gap-4" onSubmit={handleConfirmOtpSetup}>
            <p className="text-sm text-primary-500">
              Two-factor authentication is required. Scan this QR code with your authenticator app (e.g. Google
              Authenticator), or enter the code manually.
            </p>
            {qrDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="Scan with your authenticator app" width={200} height={200} className="otp-setup__qr self-center" />
            )}
            <p className="otp-setup__secret break-all rounded-md bg-primary-50 px-3 py-2 text-center text-xs text-primary-900">
              {otpSecret}
            </p>
            <div className="form-field flex flex-col gap-1">
              <label htmlFor="otp-setup-code" className="text-sm font-medium text-primary-900">
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
                className="rounded-md border border-primary-200 px-3 py-2 text-sm tracking-widest text-primary-900 outline-none focus:border-primary-500"
              />
            </div>
            {error && <p className="form-error text-sm text-danger">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn--primary rounded-md bg-primary-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Confirming…" : "Confirm & sign in"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
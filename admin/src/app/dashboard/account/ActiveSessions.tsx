"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useConfirm } from "@/components/ConfirmDialog";
import { api, ApiError } from "@/lib/api";
import type { SessionDTO } from "@/lib/types";

dayjs.extend(relativeTime);

const DATE_TIME_FORMAT = "D MMM YYYY, h:mm A";
const SECONDARY_BUTTON_CLASS =
  "btn cursor-pointer self-start rounded-md border border-border px-4 py-2 text-sm font-semibold text-text dark:border-border-dark dark:text-text-dark disabled:cursor-not-allowed disabled:opacity-60";

// A readable name for a browser's user agent: "Chrome on Windows".
export function describeUserAgent(ua: string): string {
  if (!ua) return "Unknown device";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\/|CriOS\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : "Browser";
  const os = /iPhone|iPad|iPod/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "";
  return os ? `${browser} on ${os}` : browser;
}

// My Account → Signed-In Devices: every browser signed in to this account,
// with sign-out for one or all of the others. A signed-out browser is
// refused on its next request (api/internal/middleware/auth.go).
export default function ActiveSessions() {
  const confirm = useConfirm();
  const [sessions, setSessions] = useState<SessionDTO[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    return api.get<{ sessions: SessionDTO[] }>("/api/admin/account/sessions").then(
      (data) => setSessions(data.sessions),
      (err) => setError(err instanceof ApiError ? err.message : "Could not load signed-in devices."),
    );
  }

  useEffect(() => {
    let cancelled = false;
    api.get<{ sessions: SessionDTO[] }>("/api/admin/account/sessions").then(
      (data) => !cancelled && setSessions(data.sessions),
      (err) => !cancelled && setError(err instanceof ApiError ? err.message : "Could not load signed-in devices."),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  async function signOut(session: SessionDTO) {
    const ok = await confirm({
      title: "Sign Out Device",
      message: `Sign out ${describeUserAgent(session.userAgent)}${session.ipAddress ? ` (${session.ipAddress})` : ""}? It will need the password to sign in again.`,
      confirmLabel: "Sign Out",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api.post(`/api/admin/account/sessions/${session.id}/sign-out`);
      setNotice("Device signed out.");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign the device out.");
    } finally {
      setBusy(false);
    }
  }

  async function signOutOthers() {
    const ok = await confirm({
      title: "Sign Out Everywhere Else",
      message: "Every other browser signed in to your account will be signed out. This one stays signed in.",
      confirmLabel: "Sign Out Others",
      danger: true,
    });
    if (!ok) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { signedOut } = await api.post<{ signedOut: number }>("/api/admin/account/sessions/sign-out-others");
      setNotice(signedOut === 1 ? "1 other device signed out." : `${signedOut} other devices signed out.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign the other devices out.");
    } finally {
      setBusy(false);
    }
  }

  const others = sessions?.filter((s) => !s.current).length ?? 0;

  return (
    <div id="active-sessions" className="active-sessions max-w-2xl">
      <h2 className="mb-1 text-lg font-bold text-text dark:text-text-dark">Signed-In Devices</h2>
      <p className="mb-4 text-sm text-text-muted dark:text-text-muted-dark">
        Browsers signed in to your account. Sign out any you don&apos;t recognise, then change your password.
      </p>
      {error && <p className="form-error mb-3 text-sm text-danger">{error}</p>}
      {notice && <p className="mb-3 text-sm text-success">{notice}</p>}
      {!sessions ? (
        <p className="text-sm text-text-muted dark:text-text-muted-dark">Loading…</p>
      ) : (
        <ul className="active-sessions__list mb-4 flex flex-col divide-y divide-border rounded-lg border border-border dark:divide-border-dark dark:border-border-dark">
          {sessions.map((s) => (
            <li key={s.id} className="active-sessions__item flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text dark:text-text-dark">
                  {describeUserAgent(s.userAgent)}
                  {s.current && (
                    <span className="ml-2 rounded bg-success-subtle px-2 py-0.5 text-xs font-semibold text-success">This device</span>
                  )}
                </p>
                <p className="text-xs text-text-muted dark:text-text-muted-dark">
                  {s.ipAddress || "Unknown address"} · Signed in {dayjs(s.createdAt).format(DATE_TIME_FORMAT)} · Active{" "}
                  {dayjs(s.lastSeenAt).fromNow()}
                </p>
              </div>
              {!s.current && (
                <button type="button" disabled={busy} onClick={() => signOut(s)} className={SECONDARY_BUTTON_CLASS}>
                  Sign Out
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {others > 0 && (
        <button id="active-sessions-sign-out-others" type="button" disabled={busy} onClick={signOutOthers} className={SECONDARY_BUTTON_CLASS}>
          Sign Out All Other Devices
        </button>
      )}
    </div>
  );
}

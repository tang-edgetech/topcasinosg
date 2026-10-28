import { HAS_SESSION_COOKIE } from "@/lib/cookies";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type Envelope<T> =
  | { success: true; data: T }
  | { success: false; error: { message: string } };

// Auth endpoints must never trigger a refresh-and-retry themselves — a 401
// from a wrong password on /login, for example, is a real answer, not an
// expired-token race to paper over.
const AUTH_PATH_PREFIX = "/api/admin/auth/";

// Concurrent 401s share one refresh call. Refresh tokens are single-use
// (rotated on every call), so firing it twice in parallel would have the
// second call fail against an already-rotated token and wrongly end the
// session.
let refreshInFlight: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_URL}/api/admin/auth/refresh`, { method: "POST", credentials: "include" })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

// Fired when a request's 401 couldn't be fixed by refreshing — the session
// is over (signed out elsewhere, disabled, or 2FA was switched on and this
// session never used it). AuthProvider listens and sends the user to sign in.
export const SESSION_ENDED_EVENT = "admin:session-ended";

function endSession() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_ENDED_EVENT));
}

// Fired when the API refuses a request because this user must change their
// password first (RequirePasswordChanged in api/internal/middleware/auth.go,
// e.g. an admin reset it). AuthProvider re-reads the user, and the dashboard
// then shows the change-password screen.
export const PASSWORD_CHANGE_REQUIRED_EVENT = "admin:password-change-required";
const PASSWORD_CHANGE_REQUIRED_MESSAGE = "you must change your password before continuing";

async function unwrap<T>(res: Response): Promise<T> {
  const body = (await res.json()) as Envelope<T>;
  if (!body.success) {
    if (res.status === 403 && body.error?.message === PASSWORD_CHANGE_REQUIRED_MESSAGE && typeof window !== "undefined") {
      window.dispatchEvent(new Event(PASSWORD_CHANGE_REQUIRED_EVENT));
    }
    throw new ApiError(body.error?.message ?? "Request failed", res.status);
  }
  return body.data;
}

async function request<T>(path: string, options: RequestInit = {}, _retried = false): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 401 && !_retried && !path.startsWith(AUTH_PATH_PREFIX)) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return request<T>(path, options, true);
    }
    endSession();
  }

  return unwrap<T>(res);
}

async function requestForm<T>(path: string, form: FormData, _retried = false): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    // No Content-Type header — the browser sets multipart/form-data with
    // the correct boundary itself; forcing application/json would break it.
    body: form,
  });

  if (res.status === 401 && !_retried) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return requestForm<T>(path, form, true);
    }
    endSession();
  }

  return unwrap<T>(res);
}

// The has_session cookie is a plain, non-HttpOnly marker cookie the API sets alongside
// the real session cookies (see api/internal/httpx/cookies.go) — its absence
// means "definitely logged out," so callers can skip the /auth/me round trip
// (and the 401 it would otherwise correctly return) instead of probing first.
export function hasSessionCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith(`${HAS_SESSION_COOKIE}=`));
}

// requestBlob posts JSON and returns a binary download (export zips). Errors
// still arrive as the JSON envelope.
async function requestBlob(path: string, data: unknown, _retried = false): Promise<Blob> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (res.status === 401 && !_retried) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return requestBlob(path, data, true);
    }
    endSession();
  }
  if (!res.ok) {
    return unwrap<never>(res);
  }
  return res.blob();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: data !== undefined ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PUT", body: data !== undefined ? JSON.stringify(data) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, form: FormData) => requestForm<T>(path, form),
  download: (path: string, data: unknown) => requestBlob(path, data),
};

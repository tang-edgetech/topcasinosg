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

async function unwrap<T>(res: Response): Promise<T> {
  const body = (await res.json()) as Envelope<T>;
  if (!body.success) {
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
  }

  return unwrap<T>(res);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: data !== undefined ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PUT", body: data !== undefined ? JSON.stringify(data) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(path: string, form: FormData) => requestForm<T>(path, form),
};

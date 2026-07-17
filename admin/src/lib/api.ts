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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body = (await res.json()) as Envelope<T>;

  if (!body.success) {
    throw new ApiError(body.error?.message ?? "Request failed", res.status);
  }
  return body.data;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: data !== undefined ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "PUT", body: data !== undefined ? JSON.stringify(data) : undefined }),
  // No Content-Type header here — the browser sets multipart/form-data with
  // the correct boundary itself; forcing application/json would break it.
  upload: async <T>(path: string, form: FormData): Promise<T> => {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      credentials: "include",
      body: form,
    });
    const body = (await res.json()) as Envelope<T>;
    if (!body.success) {
      throw new ApiError(body.error?.message ?? "Request failed", res.status);
    }
    return body.data;
  },
};

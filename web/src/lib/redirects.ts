import { API_BASE_URL } from "./api-url";

// Admin > Redirects, applied by proxy.ts before any page renders. The list is
// kept in memory and refreshed in the background at most once a minute (as
// other content here), so a redirect saved in the backoffice is live within
// about a minute. If the API can't be reached the last list stays in use
// (none on a fresh start) and pages load as normal.
const REFRESH_MS = 60_000;
const TIMEOUT_MS = 2_000;

export interface SiteRedirect {
  to: string;
  status: 301 | 302;
}

let table = new Map<string, SiteRedirect>();
let loadedAt = 0;
let loading: Promise<void> | null = null;

// The key a path is matched by: decoded, lower case, no trailing slash.
export function redirectKey(path: string): string {
  let p = path;
  try {
    p = decodeURI(p);
  } catch {
    // keep it as it is
  }
  p = p.toLowerCase().replace(/\/+$/, "");
  return p || "/";
}

async function load(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/redirects`, { cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return;
    const body = (await res.json()) as { data?: { redirects?: { from: string; to: string; status: number }[] } };
    const next = new Map<string, SiteRedirect>();
    for (const r of body.data?.redirects ?? []) {
      next.set(redirectKey(r.from), { to: r.to, status: r.status === 302 ? 302 : 301 });
    }
    table = next;
  } catch {
    // keep the last list
  } finally {
    loadedAt = Date.now();
  }
}

// The redirect for this path, if any. Only the very first request waits for
// the list; after that a stale list is refreshed without holding anyone up.
export async function findRedirect(pathname: string): Promise<SiteRedirect | undefined> {
  if (Date.now() - loadedAt > REFRESH_MS && !loading) {
    loading = load().finally(() => {
      loading = null;
    });
  }
  if (loadedAt === 0 && loading) await loading;
  return table.get(redirectKey(pathname));
}

/**
 * Data-fetching helpers for the `/blacklist` page.
 *
 * IMPORTANT: every endpoint on the Go API wraps its payload as
 * `{ success: boolean, data: { ... } }`. The actual list key
 * (`blacklistEntries`) lives one level below `data`, not at the top level of
 * the JSON body. The helper below unwraps `body.data` before reading
 * anything further.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

// Scheduled-publish content can flip from hidden to visible at any moment
// (computed live by the DB, no rebuild/cron involved), so this fetch uses a
// short revalidate window instead of the default indefinite cache.
const REVALIDATE_SECONDS = 60;

export interface BlacklistEntryDTO {
  id: number;
  name: string;
  reason: string;
  details: string;
  status: string;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getBlacklistEntries(): Promise<BlacklistEntryDTO[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blacklist`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];

    const body = (await res.json()) as {
      success?: boolean;
      data?: { blacklistEntries?: BlacklistEntryDTO[]; total?: number };
    };
    return body.data?.blacklistEntries ?? [];
  } catch {
    // Public API may be briefly unreachable — degrade to empty rather than
    // failing the whole page.
    return [];
  }
}

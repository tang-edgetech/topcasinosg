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
  regionId: number | null;
  name: string;
  reason: string;
  details: string;
  status: string;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegionDTO {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface PagedBlacklistEntries {
  entries: BlacklistEntryDTO[];
  total: number;
}

const DEFAULT_PAGE_SIZE = 25;

/** Global index only — the API returns just the region_id IS NULL rows when `region` is omitted. */
export async function getBlacklistEntries(page = 1, pageSize = DEFAULT_PAGE_SIZE): Promise<PagedBlacklistEntries> {
  try {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    const res = await fetch(`${API_BASE_URL}/api/blacklist?${params.toString()}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return { entries: [], total: 0 };

    const body = (await res.json()) as {
      success?: boolean;
      data?: { blacklistEntries?: BlacklistEntryDTO[]; total?: number };
    };
    return { entries: body.data?.blacklistEntries ?? [], total: body.data?.total ?? 0 };
  } catch {
    // Public API may be briefly unreachable — degrade to empty rather than
    // failing the whole page.
    return { entries: [], total: 0 };
  }
}

export async function getActiveRegions(): Promise<RegionDTO[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/regions`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return [];
    const body = (await res.json()) as { success?: boolean; data?: { regions?: RegionDTO[] } };
    return (body.data?.regions ?? []).filter((region) => region.isActive);
  } catch {
    return [];
  }
}

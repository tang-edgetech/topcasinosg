/**
 * Shared data-fetching helpers for the public /casinos routes.
 *
 * Every Go API response is double-wrapped as `{ success, data: { ... } }`,
 * so every helper here unwraps `body.data` before returning anything.
 * Confirmed against the live API:
 *   GET /api/casinos      -> { success, data: { casinos: [...], total } }
 *   GET /api/casinos/:slug -> { success, data: { casino: {...} } } (or success:false + 404 if missing/unpublished)
 *   GET /api/regions      -> { success, data: { regions: [...] } }
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

export interface CasinoDTO {
  id: number;
  slug: string;
  name: string;
  logoMediaId: number | null;
  rating: number;
  summary: string;
  content: string;
  languages: string[] | null;
  paymentMethods: string[] | null;
  payoutSpeed: string;
  ctaUrl: string;
  status: string;
  publishAt: string | null;
  regionIds: number[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegionDTO {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
}

// Scheduled-publish content can flip from hidden to visible at any moment
// (computed live by the DB, no cron job), so these pages must never be
// cached forever — keep a short revalidate window, matching Footer.tsx.
const REVALIDATE_SECONDS = 60;

export async function getCasinos(region?: string): Promise<CasinoDTO[]> {
  try {
    const url = new URL(`${API_BASE_URL}/api/casinos`);
    if (region) {
      url.searchParams.set("region", region);
    }

    const res = await fetch(url.toString(), { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) {
      return [];
    }

    const body = (await res.json()) as ApiEnvelope<{ casinos?: CasinoDTO[]; total?: number }>;
    return Array.isArray(body.data?.casinos) ? body.data.casinos : [];
  } catch {
    // Public API may be unreachable during build/static generation — degrade
    // to an empty list rather than failing the whole page.
    return [];
  }
}

export async function getCasino(slug: string): Promise<CasinoDTO | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/casinos/${encodeURIComponent(slug)}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      return null;
    }

    const body = (await res.json()) as ApiEnvelope<{ casino?: CasinoDTO }>;
    if (!body.success || !body.data?.casino) {
      return null;
    }

    return body.data.casino;
  } catch {
    return null;
  }
}

export async function getRegions(): Promise<RegionDTO[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/regions`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) {
      return [];
    }

    const body = (await res.json()) as ApiEnvelope<{ regions?: RegionDTO[] }>;
    return Array.isArray(body.data?.regions) ? body.data.regions : [];
  } catch {
    return [];
  }
}

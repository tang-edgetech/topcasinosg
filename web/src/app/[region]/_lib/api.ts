/**
 * Shared data-fetching helpers for the region-scoped public pages
 * (`web/src/app/[region]/**`).
 *
 * IMPORTANT: every endpoint on the Go API wraps its payload as
 * `{ success: boolean, data: { ... } }`. The actual list keys (e.g.
 * `regions`, `bonuses`, `paymentMethods`, `rtpEntries`, `guides`) live one
 * level below `data`, not at the top level of the JSON body. Every helper
 * below unwraps `body.data` before reading anything further.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

// Scheduled-publish content can flip from hidden to visible at any moment
// (computed live by the DB, no rebuild/cron involved), so every fetch here
// uses a short revalidate window instead of the default indefinite cache.
const REVALIDATE_SECONDS = 60;

export interface RegionDTO {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export type BonusType =
  | "welcome"
  | "no_deposit"
  | "free_spins"
  | "cashback"
  | "loyalty_vip"
  | "deposit";

export interface BonusDTO {
  id: number;
  regionId: number;
  casinoId: number | null;
  bonusType: BonusType;
  title: string;
  terms: string;
  code: string | null;
  validFrom: string | null;
  validUntil: string | null;
  status: string;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodDTO {
  id: number;
  regionId: number;
  name: string;
  description: string;
  iconMediaId: number | null;
  status: string;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type RTPCategory = "slot" | "table" | "live" | "other";

export interface RTPEntryDTO {
  id: number;
  regionId: number;
  casinoId: number | null;
  gameName: string;
  category: RTPCategory;
  rtpPercentage: number;
  status: string;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GuideDTO {
  id: number;
  regionId: number | null;
  title: string;
  slug: string;
  coverMediaId: number | null;
  excerpt: string;
  content: string;
  status: string;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
}

async function fetchData<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return null;
    const body = (await res.json()) as { success?: boolean; data?: T };
    return body.data ?? null;
  } catch {
    // Public API may be briefly unreachable — degrade to empty rather than
    // failing the whole page.
    return null;
  }
}

export async function getRegions(): Promise<RegionDTO[]> {
  const data = await fetchData<{ regions: RegionDTO[] }>(`${API_BASE_URL}/api/regions`);
  return data?.regions ?? [];
}

/** Returns the active region matching `code`, or null if none matches. */
export async function getActiveRegionByCode(code: string): Promise<RegionDTO | null> {
  const regions = await getRegions();
  return regions.find((region) => region.code === code && region.isActive) ?? null;
}

export async function getBonuses(regionCode: string): Promise<BonusDTO[]> {
  const data = await fetchData<{ bonuses: BonusDTO[]; total: number }>(
    `${API_BASE_URL}/api/bonuses?region=${encodeURIComponent(regionCode)}`,
  );
  return data?.bonuses ?? [];
}

export async function getPaymentMethods(regionCode: string): Promise<PaymentMethodDTO[]> {
  const data = await fetchData<{ paymentMethods: PaymentMethodDTO[]; total: number }>(
    `${API_BASE_URL}/api/payment-methods?region=${encodeURIComponent(regionCode)}`,
  );
  return data?.paymentMethods ?? [];
}

export async function getRtpEntries(regionCode: string): Promise<RTPEntryDTO[]> {
  const data = await fetchData<{ rtpEntries: RTPEntryDTO[]; total: number }>(
    `${API_BASE_URL}/api/rtp?region=${encodeURIComponent(regionCode)}`,
  );
  return data?.rtpEntries ?? [];
}

/** `regionCode` is optional upstream — omit it to fetch all guides. */
export async function getGuides(regionCode?: string): Promise<GuideDTO[]> {
  const query = regionCode ? `?region=${encodeURIComponent(regionCode)}` : "";
  const data = await fetchData<{ guides: GuideDTO[]; total: number }>(
    `${API_BASE_URL}/api/guides${query}`,
  );
  return data?.guides ?? [];
}

/** "no_deposit" -> "No Deposit" */
export function toTitleCase(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-SG", { year: "numeric", month: "short", day: "numeric" });
}

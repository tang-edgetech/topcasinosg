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

import { type GameType, ALL_GAME_TYPES } from "@/lib/gameTypes";
import { mediaUrl } from "@/lib/pages";

export type { GameType };
export { ALL_GAME_TYPES };

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

// Scheduled-publish content can flip from hidden to visible at any moment
// (computed live by the DB, no rebuild/cron involved), so every fetch here
// uses a short revalidate window instead of the default indefinite cache.
const REVALIDATE_SECONDS = 60;

export interface RegionDTO {
  id: number;
  code: string;
  name: string;
  demonym: string;
  currencyCode: string;
  flagUrl: string | null;
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
  turnoverRequirement: string;
  maxClaim: string;
  withdrawalLimit: string;
  minDeposit: string;
  paymentFrequency: string;
  upgradeBonus: string;
  maxRebate: string;
  perks: string;
  eligibleGames: string;
  pointConversionRate: string;
  eligibleProviderId: number | null;
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
  iconUrl: string | null;
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
  gameProviderId: number | null;
  imageMediaId: number | null;
  gameName: string;
  category: RTPCategory;
  rtpPercentage: number;
  status: string;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
  gameProviderName: string | null;
  imageUrl: string | null;
  casinoName: string | null;
  casinoSlug: string | null;
  casinoCtaUrl: string | null;
}

export interface GuideDTO {
  id: number;
  regionId: number | null;
  title: string;
  slug: string;
  coverMediaId: number | null;
  coverUrl: string | null;
  excerpt: string;
  content: string;
  status: string;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlacklistEntryDTO {
  id: number;
  regionId: number | null;
  name: string;
  logoUrl: string | null;
  rating: number | null;
  reason: string;
  reasons: string[] | null;
  details: string;
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

// Public casino record (GET /api/casinos, /api/casinos/{slug}).
export interface CasinoDTO {
  id: number;
  slug: string;
  name: string;
  logoUrl: string | null;
  rating: number;
  safeIndex: number | null;
  riskStatus: "low" | "medium" | "high" | null;
  paymentMethods: string[] | null;
  supportedGames: string[] | null;
  payoutSpeed: string;
  pros: string[] | null;
  ctaUrl: string;
  rtpPercentage: number | null;
  cryptoSupported: boolean;
  localBankingSpeed: string;
  summary: string;
  content: string;
  languages: string[] | null;
  currencies: string[] | null;
  cons: string[] | null;
  regionIds: number[] | null;
  gameProviderIds: number[] | null;
  licenseIds: number[] | null;
  publishAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LicenseDTO {
  id: number;
  name: string;
  logoUrl: string | null;
}

export async function getCasino(slug: string): Promise<CasinoDTO | null> {
  const data = await fetchData<{ casino: CasinoDTO }>(`${API_BASE_URL}/api/casinos/${encodeURIComponent(slug)}`);
  return data?.casino ?? null;
}

/** Every published bonus tied to one casino, across all regions. */
export async function getBonusesForCasino(casinoId: number): Promise<BonusDTO[]> {
  const data = await fetchData<{ bonuses: BonusDTO[] }>(`${API_BASE_URL}/api/bonuses?casinoId=${casinoId}&pageSize=100`);
  return data?.bonuses ?? [];
}

export async function getLicenses(): Promise<LicenseDTO[]> {
  const data = await fetchData<{ licenses: LicenseDTO[] | null }>(`${API_BASE_URL}/api/licenses`);
  return data?.licenses ?? [];
}

export interface GameProviderDTO {
  id: number;
  name: string;
  logoUrl: string | null;
}

export async function getGameProviders(): Promise<GameProviderDTO[]> {
  const data = await fetchData<{ gameProviders: GameProviderDTO[] | null }>(`${API_BASE_URL}/api/game-providers`);
  return data?.gameProviders ?? [];
}

/**
 * `gameType` is optional — omit it to fetch every casino for the region.
 * `pageSize` defaults to the API's own default (25) — pass a higher value
 * (e.g. the API's maxPageSize) when the caller needs the full region list
 * to cross-reference by id rather than to display a paginated page.
 */
export async function getCasinos(regionCode: string, gameType?: GameType, pageSize?: number): Promise<CasinoDTO[]> {
  const params = new URLSearchParams({ region: regionCode });
  if (gameType) params.set("gameType", gameType);
  if (pageSize) params.set("pageSize", String(pageSize));
  const data = await fetchData<{ casinos: CasinoDTO[]; total: number }>(
    `${API_BASE_URL}/api/casinos?${params.toString()}`,
  );
  return data?.casinos ?? [];
}

/** Every published casino regardless of region, for resolving a casino picked by id in a page section. */
export async function getAllCasinos(): Promise<CasinoDTO[]> {
  const data = await fetchData<{ casinos: CasinoDTO[]; total: number }>(`${API_BASE_URL}/api/casinos?pageSize=100`);
  return data?.casinos ?? [];
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

/** `bonusType` is optional — omit it to fetch every type for the region. `pageSize` defaults to the API's own default (25). */
export async function getBonuses(regionCode: string, bonusType?: BonusType, pageSize?: number): Promise<BonusDTO[]> {
  const params = new URLSearchParams({ region: regionCode });
  if (bonusType) params.set("bonusType", bonusType);
  if (pageSize) params.set("pageSize", String(pageSize));
  const data = await fetchData<{ bonuses: BonusDTO[]; total: number }>(
    `${API_BASE_URL}/api/bonuses?${params.toString()}`,
  );
  return data?.bonuses ?? [];
}

// Every published bonus in a region in one request. The bonus blocks on a
// page filter this by type, so a page with seven bonus blocks makes one
// request (fetch() dedupes the identical URL within a render).
const REGION_BONUSES_PAGE_SIZE = 500;

export async function getRegionBonuses(regionCode: string, bonusType?: BonusType): Promise<BonusDTO[]> {
  const all = await getBonuses(regionCode, undefined, REGION_BONUSES_PAGE_SIZE);
  return bonusType ? all.filter((b) => b.bonusType === bonusType) : all;
}

// Icons for the payment method names a casino lists, matched by name
// (case-insensitive) against the region's Payment Method records.
export async function getPaymentBadgeLookup(regionCode: string): Promise<(names: string[] | null) => { name: string; icon: string | null }[]> {
  const methods = await getPaymentMethods(regionCode);
  const iconByName = new Map(methods.map((pm) => [pm.name.trim().toLowerCase(), mediaUrl(pm.iconUrl)]));
  return (names) => (names ?? []).map((name) => ({ name, icon: iconByName.get(name.trim().toLowerCase()) ?? null }));
}

export async function getPaymentMethods(regionCode: string): Promise<PaymentMethodDTO[]> {
  const data = await fetchData<{ paymentMethods: PaymentMethodDTO[]; total: number }>(
    `${API_BASE_URL}/api/payment-methods?region=${encodeURIComponent(regionCode)}`,
  );
  return data?.paymentMethods ?? [];
}

/**
 * Highest RTP first. `categories` narrows to e.g. ["table", "live"]; omit it
 * for every category. `pageSize` defaults to the API's own default (25).
 */
export async function getRtpEntries(regionCode: string, categories?: RTPCategory[], pageSize?: number): Promise<RTPEntryDTO[]> {
  const params = new URLSearchParams({ region: regionCode });
  if (categories && categories.length > 0) params.set("category", categories.join(","));
  if (pageSize) params.set("pageSize", String(pageSize));
  const data = await fetchData<{ rtpEntries: RTPEntryDTO[]; total: number }>(
    `${API_BASE_URL}/api/rtp?${params.toString()}`,
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

export interface PagedBlacklistEntries {
  entries: BlacklistEntryDTO[];
  total: number;
}

/** `regionCode` is optional upstream — omit it to fetch only global entries. */
export async function getBlacklistEntries(regionCode?: string, page = 1, pageSize = 25): Promise<PagedBlacklistEntries> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (regionCode) params.set("region", regionCode);
  const data = await fetchData<{ blacklistEntries: BlacklistEntryDTO[]; total: number }>(
    `${API_BASE_URL}/api/blacklist?${params.toString()}`,
  );
  return { entries: data?.blacklistEntries ?? [], total: data?.total ?? 0 };
}

export type SiteStat = "casinos" | "blacklist" | "regions" | "guides";

// Live site-wide counts for the Home "Our Track Record" tiles. Each list is
// requested with pageSize=1 and read from its total. The public blacklist
// list is global-only without a region, so regional entries are added per
// active region.
export async function getSiteStats(): Promise<Record<SiteStat, number>> {
  const [casinos, globalBlacklist, regions, guides] = await Promise.all([
    fetchData<{ total: number }>(`${API_BASE_URL}/api/casinos?pageSize=1`),
    getBlacklistEntries(undefined, 1, 1),
    getRegions(),
    fetchData<{ total: number }>(`${API_BASE_URL}/api/guides?pageSize=1`),
  ]);
  const activeRegions = regions.filter((r) => r.isActive);
  const regionalBlacklists = await Promise.all(activeRegions.map((r) => getBlacklistEntries(r.code, 1, 1)));
  return {
    casinos: casinos?.total ?? 0,
    blacklist: regionalBlacklists.reduce((sum, list) => sum + list.total, globalBlacklist.total),
    regions: activeRegions.length,
    guides: guides?.total ?? 0,
  };
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

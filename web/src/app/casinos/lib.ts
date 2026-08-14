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

// Fixed taxonomy, mirrors api/internal/domain/casino.go's GameType/AllGameTypes.
export type GameType =
  | "slots"
  | "blackjack"
  | "baccarat"
  | "roulette"
  | "sic_bo"
  | "craps"
  | "poker"
  | "video_poker"
  | "bingo";

export const ALL_GAME_TYPES: { value: GameType; label: string }[] = [
  { value: "slots", label: "Slots" },
  { value: "blackjack", label: "Blackjack" },
  { value: "baccarat", label: "Baccarat" },
  { value: "roulette", label: "Roulette" },
  { value: "sic_bo", label: "Sic Bo" },
  { value: "craps", label: "Craps" },
  { value: "poker", label: "Poker" },
  { value: "video_poker", label: "Video Poker" },
  { value: "bingo", label: "Bingo" },
];

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
  pros: string[] | null;
  cons: string[] | null;
  safeIndex: number | null;
  riskStatus: "low" | "medium" | "high" | null;
  supportedGames: GameType[] | null;
  payoutSpeed: string;
  ctaUrl: string;
  status: string;
  publishAt: string | null;
  regionIds: number[] | null;
  gameProviderIds: number[] | null;
  licenseIds: number[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface GameProviderDTO {
  id: number;
  name: string;
  logoUrl: string | null;
  sortOrder: number;
}

export interface LicenseDTO {
  id: number;
  name: string;
  logoUrl: string | null;
  sortOrder: number;
}

export interface RegionDTO {
  id: number;
  code: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
}

export type BonusType = "welcome" | "no_deposit" | "free_spins" | "cashback" | "loyalty_vip" | "deposit";

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

export async function getBonusesForCasino(casinoId: number): Promise<BonusDTO[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/bonuses?casinoId=${casinoId}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as ApiEnvelope<{ bonuses?: BonusDTO[]; total?: number }>;
    return Array.isArray(body.data?.bonuses) ? body.data.bonuses : [];
  } catch {
    return [];
  }
}

export async function getRtpEntriesForCasino(casinoId: number): Promise<RTPEntryDTO[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/rtp?casinoId=${casinoId}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as ApiEnvelope<{ rtpEntries?: RTPEntryDTO[]; total?: number }>;
    return Array.isArray(body.data?.rtpEntries) ? body.data.rtpEntries : [];
  } catch {
    return [];
  }
}

/** "no_deposit" -> "No Deposit" */
export function toTitleCase(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function mediaUrl(url: string): string {
  return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
}

export async function getGameProviders(): Promise<GameProviderDTO[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/game-providers`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return [];
    const body = (await res.json()) as ApiEnvelope<{ gameProviders?: GameProviderDTO[] }>;
    return Array.isArray(body.data?.gameProviders) ? body.data.gameProviders : [];
  } catch {
    return [];
  }
}

export async function getLicenses(): Promise<LicenseDTO[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/licenses`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return [];
    const body = (await res.json()) as ApiEnvelope<{ licenses?: LicenseDTO[] }>;
    return Array.isArray(body.data?.licenses) ? body.data.licenses : [];
  } catch {
    return [];
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

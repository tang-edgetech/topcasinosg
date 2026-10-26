import {
  getCasinos,
  getGameProviders,
  getPaymentBadgeLookup,
  getRegionBonuses,
  type BonusDTO,
  type BonusType,
  type GameProviderDTO,
} from "@/app/[region]/_lib/api";
import type { CellContext, DataRow } from "./columns";

// Same page size everywhere so a region's casino list is one shared
// (deduped) request per page, whichever blocks ask for it.
export const MAX_CASINOS_FOR_LOOKUP = 200;

export interface RowQuery {
  source: "casinos" | "bonuses";
  regionCode: string;
  bonusType?: BonusType;
  limit: number;
  excludeCasinoIds?: number[];
  // Hand-picked casinos, shown in this order instead of best rated first
  // (only those listed in the region are shown).
  includeCasinoIds?: number[];
  needsProviders?: boolean;
}

// Rows for a data table. Casinos: the region's casinos, best rated first.
// Bonuses: the region's published bonuses of one type, each with its casino.
// All requests are region-wide and shared with other blocks on the page.
export async function loadRows(query: RowQuery): Promise<{ rows: DataRow[]; ctx: CellContext }> {
  const [casinos, bonuses, paymentBadges, providerList] = await Promise.all([
    getCasinos(query.regionCode, undefined, MAX_CASINOS_FOR_LOOKUP),
    getRegionBonuses(query.regionCode),
    getPaymentBadgeLookup(query.regionCode),
    query.needsProviders ? getGameProviders() : Promise.resolve([] as GameProviderDTO[]),
  ]);
  const ctx: CellContext = { providers: new Map(providerList.map((p) => [p.id, p])) };
  const casinoById = new Map(casinos.map((c) => [c.id, c]));
  const firstOfType = (casinoId: number, type?: BonusType) =>
    bonuses.find((b: BonusDTO) => b.casinoId === casinoId && (!type || b.bonusType === type))?.title ?? "";

  if (query.source === "bonuses") {
    const rows = bonuses
      .filter((b) => !query.bonusType || b.bonusType === query.bonusType)
      .slice(0, query.limit)
      .map((bonus) => {
        const casino = bonus.casinoId ? casinoById.get(bonus.casinoId) : undefined;
        return {
          key: bonus.id,
          bonus,
          casino,
          cashback: casino ? firstOfType(casino.id, "cashback") : "",
          firstBonus: casino ? firstOfType(casino.id) : "",
          badges: casino ? paymentBadges(casino.paymentMethods) : [],
        };
      });
    return { rows, ctx };
  }

  const exclude = new Set(query.excludeCasinoIds ?? []);
  const picked = query.includeCasinoIds?.length
    ? query.includeCasinoIds.map((id) => casinoById.get(id)).filter((c): c is NonNullable<typeof c> => c !== undefined)
    : casinos.slice().sort((a, b) => b.rating - a.rating);
  const rows = picked
    .filter((c) => !exclude.has(c.id))
    .slice(0, query.limit)
    .map((casino) => ({
      key: casino.id,
      casino,
      cashback: firstOfType(casino.id, "cashback"),
      firstBonus: firstOfType(casino.id),
      badges: paymentBadges(casino.paymentMethods),
    }));
  return { rows, ctx };
}

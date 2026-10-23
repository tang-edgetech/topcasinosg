import Link from "next/link";
import { mediaUrl } from "@/lib/pages";
import { getCasinos, getPaymentBadgeLookup, getRegionBonuses, type CasinoDTO } from "@/app/[region]/_lib/api";
import StarRating from "@/components/StarRating";
import PaymentMethodBadges, { type PaymentBadge } from "@/components/PaymentMethodBadges";

// Same page size as the other casino blocks, so a region's casino list is
// one shared (deduped) request per page.
const MAX_CASINOS_FOR_LOOKUP = 200;
const MAX_BADGES = 3;

export interface CasinoRow {
  casino: CasinoDTO;
  cashback: string;
  badges: PaymentBadge[];
}

// A region's casinos, best rated first, with each casino's cashback bonus
// and payment method badges.
export async function loadCasinoRows(regionCode: string, limit: number, excludeIds: number[] = []): Promise<CasinoRow[]> {
  const [casinos, cashbackBonuses, paymentBadges] = await Promise.all([
    getCasinos(regionCode, undefined, MAX_CASINOS_FOR_LOOKUP),
    getRegionBonuses(regionCode, "cashback"),
    getPaymentBadgeLookup(regionCode),
  ]);
  const cashbackByCasino = new Map<number, string>();
  for (const bonus of cashbackBonuses) {
    if (bonus.casinoId != null && !cashbackByCasino.has(bonus.casinoId)) cashbackByCasino.set(bonus.casinoId, bonus.title);
  }
  return casinos
    .filter((casino) => !excludeIds.includes(casino.id))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit)
    .map((casino) => ({ casino, cashback: cashbackByCasino.get(casino.id) ?? "", badges: paymentBadges(casino.paymentMethods) }));
}

// Figma casino list: Brand, Cashback Details, Payment Method logos, Rating
// /10, Safe Index /100 and Visit Site. Casino.rating is stored out of 5 and
// shown out of 10. On mobile the rows become a swipeable row of cards.
export default function CasinoListTable({ rows }: { rows: CasinoRow[] }) {
  return (
    <>
      <div className="section-row md:hidden">
        <ol className="casino-list-cards section-col flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
          {rows.map((row, i) => (
            <li
              key={row.casino.id}
              className="casino-list-card flex w-[220px] shrink-0 snap-start flex-col items-center gap-3 rounded-lg border border-primary-100 bg-white p-4 text-center text-sm"
            >
              <span className="self-start text-sm font-semibold text-primary-500">{i + 1}</span>
              <CasinoBrand casino={row.casino} />
              <Score casino={row.casino} />
              {row.cashback && <p className="rounded-md bg-surface-muted px-3 py-2 text-xs text-primary-900">{row.cashback}</p>}
              {row.badges.length > 0 && <PaymentMethodBadges badges={row.badges} max={MAX_BADGES} />}
              <div className="mt-auto flex w-full flex-col gap-2">
                <VisitSite casino={row.casino} />
                <Link href={`/casinos/${row.casino.slug}`} className="cursor-pointer text-xs text-primary-600 hover:text-primary-900">
                  More Info
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="section-row hidden md:block">
        <div className="section-col w-full overflow-x-auto rounded-lg border border-primary-100 bg-white">
          <table className="casino-list-table w-full min-w-[760px] border-collapse text-sm">
            <thead className="bg-primary-900 text-white">
              <tr>
                {["Brand", "Cashback Details", "Payment Method", "Rating", "Safe Index"].map((label) => (
                  <th key={label} className="border-r border-white/20 px-3 py-3 text-center font-medium">
                    {label}
                  </th>
                ))}
                <th className="w-44 px-3 py-3">
                  <span className="sr-only">Visit</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.casino.id} className="border-t border-primary-100">
                  <td className="w-28 border-r border-primary-100 px-3 py-3">
                    <CasinoBrand casino={row.casino} />
                  </td>
                  <td className="border-r border-primary-100 px-3 py-3 text-center text-xs text-primary-600">{row.cashback || "—"}</td>
                  <td className="border-r border-primary-100 px-3 py-3">
                    <div className="flex justify-center">
                      {row.badges.length > 0 ? <PaymentMethodBadges badges={row.badges} max={MAX_BADGES} /> : "—"}
                    </div>
                  </td>
                  <td className="border-r border-primary-100 px-3 py-3">
                    <Score casino={row.casino} />
                  </td>
                  <td className="border-r border-primary-100 px-3 py-3 text-center text-primary-900">
                    {row.casino.safeIndex != null ? (
                      <>
                        <span className="text-2xl font-bold">{row.casino.safeIndex}</span>
                        <span className="text-xs">/100</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="bg-surface-muted px-3 py-3">
                    <div className="flex items-center gap-2">
                      <VisitSite casino={row.casino} />
                      <Link
                        href={`/casinos/${row.casino.slug}`}
                        aria-label={`${row.casino.name} review`}
                        title="More Info"
                        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md bg-white text-primary-900 hover:text-secondary-700"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                          <path d="M7.3 4.3a1 1 0 011.4 0l5 5a1 1 0 010 1.4l-5 5a1 1 0 01-1.4-1.4L11.6 10 7.3 5.7a1 1 0 010-1.4z" />
                        </svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function CasinoBrand({ casino }: { casino: CasinoDTO }) {
  const logo = mediaUrl(casino.logoUrl);
  return (
    <Link href={`/casinos/${casino.slug}`} className="flex cursor-pointer flex-col items-center gap-1 text-center text-primary-900 hover:text-secondary-700">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img loading="lazy" decoding="async" src={logo} alt="" className="h-8 w-16 object-contain" />
      ) : (
        <span
          aria-hidden="true"
          className="h-8 w-16 rounded bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:10px_10px]"
        />
      )}
      <span className="text-xs">{casino.name}</span>
    </Link>
  );
}

function Score({ casino }: { casino: CasinoDTO }) {
  return (
    <div className="flex flex-col items-center gap-1 text-primary-900">
      <p>
        <span className="text-2xl font-bold">{Math.min(casino.rating * 2, 10).toFixed(1)}</span>
        <span className="text-xs">/10</span>
      </p>
      <StarRating rating={casino.rating} size="h-3.5 w-3.5" />
    </div>
  );
}

function VisitSite({ casino }: { casino: CasinoDTO }) {
  return (
    <Link
      href={casino.ctaUrl || `/casinos/${casino.slug}`}
      rel="noopener noreferrer sponsored"
      className="flex-1 cursor-pointer rounded-md bg-primary-900 px-4 py-2 text-center text-sm font-semibold whitespace-nowrap text-white hover:bg-primary-800"
    >
      Visit Site
    </Link>
  );
}

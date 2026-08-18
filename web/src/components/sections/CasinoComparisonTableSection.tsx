import Link from "next/link";
import { field, sectionClassName, type PageSection } from "@/lib/pages";
import { getCasinos, getBonuses } from "@/app/[region]/_lib/api";

// "Comparison of Thailand Online Casino Ratings" — a region-scoped ranked
// table using real Casino fields (rating, paymentMethods, payoutSpeed)
// rather than fabricating columns Casino doesn't have (Figma splits payment
// into "Crypto"/"Latest Payment", but paymentMethods is a flat string list
// with no such categorization). The "Bonus" column shows each casino's
// first published bonus title, if any.
export default async function CasinoComparisonTableSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const regionCode = field(section.fields, 0, "regionCode")?.textValue ?? "";
  const limit = Number(field(section.fields, 0, "limit")?.textValue) || 5;

  if (!regionCode) return null;

  const [casinos, bonuses] = await Promise.all([getCasinos(regionCode, undefined, limit), getBonuses(regionCode, undefined, 200)]);
  if (casinos.length === 0) return null;

  const firstBonusByCasino = new Map<number, string>();
  for (const bonus of bonuses) {
    if (bonus.casinoId != null && !firstBonusByCasino.has(bonus.casinoId)) {
      firstBonusByCasino.set(bonus.casinoId, bonus.title);
    }
  }

  return (
    <section id={section.customId || undefined} className={sectionClassName("section--casino-comparison-table", section)}>
      <div className="section-container flex flex-col gap-6 py-16">
        {heading && (
          <div className="section-row">
            <div className="section-col text-center">
              <h2 className="section-heading text-2xl font-bold text-primary-900">{heading}</h2>
            </div>
          </div>
        )}
        <div className="section-row w-full overflow-x-auto rounded-lg border border-primary-100">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-primary-900 text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">Brand</th>
                <th className="px-4 py-3 font-semibold">Bonus</th>
                <th className="px-4 py-3 font-semibold">Payment Methods</th>
                <th className="px-4 py-3 font-semibold">Payout Speed</th>
                <th className="px-4 py-3 font-semibold">Rating</th>
                <th className="px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {casinos.map((casino) => (
                <tr key={casino.id} className="border-t border-primary-100">
                  <td className="px-4 py-3 font-medium text-primary-900">
                    <Link href={`/casinos/${casino.slug}`} className="cursor-pointer hover:text-secondary-600 hover:underline">
                      {casino.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-primary-600">{firstBonusByCasino.get(casino.id) ?? "—"}</td>
                  <td className="px-4 py-3 text-primary-600">{casino.paymentMethods?.join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-primary-600">{casino.payoutSpeed || "—"}</td>
                  <td className="px-4 py-3 text-primary-600">{casino.rating.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/casinos/${casino.slug}`}
                      className="cursor-pointer rounded-md bg-secondary-600 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-primary-900 hover:bg-secondary-700"
                    >
                      More Info
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

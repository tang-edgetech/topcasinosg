import Link from "next/link";
import { field, sectionClassName, type PageSection } from "@/lib/pages";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

interface BonusRow {
  id: number;
  casinoId: number | null;
  title: string;
  terms: string;
  code: string | null;
}

interface CasinoRow {
  id: number;
  slug: string;
  name: string;
}

// Async server component — unlike every other section (rendered purely from
// its own field data), this one fetches live Bonus/Casino data at render
// time using the admin-configured regionCode/bonusType/limit, rather than
// storing bonus data on the page itself. Table columns are Brand/Bonus/
// Terms/Code only — Wagering Requirement and Min Deposit aren't separate
// structured fields on Bonus (just embedded in `terms` as free text), so
// showing them as their own columns would mean fabricating numbers that
// don't exist in the data.
export default async function BonusListingTableSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const regionCode = field(section.fields, 0, "regionCode")?.textValue ?? "";
  const bonusType = field(section.fields, 0, "bonusType")?.textValue || "welcome";
  const limit = Number(field(section.fields, 0, "limit")?.textValue) || 5;

  if (!regionCode) {
    return (
      <section id={section.customId || undefined} className={sectionClassName("section--bonus-listing-table", section)}>
        <div className="section-container py-16">
          <p className="text-sm text-primary-500">Bonus Listing Table: no region code configured.</p>
        </div>
      </section>
    );
  }

  const [bonuses, casinos] = await Promise.all([fetchBonuses(regionCode, bonusType, limit), fetchCasinos(regionCode)]);
  const casinoById = new Map(casinos.map((c) => [c.id, c]));

  return (
    <section id={section.customId || undefined} className={sectionClassName("section--bonus-listing-table", section)}>
      <div className="section-container flex flex-col gap-4 py-16">
        <div className="section-row">
          <div className="section-col">
            {heading && <h2 className="section-heading text-2xl font-bold text-primary-900">{heading}</h2>}
          </div>
        </div>
        <div className="section-row">
          <div className="section-col w-full overflow-x-auto rounded-lg border border-primary-100">
            {bonuses.length === 0 ? (
              <p className="p-4 text-sm text-primary-500">No bonuses published for this region/type yet.</p>
            ) : (
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="bg-primary-900 text-white">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Brand</th>
                    <th className="px-4 py-3 font-semibold">Bonus</th>
                    <th className="px-4 py-3 font-semibold">Code</th>
                    <th className="px-4 py-3 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {bonuses.map((bonus) => {
                    const casino = bonus.casinoId ? casinoById.get(bonus.casinoId) : undefined;
                    return (
                      <tr key={bonus.id} className="border-t border-primary-100">
                        <td className="px-4 py-3 font-medium text-primary-900">
                          {casino ? (
                            <Link href={`/casinos/${casino.slug}`} className="cursor-pointer hover:text-secondary-600 hover:underline">
                              {casino.name}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-primary-600">
                          <div className="font-semibold text-primary-900">{bonus.title}</div>
                          <div className="text-xs">{bonus.terms}</div>
                        </td>
                        <td className="px-4 py-3 text-primary-600">{bonus.code ?? "—"}</td>
                        <td className="px-4 py-3">
                          {casino && (
                            <Link
                              href={`/casinos/${casino.slug}`}
                              className="cursor-pointer rounded-md bg-secondary-600 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-primary-900 hover:bg-secondary-700"
                            >
                              Claim Here
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

async function fetchBonuses(regionCode: string, bonusType: string, limit: number): Promise<BonusRow[]> {
  try {
    const params = new URLSearchParams({ region: regionCode, bonusType, pageSize: String(limit) });
    const res = await fetch(`${API_BASE_URL}/api/bonuses?${params.toString()}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const body = (await res.json()) as { success?: boolean; data?: { bonuses?: BonusRow[] } };
    return body.data?.bonuses ?? [];
  } catch {
    return [];
  }
}

async function fetchCasinos(regionCode: string): Promise<CasinoRow[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/casinos?region=${encodeURIComponent(regionCode)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { success?: boolean; data?: { casinos?: CasinoRow[] } };
    return body.data?.casinos ?? [];
  } catch {
    return [];
  }
}

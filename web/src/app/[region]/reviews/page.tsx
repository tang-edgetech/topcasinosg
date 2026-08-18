import Link from "next/link";
import { getCasinos, getBlacklistEntries, getActiveRegionByCode, ALL_GAME_TYPES, type GameType } from "../_lib/api";
import { buildPageMenu } from "../_lib/pageMenu";
import AccordionItem from "@/components/Accordion";
import IntroductionSection from "@/components/IntroductionSection";

/**
 * /{region}/reviews — region-scoped casino review hub (Figma "TH/Reviews").
 * Bespoke coded route, not Pages-CMS, since every section is live
 * region-scoped data (casinos, blacklist) rather than editorial copy —
 * matches the /{region}/bonuses, /{region}/rtp sibling pattern.
 */

const FAQS = [
  { q: "Are online casinos legal in this region?", a: "Laws vary — check local regulations before playing. We only list operators with verifiable licensing." },
  { q: "How do I choose a trusted online casino?", a: "Look at our Rating and Safe Index scores, check the Blacklist below, and confirm the casino holds a real license." },
  { q: "Is it safe to gamble online here?", a: "It can be, if you stick to casinos with a high Safe Index and avoid anything on our Blacklist." },
  { q: "What payment methods work best?", a: "This varies per casino — check each casino's own review page for its supported payment methods." },
];

function GameTypeIcon({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
      <circle cx="16" cy="8" r="1" fill="currentColor" />
      <circle cx="8" cy="16" r="1" fill="currentColor" />
      <circle cx="16" cy="16" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

export default async function RegionReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ region: string }>;
  searchParams: Promise<{ game?: string }>;
}) {
  const { region } = await params;
  const { game } = await searchParams;
  const activeGame = ALL_GAME_TYPES.find((g) => g.value === game)?.value as GameType | undefined;

  const [casinos, { entries: blacklistEntries }, regionData] = await Promise.all([
    getCasinos(region, activeGame),
    getBlacklistEntries(region, 1, 4),
    getActiveRegionByCode(region),
  ]);
  const regionName = regionData?.name ?? region.toUpperCase();

  const featured = casinos.slice(0, 3);

  const riskBadgeClass = (risk: "low" | "medium" | "high" | null) =>
    risk === "low"
      ? "bg-success-subtle text-success"
      : risk === "medium"
        ? "bg-secondary-50 text-secondary-800"
        : risk === "high"
          ? "bg-danger/10 text-danger"
          : "bg-primary-100 text-primary-500";

  return (
    <div id="region-reviews-page" className="region-reviews-page flex flex-col">
      <IntroductionSection
        heading={`Best Online Casino Reviews in ${regionName}`}
        highlightText={regionName}
        subheading="Compare Ratings & Safe Index"
        paragraph={`<p>Every casino we list for ${regionName} is scored on licensing, payout speed, game fairness, and real player feedback — so you can compare with confidence before you sign up.</p>`}
        pageMenu={buildPageMenu(region, `${regionName} 2025`, "reviews")}
      />

      <div className="flex flex-col gap-14 py-14">
      <section id="region-reviews-top-rated" className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-primary-900">Top-Rated Online Casinos</h2>
        {featured.length === 0 ? (
          <p className="text-sm text-primary-500">No casinos published for this region yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {featured.map((casino) => (
              <div
                key={casino.id}
                className="flex flex-col gap-3 rounded-lg border border-primary-100 bg-surface-muted p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-primary-900">{casino.name}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-secondary-600 shadow-sm">
                    <span aria-hidden="true">★</span>
                    {casino.rating.toFixed(1)} / 5
                  </span>
                </div>
                {casino.safeIndex !== null && (
                  <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${riskBadgeClass(casino.riskStatus)}`}>
                    Safe Index {casino.safeIndex}
                  </span>
                )}
                <div className="mt-auto flex gap-2">
                  <a
                    href={casino.ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 cursor-pointer rounded-md bg-primary-900 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-primary-800"
                  >
                    Visit Site
                  </a>
                  <Link
                    href={`/casinos/${casino.slug}`}
                    className="flex-1 cursor-pointer rounded-md border border-primary-200 px-3 py-2 text-center text-sm font-semibold text-primary-900 hover:border-primary-500"
                  >
                    More Info
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="region-reviews-list" className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-primary-900">Online Casinos List</h2>
        {casinos.length === 0 ? (
          <p className="text-sm text-primary-500">No casinos match this filter yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-primary-100">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-primary-900 text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold">Brand</th>
                  <th className="px-4 py-3 font-semibold">Rating</th>
                  <th className="px-4 py-3 font-semibold">Safe Index</th>
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
                    <td className="px-4 py-3 text-primary-600">{casino.rating.toFixed(1)} / 5</td>
                    <td className="px-4 py-3 text-primary-600">{casino.safeIndex ?? "—"}</td>
                    <td className="px-4 py-3">
                      <a
                        href={casino.ctaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer rounded-md bg-secondary-600 px-3 py-1.5 text-xs font-semibold text-primary-900 hover:bg-secondary-700"
                      >
                        Visit Site
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {blacklistEntries.length > 0 && (
        <section id="region-reviews-avoid" className="flex flex-col gap-4 rounded-lg bg-gradient-to-r from-primary-900 to-danger p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Avoid These Online Casinos</h2>
            <Link href={`/${region}/blacklist`} className="cursor-pointer text-sm font-semibold text-white hover:underline">
              See All →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {blacklistEntries.map((entry) => (
              <div key={entry.id} className="rounded-lg bg-white/95 p-4">
                <p className="text-sm font-bold text-primary-900">{entry.name}</p>
                <p className="mt-1 text-xs font-semibold text-danger">{entry.reason}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section id="region-reviews-game-filter" className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-primary-900">Choose an Online Casino Based on Your Playing Style</h2>
        <p className="text-sm text-primary-500">Select a game to see casinos that support it.</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/${region}/reviews`}
            className={`flex flex-col items-center gap-1 rounded-lg border px-4 py-3 text-xs font-medium ${
              !activeGame ? "border-primary-900 bg-primary-900 text-white" : "border-primary-100 text-primary-700 hover:border-primary-500"
            }`}
          >
            <GameTypeIcon className="h-5 w-5" />
            All Games
          </Link>
          {ALL_GAME_TYPES.map((g) => (
            <Link
              key={g.value}
              href={`/${region}/reviews?game=${g.value}`}
              className={`flex flex-col items-center gap-1 rounded-lg border px-4 py-3 text-xs font-medium ${
                activeGame === g.value
                  ? "border-primary-900 bg-primary-900 text-white"
                  : "border-primary-100 text-primary-700 hover:border-primary-500"
              }`}
            >
              <GameTypeIcon className="h-5 w-5" />
              {g.label}
            </Link>
          ))}
        </div>
      </section>

      <section id="region-reviews-faq" className="flex flex-col gap-4">
        <h2 className="text-xl font-bold text-primary-900">Online Casinos FAQs</h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq) => (
            <AccordionItem
              key={faq.q}
              className="rounded-lg border border-primary-100 p-4"
              header={<span className="text-base font-semibold text-primary-900">{faq.q}</span>}
            >
              <p className="pt-3 text-sm leading-relaxed text-primary-600">{faq.a}</p>
            </AccordionItem>
          ))}
        </div>
      </section>

      <section id="region-reviews-ctas" className="flex flex-col items-center gap-4 rounded-lg bg-primary-50 p-8 text-center">
        <h2 className="text-xl font-bold text-primary-900">Find the Right Online Casino & Start Playing Safely</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={`/${region}/bonuses`} className="rounded-md bg-primary-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-800">
            Explore Bonuses
          </Link>
          <Link href={`/${region}/rtp`} className="rounded-md border border-primary-300 bg-white px-5 py-2.5 text-sm font-semibold text-primary-900 hover:border-primary-500">
            Explore RTP
          </Link>
          <Link href={`/${region}/blacklist`} className="rounded-md border border-primary-300 bg-white px-5 py-2.5 text-sm font-semibold text-primary-900 hover:border-primary-500">
            Avoid These Casinos
          </Link>
        </div>
      </section>
      </div>
    </div>
  );
}

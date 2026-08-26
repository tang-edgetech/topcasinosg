import Link from "next/link";
import type { Metadata } from "next";
import { getCasinos, getRegions, type CasinoDTO } from "./lib";
import CasinoBadge from "./CasinoBadge";
import IntroductionSection from "@/components/IntroductionSection";
import PageGrid from "@/components/PageGrid";

/**
 * /casinos — all casino reviews, grid view with an optional region filter.
 *
 * Server Component: casinos (and regions, for the filter tabs) are fetched
 * fresh on each request (short revalidate window in ./lib.ts) so newly
 * scheduled-publish reviews show up without a rebuild.
 */

export const metadata: Metadata = {
  title: "Casino Reviews | Top Casino SG",
  description:
    "Independent, in-depth reviews of the top online casinos available to Singapore players — ratings, payout speed, payment methods and more.",
};

function RatingBadge({ rating }: { rating: number }) {
  return (
    <span className="casino-card__rating inline-flex items-center gap-1 text-sm font-semibold text-secondary-600">
      <span aria-hidden="true">★</span>
      {rating.toFixed(1)} / 5
    </span>
  );
}

function CasinoCard({ casino }: { casino: CasinoDTO }) {
  return (
    <article
      id={`casino-card-${casino.slug}`}
      className="casino-card flex flex-col gap-4 rounded-xl border border-primary-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="casino-card__header flex items-center gap-3">
        <CasinoBadge name={casino.name} />
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-primary-900">{casino.name}</h2>
          <RatingBadge rating={casino.rating} />
        </div>
      </div>

      <p className="casino-card__summary line-clamp-3 flex-1 text-sm text-primary-600">{casino.summary}</p>

      <Link
        href={`/casinos/${casino.slug}`}
        className="casino-card__cta cursor-pointer text-sm font-semibold text-secondary-600 transition-colors hover:underline"
      >
        Read Review &rarr;
      </Link>
    </article>
  );
}

export default async function CasinosPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const { region } = await searchParams;
  const [casinos, regions] = await Promise.all([getCasinos(region), getRegions()]);

  const activeRegions = regions.filter((r) => r.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div id="casinos-page" className="casinos-page flex flex-1 flex-col bg-white">
      <PageGrid>
      <IntroductionSection
        heading="Casino Reviews"
        highlightText="Reviews"
        subheading="Independent, Data-Driven Ratings"
        paragraph="<p>Independent, in-depth reviews of the top online casinos we track — ratings, payout speed, payment methods and more.</p>"
      />
      {activeRegions.length > 0 && (
        <section
          id="casinos-region-filter"
          className="casinos-region-filter border-b border-primary-100 bg-white px-6 py-4"
        >
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2">
            <Link
              href="/casinos"
              className={`casinos-region-filter__tab cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                !region
                  ? "bg-primary-900 text-white"
                  : "bg-surface-muted text-primary-600 hover:bg-primary-100"
              }`}
            >
              All Regions
            </Link>
            {activeRegions.map((r) => (
              <Link
                key={r.id}
                href={`/casinos?region=${r.code}`}
                className={`casinos-region-filter__tab cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  region === r.code
                    ? "bg-primary-900 text-white"
                    : "bg-surface-muted text-primary-600 hover:bg-primary-100"
                }`}
              >
                {r.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section id="casinos-list" className="casinos-list flex-1 px-6 py-12">
        <div className="mx-auto w-full max-w-7xl">
          {casinos.length === 0 ? (
            <p id="casinos-empty-state" className="casinos-empty-state text-center text-base text-primary-500">
              No casino reviews published yet.
            </p>
          ) : (
            <div className="casinos-grid grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {casinos.map((casino) => (
                <CasinoCard key={casino.id} casino={casino} />
              ))}
            </div>
          )}
        </div>
      </section>
      </PageGrid>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCasino, getRegions } from "../lib";
import CasinoBadge from "../CasinoBadge";
import { sanitizeRichText } from "@/lib/sanitize-html";

/**
 * /casinos/[slug] — single casino review.
 *
 * Only renders fields that actually exist on CasinoDTO. The Figma mockup for
 * this page has speculative sections (Game Providers, Licenses, VIP
 * Benefits, a Games list, a pros/cons Comparison table, "Bonuses for this
 * casino") that have no backing data in this CMS — intentionally omitted
 * rather than faked.
 */

interface CasinoPageParams {
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<CasinoPageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const casino = await getCasino(slug);

  if (!casino) {
    return { title: "Casino Review | Top Casino SG" };
  }

  return {
    title: `${casino.name} Casino Review | Top Casino SG`,
    description: casino.summary,
  };
}

export default async function CasinoDetailPage({
  params,
}: {
  params: Promise<CasinoPageParams>;
}) {
  const { slug } = await params;
  const [casino, regions] = await Promise.all([getCasino(slug), getRegions()]);

  if (!casino) {
    notFound();
  }

  const regionNames = (casino.regionIds ?? [])
    .map((id) => regions.find((r) => r.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <div id="casino-detail-page" className="casino-detail-page flex flex-1 flex-col bg-white">
      <section id="casino-detail-hero" className="casino-detail-hero bg-surface-muted px-6 py-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
          <nav aria-label="Breadcrumb" className="casino-detail-breadcrumb text-sm text-primary-500">
            <Link href="/" className="cursor-pointer hover:text-secondary-600 hover:underline">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/casinos" className="cursor-pointer hover:text-secondary-600 hover:underline">
              Casino Reviews
            </Link>
            <span className="mx-2">/</span>
            <span className="text-primary-900">{casino.name}</span>
          </nav>

          <div className="casino-detail-heading flex items-center gap-4">
            <CasinoBadge name={casino.name} size={56} />
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold tracking-tight text-primary-900 sm:text-4xl">
                {casino.name} Casino Review
              </h1>
              <span className="casino-detail-rating inline-flex w-fit items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-semibold text-secondary-600 shadow-sm">
                <span aria-hidden="true">★</span>
                {casino.rating.toFixed(1)} / 5
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="casino-detail-body" className="casino-detail-body px-6 py-12">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="casino-detail-article flex flex-col gap-6 lg:col-span-2">
            <p className="casino-detail-summary text-lg font-medium text-primary-900">{casino.summary}</p>

            <div
              className="casino-detail-content rich-text-content whitespace-pre-line text-base leading-relaxed text-primary-600"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(casino.content) }}
            />

            <a
              href={casino.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="casino-detail-cta inline-flex w-fit cursor-pointer items-center justify-center rounded-md bg-primary-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gradient-to-r hover:from-primary-900 hover:to-primary-glow"
            >
              Visit Site
            </a>
          </div>

          <aside
            id="casino-detail-sidebar"
            className="casino-detail-sidebar flex h-fit flex-col gap-5 rounded-xl border border-primary-100 bg-surface-muted p-6"
          >
            <h2 className="text-lg font-bold text-primary-900">Casino Info</h2>

            <div className="casino-detail-info-item flex flex-col gap-1">
              <span className="text-xs font-semibold tracking-wide text-primary-500 uppercase">
                Payout Speed
              </span>
              <span className="text-sm text-primary-900">{casino.payoutSpeed}</span>
            </div>

            {casino.languages && casino.languages.length > 0 && (
              <div className="casino-detail-info-item flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wide text-primary-500 uppercase">
                  Languages
                </span>
                <span className="text-sm text-primary-900">{casino.languages.join(", ")}</span>
              </div>
            )}

            {casino.paymentMethods && casino.paymentMethods.length > 0 && (
              <div className="casino-detail-info-item flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wide text-primary-500 uppercase">
                  Payment Methods
                </span>
                <span className="text-sm text-primary-900">{casino.paymentMethods.join(", ")}</span>
              </div>
            )}

            {regionNames.length > 0 && (
              <div className="casino-detail-info-item flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wide text-primary-500 uppercase">
                  Regions Available
                </span>
                <span className="text-sm text-primary-900">{regionNames.join(", ")}</span>
              </div>
            )}

            <a
              href={casino.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="casino-detail-sidebar-cta cursor-pointer rounded-md bg-secondary-600 px-4 py-2.5 text-center text-sm font-semibold text-primary-900 transition-colors hover:bg-secondary-700"
            >
              Visit {casino.name} &rarr;
            </a>
          </aside>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCasino,
  getRegions,
  getBonusesForCasino,
  getRtpEntriesForCasino,
  getGameProviders,
  getLicenses,
  toTitleCase,
  ALL_GAME_TYPES,
} from "../lib";
import CasinoBadge from "../CasinoBadge";
import LogoGrid from "../LogoGrid";
import { sanitizeRichText } from "@/lib/sanitize-html";

/**
 * /casinos/[slug] — single casino review.
 *
 * Bonuses, VIP Benefit (the `loyalty_vip` bonus type), RTP score, Comparison
 * (pros/cons), Safe Index/Risk Status, the Games checklist (a fixed GameType
 * taxonomy, see supportedGames), Game Providers, and Licenses (both managed
 * logo lists, same shape — see GameProviderDTO/LicenseDTO) are all backed by
 * real CasinoDTO/Bonus/RTP fields now. Every section from the Figma mockup
 * this page was originally compared against has real data behind it.
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

  const [bonuses, rtpEntries, gameProviders, licenses] = await Promise.all([
    getBonusesForCasino(casino.id),
    getRtpEntriesForCasino(casino.id),
    getGameProviders(),
    getLicenses(),
  ]);
  const casinoGameProviders = gameProviders.filter((p) => casino.gameProviderIds?.includes(p.id));
  const casinoLicenses = licenses.filter((l) => casino.licenseIds?.includes(l.id));
  const vipBonuses = bonuses.filter((b) => b.bonusType === "loyalty_vip");
  const generalBonuses = bonuses.filter((b) => b.bonusType !== "loyalty_vip");
  const averageRtp =
    rtpEntries.length > 0
      ? rtpEntries.reduce((sum, e) => sum + e.rtpPercentage, 0) / rtpEntries.length
      : null;

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

            {generalBonuses.length > 0 && (
              <section id="casino-detail-bonuses" className="flex flex-col gap-3">
                <h2 className="text-xl font-bold text-primary-900">Bonuses</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {generalBonuses.map((bonus) => (
                    <div
                      key={bonus.id}
                      className="casino-bonus-card flex flex-col gap-2 rounded-lg border border-primary-100 bg-surface-muted p-4"
                    >
                      <span className="w-fit rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-900">
                        {toTitleCase(bonus.bonusType)}
                      </span>
                      <h3 className="text-base font-semibold text-primary-900">{bonus.title}</h3>
                      <p className="text-sm text-primary-600">{bonus.terms}</p>
                      {bonus.code && (
                        <span className="w-fit rounded border border-dashed border-secondary-600 bg-secondary-50 px-2 py-1 text-xs font-semibold text-primary-900">
                          Code: {bonus.code}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {vipBonuses.length > 0 && (
              <section id="casino-detail-vip-benefits" className="flex flex-col gap-3">
                <h2 className="text-xl font-bold text-primary-900">VIP Benefit</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {vipBonuses.map((bonus) => (
                    <div
                      key={bonus.id}
                      className="casino-vip-card flex flex-col gap-2 rounded-lg border border-secondary-200 bg-secondary-50 p-4"
                    >
                      <h3 className="text-base font-semibold text-primary-900">{bonus.title}</h3>
                      <p className="text-sm text-primary-600">{bonus.terms}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {casino.supportedGames && casino.supportedGames.length > 0 && (
              <section id="casino-detail-games" className="flex flex-col gap-3">
                <h2 className="text-xl font-bold text-primary-900">Games</h2>
                <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                  {ALL_GAME_TYPES.map((game) => {
                    const supported = casino.supportedGames?.includes(game.value) ?? false;
                    return (
                      <div key={game.value} className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-primary-900">{game.label}</span>
                        <span
                          aria-hidden="true"
                          className={supported ? "text-success" : "text-primary-300"}
                        >
                          {supported ? "✓" : "✕"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <LogoGrid id="casino-detail-game-providers" heading="Game Providers" items={casinoGameProviders} />

            <LogoGrid id="casino-detail-licenses" heading="Licences" items={casinoLicenses} />

            {((casino.pros && casino.pros.length > 0) || (casino.cons && casino.cons.length > 0)) && (
              <section id="casino-detail-comparison" className="flex flex-col gap-3">
                <h2 className="text-xl font-bold text-primary-900">Comparison</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {casino.pros && casino.pros.length > 0 && (
                    <div className="flex flex-col gap-2 rounded-lg bg-success-subtle p-4">
                      <h3 className="text-sm font-semibold text-success">Positive</h3>
                      <ul className="flex flex-col gap-1 text-sm text-primary-700">
                        {casino.pros.map((pro) => (
                          <li key={pro} className="flex items-start gap-1.5">
                            <span aria-hidden="true" className="text-success">✓</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {casino.cons && casino.cons.length > 0 && (
                    <div className="flex flex-col gap-2 rounded-lg bg-danger/5 p-4">
                      <h3 className="text-sm font-semibold text-danger">Negative</h3>
                      <ul className="flex flex-col gap-1 text-sm text-primary-700">
                        {casino.cons.map((con) => (
                          <li key={con} className="flex items-start gap-1.5">
                            <span aria-hidden="true" className="text-danger">✕</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

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

            {(casino.safeIndex !== null || casino.riskStatus !== null) && (
              <div className="flex items-center gap-4">
                {casino.safeIndex !== null && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold tracking-wide text-primary-500 uppercase">
                      Safe Index
                    </span>
                    <span className="text-lg font-bold text-primary-900">{casino.safeIndex}</span>
                  </div>
                )}
                {casino.riskStatus !== null && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold tracking-wide text-primary-500 uppercase">
                      Status
                    </span>
                    <span
                      className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        casino.riskStatus === "low"
                          ? "bg-success-subtle text-success"
                          : casino.riskStatus === "medium"
                            ? "bg-secondary-50 text-secondary-800"
                            : "bg-danger/10 text-danger"
                      }`}
                    >
                      {casino.riskStatus === "low" ? "Low-Risk" : casino.riskStatus === "medium" ? "Medium-Risk" : "High-Risk"}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="casino-detail-info-item flex flex-col gap-1">
              <span className="text-xs font-semibold tracking-wide text-primary-500 uppercase">
                Payout Speed
              </span>
              <span className="text-sm text-primary-900">{casino.payoutSpeed}</span>
            </div>

            {averageRtp !== null && (
              <div className="casino-detail-info-item flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-wide text-primary-500 uppercase">
                  Average RTP
                </span>
                <span className="text-sm text-primary-900">{averageRtp.toFixed(2)}%</span>
              </div>
            )}

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

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getBonusesForCasino,
  getCasino,
  getGameProviders,
  getLicenses,
  getPaymentBadgeLookup,
  getRegions,
  toTitleCase,
  type BonusDTO,
  type CasinoDTO,
} from "@/app/[region]/_lib/api";
import { mediaUrl } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { DISPLAY_GAME_TYPES } from "@/lib/gameTypes";
import CasinoLogo from "@/components/CasinoLogo";
import GameTypeIcon from "@/components/GameTypeIcon";
import PaymentMethodBadges, { type PaymentBadge } from "@/components/PaymentMethodBadges";

/**
 * /casinos/{slug} — casino review (Figma "D / Brand Page / 1 Overview").
 * Fully driven by the Casino record and its bonuses: a sticky score card on
 * the left (logo, rating /10, Safe Index, risk status, Visit Site, regions,
 * payment methods, currencies, RTP, payout speed) and the overview grid on
 * the right (Bonuses, VIP Benefit, Games, Game Providers, Licences,
 * Comparison). The long-form review text, when present, follows the grid.
 */

const MAX_BONUS_CARDS = 3;
const MAX_LOGOS = 10;

const RISK_STYLES: Record<string, { label: string; className: string }> = {
  low: { label: "Low-Risk", className: "text-success" },
  medium: { label: "Medium-Risk", className: "text-secondary-800" },
  high: { label: "High-Risk", className: "text-danger" },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const casino = await getCasino(slug);
  if (!casino) return {};
  return {
    title: `${casino.name} Casino Review ${new Date().getFullYear()} | Top Casino`,
    description: casino.summary || undefined,
  };
}

export default async function CasinoReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const casino = await getCasino(slug);
  if (!casino) notFound();

  const [bonuses, regions, providers, licenses] = await Promise.all([getBonusesForCasino(casino.id), getRegions(), getGameProviders(), getLicenses()]);
  const casinoRegions = regions.filter((r) => (casino.regionIds ?? []).includes(r.id)).sort((a, b) => a.sortOrder - b.sortOrder);
  const badgeLookups = await Promise.all(casinoRegions.map((r) => getPaymentBadgeLookup(r.code)));
  const paymentBadges = mergeBadges(badgeLookups.map((lookup) => lookup(casino.paymentMethods)), casino.paymentMethods);

  const regionById = new Map(regions.map((r) => [r.id, r]));
  const offers = bonuses.filter((b) => b.bonusType !== "loyalty_vip").slice(0, MAX_BONUS_CARDS);
  const vip = bonuses.find((b) => b.bonusType === "loyalty_vip");
  const casinoProviders = providers.filter((p) => (casino.gameProviderIds ?? []).includes(p.id));
  const casinoLicenses = licenses.filter((l) => (casino.licenseIds ?? []).includes(l.id));
  const ctaUrl = casino.ctaUrl || "#";

  return (
    <div id="casino-review-page" className="casino-review flex flex-1 flex-col bg-white">
      <nav aria-label="Breadcrumb" className="casino-review__breadcrumb bg-gradient-to-r from-primary-900 to-primary-glow">
        <ol className="section-container flex flex-wrap items-center gap-2 py-3 text-xs text-white">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="h-1 w-1 rounded-full bg-secondary-500" />
          <li>
            <Link href="/casinos" className="hover:underline">
              Casino Reviews
            </Link>
          </li>
          <li aria-hidden="true" className="h-1 w-1 rounded-full bg-secondary-500" />
          <li aria-current="page">{casino.name} Casino Review</li>
        </ol>
      </nav>

      <div className="section-container grid grid-cols-1 gap-8 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-11">
        <aside className="casino-review__card lg:sticky lg:top-24 lg:self-start">
          <ScoreCard casino={casino} ctaUrl={ctaUrl} regions={casinoRegions.map((r) => ({ id: r.id, name: r.name, flag: mediaUrl(r.flagUrl) }))} badges={paymentBadges} />
        </aside>

        <main className="flex min-w-0 flex-col gap-8">
          <header className="flex flex-col gap-3">
            <h1 className="text-3xl font-bold text-primary-900">{casino.name} Casino Review</h1>
            {casino.summary && <p className="text-sm leading-relaxed whitespace-pre-line text-primary-600">{casino.summary}</p>}
          </header>

          <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
            {offers.length > 0 && (
              <Block title="Bonuses">
                {offers.map((bonus) => (
                  <OfferCard
                    key={bonus.id}
                    label={`${toTitleCase(bonus.bonusType)} Bonus${casinoRegions.length > 1 && regionById.get(bonus.regionId) ? ` · ${regionById.get(bonus.regionId)?.name}` : ""}`}
                    title={bonus.title}
                    detail={firstLine(bonus.terms)}
                    terms={termsOf(bonus)}
                  />
                ))}
              </Block>
            )}

            {vip && (
              <Block title="VIP Benefit">
                <OfferCard label="Top Benefits" title={vip.title} terms={termsOf(vip)} />
                {vip.upgradeBonus && <OfferCard label="Upgrade Bonus" title={vip.upgradeBonus} />}
                {vip.perks && <OfferCard label="Perks" title={vip.perks} />}
              </Block>
            )}

            <Block title="Games">
              <ul className="grid grid-cols-2 gap-2">
                {DISPLAY_GAME_TYPES.map((game) => {
                  const offered = (casino.supportedGames ?? []).includes(game.value);
                  return (
                    <li
                      key={game.value}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${offered ? "border-success/30 text-success" : "border-primary-100 text-primary-200"}`}
                    >
                      <GameTypeIcon type={game.value} className={`h-6 w-6 ${offered ? "text-primary-900" : "text-primary-200"}`} />
                      <span className="flex-1">{game.label}</span>
                      <span className="sr-only">{offered ? "offered" : "not offered"}</span>
                      <span aria-hidden="true" className={`h-2 w-3 rounded-full border ${offered ? "border-success" : "border-primary-100"}`} />
                    </li>
                  );
                })}
              </ul>
            </Block>

            <div className="flex flex-col gap-8">
              {casinoProviders.length > 0 && (
                <Block title="Game Providers">
                  <LogoBox items={casinoProviders.slice(0, MAX_LOGOS)} more={casinoProviders.length - MAX_LOGOS} />
                </Block>
              )}
              {casinoLicenses.length > 0 && (
                <Block title="Licences">
                  <LogoBox items={casinoLicenses} />
                </Block>
              )}
            </div>

            {((casino.pros ?? []).length > 0 || (casino.cons ?? []).length > 0) && (
              <Block title="Comparison">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <ProsCons title="Positive" items={casino.pros ?? []} tone="positive" />
                  <ProsCons title="Negative" items={casino.cons ?? []} tone="negative" />
                </div>
              </Block>
            )}
          </div>

          {casino.content && (
            <section className="flex flex-col gap-3 border-t border-primary-100 pt-8">
              <h2 className="text-2xl font-bold text-primary-900">About {casino.name}</h2>
              <div className="rich-text-content text-sm leading-relaxed text-primary-600" dangerouslySetInnerHTML={{ __html: sanitizeRichText(casino.content) }} />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function ScoreCard({
  casino,
  ctaUrl,
  regions,
  badges,
}: {
  casino: CasinoDTO;
  ctaUrl: string;
  regions: { id: number; name: string; flag: string | null }[];
  badges: PaymentBadge[];
}) {
  const risk = casino.riskStatus ? RISK_STYLES[casino.riskStatus] : null;
  const currencies = casino.currencies ?? [];
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-[0_4px_20px_rgba(26,30,113,0.12)]">
      <div className="flex h-32 items-center justify-center p-4">
        <CasinoLogo src={casino.logoUrl} name={casino.name} className="h-20 w-40" />
      </div>
      <div className="flex flex-col gap-2 bg-success-subtle p-3">
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Rating" value={Math.min(casino.rating * 2, 10).toFixed(1)} unit="/10" />
          <Stat label="Safe Index" value={casino.safeIndex != null ? String(casino.safeIndex) : "—"} unit={casino.safeIndex != null ? "/100" : ""} />
        </div>
        {risk && (
          <div className="rounded-lg bg-white px-3 py-2">
            <p className="text-xs text-primary-600">Status</p>
            <p className={`text-base font-bold ${risk.className}`}>{risk.label}</p>
          </div>
        )}
        <Link
          href={ctaUrl}
          rel="noopener noreferrer sponsored"
          className="cursor-pointer rounded-lg bg-success py-2.5 text-center text-sm font-bold text-white hover:brightness-95"
        >
          Visit Site
        </Link>
      </div>
      <div className="flex flex-col gap-4 p-4 text-sm">
        {regions.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-primary-600">Region</p>
            <ul className="flex flex-wrap gap-2">
              {regions.map((r) => (
                <li key={r.id} title={r.name}>
                  {r.flag ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.flag} alt={r.name} className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <span className="text-xs text-primary-900">{r.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {badges.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-primary-600">Payment Methods</p>
            <PaymentMethodBadges badges={badges} max={6} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {currencies.length > 0 && <Fact label="Currencies" value={String(currencies.length)} title={currencies.join(", ")} />}
          {casino.rtpPercentage != null && <Fact label="RTP" value={`${casino.rtpPercentage}%`} />}
          {casino.payoutSpeed && <Fact label="Payout Speed" value={casino.payoutSpeed} />}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-lg bg-white px-3 py-2">
      <p className="text-xs text-primary-600">{label}</p>
      <p className="text-success">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-xs">{unit}</span>
      </p>
    </div>
  );
}

function Fact({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <div title={title}>
      <p className="text-xs text-primary-600">{label}</p>
      <p className="font-bold text-primary-900">{value}</p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-2xl font-bold text-primary-900">{title}</h2>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}

// Figma "Comp / Overview - Bonus": a small label strip, a bold headline and
// an optional sub-line; the T&C toggle reveals the offer's terms.
function OfferCard({ label, title, detail, terms }: { label: string; title: string; detail?: string; terms?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-primary-100 bg-white">
      <p className="bg-primary-50 px-3 py-1 text-[11px] text-primary-600">{label}</p>
      <div className="px-3 py-2.5">
        <p className="text-base leading-snug font-bold text-primary-glow">{title}</p>
        {detail && <p className="text-xs text-primary-600">{detail}</p>}
        {terms && (
          <details className="group mt-1 text-xs text-primary-600">
            <summary className="cursor-pointer list-none text-primary-500 underline-offset-2 hover:underline">T&amp;C apply</summary>
            <p className="mt-1 whitespace-pre-line">{terms}</p>
          </details>
        )}
      </div>
    </div>
  );
}

function LogoBox({ items, more = 0 }: { items: { id: number; name: string; logoUrl: string | null }[]; more?: number }) {
  return (
    <div className="flex flex-wrap gap-3 rounded-lg border border-primary-100 p-3">
      {items.map((item) => (
        <CasinoLogo key={item.id} src={item.logoUrl} name={item.name} className="h-9 w-[4.5rem]" />
      ))}
      {more > 0 && <span className="self-center text-xs text-primary-500">+{more} more</span>}
    </div>
  );
}

function ProsCons({ title, items, tone }: { title: string; items: string[]; tone: "positive" | "negative" }) {
  const positive = tone === "positive";
  return (
    <div className={`rounded-lg border p-3 ${positive ? "border-success/30 bg-success-subtle" : "border-danger/30 bg-danger/10"}`}>
      <p className={`mb-1 font-bold ${positive ? "text-success" : "text-danger"}`}>{title}</p>
      <ul className="flex flex-col gap-1 text-xs text-primary-600">
        {items.length === 0 && <li>—</li>}
        {items.map((item) => (
          <li key={item} className="flex gap-1.5">
            <span aria-hidden="true" className={`mt-1 h-2 w-2.5 shrink-0 rounded-sm border ${positive ? "border-success" : "border-danger"}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

const firstLine = (text: string) => text.split(/(?<=[.!?])\s|\n/)[0] ?? "";

function termsOf(bonus: BonusDTO): string {
  return [
    bonus.terms,
    bonus.turnoverRequirement && `Wagering: ${bonus.turnoverRequirement}`,
    bonus.minDeposit && `Min. deposit: ${bonus.minDeposit}`,
    bonus.code && `Code: ${bonus.code}`,
    bonus.validUntil && `Valid until ${new Date(bonus.validUntil).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`,
  ]
    .filter(Boolean)
    .join("\n");
}

// A casino's payment methods with the first icon found across its regions.
function mergeBadges(perRegion: PaymentBadge[][], names: string[] | null): PaymentBadge[] {
  return (names ?? []).map((name) => ({ name, icon: perRegion.map((list) => list.find((b) => b.name === name)?.icon).find(Boolean) ?? null }));
}

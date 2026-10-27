import type { CSSProperties } from "react";
import { field, itemIndexes, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { getAllCasinos, getRtpEntries, type RTPCategory } from "@/app/[region]/_lib/api";
import HorizontalSlider from "@/components/HorizontalSlider";

const DEFAULT_LIMIT = 10;
const RTP_CATEGORIES: RTPCategory[] = ["slot", "table", "live", "other"];

interface GameCard {
  key: string | number;
  image: string | null;
  name: string;
  provider: string;
  rtp: string;
  ctaUrl: string;
  ctaLabel: string;
}

// Figma "Top High RTP Slot Games (Updated Weekly)" / "Table Games with
// Consistently High RTP": a slider of game cards (image, name, provider,
// RTP%, Visit Site) with See All + prev/next arrows in the heading row.
// source "auto" (the default for new sections) reads published RTP Entries
// for the region, highest RTP first, so editors maintain each game once in
// the RTP Entries screen; the card links to the entry's casino. source
// "manual" keeps hand-picked cards, where a picked casino supplies the link.
export default async function GameRtpCarouselSection({ section, regionCode: pageRegionCode }: { section: PageSection; regionCode?: string }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const seeAllUrl = field(section.fields, 0, "seeAllUrl")?.textValue ?? "";
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);
  const cards = await loadCards(section, pageRegionCode);

  if (cards.length === 0) return null;

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--game-rtp-carousel section--bg" : "section--game-rtp-carousel", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 py-8">
        <div className="section-row">
          <div className="section-col">
            <HorizontalSlider
              label={heading}
              slideClassName="w-[190px]"
              showArrows
              seeAllUrl={seeAllUrl || undefined}
              header={heading && <h2 className="section-heading text-2xl font-bold text-primary-900">{heading}</h2>}
            >
              {cards.map((card) => (
                <article
                  key={card.key}
                  className="game-rtp-carousel__card flex flex-col overflow-hidden rounded-lg border-2 border-white bg-white shadow-sm"
                >
                  {card.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img loading="lazy" decoding="async" src={card.image} alt="" className="h-[130px] w-full object-cover" />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="h-[130px] w-full bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]"
                    />
                  )}
                  <div className="flex flex-1 flex-col gap-0.5 px-2 pt-2 pb-2">
                    {card.name && <span className="truncate text-sm font-semibold text-primary-900">{card.name}</span>}
                    {card.provider && <span className="text-[10px] text-primary-500">by {card.provider}</span>}
                    {card.rtp && <span className="text-2xl font-bold text-primary-900">{card.rtp}</span>}
                    {card.ctaUrl && (
                      <a
                        href={card.ctaUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="mt-1 cursor-pointer rounded bg-primary-900 px-3 py-1.5 text-center text-sm font-semibold text-white hover:bg-primary-800"
                      >
                        {card.ctaLabel}
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </HorizontalSlider>
          </div>
        </div>
      </div>
    </section>
  );
}

async function loadCards(section: PageSection, pageRegionCode: string | undefined): Promise<GameCard[]> {
  const text = (itemIndex: number, key: string) => field(section.fields, itemIndex, key)?.textValue ?? "";
  const ctaLabel = text(0, "ctaLabel") || "Visit Site";

  if ((text(0, "source") || "manual") === "auto") {
    const regionCode = text(0, "regionCode") || pageRegionCode;
    if (!regionCode) return [];
    const categories = text(0, "category")
      .split(",")
      .map((c) => c.trim())
      .filter((c): c is RTPCategory => RTP_CATEGORIES.includes(c as RTPCategory));
    const limit = Number(text(0, "limit")) || DEFAULT_LIMIT;
    const entries = await getRtpEntries(regionCode, categories, limit);
    return entries.map((entry) => ({
      key: entry.id,
      image: mediaUrl(entry.imageUrl),
      name: entry.gameName,
      provider: entry.gameProviderName ?? "",
      rtp: `${entry.rtpPercentage.toFixed(2)}%`,
      ctaUrl: entry.casinoCtaUrl ?? "",
      ctaLabel,
    }));
  }

  const items = itemIndexes(section.fields);
  const needsCasinos = items.some((i) => text(i, "casinoId"));
  const casinos = needsCasinos ? await getAllCasinos() : [];
  const casinoById = new Map(casinos.map((c) => [String(c.id), c]));

  return items.map((itemIndex) => ({
    key: itemIndex,
    image: mediaUrl(field(section.fields, itemIndex, "image")?.mediaUrl),
    name: text(itemIndex, "name"),
    provider: text(itemIndex, "provider"),
    rtp: text(itemIndex, "rtp"),
    ctaUrl: text(itemIndex, "ctaUrl") || casinoById.get(text(itemIndex, "casinoId"))?.ctaUrl || "",
    ctaLabel: text(itemIndex, "ctaLabel") || ctaLabel,
  }));
}

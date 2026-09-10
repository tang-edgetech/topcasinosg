import type { CSSProperties } from "react";
import Link from "next/link";
import { field, itemIndexes, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";

// Figma "Top High RTP Slot Games (Updated Weekly)" / "Table Games with
// Consistently High RTP" pattern - a horizontally scrolling row of admin-
// curated game cards (image, name, provider, RTP%, Visit Site link). Not
// wired to domain.RTPEntry (gameName/category/rtpPercentage only, no
// image/provider/link) since this is hand-curated marketing content, not a
// straight data dump - same reasoning as ComparisonTableSection's rows.
export default function GameRtpCarouselSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const seeAllUrl = field(section.fields, 0, "seeAllUrl")?.textValue ?? "";
  const items = itemIndexes(section.fields);
  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  if (items.length === 0) return null;

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--game-rtp-carousel section--bg" : "section--game-rtp-carousel", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 flex flex-col gap-4 py-8">
        <div className="section-row flex items-center justify-between">
          {heading && <h2 className="section-heading text-xl font-bold text-primary-900">{heading}</h2>}
          {seeAllUrl && (
            <Link href={seeAllUrl} className="cursor-pointer text-sm font-semibold text-secondary-600 hover:underline">
              See All
            </Link>
          )}
        </div>
        <div className="section-row">
          <div className="game-rtp-carousel__track flex gap-4 overflow-x-auto pb-1">
            {items.map((itemIndex) => {
              const image = mediaUrl(field(section.fields, itemIndex, "image")?.mediaUrl);
              const name = field(section.fields, itemIndex, "name")?.textValue ?? "";
              const provider = field(section.fields, itemIndex, "provider")?.textValue ?? "";
              const rtp = field(section.fields, itemIndex, "rtp")?.textValue ?? "";
              const ctaUrl = field(section.fields, itemIndex, "ctaUrl")?.textValue ?? "";
              const ctaLabel = field(section.fields, itemIndex, "ctaLabel")?.textValue || "Visit Site";

              return (
                <div
                  key={itemIndex}
                  className="game-rtp-carousel__card flex w-40 shrink-0 flex-col overflow-hidden rounded-lg border border-primary-100 bg-surface shadow-sm"
                >
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt="" className="h-28 w-full object-cover" />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="h-28 w-full bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:16px_16px]"
                    />
                  )}
                  <div className="flex flex-1 flex-col gap-1 p-3">
                    {name && <span className="text-sm font-semibold text-primary-900">{name}</span>}
                    {provider && <span className="text-xs text-primary-500">by {provider}</span>}
                    {rtp && <span className="text-lg font-bold text-primary-900">{rtp}</span>}
                    {ctaUrl && (
                      <Link
                        href={ctaUrl}
                        className="mt-auto cursor-pointer rounded-md bg-primary-900 px-3 py-1.5 text-center text-xs font-semibold text-white hover:bg-primary-800"
                      >
                        {ctaLabel}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

import type { CSSProperties } from "react";
import Link from "next/link";
import { field, itemIndexes, mediaUrl, sectionClassName, sectionBgStyle, type PageSection } from "@/lib/pages";
import { getGuides } from "@/app/[region]/_lib/api";
import { getNewsArticles } from "@/app/news/_lib/api";
import HorizontalSlider from "@/components/HorizontalSlider";

interface CarouselCard {
  slug: string;
  title: string;
  excerpt: string;
  href: string;
  cover: string | null;
}

// Figma Home blog rows (Casino Guides Winning Strategies, How to Play,
// Latest Casino News): heading + short intro, See All and prev/next arrows,
// then a swipeable row of cards (cover image, title, excerpt, More Info).
// mode "manual" shows the guides/articles picked in the editor, in that
// order; "latest" shows the newest published ones.
export default async function ContentCarouselSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const intro = field(section.fields, 0, "intro")?.textValue ?? "";
  const sourceType = field(section.fields, 0, "sourceType")?.textValue || "guides";
  const mode = field(section.fields, 0, "mode")?.textValue || "manual";
  const limit = Number(field(section.fields, 0, "limit")?.textValue) || 4;
  const seeAllUrl = field(section.fields, 0, "seeAllUrl")?.textValue ?? "";
  const manualSlugs = itemIndexes(section.fields)
    .map((itemIndex) => field(section.fields, itemIndex, "slug")?.textValue)
    .filter((slug): slug is string => Boolean(slug));

  const cards = await loadCards(sourceType, mode, limit, manualSlugs);
  if (cards.length === 0) return null;

  const { hasBleedBg, style: bgStyle } = sectionBgStyle(section.fields);

  return (
    <section
      id={section.customId || undefined}
      className={sectionClassName(hasBleedBg ? "section--content-carousel section--bg" : "section--content-carousel", section)}
      style={bgStyle as CSSProperties}
    >
      <div className="section-container relative z-10 py-[3.125rem]">
        <div className="section-row">
          <div className="section-col">
            <HorizontalSlider
              label={heading || "Articles"}
              showArrows={cards.length > 1}
              header={
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    {heading && <h2 className="section-heading text-2xl font-bold text-primary-900">{heading}</h2>}
                    {intro && <p className="text-sm whitespace-pre-line text-primary-600">{intro}</p>}
                  </div>
                  {seeAllUrl && (
                    <Link href={seeAllUrl} className="cursor-pointer text-sm text-primary-600 hover:text-primary-900 hover:underline">
                      See All
                    </Link>
                  )}
                </div>
              }
            >
              {cards.map((card) => (
                <Link
                  key={card.slug}
                  href={card.href}
                  className="content-carousel-card group flex w-[78%] shrink-0 cursor-pointer snap-start flex-col overflow-hidden rounded-lg bg-surface sm:w-[310px]"
                >
                  {card.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img loading="lazy" decoding="async" src={card.cover} alt="" className="aspect-[31/22] w-full rounded-lg object-cover" />
                  ) : (
                    <CoverPlaceholder />
                  )}
                  <div className="flex flex-1 flex-col gap-1.5 pt-3">
                    <h3 className="text-base font-bold text-primary-900 group-hover:text-primary-700">{card.title}</h3>
                    <p className="line-clamp-2 text-sm text-primary-600">{card.excerpt}</p>
                    <span className="mt-auto pt-1 text-sm text-primary-500 group-hover:underline">More Info</span>
                  </div>
                </Link>
              ))}
            </HorizontalSlider>
          </div>
        </div>
      </div>
    </section>
  );
}

async function loadCards(sourceType: string, mode: string, limit: number, manualSlugs: string[]): Promise<CarouselCard[]> {
  const items =
    sourceType === "news"
      ? (await getNewsArticles()).map((a) => ({ slug: a.slug, title: a.title, excerpt: a.excerpt, cover: a.coverUrl, href: `/news/${a.slug}` }))
      : (await getGuides()).map((g) => ({ slug: g.slug, title: g.title, excerpt: g.excerpt, cover: g.coverUrl, href: `/guides/${g.slug}` }));
  const picked =
    mode === "manual" ? manualSlugs.map((slug) => items.find((item) => item.slug === slug)).filter((item) => item !== undefined) : items;
  return picked.slice(0, limit).map((item) => ({ ...item, cover: mediaUrl(item.cover) }));
}

function CoverPlaceholder() {
  return (
    <div className="flex aspect-[31/22] w-full items-center justify-center rounded-lg bg-gradient-to-br from-primary-100 to-primary-50" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10 text-primary-300">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
        />
      </svg>
    </div>
  );
}

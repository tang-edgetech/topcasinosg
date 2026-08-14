import Link from "next/link";
import { field, itemIndexes, sectionClassName, type PageSection } from "@/lib/pages";
import { getGuides } from "@/app/[region]/_lib/api";
import { getNewsArticles } from "@/app/news/_lib/api";

interface CarouselCard {
  slug: string;
  title: string;
  excerpt: string;
  href: string;
}

// Reusable across all 3 Homepage carousels (Guides Winning Strategies, How
// to Play, Latest Casino News) — see BlockFields.tsx's ContentCarouselFields
// for why Guides is always manually curated by slug while News also
// supports "latest" auto mode. Neither GuideDTO nor NewsArticleDTO resolves
// a cover image URL (no media join, see web/src/app/guides/page.tsx), so
// cards use the same placeholder block those pages already use instead of
// fabricating an image.
export default async function ContentCarouselSection({ section }: { section: PageSection }) {
  const heading = field(section.fields, 0, "heading")?.textValue ?? "";
  const sourceType = field(section.fields, 0, "sourceType")?.textValue || "guides";
  const mode = field(section.fields, 0, "mode")?.textValue || "manual";
  const limit = Number(field(section.fields, 0, "limit")?.textValue) || 4;
  const seeAllUrl = field(section.fields, 0, "seeAllUrl")?.textValue ?? "";
  const manualSlugs = itemIndexes(section.fields)
    .map((itemIndex) => field(section.fields, itemIndex, "slug")?.textValue)
    .filter((slug): slug is string => Boolean(slug));

  const cards = await loadCards(sourceType, mode, limit, manualSlugs);
  if (cards.length === 0) return null;

  return (
    <section id={section.customId || undefined} className={sectionClassName("section--content-carousel", section)}>
      <div className="section-container flex flex-col gap-6 py-16">
        <div className="section-row flex items-center justify-between">
          {heading && <h2 className="section-heading text-2xl font-bold text-primary-900">{heading}</h2>}
          {seeAllUrl && (
            <Link href={seeAllUrl} className="cursor-pointer text-sm font-semibold text-secondary-600 hover:underline">
              See All &rarr;
            </Link>
          )}
        </div>
        <div className="section-row grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.slug}
              href={card.href}
              className="content-carousel-card group flex cursor-pointer flex-col overflow-hidden rounded-lg border border-primary-100 bg-surface shadow-sm transition-shadow hover:shadow-md"
            >
              <CoverPlaceholder />
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="text-base font-semibold text-primary-900 group-hover:text-primary-700">{card.title}</h3>
                <p className="line-clamp-3 text-sm text-primary-600">{card.excerpt}</p>
                <span className="mt-auto pt-2 text-sm font-semibold text-secondary-700 group-hover:underline">
                  More Info &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

async function loadCards(sourceType: string, mode: string, limit: number, manualSlugs: string[]): Promise<CarouselCard[]> {
  if (sourceType === "news") {
    const articles = await getNewsArticles();
    const picked =
      mode === "manual"
        ? manualSlugs.map((slug) => articles.find((a) => a.slug === slug)).filter((a): a is NonNullable<typeof a> => Boolean(a))
        : articles.slice(0, limit);
    return picked.slice(0, limit).map((a) => ({ slug: a.slug, title: a.title, excerpt: a.excerpt, href: `/news/${a.slug}` }));
  }

  const guides = await getGuides();
  const picked =
    mode === "manual"
      ? manualSlugs.map((slug) => guides.find((g) => g.slug === slug)).filter((g): g is NonNullable<typeof g> => Boolean(g))
      : guides.slice(0, limit);
  return picked.slice(0, limit).map((g) => ({ slug: g.slug, title: g.title, excerpt: g.excerpt, href: `/guides/${g.slug}` }));
}

function CoverPlaceholder() {
  return (
    <div className="flex h-36 w-full items-center justify-center rounded-t-lg bg-gradient-to-br from-primary-100 to-primary-50" aria-hidden="true">
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

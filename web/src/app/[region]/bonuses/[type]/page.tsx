import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPage } from "@/lib/pages";
import SectionRenderer from "@/components/sections/SectionRenderer";
import RawHtmlBlock from "@/components/RawHtmlBlock";

/**
 * /{region}/bonuses/{type} — per-bonus-type landing page (Welcome, No
 * Deposit, Free Spins, Deposit, Cashback, Loyalty). Pages-CMS-driven, and
 * genuinely nested in the Pages tree (not a computed flat slug): a real
 * "bonuses" hub page sits as a child of each region root page (e.g. "th"),
 * and each type page is a child of that hub - so the URL
 * /th/bonuses/welcome and the admin Pages tree /th -> bonuses -> welcome
 * actually match, and the hub/type pages show up as real rows an admin can
 * manage (rename, reorder, delete) like any other nested page. See
 * api/internal/db/migrations/0032_nest_bonus_type_pages.sql for the
 * one-time migration that moved the old flat "{region}-bonuses-{type}"
 * pages into this shape.
 */

const VALID_TYPES = ["welcome", "no_deposit", "free_spins", "deposit", "cashback", "loyalty_vip"] as const;
type BonusTypeParam = (typeof VALID_TYPES)[number];

function isValidType(type: string): type is BonusTypeParam {
  return (VALID_TYPES as readonly string[]).includes(type);
}

interface PageParams {
  region: string;
  type: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { region, type } = await params;
  if (!isValidType(type)) return {};

  const result = await getPage(`${region}/bonuses/${type}`);
  if (!result) return {};

  const { page } = result;
  return {
    title: page.metaTitle || page.title || undefined,
    description: page.metaDescription || undefined,
  };
}

export default async function RegionBonusTypePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { region, type } = await params;
  if (!isValidType(type)) {
    notFound();
  }

  const result = await getPage(`${region}/bonuses/${type}`);

  return (
    <div id="region-bonus-type-page" className="region-bonus-type-page flex flex-1 flex-col">
      {result && <RawHtmlBlock html={`${result.page.headSnippet}${result.page.bodySnippet}`} />}
      {result && result.sections.length > 0 ? (
        <SectionRenderer sections={result.sections} />
      ) : (
        <p className="mx-auto max-w-2xl px-6 py-24 text-center text-primary-500">
          This bonus page hasn&apos;t been set up yet — add sections from the admin dashboard&apos;s Pages
          builder.
        </p>
      )}
      {result && <RawHtmlBlock html={result.page.footerSnippet} />}
    </div>
  );
}

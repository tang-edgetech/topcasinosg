import type { Metadata } from "next";
import RegionCmsPage, { regionCmsMetadata } from "../_lib/RegionCmsPage";

/**
 * /{region}/bonuses — the bonuses hub (Figma "D / Country / TH / Bonuses"):
 * types grid, Top Bonus Picks, the six typed bonus tables, How to Claim,
 * Bonuses to Avoid, calculator and FAQs. Shared by every region through
 * region-template/bonuses (see _lib/RegionCmsPage.tsx). The region page row
 * stays the parent of the per-type pages (/{region}/bonuses/welcome, ...).
 */

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const { region } = await params;
  return regionCmsMetadata(region, "bonuses");
}

export default async function RegionBonusesPage({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  return <RegionCmsPage region={region} subPath="bonuses" menu="bonuses" id="region-bonuses-page" />;
}

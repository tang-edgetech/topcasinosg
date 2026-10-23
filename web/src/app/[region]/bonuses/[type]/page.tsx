import { notFound } from "next/navigation";
import type { Metadata } from "next";
import RegionCmsPage, { regionCmsMetadata } from "../../_lib/RegionCmsPage";

/**
 * /{region}/bonuses/{type} — per-bonus-type page (Figma "D / Country / TH /
 * Bonuses - No Deposit" and siblings). Shared by every region through
 * region-template/bonuses/{type}; a region's own {region}/bonuses/{type}
 * page overrides it once it has sections (see _lib/RegionCmsPage.tsx).
 */

const VALID_TYPES = ["welcome", "no_deposit", "free_spins", "deposit", "cashback", "loyalty_vip"] as const;

function isValidType(type: string): boolean {
  return (VALID_TYPES as readonly string[]).includes(type);
}

interface PageParams {
  region: string;
  type: string;
}

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  const { region, type } = await params;
  return isValidType(type) ? regionCmsMetadata(region, `bonuses/${type}`) : {};
}

export default async function RegionBonusTypePage({ params }: { params: Promise<PageParams> }) {
  const { region, type } = await params;
  if (!isValidType(type)) notFound();
  return <RegionCmsPage region={region} subPath={`bonuses/${type}`} menu="bonuses" id="region-bonus-type-page" />;
}

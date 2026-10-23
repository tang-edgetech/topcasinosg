import type { Metadata } from "next";
import RegionCmsPage, { regionCmsMetadata } from "../_lib/RegionCmsPage";

/**
 * /{region}/reviews (Figma "D / Country / TH / Reviews"): Top-Rated cards,
 * casino list, blacklist slider, game finder, FAQ and closing links. Shared
 * by every region through region-template/reviews (see
 * _lib/RegionCmsPage.tsx).
 */

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const { region } = await params;
  return regionCmsMetadata(region, "reviews");
}

export default async function RegionReviewsPage({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  return <RegionCmsPage region={region} subPath="reviews" menu="reviews" id="region-reviews-page" />;
}

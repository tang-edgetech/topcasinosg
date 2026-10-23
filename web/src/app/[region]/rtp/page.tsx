import type { Metadata } from "next";
import RegionCmsPage, { regionCmsMetadata } from "../_lib/RegionCmsPage";

/**
 * /{region}/rtp — RTP & Live Bonus (Figma "D / Country / TH / RTP"): the RTP
 * sliders read RTP Entries, plus the bonus table, panels and FAQ. Shared by
 * every region through region-template/rtp (see _lib/RegionCmsPage.tsx).
 */

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const { region } = await params;
  return regionCmsMetadata(region, "rtp");
}

export default async function RegionRtpPage({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  return <RegionCmsPage region={region} subPath="rtp" menu="rtp" id="region-rtp-page" />;
}

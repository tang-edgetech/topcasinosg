import type { IntroductionPageMenuItem } from "@/components/IntroductionSection";

export type PageKey = "overview" | "reviews" | "bonuses" | "payment-methods" | "rtp" | "guides" | "blacklist";

// Canonical page-menu order (Figma's "Thailand 2025, Bonuses, Payment
// Methods, RTP & Live Bonus, How to Play, Reviews" list) - fixed on
// every region page so items never jump around; the current page is only
// highlighted (rendered as the active tab by IntroductionSection). Blacklist
// isn't part of the Figma page-menu list itself, so it sits last.
const ITEMS: Record<PageKey, (region: string, regionLabel: string) => IntroductionPageMenuItem> = {
  overview: (region, regionLabel) => ({ label: regionLabel, url: `/${region}` }),
  bonuses: (region) => ({ label: "Bonuses", url: `/${region}/bonuses` }),
  "payment-methods": (region) => ({ label: "Payment Methods", url: `/${region}/payment-methods` }),
  rtp: (region) => ({ label: "RTP & Live Bonus", url: `/${region}/rtp` }),
  guides: (region) => ({ label: "How to Play", url: `/${region}/guides` }),
  reviews: (region) => ({ label: "Reviews", url: `/${region}/reviews` }),
  blacklist: (region) => ({ label: "Blacklist", url: `/${region}/blacklist` }),
};

const ORDER: PageKey[] = ["overview", "bonuses", "payment-methods", "rtp", "guides", "reviews", "blacklist"];

// The region-home tab reads e.g. "Thailand 2026" — the year follows the
// calendar so the menu never goes stale.
export function regionMenuLabel(regionName: string): string {
  return `${regionName} ${new Date().getFullYear()}`;
}

export function buildPageMenu(region: string, regionLabel: string, current: PageKey): IntroductionPageMenuItem[] {
  return ORDER.map((key) => ({ ...ITEMS[key](region, regionLabel), active: key === current }));
}

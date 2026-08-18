import type { IntroductionPageMenuItem } from "@/components/IntroductionSection";

type PageKey = "overview" | "reviews" | "bonuses" | "payment-methods" | "rtp" | "guides" | "blacklist";

// Canonical page-menu order (Figma's "Thailand 2025, Bonuses, Payment
// Methods, RTP & Live Bonus, How to Play, Reviews" list) - the current
// page's own item always moves to the front (rendered as the active tab
// by IntroductionSection), the rest keep this relative order. Blacklist
// isn't part of the Figma page-menu list itself, but slots in at the end
// for pages where it's the current one.
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

export function buildPageMenu(region: string, regionLabel: string, current: PageKey): IntroductionPageMenuItem[] {
  const ordered = [current, ...ORDER.filter((k) => k !== current)];
  return ordered.map((key) => ITEMS[key](region, regionLabel));
}

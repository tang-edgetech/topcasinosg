const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

// Settings can change at any moment from the admin dashboard — keep this
// short, matching every other content fetcher in web/. Next dedupes this
// fetch, so the layout, header and footer can all call getSiteSettings()
// within one request without extra round-trips.
const REVALIDATE_SECONDS = 60;

export interface SiteSettings {
  siteUrl: string;
  seoIndex: boolean;
  seoFollow: boolean;
  faviconUrl: string | null;
  siteTitle: string;
  logoUrl: string | null;
  footerDescription: string;
  contactAddress: string;
  contactEmail: string;
  facebookUrl: string;
  skypeUrl: string;
  ogImageUrl: string | null;
  twitterHandle: string;
  footer: FooterConfig;
}

// The footer's arrangement, bottom bar and badges, edited on the admin
// Footer page. Mirrors domain.FooterConfig in api/internal/domain/site_settings.go.
export interface FooterConfig {
  layout: {
    brandPosition: "left" | "right";
    showLinks: boolean;
    showBrand: boolean;
    showBadges: boolean;
    showCopyright: boolean;
  };
  certifiedByLabel: string;
  // "{year}" is replaced with the current year.
  copyright: string;
  poweredBy: string;
  badges: { name: string; imageUrl: string; linkUrl: string }[];
}

// The footer as it was before it became editable — used when the API is
// unreachable. Keep in step with domain.DefaultFooterConfig.
export const DEFAULT_FOOTER: FooterConfig = {
  layout: { brandPosition: "right", showLinks: true, showBrand: true, showBadges: true, showCopyright: true },
  certifiedByLabel: "topcasinosg.com.sg is certified by:",
  copyright: "Copyright © {year} topcasinosg.com.sg",
  poweredBy: "Powered by topcasinosg.com.sg",
  badges: [
    { name: "TRUSTe Certified Privacy", imageUrl: "/certifications/truste.webp", linkUrl: "" },
    { name: "DMCA Protected", imageUrl: "/certifications/dmca.webp", linkUrl: "" },
    { name: "Norton Secured", imageUrl: "/certifications/norton.webp", linkUrl: "" },
    { name: "Sucuri Security", imageUrl: "/certifications/sucuri.webp", linkUrl: "" },
    { name: "Cloudflare", imageUrl: "/certifications/cloudflare.webp", linkUrl: "" },
  ],
};

// Fails "open" (index/follow both true) rather than closed — if the API is
// briefly unreachable, we'd rather the live site stay indexable than have a
// transient outage silently deindex it from search engines.
const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteUrl: "",
  seoIndex: true,
  seoFollow: true,
  faviconUrl: null,
  siteTitle: "Top Casino SG",
  logoUrl: null,
  footerDescription: "",
  contactAddress: "",
  contactEmail: "",
  facebookUrl: "",
  skypeUrl: "",
  ogImageUrl: null,
  twitterHandle: "",
  footer: DEFAULT_FOOTER,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${API_URL}/api/admin/settings/site`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return DEFAULT_SITE_SETTINGS;
    const body = (await res.json()) as { data?: Partial<SiteSettings> };
    const data = body.data ?? {};
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...data,
      siteTitle: data.siteTitle || DEFAULT_SITE_SETTINGS.siteTitle,
      logoUrl: data.logoUrl || null,
      ogImageUrl: data.ogImageUrl || null,
      footer: data.footer ?? DEFAULT_FOOTER,
    };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

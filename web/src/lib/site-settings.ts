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
}

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
    };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

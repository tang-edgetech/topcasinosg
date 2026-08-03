const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

// Settings can change at any moment from the admin dashboard — keep this
// short, matching every other content fetcher in web/.
const REVALIDATE_SECONDS = 60;

export interface SiteSettings {
  seoIndex: boolean;
  seoFollow: boolean;
  faviconUrl: string | null;
}

// Fails "open" (index/follow both true) rather than closed — if the API is
// briefly unreachable, we'd rather the live site stay indexable than have a
// transient outage silently deindex it from search engines.
const DEFAULT_SITE_SETTINGS: SiteSettings = { seoIndex: true, seoFollow: true, faviconUrl: null };

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await fetch(`${API_URL}/api/admin/settings/site`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return DEFAULT_SITE_SETTINGS;
    const body = (await res.json()) as { data?: Partial<SiteSettings> };
    return { ...DEFAULT_SITE_SETTINGS, ...body.data };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

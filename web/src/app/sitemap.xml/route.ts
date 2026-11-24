import { API_BASE_URL } from "@/lib/api-url";
import { getSiteSettings } from "@/lib/site-settings";
import { siteBaseUrl } from "@/lib/seo";

// /sitemap.xml, built from the back office each time it's asked for (no
// file to upload): every published page and item that Settings > Sitemap
// and each item's SEO tab leave in. Switched off there (or the whole site
// set to noindex): "not found". The API sends paths ("/casinos/77w"), or a
// full address for Settings > Sitemap's extra addresses.
export const dynamic = "force-dynamic";

type SitemapResponse = { data?: { enabled?: boolean; urls?: { loc: string; lastmod: string | null }[] } };

function xmlEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export async function GET() {
  let body: SitemapResponse;
  try {
    const res = await fetch(`${API_BASE_URL}/api/sitemap`, { cache: "no-store" });
    if (!res.ok) return new Response("Sitemap unavailable", { status: 503 });
    body = (await res.json()) as SitemapResponse;
  } catch {
    return new Response("Sitemap unavailable", { status: 503 });
  }
  if (!body.data?.enabled) return new Response("Not found", { status: 404 });

  const base = siteBaseUrl(await getSiteSettings());
  const lines = (body.data.urls ?? []).map(({ loc, lastmod }) => {
    const url = /^https?:\/\//i.test(loc) ? loc : `${base}${loc}`;
    return `  <url><loc>${xmlEscape(url)}</loc>${lastmod ? `<lastmod>${xmlEscape(lastmod)}</lastmod>` : ""}</url>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lines.join("\n")}\n</urlset>\n`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
}

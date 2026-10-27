import type { Metadata } from "next";
import { headers } from "next/headers";
import { Figtree } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RawHtmlBlock from "@/components/RawHtmlBlock";
import ScrollToTop from "@/components/ScrollToTop";
import { getActiveSnippets } from "@/lib/snippets";
import { getSiteSettings } from "@/lib/site-settings";
import { assetUrl, buildMetadata, siteBaseUrl } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree-loaded",
  subsets: ["latin"],
});

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

const DEFAULT_TITLE = "Top Casino SG | Singapore's Trusted Online Casino Reviews";
const DEFAULT_DESCRIPTION = "Independent online casino reviews, ratings, and bonuses for Singapore players.";

function metadataBase(url: string): URL | undefined {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}

// The favicon and robots defaults are per-site settings the admin can change
// (see admin/dashboard/settings), so they have to be resolved at request time
// rather than baked into a static `export const metadata` — a static export
// can only ever point at build-time values. This robots default only takes
// effect for routes that don't set their own `robots` metadata (Next.js
// metadata merging replaces rather than deep-merges nested objects) — routes
// with per-item SEO fields (e.g. the Homepage, see app/page.tsx) combine this
// site-wide default with their own toggle instead of relying on this alone.
// The same goes for the canonical/Open Graph/X tags built here from the
// request path: every route gets them, and routes that know more about
// themselves (see lib/seo.ts buildMetadata) replace them.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const pathname = (await headers()).get("x-pathname") ?? "/";
  const robots = { index: settings.seoIndex, follow: settings.seoFollow };
  const defaults = await buildMetadata({ path: pathname, title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION });
  const base: Metadata = { ...defaults, metadataBase: metadataBase(siteBaseUrl(settings)), robots };

  if (!settings.faviconUrl) return base;

  const iconUrl = settings.faviconUrl.startsWith("http") ? settings.faviconUrl : `${API_URL}${settings.faviconUrl}`;
  return { ...base, icons: { icon: iconUrl } };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // proxy.ts stamps the real request pathname onto this header — App
  // Router doesn't hand a shared layout the current path any other way.
  // Reading headers() here opts the whole site out of static generation
  // (every route becomes a per-request dynamic render), which is the real
  // cost of Code snippets' URL/Page targeting working site-wide rather than
  // just on the Homepage.
  const pathname = (await headers()).get("x-pathname") ?? "/";
  const snippets = await getActiveSnippets(pathname);
  // "Head" can't be injected literally inside <head> in the App Router (see
  // RawHtmlBlock's doc comment) — it renders as the very first thing in
  // <body> instead, ahead of "Body" snippets.
  const topOfBody = [...snippets.head, ...snippets.body].join("\n");
  const bottomOfBody = snippets.footer.join("\n");
  const settings = await getSiteSettings();
  const siteUrl = siteBaseUrl(settings);
  const logo = assetUrl(settings.logoUrl);
  const sameAs = [settings.facebookUrl, settings.twitterHandle && `https://x.com/${settings.twitterHandle}`].filter(Boolean);

  return (
    <html lang="en" className={`${figtree.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col overflow-x-clip font-sans">
        <RawHtmlBlock html={topOfBody} />
        <JsonLd
          data={[
            { "@context": "https://schema.org", "@type": "WebSite", name: settings.siteTitle, url: `${siteUrl}/` },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: settings.siteTitle,
              url: `${siteUrl}/`,
              ...(logo ? { logo } : {}),
              ...(settings.contactEmail ? { email: settings.contactEmail } : {}),
              ...(sameAs.length > 0 ? { sameAs } : {}),
            },
          ]}
        />
        <Header />
        <main id="site-main" className="flex flex-1 flex-col">
          {children}
        </main>
        <Footer />
        <ScrollToTop />
        <RawHtmlBlock html={bottomOfBody} />
      </body>
    </html>
  );
}

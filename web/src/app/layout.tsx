import type { Metadata } from "next";
import { headers } from "next/headers";
import { Figtree } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RawHtmlBlock from "@/components/RawHtmlBlock";
import { getActiveSnippets } from "@/lib/snippets";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8090";

const DEFAULT_METADATA: Metadata = {
  title: "Top Casino SG | Singapore's Trusted Online Casino Reviews",
  description:
    "Independent online casino reviews, ratings, and bonuses for Singapore players.",
};

// The favicon is a per-site setting the admin can change (see
// admin/dashboard/settings), so it has to be resolved at request time rather
// than baked into a static `export const metadata` — a static export can
// only ever point at the build-time default favicon.ico.
export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/api/admin/settings/site`, { next: { revalidate: 60 } });
    if (!res.ok) return DEFAULT_METADATA;
    const body = (await res.json()) as { data?: { faviconUrl?: string | null } };
    const faviconUrl = body.data?.faviconUrl;
    if (!faviconUrl) return DEFAULT_METADATA;

    const iconUrl = faviconUrl.startsWith("http") ? faviconUrl : `${API_URL}${faviconUrl}`;
    return { ...DEFAULT_METADATA, icons: { icon: iconUrl } };
  } catch {
    return DEFAULT_METADATA;
  }
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

  return (
    <html lang="en" className={`${figtree.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <RawHtmlBlock html={topOfBody} />
        <Header />
        <main id="site-main" className="flex flex-1 flex-col">
          {children}
        </main>
        <Footer />
        <RawHtmlBlock html={bottomOfBody} />
      </body>
    </html>
  );
}

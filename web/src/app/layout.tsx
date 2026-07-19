import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${figtree.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        <main id="site-main" className="flex flex-1 flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

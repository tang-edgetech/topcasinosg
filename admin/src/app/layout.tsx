import "@ant-design/v5-patch-for-react-19";
import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import Script from "next/script";
import { themeInitScript, ThemeProvider } from "@/lib/theme-context";
import AntdThemeProvider from "@/components/AntdThemeProvider";
import { SiteSettingsProvider } from "@/lib/site-settings-context";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Top Casino SG — Backoffice",
  description: "Internal admin dashboard for Top Casino SG.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${figtree.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Runs before hydration so the stored theme applies with no flash. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-surface font-sans text-text dark:bg-surface-dark dark:text-text-dark">
        <ThemeProvider>
          <AntdThemeProvider>
            <SiteSettingsProvider>{children}</SiteSettingsProvider>
          </AntdThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

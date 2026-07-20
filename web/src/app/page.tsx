import type { Metadata } from "next";
import { getPage } from "@/lib/pages";
import SectionRenderer from "@/components/sections/SectionRenderer";
import RawHtmlBlock from "@/components/RawHtmlBlock";

export async function generateMetadata(): Promise<Metadata> {
  const result = await getPage("home");
  if (!result) return {};

  const { page } = result;
  return {
    title: page.metaTitle || undefined,
    description: page.metaDescription || undefined,
    robots: { index: page.robotsIndex, follow: page.robotsFollow },
  };
}

export default async function Home() {
  const result = await getPage("home");

  return (
    <div id="home-page" className="home-page flex flex-1 flex-col">
      {result && <RawHtmlBlock html={`${result.page.headSnippet}${result.page.bodySnippet}`} />}
      {result && result.sections.length > 0 ? (
        <SectionRenderer sections={result.sections} />
      ) : (
        <p className="mx-auto max-w-2xl px-6 py-24 text-center text-primary-500">
          Homepage content hasn&apos;t been set up yet — add sections from the admin dashboard&apos;s Pages
          builder.
        </p>
      )}
      {result && <RawHtmlBlock html={result.page.footerSnippet} />}
    </div>
  );
}

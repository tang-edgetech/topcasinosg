import type { Metadata } from "next";
import { getPage } from "@/lib/pages";
import SectionRenderer from "@/components/sections/SectionRenderer";
import RawHtmlBlock from "@/components/RawHtmlBlock";

/**
 * /calculator — standalone Bonus Calculator page. Same Pages-CMS-driven
 * pattern as the Homepage (see app/page.tsx) — content lives entirely in
 * the admin Page Builder under slug "calculator", not hardcoded here.
 */
export async function generateMetadata(): Promise<Metadata> {
  const result = await getPage("calculator");
  if (!result) return {};

  const { page } = result;
  return {
    title: page.metaTitle || undefined,
    description: page.metaDescription || undefined,
  };
}

export default async function CalculatorPage() {
  const result = await getPage("calculator");

  return (
    <div id="calculator-page" className="calculator-page flex flex-1 flex-col">
      {result && <RawHtmlBlock html={`${result.page.headSnippet}${result.page.bodySnippet}`} />}
      {result && result.sections.length > 0 ? (
        <SectionRenderer sections={result.sections} />
      ) : (
        <p className="mx-auto max-w-2xl px-6 py-24 text-center text-primary-500">
          Calculator content hasn&apos;t been set up yet — add sections from the admin dashboard&apos;s Pages
          builder.
        </p>
      )}
      {result && <RawHtmlBlock html={result.page.footerSnippet} />}
    </div>
  );
}

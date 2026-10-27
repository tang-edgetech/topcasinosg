import type { Metadata } from "next";
import { getPagePreview } from "@/lib/pages";
import SectionRenderer from "@/components/sections/SectionRenderer";
import IntroductionSectionBlock from "@/components/sections/IntroductionSectionBlock";
import PageGrid from "@/components/PageGrid";
import PreviewScrollKeeper from "./PreviewScrollKeeper";

/**
 * Live preview of the backoffice page editor's unsaved sections. The editor
 * stores them under a random one-hour token (POST /api/admin/pages/{id}/
 * preview) and shows this route in an iframe, refreshing it as the editor
 * types; the scroll position survives each refresh. Laid out like the real
 * page: Home full width, every other page in the page grid with its intro.
 * Never indexed or cached.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false, follow: false },
};

export default async function PreviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await getPagePreview(token);

  if (!result) {
    return (
      <p id="preview-expired" className="mx-auto max-w-2xl px-6 py-24 text-center text-primary-500">
        This preview has expired. Refresh the preview in the page editor to see your latest changes.
      </p>
    );
  }

  const ordered = result.sections.slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const [first, ...rest] = ordered;
  const hasIntro = first?.blockType === "introduction_section";
  const isHome = result.page.slug === "home";

  return (
    <div id="preview-page" className="preview-page flex flex-1 flex-col">
      <PreviewScrollKeeper />
      {ordered.length === 0 ? (
        <p className="mx-auto max-w-2xl px-6 py-24 text-center text-primary-500">This page has no sections yet.</p>
      ) : isHome ? (
        <SectionRenderer sections={ordered} />
      ) : (
        <PageGrid>
          {hasIntro && <IntroductionSectionBlock section={first} />}
          <SectionRenderer sections={hasIntro ? rest : ordered} />
        </PageGrid>
      )}
    </div>
  );
}

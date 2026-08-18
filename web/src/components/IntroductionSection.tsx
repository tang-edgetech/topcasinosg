import { sanitizeRichText } from "@/lib/sanitize-html";

export interface IntroductionPageMenuItem {
  label: string;
  url: string;
}

export interface IntroductionSectionProps {
  heading: string;
  highlightText?: string;
  subheading?: string;
  paragraph?: string;
  theme?: "blue" | "red";
  pageMenu?: IntroductionPageMenuItem[];
}

// Figma "Introduction Section" — the first section on every non-Home page.
// Full-bleed gradient band (see the two theme variants below) containing a
// heading with one highlighted substring, a subheading, a paragraph, and an
// optional page-menu link list (first item renders as the active tab, per
// the "Thailand 2025" example in the TH Home design). Used both by the
// introduction_section Pages-CMS block (IntroductionSectionSection.tsx) and
// directly by bespoke routes that aren't Pages-CMS driven.
export default function IntroductionSection({
  heading,
  highlightText,
  subheading,
  paragraph,
  theme = "blue",
  pageMenu = [],
}: IntroductionSectionProps) {
  const headingParts = highlightText && heading.includes(highlightText) ? heading.split(highlightText) : null;

  return (
    <section
      id="introduction-section"
      className={
        (theme === "red"
          ? "introduction-section bg-gradient-to-b from-primary-900 via-danger to-danger/70 "
          : "introduction-section bg-gradient-to-b from-primary-900 to-primary-glow ") +
        // Full-bleed breakout: this section renders nested inside
        // PageWithSidebar's max-w-[1300px] column, but the colored band
        // itself should span the full viewport width.
        "relative left-1/2 right-1/2 w-screen -translate-x-1/2"
      }
    >
      <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-6 px-6 py-14 md:flex-row md:items-start md:justify-between 2xl:max-w-[1920px]">
        <div className="flex max-w-2xl flex-col gap-2">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {headingParts ? (
              <>
                {headingParts[0]}
                <span className="text-secondary-500">{highlightText}</span>
                {headingParts[1]}
              </>
            ) : (
              heading
            )}
          </h1>
          {subheading && <h2 className="text-xl font-semibold text-white">{subheading}</h2>}
          {paragraph && (
            <div
              className="rich-text-content mt-1 text-sm leading-relaxed text-white/80"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(paragraph) }}
            />
          )}
        </div>

        {pageMenu.length > 0 && (
          <nav aria-label="Page menu" className="flex w-full shrink-0 flex-col gap-2 border-t border-white/20 pt-4 md:w-48 md:border-t-0 md:border-l md:pt-0 md:pl-6">
            {pageMenu.map((item, i) => (
              <a
                key={item.url}
                href={item.url}
                className={
                  i === 0
                    ? "cursor-pointer text-sm font-semibold text-secondary-500"
                    : "cursor-pointer text-sm text-white/80 hover:text-white hover:underline"
                }
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}

import type { CSSProperties } from "react";
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
  bgFrom?: string;
  bgTo?: string;
  pageMenu?: IntroductionPageMenuItem[];
}

// Figma "Introduction Section" — the first section on every non-Home page.
// Rendered as the first child of PageGrid's `.primary` column (see
// PageGrid.tsx), which is narrower than the viewport (it shares `.main`
// with the Sidebar) — so the gradient is applied as `--section-bg-from`/
// `--section-bg-to` custom properties (not a hardcoded "theme" mapped to
// fixed classes), consumed by `.section--bg`'s `::before`
// (shared/theme/sections.css), which is the piece that actually bleeds
// edge-to-edge. `bgFrom`/`bgTo` are raw CSS color values (see
// IntroductionSectionBlock.tsx, which resolves admin-picked color tokens via
// web/src/lib/pages.ts's sectionBgColorValue before passing them in) —
// this component just renders whatever it's given, falling back to
// `.section--bg::before`'s own default gradient if neither is set. The
// section element itself stays transparent. The Sidebar starting flush with
// this section's top is just ordinary flex-sibling alignment (`.main`'s
// `align-items: flex-start`), independent of this section's own layout.
//
// The inner content is its own container/row/col hierarchy
// (`.body-container` > `.intro-row` > `.intro-col`(s), see sections.css) -
// a plain flexbox split, so the heading/paragraph column flexes to fill the
// space next to the page-menu's fixed 280px column. `relative z-10` keeps
// this content painting above the section's own `::before` background
// (z-index: 0).
export default function IntroductionSection({
  heading,
  highlightText,
  subheading,
  paragraph,
  bgFrom,
  bgTo,
  pageMenu = [],
}: IntroductionSectionProps) {
  const headingParts = highlightText && heading.includes(highlightText) ? heading.split(highlightText) : null;

  const bgStyle = {
    ...(bgFrom ? { "--section-bg-from": bgFrom } : {}),
    ...(bgTo ? { "--section-bg-to": bgTo } : {}),
  } as CSSProperties;

  return (
    <section id="introduction-section" className="section section--bg" style={bgStyle}>
      <div className="body-container relative z-10 py-14">
        <div className="intro-row">
          <div className="intro-col flex flex-col items-start justify-start gap-2">
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
            <nav
              aria-label="Page menu"
              className="intro-col--menu mt-6 flex flex-col gap-2 border-t border-white/20 pt-4 min-[1200px]:mt-0 min-[1200px]:border-t-0 min-[1200px]:border-l min-[1200px]:pt-0 min-[1200px]:pl-6"
            >
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
      </div>
    </section>
  );
}

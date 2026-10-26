import { field, sectionClassName, type PageSection } from "@/lib/pages";

const HEIGHTS: Record<string, string> = { xs: "16px", s: "25px", m: "50px", l: "80px", xl: "120px" };

// Empty space of a preset height, optionally with a thin divider line across
// the middle (white-ish inside a Container with white text).
export default function SpacerSection({ section }: { section: PageSection }) {
  const size = field(section.fields, 0, "size")?.textValue ?? "m";
  const divider = field(section.fields, 0, "divider")?.textValue === "yes";

  return (
    <div id={section.customId || undefined} aria-hidden="true" className={sectionClassName("section--spacer", section)}>
      <div className="section-container flex items-center" style={{ height: HEIGHTS[size] ?? HEIGHTS.m }}>
        {divider && <hr className="tone-line w-full border-0 border-t" />}
      </div>
    </div>
  );
}

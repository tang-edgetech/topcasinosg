import { field, getGlobalSections, type PageSection } from "@/lib/pages";
import SectionRenderer from "./SectionRenderer";

// A global section placed on a page: its own sections (edited once under
// Global Sections in the backoffice) render here in place. A global section
// never places another one, so nothing nests further. The block's own CSS
// classes (width in a grid, hide on mobile/tablet/desktop) carry over to
// the global section's top-level sections, since there is no wrapper.
export default async function GlobalSectionBlock({ section, regionCode }: { section: PageSection; regionCode?: string }) {
  const id = Number(field(section.fields, 0, "globalId")?.textValue);
  if (!Number.isInteger(id) || id <= 0) return null;

  const sections = await getGlobalSections(id);
  if (!sections || sections.length === 0) return null;

  const placed = section.customClass
    ? sections.map((s) => (s.inContainer ? s : { ...s, customClass: [s.customClass, section.customClass].filter(Boolean).join(" ") }))
    : sections;

  // Placed inside a Container, the global section's own sections are nested too.
  const nested = section.nested ? placed.map((s) => ({ ...s, nested: true })) : placed;

  return <SectionRenderer sections={nested} regionCode={regionCode} insideGlobal />;
}

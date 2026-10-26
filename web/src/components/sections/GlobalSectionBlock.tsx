import { field, getGlobalSections, type PageSection } from "@/lib/pages";
import SectionRenderer from "./SectionRenderer";

// A global section placed on a page: its own sections (edited once under
// Global Sections in the backoffice) render here in place. A global section
// never places another one, so nothing nests further.
export default async function GlobalSectionBlock({ section, regionCode }: { section: PageSection; regionCode?: string }) {
  const id = Number(field(section.fields, 0, "globalId")?.textValue);
  if (!Number.isInteger(id) || id <= 0) return null;

  const sections = await getGlobalSections(id);
  if (!sections || sections.length === 0) return null;

  return <SectionRenderer sections={sections} regionCode={regionCode} insideGlobal />;
}

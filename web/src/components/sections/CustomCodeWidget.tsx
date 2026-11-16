import { field, sectionClassName, type PageSection } from "@/lib/pages";
import CodeFrame from "./CodeFrame";
import SectionTag from "./SectionTag";

// Custom Code: a component written in the block itself as HTML, CSS and
// JavaScript ("html", "css", "js" fields; api/internal/handler/
// block_docs.go), run in an isolated frame (CodeFrame). For one made once
// and placed on many pages, see ComponentBlock.
export default function CustomCodeWidget({ section }: { section: PageSection }) {
  const text = (key: string) => field(section.fields, 0, key)?.textValue ?? "";
  const html = text("html");
  const js = text("js");
  if (!html.trim() && !js.trim()) return null;

  return (
    <SectionTag section={section} id={section.customId || undefined} className={sectionClassName("section--custom-code", section)}>
      <CodeFrame
        frameId={`custom-${section.id}`}
        className="section-container"
        html={html}
        css={text("css")}
        js={js}
        title={text("title") || "Interactive component"}
        fixedHeight={Number.parseInt(text("height"), 10) || null}
      />
    </SectionTag>
  );
}

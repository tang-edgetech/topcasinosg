import { field, getComponent, sectionClassName, type ComponentSetting, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import CodeFrame from "./CodeFrame";
import SectionTag from "./SectionTag";

// A Component from the backoffice's Components library placed on a page
// (blockType "component", field componentId). The component's code is
// written once; each placement fills in its settings (the block's other
// fields), which reach the code as {{key}} in its HTML and as
// window.settings.key in its JavaScript. Empty settings use the
// component's defaults. Runs in an isolated frame (CodeFrame).

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

// How a setting's value goes into the HTML: richtext as cleaned HTML, a
// textarea with its line breaks, everything else as plain text.
function htmlValue(setting: ComponentSetting, value: string): string {
  if (setting.type === "richtext") return sanitizeRichText(value);
  if (setting.type === "textarea") return escapeHtml(value).replace(/\r?\n/g, "<br>");
  return escapeHtml(value);
}

export default async function ComponentBlock({ section }: { section: PageSection }) {
  const id = Number(field(section.fields, 0, "componentId")?.textValue);
  if (!Number.isInteger(id) || id <= 0) return null;
  const component = await getComponent(id);
  if (!component) return null;

  const settings: Record<string, string> = {};
  const inHtml: Record<string, string> = {};
  for (const s of component.settings) {
    const placed = field(section.fields, 0, s.key)?.textValue ?? "";
    const value = placed.trim() === "" ? s.default : placed;
    settings[s.key] = s.type === "richtext" ? sanitizeRichText(value) : value;
    inHtml[s.key] = htmlValue(s, value);
  }
  // {{key}} (spaces allowed) for a known setting; anything else stays as written.
  const html = component.html.replace(/\{\{\s*([a-zA-Z][a-zA-Z0-9]*)\s*\}\}/g, (match, key: string) =>
    key in inHtml ? inHtml[key] : match,
  );

  return (
    <SectionTag
      section={section}
      id={section.customId || undefined}
      className={sectionClassName("section--component", section)}
      data-component={component.id}
    >
      <CodeFrame
        frameId={`component-${section.id}`}
        className="section-container"
        html={html}
        css={component.css}
        js={component.js}
        title={component.name}
        settings={settings}
      />
    </SectionTag>
  );
}

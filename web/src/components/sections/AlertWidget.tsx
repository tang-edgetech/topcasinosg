import { field, sectionClassName, type PageSection } from "@/lib/pages";
import { sanitizeRichText } from "@/lib/sanitize-html";
import { WIDGET_CONTAINER } from "@/lib/widgets";
import SectionTag from "./SectionTag";
import WidgetIcon from "./WidgetIcon";

const TYPES: Record<string, { box: string; icon: string; iconClass: string }> = {
  info: { box: "border-primary-glow bg-primary-50", icon: "info", iconClass: "text-primary-glow" },
  success: { box: "border-success bg-success-subtle", icon: "check-circle", iconClass: "text-success" },
  warning: { box: "border-secondary-600 bg-secondary-50", icon: "warning", iconClass: "text-secondary-800" },
  danger: { box: "border-danger bg-danger/10", icon: "warning", iconClass: "text-danger" },
};

// Alert widget: a coloured notice box (info, success, warning or danger)
// with an icon, a title and text, e.g. "Check the bonus terms first".
export default function AlertWidget({ section }: { section: PageSection }) {
  const text = (key: string) => field(section.fields, 0, key)?.textValue ?? "";
  const title = text("title");
  const body = text("body");
  if (!title && !body) return null;
  const type = TYPES[text("type")] ?? TYPES.info;

  return (
    <SectionTag section={section} id={section.customId || undefined} className={sectionClassName("section--alert", section)}>
      <div className={WIDGET_CONTAINER}>
        <div role="note" className={`widget-alert flex gap-3 rounded-lg border-l-4 p-4 ${type.box}`}>
          <WidgetIcon name={type.icon} className={`h-6 w-6 ${type.iconClass}`} />
          <div className="flex min-w-0 flex-col gap-1">
            {title && <strong className="text-base font-bold text-primary-900">{title}</strong>}
            {body && <div className="rich-text-content text-sm text-primary-700" dangerouslySetInnerHTML={{ __html: sanitizeRichText(body) }} />}
          </div>
        </div>
      </div>
    </SectionTag>
  );
}

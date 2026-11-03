import { WIDGET_ICONS } from "@/lib/widgetIcons";

// One built-in line icon (lib/widgetIcons.ts), in the current text colour.
// An unknown name draws nothing.
export default function WidgetIcon({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  const icon = WIDGET_ICONS[name];
  if (!icon) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`widget-icon shrink-0 ${className}`}
    >
      {icon.paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

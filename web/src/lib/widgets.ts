// Shared look options of the basic widgets (Heading, Text, Icon, Icon Box,
// Icon List, Divider, Card, Counter, Progress Bars, Alert, Table, Star
// Rating, Testimonial), as their admin editors store them
// (admin/src/app/dashboard/pages/BlockFields.tsx). Full class names, so
// Tailwind generates every option.

export const TEXT_ALIGN: Record<string, string> = { left: "text-left", center: "text-center", right: "text-right" };
export const ITEMS_ALIGN: Record<string, string> = { left: "items-start", center: "items-center", right: "items-end" };
export const JUSTIFY: Record<string, string> = { left: "justify-start", center: "justify-center", right: "justify-end" };

// Brand colours for icons, numbers and bars; "" follows the text colour
// around it (a Container's white text, or the Style tab's text colour).
export const WIDGET_COLOR: Record<string, string> = {
  primary: "text-primary-900",
  secondary: "text-secondary-600",
  blue: "text-primary-glow",
  muted: "text-primary-500",
  white: "text-white",
  success: "text-success",
  danger: "text-danger",
};

export const WIDGET_BG: Record<string, string> = {
  primary: "bg-primary-900",
  secondary: "bg-secondary-600",
  blue: "bg-primary-glow",
  success: "bg-success",
  danger: "bg-danger",
};

export const HEADING_SIZE: Record<string, string> = {
  s: "text-xl leading-7",
  m: "text-[26px] leading-[31px]",
  l: "text-[36px] leading-[43px]",
  xl: "text-[48px] leading-[56px]",
};

export const TEXT_SIZE: Record<string, string> = { s: "text-sm", m: "text-base", l: "text-lg" };

export const ICON_SIZE: Record<string, string> = { s: "h-6 w-6", m: "h-10 w-10", l: "h-14 w-14", xl: "h-20 w-20" };

// The root of every basic widget: a content container with no space of its
// own, so the Container's gap and the Style tab set the spacing.
export const WIDGET_CONTAINER = "section-container";

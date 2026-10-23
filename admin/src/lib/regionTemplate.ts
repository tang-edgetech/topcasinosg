// Mirrors web/src/app/[region]/_lib/regionPage.ts: the "region-template"
// root page holds one shared copy of each region page. A region page with no
// sections of its own shows the template's copy, with placeholders filled.
export const REGION_TEMPLATE_SLUG = "region-template";

export const REGION_PLACEHOLDERS: { token: string; meaning: string; example: string }[] = [
  { token: "{region}", meaning: "Region name", example: "Thailand" },
  { token: "{regionAdj}", meaning: "Adjective", example: "Thai" },
  { token: "{currency}", meaning: "Currency code", example: "THB" },
  { token: "{regionCode}", meaning: "Code, for links", example: "th" },
  { token: "{year}", meaning: "Current year", example: String(new Date().getFullYear()) },
];

export function isRegionTemplatePath(path: string): boolean {
  return path === REGION_TEMPLATE_SLUG || path.startsWith(`${REGION_TEMPLATE_SLUG}/`);
}

// "th/bonuses" -> "region-template/bonuses" when "th" is a region code.
export function templatePathFor(path: string, regionCodes: string[]): string | null {
  const [first, ...rest] = path.split("/");
  if (rest.length === 0 || !regionCodes.includes(first)) return null;
  return `${REGION_TEMPLATE_SLUG}/${rest.join("/")}`;
}

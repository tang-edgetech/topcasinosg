// The site-wide colour theme (admin Settings > Theme): colours that replace
// shared/theme/tokens.css's defaults. Tailwind v4 utilities read the tokens
// as CSS variables (--color-primary-500), so redefining them on :root
// recolours every class and section style that uses them. tokens.css's
// values sit in Tailwind's theme layer; this unlayered rule wins over them.
// Mirrors domain.ThemeConfig in api/internal/domain/site_theme.go.

export interface ThemeConfig {
  colors: Record<string, string>;
}

const TOKEN = /^[a-z0-9-]+$/;
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

// "" when nothing is changed. Anything that isn't a token name and a #hex
// colour is skipped, so a stored value can never break out of the rule.
export function themeCss(theme: ThemeConfig | null | undefined): string {
  const declarations = Object.entries(theme?.colors ?? {})
    .filter(([token, value]) => TOKEN.test(token) && HEX.test(value))
    .map(([token, value]) => `--color-${token}:${value}`);
  return declarations.length > 0 ? `:root{${declarations.join(";")}}` : "";
}

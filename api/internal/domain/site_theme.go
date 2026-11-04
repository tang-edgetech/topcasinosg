package domain

import "regexp"

// ThemeConfig is the site-wide colour theme (Settings > Theme): colours that
// replace the design tokens in shared/theme/tokens.css on the public site.
// Only changed colours are stored; a token left out keeps its default.
// Stored as JSON in site_settings.theme_config; the JSON names are also the
// API's.
type ThemeConfig struct {
	// Colors: token name (e.g. "primary-500") to a #hex colour.
	Colors map[string]string `json:"colors"`
}

// ThemeColor is one colour token the theme can change.
type ThemeColor struct {
	Token   string `json:"token"`
	Group   string `json:"group"`
	Label   string `json:"label"`
	Default string `json:"default"`
}

// ThemeColors are the colours the theme can change, with their defaults:
// keep in step with shared/theme/tokens.css. The site's lighter and darker
// shades, surfaces and text colours follow these.
var ThemeColors = []ThemeColor{
	{"primary-50", "Primary (brand)", "50 (lightest)", "#e7e9f4"},
	{"primary-100", "Primary (brand)", "100", "#c3c8e5"},
	{"primary-200", "Primary (brand)", "200", "#9da4d3"},
	{"primary-300", "Primary (brand)", "300", "#7781c1"},
	{"primary-400", "Primary (brand)", "400", "#5a65b4"},
	{"primary-500", "Primary (brand)", "500", "#3e4ba8"},
	{"primary-600", "Primary (brand)", "600", "#38439e"},
	{"primary-700", "Primary (brand)", "700", "#2f3a92"},
	{"primary-800", "Primary (brand)", "800", "#273086"},
	{"primary-900", "Primary (brand)", "900 (darkest: headings, header)", "#1a1e71"},
	{"primary-glow", "Primary (brand)", "Glow (gradient end)", "#3139d7"},
	{"secondary-50", "Secondary (accent, buttons)", "50 (lightest)", "#fdf8e1"},
	{"secondary-100", "Secondary (accent, buttons)", "100", "#fbedb4"},
	{"secondary-200", "Secondary (accent, buttons)", "200", "#fae183"},
	{"secondary-300", "Secondary (accent, buttons)", "300", "#f8d650"},
	{"secondary-400", "Secondary (accent, buttons)", "400", "#f7cc2a"},
	{"secondary-500", "Secondary (accent, buttons)", "500", "#f7c30b"},
	{"secondary-600", "Secondary (accent, buttons)", "600", "#f7b500"},
	{"secondary-700", "Secondary (accent, buttons)", "700", "#f7a300"},
	{"secondary-800", "Secondary (accent, buttons)", "800", "#f89200"},
	{"secondary-900", "Secondary (accent, buttons)", "900 (darkest)", "#f87300"},
	{"success", "Status", "Success", "#00bb9e"},
	{"success-subtle", "Status", "Success background", "#e6f9f6"},
	{"danger", "Status", "Danger", "#ff4553"},
	{"star", "Status", "Star rating", "#ffd54e"},
}

var themeHexRe = regexp.MustCompile(`^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$`)

// IsThemeColor: a #rgb, #rrggbb or #rrggbbaa colour.
func IsThemeColor(v string) bool { return themeHexRe.MatchString(v) }

// ThemeColorToken: whether the theme can change this token.
func ThemeColorToken(token string) bool {
	for _, c := range ThemeColors {
		if c.Token == token {
			return true
		}
	}
	return false
}

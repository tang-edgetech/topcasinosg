package handler

// blockDocs describes, for GET /api/v1/schema, what each block type is and
// the exact fields and values its renderer reads (web/src/components/
// sections/*), so an AI tool can build sections that aren't on the site yet.
// Keep in step with the admin editors (admin/src/app/dashboard/pages/
// BlockFields.tsx). Block types without an entry are described only by the
// field usage found on the site.

type fieldDoc struct {
	Key     string   `json:"key"`
	Type    string   `json:"type"`
	PerItem bool     `json:"perItem,omitempty"`
	Allowed []string `json:"allowed,omitempty"`
	About   string   `json:"about"`
}

type blockDoc struct {
	Kind   string // container, widget, data, classic, other
	About  string
	Fields []fieldDoc
}

var (
	alignLCR     = []string{"left", "center", "right"}
	widgetColors = []string{"primary", "secondary", "blue", "muted", "white", "success", "danger"}
	buttonStyles = []string{"primary", "secondary", "outline", "white"}
	bgTokens     = []string{"primary-900", "primary-glow", "secondary-600", "danger", "white", "surface-muted"}
	widgetIcons  = []string{"check", "check-circle", "x", "star", "shield", "shield-check", "lock", "bolt", "wallet", "card", "percent", "trophy", "award", "crown", "dice", "fire", "heart", "clock", "calendar", "globe", "mobile", "mail", "chat", "headset", "users", "chart", "search", "info", "warning", "question", "play", "arrow-right"}
)

func txt(key, about string, allowed ...string) fieldDoc {
	return fieldDoc{Key: key, Type: "text", Allowed: allowed, About: about}
}

func item(f fieldDoc) fieldDoc {
	f.PerItem = true
	return f
}

// displayFields: the layout choice the data widgets share (stored at
// sortOrder 90 and 91, like the admin). The first allowed value is the
// default look.
func displayFields(perRowDefault string, allowed ...string) []fieldDoc {
	return []fieldDoc{
		txt("display", "How the items are laid out. Empty means "+allowed[0]+".", allowed...),
		txt("perRow", "Items per row for the grid-style displays, 1-6 (default "+perRowDefault+").", "1", "2", "3", "4", "5", "6"),
	}
}

func dataBlock(about, perRowDefault string, allowed ...string) blockDoc {
	return blockDoc{Kind: "data", About: about + " Its items come from the site's own data; other fields are listed as used on the site.", Fields: displayFields(perRowDefault, allowed...)}
}

var classicAbout = "Classic fixed block: still renders, but new content should be built from a container with widgets instead."

var blockDocs = map[string]blockDoc{
	"container": {Kind: "container", About: "Holds and arranges the sections after it at the next depth. The only block (with global_section) allowed at depth 0.", Fields: []fieldDoc{
		txt("layout", "How the children are arranged. Empty means stack. Tabs and accordion use each child's \"panelTitle\" field as its title; carousel shows perView children at a time.", "stack", "row", "grid", "tabs", "accordion", "carousel"),
		txt("gap", "Space between children: a preset (s=16px, m=30px, l=50px), or px: \"24\", or \"24 40\" for between rows then between columns. Default 50 for stack/row, 30 for grid and panels."),
		txt("columns", "Grid columns on desktop (layout grid).", "2", "3", "4"),
		txt("columnsTablet", "Grid columns on tablet (default 2).", "1", "2", "3", "4"),
		txt("columnsMobile", "Grid columns on mobile (default 1).", "1", "2", "3", "4"),
		txt("perView", "Slides visible at once on desktop (layout carousel).", "1", "2", "3", "4"),
		txt("perViewTablet", "Slides visible on tablet (default 2).", "1", "2", "3", "4"),
		txt("perViewMobile", "Slides visible on mobile (default one and a peek of the next).", "1", "2", "3", "4"),
		txt("justify", "Main-axis placement (row, or stack).", "start", "center", "end", "between", "around"),
		txt("align", "Cross-axis alignment. Default stretch; in a stack, center makes children shrink to their content.", "start", "center", "end", "stretch"),
		txt("wrap", "Row only: \"no\" keeps everything on one line.", "no"),
		txt("stackOn", "Row only: below which screen size the row turns into a column (default mobile).", "mobile", "tablet", "never"),
		txt("tabsAlign", "Tabs only: where the tab buttons sit.", "start", "center"),
		txt("firstOpen", "Accordion only: \"no\" starts with every panel closed.", "no"),
		txt("componentSpacing", "Stack only: \"own\" drops the gap and lets each child's own spacing apply.", "own"),
		txt("spaceTop", "Padding above as a preset: none=0, s=25px, m=50px, l=80px. Default m at depth 0, none when nested. The stPadding style field overrides it.", "none", "s", "m", "l"),
		txt("spaceBottom", "Padding below, same values as spaceTop.", "none", "s", "m", "l"),
		txt("spaceSides", "Nested containers only: padding left and right.", "none", "s", "m", "l"),
		txt("contentWidth", "Max content width. Default 1270 at depth 0, full when nested.", "1270", "960", "768", "full"),
		txt("minHeight", "Minimum height (stack and row): a preset (s=200px, m=400px, l=600px, screen) or px like \"450\" or \"70vh\"."),
		txt("bgType", "Full-width background behind the container. gradient is linear.", "none", "color", "gradient", "radial", "image"),
		txt("bgFrom", "Background colour, or the gradient's first colour: a colour token or #hex (see styleFields).", bgTokens...),
		txt("bgTo", "The gradient's second colour.", bgTokens...),
		txt("bgAngle", "Linear gradient direction in degrees, 0-360 (default 180, downwards)."),
		{Key: "bgImage", Type: "image", About: "Background image (bgType image): a mediaId."},
		txt("bgSize", "Image size.", "cover", "contain", "auto"),
		txt("bgPosition", "Image position.", "center", "top", "bottom", "left", "right"),
		txt("bgOverlay", "A colour over the image, usually see-through: #rrggbbaa, e.g. #1a1e7199."),
		txt("textTone", "\"light\" makes text white, for dark backgrounds.", "light"),
	}},
	"global_section": {Kind: "other", About: "Includes a reusable global section (GET /api/v1/global-sections). Depth 0 only.", Fields: []fieldDoc{
		txt("globalId", "The global section's id, as text."),
	}},

	"heading": {Kind: "widget", About: "A heading.", Fields: []fieldDoc{
		txt("heading", "The heading text."),
		txt("tag", "HTML level for SEO; anything else becomes h2. Use one h1 per page.", "h1", "h2", "h3", "h4", "h5", "h6"),
		txt("size", "Visual size: s=20px, m=26px, l=36px, xl=48px (default l).", "s", "m", "l", "xl"),
		txt("align", "Text alignment (default left).", alignLCR...),
		txt("url", "Optional link for the whole heading."),
	}},
	"text": {Kind: "widget", About: "Formatted text without a heading.", Fields: []fieldDoc{
		{Key: "body", Type: "richtext", About: "HTML: paragraphs, lists, links, bold/italic, h3/h4."},
		txt("size", "Text size (default m).", "s", "m", "l"),
		txt("align", "Text alignment (default left).", alignLCR...),
	}},
	"icon": {Kind: "widget", About: "One icon.", Fields: []fieldDoc{
		txt("icon", "Icon name (default star).", widgetIcons...),
		txt("size", "s=24px, m=40px, l=56px, xl=80px.", "s", "m", "l", "xl"),
		txt("color", "Icon colour; empty follows the text colour.", widgetColors...),
		txt("align", "Placement (default center).", alignLCR...),
		txt("url", "Optional link."),
		txt("label", "Accessible name for the link."),
	}},
	"icon_box": {Kind: "widget", About: "An icon with a title and text.", Fields: []fieldDoc{
		txt("icon", "Icon name.", widgetIcons...),
		txt("title", "Title."),
		{Key: "body", Type: "richtext", About: "Text under the title."},
		txt("url", "Optional link for the title."),
		txt("position", "Icon above the text, or to its left.", "top", "left"),
		txt("align", "With position top: text alignment.", "left", "center"),
		txt("size", "Icon size.", "s", "m", "l", "xl"),
		txt("color", "Icon colour (default secondary/gold).", widgetColors...),
	}},
	"icon_list": {Kind: "widget", About: "A list of lines, each with an icon. Items are itemIndex 1, 2, 3...; the list settings are on itemIndex 0.", Fields: []fieldDoc{
		txt("layout", "One line per item, or side by side.", "list", "inline"),
		txt("color", "Icon colour (default success/green).", widgetColors...),
		txt("size", "Text size.", "s", "m", "l"),
		item(txt("icon", "The item's icon (default check).", widgetIcons...)),
		item(txt("text", "The item's text; items without text are skipped.")),
		item(txt("url", "Optional link for the item.")),
	}},
	"divider": {Kind: "widget", About: "A horizontal line.", Fields: []fieldDoc{
		txt("style", "Line style.", "solid", "dashed", "dotted"),
		txt("width", "full, half or short (96px).", "full", "half", "short"),
		txt("weight", "Thickness.", "thin", "thick"),
		txt("color", "Line colour; empty is the default line colour.", "light", "navy", "gold"),
		txt("align", "Placement when not full width (default center).", alignLCR...),
		txt("space", "Space above and below: none, s=8px, m=20px, l=40px.", "none", "s", "m", "l"),
	}},
	"card": {Kind: "widget", About: "A boxed card: image, title, text and a button.", Fields: []fieldDoc{
		{Key: "image", Type: "image", About: "Card image: a mediaId."},
		txt("alt", "Image alt text."),
		txt("title", "Card title."),
		{Key: "body", Type: "richtext", About: "Card text."},
		{Key: "button", Type: "button", About: "Optional button: label in textValue, link in urlValue."},
		txt("buttonStyle", "Button look.", buttonStyles...),
		txt("imagePosition", "Image above or to the left of the text.", "top", "left"),
		txt("align", "\"center\" centres the text.", "left", "center"),
	}},
	"counter": {Kind: "widget", About: "A big number that counts up when scrolled into view.", Fields: []fieldDoc{
		txt("number", "The number, e.g. 150 or 4.8."),
		txt("prefix", "Shown before the number, e.g. $."),
		txt("suffix", "Shown after the number, e.g. + or %."),
		txt("label", "Line under the number."),
		txt("size", "Number size (default l).", "m", "l", "xl"),
		txt("color", "Number colour.", widgetColors...),
		txt("align", "Alignment (default center).", alignLCR...),
	}},
	"progress_bars": {Kind: "widget", About: "Labelled bars filled to a percentage. Bars are itemIndex 1, 2, 3...", Fields: []fieldDoc{
		txt("color", "Bar colour (default primary).", "primary", "secondary", "blue", "success", "danger"),
		item(txt("label", "The bar's label.")),
		item(txt("percent", "0-100.")),
	}},
	"alert": {Kind: "widget", About: "A coloured notice box.", Fields: []fieldDoc{
		txt("type", "Colour and icon (default info).", "info", "success", "warning", "danger"),
		txt("title", "Bold first line."),
		{Key: "body", Type: "richtext", About: "The notice text."},
	}},
	"table": {Kind: "widget", About: "A simple table. Headers h1..hN are on itemIndex 0; each row is itemIndex 1, 2, 3... with cells c1..cN.", Fields: []fieldDoc{
		txt("columns", "Number of columns, 2-6 (default 3).", "2", "3", "4", "5", "6"),
		txt("striped", "\"no\" turns off row stripes.", "yes", "no"),
		txt("h1", "Header of column 1; h2, h3... for the others."),
		item(txt("c1", "Row cell in column 1; c2, c3... for the others. Rows with no cells are skipped.")),
	}},
	"star_rating": {Kind: "widget", About: "0-5 stars with the score.", Fields: []fieldDoc{
		txt("rating", "0 to 5, halves allowed, e.g. 4.5."),
		txt("label", "Optional text after the stars."),
		txt("showScore", "\"no\" hides the \"4.5 / 5\" text.", "yes", "no"),
		txt("size", "Star size.", "s", "m", "l"),
		txt("align", "Placement (default left).", alignLCR...),
	}},
	"testimonial": {Kind: "widget", About: "A quote with the person's name, photo and rating.", Fields: []fieldDoc{
		txt("quote", "The quote."),
		txt("name", "Who said it."),
		txt("role", "A line under the name, e.g. Player from Singapore."),
		{Key: "photo", Type: "image", About: "Optional photo: a mediaId."},
		txt("rating", "Optional 0-5 stars."),
		txt("align", "\"center\" centres it.", "left", "center"),
	}},
	"image": {Kind: "widget", About: "An image with optional link and caption.", Fields: []fieldDoc{
		{Key: "image", Type: "image", About: "A mediaId."},
		txt("alt", "Alt text."),
		txt("caption", "Optional caption."),
		txt("linkUrl", "Optional link."),
		txt("size", "Width.", "full", "large", "medium", "small"),
		txt("align", "Placement when not full (default center).", alignLCR...),
		txt("rounded", "\"no\" for square corners.", "yes", "no"),
	}},
	"button_group": {Kind: "widget", About: "One or more buttons in a row. Each button is its own itemIndex (0, 1, 2...).", Fields: []fieldDoc{
		item(fieldDoc{Key: "button", Type: "button", About: "Label in textValue, link in urlValue."}),
		item(txt("buttonStyle", "Button look.", buttonStyles...)),
		item(txt("newTab", "\"yes\" opens in a new tab.", "yes", "no")),
		txt("align", "Placement of the row (itemIndex 0).", alignLCR...),
	}},
	"spacer": {Kind: "widget", About: "Empty space.", Fields: []fieldDoc{
		txt("size", "xs=16px, s=25px, m=50px, l=80px, xl=120px.", "xs", "s", "m", "l", "xl"),
		txt("divider", "\"yes\" draws a line in the middle.", "yes", "no"),
	}},
	"video": {Kind: "widget", About: "A YouTube or Vimeo video that loads on click.", Fields: []fieldDoc{
		txt("url", "The YouTube or Vimeo page URL."),
		txt("title", "Accessible title."),
		txt("caption", "Optional caption."),
		txt("size", "Width.", "full", "large", "medium", "small"),
		txt("align", "Placement (default center).", alignLCR...),
	}},

	"top_bonus_picks":       dataBlock("Bonus picks from the casino list.", "3", "swipe", "grid", "carousel", "list", "table"),
	"top_casinos_by_region": dataBlock("Top casinos for a region, with featured cards.", "3", "swipe", "grid", "carousel", "list"),
	"blacklist_preview":     dataBlock("Blacklisted casinos.", "5", "carousel", "grid", "list"),
	"game_rtp_carousel":     dataBlock("Games with their RTP.", "5", "carousel", "grid", "list"),
	"content_carousel":      dataBlock("News or guide articles.", "4", "carousel", "grid", "list"),
	"region_explorer":       dataBlock("The site's regions.", "4", "panel", "grid", "list"),
	"data_table":            dataBlock("A table of casinos and bonuses.", "3", "table", "cards", "list"),
	"bonus_calculator": {Kind: "data", About: "The bonus wagering calculator.", Fields: []fieldDoc{
		txt("display", "Calculator layout. Empty means compact.", "compact", "centered", "side"),
	}},
}

// classicBlockTypes are hidden from the admin's Add menu (admin/src/lib/
// readyTemplates.ts CLASSIC_BLOCK_TYPES): widgets in containers do the job.
var classicBlockTypes = []string{
	"title_set", "rich_text", "hero", "highlight_panel", "cta_link_list", "feature_cards", "expandable_card_grid",
	"link_card_grid", "info_card_columns", "two_column_table", "icon_box_group", "checklist_callout", "numbered_steps",
	"review_columns", "event_highlights", "team_grid", "stats_counter", "logo_strip",
}

func init() {
	for _, t := range classicBlockTypes {
		if _, ok := blockDocs[t]; !ok {
			blockDocs[t] = blockDoc{Kind: "classic", About: classicAbout}
		}
	}
}

// styleFields are the Style tab's free-form settings (web/src/lib/
// sectionStyle.ts), text fields on itemIndex 0 that any section can have.
var styleFields = map[string]any{
	"about": "Any section can also have these text fields on itemIndex 0 to style its own box. Sizes are numbers of px. Colours are a token name (primary-50 ... primary-900, primary-glow, secondary-50 ... secondary-900, success, success-subtle, danger, white, black) or #hex / #rrggbbaa. Leave a field out for the default. Tablet and mobile: stPadding, stMargin, stMinHeight and stFontSize (and a container's gap and minHeight) can also be set per device by adding \"Tablet\" or \"Mobile\" to the key (stPaddingMobile, gapTablet, ...). The plain key is desktop and applies everywhere; a Tablet value overrides it on tablet and mobile, a Mobile value on mobile only. Screen sizes come from Site Settings (default: mobile below 768px, tablet 768-1199px, desktop 1200px and up).",
	"fields": []fieldDoc{
		txt("stPadding", "Space inside: \"top right bottom left\" in px, \"-\" for a side left at its default, or one number for all four. Give all four sides: \"40 24 40 24\", not \"40 24\". On a container it is the space around its content."),
		txt("stMargin", "Space outside, same format as stPadding."),
		txt("stMinHeight", "Minimum height of a component: px like \"300\" or \"50vh\". Containers use their minHeight field."),
		txt("stBg", "Background of the component's own box (containers use bgType instead).", "none", "color", "linear", "radial", "image"),
		txt("stBgColor", "Background colour, or the gradient's first colour."),
		txt("stBgColor2", "The gradient's second colour."),
		txt("stBgAngle", "Linear gradient direction in degrees (default 90, left to right)."),
		{Key: "stBgImage", Type: "image", About: "Background image (stBg image): a mediaId."},
		txt("stBgSize", "Image size.", "cover", "contain", "auto"),
		txt("stBgPosition", "Image position.", "center", "top", "bottom", "left", "right"),
		txt("stBgOverlay", "A colour over the image, e.g. #00000080."),
		txt("stFontSize", "Text size in px for all the component's text (a container: for text without its own size)."),
		txt("stFontWeight", "Text weight.", "300", "400", "500", "600", "700", "800"),
		txt("stColor", "Text colour for headings, text and lists; buttons and links keep theirs."),
		txt("stBorder", "Border style.", "none", "solid", "dashed", "dotted", "double"),
		txt("stBorderWidth", "Border thickness in px (default 1)."),
		txt("stBorderColor", "Border colour."),
		txt("stRadius", "Rounded corners in px (999 for a pill)."),
	},
}

// styleClasses are the Style presets a section can carry in customClass
// (shared/theme/sections.css), space separated, one per group.
var styleClasses = map[string]any{
	"about":        "Add any of these to a section's customClass (space separated, at most one per group) to style it. They work on containers and components alike.",
	"box":          []string{"section--box-white", "section--box-light", "section--box-cream", "section--box-mint", "section--box-blue", "section--box-gold", "section--box-navy", "section--box-gradient"},
	"text":         []string{"section--text-navy", "section--text-blue", "section--text-gold", "section--text-muted", "section--text-white"},
	"border":       []string{"section--border-light", "section--border-navy", "section--border-gold"},
	"radius":       []string{"section--radius-s", "section--radius-m", "section--radius-l", "section--radius-pill"},
	"shadow":       []string{"section--shadow-s", "section--shadow-m", "section--shadow-l"},
	"padding":      []string{"section--pad-s", "section--pad-m", "section--pad-l"},
	"marginTop":    []string{"section--mt-s", "section--mt-m", "section--mt-l"},
	"marginBottom": []string{"section--mb-s", "section--mb-m", "section--mb-l"},
	"animation":    []string{"section--anim-fade-up", "section--anim-fade-left", "section--anim-fade-right", "section--anim-zoom"},
	"widthInRow":   []string{"section--w-full", "section--w-3-4", "section--w-2-3", "section--w-1-2", "section--w-1-3", "section--w-1-4", "section--w-auto"},
	"hideOn":       []string{"section--hide-mobile", "section--hide-tablet", "section--hide-desktop"},
}

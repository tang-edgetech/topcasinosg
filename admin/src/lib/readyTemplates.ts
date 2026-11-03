// Built-in "ready-made sections" for the Add Component popup: each one is a
// Container of basic widgets (and nested Containers) laid out like one of
// the older fixed-layout blocks it replaces (`replaces`, also used for its
// thumbnail). Inserting one copies its sections into the page like a saved
// template, so every part stays editable on its own. Sample text is
// placeholder copy for editors to overwrite.
import type { PageBlockType, PageFieldType, PageSectionFieldDTO } from "./types";
import type { CopiedSection } from "./sectionClipboard";

export interface ReadyTemplate {
  id: string;
  name: string;
  description: string;
  replaces: PageBlockType;
  sections: CopiedSection[];
}

// ---- Builders -------------------------------------------------------------

type FieldSpec = [key: string, value: string, itemIndex?: number, type?: PageFieldType, url?: string];

function fields(specs: FieldSpec[]): PageSectionFieldDTO[] {
  return specs.map(([fieldKey, textValue, itemIndex = 0, fieldType = "text", urlValue = ""], i) => ({
    itemIndex,
    fieldKey,
    fieldType,
    textValue,
    mediaId: null,
    mediaUrl: null,
    urlValue,
    sortOrder: i + 1,
  }));
}

function section(blockType: PageBlockType, depth: number, specs: FieldSpec[], customClass = ""): CopiedSection {
  return { blockType, depth, inContainer: depth > 0, customClass, customId: "", fields: fields(specs) };
}

const container = (depth: number, layout: string, specs: FieldSpec[] = [], customClass = "") =>
  section("container", depth, [["layout", layout], ...specs], customClass);
const heading = (depth: number, text: string, size = "l", align = "left", tag = "h2") =>
  section("heading", depth, [["heading", text], ["tag", tag], ["size", size], ["align", align]]);
const text = (depth: number, html: string, align = "left", size = "m", extra: FieldSpec[] = []) =>
  section("text", depth, [["body", html, 0, "richtext"], ["size", size], ["align", align], ...extra]);
const buttons = (depth: number, list: [label: string, url: string, style: string][], align = "left") =>
  section("button_group", depth, [
    ["align", align],
    ...list.flatMap(([label, url, style], i): FieldSpec[] => [
      ["button", label, i + 1, "button", url],
      ["buttonStyle", style, i + 1],
      ["newTab", "no", i + 1],
    ]),
  ]);
const iconBox = (depth: number, icon: string, title: string, body: string, extra: FieldSpec[] = [], customClass = "") =>
  section("icon_box", depth, [["icon", icon], ["title", title], ["body", `<p>${body}</p>`, 0, "richtext"], ...extra], customClass);
const iconList = (depth: number, icon: string, lines: string[]) =>
  section("icon_list", depth, [["layout", "list"], ...lines.flatMap((line, i): FieldSpec[] => [["icon", icon, i + 1], ["text", line, i + 1]])]);
const card = (depth: number, title: string, body: string, button?: [label: string, url: string], extra: FieldSpec[] = [], customClass = "") =>
  section(
    "card",
    depth,
    [
      ["image", "", 0, "image"],
      ["alt", ""],
      ["title", title],
      ["body", body, 0, "richtext"],
      ...(button ? ([["button", button[0], 0, "button", button[1]], ["buttonStyle", "primary"]] as FieldSpec[]) : []),
      ["imagePosition", "top"],
      ...extra,
    ],
    customClass
  );
const counter = (depth: number, number: string, suffix: string, label: string) =>
  section("counter", depth, [["number", number], ["suffix", suffix], ["label", label], ["color", "white"]]);
const testimonial = (depth: number, quote: string, name: string, role: string, rating: string) =>
  section("testimonial", depth, [["quote", quote], ["name", name], ["role", role], ["rating", rating]], "section--box-white section--border-light section--radius-m section--pad-m");
const image = (depth: number, size = "full", extra: FieldSpec[] = []) =>
  section("image", depth, [["image", "", 0, "image"], ["alt", ""], ["size", size], ["align", "center"], ["rounded", "yes"], ...extra]);

const BOX = "section--box-white section--border-light section--radius-m section--pad-m";
const SOFT_BOX = "section--box-light section--radius-m section--pad-m";
// A boxed section directly on the page: the box keeps its own padding and
// a gap above and below, instead of the Container's 50px top/bottom space.
const BOXED: FieldSpec[] = [["spaceTop", "none"], ["spaceBottom", "none"]];
const BOXED_CLASS = "section--radius-m section--pad-l section--mt-l section--mb-l";
const DARK_BG: FieldSpec[] = [["bgType", "gradient"], ["bgFrom", "primary-900"], ["bgTo", "primary-glow"], ["textTone", "light"]];

// ---- Templates ------------------------------------------------------------

export const READY_TEMPLATES: ReadyTemplate[] = [
  {
    id: "title-text",
    name: "Section title & text",
    description: "Centred heading with a line of text under it",
    replaces: "title_set",
    sections: [
      container(0, "stack", [["gap", "s"]]),
      heading(1, "Why Players Trust Our Reviews", "l", "center"),
      text(1, "<p>Every casino is tested with real money, so you know what to expect before you sign up.</p>", "center"),
    ],
  },
  {
    id: "heading-text",
    name: "Heading & formatted text",
    description: "Heading with paragraphs, lists and links",
    replaces: "rich_text",
    sections: [
      container(0, "stack", [["gap", "s"]]),
      heading(1, "How We Rate Online Casinos"),
      text(1, "<p>Write your text here. Use <strong>bold</strong>, lists and <a href=\"/guides\">links</a>.</p><ul><li>First point</li><li>Second point</li></ul>"),
    ],
  },
  {
    id: "hero",
    name: "Hero banner",
    description: "Big title, text and buttons beside an image on a dark background",
    replaces: "hero",
    sections: [
      container(0, "row", [...DARK_BG, ["gap", "l"], ["align", "center"], ["minHeight", "m"], ["stackOn", "tablet"]]),
      container(1, "stack", [["gap", "m"]]),
      heading(2, "Find the Best Online Casinos in 2026", "xl", "left", "h1"),
      text(2, "<p>Honest reviews, real payout tests and bonuses checked line by line.</p>", "left", "l"),
      buttons(2, [["Compare Casinos", "/casinos", "secondary"], ["Read Our Guides", "/guides", "white"]]),
      image(1, "full"),
    ],
  },
  {
    id: "highlight-panel",
    name: "Highlight panel",
    description: "Soft panel with a heading, text and two side-by-side boxes",
    replaces: "highlight_panel",
    sections: [
      container(0, "stack", [...BOXED, ["gap", "m"]], `section--box-light ${BOXED_CLASS}`),
      heading(1, "What Makes a Casino Safe?"),
      text(1, "<p>Two things matter most before you deposit.</p>"),
      container(1, "row", [["gap", "m"], ["stackOn", "mobile"]]),
      iconBox(2, "shield-check", "A real licence", "Check who issued it and that it is still valid.", [], BOX),
      iconBox(2, "bolt", "Fast payouts", "Look for withdrawals paid within 24 hours.", [], BOX),
    ],
  },
  {
    id: "link-buttons",
    name: "Link button list",
    description: "Heading and text with a set of link buttons",
    replaces: "cta_link_list",
    sections: [
      container(0, "stack", [["gap", "s"]]),
      heading(1, "Explore More", "m"),
      text(1, "<p>Jump straight to the topic you need.</p>"),
      buttons(1, [
        ["Welcome Bonuses", "/casino-bonus/welcome-bonus", "outline"],
        ["Free Spins", "/casino-bonus/free-spins", "outline"],
        ["Blackjack", "/casino-games/blackjack", "outline"],
        ["Blacklisted Casinos", "/blacklist", "outline"],
      ]),
    ],
  },
  {
    id: "feature-cards",
    name: "Feature cards",
    description: "Three cards with an image, title, text and a button",
    replaces: "feature_cards",
    sections: [
      container(0, "grid", [["columns", "3"], ["gap", "m"]]),
      ...[
        ["Live Casino", "Real dealers streamed in HD."],
        ["Slots", "Thousands of games with high RTP."],
        ["Sports Betting", "Odds on every major league."],
      ].map(([title, body]) => card(1, title, `<p>${body}</p><ul><li>Point one</li><li>Point two</li></ul>`, ["Learn More", "/guides"])),
    ],
  },
  {
    id: "expandable-cards",
    name: "Expandable cards",
    description: "Heading with click-to-open panels",
    replaces: "expandable_card_grid",
    sections: [
      container(0, "stack", [["gap", "m"]]),
      heading(1, "Common Questions About Bonuses"),
      container(1, "accordion", [["firstOpen", "yes"]]),
      ...["What is a welcome bonus?", "What is turnover?", "Can I withdraw bonus money?"].map((title) =>
        text(2, "<p>Write the answer here.</p>", "left", "m", [["panelTitle", title]])
      ),
    ],
  },
  {
    id: "link-cards",
    name: "Link cards",
    description: "Grid of boxes, each one a link with an icon and title",
    replaces: "link_card_grid",
    sections: [
      container(0, "grid", [["columns", "4"], ["gap", "s"]]),
      iconBox(1, "dice", "Casino Games", "Rules and strategy.", [["url", "/casino-games"]], BOX),
      iconBox(1, "gift", "Casino Bonuses", "Every bonus type explained.", [["url", "/casino-bonus"]], BOX),
      iconBox(1, "shield-check", "Safe Casinos", "Licensed and tested.", [["url", "/casinos"]], BOX),
      iconBox(1, "warning", "Blacklist", "Casinos to avoid.", [["url", "/blacklist"]], BOX),
    ],
  },
  {
    id: "info-columns",
    name: "Two info columns",
    description: "Two boxes side by side, each with a title and text",
    replaces: "info_card_columns",
    sections: [
      container(0, "row", [["gap", "m"], ["stackOn", "mobile"]]),
      container(1, "stack", [["gap", "s"]], BOX),
      heading(2, "For New Players", "s"),
      text(2, "<p>Start with a small deposit and a low-turnover bonus.</p>"),
      container(1, "stack", [["gap", "s"]], SOFT_BOX),
      heading(2, "For Experienced Players", "s"),
      text(2, "<p>Look at VIP programmes and cashback with no turnover.</p>"),
    ],
  },
  {
    id: "two-column-table",
    name: "Two-column table",
    description: "Heading with a table of terms and explanations",
    replaces: "two_column_table",
    sections: [
      container(0, "stack", [["gap", "m"]]),
      heading(1, "Bonus Terms Explained", "m"),
      section("table", 1, [
        ["columns", "2"],
        ["striped", "yes"],
        ["h1", "Term"],
        ["h2", "What it means"],
        ["c1", "Turnover", 1],
        ["c2", "How many times you must bet the bonus before withdrawing.", 1],
        ["c1", "Max bet", 2],
        ["c2", "The largest single bet allowed while the bonus is active.", 2],
        ["c1", "Expiry", 3],
        ["c2", "How long you have to meet the turnover.", 3],
      ]),
    ],
  },
  {
    id: "icon-boxes",
    name: "Icon boxes",
    description: "Centred heading over three icon boxes",
    replaces: "icon_box_group",
    sections: [
      container(0, "stack", [["gap", "m"]]),
      heading(1, "Why Choose Us", "l", "center"),
      container(1, "grid", [["columns", "3"], ["gap", "m"]]),
      iconBox(2, "shield-check", "Licensed only", "We only list regulated casinos.", [["align", "center"]]),
      iconBox(2, "clock", "Payouts timed", "We test real withdrawals.", [["align", "center"]]),
      iconBox(2, "headset", "Support checked", "We contact every help desk.", [["align", "center"]]),
    ],
  },
  {
    id: "checklist",
    name: "Checklist box",
    description: "Mint box with a heading and a list of ticks",
    replaces: "checklist_callout",
    sections: [
      container(0, "stack", [...BOXED, ["gap", "s"]], `section--box-mint ${BOXED_CLASS}`),
      heading(1, "Before You Sign Up, Check:", "s"),
      iconList(1, "check-circle", ["A valid gambling licence", "Local payment methods", "Fair bonus turnover", "24/7 support"]),
    ],
  },
  {
    id: "numbered-steps",
    name: "Numbered steps",
    description: "Step 1, Step 2, Step 3 boxes",
    replaces: "numbered_steps",
    sections: [
      container(0, "stack", [["gap", "m"]]),
      heading(1, "How to Get Started"),
      container(1, "grid", [["columns", "3"], ["gap", "m"]]),
      ...[
        ["Step 1", "Pick a casino", "Choose one from our top list."],
        ["Step 2", "Create an account", "Sign up with your real details."],
        ["Step 3", "Claim your bonus", "Deposit and activate the offer."],
      ].flatMap(([step, title, body]) => [
        container(2, "stack", [["gap", "s"]], SOFT_BOX),
        text(3, `<p><strong>${step}</strong></p>`, "left", "s"),
        heading(3, title, "m", "left", "h3"),
        text(3, `<p>${body}</p>`),
      ]),
    ],
  },
  {
    id: "player-reviews",
    name: "Player reviews",
    description: "Positive reviews beside complaints",
    replaces: "review_columns",
    sections: [
      container(0, "row", [["gap", "m"], ["align", "start"], ["stackOn", "tablet"]]),
      container(1, "stack", [["gap", "s"]]),
      heading(2, "What Players Like", "m"),
      testimonial(2, "Withdrawals arrived the same day.", "Player name", "Singapore", "5"),
      testimonial(2, "Good choice of live tables.", "Player name", "Malaysia", "4"),
      container(1, "stack", [["gap", "s"]]),
      heading(2, "Common Complaints", "m"),
      testimonial(2, "Bonus turnover was higher than I expected.", "Player name", "Thailand", "2"),
      testimonial(2, "Support took a day to reply.", "Player name", "Singapore", "2"),
    ],
  },
  {
    id: "promo-cards",
    name: "Promotion cards",
    description: "Event or promotion cards with banner image and button",
    replaces: "event_highlights",
    sections: [
      container(0, "stack", [["gap", "m"]]),
      heading(1, "Promotions This Month"),
      container(1, "grid", [["columns", "3"], ["gap", "m"]]),
      ...["Weekend Cashback", "Slot Tournament", "Live Casino Race"].map((title) =>
        card(2, title, "<p>Short description of the promotion and its dates.</p>", ["Join Now", "/casinos"])
      ),
    ],
  },
  {
    id: "team-cards",
    name: "Team cards",
    description: "Photo, name and role for each team member",
    replaces: "team_grid",
    sections: [
      container(0, "stack", [["gap", "m"]]),
      heading(1, "Meet Our Experts", "l", "center"),
      container(1, "grid", [["columns", "4"], ["gap", "m"]]),
      ...["Senior Reviewer", "Bonus Analyst", "Payments Expert", "Editor"].map((role) =>
        card(2, "Full Name", `<p>${role}</p>`, undefined, [["align", "center"]])
      ),
    ],
  },
  {
    id: "number-counters",
    name: "Number counters",
    description: "Big counting numbers on a dark band",
    replaces: "stats_counter",
    sections: [
      container(0, "row", [...DARK_BG, ["gap", "m"], ["stackOn", "mobile"]]),
      counter(1, "150", "+", "Casinos reviewed"),
      counter(1, "6", "", "Countries covered"),
      counter(1, "1200", "+", "Bonuses checked"),
      counter(1, "24", "h", "Average payout tested"),
    ],
  },
  {
    id: "logo-row",
    name: "Logo row",
    description: "Small heading over a row of logos",
    replaces: "logo_strip",
    sections: [
      container(0, "stack", [["gap", "m"]]),
      text(1, "<p><strong>As Featured In</strong></p>", "center", "s"),
      container(1, "row", [["gap", "l"], ["justify", "center"], ["align", "center"], ["wrap", "yes"]]),
      ...[1, 2, 3, 4, 5].map(() => image(2, "small", [["rounded", "no"]])),
    ],
  },
  {
    id: "pros-cons",
    name: "Pros and cons",
    description: "Two columns: ticks for pros, crosses for cons",
    replaces: "checklist_callout",
    sections: [
      container(0, "row", [["gap", "m"], ["align", "start"], ["stackOn", "mobile"]]),
      container(1, "stack", [["gap", "s"]], "section--box-mint section--radius-m section--pad-m"),
      heading(2, "Pros", "s"),
      iconList(2, "check", ["Fast withdrawals", "Big game library", "Local banking"]),
      container(1, "stack", [["gap", "s"]], SOFT_BOX),
      heading(2, "Cons", "s"),
      iconList(2, "x", ["High bonus turnover", "No phone support"]),
    ],
  },
  {
    id: "cta-band",
    name: "Call-to-action band",
    description: "Dark band with a centred heading, text and buttons",
    replaces: "hero",
    sections: [
      container(0, "stack", [...DARK_BG, ["gap", "m"]]),
      heading(1, "Ready to Play Safely?", "l", "center"),
      text(1, "<p>Compare our top-rated casinos and claim a checked bonus.</p>", "center"),
      buttons(1, [["See Top Casinos", "/casinos", "secondary"]], "center"),
    ],
  },
  {
    id: "rating-summary",
    name: "Rating summary",
    description: "Overall stars beside score bars",
    replaces: "review_columns",
    sections: [
      container(0, "row", [...BOXED, ["gap", "l"], ["align", "center"], ["stackOn", "mobile"]], `section--box-light ${BOXED_CLASS}`),
      container(1, "stack", [["gap", "s"]]),
      heading(2, "Our Verdict", "m"),
      section("star_rating", 2, [["rating", "4.5"], ["label", "Overall score"]]),
      text(2, "<p>One or two sentences that sum up the casino.</p>"),
      section("progress_bars", 1, [
        ["color", "primary"],
        ...[["Bonuses", "90"], ["Payouts", "85"], ["Games", "80"], ["Support", "70"]].flatMap(([label, percent], i): FieldSpec[] => [
          ["label", label, i + 1],
          ["percent", percent, i + 1],
        ]),
      ]),
    ],
  },
  {
    id: "tabs",
    name: "Tabs",
    description: "Content split into clickable tabs",
    replaces: "expandable_card_grid",
    sections: [
      container(0, "tabs"),
      ...["Overview", "Bonuses", "Payments"].map((title) => text(1, `<p>Write the ${title.toLowerCase()} here.</p>`, "left", "m", [["panelTitle", title]])),
    ],
  },
];

// The older fixed-layout blocks these templates replace: hidden from the
// Add Component popup unless "Show classic components" is ticked. Pages
// that already use them keep rendering and editing them as before.
export const CLASSIC_BLOCK_TYPES: PageBlockType[] = [
  "title_set",
  "rich_text",
  "hero",
  "highlight_panel",
  "cta_link_list",
  "feature_cards",
  "expandable_card_grid",
  "link_card_grid",
  "info_card_columns",
  "two_column_table",
  "icon_box_group",
  "checklist_callout",
  "numbered_steps",
  "review_columns",
  "event_highlights",
  "team_grid",
  "stats_counter",
  "logo_strip",
];

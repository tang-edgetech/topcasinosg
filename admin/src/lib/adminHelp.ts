export interface AdminHelp {
  summary: string;
  sections: { heading: string; points: string[] }[];
}

const LIST_BASICS = {
  heading: "Finding things in the list",
  points: [
    "Type in the search box to filter as you type; the dropdowns narrow it further. \"Clear filters\" resets everything.",
    "Choose 10–150 rows per page at the bottom of the table. Your choice is remembered for this list.",
    "Tick rows to publish, set to draft or delete several at once.",
  ],
};

const PUBLISHING = {
  heading: "Publishing",
  points: [
    "Draft: only visible here. Published: live on the website. Scheduled: goes live by itself at the date and time you pick.",
    "Use the clock button on a row to publish or schedule it without opening the form.",
    "The website refreshes its content about once a minute, so a change can take up to a minute to appear.",
  ],
};

export const ADMIN_HELP = {
  pages: {
    summary: "Pages are the website's content pages, each built from sections (banner, text, tables, FAQ…). The list is a tree: child pages sit under their parent and share its URL.",
    sections: [
      {
        heading: "Editing a page",
        points: [
          "Open a page, then add, reorder or remove sections on the Content tab. Live blocks (casino tables, bonus tables, sliders) fill themselves from your records.",
          "Page Details sets the title, URL slug and parent page; the SEO tab sets the browser title and description.",
          "Drag the handle on the left to reorder pages under the same parent. Dragging is off while filters are active.",
        ],
      },
      {
        heading: "Shared region pages",
        points: [
          "\"Region Template\" holds one copy of pages shared by every region (Bonuses, Reviews). Write {region}, {regionAdj}, {currency}, {regionCode} or {year} and each region fills in its own values.",
          "A region page with no sections shows the shared copy. Add sections to it to give that region its own version.",
          "{year} works on every page, so copy like \"Best casinos in {year}\" never goes stale.",
        ],
      },
      LIST_BASICS,
      PUBLISHING,
    ],
  },
  casinos: {
    summary: "Casinos are the brands you review. One casino record feeds its review page and every casino card, table and slider across the site.",
    sections: [
      {
        heading: "What to fill in",
        points: [
          "Regions decide which country pages list the casino. Rating (out of 5) is shown as a score out of 10.",
          "Payment methods should match the names of your Payment Method records so their icons appear.",
          "Supported games power the \"Choose by playing style\" finder on Reviews pages.",
          "Upload a logo: cards and tables show a grey placeholder until you do. Filter \"Missing logo\" to find them.",
        ],
      },
      LIST_BASICS,
      PUBLISHING,
    ],
  },
  bonuses: {
    summary: "Bonuses are the offers shown on each region's Bonuses pages: Top Bonus Picks, the six bonus tables and the per-type bonus pages.",
    sections: [
      {
        heading: "What to fill in",
        points: [
          "Pick the region, the casino and the bonus type; the type decides which table the bonus appears in.",
          "Each type asks for its own details (turnover, max claim, payment frequency…). These become the table columns on the website.",
          "A table with no published bonuses of its type is hidden automatically.",
        ],
      },
      LIST_BASICS,
      PUBLISHING,
    ],
  },
  "payment-methods": {
    summary: "Payment methods are the deposit and withdrawal options listed per region. Their icons also appear next to casinos that accept them.",
    sections: [
      {
        heading: "Tips",
        points: [
          "Name a method exactly as casinos list it (for example \"TrueMoney Wallet\") so the icon matches.",
          "Filter \"Missing icon\" to see which ones still show a text label instead of a logo.",
        ],
      },
      LIST_BASICS,
      PUBLISHING,
    ],
  },
  rtp: {
    summary: "RTP entries are games with their Return to Player percentage. Each region's RTP page shows them in sliders, highest RTP first.",
    sections: [
      {
        heading: "What to fill in",
        points: [
          "Category decides the slider: Slots in one, Table and Live games in the other.",
          "Pick the game provider and a casino; the card's Visit Site button uses that casino's link.",
          "Add a card image. Filter \"Missing image\" to find entries without one.",
        ],
      },
      LIST_BASICS,
      PUBLISHING,
    ],
  },
  guides: {
    summary: "Guides are articles shown under Casino Guides and How to Play, on the Home page rows and on each region's How to Play page.",
    sections: [
      {
        heading: "Tips",
        points: [
          "Leave the region empty for a global guide; pick a region to show it on that region's pages too.",
          "Add a cover image: it's used on every guide card. Filter \"Missing cover\" to find them.",
          "To feature a guide on the Home page, pick it in the Home page's guide row section.",
        ],
      },
      LIST_BASICS,
      PUBLISHING,
    ],
  },
  blacklist: {
    summary: "The blacklist lists casinos players should avoid. Entries appear on the Blacklist pages and in every \"Avoid these casinos\" slider.",
    sections: [
      {
        heading: "Tips",
        points: [
          "Leave the region empty for a global entry; pick a region to show it on that region's pages.",
          "Each reason becomes a red line on the entry's card, so keep them short (\"Withdrawal delays\").",
        ],
      },
      LIST_BASICS,
      PUBLISHING,
    ],
  },
  news: {
    summary: "News articles appear on the News page and in the Home page's Latest News row, newest first.",
    sections: [
      {
        heading: "Tips",
        points: ["Add a cover image for the article cards. Filter \"Missing cover\" to find articles without one."],
      },
      LIST_BASICS,
      PUBLISHING,
    ],
  },
  "game-providers": {
    summary: "Game providers (Pragmatic Play, Evolution…) are picked on casinos, RTP entries and free-spins bonuses.",
    sections: [
      {
        heading: "Tips",
        points: [
          "Upload a logo: it appears in the Eligible Provider column of free-spins tables.",
          "Deleting a provider removes it from every casino and entry that uses it.",
        ],
      },
      LIST_BASICS,
    ],
  },
  licenses: {
    summary: "Licenses are the regulators (Curaçao, Malta…) you attach to casinos to show where they're licensed.",
    sections: [
      {
        heading: "Tips",
        points: ["Upload the regulator's logo so it shows on casino review pages.", "Deleting a license removes it from every casino."],
      },
      LIST_BASICS,
    ],
  },
  regions: {
    summary: "Regions are the countries the site covers. Each active region gets its own pages (/th, /th/bonuses…) and appears in menus and region pickers.",
    sections: [
      {
        heading: "What to fill in",
        points: [
          "Code is the URL part (th, my, sg). Name is shown everywhere (\"Thailand\").",
          "Adjective and Currency Code fill the {regionAdj} and {currency} placeholders on shared region pages, and set the bonus calculator's currency.",
          "Deactivate a region to hide all of its pages without deleting anything.",
        ],
      },
    ],
  },
  users: {
    summary: "Users are the people who can sign in to this admin panel.",
    sections: [
      {
        heading: "Roles",
        points: [
          "Editor: manages content (casinos, bonuses, pages…).",
          "Admin: also manages settings, regions and editors.",
          "Super Admin: full access, including other admins. It can't be deleted.",
        ],
      },
    ],
  },
  navigation: {
    summary: "Navigation controls the website's header menu and footer link columns.",
    sections: [
      {
        heading: "Tips",
        points: [
          "Static items link wherever you set. \"Auto\" items list every active region or casino review by themselves.",
          "Set Sort Order to change an item's position (lower comes first), or add a child item under a parent to build a dropdown.",
        ],
      },
    ],
  },
  sidebar: {
    summary: "The sidebar is the link box shown beside the content on every page except Home. It has three fixed sections; edit their headings and links.",
    sections: [{ heading: "Tips", points: ["Changes apply to every page at once after you save."] }],
  },
  snippets: {
    summary: "Snippets add code to the website, such as analytics, chat widgets or custom CSS.",
    sections: [
      {
        heading: "Tips",
        points: [
          "Choose where the code goes: page head, start of body or footer.",
          "Add conditions to limit a snippet to certain pages (URL is, is not or contains).",
          "A broken snippet can break the website, so test on one page first.",
        ],
      },
    ],
  },
  media: {
    summary: "The Media Library stores every image you upload: logos, flags, covers and page images.",
    sections: [
      {
        heading: "Tips",
        points: [
          "Images uploaded from any form land here and can be reused anywhere.",
          "Use compressed images (WebP or optimised JPG/PNG) to keep pages fast.",
        ],
      },
    ],
  },
} satisfies Record<string, AdminHelp>;

export type AdminHelpKey = keyof typeof ADMIN_HELP;

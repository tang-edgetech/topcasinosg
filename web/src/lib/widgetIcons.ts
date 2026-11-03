// Built-in icons for the Icon, Icon Box and Icon List widgets: simple line
// icons on a 24px grid, drawn with currentColor, so they take the text
// colour around them. Each is a list of SVG path strings. The admin keeps a
// copy for its icon picker (admin/src/lib/widgetIcons.ts) - keep the two in
// step when adding an icon.
const CIRCLE = "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18";

export const WIDGET_ICONS: Record<string, { label: string; paths: string[] }> = {
  check: { label: "Check", paths: ["M5 12l5 5L20 7"] },
  "check-circle": { label: "Check in circle", paths: [CIRCLE, "M8 12l3 3 5-6"] },
  x: { label: "Cross", paths: ["M6 6l12 12", "M18 6L6 18"] },
  star: { label: "Star", paths: ["M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"] },
  shield: { label: "Shield", paths: ["M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"] },
  "shield-check": { label: "Shield with check", paths: ["M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z", "M9 12l2 2 4-4"] },
  lock: { label: "Lock", paths: ["M5 11h14v10H5z", "M8 11V7a4 4 0 0 1 8 0v4"] },
  bolt: { label: "Lightning", paths: ["M13 2L4 14h7l-1 8 9-12h-7z"] },
  gift: {
    label: "Gift",
    paths: ["M3 8h18v4H3z", "M5 12v9h14v-9", "M12 8v13", "M12 8c-2-4-6-4-6-1.5S9 8 12 8z", "M12 8c2-4 6-4 6-1.5S15 8 12 8z"],
  },
  coin: {
    label: "Coin",
    paths: [CIRCLE, "M12 7v10", "M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5"],
  },
  wallet: { label: "Wallet", paths: ["M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H3z", "M3 7l12-4v4", "M16 13h2"] },
  card: { label: "Payment card", paths: ["M3 6h18v12H3z", "M3 10h18", "M7 15h3"] },
  percent: { label: "Percent", paths: ["M19 5L5 19", "M7 9a2 2 0 1 0 0-4a2 2 0 1 0 0 4", "M17 19a2 2 0 1 0 0-4a2 2 0 1 0 0 4"] },
  trophy: { label: "Trophy", paths: ["M8 4h8v5a4 4 0 0 1-8 0z", "M8 6H4v1a3 3 0 0 0 4 3", "M16 6h4v1a3 3 0 0 1-4 3", "M12 13v5", "M8 21h8", "M10 18h4"] },
  award: { label: "Medal", paths: ["M12 15a6 6 0 1 0 0-12a6 6 0 1 0 0 12", "M8.5 14L7 22l5-3 5 3-1.5-8"] },
  crown: { label: "Crown", paths: ["M3 7l4 4 5-6 5 6 4-4-2 12H5z"] },
  dice: { label: "Dice", paths: ["M4 4h16v16H4z", "M8.5 8.5h.01", "M15.5 8.5h.01", "M12 12h.01", "M8.5 15.5h.01", "M15.5 15.5h.01"] },
  fire: { label: "Fire", paths: ["M12 22c4 0 7-3 7-7 0-5-4-7-5-11-3 2-4 5-3 8-2-1-3-3-3-3-2 2-3 4-3 6 0 4 3 7 7 7z"] },
  heart: { label: "Heart", paths: ["M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"] },
  "thumbs-up": {
    label: "Thumbs up",
    paths: ["M7 10v11H3V10z", "M7 10l4-7a2 2 0 0 1 3 2l-1 4h6a2 2 0 0 1 2 2.3l-1.4 7A2 2 0 0 1 17.6 21H7"],
  },
  clock: { label: "Clock", paths: [CIRCLE, "M12 7v5l3 2"] },
  calendar: { label: "Calendar", paths: ["M4 5h16v16H4z", "M4 10h16", "M8 3v4", "M16 3v4"] },
  globe: { label: "Globe", paths: [CIRCLE, "M3 12h18", "M12 3a14 14 0 0 1 0 18", "M12 3a14 14 0 0 0 0 18"] },
  mobile: { label: "Mobile phone", paths: ["M7 2h10v20H7z", "M11 18h2"] },
  mail: { label: "Email", paths: ["M3 5h18v14H3z", "M3 6l9 7 9-7"] },
  chat: { label: "Chat", paths: ["M4 4h16v12H8l-4 4z"] },
  headset: { label: "Support", paths: ["M4 14v-2a8 8 0 0 1 16 0v2", "M4 14h3v6H4z", "M17 14h3v6h-3z"] },
  users: { label: "People", paths: ["M9 11a4 4 0 1 0 0-8a4 4 0 1 0 0 8", "M2 21a7 7 0 0 1 14 0", "M16 3.5a4 4 0 0 1 0 7.5", "M18 14a7 7 0 0 1 4 7"] },
  chart: { label: "Chart", paths: ["M4 20h16", "M7 16v-5", "M12 16V6", "M17 16V8"] },
  search: { label: "Search", paths: ["M11 18a7 7 0 1 0 0-14a7 7 0 1 0 0 14", "M20 20l-4-4"] },
  info: { label: "Info", paths: [CIRCLE, "M12 11v5", "M12 8h.01"] },
  warning: { label: "Warning", paths: ["M12 3l10 18H2z", "M12 10v4", "M12 17h.01"] },
  question: { label: "Question", paths: [CIRCLE, "M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.5V14", "M12 17h.01"] },
  play: { label: "Play", paths: [CIRCLE, "M10 8l6 4-6 4z"] },
  "arrow-right": { label: "Arrow right", paths: ["M5 12h14", "M13 6l6 6-6 6"] },
};

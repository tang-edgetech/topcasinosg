// Placeholder artwork, generated as SVG. Brand "logos" are plain wordmarks of
// the name in a colour, not copies of any real brand's logo.
import { esc } from "./lib.mjs";

const FONT = "font-family=\"Figtree, 'Segoe UI', Arial, sans-serif\"";

function wrap(text, max) {
  const lines = [];
  let line = "";
  for (const word of String(text).split(/\s+/)) {
    if ((line + " " + word).trim().length > max && line) {
      lines.push(line);
      line = word;
    } else line = (line + " " + word).trim();
  }
  if (line) lines.push(line);
  return lines;
}

function textLines(lines, { x, y, size, lh = 1.2, anchor = "start", weight = 800, fill = "#fff" }) {
  return lines
    .map((l, i) => `<text x="${x}" y="${y + i * size * lh}" ${FONT} font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(l)}</text>`)
    .join("");
}

// Casino wordmark on white, sized for the 3-up cards and table brand cells.
export function casinoLogo(name, color, accent) {
  const size = name.length > 6 ? 46 : 58;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160" width="320" height="160">
<rect width="320" height="160" rx="16" fill="#fff"/>
<path d="M248 52 l26 28 l-26 28" fill="none" stroke="${accent}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
<text x="140" y="${80 + size * 0.35}" ${FONT} font-size="${size}" font-weight="900" font-style="italic" fill="${color}" text-anchor="middle" letter-spacing="-1">${esc(name)}</text>
<text x="140" y="140" ${FONT} font-size="13" font-weight="600" fill="#6b7280" text-anchor="middle" letter-spacing="3">ONLINE CASINO</text>
</svg>`;
}

// Site wordmark for the dark header/footer: orange "TOP", white "CASINO".
export function siteLogo() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60" width="220" height="60">
<path d="M6 10 h34 l-10 16 h-10 l-12 24 h-6z" fill="#F7941D"/><path d="M30 26 h22 l-16 24 h-16z" fill="#fff"/>
<text x="62" y="27" ${FONT} font-size="22" font-weight="900" font-style="italic" fill="#F7941D">TOP</text>
<text x="62" y="51" ${FONT} font-size="24" font-weight="900" font-style="italic" fill="#fff">CASINO</text>
</svg>`;
}

export function favicon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="#2E3192"/>
<path d="M10 12 h30 l-9 14 h-8 l-11 24 h-6z" fill="#F7941D"/><path d="M32 26 h20 l-14 24 h-14z" fill="#fff"/></svg>`;
}

// Name badge for payment methods, game providers, licences and partners.
export function nameBadge(name, color, sub = "") {
  const lines = wrap(name, 14);
  const size = lines.length > 1 ? 22 : name.length > 10 ? 24 : 30;
  const top = 64 - ((lines.length - 1) * size * 1.1) / 2 + size * 0.35 - (sub ? 8 : 0);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 128" width="240" height="128">
<rect width="240" height="128" rx="14" fill="#fff" stroke="#e5e7eb" stroke-width="2"/>
<rect x="0" y="0" width="10" height="128" rx="5" fill="${color}"/>
${textLines(lines, { x: 125, y: top, size, lh: 1.1, anchor: "middle", fill: color })}
${sub ? `<text x="125" y="${top + lines.length * size * 1.1 + 4}" ${FONT} font-size="13" font-weight="600" fill="#6b7280" text-anchor="middle">${esc(sub)}</text>` : ""}
</svg>`;
}

const FLAGS = {
  th: `<rect width="60" height="40" fill="#A51931"/><rect y="6.67" width="60" height="26.67" fill="#F4F5F8"/><rect y="13.33" width="60" height="13.33" fill="#2D2A4A"/>`,
  my: `${Array.from({ length: 14 }, (_, i) => `<rect y="${(i * 40) / 14}" width="60" height="${40 / 14}" fill="${i % 2 ? "#fff" : "#CC0001"}"/>`).join("")}<rect width="30" height="22.86" fill="#010066"/><circle cx="11" cy="11.4" r="7" fill="#FC0"/><circle cx="13" cy="11.4" r="6" fill="#010066"/><polygon points="22,6 23.2,9.8 27,9.8 24,12 25.2,15.8 22,13.5 18.8,15.8 20,12 17,9.8 20.8,9.8" fill="#FC0"/>`,
  sg: `<rect width="60" height="40" fill="#fff"/><rect width="60" height="20" fill="#EF3340"/><circle cx="13" cy="10" r="6.5" fill="#fff"/><circle cx="15.5" cy="10" r="6.2" fill="#EF3340"/>${[[19, 5.5], [22.5, 8], [21, 12], [17, 12], [15.5, 8]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="#fff"/>`).join("")}`,
  id: `<rect width="60" height="40" fill="#fff"/><rect width="60" height="20" fill="#CE1126"/>`,
  vn: `<rect width="60" height="40" fill="#DA251D"/><polygon points="30,8 33.5,18.5 44.5,18.5 35.5,25 39,35.5 30,29 21,35.5 24.5,25 15.5,18.5 26.5,18.5" fill="#FF0"/>`,
  ph: `<rect width="60" height="20" fill="#0038A8"/><rect y="20" width="60" height="20" fill="#CE1126"/><polygon points="0,0 34.6,20 0,40" fill="#fff"/><circle cx="11" cy="20" r="4.5" fill="#FCD116"/>`,
};

export function flag(code) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" width="60" height="40">${FLAGS[code]}</svg>`;
}

const PALETTES = [
  ["#1e1b6b", "#3b45d9"],
  ["#4c1d95", "#db2777"],
  ["#064e3b", "#10b981"],
  ["#7c2d12", "#f59e0b"],
  ["#0c4a6e", "#06b6d4"],
  ["#312e81", "#f43f5e"],
];

export function palette(i) {
  return PALETTES[i % PALETTES.length];
}

// Article cover (guides, news): gradient, kicker and wrapped title, at the
// cards' 31:22 ratio so nothing is cropped.
export function cover(title, kicker, i) {
  const [a, b] = palette(i);
  const lines = wrap(title, 22).slice(0, 3);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 568" width="800" height="568">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="800" height="568" fill="url(#g)"/>
<circle cx="690" cy="90" r="150" fill="#fff" opacity=".07"/><circle cx="740" cy="480" r="110" fill="#fff" opacity=".06"/>
<rect x="72" y="80" width="${kicker.length * 11 + 36}" height="38" rx="19" fill="#F9A825"/>
<text x="90" y="106" ${FONT} font-size="18" font-weight="800" fill="#1e1b6b">${esc(kicker.toUpperCase())}</text>
${textLines(lines, { x: 72, y: 230, size: 56 })}
</svg>`;
}

// RTP slider game tile.
export function gameArt(name, provider, i) {
  const [a, b] = palette(i);
  const lines = wrap(name.toUpperCase(), 12).slice(0, 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
<defs><radialGradient id="g" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></radialGradient></defs>
<rect width="400" height="300" fill="url(#g)"/>
<rect x="14" y="14" width="372" height="272" rx="14" fill="none" stroke="#F9A825" stroke-width="4" opacity=".8"/>
${textLines(lines, { x: 200, y: 150 - (lines.length - 1) * 22, size: 40, lh: 1.1, anchor: "middle", weight: 900, fill: "#FDE68A" })}
<text x="200" y="255" ${FONT} font-size="18" font-weight="700" fill="#fff" opacity=".85" text-anchor="middle">${esc(provider)}</text>
</svg>`;
}

export function avatar(initials, i) {
  const [a, b] = palette(i);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="300" height="300" fill="url(#g)"/><circle cx="150" cy="118" r="58" fill="#fff" opacity=".22"/><path d="M50 300 q100 -140 200 0z" fill="#fff" opacity=".22"/>
<text x="150" y="140" ${FONT} font-size="64" font-weight="800" fill="#fff" text-anchor="middle">${esc(initials)}</text>
</svg>`;
}

export function eventBanner(title, prize, currency, i) {
  const [a, b] = palette(i + 3);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
<defs><radialGradient id="g" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></radialGradient></defs>
<rect width="600" height="400" fill="url(#g)"/>
${Array.from({ length: 12 }, (_, k) => `<path d="M300 170 L${300 + 400 * Math.cos((k * Math.PI) / 6)} ${170 + 400 * Math.sin((k * Math.PI) / 6)} L${300 + 400 * Math.cos(((k + 0.5) * Math.PI) / 6)} ${170 + 400 * Math.sin(((k + 0.5) * Math.PI) / 6)}z" fill="#fff" opacity=".06"/>`).join("")}
<circle cx="300" cy="150" r="92" fill="#F9A825" stroke="#fff" stroke-width="8"/>
<text x="300" y="168" ${FONT} font-size="54" font-weight="900" fill="#7c2d12" text-anchor="middle">SPIN</text>
${textLines([title.toUpperCase()], { x: 300, y: 300, size: 40, anchor: "middle", weight: 900, fill: "#FDE68A" })}
<text x="300" y="350" ${FONT} font-size="26" font-weight="800" fill="#fff" text-anchor="middle">TOTAL PRIZE ${esc(currency)} ${esc(prize)}</text>
</svg>`;
}

// Decorative illustrations for the homepage hero, Responsible Gaming and Final Words.
export function heroArt() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 500" width="600" height="500">
<defs><linearGradient id="o" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FDBA4D"/><stop offset="1" stop-color="#F97316"/></linearGradient>
<linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDE68A"/><stop offset="1" stop-color="#D97706"/></linearGradient></defs>
<rect x="150" y="150" width="320" height="300" rx="70" fill="url(#o)" transform="rotate(-8 310 300)"/>
<path d="M250 230 h140 l-60 70 h80 l-150 120 l50 -90 h-70z" fill="#fff" opacity=".95"/>
${[[170, 120], [300, 70], [430, 120], [380, 40]].map(([x, y], k) => `<ellipse cx="${x}" cy="${y}" rx="${46 - k * 4}" ry="${18 - k}" fill="url(#c)" stroke="#B45309" stroke-width="3"/>`).join("")}
</svg>`;
}

export function safeArt() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 420" width="500" height="420">
<defs><linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4b5563"/><stop offset="1" stop-color="#111827"/></linearGradient>
<linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDE68A"/><stop offset="1" stop-color="#D97706"/></linearGradient></defs>
<rect x="110" y="60" width="280" height="290" rx="36" fill="url(#s)"/><rect x="140" y="90" width="220" height="230" rx="22" fill="#1f2937" stroke="#9ca3af" stroke-width="4"/>
<circle cx="250" cy="205" r="62" fill="#374151" stroke="#F9A825" stroke-width="8"/><circle cx="250" cy="205" r="16" fill="#F9A825"/>
${[[90, 370], [150, 385], [380, 375], [420, 360]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="40" ry="14" fill="url(#c)" stroke="#B45309" stroke-width="3"/>`).join("")}
</svg>`;
}

const ICON_PATHS = {
  shield: `<path d="M32 6 l20 8 v14 c0 14 -9 24 -20 30 c-11 -6 -20 -16 -20 -30 v-14z"/><path d="M23 32 l7 7 l12 -14"/>`,
  money: `<rect x="6" y="16" width="52" height="32" rx="5"/><circle cx="32" cy="32" r="8"/><path d="M14 24 v16 M50 24 v16"/>`,
  dice: `<rect x="10" y="10" width="44" height="44" rx="9"/><circle cx="22" cy="22" r="3"/><circle cx="42" cy="42" r="3"/><circle cx="32" cy="32" r="3"/><circle cx="42" cy="22" r="3"/><circle cx="22" cy="42" r="3"/>`,
  phone: `<rect x="18" y="6" width="28" height="52" rx="6"/><path d="M28 50 h8"/>`,
  gift: `<rect x="8" y="24" width="48" height="12" rx="2"/><rect x="12" y="36" width="40" height="22" rx="2"/><path d="M32 24 v34 M32 24 c-8 -14 -20 -8 -12 0 M32 24 c8 -14 20 -8 12 0"/>`,
  headset: `<path d="M12 36 v-6 a20 20 0 0 1 40 0 v6"/><rect x="8" y="34" width="10" height="16" rx="4"/><rect x="46" y="34" width="10" height="16" rx="4"/><path d="M52 50 c0 6 -8 8 -16 8"/>`,
  chat: `<path d="M8 12 h48 v30 h-28 l-12 10 v-10 h-8z"/><path d="M18 24 h28 M18 32 h18"/>`,
  card: `<rect x="6" y="14" width="52" height="36" rx="5"/><path d="M6 24 h52 M14 40 h12"/>`,
  bank: `<path d="M8 24 l24 -14 l24 14z"/><path d="M14 28 v20 M26 28 v20 M38 28 v20 M50 28 v20 M8 52 h48"/>`,
  coin: `<circle cx="32" cy="32" r="22"/><path d="M38 24 c-2 -4 -14 -4 -14 2 c0 7 14 4 14 11 c0 6 -12 6 -14 2 M32 18 v4 M32 42 v4"/>`,
  chart: `<path d="M8 54 h48"/><path d="M12 44 l12 -12 l10 8 l18 -22"/><path d="M42 18 h10 v10"/>`,
  star: `<path d="M32 8 l7 15 l16 2 l-12 11 l3 16 l-14 -8 l-14 8 l3 -16 l-12 -11 l16 -2z"/>`,
  target: `<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="12"/><circle cx="32" cy="32" r="3"/>`,
  book: `<path d="M8 12 h18 a6 6 0 0 1 6 6 v36 a6 6 0 0 0 -6 -6 h-18z M56 12 h-18 a6 6 0 0 0 -6 6 v36 a6 6 0 0 1 6 -6 h18z"/>`,
  bolt: `<path d="M36 6 l-20 30 h14 l-4 22 l20 -30 h-14z"/>`,
  clock: `<circle cx="32" cy="32" r="24"/><path d="M32 18 v14 l10 6"/>`,
};

export const ICONS = Object.keys(ICON_PATHS);

// Feature-card art: no text, since cards crop it to fit (object-cover).
export function iconArt(name, i) {
  const [a, b] = palette(i);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="600" height="400" fill="url(#g)"/><circle cx="300" cy="200" r="120" fill="#fff" opacity=".12"/>
<g transform="translate(204 104) scale(3)" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]}</g>
</svg>`;
}

export function icon(name, color = "#2E3192") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]}</svg>`;
}

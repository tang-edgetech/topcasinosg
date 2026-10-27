// Demo data seed for a fresh TopCasinoSG database.
//   node scripts/seed-demo/seed.mjs
// Needs the API running (API_URL, default http://localhost:8090). Safe to
// re-run: records are matched by slug/name/code and updated in place.
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { login, api, list, upsert, uploadSvg, mediaUrlOf, upsertPage, rng, ROOT } from "./lib.mjs";
import * as art from "./images.mjs";
import { REGIONS, LICENSES, PARTNERS, PROVIDERS, PAYMENT_METHOD_STYLES, REGION_PAYMENTS, CASINOS, BLACKLIST, GAMES, GUIDES, NEWS, TEAM } from "./data.mjs";
import { homeSections, regionHomeSections, paymentSections, calculatorIntro } from "./pages.mjs";

const log = (...a) => console.log(...a);
const slugify = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Round a region amount to something a casino would print (SGD 300, THB 7,800, IDR 3,450,000).
function money(region, sgd) {
  const raw = sgd * region.rate;
  const step = raw >= 1e6 ? 50000 : raw >= 1e5 ? 5000 : raw >= 1e4 ? 500 : raw >= 1000 ? 100 : raw >= 100 ? 10 : 1;
  return `${region.currency} ${(Math.round(raw / step) * step).toLocaleString("en-US")}`;
}

async function main() {
  await login();
  log("signed in");

  // ---------------- media ----------------
  const m = { icons: {}, paymentArt: {} };
  for (const name of art.ICONS) m.icons[name] = await uploadSvg(`icon-${name}.svg`, art.icon(name), `${name} icon`);
  m.heroArt = await uploadSvg("home-hero-art.svg", art.heroArt(), "Top Casino illustration");
  m.safeArt = await uploadSvg("responsible-gaming-safe.svg", art.safeArt(), "Safe with gold coins");
  for (const [i, k] of ["bank", "phone", "coin", "card", "bolt"].entries()) {
    const title = { bank: "Local Bank Transfers", phone: "E-Wallets", coin: "Cryptocurrencies", card: "Credit & Debit Cards", bolt: "Mobile Payments" }[k];
    m.paymentArt[k] = await uploadSvg(`payment-art-${k}.svg`, art.iconArt(k, i), title);
  }
  m.team = [];
  for (const [i, t] of TEAM.entries()) m.team.push({ ...t, mediaId: await uploadSvg(`team-${slugify(t.name)}.svg`, art.avatar(t.initials, i), t.name) });
  m.partners = [];
  for (const p of PARTNERS) m.partners.push({ ...p, mediaId: await uploadSvg(`partner-${slugify(p.name)}.svg`, art.nameBadge(p.name, p.color, p.sub), p.name) });
  log("media: icons, illustrations, team, partners");

  await uploadSvg("site-logo.svg", art.siteLogo(), "Top Casino");
  await uploadSvg("site-favicon.svg", art.favicon(), "Top Casino icon");
  await api("PUT", "/api/admin/settings/site/logo", { url: mediaUrlOf("site-logo.svg") });
  await api("PUT", "/api/admin/settings/site/favicon", { url: mediaUrlOf("site-favicon.svg") });
  log("site logo + favicon");

  // ---------------- regions ----------------
  const regionRows = await list("/api/admin/regions");
  const region = {};
  for (const r of REGIONS) {
    const flagMediaId = await uploadSvg(`flag-${r.code}.svg`, art.flag(r.code), `${r.name} flag`);
    const row = await upsert({
      listUrl: "/api/admin/regions",
      existing: regionRows,
      match: (x) => x.code === r.code,
      body: { code: r.code, name: r.name, demonym: r.demonym, currencyCode: r.currency, flagMediaId, sortOrder: r.sortOrder },
      publish: false,
    });
    await api("PUT", `/api/admin/regions/${row.id}/active`, { active: true });
    region[r.code] = { ...r, id: row.id };
  }
  log(`regions: ${Object.keys(region).join(", ")}`);

  // ---------------- providers & licences ----------------
  const provider = {};
  const providerRows = await list("/api/admin/game-providers");
  for (const [i, p] of PROVIDERS.entries()) {
    const logoMediaId = await uploadSvg(`provider-${slugify(p.name)}.svg`, art.nameBadge(p.name, p.color), p.name);
    const row = await upsert({ listUrl: "/api/admin/game-providers", existing: providerRows, match: (x) => x.name === p.name, body: { name: p.name, logoMediaId, sortOrder: i + 1 }, publish: false });
    provider[p.name] = row.id;
  }
  const license = {};
  const licenseRows = await list("/api/admin/licenses");
  for (const [i, l] of LICENSES.entries()) {
    const logoMediaId = await uploadSvg(`license-${slugify(l.name)}.svg`, art.nameBadge(l.name, l.color, l.sub), l.name);
    const row = await upsert({ listUrl: "/api/admin/licenses", existing: licenseRows, match: (x) => x.name === l.name, body: { name: l.name, logoMediaId, sortOrder: i + 1 }, publish: false });
    license[l.name] = row.id;
  }
  log(`providers: ${PROVIDERS.length}, licences: ${LICENSES.length}`);

  // ---------------- payment methods ----------------
  const pmRows = await list("/api/admin/payment-methods");
  let pmCount = 0;
  for (const r of REGIONS) {
    for (const name of REGION_PAYMENTS[r.code]) {
      const style = PAYMENT_METHOD_STYLES[name];
      const iconMediaId = await uploadSvg(`payment-${slugify(name)}.svg`, art.nameBadge(name, style.color), name);
      await upsert({
        listUrl: "/api/admin/payment-methods",
        existing: pmRows,
        match: (x) => x.regionId === region[r.code].id && x.name === name,
        body: { regionId: region[r.code].id, name, description: style.desc, iconMediaId },
      });
      pmCount++;
    }
  }
  log(`payment methods: ${pmCount}`);

  // ---------------- casinos ----------------
  const casinoRows = await list("/api/admin/casinos");
  const casino = {};
  for (const c of CASINOS) {
    const logoMediaId = await uploadSvg(`casino-${c.slug}.svg`, art.casinoLogo(c.name, c.color, c.accent), `${c.name} logo`);
    const regs = c.regions.map((code) => region[code]);
    const payments = [...new Set([...regs.flatMap((r) => REGION_PAYMENTS[r.code].slice(0, 2)), "Visa", "Mastercard", ...(c.crypto ? ["USDT", "Bitcoin"] : []), "Bank Transfer"])];
    const regionNames = regs.map((r) => r.name);
    const body = {
      slug: c.slug,
      name: c.name,
      logoMediaId,
      // Stored out of 5; the site doubles it for the "/10" score (web/src/components/ScoreDisplay.tsx).
      rating: Math.round(c.rating * 5) / 10,
      summary: `${c.name} is a ${c.risk === "low" ? "trusted" : "popular"} online casino for players in ${regionNames.join(", ")}, offering ${c.games.length}+ game types, ${c.providers.length} top providers and payouts in ${c.payout.replace("≤ ", "under ")}.`,
      content: casinoReview(c, regs, payments),
      languages: ["English", ...new Set(regs.map((r) => r.lang).filter((l) => l !== "English")), "Chinese"],
      currencies: [...regs.map((r) => r.currency), ...(c.crypto ? ["USDT", "BTC"] : [])],
      paymentMethods: payments,
      pros: ["Fast payouts", "24/7 support", "Great for Southeast Asian players", "Trusted license and massive bonuses"],
      cons: c.risk === "low" ? ["KYC required before first withdrawal", "Some bonuses exclude live casino"] : ["Slower bank withdrawals", "High wagering on some bonuses", "Limited licence coverage"],
      safeIndex: c.safe,
      riskStatus: c.risk,
      supportedGames: c.games,
      payoutSpeed: c.payout,
      ctaUrl: `https://www.example.com/go/${c.slug}`,
      regionIds: regs.map((r) => r.id),
      gameProviderIds: c.providers.map((n) => provider[n]),
      licenseIds: c.licenses.map((n) => license[n]),
      rtpPercentage: c.rtp,
      cryptoSupported: c.crypto,
      localBankingSpeed: c.bank,
    };
    const row = await upsert({ listUrl: "/api/admin/casinos", existing: casinoRows, match: (x) => x.slug === c.slug, body });
    casino[c.slug] = { ...c, id: row.id };
  }
  log(`casinos: ${CASINOS.length}`);

  // ---------------- bonuses ----------------
  const bonusRows = await list("/api/admin/bonuses");
  let bonusCount = 0;
  for (const c of CASINOS) {
    for (const code of c.regions) {
      for (const b of bonusesFor(c, region[code], provider)) {
        await upsert({ listUrl: "/api/admin/bonuses", existing: bonusRows, match: (x) => x.slug === b.slug, body: { regionId: region[code].id, casinoId: casino[c.slug].id, ...b } });
        bonusCount++;
      }
    }
  }
  log(`bonuses: ${bonusCount}`);

  // ---------------- RTP entries ----------------
  const rtpRows = await list("/api/admin/rtp");
  const gameImage = {};
  for (const [i, g] of GAMES.entries()) gameImage[g.name] = await uploadSvg(`game-${slugify(g.name)}.svg`, art.gameArt(g.name, g.provider, i), g.name);
  let rtpCount = 0;
  for (const r of REGIONS) {
    const regionCasinos = CASINOS.filter((c) => c.regions.includes(r.code));
    for (const [i, g] of GAMES.entries()) {
      const c = regionCasinos[i % regionCasinos.length];
      const wobble = Math.round((rng(`${r.code}-${g.name}`)() - 0.5) * 40) / 100;
      await upsert({
        listUrl: "/api/admin/rtp",
        existing: rtpRows,
        match: (x) => x.regionId === region[r.code].id && x.gameName === g.name,
        body: { regionId: region[r.code].id, casinoId: casino[c.slug].id, gameProviderId: provider[g.provider], imageMediaId: gameImage[g.name], gameName: g.name, category: g.category, rtpPercentage: Math.min(99.9, +(g.rtp + wobble).toFixed(2)) },
      });
      rtpCount++;
    }
  }
  log(`rtp entries: ${rtpCount}`);

  // ---------------- blacklist ----------------
  const blRows = await list("/api/admin/blacklist");
  for (const b of BLACKLIST) {
    const logoMediaId = await uploadSvg(`blacklist-${slugify(b.name)}.svg`, art.nameBadge(b.name, "#9ca3af", "Blacklisted"), b.name);
    await upsert({
      listUrl: "/api/admin/blacklist",
      existing: blRows,
      match: (x) => x.name === b.name,
      body: {
        regionId: b.region ? region[b.region].id : null,
        name: b.name,
        logoMediaId,
        rating: b.rating,
        reason: b.reason,
        reasons: b.reasons,
        details: `<p>${b.name} has been blacklisted after repeated, verified player complaints: ${b.reasons.join(", ").toLowerCase()}. We recommend avoiding this site and choosing a casino from our trusted list instead.</p>`,
      },
    });
  }
  log(`blacklist: ${BLACKLIST.length}`);

  // ---------------- guides & news ----------------
  const guideRows = await list("/api/admin/guides");
  for (const [i, g] of GUIDES.entries()) {
    const coverMediaId = await uploadSvg(`guide-cover-${g.slug}.svg`, art.cover(g.title, g.kind === "howto" ? "How to play" : g.kind === "strategy" ? "Strategy" : "Local guide", i), g.title);
    await upsert({ listUrl: "/api/admin/guides", existing: guideRows, match: (x) => x.slug === g.slug, body: { regionId: g.region ? region[g.region].id : null, title: g.title, slug: g.slug, coverMediaId, excerpt: g.excerpt, content: g.body } });
  }
  const newsRows = await list("/api/admin/news");
  for (const [i, n] of NEWS.entries()) {
    const coverMediaId = await uploadSvg(`news-cover-${n.slug}.svg`, art.cover(n.title, "News", i + 2), n.title);
    await upsert({ listUrl: "/api/admin/news", existing: newsRows, match: (x) => x.slug === n.slug, body: { title: n.title, slug: n.slug, coverMediaId, excerpt: n.excerpt, content: n.body } });
  }
  log(`guides: ${GUIDES.length}, news: ${NEWS.length}`);

  // ---------------- pages ----------------
  const pages = await list("/api/admin/pages");
  m.strategyGuides = GUIDES.filter((g) => g.kind === "strategy").map((g) => g.slug);
  m.howtoGuides = GUIDES.filter((g) => g.kind === "howto").map((g) => g.slug);
  await upsertPage({
    pages,
    slug: "home",
    title: "Homepage",
    metaTitle: "TopCasinoSG - Best Online Casino Reviews You Can Trust in {year}",
    metaDescription: "Independent, data-driven online casino reviews for Southeast Asia: licensing, real-money payouts, bonuses and support tested by our experts.",
    sections: homeSections(m),
  });
  log("page: home");

  const eventArt = [];
  for (const [i, [title, prize]] of [["Huat Spin Giveaway", 88888], ["Mega Cashback Week", 50000], ["Live Baccarat Race", 100000]].entries()) {
    eventArt.push({ title, mediaId: await uploadSvg(`event-${slugify(title)}.svg`, art.eventBanner(title, prize.toLocaleString("en-US"), "SGD", i), title) });
  }
  for (const r of REGIONS) {
    const top = CASINOS.filter((c) => c.regions.includes(r.code)).slice(0, 3);
    const events = eventArt.map((e, i) => ({ ...e, casinoId: casino[top[i % top.length].slug].id, dateRange: ["15 Jan - 15 Feb {year}", "1 Mar - 7 Mar {year}", "1 Apr - 30 Apr {year}"][i] }));
    const rr = region[r.code];
    const homeId = await upsertPage({
      pages,
      slug: r.code,
      title: r.name,
      metaTitle: `Best Online Casinos in ${r.name} {year} | Top Casino`,
      metaDescription: `Trusted online casinos for ${r.demonym} players in {year}: ${r.currency} banking, fast payouts and verified bonuses.`,
      sections: regionHomeSections(rr, { ...m, events }),
    });
    await upsertPage({
      pages,
      parentId: homeId,
      slug: "payment-methods",
      title: `${r.name} Payment Methods`,
      metaTitle: `Online Casino Payment Methods in ${r.name} {year}`,
      metaDescription: `Fastest and safest ways to deposit and withdraw at ${r.demonym} online casinos.`,
      sections: paymentSections(rr, m),
    });
    log(`pages: /${r.code}, /${r.code}/payment-methods`);
  }

  // /calculator: an introduction section here, then the 0056 migration
  // (which keeps that intro and builds every other section) fills the page.
  await upsertPage({ pages, slug: "calculator", title: "Bonus Calculator", metaTitle: "Online Casino Bonus Calculator {year}", sections: calculatorIntro() });
  runSql("api/internal/db/migrations/0056_calculator_figma_rebuild.sql");
  log("page: /calculator");

  log("done");
}

function runSql(rel) {
  const mysql = process.env.MYSQL_BIN ?? (existsSync("C:/xampp/mysql/bin/mysql.exe") ? "C:/xampp/mysql/bin/mysql.exe" : "mysql");
  const sql = readFileSync(path.join(ROOT, rel), "utf8");
  execFileSync(mysql, ["-u", process.env.DB_USER ?? "root", "--default-character-set=utf8mb4", process.env.DB_NAME ?? "topcasinosg"], { input: sql, stdio: ["pipe", "inherit", "inherit"] });
}

function bonusesFor(c, r, provider) {
  const rand = rng(`${c.slug}-${r.code}`);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const base = `${c.slug}-${r.code}`;
  const code = (s) => `${c.name.replace(/[^A-Za-z0-9]/g, "").toUpperCase()}${s}`;
  const welcomePct = pick([100, 100, 150, 200]);
  const welcomeMax = pick([200, 300, 500]);
  const spins = pick([20, 30, 50]);
  const reloadPct = pick([30, 50]);
  const cashPct = pick([5, 8, 10, 12]);
  const freeSpins = pick([50, 100, 150]);
  const rebate = pick(["0.8%", "1%", "1.2%"]);
  const fsGames = pick([
    ["Gates of Olympus, Sweet Bonanza", "Pragmatic Play"],
    ["Total Overdrive, Aztec Magic Megaways", "Evoplay"],
    ["Mahjong Ways 2, Lucky Neko", "PG Soft"],
    ["Fortune Gems, Super Ace", "JILI Games"],
  ]);
  return [
    {
      bonusType: "welcome",
      slug: `${base}-welcome`,
      title: `${welcomePct}% Match`,
      terms: `up to ${money(r, welcomeMax)} + ${spins} free spins\nFor new players on the first deposit only. Wagering applies to bonus and deposit.`,
      code: code("WELCOME"),
      turnoverRequirement: `${pick([25, 30, 35])}x deposit + bonus`,
      minDeposit: `Minimum ${money(r, 30)}`,
      maxClaim: money(r, welcomeMax),
      withdrawalLimit: `Minimum ${money(r, 50)}`,
    },
    {
      bonusType: "no_deposit",
      slug: `${base}-no-deposit`,
      title: `${money(r, pick([5, 8, 10]))} Free Credit + ${pick([10, 20])} free spins`,
      terms: "no deposit needed for new verified accounts\nClaim via live chat after verifying your mobile number.",
      code: code("FREE"),
      turnoverRequirement: `${pick([30, 40, 50])}x bonus + winnings`,
      maxClaim: money(r, 10),
      withdrawalLimit: `Minimum ${money(r, 50)}`,
    },
    {
      bonusType: "free_spins",
      slug: `${base}-free-spins`,
      title: `${freeSpins} Free Spins`,
      terms: `on ${fsGames[0]}\nSpins are credited after a qualifying deposit and expire in 7 days.`,
      turnoverRequirement: `${pick([20, 30])}x winnings`,
      eligibleGames: fsGames[0],
      eligibleProviderId: provider[fsGames[1]] ?? null,
      minDeposit: `Minimum ${money(r, 20)}`,
    },
    {
      bonusType: "deposit",
      slug: `${base}-deposit`,
      title: `${reloadPct}% Reload Bonus`,
      terms: `up to ${money(r, 200)} every Friday\nOne claim per week on deposits made on Fridays.`,
      code: code("RELOAD"),
      turnoverRequirement: `${pick([15, 20])}x deposit + bonus`,
      minDeposit: `Minimum ${money(r, 30)}`,
      maxClaim: money(r, 200),
    },
    {
      bonusType: "cashback",
      slug: `${base}-cashback`,
      title: `${cashPct}% Cashback`,
      terms: `on net losses up to ${money(r, 300)}\nCredited automatically every Monday.`,
      turnoverRequirement: pick(["No Wagering", "1x"]),
      paymentFrequency: pick(["Weekly", "Daily"]),
      maxRebate: money(r, 300),
      minDeposit: `Minimum ${money(r, 50)}`,
    },
    {
      bonusType: "loyalty_vip",
      slug: `${base}-vip`,
      title: `${rebate} Flat Rebates + Unlimited Withdrawals`,
      terms: "for VIP members from Silver tier upwards\nTier is reviewed monthly based on turnover.",
      upgradeBonus: money(r, 3500),
      maxRebate: rebate,
      perks: "VIP manager, 3 gifts, Private Customer Service",
      pointConversionRate: `1,000 points = ${money(r, 10)}`,
      paymentFrequency: "Daily",
      withdrawalLimit: "Unlimited",
    },
  ];
}

function casinoReview(c, regs, payments) {
  const names = regs.map((r) => r.name).join(", ");
  return [
    `<p>${c.name} is known as one of the most dynamic online gambling sites in ${regs[0].name}. Founded in ${c.founded}, it offers a comprehensive gaming experience featuring live dealer games, slot machines, sports betting and lottery games for players in ${names}.</p>`,
    `<p>Partnering with game providers that spearheaded the industry - including ${c.providers.slice(0, 3).join(", ")} - ${c.name} is able to deliver an extraordinary gaming experience with high payouts and competitive odds.</p>`,
    `<h2>Banking</h2><p>Deposits are supported via ${payments.slice(0, 5).join(", ")} and more. Our tested payout speed was ${c.payout.replace("≤", "under")}, and local banking is ${c.bank.toLowerCase()}.</p>`,
    `<h2>Our Verdict</h2><p>${c.name} scores ${c.rating}/10 in our review with a Safe Index of ${c.safe}/100. ${c.risk === "low" ? "It is a low-risk choice backed by a solid licence and a clean complaint record." : "It is a reasonable option, but read the bonus terms carefully and complete KYC early."}</p>`,
  ].join("");
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});

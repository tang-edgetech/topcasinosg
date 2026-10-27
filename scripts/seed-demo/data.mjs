// Demo content. Casino brands are real names but every figure, bonus and
// review below is dummy data; blacklisted brands are fictional on purpose.

// code, name, demonym, currency, rate vs SGD (for scaling bonus amounts), sort
export const REGIONS = [
  { code: "th", name: "Thailand", demonym: "Thai", currency: "THB", rate: 26, sortOrder: 1, lang: "Thai" },
  { code: "my", name: "Malaysia", demonym: "Malaysian", currency: "MYR", rate: 3.5, sortOrder: 2, lang: "Malay" },
  { code: "sg", name: "Singapore", demonym: "Singaporean", currency: "SGD", rate: 1, sortOrder: 3, lang: "English" },
  { code: "id", name: "Indonesia", demonym: "Indonesian", currency: "IDR", rate: 11500, sortOrder: 4, lang: "Bahasa Indonesia" },
  { code: "vn", name: "Vietnam", demonym: "Vietnamese", currency: "VND", rate: 19000, sortOrder: 5, lang: "Vietnamese" },
  { code: "ph", name: "Philippines", demonym: "Filipino", currency: "PHP", rate: 42, sortOrder: 6, lang: "Filipino" },
];

export const LICENSES = [
  { name: "PAGCOR", color: "#1d4ed8", sub: "Philippines" },
  { name: "Malta Gaming Authority", color: "#b91c1c", sub: "MGA" },
  { name: "Curaçao eGaming", color: "#0e7490", sub: "Curaçao" },
  { name: "UK Gambling Commission", color: "#111827", sub: "UKGC" },
  { name: "Isle of Man GSC", color: "#7c3aed", sub: "Isle of Man" },
  { name: "Kahnawake Gaming Commission", color: "#047857", sub: "Canada" },
  { name: "Anjouan Gaming", color: "#c2410c", sub: "Comoros" },
];

// Acknowledgements strip on the homepage: testing labs and safer-gambling
// bodies. Logos are their official ones, downloaded from each url into
// assets/partners/, picking the dark-text version where a site's header uses
// a white one (Gambling Therapy only publishes white text, so it's left out).
export const PARTNERS = [
  { name: "eCOGRA", logo: "ecogra.png", url: "https://ecogra.org/" },
  { name: "iTech Labs", logo: "itech-labs.svg", url: "https://itechlabs.com/" },
  { name: "GLI", logo: "gli.jpg", url: "https://gaminglabs.com/" },
  { name: "GamCare", logo: "gamcare.svg", url: "https://www.gamcare.org.uk/" },
  { name: "GambleAware", logo: "gambleaware.png", url: "https://www.gambleaware.org/" },
];

export const PROVIDERS = [
  { name: "Evolution", color: "#111827" },
  { name: "Pragmatic Play", color: "#ea580c" },
  { name: "Playtech", color: "#1d4ed8" },
  { name: "Microgaming", color: "#0f766e" },
  { name: "JILI Games", color: "#b91c1c" },
  { name: "Evoplay", color: "#7c3aed" },
  { name: "CQ9 Gaming", color: "#ca8a04" },
  { name: "Dream Gaming", color: "#be185d" },
  { name: "TFGaming", color: "#0369a1" },
  { name: "PG Soft", color: "#4338ca" },
  { name: "Spadegaming", color: "#15803d" },
  { name: "Habanero", color: "#9a3412" },
];

// Payment methods are per region; casinos reference them by name, which is
// how the review page finds their icons.
const PM = {
  Visa: { color: "#1a1f71", kind: "card", desc: "Instant card deposits accepted by most licensed casinos; withdrawals usually return to the same card in 3-5 days." },
  Mastercard: { color: "#eb001b", kind: "card", desc: "Widely accepted debit and credit card deposits with 3-D Secure verification." },
  "American Express": { color: "#2e77bc", kind: "card", desc: "Premium card option at selected casinos; check the cashier as support varies." },
  PayPal: { color: "#003087", kind: "ewallet", desc: "Fast e-wallet deposits with buyer protection, available at internationally licensed sites." },
  "Bank Transfer": { color: "#334155", kind: "bank", desc: "Direct transfers from local banks - reliable for larger deposits and withdrawals." },
  USDT: { color: "#26a17b", kind: "crypto", desc: "Tether (USDT) stablecoin deposits on TRC20/ERC20 with low fees and near-instant confirmation." },
  Bitcoin: { color: "#f7931a", kind: "crypto", desc: "Bitcoin deposits and withdrawals for players who prefer pseudonymous, borderless payments." },
  ShopeePay: { color: "#ee4d2d", kind: "ewallet", desc: "Pay straight from your ShopeePay wallet balance at supported casinos." },
  GrabPay: { color: "#00b14f", kind: "ewallet", desc: "Top up with your GrabPay wallet for instant deposits from your phone." },
  PayNow: { color: "#7c1c8c", kind: "bank", desc: "Singapore's instant bank transfer by mobile number or UEN - deposits land in seconds." },
  NETS: { color: "#e2231a", kind: "card", desc: "Singapore's local debit network, supported by casinos with SGD cashiers." },
  "Touch 'n Go eWallet": { color: "#005abb", kind: "ewallet", desc: "Malaysia's most popular e-wallet for quick MYR deposits." },
  DuitNow: { color: "#ed1c24", kind: "bank", desc: "Malaysia's real-time transfer service using a phone number or account number." },
  FPX: { color: "#1f4e9c", kind: "bank", desc: "Online banking payments from all major Malaysian banks." },
  Boost: { color: "#ee2e24", kind: "ewallet", desc: "Malaysian e-wallet with cashback promos, accepted at selected casinos." },
  PromptPay: { color: "#003d79", kind: "bank", desc: "Thailand's instant transfer by phone or ID number, the fastest way to fund a THB account." },
  "TrueMoney Wallet": { color: "#f26722", kind: "ewallet", desc: "Popular Thai e-wallet for instant deposits from 7-Eleven top-ups or bank accounts." },
  "Rabbit LINE Pay": { color: "#00b900", kind: "ewallet", desc: "Thai mobile wallet linked to LINE, handy for small instant deposits." },
  OVO: { color: "#4c2a86", kind: "ewallet", desc: "Indonesian e-wallet with wide merchant support and instant IDR top-ups." },
  GoPay: { color: "#00aa13", kind: "ewallet", desc: "Gojek's e-wallet, one of Indonesia's most used payment apps." },
  DANA: { color: "#118eea", kind: "ewallet", desc: "Indonesian e-wallet for instant transfers from local bank accounts." },
  MoMo: { color: "#a50064", kind: "ewallet", desc: "Vietnam's leading e-wallet for instant VND deposits." },
  ZaloPay: { color: "#0068ff", kind: "ewallet", desc: "Vietnamese e-wallet linked to the Zalo messaging app." },
  ViettelPay: { color: "#ee0033", kind: "ewallet", desc: "Mobile money from Viettel, usable without a bank account." },
  GCash: { color: "#007dfe", kind: "ewallet", desc: "The Philippines' most popular e-wallet for instant PHP deposits." },
  Maya: { color: "#00a651", kind: "ewallet", desc: "Philippine digital bank and wallet with fast casino cash-ins." },
};

export const PAYMENT_METHOD_STYLES = PM;

export const REGION_PAYMENTS = {
  th: ["PromptPay", "TrueMoney Wallet", "Rabbit LINE Pay", "ShopeePay", "Bank Transfer", "Visa", "Mastercard", "USDT", "Bitcoin"],
  my: ["Touch 'n Go eWallet", "DuitNow", "FPX", "Boost", "GrabPay", "ShopeePay", "Visa", "Mastercard", "USDT"],
  sg: ["PayNow", "NETS", "GrabPay", "ShopeePay", "Visa", "Mastercard", "American Express", "PayPal", "Bank Transfer", "USDT"],
  id: ["OVO", "GoPay", "DANA", "ShopeePay", "Bank Transfer", "Visa", "Mastercard", "USDT"],
  vn: ["MoMo", "ZaloPay", "ViettelPay", "Bank Transfer", "Visa", "Mastercard", "USDT", "Bitcoin"],
  ph: ["GCash", "Maya", "GrabPay", "ShopeePay", "Visa", "Mastercard", "PayPal", "USDT"],
};

// Supported game types must come from the API's fixed taxonomy
// (api/internal/domain/casino.go: AllGameTypes).
const ALL_GAMES = ["slots", "blackjack", "baccarat", "roulette", "sic_bo", "craps", "poker", "video_poker", "bingo", "pai_gow", "keno"];

export const CASINOS = [
  { slug: "eu9", name: "EU9", color: "#1f1f1f", accent: "#e11d48", regions: ["my", "sg", "th", "vn", "ph"], rating: 9.6, safe: 92, risk: "low", payout: "≤ 1 min", rtp: 96, crypto: true, bank: "Instant", games: ["slots", "blackjack", "baccarat", "roulette", "sic_bo", "keno", "bingo", "video_poker"], providers: ["Evolution", "Pragmatic Play", "JILI Games", "PG Soft", "Dream Gaming", "Playtech", "Spadegaming", "CQ9 Gaming", "TFGaming", "Habanero"], licenses: ["PAGCOR", "Curaçao eGaming", "Malta Gaming Authority"], founded: 2019, tagline: "In Speed, We Trust" },
  { slug: "bk8", name: "BK8", color: "#d4a017", accent: "#111827", regions: ["my", "sg", "th", "id", "vn"], rating: 9.4, safe: 91, risk: "low", payout: "≤ 3 mins", rtp: 96.4, crypto: true, bank: "Instant", games: ["slots", "blackjack", "baccarat", "roulette", "sic_bo", "poker", "keno"], providers: ["Evolution", "Pragmatic Play", "Playtech", "Microgaming", "PG Soft", "Spadegaming", "TFGaming"], licenses: ["Curaçao eGaming", "Isle of Man GSC"], founded: 2014, tagline: "Asia's sports and live casino favourite" },
  { slug: "yes8", name: "Yes8", color: "#c2410c", accent: "#facc15", regions: ["my", "sg", "th"], rating: 9.2, safe: 90, risk: "low", payout: "≤ 5 mins", rtp: 96.1, crypto: false, bank: "Instant", games: ["slots", "baccarat", "roulette", "sic_bo", "blackjack", "keno"], providers: ["Pragmatic Play", "JILI Games", "Playtech", "Dream Gaming", "CQ9 Gaming", "Habanero"], licenses: ["PAGCOR", "Curaçao eGaming"], founded: 2016, tagline: "Big on slots and fishing games" },
  { slug: "77w", name: "77W", color: "#7c3aed", accent: "#f59e0b", regions: ["my", "sg"], rating: 9.2, safe: 88, risk: "low", payout: "≤ 5 mins", rtp: 95.9, crypto: true, bank: "Under 10 mins", games: ["slots", "baccarat", "roulette", "blackjack", "sic_bo", "poker"], providers: ["Evolution", "Pragmatic Play", "JILI Games", "Spadegaming", "TFGaming"], licenses: ["Curaçao eGaming"], founded: 2018, tagline: "Lucky sevens for Singapore and Malaysia" },
  { slug: "stake", name: "Stake", color: "#0f2a3d", accent: "#22c55e", regions: ["th", "id", "vn", "ph"], rating: 9.0, safe: 87, risk: "low", payout: "≤ 10 mins", rtp: 97, crypto: true, bank: "Crypto only", games: ["slots", "blackjack", "baccarat", "roulette", "poker", "video_poker", "keno", "craps", "bingo"], providers: ["Evolution", "Pragmatic Play", "Playtech", "Evoplay", "Habanero", "Microgaming"], licenses: ["Curaçao eGaming"], founded: 2017, tagline: "Crypto-first casino and sportsbook" },
  { slug: "gembet", name: "Gembet", color: "#047857", accent: "#fbbf24", regions: ["sg", "my"], rating: 9.0, safe: 86, risk: "low", payout: "≤ 10 mins", rtp: 95.8, crypto: false, bank: "Under 15 mins", games: ["slots", "baccarat", "roulette", "blackjack", "sic_bo"], providers: ["Evolution", "Pragmatic Play", "Playtech", "Dream Gaming", "JILI Games"], licenses: ["Curaçao eGaming", "Anjouan Gaming"], founded: 2020, tagline: "Gem-studded live tables" },
  { slug: "eclbet", name: "ECLBET", color: "#1e3a8a", accent: "#ef4444", regions: ["sg", "my"], rating: 8.8, safe: 85, risk: "low", payout: "≤ 15 mins", rtp: 95.6, crypto: false, bank: "Under 15 mins", games: ["slots", "baccarat", "roulette", "blackjack", "sic_bo", "keno"], providers: ["Evolution", "Pragmatic Play", "Microgaming", "TFGaming", "CQ9 Gaming"], licenses: ["Curaçao eGaming"], founded: 2018, tagline: "Esports and live casino in one wallet" },
  { slug: "1xbet", name: "1xBet", color: "#1d4f91", accent: "#38bdf8", regions: ["my", "th", "id", "vn", "ph"], rating: 8.8, safe: 82, risk: "medium", payout: "≤ 30 mins", rtp: 96.2, crypto: true, bank: "Under 1 hour", games: ALL_GAMES, providers: ["Evolution", "Pragmatic Play", "Playtech", "Microgaming", "Evoplay", "Habanero", "TFGaming", "JILI Games"], licenses: ["Curaçao eGaming"], founded: 2007, tagline: "The biggest market list around" },
  { slug: "maxim88", name: "Maxim88", color: "#9f1239", accent: "#fbbf24", regions: ["my", "sg", "th"], rating: 8.6, safe: 83, risk: "low", payout: "≤ 10 mins", rtp: 95.7, crypto: false, bank: "Under 10 mins", games: ["slots", "baccarat", "roulette", "blackjack", "sic_bo", "keno"], providers: ["Pragmatic Play", "Playtech", "Dream Gaming", "Spadegaming", "CQ9 Gaming"], licenses: ["PAGCOR"], founded: 2017, tagline: "Rebates on everything" },
  { slug: "20bet", name: "20Bet", color: "#0b3b5e", accent: "#84cc16", regions: ["th", "id", "vn", "ph"], rating: 8.6, safe: 80, risk: "medium", payout: "≤ 1 hour", rtp: 96, crypto: true, bank: "Under 1 hour", games: ["slots", "blackjack", "baccarat", "roulette", "poker", "video_poker", "craps"], providers: ["Evolution", "Pragmatic Play", "Evoplay", "Habanero", "Microgaming"], licenses: ["Curaçao eGaming"], founded: 2020, tagline: "Thousands of slots plus a full sportsbook" },
  { slug: "me88", name: "Me88", color: "#0e7490", accent: "#f97316", regions: ["my", "sg"], rating: 8.6, safe: 81, risk: "low", payout: "≤ 15 mins", rtp: 95.5, crypto: false, bank: "Under 15 mins", games: ["slots", "baccarat", "roulette", "blackjack", "sic_bo"], providers: ["Pragmatic Play", "JILI Games", "Playtech", "Spadegaming"], licenses: ["Curaçao eGaming"], founded: 2019, tagline: "Daily rescue bonuses" },
  { slug: "god55", name: "GOD55", color: "#854d0e", accent: "#fde047", regions: ["my", "sg"], rating: 8.4, safe: 79, risk: "medium", payout: "≤ 15 mins", rtp: 95.4, crypto: false, bank: "Under 30 mins", games: ["slots", "baccarat", "roulette", "sic_bo", "blackjack"], providers: ["Pragmatic Play", "JILI Games", "Dream Gaming", "CQ9 Gaming"], licenses: ["Anjouan Gaming"], founded: 2019, tagline: "Mythology-themed slots lobby" },
  { slug: "hfive5", name: "Hfive5", color: "#be123c", accent: "#22d3ee", regions: ["my", "sg", "th"], rating: 8.4, safe: 78, risk: "medium", payout: "≤ 30 mins", rtp: 95.3, crypto: false, bank: "Under 30 mins", games: ["slots", "baccarat", "roulette", "sic_bo", "keno"], providers: ["Pragmatic Play", "Playtech", "Spadegaming", "TFGaming"], licenses: ["Curaçao eGaming"], founded: 2016, tagline: "High-five for high rollers" },
  { slug: "96m", name: "96M", color: "#4338ca", accent: "#f472b6", regions: ["my", "sg"], rating: 8.2, safe: 76, risk: "medium", payout: "≤ 30 mins", rtp: 95.1, crypto: false, bank: "Under 30 mins", games: ["slots", "baccarat", "roulette", "blackjack"], providers: ["Pragmatic Play", "JILI Games", "Dream Gaming"], licenses: ["Curaçao eGaming"], founded: 2021, tagline: "Simple, mobile-first casino" },
  { slug: "live22", name: "Live22", color: "#065f46", accent: "#facc15", regions: ["my", "th", "id"], rating: 8.2, safe: 74, risk: "medium", payout: "≤ 1 hour", rtp: 95, crypto: false, bank: "Under 1 hour", games: ["slots", "baccarat", "roulette", "sic_bo", "bingo"], providers: ["JILI Games", "CQ9 Gaming", "Spadegaming"], licenses: ["Anjouan Gaming"], founded: 2015, tagline: "Arcade-style slots and fishing" },
];

export const BLACKLIST = [
  { name: "LuckySpin88", rating: 1.6, region: "sg", reasons: ["Payment Issues", "No Licensing", "Rigged Games"], reason: "Withheld winnings, unlicensed" },
  { name: "Royal Dragon Club", rating: 1.4, region: "my", reasons: ["Payment Issues", "Fake License", "Account Closures"], reason: "Fake licence, closes winning accounts" },
  { name: "GoldenWin Asia", rating: 1.9, region: "th", reasons: ["Delayed Withdrawals", "Hidden Terms"], reason: "Withdrawals delayed for weeks" },
  { name: "MegaBet777", rating: 1.2, region: null, reasons: ["Rigged Games", "No Licensing", "Fake Reviews"], reason: "Fake licensing, rigged games" },
  { name: "Jackpot Kingdom", rating: 2.1, region: "sg", reasons: ["Hidden Terms", "Bonus Abuse Accusations"], reason: "Voids winnings with hidden bonus terms" },
  { name: "Fortune Palace 99", rating: 1.5, region: "my", reasons: ["Payment Issues", "No Customer Support"], reason: "No support once a withdrawal is requested" },
  { name: "SpinStar Club", rating: 1.8, region: "th", reasons: ["Rigged Games", "Delayed Withdrawals"], reason: "Unverified RNG, slow payouts" },
  { name: "AsiaBet Pro", rating: 1.3, region: "id", reasons: ["No Licensing", "Data Misuse"], reason: "Unlicensed, sells player data" },
  { name: "Lucky Tiger 168", rating: 2.0, region: "vn", reasons: ["Payment Issues", "Hidden Terms"], reason: "Caps withdrawals far below advertised" },
  { name: "Win4Sure Casino", rating: 1.1, region: "ph", reasons: ["Fake License", "Rigged Games", "Payment Issues"], reason: "Forged PAGCOR seal, refuses payouts" },
  { name: "Neon Jackpot", rating: 2.3, region: null, reasons: ["Unrealistic Bonuses", "Delayed Withdrawals"], reason: "1000% bonuses with impossible turnover" },
  { name: "Red Lantern Bet", rating: 1.7, region: "my", reasons: ["No Licensing", "Account Closures"], reason: "Closes accounts after big wins" },
];

// RTP tracker games (slot / table / live) with their providers.
export const GAMES = [
  { name: "Wisdom of Athena", provider: "Pragmatic Play", category: "slot", rtp: 96.07 },
  { name: "Gates of Olympus", provider: "Pragmatic Play", category: "slot", rtp: 96.5 },
  { name: "Sweet Bonanza", provider: "Pragmatic Play", category: "slot", rtp: 96.48 },
  { name: "Mahjong Ways 2", provider: "PG Soft", category: "slot", rtp: 96.95 },
  { name: "Fortune Gems", provider: "JILI Games", category: "slot", rtp: 97 },
  { name: "Super Ace", provider: "JILI Games", category: "slot", rtp: 97 },
  { name: "Immortal Romance", provider: "Microgaming", category: "slot", rtp: 96.86 },
  { name: "Age of the Gods", provider: "Playtech", category: "slot", rtp: 95.02 },
  { name: "Elven Princess", provider: "Evoplay", category: "slot", rtp: 96.1 },
  { name: "Jump High", provider: "CQ9 Gaming", category: "slot", rtp: 96.4 },
  { name: "Hot Hot Fruit", provider: "Habanero", category: "slot", rtp: 96.7 },
  { name: "Gold Panther", provider: "Spadegaming", category: "slot", rtp: 96.2 },
  { name: "Blackjack Classic", provider: "Evolution", category: "table", rtp: 99.5 },
  { name: "European Roulette", provider: "Playtech", category: "table", rtp: 97.3 },
  { name: "Punto Banco", provider: "Microgaming", category: "table", rtp: 98.76 },
  { name: "Sic Bo Deluxe", provider: "Evoplay", category: "table", rtp: 97.22 },
  { name: "Lightning Roulette", provider: "Evolution", category: "live", rtp: 97.3 },
  { name: "Speed Baccarat", provider: "Evolution", category: "live", rtp: 98.94 },
  { name: "Dragon Tiger", provider: "Dream Gaming", category: "live", rtp: 96.27 },
  { name: "Crazy Time", provider: "Evolution", category: "live", rtp: 96.08 },
];

const p = (...paras) => paras.map((x) => (x.startsWith("<") ? x : `<p>${x}</p>`)).join("");
const ul = (...items) => `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

// kind: "strategy" | "howto" (homepage carousels pick by kind); region: code or null.
export const GUIDES = [
  { slug: "how-to-pick-the-right-online-casino", kind: "strategy", title: "How to Pick the Right Online Casino", excerpt: "Learn how to identify safe sites before you deposit a single dollar.", body: p("Choosing a casino is the most important bet you will make. A great bonus means nothing if the site won't pay you.", "<h2>Check the licence first</h2>", "Scroll to the footer and click the licence seal. A real seal opens the regulator's register, not a static image.", "<h2>Test the cashier</h2>", "Look for local payment methods, clear withdrawal limits and processing times written down in the terms.", "<h2>Read real player feedback</h2>", "Search the casino's name with 'withdrawal' and 'complaint'. One bad review is noise; a pattern is a warning.", ul("Valid, verifiable licence", "Local currency and payment methods", "Published RTPs and audited RNG", "Responsive 24/7 support")) },
  { slug: "understanding-wagering-requirements", kind: "strategy", title: "Understanding Wagering Requirements", excerpt: "What 30x really means and how to work out if a bonus is worth claiming.", body: p("A wagering (turnover) requirement is the amount you must bet before bonus money becomes withdrawable.", "<h2>Bonus vs. deposit + bonus</h2>", "30x the bonus on a 100 bonus is 3,000 in bets. 30x deposit + bonus on 100 + 100 is 6,000 - twice as much.", "<h2>Game contribution</h2>", "Slots usually count 100%, table games 10-20% and live casino often 0%. Always check the table in the terms.", "Use our bonus calculator to see the real total bet amount before you opt in.") },
  { slug: "bankroll-management-101", kind: "strategy", title: "Bankroll Management 101", excerpt: "Simple rules that keep you playing longer and losing less.", body: p("Bankroll management is deciding in advance how much you can afford to lose and how you will split it.", ul("Set a session budget and never top it up mid-session", "Bet 1-2% of your bankroll per spin or hand", "Set a win goal and walk away when you hit it", "Never chase losses"), "Most casinos let you set deposit and loss limits in your account settings - use them.") },
  { slug: "how-to-spot-a-rogue-casino", kind: "strategy", title: "How to Spot a Rogue Casino", excerpt: "Seven red flags that a casino will not pay you.", body: p("Rogue casinos share the same warning signs. Spot them early and you will never need to chase a withdrawal.", ul("Bonuses above 300% with no clear terms", "Licence seals that don't link anywhere", "Withdrawal limits hidden in the T&Cs", "Support that disappears after you win", "Copied game lobbies with no provider names", "Pressure to deposit via personal bank accounts", "Fake reviews posted the same week"), "Check our blacklist before you sign up anywhere new.") },
  { slug: "how-to-play-blackjack", kind: "howto", title: "How to Play Blackjack: Rules & Basic Strategy", excerpt: "Beat the dealer with the lowest house edge in the casino.", body: p("Blackjack is a race to 21 against the dealer. Cards 2-10 count face value, picture cards are 10 and aces are 1 or 11.", "<h2>Basic strategy</h2>", ul("Always split aces and eights", "Never split tens or fives", "Double down on 11 against any dealer card except an ace", "Stand on hard 17 and above"), "With perfect basic strategy the house edge drops to around 0.5%.") },
  { slug: "baccarat-rules-and-strategy", kind: "howto", title: "Baccarat Rules & Winning Strategy", excerpt: "Banker, Player or Tie? Here's where the edge really is.", body: p("Baccarat asks one question: will the Banker or the Player hand finish closer to 9?", "<h2>Which bet is best?</h2>", "The Banker bet has the lowest house edge (about 1.06%) even after the 5% commission. The Tie bet pays 8:1 but carries a 14% edge - skip it.", "Speed Baccarat and Squeeze variants use the same rules with a different pace.") },
  { slug: "roulette-betting-guide", kind: "howto", title: "Roulette Betting Guide for Beginners", excerpt: "Inside vs. outside bets and why European beats American.", body: p("Roulette is pure chance, but the wheel you pick matters.", "European roulette has one zero (2.7% edge). American roulette adds a double zero (5.26% edge). Always choose European or French tables.", "<h2>Bet types</h2>", ul("Outside bets (red/black, odd/even) pay 1:1 with ~48.6% chance", "Dozens and columns pay 2:1", "Straight-up numbers pay 35:1")) },
  { slug: "sic-bo-for-beginners", kind: "howto", title: "Sic Bo for Beginners", excerpt: "The classic three-dice game explained in five minutes.", body: p("Sic Bo is played with three dice. You bet on the totals, combinations or specific numbers that will appear.", "Big (11-17) and Small (4-10) are the simplest bets, paying 1:1 with a 2.78% house edge. Triples pay big but are long shots.") },
  { slug: "slots-rtp-and-volatility-explained", kind: "howto", title: "Slots: RTP & Volatility Explained", excerpt: "Pick slots that match your budget and play style.", body: p("RTP (return to player) is the long-run percentage a slot pays back. Volatility describes how that money is paid - many small wins or rare big ones.", ul("Low volatility: frequent small wins, good for long sessions", "High volatility: rare big wins, needs a bigger bankroll", "Look for 96%+ RTP where possible"), "See our RTP tracker for the highest RTP slots this week.") },
  { slug: "online-poker-basics", kind: "howto", title: "Online Poker Basics: Texas Hold'em", excerpt: "Hand rankings, positions and your first winning habits.", body: p("In Texas Hold'em each player gets two hole cards and shares five community cards. Make the best five-card hand.", "Play fewer, stronger hands - especially from early position - and be aggressive when you do play.") },
  { slug: "sports-betting-odds-explained", kind: "howto", title: "Sports Betting Odds Explained", excerpt: "Decimal, Asian handicap and over/under in plain English.", body: p("Decimal odds show your total return per 1 staked: 2.50 returns 2.50 (1.50 profit).", "Asian handicap removes the draw by giving one team a goal head start, which is why it is so popular across Southeast Asia.") },
  { slug: "fishing-games-guide", kind: "howto", title: "Fishing Games: How They Work", excerpt: "Arcade shooting games with real-money payouts.", body: p("Fishing games are arcade-style: you fire at fish swimming across the screen, and each catch pays a multiplier of your shot value.", "Bigger fish pay more but take more shots. Upgrade your cannon only when your bankroll allows.") },
  { slug: "horse-racing-betting-basics", kind: "howto", title: "Horse Racing Betting Basics", excerpt: "Win, place, each-way and exotic bets explained.", body: p("A win bet needs your horse to finish first. A place bet pays if it finishes in the top two or three. Each-way is both at once.", "Study recent form, the going (track condition) and the jockey before you bet.") },
  { slug: "is-online-gambling-legal-in-singapore", kind: "region", region: "sg", title: "Is Online Gambling Legal in Singapore?", excerpt: "What the Gambling Control Act means for players.", body: p("Singapore's Gambling Control Act 2022 only allows licensed operators such as Singapore Pools to offer remote gambling locally.", "Play responsibly and never use a casino that hides its licence.") },
  { slug: "online-casino-guide-malaysia", kind: "region", region: "my", title: "Online Casino Guide for Malaysian Players", excerpt: "MYR banking, local e-wallets and what to look for.", body: p("Malaysian players should look for MYR wallets, Touch 'n Go and DuitNow deposits, and fast local bank withdrawals.") },
  { slug: "online-casino-guide-thailand", kind: "region", region: "th", title: "Online Casino Guide for Thai Players", excerpt: "PromptPay, THB tables and Thai-language support.", body: p("Thai players get the best experience at casinos with THB accounts, PromptPay deposits and Thai-speaking support.") },
];

export const NEWS = [
  { slug: "live-casino-trends-southeast-asia", title: "Live Casino Trends Taking Over Southeast Asia", excerpt: "Game shows and speed tables lead the growth in 2026.", body: p("Live game shows and faster baccarat variants are now the most played live tables across the region, according to operator data.", "Mobile play accounts for over 80% of live sessions.") },
  { slug: "new-crypto-cashiers-launch", title: "More Casinos Add USDT Cashiers", excerpt: "Stablecoin deposits are now offered by most of our top-rated sites.", body: p("USDT on TRC20 has become the default crypto option thanks to low fees and fast confirmation.") },
  { slug: "responsible-gambling-tools-upgrade", title: "Casinos Roll Out New Responsible Gambling Tools", excerpt: "Reality checks, loss limits and cool-off periods get easier to find.", body: p("Several operators now show session timers and loss limits directly in the game lobby.") },
  { slug: "pragmatic-play-new-releases", title: "Pragmatic Play Unveils This Month's Slot Releases", excerpt: "Three new titles with RTPs above 96%.", body: p("The new releases include a cluster-pays slot and two Megaways titles, all launching with 96%+ RTP settings.") },
  { slug: "blacklist-update", title: "Blacklist Update: Four New Rogue Sites Flagged", excerpt: "Players report unpaid withdrawals and forged licence seals.", body: p("Our team verified complaints against four new sites this month. All have been added to the blacklist.") },
  { slug: "asian-handicap-guide-world-football", title: "Asian Handicap Betting Surges for Football Season", excerpt: "Why handicap markets dominate in the region.", body: p("Asian handicap markets made up the majority of football bets placed at the region's top sportsbooks this season.") },
  { slug: "mobile-casino-apps-2026", title: "Best Mobile Casino Experiences in 2026", excerpt: "Progressive web apps replace downloads at top casinos.", body: p("Most leading casinos now offer installable web apps rather than APKs, improving security for Android players.") },
  { slug: "rtp-transparency-push", title: "Providers Push for RTP Transparency", excerpt: "More studios now publish RTP in the game info screen.", body: p("Leading studios have committed to showing each game's configured RTP in the in-game help, so players can check what they are playing.") },
];

export const TEAM = [
  { name: "Sharon Cho", initials: "SC", title: "Head of Reviews", quote: "If a casino won't pay, it doesn't matter how good the bonus looks." },
  { name: "Marcus Tan", initials: "MT", title: "Payments Analyst", quote: "I test every deposit and withdrawal with real money." },
  { name: "Aisha Rahman", initials: "AR", title: "Bonus & Terms Specialist", quote: "I read the T&Cs so you don't have to." },
  { name: "Daniel Wong", initials: "DW", title: "Former Casino Floor Manager", quote: "I know which shortcuts operators take." },
];

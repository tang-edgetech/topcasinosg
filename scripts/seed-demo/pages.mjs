// Page layouts for the pages the migrations only patch (they were originally
// built in the admin): Homepage, each region's home and payment-methods page,
// and the calculator's introduction (0056_calculator_figma_rebuild.sql
// fills in the rest of /calculator).
import { section, rt, img, btn } from "./lib.mjs";

const faq = (heading, qa, opts) =>
  section("faq", { heading, bgType: "none" }, qa.map(([question, answer]) => ({ question, answer: rt(`<p>${answer}</p>`) })), opts);

// ---------------- Homepage (Figma "D / Home") ----------------

export function homeSections(m) {
  return [
    section("hero", {
      heading: "Best Online Casino Reviews You Can Trust in {year}",
      subheading: "At Top Casino, we're here to help you find safe, reliable, and rewarding online casinos.",
      image: img(m.heroArt),
      button: btn("", ""),
      buttonStyle: "primary",
      bgType: "gradient",
      bgFrom: "primary-900",
      bgTo: "primary-glow",
    }),
    section("rich_text", {
      heading: "Why Trust Our Casino Reviews?",
      body: rt("<p>When it comes to online gambling, trust is everything. That's why our casino reviews are data-driven, unbiased, and based on real player experiences.</p>"),
      bgType: "none",
      align: "left",
    }),
    section(
      "icon_box_group",
      {
        heading: "Our Review Process",
        displayMode: "expandable",
        layout: "vertical",
        columns: "4",
        colorNormal: "primary",
        colorHover: "secondary",
        colorActive: "primary",
        body: rt("<p>We test every casino for licensing, games, payouts, bonuses, and support.</p>"),
        headingAlignMobile: "left",
        headingAlignDesktop: "left",
        bgType: "none",
      },
      [
        ["shield", "License, Safety & Fair Play", "We verify each casino's licence with the regulator and check that games are certified by independent testing labs."],
        ["money", "Real Money Transactions", "We deposit and withdraw real money to measure payout speed, fees and limits for ourselves."],
        ["dice", "Game Quality & Variety", "From top game providers to mobile-friendly slots and live dealer tables, we check what you can actually play."],
        ["phone", "Mobile & Player Experience", "We play on iOS and Android to test load times, navigation and account verification."],
        ["gift", "Honest Bonus Breakdown", "We read the fine print - wagering, max cashout and game weighting - so you know a bonus's real value."],
        ["headset", "Real Support Test", "We contact customer support at different hours to test response times and how helpful the answers are."],
        ["chat", "Transparency & Player Feedback", "We track player complaints and how fairly each casino resolves them."],
        ["star", "Ongoing Re-Testing", "Ratings are re-checked every quarter, and immediately when players report problems."],
      ].map(([i, heading, text]) => ({ icon: img(m.icons[i]), heading, text: rt(`<p>${text}</p>`) })),
    ),
    section(
      "team_grid",
      { heading: "Expert Team Behind the Reviews", intro: "Our team includes veteran gamblers, ex-casino employees, and analysts.", bgType: "none" },
      m.team.map((t) => ({ photo: img(t.mediaId), name: t.name, title: t.title, quote: t.quote })),
    ),
    section("top_casinos_by_region", { heading: "Top Rated Casino of the Month by Country", mode: "auto", moreCount: "3", regionCode: "", bgType: "none" }),
    section("container", { bgType: "gradient", bgFrom: "primary-900", bgTo: "danger", bgImage: img(null), layout: "stack" }),
    section(
      "title_set",
      {
        heading: "Blacklisted Casinos to Avoid",
        highlightText: "Avoid",
        text: "We expose rogue casinos that delay withdrawals or scam users. Check the blacklist before you deposit.",
        headingSize: "large",
        align: "left",
        textTone: "light",
        bgType: "none",
      },
      [],
      { inContainer: true },
    ),
    section(
      "blacklist_preview",
      { heading: "What Makes a Casino Get Blacklisted?", headingSize: "small", subheading: "", limit: "6", seeAllUrl: "/blacklist", regionCode: "", bgType: "none" },
      [],
      { inContainer: true },
    ),
    section("content_carousel", { heading: "Casino Guides Winning Strategies", intro: "How to Pick the Right Casino: Learn how to identify safe sites.", sourceType: "guides", mode: "manual", limit: "8", seeAllUrl: "/guides", bgType: "none" }, m.strategyGuides.map((slug) => ({ slug }))),
    section("content_carousel", { heading: "How to play", intro: "Popular Games & How to Win: Blackjack, slots, baccarat tips.", sourceType: "guides", mode: "manual", limit: "8", seeAllUrl: "/guides", bgType: "none" }, m.howtoGuides.map((slug) => ({ slug }))),
    section("content_carousel", { heading: "Latest Casino News & Updates", intro: "Fresh news on bonuses, new casinos, payments and regulation across Southeast Asia.", sourceType: "news", mode: "auto", limit: "8", seeAllUrl: "/news", bgType: "none" }),
    section("region_explorer", { heading: "Explore Online Casinos by Region", bgType: "none" }),
    section(
      "logo_strip",
      { heading: "Acknowledgements", intro: "We're honoured to have been featured in or recognised by reputable publications and industry bodies.", bgType: "none" },
      m.partners.map((p) => ({ logo: img(p.mediaId), name: p.name, url: p.url })),
    ),
    section(
      "stats_counter",
      { heading: "Our Track Record", bgType: "color", bgFrom: "surface-muted", bgTo: "surface-muted" },
      [
        { prefix: "", number: "", suffix: "+", title: "Casinos Reviewed", content: "", source: "casinos" },
        { prefix: "", number: "10000", suffix: "+", title: "Players Helped", content: "", source: "" },
        { prefix: "", number: "", suffix: "", title: "Blacklisted Casinos Flagged", content: "", source: "blacklist" },
        { prefix: "", number: "", suffix: "", title: "Countries Covered", content: "", source: "regions" },
        { prefix: "", number: "", suffix: "+", title: "Guides Published", content: "", source: "guides" },
      ],
    ),
    section(
      "rich_text",
      {
        heading: "Responsible Gaming",
        body: rt(
          "<p>At Top Casino, we believe that online gaming should always be fun, safe, and in control. While we highlight the best casinos and trusted operators, we also encourage all players to approach gambling responsibly.</p><p>Whether you're a beginner or a seasoned player, it's important to set limits, manage your bankroll wisely, and recognise the signs of problem gambling. If you ever feel that gambling is affecting your life, help is always available.</p><p>Learn more on how to protect yourself and play smart by visiting our <a href=\"/responsible-gambling\">Responsible Gambling</a> page.</p>",
        ),
        image: img(m.safeArt),
        bgType: "color",
        bgFrom: "surface-muted",
        bgTo: "surface-muted",
      },
      [],
      { customClass: "section--content-960" },
    ),
    faq(
      "FAQs",
      [
        ["How are the payout turnaround times?", "Our top-rated casinos pay e-wallet and crypto withdrawals in under an hour and bank transfers within one business day. We list each casino's tested payout speed on its review."],
        ["Are all online casinos safe and legit?", "No. Only play at casinos with a verifiable licence, audited games and a clean complaint record - and check our blacklist before signing up."],
        ["What can I do if I encounter issues with withdrawal?", "Contact live chat first and keep screenshots. If the casino doesn't resolve it, report it to us and to the casino's licensing authority."],
        ["Do all online casinos offer a welcome bonus?", "Most do, but the value varies a lot. Compare the wagering requirement and max cashout, not just the headline percentage."],
        ["How do I start playing online?", "Pick a casino from our ranked lists, register, verify your account, make a deposit with a local payment method and claim the welcome offer if it suits you."],
      ],
      { customClass: "section--content-960" },
    ),
    section("rich_text", {
      heading: "Final Words",
      body: rt("<p>Our goal is to help you play smart, win more, and avoid scams. Start exploring the best casinos now.</p>"),
      bgType: "none",
      align: "center",
    }),
  ];
}

// ---------------- Region home (Figma "D / Country / TH / Home") ----------------

const LOCAL = {
  th: { banks: "Kasikorn Bank, Siam Commercial Bank (SCB), Bangkok Bank, Krungthai Bank", wallets: "TrueMoney Wallet, PromptPay, Rabbit LINE Pay, ShopeePay", mobile: "PromptPay QR, TrueMoney top-ups at 7-Eleven" },
  my: { banks: "Maybank, CIMB, Public Bank, RHB, Hong Leong Bank", wallets: "Touch 'n Go eWallet, Boost, GrabPay, ShopeePay", mobile: "DuitNow QR, FPX online banking" },
  sg: { banks: "DBS/POSB, OCBC, UOB, Standard Chartered", wallets: "GrabPay, ShopeePay, PayPal", mobile: "PayNow QR, NETS" },
  id: { banks: "BCA, Mandiri, BNI, BRI", wallets: "OVO, GoPay, DANA, ShopeePay", mobile: "QRIS payments, OVO and GoPay top-ups" },
  vn: { banks: "Vietcombank, Techcombank, BIDV, VietinBank", wallets: "MoMo, ZaloPay, ViettelPay", mobile: "VietQR bank transfers, MoMo QR" },
  ph: { banks: "BDO, BPI, Metrobank, UnionBank", wallets: "GCash, Maya, GrabPay, ShopeePay", mobile: "InstaPay and PESONet transfers, GCash QR" },
};

export function regionHomeSections(r, m) {
  const { name, demonym: adj, currency: cur, code } = r;
  const local = LOCAL[code];
  const cards = (list) => list.map(([i, title, text]) => ({ icon: img(m.icons[i]), title, text }));
  return [
    section("introduction_section", {
      heading: `Online Casinos in ${name} {year}`,
      highlightText: `${name} {year}`,
      subheading: "Real Money & Real Players",
      paragraph: rt(
        `<p>Looking for the most trusted online casinos in ${name}? You've come to the right place. Our team of experts has evaluated and ranked the top online casino sites for ${adj} players in {year} - focusing on security, fast withdrawals, mobile compatibility, and generous bonuses. Whether you're into slots, live dealers, or sports betting, find your perfect platform below and start winning today!</p>`,
      ),
      bgFrom: "primary-900",
      bgTo: "primary-glow",
    }),
    section("highlight_panel", {
      headingLine1: `How We Review ${adj} Online Casinos`,
      headingLine1Color: "primary",
      intro: rt("<p>We don't just look at flashy bonuses. We dive deep into finding out which sites are legit, and which ones could cost you your money.</p>"),
      box1Heading: "Our Online Casino Testing Methodology",
      box1Body: rt("<p>Each casino is evaluated based on:</p><ul><li>Licensing &amp; regulation</li><li>Bonus fairness and wagering terms</li><li>Game variety and RTP</li><li>Withdrawal speeds and banking options</li><li>Support responsiveness</li></ul>"),
      box2Heading: `${adj}-Focused Criteria & Player Experience`,
      box2Body: rt(`<p>We prioritize casinos that:</p><ul><li>Support ${cur}</li><li>Offer ${r.lang}-language interfaces</li><li>Accept local e-wallets and bank transfers</li><li>Have a good reputation among ${adj} players</li></ul>`),
      bgType: "none",
    }),
    section("top_bonus_picks", {
      heading: `Most Popular Online Casinos Among ${adj} Players`,
      intro: rt(`<p>Explore the top online casino sites trusted by ${adj} players in {year}. These platforms are known for their high payouts, local payment options, and thrilling game selection.</p>`),
      regionCode: code,
      bonusType: "welcome",
      limit: "3",
      bgType: "none",
    }),
    section(
      "event_highlights",
      { heading: "Event Highlights", intro: "Don't miss out the chance to participate in upcoming events!", bgType: "none" },
      m.events.map((e) => ({ image: img(e.mediaId), title: e.title, dateRange: e.dateRange, button: btn("Visit Site", ""), casinoId: String(e.casinoId) })),
    ),
    section(
      "data_table",
      {
        heading: `Comparison of ${name} Online Casino Ratings`,
        intro: rt(`<p>Compare top online casinos in ${name} side by side. Our Casino Ratings Comparison Table lets you assess each platform on the key performance metrics that matter most to ${adj} players: bonuses, RTP, crypto payments, local banking and payout speed.</p>`),
        source: "casinos",
        regionCode: code,
        limit: "5",
        columnsMode: "custom",
        moreInfo: "no",
      },
      [{ column: "topBonus" }, { column: "rtp" }, { column: "crypto" }, { column: "localBanking" }, { column: "payoutSpeed" }, { column: "rating" }],
      { customClass: "section--tinted" },
    ),
    section(
      "expandable_card_grid",
      {
        heading: `${name} Online Casino Bonuses You Can Claim`,
        tagline: `Claim top-rated promotions designed for ${adj} players - maximize your winnings from the start.`,
        intro: rt(`<p>Bonuses are the gateway to better value and extended gameplay, especially for players in ${name}. Whether you're new to online casinos or a returning member, leveraging the different types of bonuses can help you choose the right offer for your gaming style.</p>`),
        outro: rt(`<p>Explore and discover all promotions at <a href="/${code}/bonuses">Best Online Casino Bonuses in ${name}</a> and claim yours now!</p>`),
        bgType: "none",
      },
      cards([
        ["gift", "No Deposit Bonus", "Start playing without depositing a single baht, ringgit or dollar. Perfect for testing a new casino risk-free."],
        ["star", "Free Spins", "Spin the reels on popular slots like Sweet Bonanza and Gates of Olympus without touching your balance."],
        ["coin", "Welcome Bonus", `Designed for first-time depositors, these bonuses often match 100% or more of your first ${cur} deposit.`],
        ["money", "Reload Bonus", "Loyal players don't get left behind. Reload bonuses top up your later deposits every week."],
        ["chart", "Cashback", "Playing doesn't always go your way. Cashback gives you a percentage of net losses back."],
      ]),
    ),
    section(
      "expandable_card_grid",
      {
        heading: `Trusted Payment Methods for ${adj} Players`,
        tagline: "We highlight only reliable, secure, and casino-approved methods - so you can fund your account with peace of mind.",
        intro: rt(`<p>Today, everyone wants fast deposits, fast cashouts, and full confidence in their platform. Here's a brief overview of the most popular methods among casino players in ${name}:</p>`),
        outro: rt(`<p>You can compare all supported payment options, fees, and processing times on our <a href="/${code}/payment-methods">${name} payment methods</a> page.</p>`),
        bgType: "none",
      },
      cards([
        ["phone", "E-Wallets", `${local.wallets} - instant deposits straight from your phone.`],
        ["bank", `${adj} Bank Transfers`, `Compatible with leading banks such as ${local.banks}.`],
        ["coin", "Cryptocurrency", "BTC, ETH and USDT for private, fast deposits and withdrawals with low fees."],
      ]),
    ),
    section(
      "expandable_card_grid",
      {
        heading: "Game Strategy & Winning Tips",
        tagline: "Winning isn't just luck - it's smart play, informed choices, and local know-how.",
        intro: rt(`<p>If you're the one who wants to succeed consistently at online casinos, you need to follow proven strategies, understand game mechanics and manage your bankroll wisely. Here's a quick look at what smart players in ${name} focus on:</p>`),
        bgType: "none",
      },
      cards([
        ["target", "Choose High-RTP Games", "Games like Blackjack, Baccarat and high-RTP slots (96%+) give you the best long-term odds."],
        ["money", "Budget Like a Pro", "Set limits, track your spending and never chase losses - your bankroll is your best friend."],
        ["book", "Learn Localized Strategies", `${adj} players often benefit from guides tailored to the games and promos popular locally.`],
        ["dice", "Learn Game Mechanics", "Before playing, understand how each game works - payouts, house edge and betting options."],
        ["chart", "Improve with Step-by-Step Guides", "From basic rules to advanced betting systems, our guides help you level up."],
      ]),
    ),
    section(
      "expandable_card_grid",
      {
        heading: "RTP & Bonus Trackers With Real-Time Insights",
        tagline: `Play smarter with up-to-date data on payout rates and active bonuses - just for ${adj} players.`,
        intro: rt("<p>To make the most of your time and money at online casinos, it's crucial to know where the best odds and bonuses are right now. That's where our real-time tools come in.</p>"),
        outro: rt(`<p>See the full <a href="/${code}/rtp">${name} RTP &amp; live bonus tracker</a>.</p>`),
        bgType: "none",
      },
      cards([
        ["chart", "Weekly RTP Updates", "Stay informed with a regularly updated list of games offering the highest return to player."],
        ["bolt", "Live Bonus Tracker", "Find out which casinos are currently offering the biggest bonuses and free spins."],
        ["star", "Smart Play Recommendations", "See which games and casinos are performing best this week, based on our data."],
      ]),
    ),
    section(
      "review_columns",
      { heading: `Real Reviews from ${adj} Players`, positiveLabel: "Positive Feedback Highlights", complaintLabel: "Common Complaints & How They Were Resolved", bgType: "color", bgFrom: "surface-muted", bgTo: "surface-muted" },
      [
        ["positive", "Nitti M.", "2 days ago", `I've cashed out a few times now and it's always hit my bank within the hour. Great to finally find a site that takes ${adj} players seriously.`],
        ["positive", "Kevin L.", "1 week ago", `Deposit with local e-wallet is instant and the ${cur} tables are always open. Support replied in under a minute.`],
        ["positive", "Siti A.", "2 weeks ago", "Free spins were credited straight away and the wagering was exactly as advertised. No hidden surprises."],
        ["positive", "Jason T.", "3 weeks ago", "The mobile site is smooth even on my old phone. Live baccarat never lags."],
        ["complaint", "Arun P.", "4 days ago", "My first withdrawal was held for verification. After uploading my ID it was paid the same day - just do KYC early."],
        ["complaint", "Mei Ling", "1 month ago", "Bonus wasn't added automatically. Live chat added it manually within 10 minutes after I sent the promo code."],
      ].map(([column, name, timeAgo, quote]) => ({ column, name, timeAgo, quote, avatar: img(null) })),
    ),
    section("blacklist_preview", {
      heading: `Avoid These Online Casinos in ${name}`,
      highlightText: "Avoid",
      subheading: `Problems such as delays in payouts, biased bonuses, or lack of proper licenses have been reported at these casinos. We suggest ${adj} players avoid using such websites so that they do not end up compromising money or gameplay in these blacklisted casinos.`,
      limit: "6",
      seeAllUrl: `/${code}/blacklist`,
      regionCode: code,
      bgType: "gradient",
      bgFrom: "primary-900",
      bgTo: "danger",
    }),
    faq("FAQs", [
      [`Are online casinos legal in ${name}?`, `Online gambling laws in ${name} are strict and enforcement varies. Many ${adj} players use internationally licensed offshore casinos; always check the licence and play responsibly.`],
      [`How do ${adj} players withdraw money safely?`, `Use a verified account and a local method you deposited with - ${local.wallets.split(",")[0]} or bank transfer are usually fastest.`],
      [`Which ${adj} payment method is fastest?`, `E-wallets and ${local.mobile.split(",")[0]} are typically instant for deposits and under an hour for withdrawals.`],
      [`Can I play in ${cur}?`, `Yes - every casino on our ${name} list supports ${cur} accounts, so you avoid conversion fees.`],
      ["Can I play on mobile?", "All recommended casinos work in your phone's browser, and most offer an installable app."],
    ]),
    section(
      "cta_link_list",
      { heading: `Ready to Win? Start Playing Smart in ${adj} Casinos`, intro: rt("<p>Play with confidence using our trusted reviews and tools.</p>"), bgType: "none" },
      [
        [`Explore ${name} Online Casinos`, `/${code}/reviews`],
        ["Explore The Bonuses", `/${code}/bonuses`],
        ["Explore RTP", `/${code}/rtp`],
        [`Avoid These ${name} Casinos`, `/${code}/blacklist`],
      ].map(([label, url]) => ({ label, url })),
    ),
  ];
}

// ---------------- Region payment methods (Figma "D / Country / TH / Payment Method") ----------------

export function paymentSections(r, m) {
  const { name, demonym: adj, currency: cur, code } = r;
  const local = LOCAL[code];
  const steps = (list) => list.map(([title, body]) => ({ title, body: rt(body) }));
  const li = (...x) => `<ul>${x.map((i) => `<li>${i}</li>`).join("")}</ul>`;
  return [
    section("introduction_section", {
      heading: `Online Casino Payment Methods in ${name}`,
      highlightText: name,
      subheading: "Secure Deposit & Withdrawal",
      paragraph: rt(`<p>When it comes to online gambling, having secure, fast, and convenient payment options is just as important as choosing the right casino. This guide walks through the top payment methods available to players in ${name}, helping you deposit and withdraw with confidence.</p>`),
      bgFrom: "primary-900",
      bgTo: "primary-glow",
    }),
    section(
      "feature_cards",
      { heading: `Most Trusted Payment Methods in ${name}`, bgType: "none" },
      [
        ["bank", "Local Bank Transfers", `Local bank transfers remain the top choice for many ${adj} players due to familiarity and ease of use.`, "Supported Banks May Include:", `<p>${local.banks}</p>`, `Why Players Use It:`, li("Strong trust and brand recognition", `${cur} deposits without currency conversion`, "Works with internet and mobile banking apps", "Payouts in 1-24 hours for withdrawals")],
        ["phone", "E-Wallets", "E-wallets are ideal for mobile-first casino players who want quick and secure transactions.", "Popular Options in " + name + ":", `<p>${local.wallets}</p>`, "Key Benefits:", li("Instant deposits", "Withdrawals typically under 6 hours", "Extra security with 2FA", "Easy to link with local bank accounts")],
        ["coin", "Cryptocurrencies", "Crypto offers unmatched privacy and global accessibility for players valuing anonymity, borderless transactions and speed.", "Common Coins Accepted:", "<p>Bitcoin (BTC), Ethereum (ETH), Tether (USDT), Binance Coin (BNB)</p>", "Reasons Players Use Crypto:", li("High withdrawal limits", "Low fees", "Faster international transfers", "No bank involvement")],
        ["card", "Credit & Debit Cards", "Cards are familiar for many players, especially those used to international online purchases.", "Typically Accepted:", "<p>Visa, Mastercard, UnionPay</p>", "Considerations:", li("Fast deposits", "Withdrawals may not be available for all cards", "Some banks may block gambling-related charges", "Ideal for use with international platforms")],
        ["bolt", "Mobile Payment Solutions", `For players on the go, mobile-focused payment systems provide fast and convenient deposits without switching devices.`, "Examples:", `<p>${local.mobile}</p>`, "Highlights:", li("Perfect for mobile casino play", `Seamless integration with ${adj} banks`, "Real-time payment confirmations")],
      ].map(([i, heading, description, d1h, d1b, d2h, d2b]) => ({ heading, description: rt(`<p>${description}</p>`), image: img(m.paymentArt[i]), detail1Heading: d1h, detail1Body: rt(d1b), detail2Heading: d2h, detail2Body: rt(d2b) })),
    ),
    section("checklist_callout", { heading: "Trust Factors", subtext: "You Should Look for in Online Casinos", layout: "", bgType: "color", bgFrom: "secondary-600", bgTo: "secondary-600" }, [
      { text: "SSL encryption on all transaction pages" },
      { text: "Casino licensed by recognised regulators" },
      { text: "Clear T&Cs for withdrawal limits and processing times" },
      { text: "Player reviews and forum mentions" },
    ]),
    section(
      "data_table",
      {
        heading: "Fees, Processing Time & Limits",
        intro: rt("<p>Choosing the right payment method can impact your gaming experience significantly - from how quickly you receive your winnings to how much you lose to fees.</p>"),
        source: "casinos",
        regionCode: code,
        limit: "5",
        columnsMode: "custom",
        moreInfo: "no",
      },
      [{ column: "payments", label: "Options" }, { column: "payoutSpeed", label: "Processing Time" }],
    ),
    section(
      "numbered_steps",
      {
        heading: "How to Make a Deposit",
        highlightText: "Make a Deposit",
        subheading: `at Online Casinos in ${name}`,
        intro: rt(`<p>Depositing money into a ${adj}-friendly casino is quick and straightforward when you choose the right payment method. Here's a complete guide to help you make your first deposit with confidence.</p>`),
        accent: "primary",
        labelMode: "steps",
        bgType: "color",
        bgFrom: "surface-muted",
        bgTo: "surface-muted",
      },
      steps([
        ["Choose a Trusted Online Casino", li(`Pick a site that accepts ${adj} players, supports ${cur}, and is licensed by a reputable regulator`, "Check if your preferred payment method is supported")],
        ["Register and Verify Your Account", li("Sign up with your email and a secure password", "Fill in accurate personal details to match your payment method", "Upload ID if the casino asks for KYC before your first deposit")],
        ["Go to the Deposit/Cashier Section", li('Log in and navigate to the "Cashier", "Wallet", or "Deposit" area', "Choose your preferred payment method")],
        ["Enter Deposit Amount", li("Input the amount you wish to deposit (within the min/max limits)", "Check whether a bonus code applies to your deposit")],
        ["Complete the Transaction", li("E-wallets and cards: approve the payment in your app", "Bank transfer: use the reference number exactly as shown", "Crypto: send to the wallet address shown and wait for confirmation")],
        ["Check Your Balance & Start Playing", li("Once confirmed, your funds will appear in your casino account", "You're now ready to explore games, claim bonuses, or join live tables")],
      ]),
    ),
    section(
      "numbered_steps",
      {
        heading: "How to Withdraw Your Funds",
        highlightText: "Withdraw Your Funds",
        subheading: `from Online Casinos in ${name}`,
        intro: rt(`<p>After winning streaks, the next big moment is cashing out your funds. Withdrawing your money from a ${adj}-friendly online casino is safe and straightforward when you follow a few key steps.</p>`),
        accent: "success",
        labelMode: "steps",
        bgType: "color",
        bgFrom: "surface-muted",
        bgTo: "surface-muted",
      },
      steps([
        ["Confirm Your Account is Verified", li("A government-issued ID (passport, national ID card)", "Proof of address (utility bill, bank statement)", "Payment method verification (screenshot or statement)")],
        ["Go to the Withdrawal or Cashier Page", li("Log into your casino account", 'Navigate to the "Withdraw" or "Cashier" section', "Select the same payment method used for your deposit")],
        ["Enter Withdrawal Amount", li("Choose the amount you want to cash out", "Make sure it's within the minimum and maximum withdrawal limits")],
        ["Confirm the Request & Wait for Processing", li("Submit your withdrawal request", "You'll receive a confirmation email or notification", "Processing times vary by method (e.g. e-wallet 1-6 hours, bank transfer 1-3 days)")],
        ["Track and Receive Your Winnings", li('Most casinos allow you to track the status under "Transaction History"', "Once approved, the funds will be transferred to your chosen method")],
      ]),
    ),
    section("checklist_callout", { heading: "Safety Tips", subtext: `for Withdrawing in ${name}`, layout: "", bgType: "color", bgFrom: "secondary-600", bgTo: "secondary-600" }, [
      { text: "Use licensed casinos only to avoid delayed or blocked withdrawals" },
      { text: "Avoid using third-party accounts that don't match your name" },
      { text: "Enable 2FA for added account security" },
      { text: "Double-check fees and limits before confirming" },
    ]),
    section(
      "info_card_columns",
      {
        heading: "Our Recommended Payment Security Standards to Protect You",
        intro: rt("<p>Online casino payments involve sensitive information, so security can't be an afterthought. That's why we only recommend platforms and methods that meet strict international security standards.</p>"),
        bgType: "none",
      },
      [
        ["left", "no", "Licensed & Regulated Casino Partners", `<p>We only list casinos that hold valid gaming licences from respected authorities such as:</p>${li("Curaçao eGaming", "Malta Gaming Authority (MGA)", "PAGCOR", "Isle of Man Gambling Supervision Commission")}<p>These licences require casinos to comply with financial security, fair play standards and ring-fenced player funds.</p>`],
        ["left", "yes", "End-to-End Encryption (SSL)", `<p>All listed casinos use SSL encryption (look for the padlock in your browser).</p>${li("Your payment info is encrypted in transit", "No third party can intercept your data", "Look for the padlock icon in your browser bar")}`],
        ["right", "yes", "KYC & AML Compliance", `<p>Casinos we recommend enforce Know Your Customer (KYC) and Anti-Money Laundering (AML) processes:</p>${li("Identity verification ensures funds are only accessed by the rightful owner", "Prevents fraudulent withdrawals and account takeovers", "Adds an additional layer of trust for every transaction")}`],
        ["right", "no", "Secure Payment Gateways", "<p>All supported payment methods - bank transfers, e-wallets, cards and crypto - must pass through secure payment processors that comply with PCI DSS or equivalent standards.</p>"],
        ["right", "yes", "Real Player Feedback & Continuous Monitoring", "<p>We monitor player complaints, withdrawal issues and support response times to ensure only consistently secure casinos remain listed.</p>"],
      ].map(([column, tinted, title, body]) => ({ column, tinted, title, body: rt(body) })),
    ),
    section("checklist_callout", { heading: "Your Role", subtext: "in Staying Safe", layout: "", bgType: "color", bgFrom: "secondary-600", bgTo: "secondary-600" }, [
      { text: "Never share your login or wallet credentials" },
      { text: "Use 2-factor authentication (2FA) where available" },
      { text: "Stick to casinos verified on our trusted list" },
    ]),
    faq("FAQs", [
      ["Fastest method?", `E-wallets such as ${local.wallets.split(",")[0]} and crypto are usually the fastest, with withdrawals often processed within a few hours.`],
      [`${local.wallets.split(",")[0]} for withdrawals?`, "Many casinos support e-wallet withdrawals, but some only allow them for deposits - check the cashier before you deposit."],
      ["Are crypto casinos safe?", "Licensed crypto casinos are as safe as any other. Unlicensed ones are risky because blockchain payments can't be reversed."],
      ["Minimum deposit?", `Most casinos on our list accept deposits from ${cur} ${Math.round(10 * r.rate).toLocaleString("en-US")} or less.`],
    ]),
  ];
}

export function calculatorIntro() {
  return [
    section("introduction_section", {
      heading: "Top-Rated Online Casino Bonus Calculator",
      highlightText: "",
      subheading: "Check Your Real Bonus ROI",
      paragraph: rt("<p>Our Online Casino Bonus Calculator shows the total bonus you will receive, your total wallet balance and the total amount you need to bet to withdraw.</p>"),
      bgFrom: "primary-900",
      bgTo: "primary-glow",
    }),
  ];
}

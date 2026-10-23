-- /{region}/reviews becomes a shared region page (region-template/reviews,
-- see 0057) built to Figma "D / Country / TH / Reviews": intro, Top-Rated
-- casino cards, the casino list table (new casino_list_table block), the
-- regional blacklist slider, the game finder (new game_casino_finder block),
-- a 7-question FAQ and the closing link list. The route was hardcoded
-- before, so there is no regional copy to migrate.

SET @template = (SELECT id FROM pages WHERE slug = 'region-template' AND parent_id IS NULL LIMIT 1);

INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @template, 2, 'reviews', 'Reviews',
    'Best Trusted {regionAdj} Online Casinos {year} | Top Casino',
    'Compare the most trusted online casinos in {region} for {year}: ratings, Safe Index scores, payment methods and cashback, plus the casinos {regionAdj} players should avoid.',
    'published'
FROM DUAL
WHERE @template IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE slug = 'reviews' AND parent_id = @template);
SET @page = (SELECT id FROM pages WHERE slug = 'reviews' AND parent_id = @template LIMIT 1);
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'introduction_section', '', 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Best Trusted {regionAdj} Online Casinos' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subheading', 'text', '{region} Top Casino List', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Our expert-curated list features only the most trusted and verified online casinos in {region}, all tested by real players and reviewed for fairness, payout speed, and bonus value.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'top_bonus_picks', '', 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Top-Rated Online Casinos in {region}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Our expert team has handpicked the highest-performing online casinos in {region} offering a safe, fun, and rewarding gaming experience. Below, you’ll find each casino’s overall rating, key features, and bonuses to help you decide where to play.</p>', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'welcome', 4
UNION ALL SELECT @sec, 0, 'source', 'text', 'casinos', 5
UNION ALL SELECT @sec, 0, 'limit', 'text', '3', 6
) AS rows_to_insert WHERE @sec IS NOT NULL;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'casino_list_table', 'section--tight-top', 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, '{regionAdj} Online Casinos List' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Check out the list of online casinos in {region} that are guaranteed safe, fair, and real in their transactions. Every {regionAdj} casino listed here is checked for {currency} payment support, variety of games, local banking service, and mobile payments.</p>', 2
UNION ALL SELECT @sec, 0, 'limit', 'text', '10', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'blacklist_preview', '', 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Avoid These Online Casinos in {region}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Problems such as delays in payouts, biased bonuses, or lack of proper licenses have been reported at these casinos. We suggest {regionAdj} players avoid these blacklisted websites so they don’t end up losing money or compromising their gameplay.', 2
UNION ALL SELECT @sec, 0, 'limit', 'text', '10', 3
UNION ALL SELECT @sec, 0, 'seeAllUrl', 'text', '/{regionCode}/blacklist', 4
UNION ALL SELECT @sec, 0, 'regionCode', 'text', '{regionCode}', 5
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'gradient', 6
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'primary-900', 7
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'danger', 8
UNION ALL SELECT @sec, 0, 'highlightText', 'text', 'Avoid', 10
) AS rows_to_insert WHERE @sec IS NOT NULL;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'game_casino_finder', '', 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Choose an Online Casino Based on Your Playing Style' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'panelTitle', 'text', 'What Game Would You Like to Start Off with', 2
UNION ALL SELECT @sec, 0, 'panelSubtitle', 'text', 'Select one of the following options', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '3', 5
) AS rows_to_insert WHERE @sec IS NOT NULL;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'faq', '', 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Online Casinos {region} FAQs' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'Are online casinos legal in {region}?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>Gambling laws in {region} are strict, and local operators are rarely licensed for online play. Most {regionAdj} players use international casinos licensed abroad (for example in Curaçao or Malta). Check your local rules before you play, and only use casinos we have verified for licensing and fair payouts.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Can I play in {currency}?', 2
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Yes. Many of the casinos on this list accept {currency} deposits and withdrawals, so you avoid conversion fees. The casino table above shows which payment methods each one supports.</p>', 3
UNION ALL SELECT @sec, 3, 'question', 'text', 'How do I choose a trusted {regionAdj} online casino?', 2
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Look for a valid licence, fast and consistent payouts, fair bonus terms and responsive support. Our rating and Safe Index combine these checks, so start with the casinos at the top of the list.</p>', 3
UNION ALL SELECT @sec, 4, 'question', 'text', 'Is it safe to gamble online in {region}?', 2
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>It is safe when you stick to licensed casinos with secure payments and a good payout record, and avoid the sites on our blacklist. Set a budget and never share your account details.</p>', 3
UNION ALL SELECT @sec, 5, 'question', 'text', 'What payment methods work best for {regionAdj} players?', 2
UNION ALL SELECT @sec, 5, 'answer', 'richtext', '<p>Local bank transfers and e-wallets are usually the fastest and cheapest, and many casinos also accept crypto. See our <a href="/{regionCode}/payment-methods">Payment Methods guide</a> for fees and processing times.</p>', 3
UNION ALL SELECT @sec, 6, 'question', 'text', 'Do {regionAdj} casinos offer welcome bonuses?', 2
UNION ALL SELECT @sec, 6, 'answer', 'richtext', '<p>Most do, usually as a deposit match or free spins. Always check the wagering requirement before you claim. Our <a href="/{regionCode}/bonuses">Bonuses page</a> compares the current offers side by side.</p>', 3
UNION ALL SELECT @sec, 7, 'question', 'text', 'Can I access these casinos on mobile?', 2
UNION ALL SELECT @sec, 7, 'answer', 'richtext', '<p>Yes. Every casino we list works in a mobile browser, and many also offer Android or iOS apps with the same games, bonuses and payment options.</p>', 3
) AS rows_to_insert WHERE @sec IS NOT NULL;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'cta_link_list', 'section--tight-top', 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Find the Right {region} Online Casino & Start Playing Safely' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Use our reviews and tools to win smarter.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Explore {region} Online Casinos', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/{regionCode}', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Explore {regionAdj} Bonuses', 3
UNION ALL SELECT @sec, 2, 'url', 'text', '/{regionCode}/bonuses', 4
UNION ALL SELECT @sec, 3, 'label', 'text', 'Explore RTP', 3
UNION ALL SELECT @sec, 3, 'url', 'text', '/{regionCode}/rtp', 4
UNION ALL SELECT @sec, 4, 'label', 'text', 'Avoid These {region} Casinos', 3
UNION ALL SELECT @sec, 4, 'url', 'text', '/{regionCode}/blacklist', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;

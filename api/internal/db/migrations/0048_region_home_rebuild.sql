-- Rebuilds the region home pages (/th, /my, /sg) to Figma "D / Country /
-- TH / Home" + "M / Country / TH": replaces the old icon_box_group /
-- top_casinos_by_region sections with the purpose-built blocks (How We
-- Review panel, Most Popular ranked cards, four expandable "+" card grids,
-- Real Reviews, Ready-to-Win link list) and patches the sections that stay
-- (Event Highlights loses its wrong seeded images and gains an intro; the
-- comparison table gains its intro + tinted band; the blacklist slider gets
-- its "Avoid" highlight and gradient band). Copy is generated per region.
-- Also fixes plain-text fields site-wide that were stored HTML-escaped
-- ("Game Strategy &amp; Winning Tips"): text fields render as plain text,
-- so the entity showed up literally.

UPDATE page_section_fields SET text_value = REPLACE(text_value, '&amp;', '&')
WHERE field_type = 'text' AND text_value LIKE '%&amp;%';

-- ===================== TH =====================
SET @page_id = (SELECT id FROM pages WHERE parent_id IS NULL AND slug = 'th');

DELETE FROM page_sections WHERE page_id = @page_id AND block_type IN ('icon_box_group', 'top_casinos_by_region');

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'highlight_panel', '', 20 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 20);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'headingLine1' AS field_key, 'text' AS field_type, 'How We Review Thai Online Casinos' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'headingLine1Color', 'text', 'primary', 2
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>We don’t just look at flashy bonuses. We dive deep into finding out which sites are legit, and which ones could cost you your money.</p>', 3
UNION ALL SELECT @sec, 0, 'box1Heading', 'text', 'Our Online Casino Testing Methodology', 4
UNION ALL SELECT @sec, 0, 'box1Body', 'richtext', '<p>Each casino is evaluated based on:</p><ul><li>Licensing & regulation</li><li>Bonus fairness and wagering terms</li><li>Game variety and RTP</li><li>Withdrawal speeds and banking options</li><li>Support responsiveness</li></ul>', 5
UNION ALL SELECT @sec, 0, 'box2Heading', 'text', 'Thai-Focused Criteria & Player Experience', 6
UNION ALL SELECT @sec, 0, 'box2Body', 'richtext', '<p>We prioritize casinos that:</p><ul><li>Support THB (Thai baht)</li><li>Offer Thai-language interfaces</li><li>Accept local e-wallets and bank transfers</li><li>Have reputation among Thai gamblers</li></ul>', 7
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '<p>We evaluate casinos for Thai players based on licensing, bonuses, RTP, banking, and support.</p><p>Priority given to THB support, Thai language, and local payment methods.</p>', 8
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'top_bonus_picks', '', 30 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 30);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Most Popular Online Casinos Among Thai Players' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Explore the top online casinos loved by Thai players in 2025. These platforms are known for their high payouts, trusted reputation, Thai-language support, and thrilling game selection. Find out which casinos are trending now and why local players keep coming back.</p>', 2
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'th', 3
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'welcome', 4
UNION ALL SELECT @sec, 0, 'source', 'text', 'casinos', 5
UNION ALL SELECT @sec, 0, 'limit', 'text', '3', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'expandable_card_grid', '', 60 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 60);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Thailand Online Casino Bonuses You Can Claim' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'tagline', 'text', 'Claim top-rated promotions designed for Thai players —
maximize your winnings from the start.', 2
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Bonuses are the gateway to better value and extended gameplay, especially for players in Thailand. Whether you’re new to online casinos or a returning member, knowing the different types of bonuses can help you choose the right offer for your gaming style.</p>', 3
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '<p>Explore and discover all promotions at <a href="/th/bonuses">Best Online Casino Bonuses in Thailand</a> and claim yours now!</p>', 4
UNION ALL SELECT @sec, 1, 'title', 'text', 'No Deposit Bonus', 5
UNION ALL SELECT @sec, 1, 'text', 'text', 'Start playing without depositing a single baht. Perfect for beginners, these bonuses let you try out new casinos risk-free—with either free spins or bonus cash.', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Free Spins', 7
UNION ALL SELECT @sec, 2, 'text', 'text', 'Spin the reels on popular slots like Sweet Bonanza or 5 Lions Megaways with no extra cost. Free spins are a favorite among slot fans and are often tied to new game launches or welcome deals.', 8
UNION ALL SELECT @sec, 3, 'title', 'text', 'Welcome Bonus', 9
UNION ALL SELECT @sec, 3, 'text', 'text', 'Designed for first-time depositors, these bonuses often include 100% to 200% matched deposits and sometimes even free spins. It’s the best way to boost your initial bankroll and try more games.', 10
UNION ALL SELECT @sec, 4, 'title', 'text', 'Reload Bonus', 11
UNION ALL SELECT @sec, 4, 'text', 'text', 'Loyal players don’t get left behind. Reload bonuses offer ongoing deposit matches—typically on a weekly or monthly basis—to keep your balance healthy.', 12
UNION ALL SELECT @sec, 5, 'title', 'text', 'Cashback', 13
UNION ALL SELECT @sec, 5, 'text', 'text', 'Playing doesn''t always mean losing. Cashback deals give you a percentage of your losses back, either daily or weekly, helping reduce long-term risk and improving bankroll management.', 14
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'expandable_card_grid', 'section--tight-top', 70 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 70);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Trusted Payment Methods for Thai Players' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'tagline', 'text', 'We highlight only reliable, secure, and casino-approved methods
— so you can fund your account with peace of mind.', 2
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Today, you expect more than just games, you want hassle-free deposits, fast cashouts, and full confidence in the platforms you use. Whether you''re topping up your balance or withdrawing winnings, the right payment method can make all the difference.</p><p>Here’s a brief overview of the most popular options among casino players in Thailand:</p>', 3
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '<p>You can compare all supported payment options, fees, and processing times by visiting <a href="/th/payment-methods">Thailand online casino payment methods page</a>.</p>', 4
UNION ALL SELECT @sec, 1, 'title', 'text', 'E-wallets', 5
UNION ALL SELECT @sec, 1, 'text', 'text', '(TrueMoney, Skrill, Neteller, etc.)
Known for speed and convenience, e-wallets offer instant deposits and fast withdrawals—usually within a few hours. They''re mobile-friendly and widely supported by major Thai casinos.', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Thai Bank Transfers', 7
UNION ALL SELECT @sec, 2, 'text', 'text', 'Compatible with leading banks such as Kasikorn, SCB, and Bangkok Bank, this method is trusted and familiar. Ideal for players who prefer local banking channels.', 8
UNION ALL SELECT @sec, 3, 'title', 'text', 'Cryptocurrency', 9
UNION ALL SELECT @sec, 3, 'text', 'text', '(BTC, ETH, USDT, etc.)
For privacy-conscious users, crypto is an increasingly popular choice. It offers anonymity, low fees, and global accessibility, especially for high-stake players.', 10
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'expandable_card_grid', 'section--tight-top', 80 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 80);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Game Strategy & Winning Tips' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'tagline', 'text', 'Winning isn’t just luck - it’s smart play, informed choices, and local know-how.', 2
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>If you’re the one who wants to succeed consistently at online casinos don’t rely solely on chance. You need to follow proven strategies, understand game mechanics, and manage their bankrolls wisely. Whether you''re spinning slots or playing live tables, a bit of knowledge goes a long way.</p><p>Here’s a quick look at what smart players in Thailand focus on:</p>', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose High-RTP Games', 4
UNION ALL SELECT @sec, 1, 'text', 'text', 'Games like Blackjack, Baccarat, and top-rated slots with high Return to Player (RTP) percentages give you better long-term chances.', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Budget Like a Pro', 6
UNION ALL SELECT @sec, 2, 'text', 'text', 'Set betting limits, track your gameplay, and avoid chasing losses. Discipline separates casual players from long-term winners.', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Learn Localized Strategies', 8
UNION ALL SELECT @sec, 3, 'text', 'text', 'Thai players often benefit from guides that factor in cultural play styles, local payment timing, and common promotional patterns.', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Learn Game Mechanics', 10
UNION ALL SELECT @sec, 4, 'text', 'text', 'Before playing, understand how each game works—payout structures, volatility, and bonus triggers can all impact your odds.', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Improve with Step-by-Step Guides', 12
UNION ALL SELECT @sec, 5, 'text', 'text', 'From basic rules to advanced betting systems, structured guides help players grow from beginner to seasoned strategist.', 13
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'expandable_card_grid', 'section--tight-top', 90 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 90);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'RTP & Bonus Trackers With Real-Time Insights' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'tagline', 'text', 'Play smarter with up-to-date data on payout rates and active bonuses
— just for Thai players.', 2
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>To make the most of your time and money at online casinos, it’s crucial to know where the best odds and bonuses are right now. That’s where our real-time tools come in. We track top Return to Player (RTP) games and ongoing promotions across major Thai-friendly platforms—so you don’t have to.</p><p>What You Can Track:</p>', 3
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '<p>See the latest figures on our <a href="/th/rtp">Thailand RTP &amp; Live Bonus Tracker</a>.</p>', 4
UNION ALL SELECT @sec, 1, 'title', 'text', 'Weekly RTP Updates', 5
UNION ALL SELECT @sec, 1, 'text', 'text', 'Stay informed with a regularly updated list of games offering the highest RTP percentages—ideal for players who want long-term value.', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Live Bonus Tracker', 7
UNION ALL SELECT @sec, 2, 'text', 'text', 'Find out which casinos are currently offering the biggest matched bonuses, free spins, or cashback deals—all updated in real time for Thai users.', 8
UNION ALL SELECT @sec, 3, 'title', 'text', 'Smart Play Recommendations', 9
UNION ALL SELECT @sec, 3, 'text', 'text', 'See which games and offers are performing best among other Thai players, so you can join the winners.', 10
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'review_columns', '', 95 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 95);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Real Reviews from Thai Players' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'positiveLabel', 'text', 'Positive Feedback Highlights', 2
UNION ALL SELECT @sec, 0, 'complaintLabel', 'text', 'Common Complaints & How They Were Resolved', 3
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', 4
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'surface-muted', 5
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'surface-muted', 6
UNION ALL SELECT @sec, 1, 'column', 'text', 'positive', 7
UNION ALL SELECT @sec, 1, 'name', 'text', 'Nikki Minaji', 8
UNION ALL SELECT @sec, 1, 'timeAgo', 'text', '4 days ago', 9
UNION ALL SELECT @sec, 1, 'quote', 'text', 'I’ve crashed out a few times now and it’s always fast and easy. One of the best casino sites for Thai players!', 10
UNION ALL SELECT @sec, 2, 'column', 'text', 'positive', 11
UNION ALL SELECT @sec, 2, 'name', 'text', 'Nikki Minaji', 12
UNION ALL SELECT @sec, 2, 'timeAgo', 'text', '4 days ago', 13
UNION ALL SELECT @sec, 2, 'quote', 'text', 'I’ve crashed out a few times now and it’s always fast and easy. One of the best casino sites for Thai players!', 14
UNION ALL SELECT @sec, 3, 'column', 'text', 'positive', 15
UNION ALL SELECT @sec, 3, 'name', 'text', 'Nikki Minaji', 16
UNION ALL SELECT @sec, 3, 'timeAgo', 'text', '4 days ago', 17
UNION ALL SELECT @sec, 3, 'quote', 'text', 'I’ve crashed out a few times now and it’s always fast and easy. One of the best casino sites for Thai players!', 18
UNION ALL SELECT @sec, 4, 'column', 'text', 'positive', 19
UNION ALL SELECT @sec, 4, 'name', 'text', 'Nikki Minaji', 20
UNION ALL SELECT @sec, 4, 'timeAgo', 'text', '4 days ago', 21
UNION ALL SELECT @sec, 4, 'quote', 'text', 'I’ve crashed out a few times now and it’s always fast and easy. One of the best casino sites for Thai players!', 22
UNION ALL SELECT @sec, 5, 'column', 'text', 'complaint', 23
UNION ALL SELECT @sec, 5, 'name', 'text', 'Nikki Minaji', 24
UNION ALL SELECT @sec, 5, 'timeAgo', 'text', '4 days ago', 25
UNION ALL SELECT @sec, 5, 'quote', 'text', 'I’ve crashed out a few times now and it’s always fast and easy. One of the best casino sites for Thai players!', 26
UNION ALL SELECT @sec, 6, 'column', 'text', 'complaint', 27
UNION ALL SELECT @sec, 6, 'name', 'text', 'Nikki Minaji', 28
UNION ALL SELECT @sec, 6, 'timeAgo', 'text', '4 days ago', 29
UNION ALL SELECT @sec, 6, 'quote', 'text', 'I’ve crashed out a few times now and it’s always fast and easy. One of the best casino sites for Thai players!', 30
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'cta_link_list', '', 120 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 120);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Ready to Win? Start Playing Smart in Thai Casinos' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Play with confidence using our tested, reviewed, and Thailand online casino list.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Explore Thailand Online Casinos', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/th/reviews', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Explore Thai Bonuses', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/th/bonuses', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Explore RTP', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/th/rtp', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Avoid These Thailand Casinos', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/th/blacklist', 10
) AS rows_to_insert WHERE @sec > 0;

SET @events = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 40 AND block_type = 'event_highlights' LIMIT 1);
DELETE FROM page_section_fields WHERE section_id = @events AND field_key = 'image';
UPDATE page_sections SET custom_class = 'section--tight-top' WHERE id = @events AND custom_class = '';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @events, 0, 'intro', 'richtext', '<p>Don’t miss out the chance to participate or spectate these upcoming events!</p>', 6
WHERE @events IS NOT NULL AND NOT EXISTS (SELECT 1 FROM page_section_fields WHERE section_id = @events AND field_key = 'intro');

SET @comparison = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 50 AND block_type = 'casino_comparison_table' LIMIT 1);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @comparison AS section_id, 0 AS item_index, 'intro' AS field_key, 'richtext' AS field_type, '<p>Compare top online casinos in Thailand with our easy-to-read Casino Ratings Comparison Table. We evaluate each platform based on key performance metrics such as welcome bonuses, RTP (Return to Player) rates, payment methods, customer support, and mobile compatibility. This comparison helps players quickly identify the best options for safe, rewarding, and seamless gameplay. Whether you''re a new or experienced player, our expert ratings guide you to the most trusted online casinos in the Thai market.</p>' AS text_value, 8 AS sort_order
UNION ALL SELECT @comparison, 0, 'bgType', 'text', 'color', 4
UNION ALL SELECT @comparison, 0, 'bgFrom', 'text', 'surface-muted', 5
UNION ALL SELECT @comparison, 0, 'bgTo', 'text', 'surface-muted', 6
) AS rows_to_insert
WHERE @comparison IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM page_section_fields f WHERE f.section_id = @comparison AND f.item_index = 0 AND f.field_key = rows_to_insert.field_key
);

SET @blacklist = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 100 AND block_type = 'blacklist_preview' LIMIT 1);
DELETE FROM page_section_fields WHERE section_id = @blacklist AND field_key = 'subheading';
UPDATE page_section_fields SET text_value = '10' WHERE section_id = @blacklist AND field_key = 'limit';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @blacklist AS section_id, 0 AS item_index, 'highlightText' AS field_key, 'text' AS field_type, 'Avoid' AS text_value, 10 AS sort_order
UNION ALL SELECT @blacklist, 0, 'bgType', 'text', 'gradient', 6
UNION ALL SELECT @blacklist, 0, 'bgFrom', 'text', 'primary-900', 7
UNION ALL SELECT @blacklist, 0, 'bgTo', 'text', 'danger', 8
) AS rows_to_insert
WHERE @blacklist IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM page_section_fields f WHERE f.section_id = @blacklist AND f.item_index = 0 AND f.field_key = rows_to_insert.field_key
);

-- ===================== MY =====================
SET @page_id = (SELECT id FROM pages WHERE parent_id IS NULL AND slug = 'my');

DELETE FROM page_sections WHERE page_id = @page_id AND block_type IN ('icon_box_group', 'top_casinos_by_region');

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'highlight_panel', '', 20 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 20);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'headingLine1' AS field_key, 'text' AS field_type, 'How We Review Malaysian Online Casinos' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'headingLine1Color', 'text', 'primary', 2
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>We don’t just look at flashy bonuses. We dive deep into finding out which sites are legit, and which ones could cost you your money.</p>', 3
UNION ALL SELECT @sec, 0, 'box1Heading', 'text', 'Our Online Casino Testing Methodology', 4
UNION ALL SELECT @sec, 0, 'box1Body', 'richtext', '<p>Each casino is evaluated based on:</p><ul><li>Licensing & regulation</li><li>Bonus fairness and wagering terms</li><li>Game variety and RTP</li><li>Withdrawal speeds and banking options</li><li>Support responsiveness</li></ul>', 5
UNION ALL SELECT @sec, 0, 'box2Heading', 'text', 'Malaysian-Focused Criteria & Player Experience', 6
UNION ALL SELECT @sec, 0, 'box2Body', 'richtext', '<p>We prioritize casinos that:</p><ul><li>Support MYR (Malaysian ringgit)</li><li>Offer Malay-language interfaces</li><li>Accept local e-wallets and bank transfers</li><li>Have reputation among Malaysian gamblers</li></ul>', 7
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '<p>We evaluate casinos for Malaysian players based on licensing, bonuses, RTP, banking, and support.</p><p>Priority given to MYR support, Malay language, and local payment methods.</p>', 8
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'top_bonus_picks', '', 30 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 30);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Most Popular Online Casinos Among Malaysian Players' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Explore the top online casinos loved by Malaysian players in 2025. These platforms are known for their high payouts, trusted reputation, Malay-language support, and thrilling game selection. Find out which casinos are trending now and why local players keep coming back.</p>', 2
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'my', 3
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'welcome', 4
UNION ALL SELECT @sec, 0, 'source', 'text', 'casinos', 5
UNION ALL SELECT @sec, 0, 'limit', 'text', '3', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'expandable_card_grid', '', 60 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 60);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Malaysia Online Casino Bonuses You Can Claim' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'tagline', 'text', 'Claim top-rated promotions designed for Malaysian players —
maximize your winnings from the start.', 2
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Bonuses are the gateway to better value and extended gameplay, especially for players in Malaysia. Whether you’re new to online casinos or a returning member, knowing the different types of bonuses can help you choose the right offer for your gaming style.</p>', 3
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '<p>Explore and discover all promotions at <a href="/my/bonuses">Best Online Casino Bonuses in Malaysia</a> and claim yours now!</p>', 4
UNION ALL SELECT @sec, 1, 'title', 'text', 'No Deposit Bonus', 5
UNION ALL SELECT @sec, 1, 'text', 'text', 'Start playing without depositing a single ringgit. Perfect for beginners, these bonuses let you try out new casinos risk-free—with either free spins or bonus cash.', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Free Spins', 7
UNION ALL SELECT @sec, 2, 'text', 'text', 'Spin the reels on popular slots like Sweet Bonanza or 5 Lions Megaways with no extra cost. Free spins are a favorite among slot fans and are often tied to new game launches or welcome deals.', 8
UNION ALL SELECT @sec, 3, 'title', 'text', 'Welcome Bonus', 9
UNION ALL SELECT @sec, 3, 'text', 'text', 'Designed for first-time depositors, these bonuses often include 100% to 200% matched deposits and sometimes even free spins. It’s the best way to boost your initial bankroll and try more games.', 10
UNION ALL SELECT @sec, 4, 'title', 'text', 'Reload Bonus', 11
UNION ALL SELECT @sec, 4, 'text', 'text', 'Loyal players don’t get left behind. Reload bonuses offer ongoing deposit matches—typically on a weekly or monthly basis—to keep your balance healthy.', 12
UNION ALL SELECT @sec, 5, 'title', 'text', 'Cashback', 13
UNION ALL SELECT @sec, 5, 'text', 'text', 'Playing doesn''t always mean losing. Cashback deals give you a percentage of your losses back, either daily or weekly, helping reduce long-term risk and improving bankroll management.', 14
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'expandable_card_grid', 'section--tight-top', 70 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 70);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Trusted Payment Methods for Malaysian Players' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'tagline', 'text', 'We highlight only reliable, secure, and casino-approved methods
— so you can fund your account with peace of mind.', 2
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Today, you expect more than just games, you want hassle-free deposits, fast cashouts, and full confidence in the platforms you use. Whether you''re topping up your balance or withdrawing winnings, the right payment method can make all the difference.</p><p>Here’s a brief overview of the most popular options among casino players in Malaysia:</p>', 3
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '<p>You can compare all supported payment options, fees, and processing times by visiting <a href="/my/payment-methods">Malaysia online casino payment methods page</a>.</p>', 4
UNION ALL SELECT @sec, 1, 'title', 'text', 'E-wallets', 5
UNION ALL SELECT @sec, 1, 'text', 'text', '(Touch ''n Go, Boost, GrabPay, etc.)
Known for speed and convenience, e-wallets offer instant deposits and fast withdrawals—usually within a few hours. They''re mobile-friendly and widely supported by major Malaysian casinos.', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Malaysian Bank Transfers', 7
UNION ALL SELECT @sec, 2, 'text', 'text', 'Compatible with leading banks such as Maybank, CIMB, and Public Bank, this method is trusted and familiar. Ideal for players who prefer local banking channels.', 8
UNION ALL SELECT @sec, 3, 'title', 'text', 'Cryptocurrency', 9
UNION ALL SELECT @sec, 3, 'text', 'text', '(BTC, ETH, USDT, etc.)
For privacy-conscious users, crypto is an increasingly popular choice. It offers anonymity, low fees, and global accessibility, especially for high-stake players.', 10
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'expandable_card_grid', 'section--tight-top', 80 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 80);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Game Strategy & Winning Tips' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'tagline', 'text', 'Winning isn’t just luck - it’s smart play, informed choices, and local know-how.', 2
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>If you’re the one who wants to succeed consistently at online casinos don’t rely solely on chance. You need to follow proven strategies, understand game mechanics, and manage their bankrolls wisely. Whether you''re spinning slots or playing live tables, a bit of knowledge goes a long way.</p><p>Here’s a quick look at what smart players in Malaysia focus on:</p>', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose High-RTP Games', 4
UNION ALL SELECT @sec, 1, 'text', 'text', 'Games like Blackjack, Baccarat, and top-rated slots with high Return to Player (RTP) percentages give you better long-term chances.', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Budget Like a Pro', 6
UNION ALL SELECT @sec, 2, 'text', 'text', 'Set betting limits, track your gameplay, and avoid chasing losses. Discipline separates casual players from long-term winners.', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Learn Localized Strategies', 8
UNION ALL SELECT @sec, 3, 'text', 'text', 'Malaysian players often benefit from guides that factor in cultural play styles, local payment timing, and common promotional patterns.', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Learn Game Mechanics', 10
UNION ALL SELECT @sec, 4, 'text', 'text', 'Before playing, understand how each game works—payout structures, volatility, and bonus triggers can all impact your odds.', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Improve with Step-by-Step Guides', 12
UNION ALL SELECT @sec, 5, 'text', 'text', 'From basic rules to advanced betting systems, structured guides help players grow from beginner to seasoned strategist.', 13
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'expandable_card_grid', 'section--tight-top', 90 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 90);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'RTP & Bonus Trackers With Real-Time Insights' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'tagline', 'text', 'Play smarter with up-to-date data on payout rates and active bonuses
— just for Malaysian players.', 2
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>To make the most of your time and money at online casinos, it’s crucial to know where the best odds and bonuses are right now. That’s where our real-time tools come in. We track top Return to Player (RTP) games and ongoing promotions across major Malaysian-friendly platforms—so you don’t have to.</p><p>What You Can Track:</p>', 3
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '<p>See the latest figures on our <a href="/my/rtp">Malaysia RTP &amp; Live Bonus Tracker</a>.</p>', 4
UNION ALL SELECT @sec, 1, 'title', 'text', 'Weekly RTP Updates', 5
UNION ALL SELECT @sec, 1, 'text', 'text', 'Stay informed with a regularly updated list of games offering the highest RTP percentages—ideal for players who want long-term value.', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Live Bonus Tracker', 7
UNION ALL SELECT @sec, 2, 'text', 'text', 'Find out which casinos are currently offering the biggest matched bonuses, free spins, or cashback deals—all updated in real time for Malaysian users.', 8
UNION ALL SELECT @sec, 3, 'title', 'text', 'Smart Play Recommendations', 9
UNION ALL SELECT @sec, 3, 'text', 'text', 'See which games and offers are performing best among other Malaysian players, so you can join the winners.', 10
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'review_columns', '', 95 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 95);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Real Reviews from Malaysian Players' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'positiveLabel', 'text', 'Positive Feedback Highlights', 2
UNION ALL SELECT @sec, 0, 'complaintLabel', 'text', 'Common Complaints & How They Were Resolved', 3
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', 4
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'surface-muted', 5
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'surface-muted', 6
UNION ALL SELECT @sec, 1, 'column', 'text', 'positive', 7
UNION ALL SELECT @sec, 1, 'name', 'text', 'Nikki Minaji', 8
UNION ALL SELECT @sec, 1, 'timeAgo', 'text', '4 days ago', 9
UNION ALL SELECT @sec, 1, 'quote', 'text', 'I’ve crashed out a few times now and it’s always fast and easy. One of the best casino sites for Malaysian players!', 10
UNION ALL SELECT @sec, 2, 'column', 'text', 'positive', 11
UNION ALL SELECT @sec, 2, 'name', 'text', 'Nikki Minaji', 12
UNION ALL SELECT @sec, 2, 'timeAgo', 'text', '4 days ago', 13
UNION ALL SELECT @sec, 2, 'quote', 'text', 'I’ve crashed out a few times now and it’s always fast and easy. One of the best casino sites for Malaysian players!', 14
UNION ALL SELECT @sec, 3, 'column', 'text', 'positive', 15
UNION ALL SELECT @sec, 3, 'name', 'text', 'Nikki Minaji', 16
UNION ALL SELECT @sec, 3, 'timeAgo', 'text', '4 days ago', 17
UNION ALL SELECT @sec, 3, 'quote', 'text', 'I’ve crashed out a few times now and it’s always fast and easy. One of the best casino sites for Malaysian players!', 18
UNION ALL SELECT @sec, 4, 'column', 'text', 'positive', 19
UNION ALL SELECT @sec, 4, 'name', 'text', 'Nikki Minaji', 20
UNION ALL SELECT @sec, 4, 'timeAgo', 'text', '4 days ago', 21
UNION ALL SELECT @sec, 4, 'quote', 'text', 'I’ve crashed out a few times now and it’s always fast and easy. One of the best casino sites for Malaysian players!', 22
UNION ALL SELECT @sec, 5, 'column', 'text', 'complaint', 23
UNION ALL SELECT @sec, 5, 'name', 'text', 'Nikki Minaji', 24
UNION ALL SELECT @sec, 5, 'timeAgo', 'text', '4 days ago', 25
UNION ALL SELECT @sec, 5, 'quote', 'text', 'I’ve crashed out a few times now and it’s always fast and easy. One of the best casino sites for Malaysian players!', 26
UNION ALL SELECT @sec, 6, 'column', 'text', 'complaint', 27
UNION ALL SELECT @sec, 6, 'name', 'text', 'Nikki Minaji', 28
UNION ALL SELECT @sec, 6, 'timeAgo', 'text', '4 days ago', 29
UNION ALL SELECT @sec, 6, 'quote', 'text', 'I’ve crashed out a few times now and it’s always fast and easy. One of the best casino sites for Malaysian players!', 30
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'cta_link_list', '', 120 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 120);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Ready to Win? Start Playing Smart in Malaysian Casinos' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Play with confidence using our tested, reviewed, and Malaysia online casino list.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Explore Malaysia Online Casinos', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/my/reviews', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Explore Malaysian Bonuses', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/my/bonuses', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Explore RTP', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/my/rtp', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Avoid These Malaysia Casinos', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/my/blacklist', 10
) AS rows_to_insert WHERE @sec > 0;

SET @events = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 40 AND block_type = 'event_highlights' LIMIT 1);
DELETE FROM page_section_fields WHERE section_id = @events AND field_key = 'image';
UPDATE page_sections SET custom_class = 'section--tight-top' WHERE id = @events AND custom_class = '';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @events, 0, 'intro', 'richtext', '<p>Don’t miss out the chance to participate or spectate these upcoming events!</p>', 6
WHERE @events IS NOT NULL AND NOT EXISTS (SELECT 1 FROM page_section_fields WHERE section_id = @events AND field_key = 'intro');

SET @comparison = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 50 AND block_type = 'casino_comparison_table' LIMIT 1);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @comparison AS section_id, 0 AS item_index, 'intro' AS field_key, 'richtext' AS field_type, '<p>Compare top online casinos in Malaysia with our easy-to-read Casino Ratings Comparison Table. We evaluate each platform based on key performance metrics such as welcome bonuses, RTP (Return to Player) rates, payment methods, customer support, and mobile compatibility. This comparison helps players quickly identify the best options for safe, rewarding, and seamless gameplay. Whether you''re a new or experienced player, our expert ratings guide you to the most trusted online casinos in the Malaysian market.</p>' AS text_value, 8 AS sort_order
UNION ALL SELECT @comparison, 0, 'bgType', 'text', 'color', 4
UNION ALL SELECT @comparison, 0, 'bgFrom', 'text', 'surface-muted', 5
UNION ALL SELECT @comparison, 0, 'bgTo', 'text', 'surface-muted', 6
) AS rows_to_insert
WHERE @comparison IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM page_section_fields f WHERE f.section_id = @comparison AND f.item_index = 0 AND f.field_key = rows_to_insert.field_key
);

SET @blacklist = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 100 AND block_type = 'blacklist_preview' LIMIT 1);
DELETE FROM page_section_fields WHERE section_id = @blacklist AND field_key = 'subheading';
UPDATE page_section_fields SET text_value = '10' WHERE section_id = @blacklist AND field_key = 'limit';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @blacklist AS section_id, 0 AS item_index, 'highlightText' AS field_key, 'text' AS field_type, 'Avoid' AS text_value, 10 AS sort_order
UNION ALL SELECT @blacklist, 0, 'bgType', 'text', 'gradient', 6
UNION ALL SELECT @blacklist, 0, 'bgFrom', 'text', 'primary-900', 7
UNION ALL SELECT @blacklist, 0, 'bgTo', 'text', 'danger', 8
) AS rows_to_insert
WHERE @blacklist IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM page_section_fields f WHERE f.section_id = @blacklist AND f.item_index = 0 AND f.field_key = rows_to_insert.field_key
);

-- ===================== SG =====================
SET @page_id = (SELECT id FROM pages WHERE parent_id IS NULL AND slug = 'sg');

DELETE FROM page_sections WHERE page_id = @page_id AND block_type IN ('icon_box_group', 'top_casinos_by_region');

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'highlight_panel', '', 20 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 20);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'headingLine1' AS field_key, 'text' AS field_type, 'How We Review Singaporean Online Casinos' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'headingLine1Color', 'text', 'primary', 2
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>We don’t just look at flashy bonuses. We dive deep into finding out which sites are legit, and which ones could cost you your money.</p>', 3
UNION ALL SELECT @sec, 0, 'box1Heading', 'text', 'Our Online Casino Testing Methodology', 4
UNION ALL SELECT @sec, 0, 'box1Body', 'richtext', '<p>Each casino is evaluated based on:</p><ul><li>Licensing & regulation</li><li>Bonus fairness and wagering terms</li><li>Game variety and RTP</li><li>Withdrawal speeds and banking options</li><li>Support responsiveness</li></ul>', 5
UNION ALL SELECT @sec, 0, 'box2Heading', 'text', 'Singaporean-Focused Criteria & Player Experience', 6
UNION ALL SELECT @sec, 0, 'box2Body', 'richtext', '<p>We prioritize casinos that:</p><ul><li>Support SGD (Singaporean dollar)</li><li>Offer English and Chinese-language interfaces</li><li>Accept local e-wallets and bank transfers</li><li>Have reputation among Singaporean gamblers</li></ul>', 7
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '<p>We evaluate casinos for Singaporean players based on licensing, bonuses, RTP, banking, and support.</p><p>Priority given to SGD support, English and Chinese language, and local payment methods.</p>', 8
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'top_bonus_picks', '', 30 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 30);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Most Popular Online Casinos Among Singaporean Players' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Explore the top online casinos loved by Singaporean players in 2025. These platforms are known for their high payouts, trusted reputation, English and Chinese-language support, and thrilling game selection. Find out which casinos are trending now and why local players keep coming back.</p>', 2
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'sg', 3
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'welcome', 4
UNION ALL SELECT @sec, 0, 'source', 'text', 'casinos', 5
UNION ALL SELECT @sec, 0, 'limit', 'text', '3', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'expandable_card_grid', '', 60 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 60);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Singapore Online Casino Bonuses You Can Claim' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'tagline', 'text', 'Claim top-rated promotions designed for Singaporean players —
maximize your winnings from the start.', 2
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Bonuses are the gateway to better value and extended gameplay, especially for players in Singapore. Whether you’re new to online casinos or a returning member, knowing the different types of bonuses can help you choose the right offer for your gaming style.</p>', 3
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '<p>Explore and discover all promotions at <a href="/sg/bonuses">Best Online Casino Bonuses in Singapore</a> and claim yours now!</p>', 4
UNION ALL SELECT @sec, 1, 'title', 'text', 'No Deposit Bonus', 5
UNION ALL SELECT @sec, 1, 'text', 'text', 'Start playing without depositing a single dollar. Perfect for beginners, these bonuses let you try out new casinos risk-free—with either free spins or bonus cash.', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Free Spins', 7
UNION ALL SELECT @sec, 2, 'text', 'text', 'Spin the reels on popular slots like Sweet Bonanza or 5 Lions Megaways with no extra cost. Free spins are a favorite among slot fans and are often tied to new game launches or welcome deals.', 8
UNION ALL SELECT @sec, 3, 'title', 'text', 'Welcome Bonus', 9
UNION ALL SELECT @sec, 3, 'text', 'text', 'Designed for first-time depositors, these bonuses often include 100% to 200% matched deposits and sometimes even free spins. It’s the best way to boost your initial bankroll and try more games.', 10
UNION ALL SELECT @sec, 4, 'title', 'text', 'Reload Bonus', 11
UNION ALL SELECT @sec, 4, 'text', 'text', 'Loyal players don’t get left behind. Reload bonuses offer ongoing deposit matches—typically on a weekly or monthly basis—to keep your balance healthy.', 12
UNION ALL SELECT @sec, 5, 'title', 'text', 'Cashback', 13
UNION ALL SELECT @sec, 5, 'text', 'text', 'Playing doesn''t always mean losing. Cashback deals give you a percentage of your losses back, either daily or weekly, helping reduce long-term risk and improving bankroll management.', 14
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'expandable_card_grid', 'section--tight-top', 70 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 70);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Trusted Payment Methods for Singaporean Players' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'tagline', 'text', 'We highlight only reliable, secure, and casino-approved methods
— so you can fund your account with peace of mind.', 2
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Today, you expect more than just games, you want hassle-free deposits, fast cashouts, and full confidence in the platforms you use. Whether you''re topping up your balance or withdrawing winnings, the right payment method can make all the difference.</p><p>Here’s a brief overview of the most popular options among casino players in Singapore:</p>', 3
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '<p>You can compare all supported payment options, fees, and processing times by visiting <a href="/sg/payment-methods">Singapore online casino payment methods page</a>.</p>', 4
UNION ALL SELECT @sec, 1, 'title', 'text', 'E-wallets', 5
UNION ALL SELECT @sec, 1, 'text', 'text', '(PayNow, GrabPay, Skrill, etc.)
Known for speed and convenience, e-wallets offer instant deposits and fast withdrawals—usually within a few hours. They''re mobile-friendly and widely supported by major Singaporean casinos.', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Singapore Bank Transfers', 7
UNION ALL SELECT @sec, 2, 'text', 'text', 'Compatible with leading banks such as DBS, OCBC, and UOB, this method is trusted and familiar. Ideal for players who prefer local banking channels.', 8
UNION ALL SELECT @sec, 3, 'title', 'text', 'Cryptocurrency', 9
UNION ALL SELECT @sec, 3, 'text', 'text', '(BTC, ETH, USDT, etc.)
For privacy-conscious users, crypto is an increasingly popular choice. It offers anonymity, low fees, and global accessibility, especially for high-stake players.', 10
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'expandable_card_grid', 'section--tight-top', 80 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 80);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Game Strategy & Winning Tips' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'tagline', 'text', 'Winning isn’t just luck - it’s smart play, informed choices, and local know-how.', 2
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>If you’re the one who wants to succeed consistently at online casinos don’t rely solely on chance. You need to follow proven strategies, understand game mechanics, and manage their bankrolls wisely. Whether you''re spinning slots or playing live tables, a bit of knowledge goes a long way.</p><p>Here’s a quick look at what smart players in Singapore focus on:</p>', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose High-RTP Games', 4
UNION ALL SELECT @sec, 1, 'text', 'text', 'Games like Blackjack, Baccarat, and top-rated slots with high Return to Player (RTP) percentages give you better long-term chances.', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Budget Like a Pro', 6
UNION ALL SELECT @sec, 2, 'text', 'text', 'Set betting limits, track your gameplay, and avoid chasing losses. Discipline separates casual players from long-term winners.', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Learn Localized Strategies', 8
UNION ALL SELECT @sec, 3, 'text', 'text', 'Singaporean players often benefit from guides that factor in cultural play styles, local payment timing, and common promotional patterns.', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Learn Game Mechanics', 10
UNION ALL SELECT @sec, 4, 'text', 'text', 'Before playing, understand how each game works—payout structures, volatility, and bonus triggers can all impact your odds.', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Improve with Step-by-Step Guides', 12
UNION ALL SELECT @sec, 5, 'text', 'text', 'From basic rules to advanced betting systems, structured guides help players grow from beginner to seasoned strategist.', 13
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'expandable_card_grid', 'section--tight-top', 90 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 90);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'RTP & Bonus Trackers With Real-Time Insights' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'tagline', 'text', 'Play smarter with up-to-date data on payout rates and active bonuses
— just for Singaporean players.', 2
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>To make the most of your time and money at online casinos, it’s crucial to know where the best odds and bonuses are right now. That’s where our real-time tools come in. We track top Return to Player (RTP) games and ongoing promotions across major Singaporean-friendly platforms—so you don’t have to.</p><p>What You Can Track:</p>', 3
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '<p>See the latest figures on our <a href="/sg/rtp">Singapore RTP &amp; Live Bonus Tracker</a>.</p>', 4
UNION ALL SELECT @sec, 1, 'title', 'text', 'Weekly RTP Updates', 5
UNION ALL SELECT @sec, 1, 'text', 'text', 'Stay informed with a regularly updated list of games offering the highest RTP percentages—ideal for players who want long-term value.', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Live Bonus Tracker', 7
UNION ALL SELECT @sec, 2, 'text', 'text', 'Find out which casinos are currently offering the biggest matched bonuses, free spins, or cashback deals—all updated in real time for Singaporean users.', 8
UNION ALL SELECT @sec, 3, 'title', 'text', 'Smart Play Recommendations', 9
UNION ALL SELECT @sec, 3, 'text', 'text', 'See which games and offers are performing best among other Singaporean players, so you can join the winners.', 10
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'review_columns', '', 95 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 95);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Real Reviews from Singaporean Players' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'positiveLabel', 'text', 'Positive Feedback Highlights', 2
UNION ALL SELECT @sec, 0, 'complaintLabel', 'text', 'Common Complaints & How They Were Resolved', 3
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', 4
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'surface-muted', 5
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'surface-muted', 6
UNION ALL SELECT @sec, 1, 'column', 'text', 'positive', 7
UNION ALL SELECT @sec, 1, 'name', 'text', 'Nikki Minaji', 8
UNION ALL SELECT @sec, 1, 'timeAgo', 'text', '4 days ago', 9
UNION ALL SELECT @sec, 1, 'quote', 'text', 'I’ve crashed out a few times now and it’s always fast and easy. One of the best casino sites for Singaporean players!', 10
UNION ALL SELECT @sec, 2, 'column', 'text', 'positive', 11
UNION ALL SELECT @sec, 2, 'name', 'text', 'Nikki Minaji', 12
UNION ALL SELECT @sec, 2, 'timeAgo', 'text', '4 days ago', 13
UNION ALL SELECT @sec, 2, 'quote', 'text', 'I’ve crashed out a few times now and it’s always fast and easy. One of the best casino sites for Singaporean players!', 14
UNION ALL SELECT @sec, 3, 'column', 'text', 'positive', 15
UNION ALL SELECT @sec, 3, 'name', 'text', 'Nikki Minaji', 16
UNION ALL SELECT @sec, 3, 'timeAgo', 'text', '4 days ago', 17
UNION ALL SELECT @sec, 3, 'quote', 'text', 'I’ve crashed out a few times now and it’s always fast and easy. One of the best casino sites for Singaporean players!', 18
UNION ALL SELECT @sec, 4, 'column', 'text', 'positive', 19
UNION ALL SELECT @sec, 4, 'name', 'text', 'Nikki Minaji', 20
UNION ALL SELECT @sec, 4, 'timeAgo', 'text', '4 days ago', 21
UNION ALL SELECT @sec, 4, 'quote', 'text', 'I’ve crashed out a few times now and it’s always fast and easy. One of the best casino sites for Singaporean players!', 22
UNION ALL SELECT @sec, 5, 'column', 'text', 'complaint', 23
UNION ALL SELECT @sec, 5, 'name', 'text', 'Nikki Minaji', 24
UNION ALL SELECT @sec, 5, 'timeAgo', 'text', '4 days ago', 25
UNION ALL SELECT @sec, 5, 'quote', 'text', 'I’ve crashed out a few times now and it’s always fast and easy. One of the best casino sites for Singaporean players!', 26
UNION ALL SELECT @sec, 6, 'column', 'text', 'complaint', 27
UNION ALL SELECT @sec, 6, 'name', 'text', 'Nikki Minaji', 28
UNION ALL SELECT @sec, 6, 'timeAgo', 'text', '4 days ago', 29
UNION ALL SELECT @sec, 6, 'quote', 'text', 'I’ve crashed out a few times now and it’s always fast and easy. One of the best casino sites for Singaporean players!', 30
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'cta_link_list', '', 120 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 120);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Ready to Win? Start Playing Smart in Singaporean Casinos' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Play with confidence using our tested, reviewed, and Singapore online casino list.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Explore Singapore Online Casinos', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/sg/reviews', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Explore Singaporean Bonuses', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/sg/bonuses', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Explore RTP', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/sg/rtp', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Avoid These Singapore Casinos', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/sg/blacklist', 10
) AS rows_to_insert WHERE @sec > 0;

SET @events = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 40 AND block_type = 'event_highlights' LIMIT 1);
DELETE FROM page_section_fields WHERE section_id = @events AND field_key = 'image';
UPDATE page_sections SET custom_class = 'section--tight-top' WHERE id = @events AND custom_class = '';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @events, 0, 'intro', 'richtext', '<p>Don’t miss out the chance to participate or spectate these upcoming events!</p>', 6
WHERE @events IS NOT NULL AND NOT EXISTS (SELECT 1 FROM page_section_fields WHERE section_id = @events AND field_key = 'intro');

SET @comparison = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 50 AND block_type = 'casino_comparison_table' LIMIT 1);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @comparison AS section_id, 0 AS item_index, 'intro' AS field_key, 'richtext' AS field_type, '<p>Compare top online casinos in Singapore with our easy-to-read Casino Ratings Comparison Table. We evaluate each platform based on key performance metrics such as welcome bonuses, RTP (Return to Player) rates, payment methods, customer support, and mobile compatibility. This comparison helps players quickly identify the best options for safe, rewarding, and seamless gameplay. Whether you''re a new or experienced player, our expert ratings guide you to the most trusted online casinos in the Singaporean market.</p>' AS text_value, 8 AS sort_order
UNION ALL SELECT @comparison, 0, 'bgType', 'text', 'color', 4
UNION ALL SELECT @comparison, 0, 'bgFrom', 'text', 'surface-muted', 5
UNION ALL SELECT @comparison, 0, 'bgTo', 'text', 'surface-muted', 6
) AS rows_to_insert
WHERE @comparison IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM page_section_fields f WHERE f.section_id = @comparison AND f.item_index = 0 AND f.field_key = rows_to_insert.field_key
);

SET @blacklist = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 100 AND block_type = 'blacklist_preview' LIMIT 1);
DELETE FROM page_section_fields WHERE section_id = @blacklist AND field_key = 'subheading';
UPDATE page_section_fields SET text_value = '10' WHERE section_id = @blacklist AND field_key = 'limit';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @blacklist AS section_id, 0 AS item_index, 'highlightText' AS field_key, 'text' AS field_type, 'Avoid' AS text_value, 10 AS sort_order
UNION ALL SELECT @blacklist, 0, 'bgType', 'text', 'gradient', 6
UNION ALL SELECT @blacklist, 0, 'bgFrom', 'text', 'primary-900', 7
UNION ALL SELECT @blacklist, 0, 'bgTo', 'text', 'danger', 8
) AS rows_to_insert
WHERE @blacklist IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM page_section_fields f WHERE f.section_id = @blacklist AND f.item_index = 0 AND f.field_key = rows_to_insert.field_key
);

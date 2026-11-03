-- Casino Bonus and Casino Games pages, linked from the header menu's
-- "Casino Bonus" and "Casino Types" items (and the footer's "Casino Games").
-- Those menu items pointed at /bonuses?type=... (no such page) and
-- /guides?category=... (an unfiltered guide list); each type now has its own
-- route: /casino-bonus/<type> and /casino-games/<game>, plus the two hub pages.
--
-- The pages are written for players across Southeast Asia: they link to
-- each country's own bonus pages (/{region}/bonuses/<type>) and show the
-- live top casinos per country. They're created as drafts, to be reviewed
-- and published in Pages; a page that already exists is left alone. Every
-- component sits in its own Container (see 0084). Menu links are only
-- changed where they still have the old address.
--
-- Generated from structured content; edit the pages in the admin, not here.


-- casino-bonus
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT NULL, (SELECT COALESCE(MAX(p2.sort_order), 0) + 1 FROM pages p2 WHERE p2.parent_id IS NULL AND p2.kind = 'page'), 'casino-bonus', 'Casino Bonus', 'Online Casino Bonuses in Southeast Asia {year} | Top Casino Guide', 'Every type of online casino bonus explained: welcome, no deposit, free spins, deposit, cashback and VIP. Compare offers by country and claim safely.', 'draft' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE parent_id IS NULL AND slug = 'casino-bonus');
SET @bonusHub = (SELECT id FROM pages WHERE parent_id IS NULL AND slug = 'casino-bonus' LIMIT 1);
SET @page = @bonusHub;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Online Casino Bonuses in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Casino bonuses give you extra money, spins or rewards to play with, but no two are the same. This guide explains every type of bonus, the terms that matter, and where to find the latest offers for your country from casinos we''ve reviewed.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'link_card_grid', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Types of Casino Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Choose a bonus type to learn how it works, what to check and how to claim it.</p>', 2
UNION ALL SELECT @sec, 0, 'columns', 'text', '2', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Welcome Bonuses', 4
UNION ALL SELECT @sec, 1, 'description', 'text', 'A welcome bonus is the reward an online casino gives new players for signing up and making a first deposit.', 5
UNION ALL SELECT @sec, 1, 'url', 'text', '/casino-bonus/welcome-bonus', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'No Deposit Bonuses', 7
UNION ALL SELECT @sec, 2, 'description', 'text', 'A no deposit bonus lets you try an online casino without putting in any money.', 8
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-bonus/no-deposit-bonus', 9
UNION ALL SELECT @sec, 3, 'title', 'text', 'Free Spins Bonuses', 10
UNION ALL SELECT @sec, 3, 'description', 'text', 'Free spins let you play selected slot games without using your own balance.', 11
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-bonus/free-spins', 12
UNION ALL SELECT @sec, 4, 'title', 'text', 'Deposit Bonuses', 13
UNION ALL SELECT @sec, 4, 'description', 'text', 'A deposit bonus, often called a reload or match bonus, adds bonus money to a deposit you make.', 14
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-bonus/deposit-bonus', 15
UNION ALL SELECT @sec, 5, 'title', 'text', 'Cashback Bonuses', 16
UNION ALL SELECT @sec, 5, 'description', 'text', 'A cashback bonus gives you back a percentage of your losses over a set period, for example 10% of your net losses each week.', 17
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-bonus/cashback', 18
UNION ALL SELECT @sec, 6, 'title', 'text', 'Loyalty & VIP Bonuses', 19
UNION ALL SELECT @sec, 6, 'description', 'text', 'Loyalty and VIP programmes reward players for playing regularly.', 20
UNION ALL SELECT @sec, 6, 'url', 'text', '/casino-bonus/loyalty-vip-bonus', 21
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'The Terms That Decide a Bonus''s Real Value' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>The headline amount is only part of the story. These terms decide how much a bonus is really worth.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Why It Matters', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Turnover Requirement', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>How much you must bet before withdrawing. Lower is better.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Eligible Games', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Only some games count towards the turnover, usually slots.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'Maximum Bet', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Betting above the limit while a bonus is active can cancel it.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'Maximum Cashout', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Some bonuses cap how much you can withdraw.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'Expiry', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>You need to use the bonus and meet the turnover in time.</p>', 15
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How We Choose the Bonuses We List' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'Every casino in our tables is reviewed by our team before its bonuses appear.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Licensed casinos that accept players from the country listed', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Fair, clearly written bonus terms', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Realistic turnover requirements', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Local currencies and payment methods', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Reliable withdrawals and responsive support', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'top_casinos_by_region', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Top Rated Casinos by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'mode', 'text', 'auto', 2
UNION ALL SELECT @sec, 0, 'moreCount', 'text', '3', 3
UNION ALL SELECT @sec, 0, 'countryCount', 'text', '3', 4
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 5
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Online Casino Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'What is an online casino bonus?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>A promotion that gives you extra money, free spins or rewards, usually in exchange for registering, depositing or playing regularly.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Which casino bonus is best?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>It depends on how you play. New players often start with a welcome bonus; regular players get more from cashback and VIP rewards.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'Can I withdraw bonus money?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Not straight away. You usually need to meet a turnover requirement first.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'Are casino bonuses safe?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Bonuses from licensed, reputable casinos are safe. Always read the terms and avoid casinos on our blacklist.</p>', 9
UNION ALL SELECT @sec, 5, 'question', 'text', 'Do I have to take a bonus?', 10
UNION ALL SELECT @sec, 5, 'answer', 'richtext', '<p>No. You can always play without one, which means no turnover conditions on your deposits.</p>', 11
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Play Responsibly' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Bonuses are for entertainment. Set a budget, take breaks, and never chase losses.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Bankroll Management Guide', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/guides/bankroll-management-101', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Blacklisted Casinos', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/blacklist', 6
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- welcome-bonus
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @bonusHub, 1, 'welcome-bonus', 'Welcome Bonuses', 'Welcome Bonuses at Online Casinos in Southeast Asia {year} | Top Casino Guide', 'Compare welcome bonuses at trusted online casinos in Southeast Asia. Learn how they work, the terms to check and how to claim one safely.', 'draft' FROM DUAL
WHERE @bonusHub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @bonusHub AND slug = 'welcome-bonus');
SET @child = (SELECT id FROM pages WHERE parent_id = @bonusHub AND slug = 'welcome-bonus' LIMIT 1);
SET @page = @child;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Welcome Bonuses at Online Casinos in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>A welcome bonus is the reward an online casino gives new players for signing up and making a first deposit. It usually matches part of your deposit with bonus money, sometimes with free spins added. It''s the most common way to start at a new casino, and the best ones pair a fair match with turnover rules you can actually meet.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Welcome Bonuses Work' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>When you register and make your first deposit, the casino adds bonus money on top, for example a 100% match up to a set amount. Some welcome packages are spread over your first two to four deposits, each with its own match.</p><p>The bonus money can''t be withdrawn straight away. You first need to bet a set amount (the turnover or wagering requirement) on eligible games. Once that''s done, any winnings become real cash you can withdraw.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Key Terms You Should Know About Welcome Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Bonus terms can be confusing. Here''s what the most common ones mean, in plain words.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Simple Explanation', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Match Percentage', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>How much the casino adds to your deposit. A 100% match on a deposit of 100 gives you 100 in bonus money.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Maximum Bonus', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>The most bonus money you can receive, however much you deposit.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'Turnover Requirement', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>How many times you must bet the bonus (sometimes bonus plus deposit) before you can withdraw.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'Minimum Deposit', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>The smallest deposit that qualifies for the bonus.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'Eligible Games', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>The games that count towards the turnover. Slots usually count fully; table and live games often count less or not at all.</p>', 15
UNION ALL SELECT @sec, 6, 'left', 'text', 'Maximum Bet', 16
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>The largest single bet allowed while the bonus is active. Betting more can cancel the bonus.</p>', 17
UNION ALL SELECT @sec, 7, 'left', 'text', 'Expiry', 18
UNION ALL SELECT @sec, 7, 'right', 'richtext', '<p>How long you have to complete the turnover, often 7 to 30 days.</p>', 19
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'link_card_grid', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Welcome Bonuses by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Offers, currencies and payment methods differ from country to country. Pick yours to see the latest welcome bonuses from casinos we''ve reviewed, updated weekly.</p>', 2
UNION ALL SELECT @sec, 0, 'columns', 'text', '3', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Thailand', 4
UNION ALL SELECT @sec, 1, 'description', 'text', 'Welcome Bonuses for Thai players, with bonus codes and terms.', 5
UNION ALL SELECT @sec, 1, 'url', 'text', '/th/bonuses/welcome', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Malaysia', 7
UNION ALL SELECT @sec, 2, 'description', 'text', 'Welcome Bonuses for Malaysian players, with bonus codes and terms.', 8
UNION ALL SELECT @sec, 2, 'url', 'text', '/my/bonuses/welcome', 9
UNION ALL SELECT @sec, 3, 'title', 'text', 'Singapore', 10
UNION ALL SELECT @sec, 3, 'description', 'text', 'Welcome Bonuses for Singaporean players, with bonus codes and terms.', 11
UNION ALL SELECT @sec, 3, 'url', 'text', '/sg/bonuses/welcome', 12
UNION ALL SELECT @sec, 4, 'title', 'text', 'Indonesia', 13
UNION ALL SELECT @sec, 4, 'description', 'text', 'Welcome Bonuses for Indonesian players, with bonus codes and terms.', 14
UNION ALL SELECT @sec, 4, 'url', 'text', '/id/bonuses/welcome', 15
UNION ALL SELECT @sec, 5, 'title', 'text', 'Vietnam', 16
UNION ALL SELECT @sec, 5, 'description', 'text', 'Welcome Bonuses for Vietnamese players, with bonus codes and terms.', 17
UNION ALL SELECT @sec, 5, 'url', 'text', '/vn/bonuses/welcome', 18
UNION ALL SELECT @sec, 6, 'title', 'text', 'Philippines', 19
UNION ALL SELECT @sec, 6, 'description', 'text', 'Welcome Bonuses for Filipino players, with bonus codes and terms.', 20
UNION ALL SELECT @sec, 6, 'url', 'text', '/ph/bonuses/welcome', 21
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Claim a Welcome Bonus Step by Step' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose a trusted casino', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Pick a licensed casino from our reviewed list that accepts players from your country and your preferred payment method.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Register a new account', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Sign up with accurate details. Casinos check your identity before your first withdrawal.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Opt in and deposit', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Select the welcome bonus or enter the bonus code if one is needed, then deposit at least the minimum amount.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Meet the turnover', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Play eligible games until the turnover requirement is complete, staying under the maximum bet.</p>', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Withdraw your winnings', 12
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Once the requirement is met, request a withdrawal using a verified payment method.</p>', 13
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'What to Check Before You Claim' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'A few minutes with the terms can save you from a bonus you can''t use.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'The turnover is achievable within the time limit', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Your favourite games count towards the turnover', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'The maximum bet and maximum win limits are clear', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'The bonus code (if any) is entered before you deposit', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'The casino is licensed and accepts players from your country', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Welcome Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'What is a welcome bonus?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>It''s a reward for new players, usually a percentage match of your first deposit, sometimes with free spins included.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Can I withdraw a welcome bonus straight away?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>No. You need to meet the turnover requirement first. After that, your winnings can be withdrawn.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'Is a bigger welcome bonus always better?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Not always. A smaller bonus with a low turnover requirement is often worth more than a large one you can''t realistically clear.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'Can I claim more than one welcome bonus?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Each casino usually allows one welcome bonus per person, household and payment method. You can claim a welcome bonus at each casino you join.</p>', 9
UNION ALL SELECT @sec, 5, 'question', 'text', 'Do all games count towards the turnover?', 10
UNION ALL SELECT @sec, 5, 'answer', 'richtext', '<p>No. Slots usually count 100%, while table games and live casino often count less or are excluded. Check the bonus terms.</p>', 11
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Discover More Bonus Types' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Compare other ways to get more from your play, or work out a bonus''s real value with our calculator.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'No Deposit Bonuses', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/casino-bonus/no-deposit-bonus', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Free Spins Bonuses', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-bonus/free-spins', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Deposit Bonuses', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-bonus/deposit-bonus', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Cashback Bonuses', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-bonus/cashback', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Loyalty & VIP Bonuses', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-bonus/loyalty-vip-bonus', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'Bonus Calculator', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/calculator', 14
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- no-deposit-bonus
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @bonusHub, 2, 'no-deposit-bonus', 'No Deposit Bonuses', 'No Deposit Bonuses at Online Casinos in Southeast Asia {year} | Top Casino Guide', 'Find no deposit bonuses at trusted Southeast Asian online casinos. Play with free credit or spins, and learn the rules before you claim.', 'draft' FROM DUAL
WHERE @bonusHub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @bonusHub AND slug = 'no-deposit-bonus');
SET @child = (SELECT id FROM pages WHERE parent_id = @bonusHub AND slug = 'no-deposit-bonus' LIMIT 1);
SET @page = @child;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'No Deposit Bonuses at Online Casinos in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>A no deposit bonus lets you try an online casino without putting in any money. You get a small amount of free credit or free spins just for registering. It''s a low-risk way to test the games and the platform, but these bonuses come with strict limits, so it pays to read the terms first.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How No Deposit Bonuses Work' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>After you register (and sometimes verify your phone or email), the casino adds free credit or free spins to your account. You can play eligible games with it straight away.</p><p>Winnings from a no deposit bonus usually have a turnover requirement and a maximum cashout limit, so you can only withdraw up to a set amount. Many casinos also ask for a small deposit before your first withdrawal, to verify your payment method.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Key Terms You Should Know About No Deposit Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Bonus terms can be confusing. Here''s what the most common ones mean, in plain words.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Simple Explanation', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Free Credit', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Bonus money added to your account without a deposit.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Free Spins', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Spins on selected slot games, often part of a no deposit offer.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'Turnover Requirement', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>How much you must bet before winnings can be withdrawn. It''s often higher than for deposit bonuses.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'Maximum Cashout', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>The most you can withdraw from no deposit winnings, for example 50 or 100.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'Eligible Games', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>The games you can play with the bonus, usually selected slots.</p>', 15
UNION ALL SELECT @sec, 6, 'left', 'text', 'Verification', 16
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>Some casinos ask you to verify your phone, email or identity before the bonus is added.</p>', 17
UNION ALL SELECT @sec, 7, 'left', 'text', 'Expiry', 18
UNION ALL SELECT @sec, 7, 'right', 'richtext', '<p>No deposit bonuses often expire quickly, sometimes within 24 to 72 hours.</p>', 19
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'link_card_grid', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'No Deposit Bonuses by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Offers, currencies and payment methods differ from country to country. Pick yours to see the latest no deposit bonuses from casinos we''ve reviewed, updated weekly.</p>', 2
UNION ALL SELECT @sec, 0, 'columns', 'text', '3', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Thailand', 4
UNION ALL SELECT @sec, 1, 'description', 'text', 'No Deposit Bonuses for Thai players, with bonus codes and terms.', 5
UNION ALL SELECT @sec, 1, 'url', 'text', '/th/bonuses/no_deposit', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Malaysia', 7
UNION ALL SELECT @sec, 2, 'description', 'text', 'No Deposit Bonuses for Malaysian players, with bonus codes and terms.', 8
UNION ALL SELECT @sec, 2, 'url', 'text', '/my/bonuses/no_deposit', 9
UNION ALL SELECT @sec, 3, 'title', 'text', 'Singapore', 10
UNION ALL SELECT @sec, 3, 'description', 'text', 'No Deposit Bonuses for Singaporean players, with bonus codes and terms.', 11
UNION ALL SELECT @sec, 3, 'url', 'text', '/sg/bonuses/no_deposit', 12
UNION ALL SELECT @sec, 4, 'title', 'text', 'Indonesia', 13
UNION ALL SELECT @sec, 4, 'description', 'text', 'No Deposit Bonuses for Indonesian players, with bonus codes and terms.', 14
UNION ALL SELECT @sec, 4, 'url', 'text', '/id/bonuses/no_deposit', 15
UNION ALL SELECT @sec, 5, 'title', 'text', 'Vietnam', 16
UNION ALL SELECT @sec, 5, 'description', 'text', 'No Deposit Bonuses for Vietnamese players, with bonus codes and terms.', 17
UNION ALL SELECT @sec, 5, 'url', 'text', '/vn/bonuses/no_deposit', 18
UNION ALL SELECT @sec, 6, 'title', 'text', 'Philippines', 19
UNION ALL SELECT @sec, 6, 'description', 'text', 'No Deposit Bonuses for Filipino players, with bonus codes and terms.', 20
UNION ALL SELECT @sec, 6, 'url', 'text', '/ph/bonuses/no_deposit', 21
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Claim a No Deposit Bonus Step by Step' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Pick a casino with a no deposit offer', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Choose a licensed casino from our list that offers a no deposit bonus in your country.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Create your account', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Register with your real details. Some casinos ask you to confirm your phone number or email.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Claim the bonus', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>The bonus may be added automatically, or you may need to enter a bonus code or contact support.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Play eligible games', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Use the credit or spins on the games listed in the terms, before the bonus expires.</p>', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Meet the terms and withdraw', 12
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Complete the turnover, then withdraw up to the maximum cashout amount.</p>', 13
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'What to Check Before You Claim' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'A few minutes with the terms can save you from a bonus you can''t use.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'The maximum cashout is worth your time', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'The turnover requirement is realistic', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'You know how long the bonus lasts', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'You know whether a deposit is needed before withdrawing', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'The casino is licensed and well reviewed', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about No Deposit Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'Is a no deposit bonus really free?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>You don''t need to deposit to claim it, but winnings come with conditions such as turnover requirements and a maximum cashout.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Can I win real money with a no deposit bonus?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Yes, as long as you meet the terms. The amount you can withdraw is usually capped.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'Why do casinos give no deposit bonuses?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>They let new players try the casino without risk, in the hope that they''ll stay and deposit later.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'Do I need a bonus code?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Some offers are added automatically, others need a code. Our bonus tables show the code when one is needed.</p>', 9
UNION ALL SELECT @sec, 5, 'question', 'text', 'Can I claim several no deposit bonuses?', 10
UNION ALL SELECT @sec, 5, 'answer', 'richtext', '<p>Usually only one per casino and per person. You can claim one at each casino you join.</p>', 11
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Discover More Bonus Types' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Compare other ways to get more from your play, or work out a bonus''s real value with our calculator.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Welcome Bonuses', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/casino-bonus/welcome-bonus', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Free Spins Bonuses', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-bonus/free-spins', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Deposit Bonuses', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-bonus/deposit-bonus', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Cashback Bonuses', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-bonus/cashback', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Loyalty & VIP Bonuses', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-bonus/loyalty-vip-bonus', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'Bonus Calculator', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/calculator', 14
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- free-spins
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @bonusHub, 3, 'free-spins', 'Free Spins Bonuses', 'Free Spins Bonuses at Online Casinos in Southeast Asia {year} | Top Casino Guide', 'Get free spins bonuses at trusted online casinos in Southeast Asia. Learn how free spins work, their value, and the terms to check.', 'draft' FROM DUAL
WHERE @bonusHub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @bonusHub AND slug = 'free-spins');
SET @child = (SELECT id FROM pages WHERE parent_id = @bonusHub AND slug = 'free-spins' LIMIT 1);
SET @page = @child;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Free Spins Bonuses at Online Casinos in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Free spins let you play selected slot games without using your own balance. They come as part of welcome packages, as no deposit offers, or as regular promotions for existing players. They''re one of the easiest bonuses to understand, but the value of each spin and the terms on winnings make a big difference.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Free Spins Bonuses Work' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>The casino gives you a set number of spins on one or more slot games, each at a fixed value per spin. Whatever you win is added to your account, usually as bonus money.</p><p>Winnings from free spins often have a turnover requirement before you can withdraw them, and sometimes a maximum win. Wager-free spins, where winnings are paid as cash, are rarer and especially good value.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Key Terms You Should Know About Free Spins Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Bonus terms can be confusing. Here''s what the most common ones mean, in plain words.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Simple Explanation', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Spin Value', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>How much each free spin is worth. Ten spins at 1 each are worth more than fifty at 0.10.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Eligible Slots', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>The slot games the spins can be used on.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'Turnover on Winnings', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>How many times you must bet your free spin winnings before withdrawing.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'Wager-Free Spins', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Spins whose winnings are paid as real cash, with no turnover.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'Maximum Win', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>The cap on how much you can win from the spins.</p>', 15
UNION ALL SELECT @sec, 6, 'left', 'text', 'Expiry', 16
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>How long you have to use the spins and then meet the turnover.</p>', 17
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'link_card_grid', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Free Spins Bonuses by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Offers, currencies and payment methods differ from country to country. Pick yours to see the latest free spins bonuses from casinos we''ve reviewed, updated weekly.</p>', 2
UNION ALL SELECT @sec, 0, 'columns', 'text', '3', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Thailand', 4
UNION ALL SELECT @sec, 1, 'description', 'text', 'Free Spins Bonuses for Thai players, with bonus codes and terms.', 5
UNION ALL SELECT @sec, 1, 'url', 'text', '/th/bonuses/free_spins', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Malaysia', 7
UNION ALL SELECT @sec, 2, 'description', 'text', 'Free Spins Bonuses for Malaysian players, with bonus codes and terms.', 8
UNION ALL SELECT @sec, 2, 'url', 'text', '/my/bonuses/free_spins', 9
UNION ALL SELECT @sec, 3, 'title', 'text', 'Singapore', 10
UNION ALL SELECT @sec, 3, 'description', 'text', 'Free Spins Bonuses for Singaporean players, with bonus codes and terms.', 11
UNION ALL SELECT @sec, 3, 'url', 'text', '/sg/bonuses/free_spins', 12
UNION ALL SELECT @sec, 4, 'title', 'text', 'Indonesia', 13
UNION ALL SELECT @sec, 4, 'description', 'text', 'Free Spins Bonuses for Indonesian players, with bonus codes and terms.', 14
UNION ALL SELECT @sec, 4, 'url', 'text', '/id/bonuses/free_spins', 15
UNION ALL SELECT @sec, 5, 'title', 'text', 'Vietnam', 16
UNION ALL SELECT @sec, 5, 'description', 'text', 'Free Spins Bonuses for Vietnamese players, with bonus codes and terms.', 17
UNION ALL SELECT @sec, 5, 'url', 'text', '/vn/bonuses/free_spins', 18
UNION ALL SELECT @sec, 6, 'title', 'text', 'Philippines', 19
UNION ALL SELECT @sec, 6, 'description', 'text', 'Free Spins Bonuses for Filipino players, with bonus codes and terms.', 20
UNION ALL SELECT @sec, 6, 'url', 'text', '/ph/bonuses/free_spins', 21
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Claim a Free Spins Step by Step' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Find a free spins offer', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Compare free spins offers from licensed casinos in our list.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Register or log in', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Free spins can be for new players, existing players, or both.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Activate the spins', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Deposit if needed, enter the bonus code if there is one, or opt in from the promotions page.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Play the selected slot', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Open the eligible slot game. Your free spins are usually shown on screen.</p>', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Clear the winnings', 12
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Meet any turnover on your winnings, then withdraw.</p>', 13
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'What to Check Before You Claim' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'A few minutes with the terms can save you from a bonus you can''t use.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'The value per spin, not just the number of spins', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Whether winnings have a turnover requirement', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Which slots the spins can be used on', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Any maximum win limit', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'How long you have to use them', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Free Spins Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'What are free spins?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>Spins on selected slot games that you don''t pay for. Winnings are added to your account, usually as bonus money.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Are free spin winnings real money?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>They become real money once you meet any turnover requirement. Wager-free spins pay winnings as cash straight away.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'Can I choose which slot to play?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Usually not. Free spins are tied to specific games named in the terms.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'What''s a good free spins offer?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Look at the value per spin, the turnover on winnings and the maximum win, rather than just the number of spins.</p>', 9
UNION ALL SELECT @sec, 5, 'question', 'text', 'Do existing players get free spins?', 10
UNION ALL SELECT @sec, 5, 'answer', 'richtext', '<p>Many casinos run weekly or reload free spins promotions for existing players.</p>', 11
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Discover More Bonus Types' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Compare other ways to get more from your play, or work out a bonus''s real value with our calculator.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Welcome Bonuses', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/casino-bonus/welcome-bonus', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'No Deposit Bonuses', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-bonus/no-deposit-bonus', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Deposit Bonuses', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-bonus/deposit-bonus', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Cashback Bonuses', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-bonus/cashback', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Loyalty & VIP Bonuses', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-bonus/loyalty-vip-bonus', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'Bonus Calculator', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/calculator', 14
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- deposit-bonus
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @bonusHub, 4, 'deposit-bonus', 'Deposit Bonuses', 'Deposit Bonuses at Online Casinos in Southeast Asia {year} | Top Casino Guide', 'Compare deposit and reload bonuses at trusted Southeast Asian online casinos. Learn how match bonuses work and how to get the best value.', 'draft' FROM DUAL
WHERE @bonusHub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @bonusHub AND slug = 'deposit-bonus');
SET @child = (SELECT id FROM pages WHERE parent_id = @bonusHub AND slug = 'deposit-bonus' LIMIT 1);
SET @page = @child;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Deposit Bonuses at Online Casinos in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>A deposit bonus, often called a reload or match bonus, adds bonus money to a deposit you make. Unlike a welcome bonus, many deposit bonuses are for existing players, offered weekly, on weekends, or for using a particular payment method. Used well, they stretch your bankroll further.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Deposit Bonuses Work' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>When you make a qualifying deposit, the casino adds a percentage of it as bonus money, for example 50% up to a set amount. Some offers need a bonus code or an opt-in on the promotions page before you deposit.</p><p>As with other bonuses, the bonus money has a turnover requirement, and only eligible games count. Once you''ve met it, your winnings can be withdrawn.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Key Terms You Should Know About Deposit Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Bonus terms can be confusing. Here''s what the most common ones mean, in plain words.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Simple Explanation', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Reload Bonus', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>A deposit bonus for existing players, often weekly or on set days.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Match Percentage', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>The share of your deposit added as bonus money.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'Maximum Bonus', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>The most bonus money one deposit can earn.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'Turnover Requirement', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>How much you must bet before withdrawing.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'Minimum Deposit', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>The smallest deposit that qualifies.</p>', 15
UNION ALL SELECT @sec, 6, 'left', 'text', 'Payment Method Rules', 16
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>Some deposit bonuses only apply to certain payment methods, or exclude some e-wallets.</p>', 17
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'link_card_grid', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Deposit Bonuses by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Offers, currencies and payment methods differ from country to country. Pick yours to see the latest deposit bonuses from casinos we''ve reviewed, updated weekly.</p>', 2
UNION ALL SELECT @sec, 0, 'columns', 'text', '3', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Thailand', 4
UNION ALL SELECT @sec, 1, 'description', 'text', 'Deposit Bonuses for Thai players, with bonus codes and terms.', 5
UNION ALL SELECT @sec, 1, 'url', 'text', '/th/bonuses/deposit', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Malaysia', 7
UNION ALL SELECT @sec, 2, 'description', 'text', 'Deposit Bonuses for Malaysian players, with bonus codes and terms.', 8
UNION ALL SELECT @sec, 2, 'url', 'text', '/my/bonuses/deposit', 9
UNION ALL SELECT @sec, 3, 'title', 'text', 'Singapore', 10
UNION ALL SELECT @sec, 3, 'description', 'text', 'Deposit Bonuses for Singaporean players, with bonus codes and terms.', 11
UNION ALL SELECT @sec, 3, 'url', 'text', '/sg/bonuses/deposit', 12
UNION ALL SELECT @sec, 4, 'title', 'text', 'Indonesia', 13
UNION ALL SELECT @sec, 4, 'description', 'text', 'Deposit Bonuses for Indonesian players, with bonus codes and terms.', 14
UNION ALL SELECT @sec, 4, 'url', 'text', '/id/bonuses/deposit', 15
UNION ALL SELECT @sec, 5, 'title', 'text', 'Vietnam', 16
UNION ALL SELECT @sec, 5, 'description', 'text', 'Deposit Bonuses for Vietnamese players, with bonus codes and terms.', 17
UNION ALL SELECT @sec, 5, 'url', 'text', '/vn/bonuses/deposit', 18
UNION ALL SELECT @sec, 6, 'title', 'text', 'Philippines', 19
UNION ALL SELECT @sec, 6, 'description', 'text', 'Deposit Bonuses for Filipino players, with bonus codes and terms.', 20
UNION ALL SELECT @sec, 6, 'url', 'text', '/ph/bonuses/deposit', 21
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Claim a Deposit Bonus Step by Step' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Check the promotions page', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Look for deposit or reload bonuses at the casino, or compare them in our tables.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Read the terms', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Check the match, maximum bonus, turnover and eligible payment methods.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Opt in or enter the code', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Activate the bonus before you deposit, if required.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Make your deposit', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Deposit at least the minimum amount with an eligible payment method.</p>', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Play and withdraw', 12
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Meet the turnover on eligible games, then withdraw your winnings.</p>', 13
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'What to Check Before You Claim' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'A few minutes with the terms can save you from a bonus you can''t use.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Opt in or enter the code before depositing', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Your payment method qualifies for the bonus', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'The turnover fits how much you plan to play', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Only one bonus may be active at a time', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Any maximum bet while the bonus is active', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Deposit Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'What''s the difference between a deposit bonus and a welcome bonus?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>A welcome bonus is for your first deposit(s) as a new player. Deposit or reload bonuses are usually for existing players.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'How often can I claim a reload bonus?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>It depends on the casino. Many offer them weekly or on specific days.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'Do deposit bonuses have turnover requirements?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Almost always. Check the requirement before you claim.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'Can I turn down a deposit bonus?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Yes. If you prefer to play without conditions, simply don''t opt in or enter the code.</p>', 9
UNION ALL SELECT @sec, 5, 'question', 'text', 'Which payment methods qualify?', 10
UNION ALL SELECT @sec, 5, 'answer', 'richtext', '<p>It varies. Some casinos exclude certain e-wallets from bonuses, so check the terms first.</p>', 11
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Discover More Bonus Types' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Compare other ways to get more from your play, or work out a bonus''s real value with our calculator.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Welcome Bonuses', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/casino-bonus/welcome-bonus', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'No Deposit Bonuses', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-bonus/no-deposit-bonus', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Free Spins Bonuses', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-bonus/free-spins', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Cashback Bonuses', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-bonus/cashback', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Loyalty & VIP Bonuses', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-bonus/loyalty-vip-bonus', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'Bonus Calculator', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/calculator', 14
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- cashback
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @bonusHub, 5, 'cashback', 'Cashback Bonuses', 'Cashback Bonuses at Online Casinos in Southeast Asia {year} | Top Casino Guide', 'Learn how casino cashback bonuses work at trusted Southeast Asian online casinos, how they''re calculated and what to look for.', 'draft' FROM DUAL
WHERE @bonusHub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @bonusHub AND slug = 'cashback');
SET @child = (SELECT id FROM pages WHERE parent_id = @bonusHub AND slug = 'cashback' LIMIT 1);
SET @page = @child;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Cashback Bonuses at Online Casinos in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>A cashback bonus gives you back a percentage of your losses over a set period, for example 10% of your net losses each week. It doesn''t make you win, but it softens a losing run. Cashback is popular with regular players because it often has low or no turnover requirements.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Cashback Bonuses Work' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>The casino works out your net losses (deposits minus withdrawals and remaining balance, or bets minus wins) over a period such as a day or a week. It then returns a percentage of that amount to your account.</p><p>Cashback may be paid as real cash or as bonus money with a small turnover requirement. Some casinos pay it automatically; others ask you to claim it.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Key Terms You Should Know About Cashback Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Bonus terms can be confusing. Here''s what the most common ones mean, in plain words.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Simple Explanation', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Cashback Rate', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>The percentage of net losses returned, for example 5% to 20%.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Calculation Period', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>The time over which losses are counted: daily, weekly or monthly.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'Net Losses', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Your losses over the period after wins are taken into account.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'Maximum Cashback', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>The most cashback you can receive in one period.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'Turnover on Cashback', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>Some cashback must be bet a few times before withdrawing; the best is paid as cash.</p>', 15
UNION ALL SELECT @sec, 6, 'left', 'text', 'Eligible Games', 16
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>Some games may not count towards cashback.</p>', 17
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'link_card_grid', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Cashback Bonuses by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Offers, currencies and payment methods differ from country to country. Pick yours to see the latest cashback bonuses from casinos we''ve reviewed, updated weekly.</p>', 2
UNION ALL SELECT @sec, 0, 'columns', 'text', '3', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Thailand', 4
UNION ALL SELECT @sec, 1, 'description', 'text', 'Cashback Bonuses for Thai players, with bonus codes and terms.', 5
UNION ALL SELECT @sec, 1, 'url', 'text', '/th/bonuses/cashback', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Malaysia', 7
UNION ALL SELECT @sec, 2, 'description', 'text', 'Cashback Bonuses for Malaysian players, with bonus codes and terms.', 8
UNION ALL SELECT @sec, 2, 'url', 'text', '/my/bonuses/cashback', 9
UNION ALL SELECT @sec, 3, 'title', 'text', 'Singapore', 10
UNION ALL SELECT @sec, 3, 'description', 'text', 'Cashback Bonuses for Singaporean players, with bonus codes and terms.', 11
UNION ALL SELECT @sec, 3, 'url', 'text', '/sg/bonuses/cashback', 12
UNION ALL SELECT @sec, 4, 'title', 'text', 'Indonesia', 13
UNION ALL SELECT @sec, 4, 'description', 'text', 'Cashback Bonuses for Indonesian players, with bonus codes and terms.', 14
UNION ALL SELECT @sec, 4, 'url', 'text', '/id/bonuses/cashback', 15
UNION ALL SELECT @sec, 5, 'title', 'text', 'Vietnam', 16
UNION ALL SELECT @sec, 5, 'description', 'text', 'Cashback Bonuses for Vietnamese players, with bonus codes and terms.', 17
UNION ALL SELECT @sec, 5, 'url', 'text', '/vn/bonuses/cashback', 18
UNION ALL SELECT @sec, 6, 'title', 'text', 'Philippines', 19
UNION ALL SELECT @sec, 6, 'description', 'text', 'Cashback Bonuses for Filipino players, with bonus codes and terms.', 20
UNION ALL SELECT @sec, 6, 'url', 'text', '/ph/bonuses/cashback', 21
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Claim a Cashback Bonus Step by Step' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose a casino with cashback', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Compare cashback rates and limits in our list.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Check how it''s calculated', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Confirm the period, the rate and whether it''s paid as cash or bonus money.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Play as usual', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Play eligible games during the cashback period.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Receive or claim your cashback', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>It''s either credited automatically or claimed from the promotions page or support.</p>', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Use or withdraw it', 12
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Withdraw cash cashback, or meet any turnover first.</p>', 13
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'What to Check Before You Claim' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'A few minutes with the terms can save you from a bonus you can''t use.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Whether cashback is paid as cash or bonus money', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'The maximum cashback per period', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Which games count', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Whether bonus play is excluded from the calculation', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'When and how it''s paid', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Cashback Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'How is cashback calculated?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>As a percentage of your net losses over a set period, such as a week. Each casino explains its exact method in the terms.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Is cashback paid in real money?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Sometimes. Some casinos pay cash; others pay bonus money with a small turnover requirement.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'Do I need to claim cashback?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>At some casinos it''s automatic; at others you claim it from the promotions page or by contacting support.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'Is cashback better than a deposit bonus?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>It suits regular players who want to soften losses. Deposit bonuses add more up front but usually have higher turnover.</p>', 9
UNION ALL SELECT @sec, 5, 'question', 'text', 'Can I get cashback and other bonuses together?', 10
UNION ALL SELECT @sec, 5, 'answer', 'richtext', '<p>Often, but play with an active bonus may not count towards cashback. Check the terms.</p>', 11
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Discover More Bonus Types' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Compare other ways to get more from your play, or work out a bonus''s real value with our calculator.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Welcome Bonuses', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/casino-bonus/welcome-bonus', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'No Deposit Bonuses', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-bonus/no-deposit-bonus', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Free Spins Bonuses', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-bonus/free-spins', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Deposit Bonuses', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-bonus/deposit-bonus', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Loyalty & VIP Bonuses', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-bonus/loyalty-vip-bonus', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'Bonus Calculator', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/calculator', 14
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- loyalty-vip-bonus
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @bonusHub, 6, 'loyalty-vip-bonus', 'Loyalty & VIP Bonuses', 'Loyalty & VIP Bonuses at Online Casinos in Southeast Asia {year} | Top Casino Guide', 'See how loyalty and VIP programmes work at trusted online casinos in Southeast Asia: points, tiers, rewards and what to look for.', 'draft' FROM DUAL
WHERE @bonusHub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @bonusHub AND slug = 'loyalty-vip-bonus');
SET @child = (SELECT id FROM pages WHERE parent_id = @bonusHub AND slug = 'loyalty-vip-bonus' LIMIT 1);
SET @page = @child;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Loyalty & VIP Bonuses at Online Casinos in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Loyalty and VIP programmes reward players for playing regularly. You earn points as you bet, climb tiers, and unlock rewards such as cashback, faster withdrawals, birthday bonuses and a personal account manager. They don''t cost anything to join, but the value depends a lot on the casino.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Loyalty & VIP Bonuses Work' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Every bet you place earns loyalty points. As your points add up, you move up the programme''s tiers. Each tier brings better rewards, and points can often be exchanged for bonus money or free spins.</p><p>Top VIP tiers are usually by invitation and may include higher withdrawal limits, exclusive promotions and dedicated support. Points and tiers can expire if you stop playing, so check the rules.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Key Terms You Should Know About Loyalty & VIP Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Bonus terms can be confusing. Here''s what the most common ones mean, in plain words.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Simple Explanation', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Loyalty Points', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Points earned for every bet, often called comp points.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Tiers / Levels', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Levels in the programme. Higher tiers unlock better rewards.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'Points Conversion', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>How many points you need for a reward such as bonus money.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'VIP Manager', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>A personal contact for high-tier players.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'Tier Requirements', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>How many points or how much play keeps you in a tier.</p>', 15
UNION ALL SELECT @sec, 6, 'left', 'text', 'Exclusive Rewards', 16
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>Perks such as birthday bonuses, faster withdrawals or event invitations.</p>', 17
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'link_card_grid', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Loyalty & VIP Bonuses by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Offers, currencies and payment methods differ from country to country. Pick yours to see the latest loyalty & vip bonuses from casinos we''ve reviewed, updated weekly.</p>', 2
UNION ALL SELECT @sec, 0, 'columns', 'text', '3', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Thailand', 4
UNION ALL SELECT @sec, 1, 'description', 'text', 'Loyalty & VIP Bonuses for Thai players, with bonus codes and terms.', 5
UNION ALL SELECT @sec, 1, 'url', 'text', '/th/bonuses/loyalty_vip', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Malaysia', 7
UNION ALL SELECT @sec, 2, 'description', 'text', 'Loyalty & VIP Bonuses for Malaysian players, with bonus codes and terms.', 8
UNION ALL SELECT @sec, 2, 'url', 'text', '/my/bonuses/loyalty_vip', 9
UNION ALL SELECT @sec, 3, 'title', 'text', 'Singapore', 10
UNION ALL SELECT @sec, 3, 'description', 'text', 'Loyalty & VIP Bonuses for Singaporean players, with bonus codes and terms.', 11
UNION ALL SELECT @sec, 3, 'url', 'text', '/sg/bonuses/loyalty_vip', 12
UNION ALL SELECT @sec, 4, 'title', 'text', 'Indonesia', 13
UNION ALL SELECT @sec, 4, 'description', 'text', 'Loyalty & VIP Bonuses for Indonesian players, with bonus codes and terms.', 14
UNION ALL SELECT @sec, 4, 'url', 'text', '/id/bonuses/loyalty_vip', 15
UNION ALL SELECT @sec, 5, 'title', 'text', 'Vietnam', 16
UNION ALL SELECT @sec, 5, 'description', 'text', 'Loyalty & VIP Bonuses for Vietnamese players, with bonus codes and terms.', 17
UNION ALL SELECT @sec, 5, 'url', 'text', '/vn/bonuses/loyalty_vip', 18
UNION ALL SELECT @sec, 6, 'title', 'text', 'Philippines', 19
UNION ALL SELECT @sec, 6, 'description', 'text', 'Loyalty & VIP Bonuses for Filipino players, with bonus codes and terms.', 20
UNION ALL SELECT @sec, 6, 'url', 'text', '/ph/bonuses/loyalty_vip', 21
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Claim a Loyalty / VIP Bonus Step by Step' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Join a casino with a loyalty programme', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Most casinos enrol you automatically when you register.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Earn points as you play', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Points are added for real-money bets on eligible games.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Track your tier', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Check your progress in your account or the VIP page.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Redeem your rewards', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Exchange points for bonuses, or enjoy the perks of your tier.</p>', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Keep an eye on expiry', 12
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Use your points before they expire and know what keeps your tier.</p>', 13
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'What to Check Before You Claim' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'A few minutes with the terms can save you from a bonus you can''t use.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'How quickly points are earned on the games you play', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'What points are worth when exchanged', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Whether rewards have turnover requirements', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Whether points or tiers expire', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Play within your budget, not to chase tiers', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Loyalty & VIP Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'How do I join a casino VIP programme?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>Most casinos enrol every player in the loyalty programme automatically. The highest VIP tiers are often by invitation.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'What rewards do VIP players get?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Typically cashback, reload bonuses, free spins, faster withdrawals, higher limits and a personal account manager.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'Do loyalty points expire?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>At many casinos, yes, if your account is inactive for a period. Check the programme rules.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'Are VIP bonuses worth it?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>They can be, if you already play regularly. Never play more than you planned just to reach a tier.</p>', 9
UNION ALL SELECT @sec, 5, 'question', 'text', 'Can I lose my VIP tier?', 10
UNION ALL SELECT @sec, 5, 'answer', 'richtext', '<p>Some programmes review tiers monthly or quarterly, so your level can drop if your play decreases.</p>', 11
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Discover More Bonus Types' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Compare other ways to get more from your play, or work out a bonus''s real value with our calculator.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Welcome Bonuses', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/casino-bonus/welcome-bonus', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'No Deposit Bonuses', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-bonus/no-deposit-bonus', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Free Spins Bonuses', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-bonus/free-spins', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Deposit Bonuses', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-bonus/deposit-bonus', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Cashback Bonuses', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-bonus/cashback', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'Bonus Calculator', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/calculator', 14
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- casino-games
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT NULL, (SELECT COALESCE(MAX(p2.sort_order), 0) + 1 FROM pages p2 WHERE p2.parent_id IS NULL AND p2.kind = 'page'), 'casino-games', 'Casino Games', 'Online Casino Games in Southeast Asia {year} | Top Casino Guide', 'Guides to every popular online casino game in Southeast Asia: baccarat, blackjack, roulette, Sic Bo, slots, live casino, sports betting and more.', 'draft' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE parent_id IS NULL AND slug = 'casino-games');
SET @gameHub = (SELECT id FROM pages WHERE parent_id IS NULL AND slug = 'casino-games' LIMIT 1);
SET @page = @gameHub;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Online Casino Games in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>From baccarat and Sic Bo to slots, live casino and sports betting, each game has its own rules, odds and strategies. Choose a game to learn how it works and where to play it at casinos we''ve reviewed.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'link_card_grid', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Choose a Game' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Simple guides to the most popular games played across Southeast Asia.</p>', 2
UNION ALL SELECT @sec, 0, 'columns', 'text', '3', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Blackjack', 4
UNION ALL SELECT @sec, 1, 'description', 'text', 'Blackjack is a card game where you play against the dealer, not other players.', 5
UNION ALL SELECT @sec, 1, 'url', 'text', '/casino-games/blackjack', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Baccarat', 7
UNION ALL SELECT @sec, 2, 'description', 'text', 'Baccarat is one of the most popular casino games in Asia, loved for its simple rules and fast rounds.', 8
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-games/baccarat', 9
UNION ALL SELECT @sec, 3, 'title', 'text', 'Roulette', 10
UNION ALL SELECT @sec, 3, 'description', 'text', 'Roulette is a classic casino game of chance.', 11
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-games/roulette', 12
UNION ALL SELECT @sec, 4, 'title', 'text', 'Sic Bo', 13
UNION ALL SELECT @sec, 4, 'description', 'text', 'Sic Bo is a traditional Chinese dice game that''s a favourite across Southeast Asia.', 14
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-games/sic-bo', 15
UNION ALL SELECT @sec, 5, 'title', 'text', 'Bingo', 16
UNION ALL SELECT @sec, 5, 'description', 'text', 'Online bingo brings the familiar numbers game to your screen.', 17
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-games/bingo', 18
UNION ALL SELECT @sec, 6, 'title', 'text', 'Sports Betting', 19
UNION ALL SELECT @sec, 6, 'description', 'text', 'Sports betting lets you back the outcome of real matches, from football and badminton to basketball and motor racing.', 20
UNION ALL SELECT @sec, 6, 'url', 'text', '/casino-games/sports-betting', 21
UNION ALL SELECT @sec, 7, 'title', 'text', 'Video Poker', 22
UNION ALL SELECT @sec, 7, 'description', 'text', 'Video poker combines the simplicity of a slot machine with the decisions of poker.', 23
UNION ALL SELECT @sec, 7, 'url', 'text', '/casino-games/video-poker', 24
UNION ALL SELECT @sec, 8, 'title', 'text', 'Live Casino', 25
UNION ALL SELECT @sec, 8, 'description', 'text', 'Live casino streams real dealers, real cards and real wheels to your screen in real time.', 26
UNION ALL SELECT @sec, 8, 'url', 'text', '/casino-games/live-casino', 27
UNION ALL SELECT @sec, 9, 'title', 'text', 'Online Slots', 28
UNION ALL SELECT @sec, 9, 'description', 'text', 'Online slots are the most popular casino games, with thousands of themes, features and jackpots.', 29
UNION ALL SELECT @sec, 9, 'url', 'text', '/casino-games/online-slots', 30
UNION ALL SELECT @sec, 10, 'title', 'text', 'eSports Betting', 31
UNION ALL SELECT @sec, 10, 'description', 'text', 'eSports betting lets you back professional gaming teams in titles such as Dota 2, Mobile Legends: Bang Bang, Valorant and Counter-Strike.', 32
UNION ALL SELECT @sec, 10, 'url', 'text', '/casino-games/esports-betting', 33
UNION ALL SELECT @sec, 11, 'title', 'text', '4D Online Betting', 34
UNION ALL SELECT @sec, 11, 'description', 'text', '4D is a hugely popular number game in Malaysia and Singapore.', 35
UNION ALL SELECT @sec, 11, 'url', 'text', '/casino-games/4d-online-betting', 36
UNION ALL SELECT @sec, 12, 'title', 'text', 'Fishing Games', 37
UNION ALL SELECT @sec, 12, 'description', 'text', 'Fishing games are arcade-style casino games that are especially popular in Asia.', 38
UNION ALL SELECT @sec, 12, 'url', 'text', '/casino-games/fishing-online', 39
UNION ALL SELECT @sec, 13, 'title', 'text', 'Online Lottery', 40
UNION ALL SELECT @sec, 13, 'description', 'text', 'Online lottery games let you pick numbers and win if they match the draw.', 41
UNION ALL SELECT @sec, 13, 'url', 'text', '/casino-games/lottery-online', 42
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Choose a Game' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'The right game depends on what you enjoy and how you like to play.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Low house edge: blackjack, baccarat (Banker) and European roulette', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Simple and fast: Sic Bo, slots and fishing games', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Real-casino feel: live dealer tables', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Following matches: sports and eSports betting', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Whatever you play, set a budget first', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'top_casinos_by_region', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Top Rated Casinos by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'mode', 'text', 'auto', 2
UNION ALL SELECT @sec, 0, 'moreCount', 'text', '3', 3
UNION ALL SELECT @sec, 0, 'countryCount', 'text', '3', 4
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 5
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Online Casino Games' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'Which casino game has the best odds?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>Blackjack with basic strategy, the Banker bet in baccarat, and European roulette have some of the lowest house edges.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Are online casino games fair?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>At licensed casinos, games use certified random number generators or real equipment in live studios, and are regularly audited.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'Can I play casino games for free?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Many casinos offer demo versions of slots and table games. Live dealer games need real money.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'What''s the most popular casino game in Southeast Asia?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Baccarat, slots and live casino games are among the most played across the region.</p>', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Play Responsibly' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Casino games are for entertainment. Set limits and take breaks.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Bankroll Management Guide', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/guides/bankroll-management-101', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Casino Bonuses', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-bonus', 6
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- blackjack
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @gameHub, 1, 'blackjack', 'Blackjack', 'Blackjack Online in Southeast Asia {year} | Top Casino Guide', 'Learn to play online blackjack: rules, card values, basic strategy and where to play at trusted Southeast Asian casinos.', 'draft' FROM DUAL
WHERE @gameHub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @gameHub AND slug = 'blackjack');
SET @child = (SELECT id FROM pages WHERE parent_id = @gameHub AND slug = 'blackjack' LIMIT 1);
SET @page = @child;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Blackjack Online in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Blackjack is a card game where you play against the dealer, not other players. The goal is simple: finish with a hand closer to 21 than the dealer''s without going over. With smart decisions, it has one of the lowest house edges in the casino.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Blackjack Works' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>You and the dealer each get two cards. Number cards count at face value, picture cards count 10, and an ace counts 1 or 11. You then decide to hit (take a card), stand, double down or split pairs.</p><p>If you go over 21 you bust and lose. The dealer must draw to a set total, usually 17. A blackjack (an ace and a 10-value card) usually pays 3 to 2.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Blackjack Terms Explained' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>The words you''ll see most often when playing blackjack, explained simply.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What It Means', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Hit', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Take another card.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Stand', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Keep your current hand.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'Double Down', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Double your bet and take exactly one more card.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'Split', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Turn a pair into two separate hands, each with its own bet.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'Bust', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>Going over 21, which loses the hand.</p>', 15
UNION ALL SELECT @sec, 6, 'left', 'text', 'Insurance', 16
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>A side bet when the dealer shows an ace. It usually favours the house.</p>', 17
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Start Playing Blackjack' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose a table', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Pick a blackjack game with stakes that suit your budget, including live dealer tables.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Place your bet', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Set your stake before the cards are dealt.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Play your hand', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Hit, stand, double or split based on your cards and the dealer''s up card.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Dealer plays', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>The dealer reveals their hidden card and draws to the house rules.</p>', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Settle the round', 12
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Beat the dealer without busting to win.</p>', 13
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Blackjack Tips from Our Experts' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'Simple habits that help you play smarter and stay in control.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Learn basic strategy; it reduces the house edge', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Always split aces and eights', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Never split tens or fives', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Avoid insurance bets', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Prefer tables that pay 3:2 for blackjack, not 6:5', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'top_casinos_by_region', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Where to Play Blackjack: Top Rated Casinos by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'mode', 'text', 'auto', 2
UNION ALL SELECT @sec, 0, 'moreCount', 'text', '0', 3
UNION ALL SELECT @sec, 0, 'countryCount', 'text', '3', 4
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 5
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Blackjack' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'Is online blackjack fair?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>At licensed casinos, games use certified random number generators, and live tables use real cards and dealers.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'What is basic strategy?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>A chart of the mathematically best decision for every hand against every dealer card.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'Can I play blackjack for free?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Many casinos offer demo versions of RNG blackjack. Live dealer tables need real money.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'What''s the house edge in blackjack?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>With basic strategy and good rules, it can be around 0.5% or lower.</p>', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Keep Exploring' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Learn more, or try another game.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Guide: How to Play Blackjack', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/guides/how-to-play-blackjack', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Baccarat', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-games/baccarat', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Roulette', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-games/roulette', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Sic Bo', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-games/sic-bo', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Bingo', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-games/bingo', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'Sports Betting', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/casino-games/sports-betting', 14
UNION ALL SELECT @sec, 7, 'label', 'text', 'All Casino Games', 15
UNION ALL SELECT @sec, 7, 'url', 'text', '/casino-games', 16
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- baccarat
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @gameHub, 2, 'baccarat', 'Baccarat', 'Baccarat Online in Southeast Asia {year} | Top Casino Guide', 'Learn online baccarat: Player, Banker and Tie bets, card values, odds and where to play at trusted casinos in Southeast Asia.', 'draft' FROM DUAL
WHERE @gameHub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @gameHub AND slug = 'baccarat');
SET @child = (SELECT id FROM pages WHERE parent_id = @gameHub AND slug = 'baccarat' LIMIT 1);
SET @page = @child;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Baccarat Online in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Baccarat is one of the most popular casino games in Asia, loved for its simple rules and fast rounds. You don''t play a hand yourself; you bet on whether the Player or the Banker hand will finish closer to 9, or on a tie.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Baccarat Works' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Two hands are dealt, Player and Banker. Cards 2 to 9 count at face value, tens and picture cards count 0, and aces count 1. Only the last digit of a total counts, so 15 is worth 5.</p><p>Fixed rules decide whether a third card is drawn, so there are no decisions to make after you bet. A Banker bet usually pays even money minus a 5% commission; a Player bet pays even money; a Tie usually pays 8 to 1.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Baccarat Terms Explained' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>The words you''ll see most often when playing baccarat, explained simply.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What It Means', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Player Bet', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>A bet that the Player hand wins.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Banker Bet', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>A bet that the Banker hand wins. It has the lowest house edge.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'Tie Bet', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>A bet that both hands finish level. High payout, high house edge.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'Natural', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>A total of 8 or 9 from the first two cards.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'Commission', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>The fee (usually 5%) taken from winning Banker bets.</p>', 15
UNION ALL SELECT @sec, 6, 'left', 'text', 'Squeeze', 16
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>A live baccarat style where cards are revealed slowly for suspense.</p>', 17
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Start Playing Baccarat' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose a baccarat table', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Pick classic, speed or live baccarat with stakes that suit you.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Place your bet', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Bet on Player, Banker or Tie, and any side bets you want.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Watch the deal', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Two cards go to each hand; a third card may follow by fixed rules.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'See the result', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>The hand closest to 9 wins.</p>', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Collect or play again', 12
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Winnings are paid automatically.</p>', 13
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Baccarat Tips from Our Experts' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'Simple habits that help you play smarter and stay in control.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'The Banker bet has the lowest house edge', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Avoid the Tie bet despite its big payout', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Set a budget per session', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Ignore ''patterns'' in past results; every hand is independent', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Try speed baccarat only if you''re comfortable with fast play', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'top_casinos_by_region', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Where to Play Baccarat: Top Rated Casinos by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'mode', 'text', 'auto', 2
UNION ALL SELECT @sec, 0, 'moreCount', 'text', '0', 3
UNION ALL SELECT @sec, 0, 'countryCount', 'text', '3', 4
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 5
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Baccarat' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'Why is baccarat so popular in Asia?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>It''s simple, fast and social, and live baccarat tables offer an authentic casino feel.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Which baccarat bet is best?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>The Banker bet has the lowest house edge, even after commission.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'Do I need a strategy for baccarat?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>There are no playing decisions, so the main strategy is bet choice and bankroll management.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'Is live baccarat better than RNG baccarat?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>It''s a matter of taste. Live baccarat uses real dealers and cards; RNG versions are quicker and often have lower stakes.</p>', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Keep Exploring' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Learn more, or try another game.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Guide: Baccarat Rules & Strategy', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/guides/baccarat-rules-and-strategy', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Blackjack', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-games/blackjack', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Roulette', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-games/roulette', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Sic Bo', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-games/sic-bo', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Bingo', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-games/bingo', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'Sports Betting', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/casino-games/sports-betting', 14
UNION ALL SELECT @sec, 7, 'label', 'text', 'All Casino Games', 15
UNION ALL SELECT @sec, 7, 'url', 'text', '/casino-games', 16
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- roulette
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @gameHub, 3, 'roulette', 'Roulette', 'Roulette Online in Southeast Asia {year} | Top Casino Guide', 'Learn online roulette: European vs American wheels, inside and outside bets, odds and where to play at trusted Southeast Asian casinos.', 'draft' FROM DUAL
WHERE @gameHub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @gameHub AND slug = 'roulette');
SET @child = (SELECT id FROM pages WHERE parent_id = @gameHub AND slug = 'roulette' LIMIT 1);
SET @page = @child;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Roulette Online in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Roulette is a classic casino game of chance. You bet on where a ball will land on a spinning wheel: a single number, a group of numbers, a colour, or odd or even. With many bet types, it suits both cautious and adventurous players.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Roulette Works' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>A European wheel has 37 pockets (1 to 36 plus a single zero); an American wheel adds a double zero, which raises the house edge. You place chips on the table layout, the dealer spins the wheel, and bets on the winning pocket are paid.</p><p>Outside bets such as red or black pay even money with good odds of winning; inside bets on single numbers pay up to 35 to 1 but win less often.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Roulette Terms Explained' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>The words you''ll see most often when playing roulette, explained simply.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What It Means', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Straight Up', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>A bet on one number, paying 35 to 1.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Split', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>A bet on two neighbouring numbers, paying 17 to 1.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'Red/Black, Odd/Even', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Outside bets that pay even money.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'Dozen / Column', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Bets on 12 numbers, paying 2 to 1.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'La Partage', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>A rule in some French roulette games that returns half of even-money bets when zero hits.</p>', 15
UNION ALL SELECT @sec, 6, 'left', 'text', 'House Edge', 16
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>About 2.7% on European roulette and 5.26% on American.</p>', 17
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Start Playing Roulette' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Pick a roulette game', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Choose European, French or American roulette, RNG or live.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Choose your chips', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Select a chip value that fits your budget.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Place your bets', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Put chips on numbers or outside bets on the layout.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Spin', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>The wheel spins and the ball lands in a pocket.</p>', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Collect winnings', 12
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Winning bets are paid at the posted odds.</p>', 13
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Roulette Tips from Our Experts' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'Simple habits that help you play smarter and stay in control.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Choose European or French roulette over American', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Look for La Partage or En Prison rules', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Outside bets win more often but pay less', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'No betting system changes the house edge', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Decide your stop-loss before you play', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'top_casinos_by_region', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Where to Play Roulette: Top Rated Casinos by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'mode', 'text', 'auto', 2
UNION ALL SELECT @sec, 0, 'moreCount', 'text', '0', 3
UNION ALL SELECT @sec, 0, 'countryCount', 'text', '3', 4
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 5
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Roulette' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'Which roulette has the best odds?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>French roulette with La Partage, then European roulette. American roulette has the highest house edge.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Can you predict roulette?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>No. Each spin is independent and random.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'Is live roulette fair?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>At licensed casinos, live roulette uses real wheels streamed in real time and is regularly audited.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'What''s the safest roulette bet?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Even-money outside bets win almost half the time, but they still carry the house edge.</p>', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Keep Exploring' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Learn more, or try another game.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Guide: Roulette Betting Guide', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/guides/roulette-betting-guide', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Blackjack', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-games/blackjack', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Baccarat', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-games/baccarat', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Sic Bo', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-games/sic-bo', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Bingo', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-games/bingo', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'Sports Betting', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/casino-games/sports-betting', 14
UNION ALL SELECT @sec, 7, 'label', 'text', 'All Casino Games', 15
UNION ALL SELECT @sec, 7, 'url', 'text', '/casino-games', 16
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- sic-bo
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @gameHub, 4, 'sic-bo', 'Sic Bo', 'Sic Bo Online in Southeast Asia {year} | Top Casino Guide', 'Learn online Sic Bo: the dice game''s rules, Big and Small bets, payouts and where to play at trusted Southeast Asian casinos.', 'draft' FROM DUAL
WHERE @gameHub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @gameHub AND slug = 'sic-bo');
SET @child = (SELECT id FROM pages WHERE parent_id = @gameHub AND slug = 'sic-bo' LIMIT 1);
SET @page = @child;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Sic Bo Online in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Sic Bo is a traditional Chinese dice game that''s a favourite across Southeast Asia. Three dice are shaken, and you bet on the result: the total, specific numbers or combinations. It''s quick to learn and offers bets for every style.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Sic Bo Works' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>The dealer shakes three dice in a covered container. You bet on outcomes such as the total being Big (11 to 17) or Small (4 to 10), a specific number appearing, or a specific triple.</p><p>Simple bets like Big and Small pay even money and have a low house edge; specific triples can pay 150 to 1 or more but are rare.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Sic Bo Terms Explained' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>The words you''ll see most often when playing sic bo, explained simply.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What It Means', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Big', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>A total of 11 to 17 (excluding triples). Pays even money.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Small', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>A total of 4 to 10 (excluding triples). Pays even money.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'Single Number', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>A bet that a number appears on one, two or three dice.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'Specific Triple', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>All three dice show the number you chose.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'Any Triple', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>All three dice show the same number.</p>', 15
UNION ALL SELECT @sec, 6, 'left', 'text', 'Total', 16
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>A bet on the exact sum of the three dice.</p>', 17
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Start Playing Sic Bo' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose a Sic Bo table', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Pick an RNG or live dealer Sic Bo game.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Set your stake', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Choose a chip value.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Place your bets', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Bet on Big, Small, totals, numbers or combinations.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Roll the dice', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>The dice are shaken and revealed.</p>', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Get paid', 12
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Winning bets are paid according to the payout table.</p>', 13
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Sic Bo Tips from Our Experts' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'Simple habits that help you play smarter and stay in control.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Big and Small have the lowest house edge', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Treat triples as rare long shots', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Check the payout table; it varies between games', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Keep stakes steady rather than chasing losses', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Try free demos to learn the layout', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'top_casinos_by_region', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Where to Play Sic Bo: Top Rated Casinos by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'mode', 'text', 'auto', 2
UNION ALL SELECT @sec, 0, 'moreCount', 'text', '0', 3
UNION ALL SELECT @sec, 0, 'countryCount', 'text', '3', 4
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 5
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Sic Bo' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'What does Sic Bo mean?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>It means ''precious dice'' in Chinese, and the game is also known as Dai Siu or Hi-Lo.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Which Sic Bo bet is best?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Big and Small offer the best odds of winning.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'Can I play Sic Bo live?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Yes, many casinos offer live dealer Sic Bo with real dice.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'Do triples count for Big or Small?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>No. Big and Small bets lose if a triple appears.</p>', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Keep Exploring' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Learn more, or try another game.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Guide: Sic Bo for Beginners', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/guides/sic-bo-for-beginners', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Blackjack', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-games/blackjack', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Baccarat', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-games/baccarat', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Roulette', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-games/roulette', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Bingo', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-games/bingo', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'Sports Betting', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/casino-games/sports-betting', 14
UNION ALL SELECT @sec, 7, 'label', 'text', 'All Casino Games', 15
UNION ALL SELECT @sec, 7, 'url', 'text', '/casino-games', 16
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- bingo
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @gameHub, 5, 'bingo', 'Bingo', 'Bingo Online in Southeast Asia {year} | Top Casino Guide', 'Learn how online bingo works: 75-ball and 90-ball games, tickets, patterns and where to play at trusted casinos in Southeast Asia.', 'draft' FROM DUAL
WHERE @gameHub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @gameHub AND slug = 'bingo');
SET @child = (SELECT id FROM pages WHERE parent_id = @gameHub AND slug = 'bingo' LIMIT 1);
SET @page = @child;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Bingo Online in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Online bingo brings the familiar numbers game to your screen. You buy tickets, numbers are drawn at random, and you win by marking off the right pattern first. Many games run around the clock, with chat rooms that keep the social feel.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Bingo Works' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Each ticket has a grid of numbers. As numbers are drawn, they''re marked automatically. The first player to complete the winning pattern (a line, two lines or a full house) wins that prize.</p><p>The most common versions are 90-ball (three prizes per game) and 75-ball (pattern games). Prices and prize pools vary from room to room.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Bingo Terms Explained' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>The words you''ll see most often when playing bingo, explained simply.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What It Means', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', '90-Ball Bingo', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Tickets with three rows; prizes for one line, two lines and a full house.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', '75-Ball Bingo', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>A 5x5 card where you win by completing a set pattern.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'Full House', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Marking every number on a ticket.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'Auto-Daub', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Automatic marking of your numbers.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'Jackpot', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>A larger prize for a full house within a set number of calls.</p>', 15
UNION ALL SELECT @sec, 6, 'left', 'text', 'Ticket Price', 16
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>The cost per ticket, which also sets the prize pool.</p>', 17
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Start Playing Bingo' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Pick a bingo room', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Choose a game type and ticket price.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Buy tickets', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Buy one or more tickets before the game starts.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Watch the draw', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Numbers are called and marked automatically.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Complete a pattern', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Finish the winning pattern first to win.</p>', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Collect your prize', 12
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Winnings are added to your balance.</p>', 13
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Bingo Tips from Our Experts' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'Simple habits that help you play smarter and stay in control.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Play rooms with fewer players for better odds', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Set a budget for tickets', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Check the prize structure before you buy', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Use auto-daub so you never miss a number', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Enjoy the chat, but play responsibly', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'top_casinos_by_region', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Where to Play Bingo: Top Rated Casinos by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'mode', 'text', 'auto', 2
UNION ALL SELECT @sec, 0, 'moreCount', 'text', '0', 3
UNION ALL SELECT @sec, 0, 'countryCount', 'text', '3', 4
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 5
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Bingo' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'How do you win online bingo?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>By being the first to complete the winning pattern on one of your tickets.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Is online bingo random?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Yes. Licensed bingo games use certified random number generators.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'Does buying more tickets help?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>It improves your chances in that game, but it also costs more.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'Is bingo available at every casino?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>No. Check the casino''s game lobby before you sign up.</p>', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Keep Exploring' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Learn more, or try another game.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Blackjack', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/casino-games/blackjack', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Baccarat', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-games/baccarat', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Roulette', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-games/roulette', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Sic Bo', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-games/sic-bo', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Sports Betting', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-games/sports-betting', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'All Casino Games', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/casino-games', 14
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- sports-betting
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @gameHub, 6, 'sports-betting', 'Sports Betting', 'Sports Betting Online in Southeast Asia {year} | Top Casino Guide', 'Get started with online sports betting: odds formats, popular markets, Asian handicaps and trusted sportsbooks in Southeast Asia.', 'draft' FROM DUAL
WHERE @gameHub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @gameHub AND slug = 'sports-betting');
SET @child = (SELECT id FROM pages WHERE parent_id = @gameHub AND slug = 'sports-betting' LIMIT 1);
SET @page = @child;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Sports Betting Online in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Sports betting lets you back the outcome of real matches, from football and badminton to basketball and motor racing. In Southeast Asia, football is king, and Asian handicap markets are hugely popular. Understanding odds is the first step to betting smarter.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Sports Betting Works' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>A sportsbook offers odds on outcomes such as a team winning, the number of goals, or a handicap result. The odds show what you''ll be paid if your bet wins. You can bet before a match or live while it''s being played.</p><p>Odds may be shown as decimal, fractional, or in Asian formats such as Hong Kong, Malay and Indonesian odds.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Sports Betting Terms Explained' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>The words you''ll see most often when playing sports betting, explained simply.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What It Means', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Decimal Odds', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Your total return per unit staked, including your stake. 2.50 returns 2.50 for every 1 bet.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Asian Handicap', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Gives one team a virtual head start, removing the draw.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'Over/Under', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>A bet on whether the total goals or points go over or under a line.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'Accumulator', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Several selections in one bet. All must win.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'In-Play Betting', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>Betting during a match, with odds that change live.</p>', 15
UNION ALL SELECT @sec, 6, 'left', 'text', 'Cash Out', 16
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>Settling a bet early for an offered amount.</p>', 17
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Start Playing Sports Betting' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose a licensed sportsbook', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Pick a sportsbook from our reviews that accepts players from your country.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Pick a sport and match', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Browse upcoming or live matches.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Choose a market', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Select a result, handicap, over/under or another market.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Enter your stake', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Add the selection to your bet slip and set your stake.</p>', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Confirm and follow', 12
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Place the bet and follow the match.</p>', 13
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Sports Betting Tips from Our Experts' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'Simple habits that help you play smarter and stay in control.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Compare odds between sportsbooks', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Learn Asian handicap before betting on it', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Accumulators pay more but win less often', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Avoid betting on emotion or your favourite team', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Set a weekly betting budget', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'top_casinos_by_region', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Where to Play Sports Betting: Top Rated Casinos by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'mode', 'text', 'auto', 2
UNION ALL SELECT @sec, 0, 'moreCount', 'text', '0', 3
UNION ALL SELECT @sec, 0, 'countryCount', 'text', '3', 4
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 5
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Sports Betting' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'What''s the easiest bet for beginners?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>A simple match-result (1X2) or moneyline bet is the easiest to understand.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'What is an Asian handicap?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>A handicap that gives one side a goal advantage or disadvantage, so there''s no draw outcome.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'Can I bet during a match?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Yes. Most sportsbooks offer in-play betting with live odds.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'How are odds formats different?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>They show the same probability in different ways. Most sportsbooks let you switch formats.</p>', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Keep Exploring' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Learn more, or try another game.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Guide: Sports Betting Odds Explained', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/guides/sports-betting-odds-explained', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Blackjack', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-games/blackjack', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Baccarat', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-games/baccarat', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Roulette', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-games/roulette', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Sic Bo', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-games/sic-bo', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'Bingo', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/casino-games/bingo', 14
UNION ALL SELECT @sec, 7, 'label', 'text', 'All Casino Games', 15
UNION ALL SELECT @sec, 7, 'url', 'text', '/casino-games', 16
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- video-poker
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @gameHub, 7, 'video-poker', 'Video Poker', 'Video Poker Online in Southeast Asia {year} | Top Casino Guide', 'Learn online video poker: hand rankings, popular games like Jacks or Better, pay tables and where to play at trusted casinos.', 'draft' FROM DUAL
WHERE @gameHub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @gameHub AND slug = 'video-poker');
SET @child = (SELECT id FROM pages WHERE parent_id = @gameHub AND slug = 'video-poker' LIMIT 1);
SET @page = @child;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Video Poker Online in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Video poker combines the simplicity of a slot machine with the decisions of poker. You''re dealt five cards, choose which to keep, and draw replacements to make the best poker hand. With good choices, some versions have a very low house edge.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Video Poker Works' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>After you place your bet, you get five cards. You hold the cards you want to keep and draw new ones for the rest. Your final hand is paid according to the game''s pay table, from a pair of jacks or better up to a royal flush.</p><p>Popular versions include Jacks or Better, Deuces Wild and Double Bonus Poker, each with its own pay table and strategy.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Video Poker Terms Explained' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>The words you''ll see most often when playing video poker, explained simply.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What It Means', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Hold', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Keep a card before the draw.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Draw', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Replace the cards you didn''t hold.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'Pay Table', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>The list of payouts for each winning hand.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'Jacks or Better', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>The classic version: a pair of jacks or higher wins.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'Deuces Wild', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>A version where all 2s act as wild cards.</p>', 15
UNION ALL SELECT @sec, 6, 'left', 'text', 'Royal Flush', 16
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>Ace, king, queen, jack and ten of one suit; the top hand.</p>', 17
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Start Playing Video Poker' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose a game', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Pick a video poker version and check its pay table.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Set your bet', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Choose coin value and number of coins.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Deal', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>You receive five cards.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Hold and draw', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Keep your best cards and draw replacements.</p>', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Get paid', 12
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Winning hands pay according to the pay table.</p>', 13
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Video Poker Tips from Our Experts' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'Simple habits that help you play smarter and stay in control.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Compare pay tables; small differences matter', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Learn the strategy for your chosen version', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Bet max coins if the royal flush pays a bonus for it', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Practise in demo mode first', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Take breaks; the pace is fast', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'top_casinos_by_region', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Where to Play Video Poker: Top Rated Casinos by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'mode', 'text', 'auto', 2
UNION ALL SELECT @sec, 0, 'moreCount', 'text', '0', 3
UNION ALL SELECT @sec, 0, 'countryCount', 'text', '3', 4
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 5
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Video Poker' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'Is video poker a game of skill?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>Partly. The cards are random, but your hold decisions affect the return.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Which video poker game is best for beginners?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Jacks or Better has simple rules and a well-known strategy.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'What''s a 9/6 pay table?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>A Jacks or Better table paying 9 for a full house and 6 for a flush, one of the best versions.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'Is video poker the same as online poker?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>No. In video poker you play against the machine''s pay table, not other players.</p>', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Keep Exploring' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Learn more, or try another game.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Blackjack', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/casino-games/blackjack', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Baccarat', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-games/baccarat', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Roulette', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-games/roulette', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Sic Bo', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-games/sic-bo', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Bingo', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-games/bingo', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'All Casino Games', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/casino-games', 14
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- live-casino
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @gameHub, 8, 'live-casino', 'Live Casino', 'Live Casino Online in Southeast Asia {year} | Top Casino Guide', 'Discover live casino games streamed in real time: live baccarat, blackjack, roulette, Sic Bo and game shows at trusted casinos.', 'draft' FROM DUAL
WHERE @gameHub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @gameHub AND slug = 'live-casino');
SET @child = (SELECT id FROM pages WHERE parent_id = @gameHub AND slug = 'live-casino' LIMIT 1);
SET @page = @child;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Live Casino Online in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Live casino streams real dealers, real cards and real wheels to your screen in real time. You place bets through your device while the action happens in a studio, and you can chat with the dealer. It''s the closest thing to sitting at a real casino table.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Live Casino Works' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Games are filmed in professional studios with multiple cameras. You see the dealer shuffle, deal and spin live, and your bets are placed through an on-screen interface during a short betting window.</p><p>Popular live games in Southeast Asia include baccarat, Sic Bo, Dragon Tiger, roulette, blackjack and game shows. Leading studios include Evolution, Pragmatic Play Live and SA Gaming.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Live Casino Terms Explained' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>The words you''ll see most often when playing live casino, explained simply.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What It Means', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Live Dealer', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>A real croupier running the game from a studio.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Betting Window', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>The short time to place bets before each round.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'Game Show', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Entertainment-style live games with big multipliers.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'Dragon Tiger', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>A fast two-card game popular in Asia.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'Bet Behind', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>Betting on another player''s blackjack hand when seats are full.</p>', 15
UNION ALL SELECT @sec, 6, 'left', 'text', 'Table Limits', 16
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>The minimum and maximum bet at a table.</p>', 17
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Start Playing Live Casino' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose a live casino', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Pick a casino with the live games and studios you like.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Open the live lobby', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Browse tables by game, limits and language.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Join a table', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Pick a table within your budget.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Bet during the window', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Place bets before the timer runs out.</p>', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Watch the result', 12
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>The round plays out live and winnings are paid automatically.</p>', 13
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Live Casino Tips from Our Experts' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'Simple habits that help you play smarter and stay in control.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Check table limits before joining', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Use a stable internet connection', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Live games usually count less towards bonus turnover', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Be polite in the dealer chat', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Set a time limit; live play is immersive', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'top_casinos_by_region', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Where to Play Live Casino: Top Rated Casinos by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'mode', 'text', 'auto', 2
UNION ALL SELECT @sec, 0, 'moreCount', 'text', '0', 3
UNION ALL SELECT @sec, 0, 'countryCount', 'text', '3', 4
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 5
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Live Casino' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'Are live casino games rigged?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>Not at licensed casinos. Games are streamed live from regulated studios and audited.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Can I play live casino on my phone?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Yes. Live casino streams are optimised for mobile.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'Do live casino games count for bonuses?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Often at a reduced rate or not at all. Check the bonus terms.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'Can I talk to the dealer?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Yes, most tables have a text chat the dealer can see and respond to.</p>', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Keep Exploring' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Learn more, or try another game.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Guide: How to Pick the Right Online Casino', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/guides/how-to-pick-the-right-online-casino', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Blackjack', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-games/blackjack', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Baccarat', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-games/baccarat', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Roulette', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-games/roulette', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Sic Bo', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-games/sic-bo', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'Bingo', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/casino-games/bingo', 14
UNION ALL SELECT @sec, 7, 'label', 'text', 'All Casino Games', 15
UNION ALL SELECT @sec, 7, 'url', 'text', '/casino-games', 16
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- online-slots
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @gameHub, 9, 'online-slots', 'Online Slots', 'Online Slots Online in Southeast Asia {year} | Top Casino Guide', 'Understand online slots: RTP, volatility, paylines, bonus features and jackpots, and where to play at trusted Southeast Asian casinos.', 'draft' FROM DUAL
WHERE @gameHub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @gameHub AND slug = 'online-slots');
SET @child = (SELECT id FROM pages WHERE parent_id = @gameHub AND slug = 'online-slots' LIMIT 1);
SET @page = @child;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Online Slots Online in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Online slots are the most popular casino games, with thousands of themes, features and jackpots. Each spin is random, but knowing about RTP and volatility helps you choose games that suit how you like to play.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Online Slots Works' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>You set your bet and spin the reels. Winning combinations of symbols on paylines (or anywhere, on ''ways'' slots) pay out according to the paytable. Bonus features such as free spins, multipliers and pick-me games add extra chances to win.</p><p>Every result is decided by a certified random number generator, so there''s no way to predict or influence a spin.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Online Slots Terms Explained' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>The words you''ll see most often when playing online slots, explained simply.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What It Means', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'RTP', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Return to player: the share of all bets a slot pays back over time, e.g. 96%.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Volatility', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>How often and how big wins tend to be. High volatility means bigger but rarer wins.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'Paylines', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>The lines on which winning symbol combinations pay.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'Scatter', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>A symbol that triggers features wherever it lands.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'Wild', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>A symbol that substitutes for others.</p>', 15
UNION ALL SELECT @sec, 6, 'left', 'text', 'Progressive Jackpot', 16
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>A jackpot that grows with every bet until someone wins it.</p>', 17
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Start Playing Online Slots' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose a slot', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Pick a game by theme, provider, RTP or volatility.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Check the paytable', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>See how symbols pay and how features trigger.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Set your bet', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Choose your stake per spin.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Spin', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Spin manually or use autoplay with limits.</p>', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Enjoy the features', 12
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Free spins and bonus rounds trigger at random.</p>', 13
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Online Slots Tips from Our Experts' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'Simple habits that help you play smarter and stay in control.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Check the RTP in the game info', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Pick volatility to match your budget', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Try demos before playing for real money', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Set loss and time limits for autoplay', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Treat jackpots as a bonus, not a plan', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'top_casinos_by_region', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Where to Play Online Slots: Top Rated Casinos by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'mode', 'text', 'auto', 2
UNION ALL SELECT @sec, 0, 'moreCount', 'text', '0', 3
UNION ALL SELECT @sec, 0, 'countryCount', 'text', '3', 4
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 5
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Online Slots' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'What is a good RTP for slots?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>Around 96% or higher is considered good for online slots.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Can you win on slots every time?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>No. Slots are random and the house edge applies over time.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'What''s the difference between high and low volatility?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Low volatility pays small wins often; high volatility pays bigger wins less often.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'Are free spins worth using on slots?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Yes, especially when the value per spin is good and the turnover on winnings is low.</p>', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Keep Exploring' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Learn more, or try another game.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Guide: Slots: RTP & Volatility Explained', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/guides/slots-rtp-and-volatility-explained', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Blackjack', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-games/blackjack', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Baccarat', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-games/baccarat', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Roulette', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-games/roulette', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Sic Bo', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-games/sic-bo', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'Bingo', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/casino-games/bingo', 14
UNION ALL SELECT @sec, 7, 'label', 'text', 'All Casino Games', 15
UNION ALL SELECT @sec, 7, 'url', 'text', '/casino-games', 16
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- esports-betting
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @gameHub, 10, 'esports-betting', 'eSports Betting', 'eSports Betting Online in Southeast Asia {year} | Top Casino Guide', 'Bet on eSports online: popular games like Dota 2, Mobile Legends and Valorant, betting markets and trusted sportsbooks in Southeast Asia.', 'draft' FROM DUAL
WHERE @gameHub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @gameHub AND slug = 'esports-betting');
SET @child = (SELECT id FROM pages WHERE parent_id = @gameHub AND slug = 'esports-betting' LIMIT 1);
SET @page = @child;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'eSports Betting Online in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>eSports betting lets you back professional gaming teams in titles such as Dota 2, Mobile Legends: Bang Bang, Valorant and Counter-Strike. Southeast Asia has some of the world''s most passionate eSports fans, and sportsbooks now cover major leagues and tournaments.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How eSports Betting Works' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>It works like sports betting: you pick a match and a market, such as the match winner, map winner or total kills, and place a stake at the offered odds. Many events also offer live betting while the match is played.</p><p>Knowing the teams, recent form and the current game patch helps you make informed choices.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'eSports Betting Terms Explained' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>The words you''ll see most often when playing esports betting, explained simply.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What It Means', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Match Winner', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>A bet on which team wins the series.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Map Handicap', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>A handicap applied to the number of maps won.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'First Blood', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>A bet on which team gets the first kill.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'Total Maps', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>A bet on how many maps are played in a series.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'Live Betting', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>Betting during a match as odds change.</p>', 15
UNION ALL SELECT @sec, 6, 'left', 'text', 'Patch', 16
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>A game update that can change which teams and strategies are strongest.</p>', 17
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Start Playing eSports Betting' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose a sportsbook with eSports', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Pick a licensed sportsbook covering your favourite games.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Find a match', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Browse leagues and tournaments.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Pick a market', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Choose match winner, handicap, maps or props.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Place your bet', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Add it to your bet slip and confirm your stake.</p>', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Watch the stream', 12
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Follow the match live.</p>', 13
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'eSports Betting Tips from Our Experts' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'Simple habits that help you play smarter and stay in control.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Bet on games you understand', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Follow team news and roster changes', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Watch out for patch changes', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Compare odds across sportsbooks', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Keep stakes small on unfamiliar leagues', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'top_casinos_by_region', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Where to Play eSports Betting: Top Rated Casinos by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'mode', 'text', 'auto', 2
UNION ALL SELECT @sec, 0, 'moreCount', 'text', '0', 3
UNION ALL SELECT @sec, 0, 'countryCount', 'text', '3', 4
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 5
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about eSports Betting' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'Which eSports can I bet on?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>Common titles include Dota 2, Mobile Legends, Valorant, Counter-Strike and League of Legends.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Is eSports betting like sports betting?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Yes. The markets and odds work the same way.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'Can I bet live on eSports?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Many sportsbooks offer in-play markets on major eSports matches.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'How do I choose an eSports bet?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Research teams, recent results and the current patch before betting.</p>', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Keep Exploring' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Learn more, or try another game.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Guide: Sports Betting Odds Explained', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/guides/sports-betting-odds-explained', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Blackjack', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-games/blackjack', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Baccarat', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-games/baccarat', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Roulette', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-games/roulette', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Sic Bo', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-games/sic-bo', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'Bingo', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/casino-games/bingo', 14
UNION ALL SELECT @sec, 7, 'label', 'text', 'All Casino Games', 15
UNION ALL SELECT @sec, 7, 'url', 'text', '/casino-games', 16
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- 4d-online-betting
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @gameHub, 11, '4d-online-betting', '4D Online Betting', '4D Online Betting Online in Southeast Asia {year} | Top Casino Guide', 'Learn how 4D online betting works: Big and Small bets, prize categories, draw days and how to play responsibly.', 'draft' FROM DUAL
WHERE @gameHub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @gameHub AND slug = '4d-online-betting');
SET @child = (SELECT id FROM pages WHERE parent_id = @gameHub AND slug = '4d-online-betting' LIMIT 1);
SET @page = @child;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, '4D Online Betting Online in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>4D is a hugely popular number game in Malaysia and Singapore. You choose a four-digit number from 0000 to 9999 and win if it matches one of the numbers drawn. Online platforms let you place 4D bets from your phone and check results instantly.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How 4D Online Betting Works' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Each draw produces 23 winning numbers across prize groups: first, second and third prizes, plus starter and consolation prizes. You choose your number and bet type before the draw closes.</p><p>A Big bet covers all prize groups with smaller payouts; a Small bet covers only the top three prizes with bigger payouts. Variations such as iBet and System bets cover number permutations.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, '4D Online Betting Terms Explained' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>The words you''ll see most often when playing 4d online betting, explained simply.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What It Means', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Big Bet', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Wins if your number matches any of the 23 winning numbers.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Small Bet', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Wins only on 1st, 2nd or 3rd prize, with higher payouts.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'iBet', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Covers every permutation of your number, with the payout divided.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'System Bet', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Bets on every permutation as separate full bets.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'Starter / Consolation', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>The lower prize groups covered by a Big bet.</p>', 15
UNION ALL SELECT @sec, 6, 'left', 'text', 'Draw Days', 16
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>The days when results are drawn.</p>', 17
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Start Playing 4D Online Betting' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose a licensed operator', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Use a trusted platform that offers 4D in your country.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Pick your number', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Choose any four digits from 0000 to 9999.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Choose Big, Small or a variation', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Decide how your bet covers the prize groups.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Place your bet before the draw closes', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Confirm your stake.</p>', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Check the results', 12
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Results are published after each draw.</p>', 13
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, '4D Online Betting Tips from Our Experts' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'Simple habits that help you play smarter and stay in control.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Treat 4D as entertainment, not income', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Understand Big vs Small payouts before you bet', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Use iBet to cover permutations at lower cost', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Only use licensed operators', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Set a fixed amount per draw', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'top_casinos_by_region', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Where to Play 4D Online Betting: Top Rated Casinos by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'mode', 'text', 'auto', 2
UNION ALL SELECT @sec, 0, 'moreCount', 'text', '0', 3
UNION ALL SELECT @sec, 0, 'countryCount', 'text', '3', 4
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 5
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about 4D Online Betting' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'What is 4D?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>A number game where you bet on a four-digit number matching the winning numbers in a draw.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'What''s the difference between Big and Small?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Big covers all 23 winning numbers with smaller prizes; Small covers only the top three with bigger prizes.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'How often are 4D draws held?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Usually several times a week. Check your operator''s draw schedule.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'Is online 4D legal?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>It depends on your country. Only play with operators licensed where you live.</p>', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Keep Exploring' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Learn more, or try another game.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Blackjack', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/casino-games/blackjack', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Baccarat', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-games/baccarat', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Roulette', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-games/roulette', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Sic Bo', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-games/sic-bo', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Bingo', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-games/bingo', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'All Casino Games', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/casino-games', 14
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- fishing-online
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @gameHub, 12, 'fishing-online', 'Fishing Games', 'Fishing Games Online in Southeast Asia {year} | Top Casino Guide', 'Discover online fishing games: how shooting-style fish games work, bets, multipliers and where to play at trusted Asian casinos.', 'draft' FROM DUAL
WHERE @gameHub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @gameHub AND slug = 'fishing-online');
SET @child = (SELECT id FROM pages WHERE parent_id = @gameHub AND slug = 'fishing-online' LIMIT 1);
SET @page = @child;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Fishing Games Online in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Fishing games are arcade-style casino games that are especially popular in Asia. You aim and shoot at fish swimming across the screen, and each fish you catch pays a multiple of your bet. Bigger, rarer fish and bosses pay the most.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Fishing Games Works' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Each shot costs a set amount. Fish have different values, and catching one pays its multiplier times your shot value. Special weapons and bonus fish can trigger extra features.</p><p>Many fishing games are multiplayer, so other players shoot at the same fish. Results are still decided by the game''s random number generator.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Fishing Games Terms Explained' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>The words you''ll see most often when playing fishing games, explained simply.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What It Means', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Shot Value', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>The cost of each shot, which sets your payouts.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Multiplier', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>How many times your shot value a fish pays.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'Boss Fish', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Rare, high-value targets with big multipliers.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'Special Weapons', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Features such as lasers or bombs that hit several fish.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'Multiplayer Room', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>A shared game where several players shoot at once.</p>', 15
UNION ALL SELECT @sec, 6, 'left', 'text', 'Auto-Fire', 16
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>Automatic shooting, which uses your balance quickly.</p>', 17
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Start Playing Fishing Games' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose a fishing game', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Pick a title from a reputable provider.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Join a room', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Select a room that matches your stake.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Set your shot value', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Choose how much each shot costs.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Aim and shoot', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Target fish and watch for special features.</p>', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Cash out', 12
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Leave the room to keep your balance.</p>', 13
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Fishing Games Tips from Our Experts' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'Simple habits that help you play smarter and stay in control.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Start with a low shot value', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Use auto-fire carefully; it spends fast', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Focus on fish worth your shot value', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Set a budget per session', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Choose games from known providers', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'top_casinos_by_region', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Where to Play Fishing Games: Top Rated Casinos by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'mode', 'text', 'auto', 2
UNION ALL SELECT @sec, 0, 'moreCount', 'text', '0', 3
UNION ALL SELECT @sec, 0, 'countryCount', 'text', '3', 4
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 5
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Fishing Games' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'Are fishing games skill-based?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>They feel skill-based, but outcomes are decided by random number generators.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Which providers make fishing games?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Popular providers include JILI, Spadegaming and Fa Chai.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'Can I play fishing games on mobile?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Yes, they''re designed for mobile play.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'Do fishing games count towards bonuses?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>It varies. Check the bonus terms for eligible games.</p>', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Keep Exploring' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Learn more, or try another game.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Guide: Fishing Games: How They Work', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/guides/fishing-games-guide', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Blackjack', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-games/blackjack', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Baccarat', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-games/baccarat', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Roulette', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-games/roulette', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Sic Bo', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-games/sic-bo', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'Bingo', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/casino-games/bingo', 14
UNION ALL SELECT @sec, 7, 'label', 'text', 'All Casino Games', 15
UNION ALL SELECT @sec, 7, 'url', 'text', '/casino-games', 16
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- lottery-online
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @gameHub, 13, 'lottery-online', 'Online Lottery', 'Online Lottery Online in Southeast Asia {year} | Top Casino Guide', 'Learn how online lottery games work: number draws, Thai lottery and keno-style games, odds and how to play responsibly.', 'draft' FROM DUAL
WHERE @gameHub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @gameHub AND slug = 'lottery-online');
SET @child = (SELECT id FROM pages WHERE parent_id = @gameHub AND slug = 'lottery-online' LIMIT 1);
SET @page = @child;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'introduction_section', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Online Lottery Online in Southeast Asia {year}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '{year}', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Online lottery games let you pick numbers and win if they match the draw. Alongside official national lotteries, many online casinos offer fast lottery-style games and keno with frequent draws. They''re simple to play, with odds that vary widely by game.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Online Lottery Works' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>You choose numbers (or let the system pick them) and place your stake before the draw. Prizes depend on how many of your numbers match. Fast lottery and keno games draw every few minutes; traditional lotteries draw on set days.</p><p>Odds and payouts differ greatly between games, so check the rules and prize table before you play.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Online Lottery Terms Explained' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>The words you''ll see most often when playing online lottery, explained simply.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What It Means', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Draw', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>The random selection of winning numbers.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Quick Pick', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Numbers chosen for you at random.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'Keno', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>A lottery-style game where you pick several numbers from a larger set.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'Prize Table', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>What each number of matches pays.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'Thai Lottery', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>A popular lottery format based on Thailand''s government lottery results.</p>', 15
UNION ALL SELECT @sec, 6, 'left', 'text', 'Odds', 16
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>How likely a result is. Jackpots have very long odds.</p>', 17
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Start Playing Online Lottery' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose a trusted operator', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Use a licensed platform offering lottery games in your country.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Pick a game', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Choose a lottery, fast draw or keno game.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Select your numbers', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Pick your own or use quick pick.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Place your stake', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Confirm before the draw closes.</p>', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Check the results', 12
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Winnings are paid to your balance.</p>', 13
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Online Lottery Tips from Our Experts' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'Simple habits that help you play smarter and stay in control.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Read the prize table before playing', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Fast draws can add up quickly; set limits', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Jackpots are long shots; play for fun', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Only use licensed operators', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Never borrow money to play', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'top_casinos_by_region', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Where to Play Online Lottery: Top Rated Casinos by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'mode', 'text', 'auto', 2
UNION ALL SELECT @sec, 0, 'moreCount', 'text', '0', 3
UNION ALL SELECT @sec, 0, 'countryCount', 'text', '3', 4
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 5
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Online Lottery' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'How do online lotteries work?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>You pick numbers, place a stake, and win if your numbers match the draw.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'What is keno?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>A lottery-style game where you pick several numbers and win based on how many match.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'Are online lottery draws random?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>At licensed operators, draws use certified random number generators or official results.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'Can I play the Thai lottery online?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Some operators offer lottery games based on Thai lottery results. Check that the operator is licensed where you live.</p>', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Keep Exploring' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Learn more, or try another game.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Blackjack', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/casino-games/blackjack', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Baccarat', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-games/baccarat', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Roulette', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-games/roulette', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Sic Bo', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-games/sic-bo', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Bingo', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-games/bingo', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'All Casino Games', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/casino-games', 14
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- Menu links: only those still pointing at the old addresses.
UPDATE menu_items SET href = '/casino-bonus/welcome-bonus' WHERE href = '/bonuses?type=welcome-bonus';
UPDATE menu_items SET href = '/casino-bonus/no-deposit-bonus' WHERE href = '/bonuses?type=no-deposit-bonus';
UPDATE menu_items SET href = '/casino-bonus/free-spins' WHERE href = '/bonuses?type=free-spins';
UPDATE menu_items SET href = '/casino-bonus/deposit-bonus' WHERE href = '/bonuses?type=deposit-bonus';
UPDATE menu_items SET href = '/casino-bonus/cashback' WHERE href = '/bonuses?type=cashback';
UPDATE menu_items SET href = '/casino-bonus/loyalty-vip-bonus' WHERE href = '/bonuses?type=loyalty-vip-bonus';
UPDATE menu_items SET href = '/casino-games/blackjack' WHERE href = '/guides?category=blackjack';
UPDATE menu_items SET href = '/casino-games/baccarat' WHERE href = '/guides?category=baccarat';
UPDATE menu_items SET href = '/casino-games/roulette' WHERE href = '/guides?category=roulette';
UPDATE menu_items SET href = '/casino-games/sic-bo' WHERE href = '/guides?category=sic-bo';
UPDATE menu_items SET href = '/casino-games/bingo' WHERE href = '/guides?category=bingo';
UPDATE menu_items SET href = '/casino-games/sports-betting' WHERE href = '/guides?category=sports-betting';
UPDATE menu_items SET href = '/casino-games/video-poker' WHERE href = '/guides?category=video-poker';
UPDATE menu_items SET href = '/casino-games/live-casino' WHERE href = '/guides?category=live-casino';
UPDATE menu_items SET href = '/casino-games/online-slots' WHERE href = '/guides?category=online-slots';
UPDATE menu_items SET href = '/casino-games/esports-betting' WHERE href = '/guides?category=esports-betting';
UPDATE menu_items SET href = '/casino-games/4d-online-betting' WHERE href = '/guides?category=4d-online-betting';
UPDATE menu_items SET href = '/casino-games/fishing-online' WHERE href = '/guides?category=fishing-online';
UPDATE menu_items SET href = '/casino-games/lottery-online' WHERE href = '/guides?category=lottery-online';

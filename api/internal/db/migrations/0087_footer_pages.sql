-- Footer pages: Our Background (About Us, 25 Step Factor Review, Our
-- Authors, Responsible Gambling, Privacy Policy, Sitemap) and Get in Touch
-- (Contact Us, Get Listed Now, Report a Casino, Join as Affiliate). The
-- footer already links to these addresses; none of the pages existed.
--
-- Created as drafts, to be reviewed and published in Pages; a page that
-- already exists is left alone. Every component sits in its own Container
-- (see 0084). Generated from structured content; edit the pages in the
-- admin, not here.


-- about
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT NULL, (SELECT COALESCE(MAX(p2.sort_order), 0) + 1 FROM pages p2 WHERE p2.parent_id IS NULL AND p2.kind = 'page'), 'about', 'About Us', 'About Us | Top Casino Guide', 'Who we are, how we review online casinos for players across Southeast Asia, how we make money and the promises we make to our readers.', 'draft' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE parent_id IS NULL AND slug = 'about');
SET @about = (SELECT id FROM pages WHERE parent_id IS NULL AND slug = 'about' LIMIT 1);
SET @page = @about;
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'About Top Casino Guide' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', 'Top Casino', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>We''re an independent review site for online casino players in Southeast Asia. We test casinos with real accounts, check their licences, bonuses and payouts, and publish honest reviews so you can choose where to play with confidence, and know which sites to avoid.</p>', 4
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Who We Are' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Our team is made up of writers, researchers and long-time players who know the online casino market in Singapore, Malaysia, Thailand, Indonesia, Vietnam and the Philippines. We follow the local payment methods, currencies and bonuses that matter to players in each country.</p><p>We started this site because finding trustworthy information was harder than it should be. Too many review sites rank casinos by who pays the most. We rank them by how they treat players.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'link_card_grid', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'What You''ll Find Here' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Everything we publish is built to help you make a better decision before you deposit.</p>', 2
UNION ALL SELECT @sec, 0, 'columns', 'text', '3', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Casino Reviews', 4
UNION ALL SELECT @sec, 1, 'description', 'text', 'In-depth reviews of casinos that accept players in Southeast Asia.', 5
UNION ALL SELECT @sec, 1, 'url', 'text', '/casinos', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Casino Bonuses', 7
UNION ALL SELECT @sec, 2, 'description', 'text', 'Every bonus type explained, with the terms that decide its real value.', 8
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-bonus', 9
UNION ALL SELECT @sec, 3, 'title', 'text', 'Casino Games', 10
UNION ALL SELECT @sec, 3, 'description', 'text', 'Rules, strategy and tips for blackjack, baccarat, slots and more.', 11
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-games', 12
UNION ALL SELECT @sec, 4, 'title', 'text', 'Blacklisted Casinos', 13
UNION ALL SELECT @sec, 4, 'description', 'text', 'Sites we''ve flagged for unpaid winnings, unfair terms or poor security.', 14
UNION ALL SELECT @sec, 4, 'url', 'text', '/blacklist', 15
UNION ALL SELECT @sec, 5, 'title', 'text', 'Guides', 16
UNION ALL SELECT @sec, 5, 'description', 'text', 'Practical guides on bankroll management, payments and safe play.', 17
UNION ALL SELECT @sec, 5, 'url', 'text', '/guides', 18
UNION ALL SELECT @sec, 6, 'title', 'text', 'Bonus Calculator', 19
UNION ALL SELECT @sec, 6, 'description', 'text', 'Work out how much you need to bet to clear a bonus.', 20
UNION ALL SELECT @sec, 6, 'url', 'text', '/calculator', 21
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Our Promises to You' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'What you can expect from every page on this site.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'We test every casino before we recommend it', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Ratings are never for sale: a casino can''t pay for a better score', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'We publish the bad as well as the good, including blacklisted sites', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'We update reviews when bonuses, terms or payout speeds change', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'We promote responsible gambling on every page', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How We Make Money' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Top Casino Guide is free to use. Some links on this site are affiliate links: if you sign up at a casino through them, we may earn a commission from the casino. This never costs you anything and never changes our ratings. Casinos that fail our review are not listed, whatever they offer to pay.</p>', 2
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Learn More About Us' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>See how we review casinos, meet the team, or get in touch.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Our 25 Step Review Process', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/about/review-methodology', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Our Authors', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/authors', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Contact Us', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/contact', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- review-methodology
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @about, (SELECT COALESCE(MAX(p2.sort_order), 0) + 1 FROM pages p2 WHERE p2.parent_id IS NULL AND p2.kind = 'page'), 'review-methodology', '25 Step Factor Review', 'Our 25 Step Casino Review Process | Top Casino Guide', 'How we rate online casinos: the 25 factors we check, from licensing and payouts to bonuses, games and support, before any casino gets a score.', 'draft' FROM DUAL
WHERE @about IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @about AND slug = 'review-methodology');
SET @child = (SELECT id FROM pages WHERE parent_id = @about AND slug = 'review-methodology' LIMIT 1);
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Our 25 Step Factor Review' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', '25 Step', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Every casino we list goes through the same 25-point review. We check its licence, test its bonuses, deposit and withdraw real money, play its games and contact its support team. Only then does it get a score.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How a Review Works' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>A full review takes our team several days from start to finish.</p>', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Background Check', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>We confirm the licence, the owner and the casino''s complaint history. Casinos that fail are not reviewed further.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Real Account Testing', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>We open an account, verify it, and make real deposits using local payment methods.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Bonus & Game Testing', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>We claim the bonuses, read every term, and play the games on desktop and mobile.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Withdrawal Test', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>We request a withdrawal and time how long it takes to arrive.</p>', 11
UNION ALL SELECT @sec, 5, 'title', 'text', 'Scoring & Updates', 12
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>We score all 25 factors and publish the review. We re-check casinos regularly and update the score when things change.</p>', 13
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Safety & Licensing' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>We start with the basics. If a casino fails here, it isn''t reviewed any further.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Factor', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What We Check', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', '1. Licence', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Is the casino licensed by a recognised regulator, and is the licence valid and published on the site?</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', '2. Ownership', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Who runs the casino, and do they have a clean track record with other brands?</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', '3. Security', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Is the site encrypted, and are account and payment details protected?</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', '4. Fair Games', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Are games supplied by known studios and tested for fairness by independent labs?</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', '5. Complaints History', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>How has the casino handled player complaints, and is it on any blacklist?</p>', 15
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Bonuses & Promotions' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>We read the full terms of every offer, not just the headline.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Factor', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What We Check', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', '6. Welcome Offer', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>How much is the welcome bonus really worth once the terms are applied?</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', '7. Turnover Requirements', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>How much must you bet before withdrawing, and is it realistic?</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', '8. Bonus Terms', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Are maximum bets, game restrictions and expiry dates clear and fair?</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', '9. Ongoing Promotions', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Are there regular reload bonuses, free spins and cashback for existing players?</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', '10. VIP & Loyalty', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>Do regular players get real rewards, and are the tiers reachable?</p>', 15
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Banking & Payouts' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>We deposit and withdraw real money to test how payments work.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Factor', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What We Check', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', '11. Local Payment Methods', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Does the casino support the e-wallets, bank transfers and cards players use locally?</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', '12. Local Currencies', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Can you play in SGD, MYR, THB, IDR, VND or PHP without conversion fees?</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', '13. Withdrawal Speed', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>How long did our test withdrawals take from request to arrival?</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', '14. Limits & Fees', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Are minimum deposits, withdrawal limits and fees reasonable?</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', '15. Verification', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>Is the identity check (KYC) process clear and quick?</p>', 15
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Games & Software' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>We play the games ourselves, on desktop and mobile.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Factor', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What We Check', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', '16. Game Variety', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Is there a good mix of slots, table games, live casino and specialty games?</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', '17. Software Providers', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Which studios supply the games, and are they well regarded?</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', '18. Live Casino', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>How many live tables are there, and how good is the streaming?</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', '19. RTP Transparency', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Does the casino publish return-to-player rates for its games?</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', '20. Sports & eSports', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>If the site offers betting, are the markets and odds competitive?</p>', 15
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Player Experience' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Finally, we look at what it''s like to use the casino day to day.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Factor', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What We Check', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', '21. Mobile Experience', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Does the site or app work smoothly on phones and tablets?</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', '22. Ease of Use', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Is it easy to register, find games and manage your account?</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', '23. Customer Support', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Is support available 24/7, in local languages, and does it actually solve problems?</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', '24. Responsible Gambling Tools', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Can you set deposit limits, take a break or self-exclude?</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', '25. Overall Reputation', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>What do other players say, and does the casino''s reputation match our experience?</p>', 15
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'What the Scores Mean' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Each factor is scored, then combined into an overall rating out of 10.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Score', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What It Means', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', '9 – 10', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Outstanding. One of the best casinos available in its markets.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', '7 – 8.9', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Very good. A safe choice with only minor weaknesses.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', '5 – 6.9', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Average. Safe to use, but there are better options.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'Below 5', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Not recommended. Serious problems with bonuses, payouts or support.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'Blacklisted', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>Avoid. Unpaid winnings, unfair terms or no valid licence.</p>', 15
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 16 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 17 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Our Reviews' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'Can a casino pay for a higher score?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>No. Casinos can''t buy a rating or a place in our lists. Commercial relationships never affect scores.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'How often are reviews updated?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>We re-check casinos regularly and whenever we hear about changes to bonuses, terms, payment methods or payout speeds.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'Why isn''t a casino listed?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Either we haven''t reviewed it yet, it doesn''t accept players from your country, or it failed our safety checks.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'I disagree with a review. What can I do?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Tell us. We read every message and re-test casinos when players report a different experience.</p>', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 18 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 19 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Explore Our Reviews' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>See the results of our reviews, or report a casino we should look at.</p>', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'All Casino Reviews', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/casinos', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Blacklisted Casinos', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/blacklist', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Report a Casino', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/report-a-casino', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- authors
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT NULL, (SELECT COALESCE(MAX(p2.sort_order), 0) + 1 FROM pages p2 WHERE p2.parent_id IS NULL AND p2.kind = 'page'), 'authors', 'Our Authors', 'Our Authors and Editorial Team | Top Casino Guide', 'Meet the team behind Top Casino Guide: the reviewers, writers and editors who test casinos and write our guides, and the standards they follow.', 'draft' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE parent_id IS NULL AND slug = 'authors');
SET @p0 = (SELECT id FROM pages WHERE parent_id IS NULL AND slug = 'authors' LIMIT 1);
SET @page = @p0;
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Meet Our Authors' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', 'Authors', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Our reviews and guides are written by people who play, test and follow online casinos across Southeast Asia. Every article is researched, checked by an editor, and updated when things change.</p>', 4
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Our Editorial Team' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Each member of the team has a clear role in getting accurate information to you.</p>', 2
UNION ALL SELECT @sec, 0, 'columns', 'text', '3', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Casino Reviewers', 4
UNION ALL SELECT @sec, 1, 'description', 'text', 'Open real accounts, test bonuses, deposits and withdrawals, and score each casino on our 25 factors.', 5
UNION ALL SELECT @sec, 1, 'url', 'text', '', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Game Specialists', 7
UNION ALL SELECT @sec, 2, 'description', 'text', 'Write our game guides, from blackjack strategy to how slot RTP works.', 8
UNION ALL SELECT @sec, 2, 'url', 'text', '', 9
UNION ALL SELECT @sec, 3, 'title', 'text', 'Regional Writers', 10
UNION ALL SELECT @sec, 3, 'description', 'text', 'Cover the payment methods, currencies, bonuses and rules that matter in each country.', 11
UNION ALL SELECT @sec, 3, 'url', 'text', '', 12
UNION ALL SELECT @sec, 4, 'title', 'text', 'News Writers', 13
UNION ALL SELECT @sec, 4, 'description', 'text', 'Track new casinos, bonus changes and industry news across the region.', 14
UNION ALL SELECT @sec, 4, 'url', 'text', '', 15
UNION ALL SELECT @sec, 5, 'title', 'text', 'Editors', 16
UNION ALL SELECT @sec, 5, 'description', 'text', 'Fact-check every article and make sure it''s clear, fair and up to date.', 17
UNION ALL SELECT @sec, 5, 'url', 'text', '', 18
UNION ALL SELECT @sec, 6, 'title', 'text', 'Research Team', 19
UNION ALL SELECT @sec, 6, 'description', 'text', 'Follow player complaints and keep our blacklist current.', 20
UNION ALL SELECT @sec, 6, 'url', 'text', '', 21
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Our Editorial Standards' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'Every article on this site is held to the same rules.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Written from first-hand testing and reliable sources', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Checked by an editor before it''s published', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Clear about risks as well as rewards', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Never influenced by advertisers or casino partners', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Updated when bonuses, terms or rules change', 8
UNION ALL SELECT @sec, 6, 'text', 'text', 'Corrected promptly when we get something wrong', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Spotted a Mistake?' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>We work hard to keep every page accurate, but offers and terms change quickly. If you see something that''s out of date or wrong, email us at <a href="mailto:topcasinosingapore@gmail.com?subject=Correction">topcasinosingapore@gmail.com</a> and we''ll check it and update the page.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'More About Us' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'About Us', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/about', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Our 25 Step Review Process', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/about/review-methodology', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Latest News', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/news', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'All Guides', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/guides', 10
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- responsible-gambling
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT NULL, (SELECT COALESCE(MAX(p2.sort_order), 0) + 1 FROM pages p2 WHERE p2.parent_id IS NULL AND p2.kind = 'page'), 'responsible-gambling', 'Responsible Gambling', 'Responsible Gambling: Stay in Control | Top Casino Guide', 'How to keep gambling fun: set limits, spot the warning signs of problem gambling, use casino safety tools and find free, confidential help.', 'draft' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE parent_id IS NULL AND slug = 'responsible-gambling');
SET @p1 = (SELECT id FROM pages WHERE parent_id IS NULL AND slug = 'responsible-gambling' LIMIT 1);
SET @page = @p1;
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Responsible Gambling' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', 'Responsible', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Gambling should be entertainment, never a way to make money or escape problems. This page explains how to stay in control, how to spot the warning signs, and where to get free, confidential help if gambling stops being fun.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Simple Rules for Safer Play' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'Follow these every time you play.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Only gamble with money you can afford to lose', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Set a budget and a time limit before you start', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Treat losses as the cost of entertainment, never chase them', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Don''t gamble when you''re stressed, upset or have been drinking', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Take regular breaks and balance gambling with other activities', 8
UNION ALL SELECT @sec, 6, 'text', 'text', 'Never borrow money or use money meant for bills to gamble', 9
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Warning Signs of Problem Gambling' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'If several of these sound familiar, it may be time to take a break and talk to someone.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Spending more money or time than you planned', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Chasing losses or needing to bet more to feel the same excitement', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Hiding your gambling from family or friends', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Borrowing money or selling things to gamble', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Feeling anxious, irritable or low when you''re not gambling', 8
UNION ALL SELECT @sec, 6, 'text', 'text', 'Gambling getting in the way of work, study or relationships', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Tools That Help You Stay in Control' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Licensed casinos offer tools to help you manage your play. Look for them in your account settings, or ask support to set them up.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Tool', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What It Does', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '<p>You can also install blocking software on your devices to stop access to gambling sites.</p>', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Deposit Limits', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Caps how much you can deposit per day, week or month.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Loss & Wager Limits', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Limits how much you can lose or bet over a set period.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'Session Reminders', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Shows how long you''ve been playing at regular intervals.</p>', 11
UNION ALL SELECT @sec, 4, 'left', 'text', 'Time-Out', 12
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Locks your account for a short break, from a day to several weeks.</p>', 13
UNION ALL SELECT @sec, 5, 'left', 'text', 'Self-Exclusion', 14
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>Closes your account for months or years. Ask to be excluded from sister sites too.</p>', 15
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Where to Get Help' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Help is free and confidential. You don''t need to be in crisis to ask for support.</p><ul><li><strong>Gambling Therapy</strong> (<a href="https://www.gamblingtherapy.org" target="_blank" rel="noopener noreferrer">gamblingtherapy.org</a>): free online support and live chat in several languages, available worldwide.</li><li><strong>Gamblers Anonymous</strong> (<a href="https://www.gamblersanonymous.org" target="_blank" rel="noopener noreferrer">gamblersanonymous.org</a>): peer support meetings, including online meetings.</li><li><strong>Singapore: National Council on Problem Gambling</strong> (<a href="https://www.ncpg.org.sg" target="_blank" rel="noopener noreferrer">ncpg.org.sg</a>): helpline, counselling and exclusion schemes for Singapore residents.</li></ul><p>If you''re in immediate danger or thinking about harming yourself, contact your local emergency services.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Age and Local Laws' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>You must be of legal gambling age to play, which is 18 or 21 depending on the country and type of gambling. Gambling laws differ across Southeast Asia, and online gambling is restricted in several countries. Always check the law where you live before you play.</p>', 2
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Responsible Gambling' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'How do I know if I have a gambling problem?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>If gambling causes you stress, money worries or problems with family, work or study, or you find it hard to stop, it''s worth talking to a support service.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Can I block myself from casino sites?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Yes. Use self-exclusion at each casino you''ve played at, and install gambling-blocking software on your devices for extra protection.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'How can I help a friend or family member?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Talk to them without judgement, encourage them to contact a support service, and look after yourself too. Many support services also help family members.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'Is it possible to win back what I''ve lost?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Chasing losses usually leads to bigger losses. Casino games have a built-in house edge, so the best decision is to stop and accept the loss.</p>', 9
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Useful Guides' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Bankroll Management Guide', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/guides/bankroll-management-101', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Contact Us', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/contact', 6
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- privacy-policy
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT NULL, (SELECT COALESCE(MAX(p2.sort_order), 0) + 1 FROM pages p2 WHERE p2.parent_id IS NULL AND p2.kind = 'page'), 'privacy-policy', 'Privacy Policy', 'Privacy Policy | Top Casino Guide', 'How Top Casino Guide collects, uses and protects your information, how we use cookies, and the choices you have about your data.', 'draft' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE parent_id IS NULL AND slug = 'privacy-policy');
SET @p2 = (SELECT id FROM pages WHERE parent_id IS NULL AND slug = 'privacy-policy' LIMIT 1);
SET @page = @p2;
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Privacy Policy' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>This policy explains what information we collect when you use this website, how we use it, and the choices you have. By using the site, you agree to this policy.</p>', 2
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Information We Collect' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<ul><li><strong>Information you give us</strong>: when you email us or send a report, we receive your name, email address and anything you include in your message.</li><li><strong>Usage information</strong>: like most websites, we automatically collect technical information such as your browser type, device, the pages you visit and how you arrived on the site.</li><li><strong>Cookies</strong>: small files stored on your device that help the site work and help us understand how it''s used.</li></ul><p>We don''t ask for, and you shouldn''t send us, payment details, passwords or identity documents.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How We Use Your Information' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<ul><li>To run and improve the website and our content</li><li>To reply to your messages and investigate reports about casinos</li><li>To understand which pages are useful, using aggregated statistics</li><li>To track referrals to partner casinos, so we can be paid for them</li><li>To keep the site secure and prevent misuse</li></ul><p>We don''t sell your personal information.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'two_column_table', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Cookies We Use' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>You can block or delete cookies in your browser settings. Some parts of the site may not work properly without them.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Type', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Purpose', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Essential', 6
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Needed for the site to work, for example to remember your settings.</p>', 7
UNION ALL SELECT @sec, 2, 'left', 'text', 'Analytics', 8
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Help us understand how visitors use the site, using anonymous statistics.</p>', 9
UNION ALL SELECT @sec, 3, 'left', 'text', 'Affiliate', 10
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Record when you visit a casino through our links, so the casino can credit us.</p>', 11
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Sharing Your Information' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>We only share information with service providers that help us run the site (such as hosting and analytics), with casinos when you follow an affiliate link (limited to referral tracking), or when the law requires it. Casinos you sign up with have their own privacy policies, which apply to any information you give them.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 10 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 11 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Keeping Your Information Safe' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>We use reasonable technical and organisational measures to protect your information, and keep it only as long as we need it for the purposes above. No website can be completely secure, so please don''t send sensitive information by email.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 12 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 13 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Your Choices and Rights' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Depending on where you live, you may have the right to access, correct or delete the personal information we hold about you, or to object to how we use it. To make a request, email <a href="mailto:topcasinosingapore@gmail.com?subject=Privacy%20request">topcasinosingapore@gmail.com</a>.</p><p>This site is for adults only. We don''t knowingly collect information from anyone under the legal gambling age.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 14 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 15 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Changes to This Policy' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>We may update this policy from time to time, and will post any changes on this page. If you have questions, contact us at <a href="mailto:topcasinosingapore@gmail.com?subject=Privacy%20question">topcasinosingapore@gmail.com</a>.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- sitemap
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT NULL, (SELECT COALESCE(MAX(p2.sort_order), 0) + 1 FROM pages p2 WHERE p2.parent_id IS NULL AND p2.kind = 'page'), 'sitemap', 'Sitemap', 'Sitemap | Top Casino Guide', 'Find every section of Top Casino Guide: casino reviews by country, bonuses, casino games, guides, news and information about us.', 'draft' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE parent_id IS NULL AND slug = 'sitemap');
SET @p3 = (SELECT id FROM pages WHERE parent_id IS NULL AND slug = 'sitemap' LIMIT 1);
SET @page = @p3;
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Sitemap' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', 'Sitemap', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Find your way around Top Casino Guide. Every main section of the site is listed below.</p>', 4
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Casinos by Country' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'columns', 'text', '3', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Thailand Online Casinos', 4
UNION ALL SELECT @sec, 1, 'description', 'text', 'Top rated casinos, bonuses and payment methods for Thailand.', 5
UNION ALL SELECT @sec, 1, 'url', 'text', '/th', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Malaysia Online Casinos', 7
UNION ALL SELECT @sec, 2, 'description', 'text', 'Top rated casinos, bonuses and payment methods for Malaysia.', 8
UNION ALL SELECT @sec, 2, 'url', 'text', '/my', 9
UNION ALL SELECT @sec, 3, 'title', 'text', 'Singapore Online Casinos', 10
UNION ALL SELECT @sec, 3, 'description', 'text', 'Top rated casinos, bonuses and payment methods for Singapore.', 11
UNION ALL SELECT @sec, 3, 'url', 'text', '/sg', 12
UNION ALL SELECT @sec, 4, 'title', 'text', 'Indonesia Online Casinos', 13
UNION ALL SELECT @sec, 4, 'description', 'text', 'Top rated casinos, bonuses and payment methods for Indonesia.', 14
UNION ALL SELECT @sec, 4, 'url', 'text', '/id', 15
UNION ALL SELECT @sec, 5, 'title', 'text', 'Vietnam Online Casinos', 16
UNION ALL SELECT @sec, 5, 'description', 'text', 'Top rated casinos, bonuses and payment methods for Vietnam.', 17
UNION ALL SELECT @sec, 5, 'url', 'text', '/vn', 18
UNION ALL SELECT @sec, 6, 'title', 'text', 'Philippines Online Casinos', 19
UNION ALL SELECT @sec, 6, 'description', 'text', 'Top rated casinos, bonuses and payment methods for Philippines.', 20
UNION ALL SELECT @sec, 6, 'url', 'text', '/ph', 21
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Casino Reviews' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'All Casino Reviews', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/casinos', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Blacklisted Casinos', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/blacklist', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Our 25 Step Review Process', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/about/review-methodology', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Casino Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'All Casino Bonuses', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/casino-bonus', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Welcome Bonus', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casino-bonus/welcome-bonus', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'No Deposit Bonus', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/casino-bonus/no-deposit-bonus', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Free Spins', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/casino-bonus/free-spins', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Deposit Bonus', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/casino-bonus/deposit-bonus', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'Cashback', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/casino-bonus/cashback', 14
UNION ALL SELECT @sec, 7, 'label', 'text', 'Loyalty / VIP Bonus', 15
UNION ALL SELECT @sec, 7, 'url', 'text', '/casino-bonus/loyalty-vip-bonus', 16
UNION ALL SELECT @sec, 8, 'label', 'text', 'Bonus Calculator', 17
UNION ALL SELECT @sec, 8, 'url', 'text', '/calculator', 18
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Casino Games' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'All Casino Games', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/casino-games', 4
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
UNION ALL SELECT @sec, 7, 'label', 'text', 'Video Poker', 15
UNION ALL SELECT @sec, 7, 'url', 'text', '/casino-games/video-poker', 16
UNION ALL SELECT @sec, 8, 'label', 'text', 'Live Casino', 17
UNION ALL SELECT @sec, 8, 'url', 'text', '/casino-games/live-casino', 18
UNION ALL SELECT @sec, 9, 'label', 'text', 'Online Slots', 19
UNION ALL SELECT @sec, 9, 'url', 'text', '/casino-games/online-slots', 20
UNION ALL SELECT @sec, 10, 'label', 'text', 'Sports Betting', 21
UNION ALL SELECT @sec, 10, 'url', 'text', '/casino-games/sports-betting', 22
UNION ALL SELECT @sec, 11, 'label', 'text', 'eSports Betting', 23
UNION ALL SELECT @sec, 11, 'url', 'text', '/casino-games/esports-betting', 24
UNION ALL SELECT @sec, 12, 'label', 'text', '4D Online Betting', 25
UNION ALL SELECT @sec, 12, 'url', 'text', '/casino-games/4d-online-betting', 26
UNION ALL SELECT @sec, 13, 'label', 'text', 'Fishing Online', 27
UNION ALL SELECT @sec, 13, 'url', 'text', '/casino-games/fishing-online', 28
UNION ALL SELECT @sec, 14, 'label', 'text', 'Lottery Online', 29
UNION ALL SELECT @sec, 14, 'url', 'text', '/casino-games/lottery-online', 30
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'News & Guides' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Latest News', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/news', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'All Guides', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/guides', 6
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'About & Contact' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'About Us', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/about', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Our Authors', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/authors', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Responsible Gambling', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/responsible-gambling', 8
UNION ALL SELECT @sec, 4, 'label', 'text', 'Privacy Policy', 9
UNION ALL SELECT @sec, 4, 'url', 'text', '/privacy-policy', 10
UNION ALL SELECT @sec, 5, 'label', 'text', 'Contact Us', 11
UNION ALL SELECT @sec, 5, 'url', 'text', '/contact', 12
UNION ALL SELECT @sec, 6, 'label', 'text', 'Get Listed Now', 13
UNION ALL SELECT @sec, 6, 'url', 'text', '/get-listed', 14
UNION ALL SELECT @sec, 7, 'label', 'text', 'Report a Casino', 15
UNION ALL SELECT @sec, 7, 'url', 'text', '/report-a-casino', 16
UNION ALL SELECT @sec, 8, 'label', 'text', 'Join as Affiliate', 17
UNION ALL SELECT @sec, 8, 'url', 'text', '/affiliate', 18
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- contact
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT NULL, (SELECT COALESCE(MAX(p2.sort_order), 0) + 1 FROM pages p2 WHERE p2.parent_id IS NULL AND p2.kind = 'page'), 'contact', 'Contact Us', 'Contact Us | Top Casino Guide', 'Get in touch with the Top Casino Guide team: questions about reviews, corrections, casino reports, listing requests and partnerships.', 'draft' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE parent_id IS NULL AND slug = 'contact');
SET @p4 = (SELECT id FROM pages WHERE parent_id IS NULL AND slug = 'contact' LIMIT 1);
SET @page = @p4;
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Contact Us' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', 'Contact', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>We''d love to hear from you, whether it''s a question about a review, a correction, or a casino you think we should look at. Email us at <a href="mailto:topcasinosingapore@gmail.com?subject=Website%20enquiry">topcasinosingapore@gmail.com</a> and we''ll reply as soon as we can, usually within two working days.</p>', 4
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Can We Help?' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Choose the topic that fits best, so your message reaches the right person.</p>', 2
UNION ALL SELECT @sec, 0, 'columns', 'text', '2', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Report a Casino', 4
UNION ALL SELECT @sec, 1, 'description', 'text', 'Problems with a casino, such as unpaid winnings or unfair terms.', 5
UNION ALL SELECT @sec, 1, 'url', 'text', '/report-a-casino', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Get Listed', 7
UNION ALL SELECT @sec, 2, 'description', 'text', 'Casino operators who''d like to be reviewed.', 8
UNION ALL SELECT @sec, 2, 'url', 'text', '/get-listed', 9
UNION ALL SELECT @sec, 3, 'title', 'text', 'Become an Affiliate Partner', 10
UNION ALL SELECT @sec, 3, 'description', 'text', 'Partnership and advertising enquiries.', 11
UNION ALL SELECT @sec, 3, 'url', 'text', '/affiliate', 12
UNION ALL SELECT @sec, 4, 'title', 'text', 'Corrections & Feedback', 13
UNION ALL SELECT @sec, 4, 'description', 'text', 'Spotted something out of date? Let us know by email.', 14
UNION ALL SELECT @sec, 4, 'url', 'text', '', 15
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Before You Write' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'A few things that help us reply faster.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Include the casino''s name and website, if your message is about one', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Tell us which country you play from', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Describe what happened, with dates, and attach screenshots if you have them', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Never send us your passwords, card numbers or identity documents', 7
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'faq', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Frequently Asked Questions' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'Are you a casino?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>No. We''re an independent review site. We can''t access casino accounts, process payments or pay out winnings.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Can you help me get my winnings paid?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>We can''t act on your behalf, but we do look into every report, contact the casino where we can, and blacklist casinos that don''t treat players fairly.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'How long will it take to get a reply?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>We aim to reply within two working days.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'I think I have a gambling problem. Who can I talk to?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Please see our Responsible Gambling page for free, confidential support services.</p>', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Useful Links' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Responsible Gambling', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/responsible-gambling', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Blacklisted Casinos', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/blacklist', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'About Us', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/about', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- get-listed
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT NULL, (SELECT COALESCE(MAX(p2.sort_order), 0) + 1 FROM pages p2 WHERE p2.parent_id IS NULL AND p2.kind = 'page'), 'get-listed', 'Get Listed Now', 'Get Your Casino Listed | Top Casino Guide', 'Casino operators: how to get your casino reviewed and listed on Top Casino Guide, what we require, and how our independent review process works.', 'draft' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE parent_id IS NULL AND slug = 'get-listed');
SET @p5 = (SELECT id FROM pages WHERE parent_id IS NULL AND slug = 'get-listed' LIMIT 1);
SET @page = @p5;
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Get Your Casino Listed' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', 'Listed', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Run an online casino that welcomes players in Southeast Asia? We''re always looking for new casinos to review. Tell us about your brand at <a href="mailto:topcasinosingapore@gmail.com?subject=Listing%20request">topcasinosingapore@gmail.com</a> and our team will be in touch.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'What We Require' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'Every casino must meet these before we review it.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'A valid licence from a recognised regulator', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Accepts players from at least one of our markets: Singapore, Malaysia, Thailand, Indonesia, Vietnam or the Philippines', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Fair, clearly published bonus terms', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Games from reputable, independently tested providers', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Reliable withdrawals and responsive customer support', 8
UNION ALL SELECT @sec, 6, 'text', 'text', 'Responsible gambling tools such as deposit limits and self-exclusion', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How It Works' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>From first contact to a published review.</p>', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Send Your Details', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Email us your brand name, website, licence details and the markets you accept.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Background Check', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>We verify your licence, ownership and complaint history.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Full Review', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Our team tests your casino with real accounts against our 25 review factors.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'Publication', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Casinos that pass are published with an independent review and score.</p>', 11
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Our Reviews Are Independent' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>A listing is not an advert. Every casino is scored on the same 25 factors, and a commercial partnership can''t buy a higher rating or remove criticism. We re-test casinos regularly and update reviews when things change, for better or worse.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Learn More' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Our 25 Step Review Process', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/about/review-methodology', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Join as Affiliate', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/affiliate', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Contact Us', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/contact', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- report-a-casino
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT NULL, (SELECT COALESCE(MAX(p2.sort_order), 0) + 1 FROM pages p2 WHERE p2.parent_id IS NULL AND p2.kind = 'page'), 'report-a-casino', 'Report a Casino', 'Report a Casino | Top Casino Guide', 'Had a problem with an online casino? Report unpaid winnings, unfair terms or suspicious sites to Top Casino Guide and help protect other players.', 'draft' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE parent_id IS NULL AND slug = 'report-a-casino');
SET @p6 = (SELECT id FROM pages WHERE parent_id IS NULL AND slug = 'report-a-casino' LIMIT 1);
SET @page = @p6;
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Report a Casino' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', 'Report', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Had a bad experience with an online casino? Tell us. Every report is read by our team, and it helps us warn other players. Email your report to <a href="mailto:topcasinosingapore@gmail.com?subject=Casino%20report">topcasinosingapore@gmail.com</a>.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'checklist_callout', '', 1, 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'What You Can Report' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'We want to hear about any casino that doesn''t treat players fairly.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Winnings that haven''t been paid, or withdrawals delayed for weeks', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Bonus terms changed or applied unfairly', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Accounts closed or funds confiscated without a clear reason', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Unlicensed sites, fake licences or copied branding', 7
UNION ALL SELECT @sec, 5, 'text', 'text', 'Rigged or suspicious games', 8
UNION ALL SELECT @sec, 6, 'text', 'text', 'Poor or no customer support', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'numbered_steps', '', 1, 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Report' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>The more detail you give us, the more we can do.</p>', 2
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Contact the Casino First', 4
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Raise the issue with the casino''s support team and keep a copy of every reply.</p>', 5
UNION ALL SELECT @sec, 2, 'title', 'text', 'Gather Your Evidence', 6
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Screenshots of your account, chat logs, emails, transaction IDs and the relevant terms.</p>', 7
UNION ALL SELECT @sec, 3, 'title', 'text', 'Send Us Your Report', 8
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Email us the casino''s name and website, the country you play from, what happened and when, plus your evidence.</p>', 9
UNION ALL SELECT @sec, 4, 'title', 'text', 'We Investigate', 10
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>We review your evidence, check for similar reports, and contact the casino where we can.</p>', 11
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'What Happens Next' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>If a casino is found to treat players unfairly, we update its review and score, and serious cases are added to our blacklist. We can''t act on your behalf or guarantee a payout, but reports like yours are how we protect other players.</p><p>For your safety, never send us passwords, card numbers or identity documents.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Related Pages' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Blacklisted Casinos', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/blacklist', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'All Casino Reviews', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/casinos', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Contact Us', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/contact', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- affiliate
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT NULL, (SELECT COALESCE(MAX(p2.sort_order), 0) + 1 FROM pages p2 WHERE p2.parent_id IS NULL AND p2.kind = 'page'), 'affiliate', 'Join as Affiliate', 'Partner With Us | Top Casino Guide', 'Affiliate and advertising partnerships with Top Casino Guide: reach online casino players across Southeast Asia through an independent review site.', 'draft' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE parent_id IS NULL AND slug = 'affiliate');
SET @p7 = (SELECT id FROM pages WHERE parent_id IS NULL AND slug = 'affiliate' LIMIT 1);
SET @page = @p7;
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Partner With Top Casino Guide' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', 'Partner', 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>We work with casino operators and affiliate programmes that share our commitment to fair play. If you''d like to partner with us, email <a href="mailto:topcasinosingapore@gmail.com?subject=Affiliate%20partnership">topcasinosingapore@gmail.com</a> with your brand, programme details and target markets.</p>', 4
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Ways to Work With Us' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Every partnership is subject to our review standards.</p>', 2
UNION ALL SELECT @sec, 0, 'columns', 'text', '3', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'Affiliate Partnerships', 4
UNION ALL SELECT @sec, 1, 'description', 'text', 'Revenue share, CPA or hybrid deals for casinos we''ve reviewed and approved.', 5
UNION ALL SELECT @sec, 1, 'url', 'text', '', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Featured Placements', 7
UNION ALL SELECT @sec, 2, 'description', 'text', 'Highlight your latest bonuses and promotions to players in your markets.', 8
UNION ALL SELECT @sec, 2, 'url', 'text', '', 9
UNION ALL SELECT @sec, 3, 'title', 'text', 'Content Partnerships', 10
UNION ALL SELECT @sec, 3, 'description', 'text', 'Game launches, events and news that are useful to our readers.', 11
UNION ALL SELECT @sec, 3, 'url', 'text', '', 12
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
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Who We Partner With' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'We only promote brands we''d recommend to our own readers.', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Licensed operators with a clean complaint history', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Fair, transparent bonus terms', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Strong support for local payment methods and currencies', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Commitment to responsible gambling', 7
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'rich_text', '', 1, 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Our Editorial Independence' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Partnerships help fund this site, but they never decide our ratings. Partner casinos are reviewed and scored exactly like every other casino, and we''ll update a review, or end a partnership, if a partner stops treating players fairly.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'container', '', 0, 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (SELECT @sec AS section_id, 0 AS item_index, 'layout' AS field_key, 'text' AS field_type, 'stack' AS text_value, 5 AS sort_order
UNION ALL SELECT @sec, 0, 'spaceTop', 'text', 'none', 10
UNION ALL SELECT @sec, 0, 'spaceBottom', 'text', 'none', 11
UNION ALL SELECT @sec, 0, 'componentSpacing', 'text', 'own', 16) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, in_container, sort_order) SELECT @page, 'cta_link_list', '', 1, 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Learn More' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 1, 'label', 'text', 'Get Listed Now', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/get-listed', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Our 25 Step Review Process', 5
UNION ALL SELECT @sec, 2, 'url', 'text', '/about/review-methodology', 6
UNION ALL SELECT @sec, 3, 'label', 'text', 'Contact Us', 7
UNION ALL SELECT @sec, 3, 'url', 'text', '/contact', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- Home rebuilt to Figma "D / Home":
-- * {year} replaces the hardcoded 2025 in the hero and meta title.
-- * "Why Trust" sits in a narrow left column beside the hero art.
-- * Our Review Process uses the "+" expandable cards, 4 per row, Figma copy.
-- * Team photos and the Responsible Gaming image pointed at unrelated media
--   (footer badges, flags); they are cleared so clean placeholders show
--   until real images are uploaded.
-- * Top Rated by Country: one card per region + 3-row tables.
-- * Track Record tiles use live counts (casinos, blacklist, regions,
--   guides) plus one typed figure; typing a number overrides a live count.
-- * Blog rows get Figma's intro lines; FAQ uses Figma's five questions.

SET @home = (SELECT id FROM pages WHERE slug = 'home' AND parent_id IS NULL LIMIT 1);

UPDATE pages SET
    meta_title = 'TopCasinoSG - Best Online Casino Reviews You Can Trust in {year}',
    meta_description = IF(meta_description = '', 'Independent, data-driven online casino reviews for Thailand, Malaysia and Singapore: licensing, real-money payouts, bonuses and support tested by our experts.', meta_description)
WHERE id = @home;

SET @s = (SELECT id FROM page_sections WHERE page_id = @home AND block_type = 'hero' AND sort_order = 10 LIMIT 1);
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 0 AND field_key = 'heading';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 0, 'heading', 'text', 'Best Online Casino Reviews You Can Trust in {year}', 1 FROM DUAL WHERE @s IS NOT NULL;

SET @s = (SELECT id FROM page_sections WHERE page_id = @home AND block_type = 'rich_text' AND sort_order = 20 LIMIT 1);
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 0 AND field_key = 'align';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 0, 'align', 'text', 'left', 8 FROM DUAL WHERE @s IS NOT NULL;

SET @s = (SELECT id FROM page_sections WHERE page_id = @home AND block_type = 'icon_box_group' AND sort_order = 30 LIMIT 1);
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 0 AND field_key = 'displayMode';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 0, 'displayMode', 'text', 'expandable', 2 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 0 AND field_key = 'columns';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 0, 'columns', 'text', '4', 4 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 0 AND field_key = 'body';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 0, 'body', 'richtext', '<p>We test every casino for licensing, games, payouts, bonuses, and support.</p>', 12 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 0 AND field_key = 'headingAlignMobile';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 0, 'headingAlignMobile', 'text', 'left', 9 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 0 AND field_key = 'headingAlignDesktop';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 0, 'headingAlignDesktop', 'text', 'left', 10 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index > 0;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 1 AND field_key = 'heading';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 1, 'heading', 'text', 'License, Safety & Fair Play', 2 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 1 AND field_key = 'text';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 1, 'text', 'richtext', '<p>We check if each casino is fully licensed by trusted regulators, use SSL encryption, and offer fair games. Safety is the #1 priority.</p>', 3 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 2 AND field_key = 'heading';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 2, 'heading', 'text', 'Real Money Transactions', 2 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 2 AND field_key = 'text';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 2, 'text', 'richtext', '<p>We deposit and withdraw real money to test speed, payment methods, and transparency. No fluff—just real results players care about.</p>', 3 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 3 AND field_key = 'heading';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 3, 'heading', 'text', 'Game Quality & Variety', 2 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 3 AND field_key = 'text';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 3, 'text', 'richtext', '<p>From big-name providers to mobile slot favorites, we review game fairness, mobile responsiveness, and jackpot availability.</p>', 3 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 4 AND field_key = 'heading';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 4, 'heading', 'text', 'Mobile & Player Experience', 2 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 4 AND field_key = 'text';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 4, 'text', 'richtext', '<p>We play on mobile and desktop to test load time, layout, and how easy (and fun) it is to actually use the casino daily.</p>', 3 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 5 AND field_key = 'heading';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 5, 'heading', 'text', 'Honest Bonus Breakdown', 2 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 5 AND field_key = 'text';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 5, 'text', 'richtext', '<p>We break down the fine print—wagering terms, max cashout, and bonus traps—so you know exactly what you’re getting.</p>', 3 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 6 AND field_key = 'heading';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 6, 'heading', 'text', 'Real Support Test', 2 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 6 AND field_key = 'text';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 6, 'text', 'richtext', '<p>We contact customer support at different hours to test response time, accuracy, and friendliness—just like real players would.</p>', 3 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 7 AND field_key = 'heading';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 7, 'heading', 'text', 'Transparency & Player Feedback', 2 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 7 AND field_key = 'text';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 7, 'text', 'richtext', '<p>We monitor real player reviews, complaints, and casino behavior. Our reviews are updated regularly with user feedback.</p>', 3 FROM DUAL WHERE @s IS NOT NULL;

SET @s = (SELECT id FROM page_sections WHERE page_id = @home AND block_type = 'team_grid' AND sort_order = 40 LIMIT 1);
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 0 AND field_key = 'intro';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 0, 'intro', 'text', 'Our team includes veteran gamblers, ex-casino employees, and analysts.', 6 FROM DUAL WHERE @s IS NOT NULL;
UPDATE page_section_fields SET media_id = NULL WHERE section_id = @s AND field_key = 'photo';

SET @s = (SELECT id FROM page_sections WHERE page_id = @home AND block_type = 'top_casinos_by_region' AND sort_order = 50 LIMIT 1);
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 0 AND field_key = 'moreCount';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 0, 'moreCount', 'text', '3', 3 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND field_key IN ('highlightCount', 'regionCode');

SET @s = (SELECT id FROM page_sections WHERE page_id = @home AND block_type = 'content_carousel' AND sort_order = 70 LIMIT 1);
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 0 AND field_key = 'intro';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 0, 'intro', 'text', 'How to Pick the Right Casino: Learn how to identify safe sites.', 10 FROM DUAL WHERE @s IS NOT NULL;

SET @s = (SELECT id FROM page_sections WHERE page_id = @home AND block_type = 'content_carousel' AND sort_order = 80 LIMIT 1);
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 0 AND field_key = 'intro';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 0, 'intro', 'text', 'Popular Games & How to Win: Blackjack, slots, baccarat tips.', 10 FROM DUAL WHERE @s IS NOT NULL;

SET @s = (SELECT id FROM page_sections WHERE page_id = @home AND block_type = 'stats_counter' AND sort_order = 120 LIMIT 1);
DELETE FROM page_section_fields WHERE section_id = @s AND item_index > 0;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 0 AND field_key IN ('bgType', 'bgFrom', 'bgTo', 'bgImage');
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 1 AND field_key = 'prefix';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 1, 'prefix', 'text', '', 1 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 1 AND field_key = 'number';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 1, 'number', 'text', '', 2 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 1 AND field_key = 'suffix';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 1, 'suffix', 'text', '+', 3 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 1 AND field_key = 'title';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 1, 'title', 'text', 'Casinos Reviewed', 4 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 1 AND field_key = 'content';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 1, 'content', 'text', '', 5 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 1 AND field_key = 'source';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 1, 'source', 'text', 'casinos', 6 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 2 AND field_key = 'prefix';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 2, 'prefix', 'text', '', 1 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 2 AND field_key = 'number';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 2, 'number', 'text', '10000', 2 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 2 AND field_key = 'suffix';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 2, 'suffix', 'text', '+', 3 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 2 AND field_key = 'title';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 2, 'title', 'text', 'Players Helped', 4 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 2 AND field_key = 'content';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 2, 'content', 'text', '', 5 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 2 AND field_key = 'source';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 2, 'source', 'text', '', 6 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 3 AND field_key = 'prefix';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 3, 'prefix', 'text', '', 1 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 3 AND field_key = 'number';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 3, 'number', 'text', '', 2 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 3 AND field_key = 'suffix';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 3, 'suffix', 'text', '+', 3 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 3 AND field_key = 'title';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 3, 'title', 'text', 'Blacklisted Casinos Flagged', 4 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 3 AND field_key = 'content';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 3, 'content', 'text', '', 5 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 3 AND field_key = 'source';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 3, 'source', 'text', 'blacklist', 6 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 4 AND field_key = 'prefix';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 4, 'prefix', 'text', '', 1 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 4 AND field_key = 'number';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 4, 'number', 'text', '', 2 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 4 AND field_key = 'suffix';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 4, 'suffix', 'text', '', 3 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 4 AND field_key = 'title';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 4, 'title', 'text', 'Countries Covered', 4 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 4 AND field_key = 'content';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 4, 'content', 'text', '', 5 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 4 AND field_key = 'source';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 4, 'source', 'text', 'regions', 6 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 5 AND field_key = 'prefix';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 5, 'prefix', 'text', '', 1 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 5 AND field_key = 'number';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 5, 'number', 'text', '', 2 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 5 AND field_key = 'suffix';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 5, 'suffix', 'text', '+', 3 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 5 AND field_key = 'title';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 5, 'title', 'text', 'Guides Published', 4 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 5 AND field_key = 'content';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 5, 'content', 'text', '', 5 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 5 AND field_key = 'source';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 5, 'source', 'text', 'guides', 6 FROM DUAL WHERE @s IS NOT NULL;

SET @s = (SELECT id FROM page_sections WHERE page_id = @home AND block_type = 'rich_text' AND sort_order = 130 LIMIT 1);
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 0 AND field_key = 'body';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 0, 'body', 'richtext', '<p>At Top Casino, we believe that online gaming should always be fun, safe, and within your control. While we highlight the best and most trusted casinos, we also encourage all players to approach gambling responsibly.</p><p>Whether you''re a beginner or a seasoned player, it’s important to set limits, manage your bankroll wisely, and recognize the signs of problematic behavior. If gambling stops being fun, take a break — help is always available.</p><p>Learn more on how to protect yourself and play smart by visiting our Responsible Gambling page.</p>', 2 FROM DUAL WHERE @s IS NOT NULL;
UPDATE page_section_fields SET media_id = NULL WHERE section_id = @s AND field_key = 'image';
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 0 AND field_key = 'bgType';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 0, 'bgType', 'text', 'color', 4 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 0 AND field_key = 'bgFrom';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 0, 'bgFrom', 'text', 'surface-muted', 5 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 0 AND field_key = 'bgTo';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 0, 'bgTo', 'text', 'surface-muted', 6 FROM DUAL WHERE @s IS NOT NULL;

SET @s = (SELECT id FROM page_sections WHERE page_id = @home AND block_type = 'faq' AND sort_order = 140 LIMIT 1);
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 0 AND field_key = 'heading';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 0, 'heading', 'text', 'FAQs', 1 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index > 0;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 1 AND field_key = 'question';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 1, 'question', 'text', 'How are the payout turnaround times?', 2 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 1 AND field_key = 'answer';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 1, 'answer', 'richtext', '<p>It depends on the casino and the payment method. E-wallets and crypto are usually the fastest, often within hours, while bank transfers can take one to three working days. Each review lists the payout speed we measured with real withdrawals.</p>', 3 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 2 AND field_key = 'question';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 2, 'question', 'text', 'Are all online casinos safe and legit?', 2 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 2 AND field_key = 'answer';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 2, 'answer', 'richtext', '<p>No. Only play at casinos with a valid licence, secure payments and a clean payout record. We test every casino we recommend, and list the ones to avoid on our blacklist.</p>', 3 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 3 AND field_key = 'question';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 3, 'question', 'text', 'What can I do if I encounter issues with withdrawal?', 2 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 3 AND field_key = 'answer';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 3, 'answer', 'richtext', '<p>Contact the casino’s support first and keep records of every message. Check the bonus terms, since unmet wagering is the most common cause. If the casino still refuses to pay, report it to its licensing authority and let us know so we can review it.</p>', 3 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 4 AND field_key = 'question';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 4, 'question', 'text', 'Do all online casinos offer a welcome bonus?', 2 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 4 AND field_key = 'answer';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 4, 'answer', 'richtext', '<p>Most do, usually as a deposit match or free spins, but the terms vary a lot. Check the wagering requirement and maximum cashout before claiming, or compare offers on our Bonuses pages.</p>', 3 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 5 AND field_key = 'question';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 5, 'question', 'text', 'How do I start playing online?', 2 FROM DUAL WHERE @s IS NOT NULL;
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 5 AND field_key = 'answer';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 5, 'answer', 'richtext', '<p>Pick a casino from our reviews, register, verify your account and make your first deposit with a payment method you trust. Set a budget before you play, and start with games whose rules you know.</p>', 3 FROM DUAL WHERE @s IS NOT NULL;

SET @s = (SELECT id FROM page_sections WHERE page_id = @home AND block_type = 'rich_text' AND sort_order = 150 LIMIT 1);
DELETE FROM page_section_fields WHERE section_id = @s AND item_index = 0 AND field_key = 'body';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order) SELECT @s, 0, 'body', 'richtext', '<p>Our goal is to help you play smart, win more, and avoid scams. Start exploring the best casinos now.</p>', 2 FROM DUAL WHERE @s IS NOT NULL;

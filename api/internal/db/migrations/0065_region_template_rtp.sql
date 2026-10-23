-- /{region}/rtp becomes a shared region page (region-template/rtp, see
-- 0057). The th/my/sg copies were identical apart from region name, adjective,
-- currency and links (checked field by field), so their sections move into
-- the template; the page rows stay so a region can still get its own version.

SET @template = (SELECT id FROM pages WHERE slug = 'region-template' AND parent_id IS NULL LIMIT 1);
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @template, 3, 'rtp', 'Overview RTP', '', '', 'published' FROM DUAL
WHERE @template IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @template AND slug = 'rtp');
SET @page = (SELECT id FROM pages WHERE parent_id = @template AND slug = 'rtp' LIMIT 1);
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'introduction_section', '', 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, media_id, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, '{region} Real-Time RTP & Live Casino Bonus Trackers' AS text_value, NULL AS media_id, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'highlightText', 'text', 'Real-Time RTP', NULL, 2
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Updated', NULL, 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Want to play smarter and win more? We give you access to real-time RTP stats and live casino bonus updates tailored just for players in {region}. Whether you''re chasing high-payout slots or exclusive limited-time offers, this is your go-to hub.</p>', NULL, 4
) AS rows_to_insert WHERE @sec IS NOT NULL;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'rich_text', '', 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, media_id, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'What is RTP & Why It Matters' AS text_value, NULL AS media_id, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>If you''re serious about winning in gambling, understanding Return to Player (RTP) is key. RTP tells you how much a game pays back over time, which is why you should choose games that reward you more.</p><h3>Understand The Basics of RTP</h3><ul><li>RTP is usually expressed as a percentage. For example, an RTP of 96% means the game pays back 96 {currency} for every 100 {currency} wagered.</li><li>Games with RTPs of 96% or more are statistically more favorable. Picking these over low-RTP slots increases your chances of winning.</li></ul>', NULL, 2
) AS rows_to_insert WHERE @sec IS NOT NULL;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'game_rtp_carousel', '', 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, media_id, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Top High RTP Slot Games (Updated Weekly)' AS text_value, NULL AS media_id, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', NULL, 3
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'surface-muted', NULL, 4
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'surface-muted', NULL, 5
UNION ALL SELECT @sec, 0, 'source', 'text', 'auto', NULL, 10
UNION ALL SELECT @sec, 0, 'category', 'text', 'slot', NULL, 11
UNION ALL SELECT @sec, 0, 'limit', 'text', '10', NULL, 12
) AS rows_to_insert WHERE @sec IS NOT NULL;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'game_rtp_carousel', '', 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, media_id, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Table Games with Consistently High RTP' AS text_value, NULL AS media_id, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', NULL, 3
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'surface-muted', NULL, 4
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'surface-muted', NULL, 5
UNION ALL SELECT @sec, 0, 'source', 'text', 'auto', NULL, 10
UNION ALL SELECT @sec, 0, 'category', 'text', 'table,live', NULL, 11
UNION ALL SELECT @sec, 0, 'limit', 'text', '10', NULL, 12
) AS rows_to_insert WHERE @sec IS NOT NULL;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'rich_text', '', 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, media_id, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Our RTP Tracker Works' AS text_value, NULL AS media_id, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>We update daily with new game stats by checking on game configuration changes, RTP shifts based on provider releases, and bonus compatibility changes. We prioritize real gameplay data that is relevant to your region and gameplay habits.</p><h3>Live Bonus Tracker: Active Deals to Claim</h3><p>Claim limited exclusive offers like free spins, no deposit bonuses, and reload bonuses, verified and updated in real time.</p>', NULL, 2
) AS rows_to_insert WHERE @sec IS NOT NULL;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'data_table', 'section--tight-top', 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, media_id, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'bonusType' AS field_key, 'text' AS field_type, 'welcome' AS text_value, NULL AS media_id, 3 AS sort_order
UNION ALL SELECT @sec, 0, 'source', 'text', 'bonuses', NULL, 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', NULL, 4
) AS rows_to_insert WHERE @sec IS NOT NULL;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'highlight_panel', 'section--divider-top', 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, media_id, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'headingLine1' AS field_key, 'text' AS field_type, 'Things you should watch out for' AS text_value, NULL AS media_id, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'headingLine1Color', 'text', 'primary', NULL, 2
UNION ALL SELECT @sec, 0, 'headingLine2', 'text', 'Fake RTP & Bonus Claims', NULL, 3
UNION ALL SELECT @sec, 0, 'headingLine2Color', 'text', 'danger', NULL, 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Let''s be real, not all casinos are honest. Some fake their RTP stats or use outdated configurations.</p>', NULL, 5
UNION ALL SELECT @sec, 0, 'box1Heading', 'text', 'To verify real RTP data', NULL, 6
UNION ALL SELECT @sec, 0, 'box1Body', 'richtext', '<ul><li>Check if the game''s RTP is listed in-game or on the provider''s site</li><li>Use verified casinos with transparency policies</li><li>Avoid new sites with vague "high payout" claims</li></ul>', NULL, 7
UNION ALL SELECT @sec, 0, 'box2Heading', 'text', 'To identify high chance fake bonus pages', NULL, 8
UNION ALL SELECT @sec, 0, 'box2Body', 'richtext', '<ul><li>No expiration dates</li><li>Suspiciously large bonuses (500%+)</li><li>No wagering info</li></ul>', NULL, 9
UNION ALL SELECT @sec, 0, 'noteText', 'text', 'You can check out the ', NULL, 10
UNION ALL SELECT @sec, 0, 'noteLinkUrl', 'text', '/{regionCode}/blacklist', NULL, 11
UNION ALL SELECT @sec, 0, 'noteLinkLabel', 'text', 'blacklisted casinos here.', NULL, 12
) AS rows_to_insert WHERE @sec IS NOT NULL;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'highlight_panel', 'section--tight-top', 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, media_id, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'headingLine1' AS field_key, 'text' AS field_type, 'Suggestions for' AS text_value, NULL AS media_id, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'headingLine1Color', 'text', 'success', NULL, 2
UNION ALL SELECT @sec, 0, 'headingLine2', 'text', 'Maximizing RTP & Bonuses', NULL, 3
UNION ALL SELECT @sec, 0, 'headingLine2Color', 'text', 'primary', NULL, 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>One of the most effective approaches is using features like auto-spin with stop-loss or stop-win limits, along with setting a fixed budget per session. This not only helps control spending but also ensures a more disciplined and strategic gaming experience, especially when playing high-variance slots.</p><p>Another proven strategy is to combine RTP data with bonus opportunities. By choosing games with an RTP above 96% and applying bonuses with low wagering requirements, players can maximize both their chances of winning and the value of promotional offers.</p>', NULL, 5
) AS rows_to_insert WHERE @sec IS NOT NULL;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'faq', 'section--divider-top', 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, media_id, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs of RTP & Bonus Tracker' AS text_value, NULL AS media_id, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'Good RTP?', NULL, 1
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>Generally, an RTP of 96% or higher is considered good - it means the game statistically returns more of your wagered money over time compared to lower-RTP games.</p>', NULL, 2
UNION ALL SELECT @sec, 2, 'question', 'text', 'Does RTP change in real-time?', NULL, 2
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>RTP itself is a fixed, long-run statistical average set by the game provider - it doesn''t change hand-to-hand. What we update in real time is which games/casinos are currently offering the highest-RTP options and active bonuses.</p>', NULL, 2
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>We review game configurations and bonus offers daily to keep this list current.</p>', NULL, 2
UNION ALL SELECT @sec, 3, 'question', 'text', 'How often is the tracker updated?', NULL, 3
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>No - the bonuses listed here are available to players in {region}, but most casinos also offer similar promotions in other regions we cover.</p>', NULL, 2
UNION ALL SELECT @sec, 4, 'question', 'text', 'Are bonuses {region}-exclusive?', NULL, 4
) AS rows_to_insert WHERE @sec IS NOT NULL;

SET @templated = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
DELETE s FROM page_sections s
JOIN pages p ON p.id = s.page_id AND p.slug = 'rtp'
JOIN pages region ON region.id = p.parent_id AND region.parent_id IS NULL AND region.slug IN ('th', 'my', 'sg')
WHERE @templated > 0;

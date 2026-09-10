-- Seeds the "/{region}/rtp" hub page (created in draft by 0035) with the
-- full CMS content from Figma "D / Country / TH / RTP": explainer copy, two
-- curated high-RTP game carousels, "how the tracker works" copy, the live
-- Bonus Tracker table (reuses bonus_listing_table - see BonusListingTableSection.tsx),
-- watch-outs/suggestions panels, and an FAQ. Same content across th/my/sg
-- since none of this copy is region-name-specific (only the blacklist link
-- path and the Bonus Tracker's regionCode differ per region).
-- Idempotent: guarded by NOT EXISTS on sort_order, safe to run more than once.

-- ===================== TH =====================
SET @page_id = (
  SELECT p.id FROM pages p
  JOIN pages region ON region.id = p.parent_id
  WHERE region.slug = 'th' AND p.slug = 'rtp'
);

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'rich_text', 1 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 1);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'What is RTP & Why It Matters', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>If you''re serious about winning in gambling, understanding Return to Player (RTP) is key. RTP tells you how much a game pays back over time, which is why you should choose games that reward you more.</p><h3>Understand The Basics of RTP</h3><ul><li>RTP is usually expressed as a percentage. For example, an RTP of 96% means the game pays back 96 THB for every 100 THB wagered.</li><li>Games with RTPs of 96% or more are statistically more favorable. Picking these over low-RTP slots increases your chances of winning.</li></ul>', 2 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'game_rtp_carousel', 2 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 1)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 2);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'Top High RTP Slot Games (Updated Weekly)', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'surface-muted', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'surface-muted', 5 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'name', 'text', 'Wisdom of Athena', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'provider', 'text', 'Pragmatic Play', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'rtp', 'text', '98.00%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'name', 'text', 'Wisdom of Athena', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'provider', 'text', 'Pragmatic Play', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'rtp', 'text', '98.00%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'name', 'text', 'Wisdom of Athena', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'provider', 'text', 'Pragmatic Play', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'rtp', 'text', '98.00%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'name', 'text', 'Wisdom of Athena', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'provider', 'text', 'Pragmatic Play', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'rtp', 'text', '98.00%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'name', 'text', 'Wisdom of Athena', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'provider', 'text', 'Pragmatic Play', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'rtp', 'text', '98.00%', 4 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'game_rtp_carousel', 3 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 2)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 3);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'Table Games with Consistently High RTP', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'surface-muted', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'surface-muted', 5 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'name', 'text', 'Blackjack Classic', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'provider', 'text', 'Evolution', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'rtp', 'text', '99.50%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'name', 'text', 'Blackjack Classic', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'provider', 'text', 'Evolution', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'rtp', 'text', '99.50%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'name', 'text', 'Blackjack Classic', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'provider', 'text', 'Evolution', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'rtp', 'text', '99.50%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'name', 'text', 'Blackjack Classic', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'provider', 'text', 'Evolution', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'rtp', 'text', '99.50%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'name', 'text', 'Blackjack Classic', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'provider', 'text', 'Evolution', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'rtp', 'text', '99.50%', 4 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'rich_text', 4 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 3)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 4);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'How Our RTP Tracker Works', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>We update daily with new game stats by checking on game configuration changes, RTP shifts based on provider releases, and bonus compatibility changes. We prioritize real gameplay data that is relevant to your region and gameplay habits.</p><h3>Live Bonus Tracker: Active Deals to Claim</h3><p>Claim limited exclusive offers like free spins, no deposit bonuses, and reload bonuses, verified and updated in real time.</p>', 2 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'bonus_listing_table', 5 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 4)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 5);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'regionCode', 'text', 'th', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'welcome', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'highlight_panel', 6 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 5)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 6);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'headingLine1', 'text', 'Things you should watch out for', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingLine1Color', 'text', 'primary', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingLine2', 'text', 'Fake RTP & Bonus Claims', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingLine2Color', 'text', 'danger', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Let''s be real, not all casinos are honest. Some fake their RTP stats or use outdated configurations.</p>', 5 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'box1Heading', 'text', 'To verify real RTP data', 6 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'box1Body', 'richtext', '<ul><li>Check if the game''s RTP is listed in-game or on the provider''s site</li><li>Use verified casinos with transparency policies</li><li>Avoid new sites with vague "high payout" claims</li></ul>', 7 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'box2Heading', 'text', 'To identify high chance fake bonus pages', 8 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'box2Body', 'richtext', '<ul><li>No expiration dates</li><li>Suspiciously large bonuses (500%+)</li><li>No wagering info</li></ul>', 9 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'noteText', 'text', 'You can check out the ', 10 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'noteLinkUrl', 'text', '/th/blacklist', 11 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'noteLinkLabel', 'text', 'blacklisted casinos here.', 12 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'highlight_panel', 7 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 6)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 7);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'headingLine1', 'text', 'Suggestions for', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingLine1Color', 'text', 'success', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingLine2', 'text', 'Maximizing RTP & Bonuses', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingLine2Color', 'text', 'primary', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>One of the most effective approaches is using features like auto-spin with stop-loss or stop-win limits, along with setting a fixed budget per session. This not only helps control spending but also ensures a more disciplined and strategic gaming experience, especially when playing high-variance slots.</p><p>Another proven strategy is to combine RTP data with bonus opportunities. By choosing games with an RTP above 96% and applying bonuses with low wagering requirements, players can maximize both their chances of winning and the value of promotional offers.</p>', 5 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'faq', 8 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 7)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 8);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'FAQs of RTP & Bonus Tracker', 1 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'question', 'text', 'What counts as a good RTP?', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>Generally, an RTP of 96% or higher is considered good - it means the game statistically returns more of your wagered money over time compared to lower-RTP games.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'question', 'text', 'Does RTP change in real-time?', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>RTP itself is a fixed, long-run statistical average set by the game provider - it doesn''t change hand-to-hand. What we update in real time is which games/casinos are currently offering the highest-RTP options and active bonuses.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'question', 'text', 'How often is the tracker updated?', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>We review game configurations and bonus offers daily to keep this list current.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'question', 'text', 'Are bonuses Thai-exclusive?', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>No - the bonuses listed here are available to players in Thailand, but most casinos also offer similar promotions in other regions we cover.</p>', 2 WHERE @sec > 0
) AS ignored;

UPDATE pages SET status = 'published' WHERE id = @page_id AND status = 'draft';

-- ===================== MY =====================
SET @page_id = (
  SELECT p.id FROM pages p
  JOIN pages region ON region.id = p.parent_id
  WHERE region.slug = 'my' AND p.slug = 'rtp'
);

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'rich_text', 1 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 1);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'What is RTP & Why It Matters', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>If you''re serious about winning in gambling, understanding Return to Player (RTP) is key. RTP tells you how much a game pays back over time, which is why you should choose games that reward you more.</p><h3>Understand The Basics of RTP</h3><ul><li>RTP is usually expressed as a percentage. For example, an RTP of 96% means the game pays back 96 MYR for every 100 MYR wagered.</li><li>Games with RTPs of 96% or more are statistically more favorable. Picking these over low-RTP slots increases your chances of winning.</li></ul>', 2 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'game_rtp_carousel', 2 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 1)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 2);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'Top High RTP Slot Games (Updated Weekly)', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'surface-muted', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'surface-muted', 5 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'name', 'text', 'Wisdom of Athena', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'provider', 'text', 'Pragmatic Play', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'rtp', 'text', '98.00%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'name', 'text', 'Wisdom of Athena', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'provider', 'text', 'Pragmatic Play', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'rtp', 'text', '98.00%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'name', 'text', 'Wisdom of Athena', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'provider', 'text', 'Pragmatic Play', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'rtp', 'text', '98.00%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'name', 'text', 'Wisdom of Athena', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'provider', 'text', 'Pragmatic Play', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'rtp', 'text', '98.00%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'name', 'text', 'Wisdom of Athena', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'provider', 'text', 'Pragmatic Play', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'rtp', 'text', '98.00%', 4 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'game_rtp_carousel', 3 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 2)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 3);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'Table Games with Consistently High RTP', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'surface-muted', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'surface-muted', 5 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'name', 'text', 'Blackjack Classic', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'provider', 'text', 'Evolution', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'rtp', 'text', '99.50%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'name', 'text', 'Blackjack Classic', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'provider', 'text', 'Evolution', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'rtp', 'text', '99.50%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'name', 'text', 'Blackjack Classic', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'provider', 'text', 'Evolution', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'rtp', 'text', '99.50%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'name', 'text', 'Blackjack Classic', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'provider', 'text', 'Evolution', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'rtp', 'text', '99.50%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'name', 'text', 'Blackjack Classic', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'provider', 'text', 'Evolution', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'rtp', 'text', '99.50%', 4 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'rich_text', 4 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 3)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 4);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'How Our RTP Tracker Works', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>We update daily with new game stats by checking on game configuration changes, RTP shifts based on provider releases, and bonus compatibility changes. We prioritize real gameplay data that is relevant to your region and gameplay habits.</p><h3>Live Bonus Tracker: Active Deals to Claim</h3><p>Claim limited exclusive offers like free spins, no deposit bonuses, and reload bonuses, verified and updated in real time.</p>', 2 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'bonus_listing_table', 5 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 4)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 5);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'regionCode', 'text', 'my', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'welcome', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'highlight_panel', 6 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 5)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 6);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'headingLine1', 'text', 'Things you should watch out for', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingLine1Color', 'text', 'primary', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingLine2', 'text', 'Fake RTP & Bonus Claims', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingLine2Color', 'text', 'danger', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Let''s be real, not all casinos are honest. Some fake their RTP stats or use outdated configurations.</p>', 5 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'box1Heading', 'text', 'To verify real RTP data', 6 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'box1Body', 'richtext', '<ul><li>Check if the game''s RTP is listed in-game or on the provider''s site</li><li>Use verified casinos with transparency policies</li><li>Avoid new sites with vague "high payout" claims</li></ul>', 7 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'box2Heading', 'text', 'To identify high chance fake bonus pages', 8 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'box2Body', 'richtext', '<ul><li>No expiration dates</li><li>Suspiciously large bonuses (500%+)</li><li>No wagering info</li></ul>', 9 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'noteText', 'text', 'You can check out the ', 10 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'noteLinkUrl', 'text', '/my/blacklist', 11 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'noteLinkLabel', 'text', 'blacklisted casinos here.', 12 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'highlight_panel', 7 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 6)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 7);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'headingLine1', 'text', 'Suggestions for', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingLine1Color', 'text', 'success', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingLine2', 'text', 'Maximizing RTP & Bonuses', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingLine2Color', 'text', 'primary', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>One of the most effective approaches is using features like auto-spin with stop-loss or stop-win limits, along with setting a fixed budget per session. This not only helps control spending but also ensures a more disciplined and strategic gaming experience, especially when playing high-variance slots.</p><p>Another proven strategy is to combine RTP data with bonus opportunities. By choosing games with an RTP above 96% and applying bonuses with low wagering requirements, players can maximize both their chances of winning and the value of promotional offers.</p>', 5 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'faq', 8 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 7)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 8);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'FAQs of RTP & Bonus Tracker', 1 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'question', 'text', 'What counts as a good RTP?', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>Generally, an RTP of 96% or higher is considered good - it means the game statistically returns more of your wagered money over time compared to lower-RTP games.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'question', 'text', 'Does RTP change in real-time?', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>RTP itself is a fixed, long-run statistical average set by the game provider - it doesn''t change hand-to-hand. What we update in real time is which games/casinos are currently offering the highest-RTP options and active bonuses.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'question', 'text', 'How often is the tracker updated?', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>We review game configurations and bonus offers daily to keep this list current.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'question', 'text', 'Are bonuses Malaysia-exclusive?', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>No - the bonuses listed here are available to players in Malaysia, but most casinos also offer similar promotions in other regions we cover.</p>', 2 WHERE @sec > 0
) AS ignored;

UPDATE pages SET status = 'published' WHERE id = @page_id AND status = 'draft';

-- ===================== SG =====================
SET @page_id = (
  SELECT p.id FROM pages p
  JOIN pages region ON region.id = p.parent_id
  WHERE region.slug = 'sg' AND p.slug = 'rtp'
);

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'rich_text', 1 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 1);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'What is RTP & Why It Matters', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>If you''re serious about winning in gambling, understanding Return to Player (RTP) is key. RTP tells you how much a game pays back over time, which is why you should choose games that reward you more.</p><h3>Understand The Basics of RTP</h3><ul><li>RTP is usually expressed as a percentage. For example, an RTP of 96% means the game pays back 96 SGD for every 100 SGD wagered.</li><li>Games with RTPs of 96% or more are statistically more favorable. Picking these over low-RTP slots increases your chances of winning.</li></ul>', 2 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'game_rtp_carousel', 2 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 1)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 2);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'Top High RTP Slot Games (Updated Weekly)', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'surface-muted', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'surface-muted', 5 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'name', 'text', 'Wisdom of Athena', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'provider', 'text', 'Pragmatic Play', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'rtp', 'text', '98.00%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'name', 'text', 'Wisdom of Athena', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'provider', 'text', 'Pragmatic Play', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'rtp', 'text', '98.00%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'name', 'text', 'Wisdom of Athena', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'provider', 'text', 'Pragmatic Play', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'rtp', 'text', '98.00%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'name', 'text', 'Wisdom of Athena', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'provider', 'text', 'Pragmatic Play', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'rtp', 'text', '98.00%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'name', 'text', 'Wisdom of Athena', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'provider', 'text', 'Pragmatic Play', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'rtp', 'text', '98.00%', 4 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'game_rtp_carousel', 3 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 2)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 3);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'Table Games with Consistently High RTP', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'surface-muted', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'surface-muted', 5 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'name', 'text', 'Blackjack Classic', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'provider', 'text', 'Evolution', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'rtp', 'text', '99.50%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'name', 'text', 'Blackjack Classic', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'provider', 'text', 'Evolution', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'rtp', 'text', '99.50%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'name', 'text', 'Blackjack Classic', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'provider', 'text', 'Evolution', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'rtp', 'text', '99.50%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'name', 'text', 'Blackjack Classic', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'provider', 'text', 'Evolution', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'rtp', 'text', '99.50%', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'name', 'text', 'Blackjack Classic', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'provider', 'text', 'Evolution', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'rtp', 'text', '99.50%', 4 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'rich_text', 4 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 3)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 4);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'How Our RTP Tracker Works', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>We update daily with new game stats by checking on game configuration changes, RTP shifts based on provider releases, and bonus compatibility changes. We prioritize real gameplay data that is relevant to your region and gameplay habits.</p><h3>Live Bonus Tracker: Active Deals to Claim</h3><p>Claim limited exclusive offers like free spins, no deposit bonuses, and reload bonuses, verified and updated in real time.</p>', 2 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'bonus_listing_table', 5 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 4)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 5);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'regionCode', 'text', 'sg', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'welcome', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'highlight_panel', 6 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 5)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 6);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'headingLine1', 'text', 'Things you should watch out for', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingLine1Color', 'text', 'primary', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingLine2', 'text', 'Fake RTP & Bonus Claims', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingLine2Color', 'text', 'danger', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Let''s be real, not all casinos are honest. Some fake their RTP stats or use outdated configurations.</p>', 5 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'box1Heading', 'text', 'To verify real RTP data', 6 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'box1Body', 'richtext', '<ul><li>Check if the game''s RTP is listed in-game or on the provider''s site</li><li>Use verified casinos with transparency policies</li><li>Avoid new sites with vague "high payout" claims</li></ul>', 7 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'box2Heading', 'text', 'To identify high chance fake bonus pages', 8 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'box2Body', 'richtext', '<ul><li>No expiration dates</li><li>Suspiciously large bonuses (500%+)</li><li>No wagering info</li></ul>', 9 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'noteText', 'text', 'You can check out the ', 10 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'noteLinkUrl', 'text', '/sg/blacklist', 11 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'noteLinkLabel', 'text', 'blacklisted casinos here.', 12 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'highlight_panel', 7 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 6)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 7);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'headingLine1', 'text', 'Suggestions for', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingLine1Color', 'text', 'success', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingLine2', 'text', 'Maximizing RTP & Bonuses', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingLine2Color', 'text', 'primary', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>One of the most effective approaches is using features like auto-spin with stop-loss or stop-win limits, along with setting a fixed budget per session. This not only helps control spending but also ensures a more disciplined and strategic gaming experience, especially when playing high-variance slots.</p><p>Another proven strategy is to combine RTP data with bonus opportunities. By choosing games with an RTP above 96% and applying bonuses with low wagering requirements, players can maximize both their chances of winning and the value of promotional offers.</p>', 5 WHERE @sec > 0
) AS ignored;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'faq', 8 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 7)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 8);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'FAQs of RTP & Bonus Tracker', 1 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'question', 'text', 'What counts as a good RTP?', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>Generally, an RTP of 96% or higher is considered good - it means the game statistically returns more of your wagered money over time compared to lower-RTP games.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'question', 'text', 'Does RTP change in real-time?', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>RTP itself is a fixed, long-run statistical average set by the game provider - it doesn''t change hand-to-hand. What we update in real time is which games/casinos are currently offering the highest-RTP options and active bonuses.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'question', 'text', 'How often is the tracker updated?', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>We review game configurations and bonus offers daily to keep this list current.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'question', 'text', 'Are bonuses Singapore-exclusive?', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>No - the bonuses listed here are available to players in Singapore, but most casinos also offer similar promotions in other regions we cover.</p>', 2 WHERE @sec > 0
) AS ignored;

UPDATE pages SET status = 'published' WHERE id = @page_id AND status = 'draft';

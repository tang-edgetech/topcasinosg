-- /{region}/payment-methods and /{region}/rtp (th/my/sg) switch from
-- hand-typed copies to live records, and their page headers become editable:
-- * RTP game sliders read RTP Entries ("source" = auto): slots in the first
--   slider, table + live games in the second, highest RTP first. The old
--   hand-typed placeholder cards are removed.
-- * The "Fees, Processing Time & Limits" table reads Casinos ("source" =
--   casinos): logo, accepted payment methods (icons from Payment Methods),
--   payout speed. The old hand-typed rows are removed.
-- * Each page gets an introduction_section as its first section, carrying
--   the header text that used to be hardcoded in the route. Its page menu is
--   left empty so the site builds the standard region menu automatically.
-- regionCode is left blank on the live sections: they use the page's region.

DELETE f FROM page_section_fields f
JOIN page_sections s ON s.id = f.section_id AND s.block_type = 'game_rtp_carousel'
JOIN pages p ON p.id = s.page_id AND p.slug = 'rtp'
JOIN pages region ON region.id = p.parent_id AND region.parent_id IS NULL AND region.slug IN ('th', 'my', 'sg')
WHERE f.item_index > 0;

INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT s.id, 0, t.field_key, 'text',
    CASE WHEN t.field_key = 'category' THEN IF(s.sort_order = 2, 'slot', 'table,live') ELSE t.value END,
    t.sort_order
FROM page_sections s
JOIN pages p ON p.id = s.page_id AND p.slug = 'rtp'
JOIN pages region ON region.id = p.parent_id AND region.parent_id IS NULL AND region.slug IN ('th', 'my', 'sg')
JOIN (
    SELECT 'source' COLLATE utf8mb4_unicode_ci AS field_key, 'auto' COLLATE utf8mb4_unicode_ci AS value, 10 AS sort_order
    UNION ALL SELECT 'category', '', 11
    UNION ALL SELECT 'limit', '10', 12
) t
WHERE s.block_type = 'game_rtp_carousel'
  AND NOT EXISTS (SELECT 1 FROM page_section_fields f WHERE f.section_id = s.id AND f.item_index = 0 AND f.field_key = t.field_key);

DELETE f FROM page_section_fields f
JOIN page_sections s ON s.id = f.section_id AND s.block_type = 'comparison_table'
JOIN pages p ON p.id = s.page_id AND p.slug = 'payment-methods'
JOIN pages region ON region.id = p.parent_id AND region.parent_id IS NULL AND region.slug IN ('th', 'my', 'sg')
WHERE f.item_index > 0;

INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT s.id, 0, t.field_key, 'text', t.value, t.sort_order
FROM page_sections s
JOIN pages p ON p.id = s.page_id AND p.slug = 'payment-methods'
JOIN pages region ON region.id = p.parent_id AND region.parent_id IS NULL AND region.slug IN ('th', 'my', 'sg')
JOIN (
    SELECT 'source' COLLATE utf8mb4_unicode_ci AS field_key, 'casinos' COLLATE utf8mb4_unicode_ci AS value, 30 AS sort_order
    UNION ALL SELECT 'limit', '5', 31
) t
WHERE s.block_type = 'comparison_table'
  AND NOT EXISTS (SELECT 1 FROM page_section_fields f WHERE f.section_id = s.id AND f.item_index = 0 AND f.field_key = t.field_key);

INSERT INTO page_sections (page_id, block_type, custom_class, custom_id, sort_order)
SELECT p.id, 'introduction_section', '', '', 0
FROM pages p
JOIN pages region ON region.id = p.parent_id AND region.parent_id IS NULL AND region.slug IN ('th', 'my', 'sg')
WHERE p.slug IN ('payment-methods', 'rtp')
  AND NOT EXISTS (SELECT 1 FROM page_sections s WHERE s.page_id = p.id AND s.block_type = 'introduction_section');

INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT s.id, 0, t.field_key, t.field_type, REPLACE(t.template, '{region}', rg.name), t.sort_order
FROM page_sections s
JOIN pages p ON p.id = s.page_id
JOIN pages region ON region.id = p.parent_id AND region.parent_id IS NULL AND region.slug IN ('th', 'my', 'sg')
JOIN regions rg ON rg.code = region.slug
JOIN (
    SELECT 'payment-methods' COLLATE utf8mb4_unicode_ci AS page_slug, 'heading' COLLATE utf8mb4_unicode_ci AS field_key,
        'text' COLLATE utf8mb4_unicode_ci AS field_type, 'Online Casino Payment Methods in {region}' COLLATE utf8mb4_unicode_ci AS template, 1 AS sort_order
    UNION ALL SELECT 'payment-methods', 'highlightText', 'text', '{region}', 2
    UNION ALL SELECT 'payment-methods', 'subheading', 'text', 'Secure Deposit & Withdrawal', 3
    UNION ALL SELECT 'payment-methods', 'paragraph', 'richtext', '<p>When it comes to online gambling, having secure, fast, and convenient payment options is just as important as choosing the right casino. This guide breaks down the top payment methods available to players in {region}, helping you deposit and withdraw with confidence.</p>', 4
    UNION ALL SELECT 'rtp', 'heading', 'text', '{region} Real-Time RTP & Live Casino Bonus Trackers', 1
    UNION ALL SELECT 'rtp', 'highlightText', 'text', 'Real-Time RTP', 2
    UNION ALL SELECT 'rtp', 'subheading', 'text', 'Top Casino Updated', 3
    UNION ALL SELECT 'rtp', 'paragraph', 'richtext', '<p>Want to play smarter and win more? We give you access to real-time RTP stats and live casino bonus updates tailored just for players in {region}. Whether you''re chasing high-payout slots or exclusive limited-time offers, this is your go-to hub.</p>', 4
) t ON t.page_slug = p.slug
WHERE s.block_type = 'introduction_section'
  AND NOT EXISTS (SELECT 1 FROM page_section_fields f WHERE f.section_id = s.id);

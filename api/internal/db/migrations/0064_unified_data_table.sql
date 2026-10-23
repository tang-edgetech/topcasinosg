-- One data_table block replaces the four table blocks (bonus_listing_table,
-- casino_list_table, casino_comparison_table, comparison_table). Each
-- section keeps its id, heading, intro, region, limit and background; this
-- adds "source" plus the column items that reproduce what it showed before.
-- Live tables leave regionCode blank so they follow the page's region.
-- The unused cta and image_gallery block types are retired (0 sections).

UPDATE page_sections SET block_type = 'data_table' WHERE block_type = 'bonus_listing_table';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT s.id, 0, 'source', 'text', 'bonuses', 3 FROM page_sections s
WHERE s.block_type = 'data_table' AND NOT EXISTS (SELECT 1 FROM page_section_fields f WHERE f.section_id = s.id AND f.item_index = 0 AND f.field_key = 'source');

-- casino_list_table: Cashback, Payment Method, Rating, Safe Index + review arrow.
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT s.id, c.item_index, c.field_key, 'text', c.text_value, c.sort_order FROM page_sections s
JOIN (
    SELECT 0 AS item_index, 'source' COLLATE utf8mb4_unicode_ci AS field_key, 'casinos' COLLATE utf8mb4_unicode_ci AS text_value, 3 AS sort_order
    UNION ALL SELECT 0, 'columnsMode', 'custom', 10
    UNION ALL SELECT 0, 'moreInfo', 'yes', 13
    UNION ALL SELECT 1, 'column', 'cashback', 1
    UNION ALL SELECT 2, 'column', 'payments', 1
    UNION ALL SELECT 3, 'column', 'rating', 1
    UNION ALL SELECT 4, 'column', 'safeIndex', 1
) c
WHERE s.block_type = 'casino_list_table';
UPDATE page_sections SET block_type = 'data_table' WHERE block_type = 'casino_list_table';

-- casino_comparison_table (region home): Bonuses, RTP, Crypto, Local Banking,
-- Payout Speed, Rating, no button.
DELETE f FROM page_section_fields f JOIN page_sections s ON s.id = f.section_id
WHERE s.block_type = 'casino_comparison_table' AND f.field_key = 'regionCode';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT s.id, c.item_index, c.field_key, 'text', c.text_value, c.sort_order FROM page_sections s
JOIN (
    SELECT 0 AS item_index, 'source' COLLATE utf8mb4_unicode_ci AS field_key, 'casinos' COLLATE utf8mb4_unicode_ci AS text_value, 3 AS sort_order
    UNION ALL SELECT 0, 'columnsMode', 'custom', 10
    UNION ALL SELECT 0, 'showCta', 'no', 11
    UNION ALL SELECT 1, 'column', 'topBonus', 1
    UNION ALL SELECT 2, 'column', 'rtp', 1
    UNION ALL SELECT 3, 'column', 'crypto', 1
    UNION ALL SELECT 4, 'column', 'localBanking', 1
    UNION ALL SELECT 5, 'column', 'payoutSpeed', 1
    UNION ALL SELECT 5, 'label', 'Payout Speed', 2
    UNION ALL SELECT 6, 'column', 'rating', 1
) c
WHERE s.block_type = 'casino_comparison_table';
UPDATE page_sections SET block_type = 'data_table' WHERE block_type = 'casino_comparison_table';

-- comparison_table (payment-methods "Fees, Processing Time & Limits"): every
-- section is in live "casinos" mode. Payment options + processing time, no
-- button; the tip / recommendation boxes keep their field keys.
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT s.id, c.item_index, c.field_key, 'text',
    CASE
        WHEN c.field_key = 'label' AND c.item_index = 1 THEN COALESCE((SELECT NULLIF(f.text_value, '') FROM page_section_fields f WHERE f.section_id = s.id AND f.item_index = 0 AND f.field_key = 'col2Label' LIMIT 1), 'Options')
        WHEN c.field_key = 'label' AND c.item_index = 2 THEN COALESCE((SELECT NULLIF(f.text_value, '') FROM page_section_fields f WHERE f.section_id = s.id AND f.item_index = 0 AND f.field_key = 'col3Label' LIMIT 1), 'Processing Time')
        ELSE c.text_value
    END,
    c.sort_order
FROM page_sections s
JOIN (
    SELECT 0 AS item_index, 'columnsMode' COLLATE utf8mb4_unicode_ci AS field_key, 'custom' COLLATE utf8mb4_unicode_ci AS text_value, 10 AS sort_order
    UNION ALL SELECT 0, 'showCta', 'no', 11
    UNION ALL SELECT 1, 'column', 'payments', 1
    UNION ALL SELECT 1, 'label', '', 2
    UNION ALL SELECT 2, 'column', 'payoutSpeed', 1
    UNION ALL SELECT 2, 'label', '', 2
) c
WHERE s.block_type = 'comparison_table';
DELETE f FROM page_section_fields f JOIN page_sections s ON s.id = f.section_id
WHERE s.block_type = 'comparison_table' AND f.item_index = 0 AND f.field_key IN ('col1Label', 'col2Label', 'col3Label', 'col4Label', 'col5Label', 'col6Label', 'col4Align', 'col5Align', 'col6Align');
UPDATE page_sections SET block_type = 'data_table' WHERE block_type = 'comparison_table';

DELETE FROM page_sections WHERE block_type IN ('cta', 'image_gallery');

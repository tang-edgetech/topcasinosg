-- Home "Blacklisted Casinos to Avoid" (Figma): a Container holds the main
-- title, intro and the navy-to-red background; inside it, the Blacklist
-- Preview shows the secondary heading "What Makes a Casino Get
-- Blacklisted?" with See All and arrows. Skipped when the home page already
-- has a container or no blacklist section.
SET @home := (SELECT id FROM pages WHERE slug = 'home' AND parent_id IS NULL LIMIT 1);
SET @blacklist := (
    SELECT s.id FROM page_sections s
    WHERE s.page_id = @home AND s.block_type = 'blacklist_preview' AND s.in_container = 0
      AND NOT EXISTS (SELECT 1 FROM page_sections c WHERE c.page_id = @home AND c.block_type = 'container')
    ORDER BY s.sort_order, s.id LIMIT 1
);
SET @position := (SELECT sort_order FROM page_sections WHERE id = @blacklist);

UPDATE page_sections SET sort_order = sort_order + 1
WHERE @blacklist IS NOT NULL AND page_id = @home AND sort_order >= @position;

INSERT INTO page_sections (page_id, block_type, custom_class, custom_id, in_container, sort_order)
SELECT @home, 'container', '', 'blacklisted-casinos', 0, @position FROM DUAL WHERE @blacklist IS NOT NULL;
SET @container := IF(@blacklist IS NULL, NULL, LAST_INSERT_ID());

INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, url_value, sort_order)
SELECT @container, 0, v.field_key, 'text', v.text_value, '', v.sort_order
FROM (
    SELECT 'heading' AS field_key, 'Blacklisted Casinos to Avoid' AS text_value, 1 AS sort_order
    UNION ALL SELECT 'highlightText', 'Avoid', 2
    UNION ALL SELECT 'intro', 'We expose rogue casinos that delay withdrawals or scam users. Check the blacklist before you deposit.', 3
    UNION ALL SELECT 'textTone', 'light', 4
    UNION ALL SELECT 'bgType', 'gradient', 5
    UNION ALL SELECT 'bgFrom', 'primary-900', 6
    UNION ALL SELECT 'bgTo', 'danger', 7
) v
WHERE @container IS NOT NULL;

UPDATE page_sections SET in_container = 1, custom_id = 'blacklist-preview' WHERE id = @blacklist AND @container IS NOT NULL;
DELETE FROM page_section_fields
WHERE section_id = @blacklist AND @container IS NOT NULL AND item_index = 0
  AND field_key IN ('heading', 'highlightText', 'subheading', 'secondaryHeading', 'bgType', 'bgFrom', 'bgTo');
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, url_value, sort_order)
SELECT @blacklist, 0, v.field_key, 'text', v.text_value, '', v.sort_order
FROM (
    SELECT 'secondaryHeading' AS field_key, 'What Makes a Casino Get Blacklisted?' AS text_value, 11 AS sort_order
    UNION ALL SELECT 'bgType', 'none', 6
) v
WHERE @container IS NOT NULL;

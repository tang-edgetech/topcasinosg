-- Home "Blacklisted Casinos to Avoid": the Container is only the shared
-- navy-to-red background; inside it, a Title & Text component (title with
-- "Avoid" in red, intro line) comes first, then the Blacklist Preview with
-- its own 26px heading "What Makes a Casino Get Blacklisted?". Replaces the
-- container title fields and the blacklist "secondary heading" from 0073.
-- Skipped when the home page already has a Title & Text component.
SET @home := (SELECT id FROM pages WHERE slug = 'home' AND parent_id IS NULL LIMIT 1);
SET @container := (
    SELECT c.id FROM page_sections c
    WHERE c.page_id = @home AND c.block_type = 'container'
      AND NOT EXISTS (SELECT 1 FROM page_sections t WHERE t.page_id = @home AND t.block_type = 'title_set')
    ORDER BY c.sort_order, c.id LIMIT 1
);
SET @position := (SELECT sort_order FROM page_sections WHERE id = @container);
SET @heading := (SELECT text_value FROM page_section_fields WHERE section_id = @container AND item_index = 0 AND field_key = 'heading' LIMIT 1);
SET @highlight := (SELECT text_value FROM page_section_fields WHERE section_id = @container AND item_index = 0 AND field_key = 'highlightText' LIMIT 1);
SET @intro := (SELECT text_value FROM page_section_fields WHERE section_id = @container AND item_index = 0 AND field_key = 'intro' LIMIT 1);
SET @blacklist := (
    SELECT s.id FROM page_sections s
    WHERE @container IS NOT NULL AND s.page_id = @home AND s.block_type = 'blacklist_preview' AND s.in_container = 1
      AND s.sort_order > @position
    ORDER BY s.sort_order, s.id LIMIT 1
);

UPDATE page_sections SET sort_order = sort_order + 1
WHERE @container IS NOT NULL AND page_id = @home AND sort_order > @position;

INSERT INTO page_sections (page_id, block_type, custom_class, custom_id, in_container, sort_order)
SELECT @home, 'title_set', '', '', 1, @position + 1 FROM DUAL WHERE @container IS NOT NULL;
SET @title := IF(@container IS NULL, NULL, LAST_INSERT_ID());

INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, url_value, sort_order)
SELECT @title, 0, v.field_key, 'text', v.text_value, '', v.sort_order
FROM (
    SELECT 'heading' AS field_key, COALESCE(NULLIF(@heading, ''), 'Blacklisted Casinos to Avoid') AS text_value, 1 AS sort_order
    UNION ALL SELECT 'highlightText', COALESCE(NULLIF(@highlight, ''), 'Avoid'), 2
    UNION ALL SELECT 'text', COALESCE(NULLIF(@intro, ''), 'We expose rogue casinos that delay withdrawals or scam users. Check the blacklist before you deposit.'), 3
    UNION ALL SELECT 'headingSize', 'large', 4
    UNION ALL SELECT 'align', 'left', 5
    UNION ALL SELECT 'textTone', 'light', 6
    UNION ALL SELECT 'bgType', 'none', 7
) v
WHERE @title IS NOT NULL;

DELETE FROM page_section_fields
WHERE section_id = @container AND item_index = 0 AND field_key IN ('heading', 'highlightText', 'intro', 'textTone');

SET @blacklistHeading := (
    SELECT text_value FROM page_section_fields
    WHERE section_id = @blacklist AND item_index = 0 AND field_key = 'secondaryHeading' LIMIT 1
);
DELETE FROM page_section_fields
WHERE section_id = @blacklist AND item_index = 0
  AND field_key IN ('heading', 'subheading', 'highlightText', 'headingSize', 'secondaryHeading', 'secondaryText');
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, url_value, sort_order)
SELECT @blacklist, 0, v.field_key, 'text', v.text_value, '', v.sort_order
FROM (
    SELECT 'heading' AS field_key, COALESCE(NULLIF(@blacklistHeading, ''), 'What Makes a Casino Get Blacklisted?') AS text_value, 1 AS sort_order
    UNION ALL SELECT 'headingSize', 'medium', 11
) v
WHERE @blacklist IS NOT NULL;

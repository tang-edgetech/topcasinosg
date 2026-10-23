-- Home's "Responsible Gaming" (rich_text) and "FAQs" (faq) sections use the
-- 960px content width from Figma. Uses the admin "Wider content (960px)"
-- layout toggle (custom_class section--content-960), so editors can turn it
-- off or apply it to other sections. Matched by block type and heading so it
-- only touches those two sections, and never adds the class twice.
UPDATE page_sections s
JOIN pages p ON p.id = s.page_id AND p.slug = 'home' AND p.parent_id IS NULL
JOIN page_section_fields f ON f.section_id = s.id AND f.item_index = 0 AND f.field_key = 'heading'
SET s.custom_class = TRIM(CONCAT(IFNULL(s.custom_class, ''), ' section--content-960'))
WHERE ((s.block_type = 'rich_text' AND f.text_value = 'Responsible Gaming')
    OR (s.block_type = 'faq' AND f.text_value = 'FAQs'))
  AND CONCAT(' ', IFNULL(s.custom_class, ''), ' ') NOT LIKE '% section--content-960 %';

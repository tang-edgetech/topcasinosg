-- Region home pages (th/my/sg) drop their hand-typed intro page menu so they
-- use the same fixed, automatic region menu as every region sub-page (same
-- order everywhere, current year in the region label, Blacklist included).

DELETE f FROM page_section_fields f
JOIN page_sections s ON s.id = f.section_id AND s.block_type = 'introduction_section'
JOIN pages p ON p.id = s.page_id AND p.parent_id IS NULL AND p.slug IN ('th', 'my', 'sg')
WHERE f.item_index > 0 AND f.field_key IN ('label', 'url');

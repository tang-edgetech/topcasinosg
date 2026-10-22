-- Spacing pass on the rebuilt region home pages after comparing against
-- Figma "D / Country / TH / Home": the Payment Methods / Game Strategy /
-- RTP Trackers card sections keep their full section padding (the design
-- gives each one the same breathing room as "Bonuses You Can Claim"), while
-- "Ready to Win?" sits tight under the FAQ like the design.
UPDATE page_sections s
JOIN pages p ON p.id = s.page_id AND p.parent_id IS NULL AND p.slug IN ('th', 'my', 'sg')
SET s.custom_class = ''
WHERE s.block_type = 'expandable_card_grid' AND s.sort_order IN (70, 80, 90) AND s.custom_class = 'section--tight-top';

UPDATE page_sections s
JOIN pages p ON p.id = s.page_id AND p.parent_id IS NULL AND p.slug IN ('th', 'my', 'sg')
SET s.custom_class = 'section--tight-top'
WHERE s.block_type = 'cta_link_list' AND s.sort_order = 120 AND s.custom_class = '';

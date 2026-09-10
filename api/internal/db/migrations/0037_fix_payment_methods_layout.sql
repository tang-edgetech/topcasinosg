-- Two layout fixes to the payment-methods content seeded in 0034/0036,
-- applied uniformly across th/my/sg since all three were seeded from the
-- same template:
--
-- 1. The "Most Trusted Payment Methods", "Security Standards", and "Real
--    Player Feedback" icon_box_group sections are left-aligned text blocks
--    in the reference design (icon slot empty, heading+text left-aligned) -
--    not centered vertical icon cards, which is what the "vertical"
--    layout (the seeded/default value) renders as. "horizontal" layout
--    left-aligns the text even with no icon set.
-- 2. The Trust Factors / Safety Tips / Your Role callout boxes were seeded
--    with a white background, which is invisible against the white page
--    background - switched to a visibly tinted background instead.

UPDATE page_section_fields psf
JOIN page_sections ps ON ps.id = psf.section_id
JOIN pages p ON p.id = ps.page_id
JOIN pages region ON region.id = p.parent_id
SET psf.text_value = 'horizontal'
WHERE region.slug IN ('th', 'my', 'sg') AND p.slug = 'payment-methods'
  AND ps.sort_order = 1 AND psf.item_index = 0 AND psf.field_key = 'layout';

INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT ps.id, 0, 'layout', 'text', 'horizontal', 3
FROM page_sections ps
JOIN pages p ON p.id = ps.page_id
JOIN pages region ON region.id = p.parent_id
WHERE region.slug IN ('th', 'my', 'sg') AND p.slug = 'payment-methods'
  AND ps.sort_order IN (7, 8)
  AND NOT EXISTS (
    SELECT 1 FROM page_section_fields x WHERE x.section_id = ps.id AND x.item_index = 0 AND x.field_key = 'layout'
  );

UPDATE page_section_fields psf
JOIN page_sections ps ON ps.id = psf.section_id
JOIN pages p ON p.id = ps.page_id
JOIN pages region ON region.id = p.parent_id
SET psf.text_value = 'surface-muted'
WHERE region.slug IN ('th', 'my', 'sg') AND p.slug = 'payment-methods'
  AND ps.sort_order IN (2, 6, 9)
  AND psf.item_index = 0 AND psf.field_key IN ('bgFrom', 'bgTo');

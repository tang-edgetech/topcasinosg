-- Turns on the full-bleed divider line (custom_class "section--divider-top",
-- see shared/theme/sections.css and the "Divider line above" toggle in the
-- admin section builder) on the sections where the Figma frames draw one
-- between two white sections, for th/my/sg:
--   region home : Most Popular (30), Payment Methods (70), Game Strategy (80), RTP Trackers (90)
--   payment-methods : Fees (3), FAQs (10)
--   rtp : watch-outs panel (6), FAQs (8)
--   bonuses hub : Top Bonus Picks (3)
-- Appends the class without touching any other class already set.

UPDATE page_sections s
JOIN pages p ON p.id = s.page_id AND p.parent_id IS NULL AND p.slug IN ('th', 'my', 'sg')
SET s.custom_class = TRIM(CONCAT(s.custom_class, ' section--divider-top'))
WHERE s.sort_order IN (30, 70, 80, 90)
  AND s.custom_class NOT LIKE '%section--divider-top%';

UPDATE page_sections s
JOIN pages p ON p.id = s.page_id
JOIN pages region ON region.id = p.parent_id AND region.parent_id IS NULL AND region.slug IN ('th', 'my', 'sg')
SET s.custom_class = TRIM(CONCAT(s.custom_class, ' section--divider-top'))
WHERE s.custom_class NOT LIKE '%section--divider-top%'
  AND (
    (p.slug = 'payment-methods' AND s.sort_order IN (3, 10))
    OR (p.slug = 'rtp' AND s.sort_order IN (6, 8))
    OR (p.slug = 'bonuses' AND s.sort_order = 3)
  );

-- Same fix as 0032 for bonus-type pages: /{region}/payment-methods was
-- looked up by a flat computed slug ("{region}-payment-methods"), which
-- never actually existed as a Page row and isn't nested under the region
-- page in the admin Pages tree. This creates a real "payment-methods" page
-- as a child of each region root page instead, matching how the URL and
-- the tree should agree. Safe to run more than once: guarded by NOT EXISTS.
INSERT INTO pages (parent_id, sort_order, slug, title, status)
SELECT region.id, 0, 'payment-methods', CONCAT(region.title, ' Payment Methods'), 'draft'
FROM pages region
WHERE region.parent_id IS NULL
  AND region.slug IN ('th', 'my', 'sg')
  AND NOT EXISTS (
    SELECT 1 FROM pages hub WHERE hub.parent_id = region.id AND hub.slug = 'payment-methods'
  );

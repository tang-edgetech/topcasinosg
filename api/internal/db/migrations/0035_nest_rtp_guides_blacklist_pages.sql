-- Same fix as 0033 (payment-methods) applied to the remaining region
-- subroutes that share the same PageGrid-less alignment bug: rtp, guides,
-- blacklist. Creates a real hub page as a child of each region root page so
-- these routes can resolve via getPage(`${region}/{slug}`) instead of never
-- having a Page at all. Safe to run more than once: guarded by NOT EXISTS.
INSERT INTO pages (parent_id, sort_order, slug, title, status)
SELECT region.id, 0, hub.slug, CONCAT(region.title, ' ', hub.title), 'draft'
FROM pages region
CROSS JOIN (
  SELECT 'rtp' AS slug, 'RTP' AS title
  UNION ALL SELECT 'guides', 'Guides'
  UNION ALL SELECT 'blacklist', 'Blacklist'
) AS hub
WHERE region.parent_id IS NULL
  AND region.slug IN ('th', 'my', 'sg')
  AND NOT EXISTS (
    SELECT 1 FROM pages existing WHERE existing.parent_id = region.id AND existing.slug = hub.slug
  );

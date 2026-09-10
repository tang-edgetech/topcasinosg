-- Existing per-region bonus-type pages (e.g. slug "th-bonuses-welcome") are
-- flat root pages addressed by a computed slug - they aren't actually nested
-- under their region page in the tree, even though their URL
-- (/{region}/bonuses/{type}) looks hierarchical. This creates a real
-- "bonuses" hub page as a child of each region root page, then re-parents
-- every matching flat page underneath it with its slug trimmed to just the
-- type segment (e.g. "welcome") - matching how any other nested Page works.
-- Matched by slug pattern rather than hardcoded ids so this applies
-- correctly regardless of a given environment's actual page ids. Safe to
-- run more than once: the hub-creation guard skips regions that already
-- have one, and the re-parent UPDATE naturally matches zero rows once no
-- "%-bonuses-%" slugs remain.

INSERT INTO pages (parent_id, sort_order, slug, title, status)
SELECT region.id, 0, 'bonuses', CONCAT(region.title, ' Bonuses'), 'draft'
FROM pages region
WHERE region.parent_id IS NULL
  AND region.slug IN ('th', 'my', 'sg')
  AND NOT EXISTS (
    SELECT 1 FROM pages hub WHERE hub.parent_id = region.id AND hub.slug = 'bonuses'
  );

UPDATE pages old
JOIN pages region ON region.slug = SUBSTRING_INDEX(old.slug, '-bonuses-', 1) AND region.parent_id IS NULL
JOIN pages hub ON hub.parent_id = region.id AND hub.slug = 'bonuses'
SET old.parent_id = hub.id,
    old.slug = REPLACE(SUBSTRING_INDEX(old.slug, '-bonuses-', -1), '-', '_')
WHERE old.slug LIKE '%-bonuses-%';

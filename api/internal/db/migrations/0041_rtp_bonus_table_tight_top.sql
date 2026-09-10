-- Removes the doubled vertical gap between "How Our RTP Tracker Works"
-- (rich_text, sort_order 4) and the Bonus Tracker table (bonus_listing_table,
-- sort_order 5) on the /{region}/rtp page - both sections use the standard
-- generic py-16 section padding, which stacks into a large empty band
-- between them. Scoped to just this section instance via the existing
-- admin-editable custom_class column (see 0016_pages.sql) rather than
-- changing bonus_listing_table's default padding everywhere it's reused.
UPDATE page_sections ps
JOIN pages p ON p.id = ps.page_id
JOIN pages region ON region.id = p.parent_id
SET ps.custom_class = 'section--tight-top'
WHERE p.slug = 'rtp'
  AND region.slug IN ('th', 'my', 'sg')
  AND ps.block_type = 'bonus_listing_table'
  AND ps.sort_order = 5
  AND ps.custom_class = '';

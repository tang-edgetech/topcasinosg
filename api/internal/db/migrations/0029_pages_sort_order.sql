-- Manual ordering for pages, scoped to siblings (same parent) - lets the
-- admin drag pages into a specific display order within a tree level rather
-- than always sorting alphabetically. Defaults to 0 for every existing row;
-- ties break on id, so today's list order is unaffected until an admin
-- actually reorders something.
ALTER TABLE pages ADD COLUMN sort_order INT NOT NULL DEFAULT 0 AFTER parent_id;
ALTER TABLE pages ADD KEY idx_pages_parent_sort (parent_key, sort_order);

-- NULL region_id = shows on the global /blacklist index; set = also shows
-- under /{region}/blacklist. Same nullable-region pattern as guides
-- (see 0010_guides.sql) — not a duplicated content type.
ALTER TABLE blacklist_entries
    ADD COLUMN region_id BIGINT UNSIGNED NULL AFTER id,
    ADD KEY idx_blacklist_entries_region (region_id),
    ADD CONSTRAINT fk_blacklist_entries_region FOREIGN KEY (region_id) REFERENCES regions (id) ON DELETE CASCADE;

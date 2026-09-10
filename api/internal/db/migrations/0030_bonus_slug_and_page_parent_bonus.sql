-- Bonuses get individual public detail pages (like Guides), identified by a
-- unique slug. Existing rows predate this column, so they're backfilled with
-- a placeholder slug before the unique constraint is added.
ALTER TABLE bonuses ADD COLUMN slug VARCHAR(200) NOT NULL DEFAULT '' AFTER title;
UPDATE bonuses SET slug = CONCAT('bonus-', id) WHERE slug = '';
ALTER TABLE bonuses ADD UNIQUE KEY uq_bonuses_slug (slug);

-- A Page can optionally pair itself under a Bonus (instead of another Page)
-- as its logical parent, for breadcrumbs/URL nesting - see PageService.Update
-- for the app-level rule that a page has at most one of parent_id/parent_bonus_id.
ALTER TABLE pages ADD COLUMN parent_bonus_id BIGINT UNSIGNED NULL AFTER parent_id;
ALTER TABLE pages ADD KEY idx_pages_parent_bonus (parent_bonus_id);
ALTER TABLE pages ADD CONSTRAINT fk_pages_parent_bonus FOREIGN KEY (parent_bonus_id) REFERENCES bonuses(id) ON DELETE SET NULL;

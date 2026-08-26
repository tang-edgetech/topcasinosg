-- Parent/child hierarchy for Pages: a page's slug is now just one segment of
-- its full URL path, built by walking its parent chain (e.g. parent "legal"
-- + child "privacy-policy" -> /legal/privacy-policy). Root pages (no parent)
-- keep being served at their own slug, same as today.
--
-- Slug uniqueness moves from "globally unique" to "unique among siblings"
-- (same parent, or same NULL parent for root pages) — different branches of
-- the tree can reuse a slug (e.g. two different sections could each have
-- their own "overview" child) without colliding.
--
-- MySQL's UNIQUE KEY treats every NULL as distinct from every other NULL, so
-- a plain UNIQUE KEY (parent_id, slug) would NOT catch two root pages (both
-- parent_id NULL) sharing a slug - exactly the "main pages" case that needs
-- catching. parent_key works around this: a STORED generated column that
-- substitutes 0 (never a real page id, since AUTO_INCREMENT starts at 1) for
-- NULL, so the unique index below enforces sibling-uniqueness uniformly at
-- every level, root included.
ALTER TABLE pages
    ADD COLUMN parent_id BIGINT UNSIGNED NULL AFTER id,
    ADD COLUMN parent_key BIGINT UNSIGNED GENERATED ALWAYS AS (COALESCE(parent_id, 0)) STORED;

-- RESTRICT (not CASCADE): deleting a page that still has children must fail
-- loudly rather than silently wiping a whole subtree - the admin has to
-- reparent or delete the children first, same "no silent destructive
-- cascades" spirit as everywhere else in this codebase.
ALTER TABLE pages
    ADD CONSTRAINT fk_pages_parent FOREIGN KEY (parent_id) REFERENCES pages (id) ON DELETE RESTRICT;

ALTER TABLE pages DROP INDEX uq_pages_slug;
ALTER TABLE pages ADD UNIQUE KEY uq_pages_parent_slug (parent_key, slug);
ALTER TABLE pages ADD KEY idx_pages_parent (parent_id);

-- Per-page robots index/follow (0017_snippets_and_page_seo.sql) were always
-- an explicit boolean, defaulting to true/true. There was no way to tell
-- "the admin deliberately wants this page indexed" apart from "nobody ever
-- touched this field" — so the site-wide Settings > SEO toggle had nothing
-- to fall back to, and could never actually take effect on any page.
--
-- Making these columns nullable gives them a real default state: NULL means
-- "inherit the site-wide setting", a 0/1 means "this page overrides it".
-- Every existing page was saved under the old always-explicit-boolean model,
-- where nothing had ever been deliberately customized (the admin UI had no
-- such concept yet) — so all existing rows are reset to NULL, i.e. they
-- start inheriting the site-wide setting rather than being pinned to
-- whatever they happened to already contain.
ALTER TABLE pages
    MODIFY COLUMN meta_robots_index TINYINT(1) NULL DEFAULT NULL,
    MODIFY COLUMN meta_robots_follow TINYINT(1) NULL DEFAULT NULL;

UPDATE pages SET meta_robots_index = NULL, meta_robots_follow = NULL;

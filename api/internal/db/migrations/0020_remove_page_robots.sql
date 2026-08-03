-- Per-page robots index/follow override (0017_snippets_and_page_seo.sql,
-- made nullable-inherit in 0019_page_seo_robots_inherit.sql) is removed —
-- product decision to keep a single site-wide Settings > SEO toggle as the
-- only control, rather than per-page overrides.
ALTER TABLE pages
    DROP COLUMN meta_robots_index,
    DROP COLUMN meta_robots_follow;

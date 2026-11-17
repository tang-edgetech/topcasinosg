-- Settings > General:
-- page_transition_min_ms: how long the page transition's loading bar shows
--   at least (0-1000). Fast (prefetched) page changes otherwise finish
--   before the bar can be seen.
-- preloader: a full-screen loader with the site logo on a visitor's first
--   page in a browser tab (web/src/components/Preloader.tsx).
ALTER TABLE site_settings
    ADD COLUMN IF NOT EXISTS page_transition_min_ms INT NOT NULL DEFAULT 300 AFTER page_transition,
    ADD COLUMN IF NOT EXISTS preloader TINYINT(1) NOT NULL DEFAULT 0 AFTER page_transition_min_ms;

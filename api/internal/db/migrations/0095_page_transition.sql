-- Page transition on the public site (Settings > General): "off" (pages
-- swap instantly, as before), "bar" (an orange loading bar at the top while
-- the next page loads) or "bar_fade" (the bar, and the page fades between).
ALTER TABLE site_settings
    ADD COLUMN IF NOT EXISTS page_transition VARCHAR(20) NOT NULL DEFAULT 'off' AFTER theme_config;

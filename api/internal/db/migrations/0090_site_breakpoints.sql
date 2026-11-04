-- Screen sizes for the page builder's Mobile / Tablet / Desktop settings
-- (Site Settings > General): tablet starts at breakpoint_tablet px and
-- desktop at breakpoint_desktop px; anything narrower than the tablet size
-- is mobile. web/ builds its per-device CSS from these (lib/deviceCss.ts).
ALTER TABLE site_settings
    ADD COLUMN IF NOT EXISTS breakpoint_tablet SMALLINT UNSIGNED NOT NULL DEFAULT 768 AFTER footer_config,
    ADD COLUMN IF NOT EXISTS breakpoint_desktop SMALLINT UNSIGNED NOT NULL DEFAULT 1200 AFTER breakpoint_tablet;

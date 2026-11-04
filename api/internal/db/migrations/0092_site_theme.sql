-- Site-wide colour theme (Settings > Theme): the design-token colours the
-- public site uses instead of shared/theme/tokens.css's defaults, as JSON
-- ({"colors": {"primary-500": "#3e4ba8", ...}}). NULL: every default.
ALTER TABLE site_settings
    ADD COLUMN IF NOT EXISTS theme_config TEXT NULL AFTER breakpoint_desktop;

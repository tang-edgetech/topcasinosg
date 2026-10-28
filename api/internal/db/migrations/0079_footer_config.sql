-- Footer page (admin /dashboard/footer): the public footer's layout, its
-- bottom bar text and certification badges, stored as one JSON document
-- (domain.FooterConfig). NULL means "not edited yet" and reads as the
-- defaults, which match the footer that was hardcoded in web/ before. The
-- link columns stay in menu_items (location 'footer') and the brand/contact
-- block in the existing site_settings columns.
ALTER TABLE site_settings
    ADD COLUMN IF NOT EXISTS footer_config TEXT NULL AFTER skype_url;

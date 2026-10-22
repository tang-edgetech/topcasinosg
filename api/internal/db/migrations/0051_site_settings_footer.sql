-- Footer & Contact block for the public site footer, editable from Site
-- Settings instead of hardcoded in web/. Existing installs are seeded with
-- the values the footer previously hardcoded; the social URLs had no source
-- value and start empty.
ALTER TABLE site_settings
    ADD COLUMN IF NOT EXISTS footer_description VARCHAR(1000) NOT NULL DEFAULT '' AFTER two_factor_enabled,
    ADD COLUMN IF NOT EXISTS contact_address VARCHAR(500) NOT NULL DEFAULT '' AFTER footer_description,
    ADD COLUMN IF NOT EXISTS contact_email VARCHAR(500) NOT NULL DEFAULT '' AFTER contact_address,
    ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(500) NOT NULL DEFAULT '' AFTER contact_email,
    ADD COLUMN IF NOT EXISTS skype_url VARCHAR(500) NOT NULL DEFAULT '' AFTER facebook_url;

UPDATE site_settings
SET footer_description = 'Your Review Website for Top 10 Online Casinos, gathering best Singapore Casino, award-winning games, attractive casino bonuses with top security. Play today!'
WHERE id = 1 AND footer_description = '';

UPDATE site_settings
SET contact_address = 'Blk 520 Serangoon North Ave 4, 02-180 550520'
WHERE id = 1 AND contact_address = '';

UPDATE site_settings
SET contact_email = 'topcasinosingapore@gmail.com'
WHERE id = 1 AND contact_email = '';

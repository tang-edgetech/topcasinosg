-- The preloader's own image (Settings > General > Preloader): a jpg, png,
-- webp or gif from the media library, shown instead of the site logo.
-- NULL: the site logo.
ALTER TABLE site_settings
    ADD COLUMN IF NOT EXISTS preloader_image_url VARCHAR(500) NULL AFTER preloader;

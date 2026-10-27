-- SEO & social sharing.
--
-- Site-wide: the default share image (used by any page without its own) and
-- the site's X/Twitter handle, both edited under Settings > General.
--
-- seo_meta: optional per-item overrides for pages, casinos, guides, news
-- articles and bonuses - meta title/description/keywords, the Open Graph /
-- X card title, description and image, a canonical URL, per-item noindex/
-- nofollow and an article author. One row per item, created on first save;
-- an item without a row uses the defaults built from its own content. The
-- item reference is (entity_type, entity_id) across several tables, so it
-- can't be a foreign key: each content type's delete removes its row.
ALTER TABLE site_settings
    ADD COLUMN og_image_url VARCHAR(500) NULL AFTER favicon_url,
    ADD COLUMN twitter_handle VARCHAR(50) NOT NULL DEFAULT '' AFTER og_image_url;

CREATE TABLE IF NOT EXISTS seo_meta (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    entity_type ENUM('page', 'casino', 'guide', 'news', 'bonus') NOT NULL,
    entity_id BIGINT UNSIGNED NOT NULL,
    meta_title VARCHAR(255) NOT NULL DEFAULT '',
    meta_description VARCHAR(500) NOT NULL DEFAULT '',
    keywords VARCHAR(500) NOT NULL DEFAULT '',
    og_title VARCHAR(255) NOT NULL DEFAULT '',
    og_description VARCHAR(500) NOT NULL DEFAULT '',
    og_image_media_id BIGINT UNSIGNED NULL,
    canonical_url VARCHAR(500) NOT NULL DEFAULT '',
    robots_noindex TINYINT(1) NOT NULL DEFAULT 0,
    robots_nofollow TINYINT(1) NOT NULL DEFAULT 0,
    article_author VARCHAR(150) NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_seo_meta_entity (entity_type, entity_id),
    KEY idx_seo_meta_og_image (og_image_media_id),
    CONSTRAINT fk_seo_meta_og_image FOREIGN KEY (og_image_media_id) REFERENCES media (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

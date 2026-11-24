-- Sitemap (Settings > Sitemap, and the Sitemap box in each item's SEO tab):
-- the website builds /sitemap.xml from published content (GET /api/sitemap).
-- sitemap_settings is one row: the whole sitemap on or off, which content
-- types are listed by default, and extra addresses (one per line).
CREATE TABLE IF NOT EXISTS sitemap_settings (
    id         TINYINT UNSIGNED NOT NULL PRIMARY KEY,
    enabled    TINYINT(1) NOT NULL DEFAULT 1,
    types      VARCHAR(255) NOT NULL DEFAULT 'page,casino,guide,news,bonus,listing',
    extra_urls TEXT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT IGNORE INTO sitemap_settings (id) VALUES (1);

-- An item's own choice, overriding its content type's default: 'include'
-- or 'exclude'. No row: follow the default. entity_type is a page, casino,
-- guide, news, bonus, or a fixed list page ('listing', ids 1-4).
CREATE TABLE IF NOT EXISTS sitemap_entries (
    entity_type VARCHAR(20) NOT NULL,
    entity_id   BIGINT UNSIGNED NOT NULL,
    mode        ENUM('include', 'exclude') NOT NULL,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (entity_type, entity_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

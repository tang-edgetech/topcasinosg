CREATE TABLE guides (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    -- NULL region_id = shows on the global /guides index; set = also shows
    -- under /{region}/guides. Same table, not a duplicated content type.
    region_id BIGINT UNSIGNED NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    cover_media_id BIGINT UNSIGNED NULL,
    excerpt VARCHAR(500) NOT NULL DEFAULT '',
    content MEDIUMTEXT NOT NULL,
    status ENUM('draft', 'scheduled', 'published') NOT NULL DEFAULT 'draft',
    publish_at DATETIME NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_guides_slug (slug),
    KEY idx_guides_region (region_id),
    KEY idx_guides_status (status),
    CONSTRAINT fk_guides_region FOREIGN KEY (region_id) REFERENCES regions (id) ON DELETE CASCADE,
    CONSTRAINT fk_guides_cover_media FOREIGN KEY (cover_media_id) REFERENCES media (id) ON DELETE SET NULL,
    CONSTRAINT fk_guides_created_by FOREIGN KEY (created_by) REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

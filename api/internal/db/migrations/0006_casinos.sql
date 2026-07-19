CREATE TABLE casinos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(150) NOT NULL,
    name VARCHAR(150) NOT NULL,
    logo_media_id BIGINT UNSIGNED NULL,
    rating DECIMAL(2, 1) NOT NULL DEFAULT 0.0,
    summary VARCHAR(500) NOT NULL DEFAULT '',
    content MEDIUMTEXT NOT NULL,
    -- Quick-facts sidebar (Figma "Floater" panel): languages/payment methods
    -- are lightweight lists, not worth a normalized join table yet.
    languages JSON NULL,
    payment_methods JSON NULL,
    payout_speed VARCHAR(100) NOT NULL DEFAULT '',
    cta_url VARCHAR(500) NOT NULL DEFAULT '',
    status ENUM('draft', 'scheduled', 'published') NOT NULL DEFAULT 'draft',
    publish_at DATETIME NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_casinos_slug (slug),
    KEY idx_casinos_status (status),
    CONSTRAINT fk_casinos_logo_media FOREIGN KEY (logo_media_id) REFERENCES media (id) ON DELETE SET NULL,
    CONSTRAINT fk_casinos_created_by FOREIGN KEY (created_by) REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- A casino can operate in several regions; a region lists several casinos.
CREATE TABLE casino_regions (
    casino_id BIGINT UNSIGNED NOT NULL,
    region_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (casino_id, region_id),
    CONSTRAINT fk_casino_regions_casino FOREIGN KEY (casino_id) REFERENCES casinos (id) ON DELETE CASCADE,
    CONSTRAINT fk_casino_regions_region FOREIGN KEY (region_id) REFERENCES regions (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

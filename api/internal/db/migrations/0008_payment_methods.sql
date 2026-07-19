CREATE TABLE payment_methods (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    region_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    description MEDIUMTEXT NOT NULL,
    icon_media_id BIGINT UNSIGNED NULL,
    status ENUM('draft', 'scheduled', 'published') NOT NULL DEFAULT 'draft',
    publish_at DATETIME NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_payment_methods_region (region_id),
    KEY idx_payment_methods_status (status),
    CONSTRAINT fk_payment_methods_region FOREIGN KEY (region_id) REFERENCES regions (id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_methods_icon_media FOREIGN KEY (icon_media_id) REFERENCES media (id) ON DELETE SET NULL,
    CONSTRAINT fk_payment_methods_created_by FOREIGN KEY (created_by) REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

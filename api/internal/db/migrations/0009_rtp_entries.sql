CREATE TABLE rtp_entries (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    region_id BIGINT UNSIGNED NOT NULL,
    casino_id BIGINT UNSIGNED NULL,
    game_name VARCHAR(150) NOT NULL,
    category ENUM('slot', 'table', 'live', 'other') NOT NULL DEFAULT 'slot',
    rtp_percentage DECIMAL(5, 2) NOT NULL,
    status ENUM('draft', 'scheduled', 'published') NOT NULL DEFAULT 'draft',
    publish_at DATETIME NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_rtp_entries_region (region_id),
    KEY idx_rtp_entries_status (status),
    CONSTRAINT fk_rtp_entries_region FOREIGN KEY (region_id) REFERENCES regions (id) ON DELETE CASCADE,
    CONSTRAINT fk_rtp_entries_casino FOREIGN KEY (casino_id) REFERENCES casinos (id) ON DELETE SET NULL,
    CONSTRAINT fk_rtp_entries_created_by FOREIGN KEY (created_by) REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

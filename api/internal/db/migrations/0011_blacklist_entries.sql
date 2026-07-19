CREATE TABLE blacklist_entries (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    reason VARCHAR(500) NOT NULL,
    details MEDIUMTEXT NOT NULL,
    status ENUM('draft', 'scheduled', 'published') NOT NULL DEFAULT 'draft',
    publish_at DATETIME NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_blacklist_entries_status (status),
    CONSTRAINT fk_blacklist_entries_created_by FOREIGN KEY (created_by) REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

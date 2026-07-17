DROP TABLE IF EXISTS system_settings;

CREATE TABLE site_settings (
    id TINYINT UNSIGNED NOT NULL DEFAULT 1,
    site_url VARCHAR(255) NOT NULL DEFAULT '',
    site_title VARCHAR(255) NOT NULL DEFAULT '',
    seo_index BOOLEAN NOT NULL DEFAULT FALSE,
    seo_follow BOOLEAN NOT NULL DEFAULT FALSE,
    -- Simple UTC offset string (e.g. "+08:00"), not an IANA name — matches
    -- the "Timezone (default +8)" product requirement.
    timezone VARCHAR(10) NOT NULL DEFAULT '+08:00',
    language ENUM('en', 'cn') NOT NULL DEFAULT 'en',
    logo_url VARCHAR(500) NULL,
    favicon_url VARCHAR(500) NULL,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT chk_site_settings_singleton CHECK (id = 1)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

INSERT INTO site_settings (id) VALUES (1);

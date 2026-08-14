-- Licences (Figma Brand Page): a managed logo list (e.g. PAGCOR, MGA,
-- Curacao eGaming), same shape as GameProvider (see 0025_game_providers.sql).
CREATE TABLE licenses (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    logo_media_id BIGINT UNSIGNED NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_licenses_logo_media FOREIGN KEY (logo_media_id) REFERENCES media (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- A casino can hold several licenses; a license is held by several casinos.
-- Mirrors casino_game_providers (see 0025_game_providers.sql).
CREATE TABLE casino_licenses (
    casino_id BIGINT UNSIGNED NOT NULL,
    license_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (casino_id, license_id),
    CONSTRAINT fk_casino_licenses_casino FOREIGN KEY (casino_id) REFERENCES casinos (id) ON DELETE CASCADE,
    CONSTRAINT fk_casino_licenses_license FOREIGN KEY (license_id) REFERENCES licenses (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

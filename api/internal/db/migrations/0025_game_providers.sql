-- Game Providers (Figma Brand Page): a managed logo list (e.g. Pragmatic
-- Play, Evolution Gaming), same shape as Region minus code/is_active — no
-- URL slug or activation lifecycle needed for a logo entry.
CREATE TABLE game_providers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    logo_media_id BIGINT UNSIGNED NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_game_providers_logo_media FOREIGN KEY (logo_media_id) REFERENCES media (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- A casino can use several providers; a provider is used by several casinos.
-- Mirrors casino_regions (see 0006_casinos.sql).
CREATE TABLE casino_game_providers (
    casino_id BIGINT UNSIGNED NOT NULL,
    game_provider_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (casino_id, game_provider_id),
    CONSTRAINT fk_casino_game_providers_casino FOREIGN KEY (casino_id) REFERENCES casinos (id) ON DELETE CASCADE,
    CONSTRAINT fk_casino_game_providers_provider FOREIGN KEY (game_provider_id) REFERENCES game_providers (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

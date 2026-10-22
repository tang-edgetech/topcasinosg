-- RTP entries become the single source for the /{region}/rtp game sliders
-- (game_rtp_carousel "auto" mode): each game can now carry its provider
-- (picked from Game Providers, not free text) and a card image. The visit
-- link comes from the entry's casino, so no URL column is needed here.
ALTER TABLE rtp_entries
    ADD COLUMN game_provider_id BIGINT UNSIGNED NULL AFTER casino_id,
    ADD COLUMN image_media_id BIGINT UNSIGNED NULL AFTER game_provider_id,
    ADD KEY idx_rtp_entries_category_rtp (category, rtp_percentage),
    ADD CONSTRAINT fk_rtp_entries_game_provider FOREIGN KEY (game_provider_id) REFERENCES game_providers (id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_rtp_entries_image FOREIGN KEY (image_media_id) REFERENCES media (id) ON DELETE SET NULL;

-- Backfill the provider on the seeded games so the sliders show "by ..."
-- straight away. Only fills blanks; unknown game names are left alone.
UPDATE rtp_entries e
JOIN game_providers gp ON gp.name = (CASE e.game_name
        WHEN 'Gates of Olympus' THEN 'Pragmatic Play'
        WHEN 'Sugar Rush' THEN 'Pragmatic Play'
        WHEN 'Starlight Princess' THEN 'Pragmatic Play'
        WHEN 'Sweet Bonanza' THEN 'Pragmatic Play'
        WHEN 'Book of Dead' THEN 'Play''n GO'
        WHEN 'Wild Bandito' THEN 'PG Soft'
        WHEN 'Crazy Time' THEN 'Evolution Gaming'
        WHEN 'Lightning Roulette' THEN 'Evolution Gaming'
        WHEN 'Baccarat Squeeze' THEN 'Evolution Gaming'
        WHEN 'Speed Baccarat' THEN 'Evolution Gaming'
        WHEN 'Sic Bo Deluxe' THEN 'Evolution Gaming'
        WHEN 'Blackjack Classic' THEN 'NetEnt'
    END) COLLATE utf8mb4_unicode_ci
SET e.game_provider_id = gp.id
WHERE e.game_provider_id IS NULL;

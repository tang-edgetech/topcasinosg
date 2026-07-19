ALTER TABLE regions
    ADD COLUMN flag_media_id BIGINT UNSIGNED NULL AFTER name,
    ADD CONSTRAINT fk_regions_flag_media FOREIGN KEY (flag_media_id) REFERENCES media(id) ON DELETE SET NULL;

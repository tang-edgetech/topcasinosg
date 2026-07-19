ALTER TABLE media
    ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT '' AFTER original_filename,
    ADD COLUMN alt_text VARCHAR(255) NOT NULL DEFAULT '' AFTER title,
    ADD COLUMN description TEXT NULL AFTER alt_text;

-- Card fields for the "Avoid These Online Casinos" slider on the /{region}
-- page (Figma "D / Country / TH"): a logo, a score out of 10, and a list of
-- short reasons ("Payment Issues", "No Licensing", ...). The single `reason`
-- column stays for the existing blacklist pages; existing rows get it copied
-- in as their one-element reasons list.
ALTER TABLE blacklist_entries
    ADD COLUMN logo_media_id BIGINT UNSIGNED NULL AFTER name,
    ADD COLUMN rating DECIMAL(3,1) NULL AFTER logo_media_id,
    ADD COLUMN reasons JSON NULL AFTER reason,
    ADD KEY idx_blacklist_entries_logo_media (logo_media_id),
    ADD CONSTRAINT fk_blacklist_entries_logo_media FOREIGN KEY (logo_media_id) REFERENCES media (id) ON DELETE SET NULL;

UPDATE blacklist_entries
SET reasons = JSON_ARRAY(reason)
WHERE reasons IS NULL;

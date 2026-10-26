-- Container block: a section with in_container = 1 belongs to the nearest
-- container section before it (by sort_order), so a page stays one flat,
-- ordered list and saves/export/import keep working unchanged.
ALTER TABLE page_sections
    ADD COLUMN in_container TINYINT(1) NOT NULL DEFAULT 0 AFTER custom_id;

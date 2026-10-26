-- Global sections: reusable groups of sections placed on many pages through
-- a "global_section" block and edited once. Each is stored as a page of kind
-- 'global' (hidden from the Pages list, URLs and the sitemap), so its
-- sections use the normal page_sections tables, editor and export/import.
ALTER TABLE pages
    ADD COLUMN kind ENUM('page', 'global') NOT NULL DEFAULT 'page' AFTER parent_id,
    ADD KEY idx_pages_kind (kind);

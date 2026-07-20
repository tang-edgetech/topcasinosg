-- Flexible page builder: a "page" (e.g. Home, About) is an ordered list of
-- "sections" (blocks), and each section holds an ordered list of loosely
-- typed "fields". block_type and field_type are deliberately VARCHAR, not
-- ENUM — adding a new block or field kind is a pure application-code change,
-- never a migration. See api/internal/domain/page.go for the current set.

CREATE TABLE pages (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    meta_title VARCHAR(255) NOT NULL DEFAULT '',
    meta_description VARCHAR(500) NOT NULL DEFAULT '',
    status ENUM('draft', 'scheduled', 'published') NOT NULL DEFAULT 'draft',
    publish_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_pages_slug (slug),
    KEY idx_pages_status (status)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- One row per visual block on a page (hero banner, icon-box row, rich text,
-- image gallery, CTA, ...). custom_class/custom_id are the admin-editable
-- extras layered on top of the canonical per-block-type class the frontend
-- always applies (e.g. every icon_box_group section gets `.section--icon-box`
-- regardless of custom_class, so reused block types stay visually
-- consistent unless deliberately overridden).
CREATE TABLE page_sections (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    page_id BIGINT UNSIGNED NOT NULL,
    block_type VARCHAR(100) NOT NULL,
    custom_class VARCHAR(255) NOT NULL DEFAULT '',
    custom_id VARCHAR(255) NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_page_sections_page (page_id, sort_order),
    CONSTRAINT fk_page_sections_page FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- EAV-style field storage so any block type can define whatever fields it
-- needs without a schema change. `item_index` groups fields into repeatable
-- items within one section — e.g. an icon_box_group section has N items,
-- each item_index holding its own {image, heading, text} field rows; a
-- singular field (a section's own heading) always uses item_index = 0.
CREATE TABLE page_section_fields (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    section_id BIGINT UNSIGNED NOT NULL,
    item_index INT NOT NULL DEFAULT 0,
    field_key VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    text_value MEDIUMTEXT NOT NULL,
    media_id BIGINT UNSIGNED NULL,
    url_value VARCHAR(500) NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_page_section_fields_section (section_id, item_index, sort_order),
    CONSTRAINT fk_page_section_fields_section FOREIGN KEY (section_id) REFERENCES page_sections (id) ON DELETE CASCADE,
    CONSTRAINT fk_page_section_fields_media FOREIGN KEY (media_id) REFERENCES media (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Seed the Homepage row itself (published immediately — content is added via
-- the admin page builder afterward, an empty page is a valid, harmless state).
INSERT INTO pages (slug, title, status) VALUES ('home', 'Homepage', 'published');

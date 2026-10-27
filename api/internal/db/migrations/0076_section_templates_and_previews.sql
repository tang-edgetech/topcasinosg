-- Section templates: saved copies of a section (or a container with its
-- components) that editors insert into any page as an independent copy.
-- Stored like global sections, as hidden pages of kind 'template'.
--
-- Page previews: the page editor's unsaved sections, kept for an hour under
-- a random token so the public site can render them at /preview/{token}.
-- Only the token's SHA-256 is stored.
ALTER TABLE pages
    MODIFY COLUMN kind ENUM('page', 'global', 'template') NOT NULL DEFAULT 'page';

CREATE TABLE IF NOT EXISTS page_previews (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    token_hash CHAR(64) NOT NULL,
    page_id BIGINT UNSIGNED NOT NULL,
    sections LONGTEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_page_previews_token (token_hash),
    KEY idx_page_previews_expires (expires_at),
    CONSTRAINT fk_page_previews_page FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

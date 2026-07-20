-- Global code-injection snippets (Settings > Snippets), and per-page SEO
-- (robots index/follow + the same head/body/footer code injection scoped to
-- one page). Both are additive: a new table, plus new columns on `pages`
-- with safe defaults so every existing page keeps working unchanged.

CREATE TABLE site_snippets (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    location ENUM('head', 'body', 'footer') NOT NULL,
    content MEDIUMTEXT NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_site_snippets_location (location, is_active, sort_order)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- meta_robots_index/follow default to 1 (index, follow) so existing pages
-- keep being crawlable exactly as before this migration. The 3 snippet
-- columns default to '' (no-op) for the same reason.
ALTER TABLE pages
    ADD COLUMN meta_robots_index TINYINT(1) NOT NULL DEFAULT 1 AFTER meta_description,
    ADD COLUMN meta_robots_follow TINYINT(1) NOT NULL DEFAULT 1 AFTER meta_robots_index,
    ADD COLUMN head_snippet MEDIUMTEXT NOT NULL DEFAULT '' AFTER meta_robots_follow,
    ADD COLUMN body_snippet MEDIUMTEXT NOT NULL DEFAULT '' AFTER head_snippet,
    ADD COLUMN footer_snippet MEDIUMTEXT NOT NULL DEFAULT '' AFTER body_snippet;

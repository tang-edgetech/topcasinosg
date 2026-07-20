-- Splits Snippets into "global" (today's unconditional head/body/footer
-- injection, unchanged) and "code" (typed, prioritized, conditionally
-- targeted). Existing rows all default to kind='global' so nothing already
-- saved changes behavior.

ALTER TABLE site_snippets
    ADD COLUMN kind ENUM('global', 'code') NOT NULL DEFAULT 'global' AFTER name,
    ADD COLUMN code_type ENUM('html', 'css', 'js', 'universal') NULL AFTER kind,
    ADD COLUMN priority INT NOT NULL DEFAULT 10 AFTER sort_order;

-- One row per targeting rule on a 'code' snippet. Conditions on one snippet
-- combine with AND; a snippet with no condition rows applies everywhere
-- (same reach as a 'global' snippet, just via the Code tab instead).
CREATE TABLE snippet_conditions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    snippet_id BIGINT UNSIGNED NOT NULL,
    field ENUM('page', 'url') NOT NULL,
    operator ENUM('is', 'is_not', 'contains', 'not_contains') NOT NULL,
    page_id BIGINT UNSIGNED NULL,
    value VARCHAR(500) NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    KEY idx_snippet_conditions_snippet (snippet_id, sort_order),
    CONSTRAINT fk_snippet_conditions_snippet FOREIGN KEY (snippet_id) REFERENCES site_snippets (id) ON DELETE CASCADE,
    CONSTRAINT fk_snippet_conditions_page FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

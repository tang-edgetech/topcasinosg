-- Snippets keep their last few saved versions (admin Snippets > Edit >
-- Revisions), so a bad edit to live HTML/CSS/JS can be rolled back. Each row
-- is a full JSON snapshot of the snippet as saved - name, type, location,
-- content and targeting - and the API prunes all but the newest
-- domain.MaxSnippetRevisions per snippet on every save.
CREATE TABLE IF NOT EXISTS snippet_revisions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    snippet_id BIGINT UNSIGNED NOT NULL,
    snapshot LONGTEXT NOT NULL,
    saved_by BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_snippet_revisions_snippet (snippet_id, id),
    CONSTRAINT fk_snippet_revisions_snippet FOREIGN KEY (snippet_id) REFERENCES site_snippets (id) ON DELETE CASCADE,
    CONSTRAINT fk_snippet_revisions_user FOREIGN KEY (saved_by) REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- jQuery code type: auto-wrapped so it runs on DOM ready with $ bound, and
-- loads jQuery itself when the site doesn't already have it.
ALTER TABLE site_snippets
    MODIFY COLUMN code_type ENUM('html', 'css', 'js', 'jquery', 'universal') NULL;

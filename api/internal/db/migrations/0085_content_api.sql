-- Content API (/api/v1): lets outside tools, such as an AI assistant, read
-- content and propose changes with an API key instead of an admin sign-in.
--
-- api_keys: only a SHA-256 hash of each key is stored; the key itself is
-- shown once, when it is created. A key works only while the admin who
-- created it is active, and only for its scopes (comma-separated:
-- pages, news, media).
CREATE TABLE IF NOT EXISTS api_keys (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    key_prefix VARCHAR(16) NOT NULL,
    key_hash CHAR(64) NOT NULL,
    scopes VARCHAR(255) NOT NULL DEFAULT '',
    created_by BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME NULL,
    revoked_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_api_keys_hash (key_hash),
    CONSTRAINT fk_api_keys_user FOREIGN KEY (created_by) REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- content_changes: what an API key proposes. Nothing reaches the site until
-- an admin approves it in Dashboard > AI Changes; a new page or article is
-- then created as a draft. payload is the proposed content as JSON and
-- base_hash a fingerprint of the content the proposal was based on, so an
-- approval can warn when someone edited it in the meantime.
CREATE TABLE IF NOT EXISTS content_changes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    api_key_id BIGINT UNSIGNED NULL,
    api_key_name VARCHAR(100) NOT NULL DEFAULT '',
    content_type ENUM('page', 'news') NOT NULL,
    action ENUM('create', 'update') NOT NULL,
    target_id BIGINT UNSIGNED NULL,
    label VARCHAR(255) NOT NULL DEFAULT '',
    note TEXT NULL,
    payload LONGTEXT NOT NULL,
    base_hash CHAR(64) NOT NULL DEFAULT '',
    status ENUM('pending', 'approved', 'rejected', 'withdrawn') NOT NULL DEFAULT 'pending',
    review_note TEXT NULL,
    reviewed_by BIGINT UNSIGNED NULL,
    reviewed_at DATETIME NULL,
    result_id BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_content_changes_status (status, id),
    KEY idx_content_changes_key (api_key_id, id),
    CONSTRAINT fk_content_changes_key FOREIGN KEY (api_key_id) REFERENCES api_keys (id) ON DELETE SET NULL,
    CONSTRAINT fk_content_changes_reviewer FOREIGN KEY (reviewed_by) REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- page_revisions: the last few saved versions of each page's content (Pages
-- > Edit > Revisions), so any save - by an editor or an approved AI change -
-- can be rolled back. Each row is the page's full section list as JSON; the
-- API prunes all but the newest domain.MaxPageRevisions per page.
CREATE TABLE IF NOT EXISTS page_revisions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    page_id BIGINT UNSIGNED NOT NULL,
    sections LONGTEXT NOT NULL,
    saved_by BIGINT UNSIGNED NULL,
    source VARCHAR(40) NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_page_revisions_page (page_id, id),
    CONSTRAINT fk_page_revisions_page FOREIGN KEY (page_id) REFERENCES pages (id) ON DELETE CASCADE,
    CONSTRAINT fk_page_revisions_user FOREIGN KEY (saved_by) REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

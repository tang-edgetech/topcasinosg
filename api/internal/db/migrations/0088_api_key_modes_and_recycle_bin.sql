-- Content API, phase 2: each API key has a mode. "review" (every key until
-- now) sends page and news changes to AI Changes for approval; "direct"
-- makes changes live at once and may use any part of the site its scopes
-- allow, except users, API keys, security settings and deployments.
ALTER TABLE api_keys
    ADD COLUMN IF NOT EXISTS mode ENUM('review', 'direct') NOT NULL DEFAULT 'review' AFTER key_hash;

-- recycle_bin: what a Direct key deleted. The item itself stays in its own
-- table, taken off the site (draft, or an inactive snippet), until an admin
-- restores it or 30 days pass and the API deletes it for good. item_type is
-- the item's admin route (pages, news, casinos, ...); previous_status and
-- previous_publish_at are what a restore puts back.
CREATE TABLE IF NOT EXISTS recycle_bin (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    item_type VARCHAR(40) NOT NULL,
    item_id BIGINT UNSIGNED NOT NULL,
    label VARCHAR(255) NOT NULL DEFAULT '',
    previous_status VARCHAR(20) NOT NULL DEFAULT '',
    previous_publish_at DATETIME NULL,
    deleted_by BIGINT UNSIGNED NULL,
    api_key_id BIGINT UNSIGNED NULL,
    api_key_name VARCHAR(100) NOT NULL DEFAULT '',
    deleted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_recycle_bin_item (item_type, item_id),
    KEY idx_recycle_bin_deleted (deleted_at),
    CONSTRAINT fk_recycle_bin_user FOREIGN KEY (deleted_by) REFERENCES admin_users (id) ON DELETE SET NULL,
    CONSTRAINT fk_recycle_bin_key FOREIGN KEY (api_key_id) REFERENCES api_keys (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Security extras (Settings > Security, My Account, Users):
--
-- admin_sessions: one row per signed-in browser. Its refresh tokens rotate
-- (refresh_tokens.session_id) but the session stays, so it can be listed and
-- signed out; the API refuses an access token whose session is revoked.
-- Every refresh token still valid gets a session of its own, so nobody is
-- signed out by this migration.
CREATE TABLE IF NOT EXISTS admin_sessions (
    id CHAR(32) NOT NULL,
    admin_user_id BIGINT UNSIGNED NOT NULL,
    ip_address VARCHAR(45) NOT NULL DEFAULT '',
    user_agent VARCHAR(255) NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    PRIMARY KEY (id),
    KEY idx_admin_sessions_user (admin_user_id),
    CONSTRAINT fk_admin_sessions_user FOREIGN KEY (admin_user_id) REFERENCES admin_users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS session_id CHAR(32) NULL AFTER token_hash,
    ADD KEY IF NOT EXISTS idx_refresh_tokens_session (session_id);

INSERT IGNORE INTO admin_sessions (id, admin_user_id, created_at, last_seen_at, expires_at)
SELECT MD5(CONCAT('legacy-', id, '-', token_hash)), admin_user_id, created_at, created_at, expires_at
FROM refresh_tokens
WHERE session_id IS NULL AND revoked_at IS NULL AND expires_at > UTC_TIMESTAMP();

UPDATE refresh_tokens SET session_id = MD5(CONCAT('legacy-', id, '-', token_hash))
WHERE session_id IS NULL AND revoked_at IS NULL AND expires_at > UTC_TIMESTAMP();

-- Failed sign-in lockout and "change your password before continuing".
ALTER TABLE admin_users
    ADD COLUMN IF NOT EXISTS failed_login_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS locked_until DATETIME NULL,
    ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

-- Lockout and password rules (domain.SecurityPolicy) as one JSON document.
-- NULL reads as the defaults.
ALTER TABLE site_settings
    ADD COLUMN IF NOT EXISTS security_policy TEXT NULL AFTER two_factor_enabled;

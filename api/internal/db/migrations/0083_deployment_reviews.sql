-- Settings > Log > Latest Deployments. Deployments themselves are read from
-- deploy.log; this records what admins did with them. A successful deploy
-- can be removed from the list straight away; a failed or interrupted one is
-- marked resolved first (who, when, an optional note) and only then removed.
-- deploy_key is "<log timestamp>|<commit>" (see service.deploymentKey).
CREATE TABLE IF NOT EXISTS deployment_reviews (
    deploy_key VARCHAR(64) NOT NULL,
    resolved_at DATETIME NULL,
    resolved_by BIGINT UNSIGNED NULL,
    resolution_note VARCHAR(500) NOT NULL DEFAULT '',
    removed_at DATETIME NULL,
    removed_by BIGINT UNSIGNED NULL,
    PRIMARY KEY (deploy_key),
    CONSTRAINT fk_deployment_reviews_resolved_by FOREIGN KEY (resolved_by) REFERENCES admin_users (id) ON DELETE SET NULL,
    CONSTRAINT fk_deployment_reviews_removed_by FOREIGN KEY (removed_by) REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- How many deployments the list shows (admin-adjustable, 1-50).
ALTER TABLE site_settings
    ADD COLUMN IF NOT EXISTS deployment_list_limit TINYINT UNSIGNED NOT NULL DEFAULT 10;

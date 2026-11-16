-- Components: reusable page elements written as HTML, CSS and JavaScript
-- (admin Components), placed on pages with a "component" block whose
-- componentId field is components.id. settings is a JSON array of the
-- options each placement fills in (domain.ComponentSetting). Revisions keep
-- the newest domain.MaxComponentRevisions saves of each, as full JSON
-- snapshots, so a bad edit can be rolled back.
CREATE TABLE IF NOT EXISTS components (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(500) NOT NULL DEFAULT '',
    html MEDIUMTEXT NOT NULL,
    css MEDIUMTEXT NOT NULL,
    js MEDIUMTEXT NOT NULL,
    settings TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_components_name (name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS component_revisions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    component_id BIGINT UNSIGNED NOT NULL,
    snapshot LONGTEXT NOT NULL,
    saved_by BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_component_revisions_component (component_id, id),
    CONSTRAINT fk_component_revisions_component FOREIGN KEY (component_id) REFERENCES components (id) ON DELETE CASCADE,
    CONSTRAINT fk_component_revisions_user FOREIGN KEY (saved_by) REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

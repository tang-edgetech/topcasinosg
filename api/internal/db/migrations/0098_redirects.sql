-- Redirects (admin > Redirects): send visitors (and search engines) from an
-- old or unwanted address of the site to another page or website. Matched
-- by path only, ignoring letter case and a trailing slash; the query string
-- is carried over unless the target has its own.
CREATE TABLE IF NOT EXISTS redirects (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    from_path   VARCHAR(500) NOT NULL,
    to_url      VARCHAR(1000) NOT NULL,
    status_code SMALLINT NOT NULL DEFAULT 301,
    is_active   TINYINT(1) NOT NULL DEFAULT 1,
    note        VARCHAR(255) NOT NULL DEFAULT '',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_redirects_from_path (from_path)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

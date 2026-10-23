-- legacy-data-fix
-- Until now the API's connections ran in the MySQL server's own time zone, so
-- every database-generated time (DEFAULT CURRENT_TIMESTAMP, NOW()) was stored
-- in server-local time while the API itself wrote and read UTC. Connections
-- now run in UTC (see db.Open); this shifts those existing values to UTC.
-- Times the API wrote itself (publish_at, refresh_tokens.expires_at,
-- audit_logs.created_at) were already UTC and are left as they are.
-- Each table's columns change in one UPDATE so ON UPDATE CURRENT_TIMESTAMP
-- doesn't overwrite updated_at.
SET @session_time_zone = @@session.time_zone;
SET SESSION time_zone = @@global.time_zone;
SET @utc_offset_seconds = ROUND(TIMESTAMPDIFF(SECOND, UTC_TIMESTAMP(), NOW()) / 60) * 60;
SET SESSION time_zone = @session_time_zone;

UPDATE admin_users SET
    created_at = created_at - INTERVAL @utc_offset_seconds SECOND,
    updated_at = updated_at - INTERVAL @utc_offset_seconds SECOND,
    otp_confirmed_at = otp_confirmed_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE blacklist_entries SET created_at = created_at - INTERVAL @utc_offset_seconds SECOND, updated_at = updated_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE bonuses SET created_at = created_at - INTERVAL @utc_offset_seconds SECOND, updated_at = updated_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE casinos SET created_at = created_at - INTERVAL @utc_offset_seconds SECOND, updated_at = updated_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE game_providers SET created_at = created_at - INTERVAL @utc_offset_seconds SECOND, updated_at = updated_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE guides SET created_at = created_at - INTERVAL @utc_offset_seconds SECOND, updated_at = updated_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE licenses SET created_at = created_at - INTERVAL @utc_offset_seconds SECOND, updated_at = updated_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE media SET created_at = created_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE menu_items SET created_at = created_at - INTERVAL @utc_offset_seconds SECOND, updated_at = updated_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE news_articles SET created_at = created_at - INTERVAL @utc_offset_seconds SECOND, updated_at = updated_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE pages SET created_at = created_at - INTERVAL @utc_offset_seconds SECOND, updated_at = updated_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE page_sections SET created_at = created_at - INTERVAL @utc_offset_seconds SECOND, updated_at = updated_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE page_section_fields SET created_at = created_at - INTERVAL @utc_offset_seconds SECOND, updated_at = updated_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE payment_methods SET created_at = created_at - INTERVAL @utc_offset_seconds SECOND, updated_at = updated_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE refresh_tokens SET created_at = created_at - INTERVAL @utc_offset_seconds SECOND, revoked_at = revoked_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE regions SET created_at = created_at - INTERVAL @utc_offset_seconds SECOND, updated_at = updated_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE rtp_entries SET created_at = created_at - INTERVAL @utc_offset_seconds SECOND, updated_at = updated_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE schema_migrations SET applied_at = applied_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE sidebar_links SET created_at = created_at - INTERVAL @utc_offset_seconds SECOND, updated_at = updated_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE sidebar_sections SET created_at = created_at - INTERVAL @utc_offset_seconds SECOND, updated_at = updated_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE site_settings SET updated_at = updated_at - INTERVAL @utc_offset_seconds SECOND;
UPDATE site_snippets SET created_at = created_at - INTERVAL @utc_offset_seconds SECOND, updated_at = updated_at - INTERVAL @utc_offset_seconds SECOND;

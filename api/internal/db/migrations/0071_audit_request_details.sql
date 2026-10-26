-- Activity entries also record failed admin requests (status code and the
-- error shown to the user), the request line, and the client's port. Loopback
-- addresses are stored as 127.0.0.1 rather than ::1.
ALTER TABLE audit_logs
    ADD COLUMN ip_port SMALLINT UNSIGNED NULL AFTER ip_address,
    ADD COLUMN request_method VARCHAR(10) NOT NULL DEFAULT '' AFTER user_agent,
    ADD COLUMN request_path VARCHAR(255) NOT NULL DEFAULT '' AFTER request_method,
    ADD COLUMN status_code SMALLINT UNSIGNED NOT NULL DEFAULT 0 AFTER request_path,
    ADD COLUMN error_message VARCHAR(1000) NOT NULL DEFAULT '' AFTER status_code,
    ADD KEY idx_audit_logs_status (status_code, created_at);

UPDATE audit_logs SET ip_address = '127.0.0.1' WHERE ip_address = '::1';
UPDATE audit_logs SET status_code = 401 WHERE action = 'login_failed';
UPDATE audit_logs SET status_code = 200 WHERE status_code = 0 AND action <> 'login_failed';

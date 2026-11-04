-- Activity entries say where a request came from: the dashboard, the Content
-- API (/api/v1) or the AI connector (mcp/, which sends a topcasinosg-mcp user
-- agent), and which API key made it. Every /api/v1 request is recorded,
-- reads and refused requests included (middleware.APIRequestLog).
ALTER TABLE audit_logs
    ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'dashboard' AFTER restricted,
    ADD COLUMN IF NOT EXISTS api_key_id BIGINT UNSIGNED NULL AFTER source,
    ADD COLUMN IF NOT EXISTS api_key_name VARCHAR(255) NOT NULL DEFAULT '' AFTER api_key_id,
    ADD KEY IF NOT EXISTS idx_audit_logs_source (source, created_at),
    ADD KEY IF NOT EXISTS idx_audit_logs_api_key (api_key_id, created_at);

UPDATE audit_logs SET source = 'api' WHERE source = 'dashboard' AND actor_name LIKE '%(API key: %';

-- Games checklist (Figma Brand Page): which of a fixed set of game types a
-- casino supports. Same JSON-array-of-strings shape as pros/cons on this
-- table, but validated server-side against a fixed GameType enum (see
-- api/internal/domain/casino.go) rather than free tags — the master list
-- is a hardcoded taxonomy (mirrors BonusType/RTPCategory), not admin-managed.
ALTER TABLE casinos
    ADD COLUMN supported_games JSON NULL AFTER risk_status;

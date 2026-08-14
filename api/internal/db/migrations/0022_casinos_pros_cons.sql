-- Comparison section (Figma Brand Page): a short list of positives and
-- negatives per casino. Same JSON-array-of-strings shape as languages /
-- payment_methods on this table (see 0006_casinos.sql) rather than a new
-- related table, since these are just short freeform tags, not structured data.
ALTER TABLE casinos
    ADD COLUMN pros JSON NULL AFTER payment_methods,
    ADD COLUMN cons JSON NULL AFTER pros;

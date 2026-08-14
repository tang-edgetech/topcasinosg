-- Safe Index / Risk Status (Figma Brand Page sidebar): a 0-100 score plus an
-- independently admin-selected risk tier, not auto-derived from the score —
-- an admin's editorial judgment on a casino's risk can differ from what a
-- single number implies, same reasoning as why status/publish_at are always
-- explicit elsewhere in this codebase rather than computed.
ALTER TABLE casinos
    ADD COLUMN safe_index TINYINT UNSIGNED NULL AFTER cons,
    ADD COLUMN risk_status ENUM('low', 'medium', 'high') NULL AFTER safe_index;

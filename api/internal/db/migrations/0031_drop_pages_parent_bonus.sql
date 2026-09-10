-- Reverts 0030's parent_bonus_id column: pairing a Page directly to a Bonus
-- content row as its "parent" turned out to solve the wrong problem. What
-- was actually needed is real Page hierarchy - see 0032, which nests the
-- existing flat "{region}-bonuses-{type}" pages under a real "bonuses" hub
-- page per region using ordinary parent_id, no new column required.
ALTER TABLE pages DROP FOREIGN KEY fk_pages_parent_bonus;
ALTER TABLE pages DROP KEY idx_pages_parent_bonus;
ALTER TABLE pages DROP COLUMN parent_bonus_id;

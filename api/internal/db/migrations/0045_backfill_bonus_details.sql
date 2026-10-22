-- 1) Repairs the Thai Baht symbol in seeded bonus terms: the seed data
--    stored "฿" as the mojibake string "Ó©┐" (bytes C3 93 C2 A9 E2 94 90),
--    which rendered as garbage in every bonus table. UNHEX keeps this
--    byte-exact regardless of the client's connection charset.
UPDATE bonuses
SET terms = REPLACE(terms, CONVERT(UNHEX('C393C2A9E29490') USING utf8mb4) COLLATE utf8mb4_unicode_ci, CONVERT(UNHEX('E0B8BF') USING utf8mb4) COLLATE utf8mb4_unicode_ci)
WHERE terms LIKE CONCAT('%', CONVERT(UNHEX('C393C2A9E29490') USING utf8mb4) COLLATE utf8mb4_unicode_ci, '%');

-- 2) Backfills the structured comparison columns added in 0043 from what
--    each seeded bonus's own `terms` text already states (wagering, payout
--    frequency, claim amount, perks), so the typed bonus tables have real values
--    instead of empty cells. Only fills fields that are still empty, so any
--    value an admin has already entered is left alone.
UPDATE bonuses SET turnover_requirement = '25x wagering' WHERE id = 11 AND turnover_requirement = '';

UPDATE bonuses SET turnover_requirement = '25x wagering' WHERE id = 5 AND turnover_requirement = '';
UPDATE bonuses SET max_claim = 'RM20' WHERE id = 5 AND max_claim = '';

UPDATE bonuses SET turnover_requirement = 'No Wagering' WHERE id = 8 AND turnover_requirement = '';
UPDATE bonuses SET payment_frequency = 'Weekly' WHERE id = 8 AND payment_frequency = '';

UPDATE bonuses SET turnover_requirement = '30x wagering' WHERE id = 1 AND turnover_requirement = '';

UPDATE bonuses SET turnover_requirement = '30x wagering' WHERE id = 9 AND turnover_requirement = '';

UPDATE bonuses SET turnover_requirement = '15x wagering' WHERE id = 12 AND turnover_requirement = '';

UPDATE bonuses SET turnover_requirement = '1x wagering' WHERE id = 3 AND turnover_requirement = '';
UPDATE bonuses SET payment_frequency = 'Weekly (Monday)' WHERE id = 3 AND payment_frequency = '';

UPDATE bonuses SET turnover_requirement = '25x wagering' WHERE id = 7 AND turnover_requirement = '';

UPDATE bonuses SET turnover_requirement = '30x bonus + deposit' WHERE id = 4 AND turnover_requirement = '';

UPDATE bonuses SET turnover_requirement = '40x wagering' WHERE id = 15 AND turnover_requirement = '';

UPDATE bonuses SET turnover_requirement = '20x wagering' WHERE id = 6 AND turnover_requirement = '';

UPDATE bonuses SET turnover_requirement = 'No Wagering' WHERE id = 14 AND turnover_requirement = '';
UPDATE bonuses SET payment_frequency = 'Weekly (Sunday)' WHERE id = 14 AND payment_frequency = '';

UPDATE bonuses SET perks = 'Points on every wager, birthday bonuses, dedicated VIP host' WHERE id = 10 AND perks = '';

UPDATE bonuses SET turnover_requirement = '35x wagering' WHERE id = 13 AND turnover_requirement = '';

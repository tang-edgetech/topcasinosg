-- Repairs em dashes on the per-type bonus pages (/{region}/bonuses/<type>).
-- An earlier seed ran through a cp850 client, so each "—" was stored as the
-- three characters "ÔÇö" (UTF-8 C3 94 C3 87 C3 B6). Byte-exact replacement,
-- so it is safe to run on rows that are already correct.

UPDATE page_section_fields
SET text_value = REPLACE(text_value, UNHEX('C394C387C3B6'), UNHEX('E28094'))
WHERE INSTR(text_value, UNHEX('C394C387C3B6')) > 0;

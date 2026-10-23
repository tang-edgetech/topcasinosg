-- Currencies a casino accepts (Figma brand page "Currencies" count).

ALTER TABLE casinos ADD COLUMN currencies JSON NULL AFTER languages;

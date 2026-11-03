-- Nested containers: each page section gets a level (depth). Level 0 is
-- directly on the page (only Containers and Global Sections); a section at
-- level N belongs to the nearest Container before it at level N-1, so a
-- Container can now hold other Containers (rows, columns) as well as
-- components, up to domain.MaxSectionDepth.
--
-- in_container stays, kept equal to depth > 0, so anything that still reads
-- it sees the same pages. Every existing section inside a container becomes
-- level 1: pages look exactly as they did.
ALTER TABLE page_sections
    ADD COLUMN IF NOT EXISTS depth TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER in_container;

UPDATE page_sections SET depth = 1 WHERE in_container = 1 AND depth = 0;

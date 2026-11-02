-- Page hierarchy: level 0 of a page (or Global Section) holds only
-- Containers (rendered as <section>) and Global Sections; every other
-- component sits inside a Container (rendered as <div>). The API refuses
-- anything else from now on (service.validateHierarchy).
--
-- Every component currently at level 0 gets a Container of its own placed
-- right before it. The wrapper uses the stack layout with
-- componentSpacing = own: the component keeps its own padding and width, and
-- the container adds no space, so pages look exactly as before.
-- Section templates (kind 'template') are left alone - a template may be a
-- single component, inserted into a Container when used.

CREATE TEMPORARY TABLE wrap_targets AS
SELECT s.id AS section_id, s.page_id, s.sort_order
FROM page_sections s
JOIN pages p ON p.id = s.page_id
WHERE p.kind IN ('page', 'global')
  AND s.in_container = 0
  AND s.block_type NOT IN ('container', 'global_section');

-- Make room: every section on an affected page moves to an even sort order,
-- so each wrapper fits at the odd slot right before its component.
UPDATE page_sections s
JOIN (SELECT DISTINCT page_id FROM wrap_targets) t ON t.page_id = s.page_id
SET s.sort_order = s.sort_order * 2, s.updated_at = s.updated_at;

INSERT INTO page_sections (page_id, block_type, custom_class, custom_id, in_container, sort_order)
SELECT page_id, 'container', '', '', 0, sort_order * 2 - 1
FROM wrap_targets;

INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT c.id, 0, f.field_key, 'text', f.text_value, f.sort_order
FROM wrap_targets t
JOIN page_sections c ON c.page_id = t.page_id AND c.sort_order = t.sort_order * 2 - 1 AND c.block_type = 'container'
CROSS JOIN (
    SELECT 'layout' AS field_key, 'stack' AS text_value, 5 AS sort_order
    UNION ALL SELECT 'componentSpacing', 'own', 16
    UNION ALL SELECT 'spaceTop', 'none', 10
    UNION ALL SELECT 'spaceBottom', 'none', 11
) f;

UPDATE page_sections s
JOIN wrap_targets t ON t.section_id = s.id
SET s.in_container = 1, s.updated_at = s.updated_at;

DROP TEMPORARY TABLE wrap_targets;

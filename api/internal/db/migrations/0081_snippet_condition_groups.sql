-- AND/OR targeting for Code snippets (admin Snippets > Code): conditions are
-- grouped. A snippet applies when every condition in at least one group
-- matches - AND inside a group, OR between groups. Existing conditions all
-- land in group 0, so they keep combining with AND exactly as before.
ALTER TABLE snippet_conditions
    ADD COLUMN IF NOT EXISTS group_index INT NOT NULL DEFAULT 0 AFTER snippet_id;

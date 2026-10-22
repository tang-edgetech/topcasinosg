-- 0032 normalized bonus-type slugs to the underscore form the
-- /{region}/bonuses/[type] route looks up (no_deposit, free_spins, ...), but
-- TH's No Deposit page kept a hyphenated "no-deposit" slug, so
-- getPage("th/bonuses/no_deposit") never found it and the page rendered
-- without its CMS sections. Guarded so it's a no-op if a no_deposit sibling
-- already exists.
UPDATE pages p
JOIN pages hub ON hub.id = p.parent_id AND hub.slug = 'bonuses'
JOIN pages region ON region.id = hub.parent_id AND region.slug = 'th'
LEFT JOIN pages existing ON existing.parent_id = hub.id AND existing.slug = 'no_deposit'
SET p.slug = 'no_deposit'
WHERE p.slug = 'no-deposit'
  AND existing.id IS NULL;

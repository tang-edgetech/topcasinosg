-- Seeds the "/{region}/bonuses" hub page (created in draft by 0032) with the
-- full CMS content from Figma "D / Country / TH / Bonuses" for th/my/sg:
-- why-bonuses copy, a types-of-bonuses link grid, Top Bonus Picks (live
-- casino/bonus data), six typed per-bonus-type tables (live bonus data, see
-- 0043_bonus_details.sql), How We Choose, How to Claim, Bonuses to Avoid,
-- calculator, and FAQs. Generated per region (only names/currency/links
-- differ). Each section insert is guarded by NOT EXISTS on its sort_order,
-- and @sec only takes LAST_INSERT_ID() when that insert actually added a
-- row, so a skipped section never attaches its fields to a stale id.

-- ===================== TH =====================
SET @page_id = (
  SELECT p.id FROM pages p
  JOIN pages region ON region.id = p.parent_id
  WHERE region.slug = 'th' AND p.slug = 'bonuses'
);

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'rich_text', '', 1 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 1);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Why Online Casino’s Bonuses Matter to You' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Online casino bonuses aren’t just attractive marketing tactics; they''re valuable tools for maximizing your gameplay. Using bonuses effectively allows you to extend your sessions, boost your bankroll, and significantly increase your winning potential.</p>', 2
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'link_card_grid', 'section--tight-top', 2 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 2);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Types of Bonuses Explained' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Understanding the types of bonuses available can help you strategically select offers:</p>', 2
UNION ALL SELECT @sec, 0, 'columns', 'text', '2', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'No Deposit Bonuses', 4
UNION ALL SELECT @sec, 1, 'description', 'text', 'Receive free cash or spins without depositing your own money.', 5
UNION ALL SELECT @sec, 1, 'url', 'text', '/th/bonuses/no_deposit', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Free Spins', 7
UNION ALL SELECT @sec, 2, 'description', 'text', 'Ideal for slot enthusiasts, allowing spins on selected slots without risking your own funds.', 8
UNION ALL SELECT @sec, 2, 'url', 'text', '/th/bonuses/free_spins', 9
UNION ALL SELECT @sec, 3, 'title', 'text', 'Welcome Bonus', 10
UNION ALL SELECT @sec, 3, 'description', 'text', 'A matched bonus on your first deposit, often doubling your initial bankroll.', 11
UNION ALL SELECT @sec, 3, 'url', 'text', '/th/bonuses/welcome', 12
UNION ALL SELECT @sec, 4, 'title', 'text', 'Cashback Bonus', 13
UNION ALL SELECT @sec, 4, 'description', 'text', 'Get a percentage of your losses returned to you, reducing risk.', 14
UNION ALL SELECT @sec, 4, 'url', 'text', '/th/bonuses/cashback', 15
UNION ALL SELECT @sec, 5, 'title', 'text', 'Deposit Bonus', 16
UNION ALL SELECT @sec, 5, 'description', 'text', 'Regular rewards for recurring deposits, encouraging loyalty.', 17
UNION ALL SELECT @sec, 5, 'url', 'text', '/th/bonuses/deposit', 18
UNION ALL SELECT @sec, 6, 'title', 'text', 'Loyalty / VIP Program', 19
UNION ALL SELECT @sec, 6, 'description', 'text', 'Exclusive rewards provided to long-term players and VIP members.', 20
UNION ALL SELECT @sec, 6, 'url', 'text', '/th/bonuses/loyalty_vip', 21
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'top_bonus_picks', '', 3 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 3);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Top Bonus Picks in Thailand 2025' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'th', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'welcome', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '3', 4
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_listing_table', 'section--tight-top', 4 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 4);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'No Deposit Bonus Offers in Thailand This Month' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'th', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'no_deposit', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Claim real-money bonuses without making a deposit. These verified offers are ideal for new players looking to explore risk-free.</p>', 5
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'typed', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_listing_table', 'section--tight-top', 5 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 5);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Cashback Bonus Offers in Thailand This Month' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'th', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'cashback', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Get a percentage of your losses back as bonus credit. Cashback offers help reduce risk and reward ongoing play.</p>', 5
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'typed', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_listing_table', 'section--tight-top', 6 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 6);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Deposit Bonus Offers in Thailand This Month' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'th', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'deposit', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Boost your bankroll instantly with matched deposit bonuses. These deals are available to both new and existing Thai players.</p>', 5
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'typed', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_listing_table', 'section--tight-top', 7 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 7);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Welcome Bonus Offers in Thailand This Month' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'th', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'welcome', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Unlock generous welcome packages on your first deposits. These bonuses often combine match offers with free spins.</p>', 5
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'typed', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_listing_table', 'section--tight-top', 8 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 8);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Free Spins Bonus Offers in Thailand This Month' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'th', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'free_spins', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Play selected slot games with free spins this month. These offers include transparent terms and support for Thai players.</p>', 5
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'typed', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_listing_table', 'section--tight-top', 9 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 9);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Loyalty/VIP Bonus Offers in Thailand This Month' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'th', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'loyalty_vip', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Access exclusive perks, reloads, and high-limit rewards through loyalty and VIP programs. These offers are tailored to frequent Thai players.</p>', 5
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'typed', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'checklist_callout', '', 10 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 10);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How We Choose the Best Thai Casino Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'Our expert Thai review team carefully assesses each bonus based on strict criteria:', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Bonuses offered in THB or tailored specifically for Thai players', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Fair and transparent turnover requirements', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Availability at licensed and trusted online casinos', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Thorough testing by our experienced casino players', 7
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'numbered_steps', '', 11 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 11);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Claim Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Claiming casino bonuses is straightforward but involves key steps:</p>', 2
UNION ALL SELECT @sec, 1, 'title', 'text', 'Select the Right Bonus', 3
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Choose from our recommended and verified list.</p>', 4
UNION ALL SELECT @sec, 2, 'title', 'text', 'Sign Up or Log In', 5
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Create or log in to your casino account.</p>', 6
UNION ALL SELECT @sec, 3, 'title', 'text', 'Make a Deposit (If required)', 7
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Follow the casino''s instructions for deposits.</p>', 8
UNION ALL SELECT @sec, 4, 'title', 'text', 'Activate Your Bonus', 9
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Enter the bonus code (if applicable) or follow instructions provided by the casino.</p>', 10
UNION ALL SELECT @sec, 5, 'title', 'text', 'Enjoy and Play', 11
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Use your bonus to play eligible games and aim for a big win.</p>', 12
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'highlight_panel', '', 12 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 12);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'headingLine1' AS field_key, 'text' AS field_type, 'Online Casino Bonuses to Avoid in Thailand' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'headingLine1Color', 'text', 'white', 2
UNION ALL SELECT @sec, 0, 'highlightText', 'text', 'Avoid', 3
UNION ALL SELECT @sec, 0, 'highlightColor', 'text', 'danger', 4
UNION ALL SELECT @sec, 0, 'theme', 'text', 'dark', 5
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Learn more about casinos to avoid on our <a href="/th/blacklist">Blacklist Page</a>.</p><h3>Common Bonus Scams Thai Players Should Know</h3><p>Avoid:</p><ul><li>Every complaint made before was looked into and resolved by those affected.</li><li>A license is given by a trusted regulator and can be verified as being valid.</li><li>The terms related to bonuses are clearer, and the quality of customer service has gone up a lot.</li></ul>', 6
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'gradient', 7
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'primary-900', 8
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'danger', 9
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_calculator', '', 13 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 13);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Online Casino Bonuses Calculator' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Use our easy online bonus calculator to determine how much you need to rollover or turnover before you can withdraw.</p>', 2
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'faq', '', 14 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 14);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs of Online Casino Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'What is an online casino bonus?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>An online casino bonus is a promotional offer that gives players extra funds, free spins, or cashback when they meet certain conditions, such as making a deposit or signing up.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'How do I claim a casino bonus?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>You can get a bonus by creating an account and meet the turnover requirements by making a deposit.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'What does turnover mean in a bonus?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Turnover refers to the total amount you must bet before you can withdraw any winnings earned from the bonus.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'Can I withdraw my bonus money immediately?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>No. Most bonuses are locked until you meet the turnover conditions.</p>', 9
UNION ALL SELECT @sec, 5, 'question', 'text', 'Which games count towards turnover requirements?', 10
UNION ALL SELECT @sec, 5, 'answer', 'richtext', '<p>Slots usually contribute 100%, while table games like blackjack or roulette contribute less or may be excluded. Always check the game weighting in the bonus terms.</p>', 11
UNION ALL SELECT @sec, 6, 'question', 'text', 'Do all online casinos offer the same bonus terms?', 12
UNION ALL SELECT @sec, 6, 'answer', 'richtext', '<p>No. Bonus terms vary widely between different online casinos. Always read the full terms and conditions before accepting any offer to understand turnover, max bets, and expiry rules.</p>', 13
UNION ALL SELECT @sec, 7, 'question', 'text', 'What’s the difference between a deposit bonus and a no deposit bonus?', 14
UNION ALL SELECT @sec, 7, 'answer', 'richtext', '<p>A deposit bonus requires you to add funds to receive the offer, while a no deposit bonus gives you a reward without needing to deposit, but often with stricter terms and lower caps.</p>', 15
UNION ALL SELECT @sec, 8, 'question', 'text', 'Are online casino bonuses worth it?', 16
UNION ALL SELECT @sec, 8, 'answer', 'richtext', '<p>Bonuses can offer good value if the terms are fair and achievable. Use a bonus calculator to estimate the real cost and potential return before opting in.</p>', 17
UNION ALL SELECT @sec, 9, 'question', 'text', 'Can I claim more than one bonus at a time?', 18
UNION ALL SELECT @sec, 9, 'answer', 'richtext', '<p>Most casinos allow only one active bonus per account at a time. You must usually complete the current bonus before claiming a new one.</p>', 19
UNION ALL SELECT @sec, 10, 'question', 'text', 'Do bonuses expire?', 20
UNION ALL SELECT @sec, 10, 'answer', 'richtext', '<p>Yes. Most bonuses have an expiry period where you can check in their official casino website.</p>', 21
UNION ALL SELECT @sec, 11, 'question', 'text', 'What happens if I break the bonus terms by accident?', 22
UNION ALL SELECT @sec, 11, 'answer', 'richtext', '<p>If you exceed the max betting limit or play restricted games, your bonus and any winnings may be voided. Some casinos are lenient with first-time mistakes, but most enforce the rules strictly.</p>', 23
UNION ALL SELECT @sec, 12, 'question', 'text', 'Do different payment methods affect my bonus eligibility?', 24
UNION ALL SELECT @sec, 12, 'answer', 'richtext', '<p>Yes. Some bonuses exclude deposits made with certain payment types. Always check the terms to ensure your deposit qualifies.</p>', 25
UNION ALL SELECT @sec, 13, 'question', 'text', 'Why do some bonuses offer high match percentages with high turnover?', 26
UNION ALL SELECT @sec, 13, 'answer', 'richtext', '<p>Casinos use bonuses that sound good to be true to attract attention, but they often come with higher turnover. Balance is key.</p>', 27
UNION ALL SELECT @sec, 14, 'question', 'text', 'How can I tell if a bonus is unfair?', 28
UNION ALL SELECT @sec, 14, 'answer', 'richtext', '<p>Unfair bonuses often have extremely high turnover (over 50x), hidden game restrictions, or unclear terms. Use a bonus calculator and check our casino brand review to identify red flags.</p>', 29
) AS rows_to_insert WHERE @sec > 0;

UPDATE pages SET status = 'published' WHERE id = @page_id AND status = 'draft';

-- ===================== MY =====================
SET @page_id = (
  SELECT p.id FROM pages p
  JOIN pages region ON region.id = p.parent_id
  WHERE region.slug = 'my' AND p.slug = 'bonuses'
);

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'rich_text', '', 1 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 1);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Why Online Casino’s Bonuses Matter to You' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Online casino bonuses aren’t just attractive marketing tactics; they''re valuable tools for maximizing your gameplay. Using bonuses effectively allows you to extend your sessions, boost your bankroll, and significantly increase your winning potential.</p>', 2
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'link_card_grid', 'section--tight-top', 2 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 2);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Types of Bonuses Explained' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Understanding the types of bonuses available can help you strategically select offers:</p>', 2
UNION ALL SELECT @sec, 0, 'columns', 'text', '2', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'No Deposit Bonuses', 4
UNION ALL SELECT @sec, 1, 'description', 'text', 'Receive free cash or spins without depositing your own money.', 5
UNION ALL SELECT @sec, 1, 'url', 'text', '/my/bonuses/no_deposit', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Free Spins', 7
UNION ALL SELECT @sec, 2, 'description', 'text', 'Ideal for slot enthusiasts, allowing spins on selected slots without risking your own funds.', 8
UNION ALL SELECT @sec, 2, 'url', 'text', '/my/bonuses/free_spins', 9
UNION ALL SELECT @sec, 3, 'title', 'text', 'Welcome Bonus', 10
UNION ALL SELECT @sec, 3, 'description', 'text', 'A matched bonus on your first deposit, often doubling your initial bankroll.', 11
UNION ALL SELECT @sec, 3, 'url', 'text', '/my/bonuses/welcome', 12
UNION ALL SELECT @sec, 4, 'title', 'text', 'Cashback Bonus', 13
UNION ALL SELECT @sec, 4, 'description', 'text', 'Get a percentage of your losses returned to you, reducing risk.', 14
UNION ALL SELECT @sec, 4, 'url', 'text', '/my/bonuses/cashback', 15
UNION ALL SELECT @sec, 5, 'title', 'text', 'Deposit Bonus', 16
UNION ALL SELECT @sec, 5, 'description', 'text', 'Regular rewards for recurring deposits, encouraging loyalty.', 17
UNION ALL SELECT @sec, 5, 'url', 'text', '/my/bonuses/deposit', 18
UNION ALL SELECT @sec, 6, 'title', 'text', 'Loyalty / VIP Program', 19
UNION ALL SELECT @sec, 6, 'description', 'text', 'Exclusive rewards provided to long-term players and VIP members.', 20
UNION ALL SELECT @sec, 6, 'url', 'text', '/my/bonuses/loyalty_vip', 21
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'top_bonus_picks', '', 3 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 3);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Top Bonus Picks in Malaysia 2025' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'my', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'welcome', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '3', 4
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_listing_table', 'section--tight-top', 4 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 4);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'No Deposit Bonus Offers in Malaysia This Month' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'my', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'no_deposit', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Claim real-money bonuses without making a deposit. These verified offers are ideal for new players looking to explore risk-free.</p>', 5
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'typed', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_listing_table', 'section--tight-top', 5 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 5);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Cashback Bonus Offers in Malaysia This Month' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'my', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'cashback', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Get a percentage of your losses back as bonus credit. Cashback offers help reduce risk and reward ongoing play.</p>', 5
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'typed', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_listing_table', 'section--tight-top', 6 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 6);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Deposit Bonus Offers in Malaysia This Month' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'my', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'deposit', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Boost your bankroll instantly with matched deposit bonuses. These deals are available to both new and existing Malaysian players.</p>', 5
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'typed', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_listing_table', 'section--tight-top', 7 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 7);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Welcome Bonus Offers in Malaysia This Month' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'my', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'welcome', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Unlock generous welcome packages on your first deposits. These bonuses often combine match offers with free spins.</p>', 5
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'typed', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_listing_table', 'section--tight-top', 8 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 8);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Free Spins Bonus Offers in Malaysia This Month' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'my', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'free_spins', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Play selected slot games with free spins this month. These offers include transparent terms and support for Malaysian players.</p>', 5
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'typed', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_listing_table', 'section--tight-top', 9 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 9);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Loyalty/VIP Bonus Offers in Malaysia This Month' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'my', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'loyalty_vip', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Access exclusive perks, reloads, and high-limit rewards through loyalty and VIP programs. These offers are tailored to frequent Malaysian players.</p>', 5
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'typed', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'checklist_callout', '', 10 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 10);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How We Choose the Best Malaysian Casino Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'Our expert Malaysian review team carefully assesses each bonus based on strict criteria:', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Bonuses offered in MYR or tailored specifically for Malaysian players', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Fair and transparent turnover requirements', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Availability at licensed and trusted online casinos', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Thorough testing by our experienced casino players', 7
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'numbered_steps', '', 11 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 11);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Claim Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Claiming casino bonuses is straightforward but involves key steps:</p>', 2
UNION ALL SELECT @sec, 1, 'title', 'text', 'Select the Right Bonus', 3
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Choose from our recommended and verified list.</p>', 4
UNION ALL SELECT @sec, 2, 'title', 'text', 'Sign Up or Log In', 5
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Create or log in to your casino account.</p>', 6
UNION ALL SELECT @sec, 3, 'title', 'text', 'Make a Deposit (If required)', 7
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Follow the casino''s instructions for deposits.</p>', 8
UNION ALL SELECT @sec, 4, 'title', 'text', 'Activate Your Bonus', 9
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Enter the bonus code (if applicable) or follow instructions provided by the casino.</p>', 10
UNION ALL SELECT @sec, 5, 'title', 'text', 'Enjoy and Play', 11
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Use your bonus to play eligible games and aim for a big win.</p>', 12
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'highlight_panel', '', 12 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 12);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'headingLine1' AS field_key, 'text' AS field_type, 'Online Casino Bonuses to Avoid in Malaysia' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'headingLine1Color', 'text', 'white', 2
UNION ALL SELECT @sec, 0, 'highlightText', 'text', 'Avoid', 3
UNION ALL SELECT @sec, 0, 'highlightColor', 'text', 'danger', 4
UNION ALL SELECT @sec, 0, 'theme', 'text', 'dark', 5
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Learn more about casinos to avoid on our <a href="/my/blacklist">Blacklist Page</a>.</p><h3>Common Bonus Scams Malaysian Players Should Know</h3><p>Avoid:</p><ul><li>Every complaint made before was looked into and resolved by those affected.</li><li>A license is given by a trusted regulator and can be verified as being valid.</li><li>The terms related to bonuses are clearer, and the quality of customer service has gone up a lot.</li></ul>', 6
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'gradient', 7
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'primary-900', 8
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'danger', 9
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_calculator', '', 13 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 13);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Online Casino Bonuses Calculator' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Use our easy online bonus calculator to determine how much you need to rollover or turnover before you can withdraw.</p>', 2
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'faq', '', 14 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 14);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs of Online Casino Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'What is an online casino bonus?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>An online casino bonus is a promotional offer that gives players extra funds, free spins, or cashback when they meet certain conditions, such as making a deposit or signing up.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'How do I claim a casino bonus?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>You can get a bonus by creating an account and meet the turnover requirements by making a deposit.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'What does turnover mean in a bonus?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Turnover refers to the total amount you must bet before you can withdraw any winnings earned from the bonus.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'Can I withdraw my bonus money immediately?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>No. Most bonuses are locked until you meet the turnover conditions.</p>', 9
UNION ALL SELECT @sec, 5, 'question', 'text', 'Which games count towards turnover requirements?', 10
UNION ALL SELECT @sec, 5, 'answer', 'richtext', '<p>Slots usually contribute 100%, while table games like blackjack or roulette contribute less or may be excluded. Always check the game weighting in the bonus terms.</p>', 11
UNION ALL SELECT @sec, 6, 'question', 'text', 'Do all online casinos offer the same bonus terms?', 12
UNION ALL SELECT @sec, 6, 'answer', 'richtext', '<p>No. Bonus terms vary widely between different online casinos. Always read the full terms and conditions before accepting any offer to understand turnover, max bets, and expiry rules.</p>', 13
UNION ALL SELECT @sec, 7, 'question', 'text', 'What’s the difference between a deposit bonus and a no deposit bonus?', 14
UNION ALL SELECT @sec, 7, 'answer', 'richtext', '<p>A deposit bonus requires you to add funds to receive the offer, while a no deposit bonus gives you a reward without needing to deposit, but often with stricter terms and lower caps.</p>', 15
UNION ALL SELECT @sec, 8, 'question', 'text', 'Are online casino bonuses worth it?', 16
UNION ALL SELECT @sec, 8, 'answer', 'richtext', '<p>Bonuses can offer good value if the terms are fair and achievable. Use a bonus calculator to estimate the real cost and potential return before opting in.</p>', 17
UNION ALL SELECT @sec, 9, 'question', 'text', 'Can I claim more than one bonus at a time?', 18
UNION ALL SELECT @sec, 9, 'answer', 'richtext', '<p>Most casinos allow only one active bonus per account at a time. You must usually complete the current bonus before claiming a new one.</p>', 19
UNION ALL SELECT @sec, 10, 'question', 'text', 'Do bonuses expire?', 20
UNION ALL SELECT @sec, 10, 'answer', 'richtext', '<p>Yes. Most bonuses have an expiry period where you can check in their official casino website.</p>', 21
UNION ALL SELECT @sec, 11, 'question', 'text', 'What happens if I break the bonus terms by accident?', 22
UNION ALL SELECT @sec, 11, 'answer', 'richtext', '<p>If you exceed the max betting limit or play restricted games, your bonus and any winnings may be voided. Some casinos are lenient with first-time mistakes, but most enforce the rules strictly.</p>', 23
UNION ALL SELECT @sec, 12, 'question', 'text', 'Do different payment methods affect my bonus eligibility?', 24
UNION ALL SELECT @sec, 12, 'answer', 'richtext', '<p>Yes. Some bonuses exclude deposits made with certain payment types. Always check the terms to ensure your deposit qualifies.</p>', 25
UNION ALL SELECT @sec, 13, 'question', 'text', 'Why do some bonuses offer high match percentages with high turnover?', 26
UNION ALL SELECT @sec, 13, 'answer', 'richtext', '<p>Casinos use bonuses that sound good to be true to attract attention, but they often come with higher turnover. Balance is key.</p>', 27
UNION ALL SELECT @sec, 14, 'question', 'text', 'How can I tell if a bonus is unfair?', 28
UNION ALL SELECT @sec, 14, 'answer', 'richtext', '<p>Unfair bonuses often have extremely high turnover (over 50x), hidden game restrictions, or unclear terms. Use a bonus calculator and check our casino brand review to identify red flags.</p>', 29
) AS rows_to_insert WHERE @sec > 0;

UPDATE pages SET status = 'published' WHERE id = @page_id AND status = 'draft';

-- ===================== SG =====================
SET @page_id = (
  SELECT p.id FROM pages p
  JOIN pages region ON region.id = p.parent_id
  WHERE region.slug = 'sg' AND p.slug = 'bonuses'
);

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'rich_text', '', 1 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 1);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Why Online Casino’s Bonuses Matter to You' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Online casino bonuses aren’t just attractive marketing tactics; they''re valuable tools for maximizing your gameplay. Using bonuses effectively allows you to extend your sessions, boost your bankroll, and significantly increase your winning potential.</p>', 2
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'link_card_grid', 'section--tight-top', 2 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 2);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Types of Bonuses Explained' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Understanding the types of bonuses available can help you strategically select offers:</p>', 2
UNION ALL SELECT @sec, 0, 'columns', 'text', '2', 3
UNION ALL SELECT @sec, 1, 'title', 'text', 'No Deposit Bonuses', 4
UNION ALL SELECT @sec, 1, 'description', 'text', 'Receive free cash or spins without depositing your own money.', 5
UNION ALL SELECT @sec, 1, 'url', 'text', '/sg/bonuses/no_deposit', 6
UNION ALL SELECT @sec, 2, 'title', 'text', 'Free Spins', 7
UNION ALL SELECT @sec, 2, 'description', 'text', 'Ideal for slot enthusiasts, allowing spins on selected slots without risking your own funds.', 8
UNION ALL SELECT @sec, 2, 'url', 'text', '/sg/bonuses/free_spins', 9
UNION ALL SELECT @sec, 3, 'title', 'text', 'Welcome Bonus', 10
UNION ALL SELECT @sec, 3, 'description', 'text', 'A matched bonus on your first deposit, often doubling your initial bankroll.', 11
UNION ALL SELECT @sec, 3, 'url', 'text', '/sg/bonuses/welcome', 12
UNION ALL SELECT @sec, 4, 'title', 'text', 'Cashback Bonus', 13
UNION ALL SELECT @sec, 4, 'description', 'text', 'Get a percentage of your losses returned to you, reducing risk.', 14
UNION ALL SELECT @sec, 4, 'url', 'text', '/sg/bonuses/cashback', 15
UNION ALL SELECT @sec, 5, 'title', 'text', 'Deposit Bonus', 16
UNION ALL SELECT @sec, 5, 'description', 'text', 'Regular rewards for recurring deposits, encouraging loyalty.', 17
UNION ALL SELECT @sec, 5, 'url', 'text', '/sg/bonuses/deposit', 18
UNION ALL SELECT @sec, 6, 'title', 'text', 'Loyalty / VIP Program', 19
UNION ALL SELECT @sec, 6, 'description', 'text', 'Exclusive rewards provided to long-term players and VIP members.', 20
UNION ALL SELECT @sec, 6, 'url', 'text', '/sg/bonuses/loyalty_vip', 21
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'top_bonus_picks', '', 3 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 3);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Top Bonus Picks in Singapore 2025' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'sg', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'welcome', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '3', 4
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_listing_table', 'section--tight-top', 4 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 4);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'No Deposit Bonus Offers in Singapore This Month' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'sg', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'no_deposit', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Claim real-money bonuses without making a deposit. These verified offers are ideal for new players looking to explore risk-free.</p>', 5
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'typed', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_listing_table', 'section--tight-top', 5 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 5);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Cashback Bonus Offers in Singapore This Month' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'sg', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'cashback', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Get a percentage of your losses back as bonus credit. Cashback offers help reduce risk and reward ongoing play.</p>', 5
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'typed', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_listing_table', 'section--tight-top', 6 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 6);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Deposit Bonus Offers in Singapore This Month' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'sg', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'deposit', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Boost your bankroll instantly with matched deposit bonuses. These deals are available to both new and existing Singaporean players.</p>', 5
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'typed', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_listing_table', 'section--tight-top', 7 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 7);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Welcome Bonus Offers in Singapore This Month' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'sg', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'welcome', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Unlock generous welcome packages on your first deposits. These bonuses often combine match offers with free spins.</p>', 5
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'typed', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_listing_table', 'section--tight-top', 8 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 8);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Free Spins Bonus Offers in Singapore This Month' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'sg', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'free_spins', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Play selected slot games with free spins this month. These offers include transparent terms and support for Singaporean players.</p>', 5
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'typed', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_listing_table', 'section--tight-top', 9 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 9);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Loyalty/VIP Bonus Offers in Singapore This Month' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'regionCode', 'text', 'sg', 2
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'loyalty_vip', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Access exclusive perks, reloads, and high-limit rewards through loyalty and VIP programs. These offers are tailored to frequent Singaporean players.</p>', 5
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'typed', 6
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'checklist_callout', '', 10 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 10);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How We Choose the Best Singaporean Casino Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'Our expert Singaporean review team carefully assesses each bonus based on strict criteria:', 2
UNION ALL SELECT @sec, 0, 'layout', 'text', 'stacked', 3
UNION ALL SELECT @sec, 1, 'text', 'text', 'Bonuses offered in SGD or tailored specifically for Singaporean players', 4
UNION ALL SELECT @sec, 2, 'text', 'text', 'Fair and transparent turnover requirements', 5
UNION ALL SELECT @sec, 3, 'text', 'text', 'Availability at licensed and trusted online casinos', 6
UNION ALL SELECT @sec, 4, 'text', 'text', 'Thorough testing by our experienced casino players', 7
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'numbered_steps', '', 11 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 11);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Claim Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Claiming casino bonuses is straightforward but involves key steps:</p>', 2
UNION ALL SELECT @sec, 1, 'title', 'text', 'Select the Right Bonus', 3
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Choose from our recommended and verified list.</p>', 4
UNION ALL SELECT @sec, 2, 'title', 'text', 'Sign Up or Log In', 5
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Create or log in to your casino account.</p>', 6
UNION ALL SELECT @sec, 3, 'title', 'text', 'Make a Deposit (If required)', 7
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Follow the casino''s instructions for deposits.</p>', 8
UNION ALL SELECT @sec, 4, 'title', 'text', 'Activate Your Bonus', 9
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Enter the bonus code (if applicable) or follow instructions provided by the casino.</p>', 10
UNION ALL SELECT @sec, 5, 'title', 'text', 'Enjoy and Play', 11
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Use your bonus to play eligible games and aim for a big win.</p>', 12
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'highlight_panel', '', 12 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 12);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'headingLine1' AS field_key, 'text' AS field_type, 'Online Casino Bonuses to Avoid in Singapore' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'headingLine1Color', 'text', 'white', 2
UNION ALL SELECT @sec, 0, 'highlightText', 'text', 'Avoid', 3
UNION ALL SELECT @sec, 0, 'highlightColor', 'text', 'danger', 4
UNION ALL SELECT @sec, 0, 'theme', 'text', 'dark', 5
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Learn more about casinos to avoid on our <a href="/sg/blacklist">Blacklist Page</a>.</p><h3>Common Bonus Scams Singaporean Players Should Know</h3><p>Avoid:</p><ul><li>Every complaint made before was looked into and resolved by those affected.</li><li>A license is given by a trusted regulator and can be verified as being valid.</li><li>The terms related to bonuses are clearer, and the quality of customer service has gone up a lot.</li></ul>', 6
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'gradient', 7
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'primary-900', 8
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'danger', 9
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'bonus_calculator', '', 13 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 13);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Online Casino Bonuses Calculator' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Use our easy online bonus calculator to determine how much you need to rollover or turnover before you can withdraw.</p>', 2
) AS rows_to_insert WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, custom_class, sort_order)
SELECT @page_id, 'faq', '', 14 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 14);
SET @sec = IF(ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs of Online Casino Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'What is an online casino bonus?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>An online casino bonus is a promotional offer that gives players extra funds, free spins, or cashback when they meet certain conditions, such as making a deposit or signing up.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'How do I claim a casino bonus?', 4
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>You can get a bonus by creating an account and meet the turnover requirements by making a deposit.</p>', 5
UNION ALL SELECT @sec, 3, 'question', 'text', 'What does turnover mean in a bonus?', 6
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Turnover refers to the total amount you must bet before you can withdraw any winnings earned from the bonus.</p>', 7
UNION ALL SELECT @sec, 4, 'question', 'text', 'Can I withdraw my bonus money immediately?', 8
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>No. Most bonuses are locked until you meet the turnover conditions.</p>', 9
UNION ALL SELECT @sec, 5, 'question', 'text', 'Which games count towards turnover requirements?', 10
UNION ALL SELECT @sec, 5, 'answer', 'richtext', '<p>Slots usually contribute 100%, while table games like blackjack or roulette contribute less or may be excluded. Always check the game weighting in the bonus terms.</p>', 11
UNION ALL SELECT @sec, 6, 'question', 'text', 'Do all online casinos offer the same bonus terms?', 12
UNION ALL SELECT @sec, 6, 'answer', 'richtext', '<p>No. Bonus terms vary widely between different online casinos. Always read the full terms and conditions before accepting any offer to understand turnover, max bets, and expiry rules.</p>', 13
UNION ALL SELECT @sec, 7, 'question', 'text', 'What’s the difference between a deposit bonus and a no deposit bonus?', 14
UNION ALL SELECT @sec, 7, 'answer', 'richtext', '<p>A deposit bonus requires you to add funds to receive the offer, while a no deposit bonus gives you a reward without needing to deposit, but often with stricter terms and lower caps.</p>', 15
UNION ALL SELECT @sec, 8, 'question', 'text', 'Are online casino bonuses worth it?', 16
UNION ALL SELECT @sec, 8, 'answer', 'richtext', '<p>Bonuses can offer good value if the terms are fair and achievable. Use a bonus calculator to estimate the real cost and potential return before opting in.</p>', 17
UNION ALL SELECT @sec, 9, 'question', 'text', 'Can I claim more than one bonus at a time?', 18
UNION ALL SELECT @sec, 9, 'answer', 'richtext', '<p>Most casinos allow only one active bonus per account at a time. You must usually complete the current bonus before claiming a new one.</p>', 19
UNION ALL SELECT @sec, 10, 'question', 'text', 'Do bonuses expire?', 20
UNION ALL SELECT @sec, 10, 'answer', 'richtext', '<p>Yes. Most bonuses have an expiry period where you can check in their official casino website.</p>', 21
UNION ALL SELECT @sec, 11, 'question', 'text', 'What happens if I break the bonus terms by accident?', 22
UNION ALL SELECT @sec, 11, 'answer', 'richtext', '<p>If you exceed the max betting limit or play restricted games, your bonus and any winnings may be voided. Some casinos are lenient with first-time mistakes, but most enforce the rules strictly.</p>', 23
UNION ALL SELECT @sec, 12, 'question', 'text', 'Do different payment methods affect my bonus eligibility?', 24
UNION ALL SELECT @sec, 12, 'answer', 'richtext', '<p>Yes. Some bonuses exclude deposits made with certain payment types. Always check the terms to ensure your deposit qualifies.</p>', 25
UNION ALL SELECT @sec, 13, 'question', 'text', 'Why do some bonuses offer high match percentages with high turnover?', 26
UNION ALL SELECT @sec, 13, 'answer', 'richtext', '<p>Casinos use bonuses that sound good to be true to attract attention, but they often come with higher turnover. Balance is key.</p>', 27
UNION ALL SELECT @sec, 14, 'question', 'text', 'How can I tell if a bonus is unfair?', 28
UNION ALL SELECT @sec, 14, 'answer', 'richtext', '<p>Unfair bonuses often have extremely high turnover (over 50x), hidden game restrictions, or unclear terms. Use a bonus calculator and check our casino brand review to identify red flags.</p>', 29
) AS rows_to_insert WHERE @sec > 0;

UPDATE pages SET status = 'published' WHERE id = @page_id AND status = 'draft';

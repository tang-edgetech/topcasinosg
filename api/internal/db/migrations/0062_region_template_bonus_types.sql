-- The six per-type bonus pages (/{region}/bonuses/<type>) become shared
-- region pages (region-template/bonuses/<type>, see 0057), rebuilt to the
-- Figma "D / Country / TH / Bonuses - <Type>" frames: intro, how it works,
-- Key Terms table, the live bonus table with Figma's per-type columns, How
-- to Claim steps (+ the optional second block), optional Tips table, Watch
-- Out table, calculator, FAQ and Discover More. The th/my/sg type pages were
-- identical apart from the region name, so their sections are cleared; the
-- page rows stay so a region can still get its own version.

SET @hub = (SELECT p.id FROM pages p JOIN pages t ON t.id = p.parent_id AND t.slug = 'region-template' AND t.parent_id IS NULL WHERE p.slug = 'bonuses' LIMIT 1);

-- no_deposit
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @hub, 1, 'no_deposit', 'No Deposit Bonuses', 'No Deposit Bonuses {region} {year} | Top Casino Guide', 'Claim no deposit bonuses in {region} without risking your own money. Compare the latest offers, turnover rules and bonus codes, updated weekly.', 'published' FROM DUAL
WHERE @hub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @hub AND slug = 'no_deposit');
SET @page = (SELECT id FROM pages WHERE parent_id = @hub AND slug = 'no_deposit' LIMIT 1);
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'introduction_section', '', 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'No Deposit Bonuses Online Casino {region}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>A no deposit bonus is a type of online casino reward that players can claim without putting in any money. Many {regionAdj} players prefer this option because it offers a risk-free way to explore games and the casino platform before deciding to deposit. While no deposit bonuses are generally safe and reliable, players should always choose licensed and trusted casinos and read the bonus terms carefully.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'rich_text', '', 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How No Deposit Bonuses Work' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Usually no deposit bonuses are given to new players after registration and can come as free spins or small bonus money. These bonuses are easy to claim and give a chance to win real money without any initial payment.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'two_column_table', '', 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'No Deposit Bonus Key Terms You Should Know' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>To help you get started, here are some key terms you should know about no deposit bonuses, before claiming it.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Simple Explanation', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'No Deposit Bonus', 1
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>A bonus given without needing to deposit money. Usually for new players.</p>', 2
UNION ALL SELECT @sec, 2, 'left', 'text', 'Free Spins', 1
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Spins given for free on selected slot games. Often included in no deposit offers.</p>', 2
UNION ALL SELECT @sec, 3, 'left', 'text', 'Bonus Money', 1
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Free credit given to play games. May have rules before you can withdraw winnings.</p>', 2
UNION ALL SELECT @sec, 4, 'left', 'text', 'Turnover Requirement', 1
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>The amount you need to play before you can withdraw any winnings from the bonus.</p>', 2
UNION ALL SELECT @sec, 5, 'left', 'text', 'Eligible Games', 1
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>Only some games can be played using the no deposit bonus (mostly selected slot games). Other games may not count or may be restricted.</p>', 2
UNION ALL SELECT @sec, 6, 'left', 'text', 'Maximum Cashout', 1
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>The limit on how much real money you can win and withdraw from a no deposit bonus.</p>', 2
UNION ALL SELECT @sec, 7, 'left', 'text', 'Bonus Code', 1
UNION ALL SELECT @sec, 7, 'right', 'richtext', '<p>A special code you may need to enter when claiming the bonus.</p>', 2
UNION ALL SELECT @sec, 8, 'left', 'text', 'Expiry Time', 1
UNION ALL SELECT @sec, 8, 'right', 'richtext', '<p>How long the bonus lasts before it disappears. The typical validity period is anywhere from 24 to 72 hours upon activation.</p>', 2
UNION ALL SELECT @sec, 9, 'left', 'text', 'New Player Only', 1
UNION ALL SELECT @sec, 9, 'right', 'richtext', '<p>Many no deposit bonuses are only for players who just registered a new account.</p>', 2
UNION ALL SELECT @sec, 10, 'left', 'text', 'One-Time Claim', 1
UNION ALL SELECT @sec, 10, 'right', 'richtext', '<p>You can only claim a no deposit bonus using one account per person.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'bonus_listing_table', 'section--tight-top', 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Latest No Deposit Bonuses {region} (Updated Weekly)' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'no_deposit', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Safety should be your number one priority when claiming no deposit bonuses. For a risk-free claim, look through our list for recommendations.</p>', 9
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'custom', 10
UNION ALL SELECT @sec, 0, 'ctaLabel', 'text', 'Claim Here', 11
UNION ALL SELECT @sec, 1, 'column', 'text', 'details', 1
UNION ALL SELECT @sec, 1, 'label', 'text', 'No Deposit Bonus Detail', 2
UNION ALL SELECT @sec, 2, 'column', 'text', 'turnover', 1
UNION ALL SELECT @sec, 2, 'label', 'text', 'Wagering', 2
UNION ALL SELECT @sec, 3, 'column', 'text', 'maxClaim', 1
UNION ALL SELECT @sec, 3, 'label', 'text', 'Amount Max Claim', 2
UNION ALL SELECT @sec, 4, 'column', 'text', 'code', 1
UNION ALL SELECT @sec, 4, 'label', 'text', '', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'numbered_steps', '', 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Claim a No Deposit Bonus Step-by-Step' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 3
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 10
UNION ALL SELECT @sec, 1, 'title', 'text', 'Find a trusted online casino through our list', 1
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Choose a licensed and secure casino that offers no deposit bonuses from our list.</p>', 2
UNION ALL SELECT @sec, 2, 'title', 'text', 'Sign up for a new account', 1
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Click “Register” or “Sign Up” and fill in your personal details like name, email, and phone number.</p>', 2
UNION ALL SELECT @sec, 3, 'title', 'text', 'Verify your account if needed', 1
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Some casinos ask you to verify your email or phone number before the bonus is given.</p>', 2
UNION ALL SELECT @sec, 4, 'title', 'text', 'Enter a bonus code if required', 1
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>If the casino needs a promo code, enter it during signup or in the promotions section.</p>', 2
UNION ALL SELECT @sec, 5, 'title', 'text', 'Get your bonus automatically', 1
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>The no deposit bonus, either in the form of free spins or bonus money, will be added to your account after signup.</p>', 2
UNION ALL SELECT @sec, 6, 'title', 'text', 'Start playing eligible games', 1
UNION ALL SELECT @sec, 6, 'body', 'richtext', '<p>Use the bonus on the games listed in the terms, usually selected slot games.</p>', 2
UNION ALL SELECT @sec, 7, 'title', 'text', 'Check bonus rules and turnover', 1
UNION ALL SELECT @sec, 7, 'body', 'richtext', '<p>Read the terms to know how much you need to play before withdrawing any winnings.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'two_column_table', '', 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Things to Watch Out for When Claiming No Deposit Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>While no deposit bonuses may be a good option to try out a casino before committing, there are also things you should watch out for:</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'What to Watch Out For', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Simple Explanation', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '<p>Play smart by checking our list of <a href="/{regionCode}/blacklist">blacklisted casinos</a>. Make sure you check the reliability of the site, before depositing to avoid being scammed.</p>', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'High Turnover Requirements', 1
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Many no deposit bonuses have high turnover requirements.</p>', 2
UNION ALL SELECT @sec, 2, 'left', 'text', 'Low Maximum Cashout', 1
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>There''s a limit to how much real money you can win from it. The cashout limit is usually lower than other bonuses.</p>', 2
UNION ALL SELECT @sec, 3, 'left', 'text', 'Game Restrictions', 1
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Bonus usually works only on selected slots, not all games.</p>', 2
UNION ALL SELECT @sec, 4, 'left', 'text', 'Bonus Expiry Time', 1
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>You may have only 24–48 hours to use the bonus before it disappears.</p>', 2
UNION ALL SELECT @sec, 5, 'left', 'text', 'One-Time Claim Only', 1
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>No deposit bonuses can only be used once per player on an account.</p>', 2
UNION ALL SELECT @sec, 6, 'left', 'text', 'No Duplicate Accounts', 1
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>Having more than one account may lead to your bonus being removed or banned.</p>', 2
UNION ALL SELECT @sec, 7, 'left', 'text', 'Verification Required', 1
UNION ALL SELECT @sec, 7, 'right', 'richtext', '<p>You might need to confirm your phone, email, or upload ID before cashing out.</p>', 2
UNION ALL SELECT @sec, 8, 'left', 'text', 'Country Limitations', 1
UNION ALL SELECT @sec, 8, 'right', 'richtext', '<p>Some bonuses are not available for {regionAdj} players. Always check the terms.</p>', 2
UNION ALL SELECT @sec, 9, 'left', 'text', 'Bonus Codes Needed', 1
UNION ALL SELECT @sec, 9, 'right', 'richtext', '<p>Some casinos require you to enter a promo code at signup to get the bonus.</p>', 2
UNION ALL SELECT @sec, 10, 'left', 'text', 'Slow Withdrawal Process', 1
UNION ALL SELECT @sec, 10, 'right', 'richtext', '<p>Winnings from free bonuses may take longer and need full account verification.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'bonus_calculator', '', 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Bonus Calculator' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>To help estimate your winnings or how to fully utilize the bonuses you want to claim, feel free to use our bonus calculator.</p>', 3
UNION ALL SELECT @sec, 0, 'currency', 'text', '{currency}', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'faq', '', 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about No Deposit Bonuses in {region}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'What is a no deposit bonus?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>It''s a casino reward you can claim without depositing any money, usually as free spins or a small amount of bonus credit for new players. It lets you try a casino and its games before you commit your own funds.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Can I win real money from a no deposit bonus?', 2
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Yes. Winnings start as bonus money, and once you meet the turnover requirement they can be converted into real cash, up to the maximum cashout limit in the terms.</p>', 3
UNION ALL SELECT @sec, 3, 'question', 'text', 'Can I withdraw winnings from no deposit bonuses?', 2
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Yes, after you meet the turnover requirement and verify your account. Most no deposit offers cap how much you can withdraw, so check the maximum cashout before you play.</p>', 3
UNION ALL SELECT @sec, 4, 'question', 'text', 'Do all no deposit bonuses require KYC verification?', 2
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Not always to claim, but almost every licensed casino will ask you to verify your identity before your first withdrawal. Completing KYC early helps avoid delays when you cash out.</p>', 3
UNION ALL SELECT @sec, 5, 'question', 'text', 'Are no deposit bonuses safe for {regionAdj} players?', 2
UNION ALL SELECT @sec, 5, 'answer', 'richtext', '<p>They are safe when claimed from licensed, reputable casinos. Online gambling rules differ by country, so check your local regulations and avoid any site on our blacklist.</p>', 3
UNION ALL SELECT @sec, 6, 'question', 'text', 'How can I find bonuses with low turnover?', 2
UNION ALL SELECT @sec, 6, 'answer', 'richtext', '<p>Compare the wagering column in our weekly-updated table and read each offer''s terms. Anything around 20x–30x or lower is generally easier to clear than offers at 50x or more.</p>', 3
UNION ALL SELECT @sec, 7, 'question', 'text', 'Are no deposit bonuses only for new players?', 2
UNION ALL SELECT @sec, 7, 'answer', 'richtext', '<p>Mostly, yes. Some casinos also give existing players occasional no deposit rewards through loyalty programs, birthdays or special promotions.</p>', 3
UNION ALL SELECT @sec, 8, 'question', 'text', 'Are no deposit bonuses available for mobile players?', 2
UNION ALL SELECT @sec, 8, 'answer', 'richtext', '<p>Yes. If the casino works on mobile or has an app, you can usually claim and use the bonus there, and some casinos even offer mobile-only deals.</p>', 3
UNION ALL SELECT @sec, 9, 'question', 'text', 'What games can I play with my no deposit bonus?', 2
UNION ALL SELECT @sec, 9, 'answer', 'richtext', '<p>Usually selected slot games listed in the bonus terms. Table games, live casino and jackpot games are often excluded or count less towards turnover.</p>', 3
UNION ALL SELECT @sec, 10, 'question', 'text', 'Can I claim more than one no deposit bonus?', 2
UNION ALL SELECT @sec, 10, 'answer', 'richtext', '<p>You can usually claim one per casino, per person. Claiming the same offer with multiple accounts breaks the terms, but you can claim no deposit bonuses at different casinos.</p>', 3
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'cta_link_list', 'section--tight-top', 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Discover More' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'label', 'text', 'Free Spins Bonus', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/{regionCode}/bonuses/free_spins', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Welcome Bonus', 3
UNION ALL SELECT @sec, 2, 'url', 'text', '/{regionCode}/bonuses/welcome', 4
UNION ALL SELECT @sec, 3, 'label', 'text', 'Deposit Bonus', 3
UNION ALL SELECT @sec, 3, 'url', 'text', '/{regionCode}/bonuses/deposit', 4
UNION ALL SELECT @sec, 4, 'label', 'text', 'Cashback Bonus', 3
UNION ALL SELECT @sec, 4, 'url', 'text', '/{regionCode}/bonuses/cashback', 4
UNION ALL SELECT @sec, 5, 'label', 'text', 'Loyalty Bonus', 3
UNION ALL SELECT @sec, 5, 'url', 'text', '/{regionCode}/bonuses/loyalty_vip', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- free_spins
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @hub, 2, 'free_spins', 'Free Spins Bonuses', 'Free Spins Bonuses {region} {year} | Top Casino Guide', 'Find the best free spins bonuses in {region}. Compare wagering requirements, eligible slots and bonus codes from trusted casinos, updated weekly.', 'published' FROM DUAL
WHERE @hub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @hub AND slug = 'free_spins');
SET @page = (SELECT id FROM pages WHERE parent_id = @hub AND slug = 'free_spins' LIMIT 1);
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'introduction_section', '', 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Free Spins Bonuses Online Casino {region}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>A Free Spin Bonus is a popular online casino offer that gives players a set number of free spins to use on selected slot games. Free spins can be included as part of a welcome bonus or offered as a no deposit bonus to attract new players. They''re designed to let you try out slots, extend your playtime, and win real money, without spending your own cash.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'rich_text', '', 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Free Spins Work' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Free spins are casino bonuses given during sign-up, after a deposit, or through loyalty rewards. They''re usually tied to specific slot games like Sweet Bonanza or Starburst.</p><p>Any winnings from free spins are turned into bonus money, which you must meet the turnover requirements before you can withdraw. Always check the terms to know where and how to use your spins. An easy way to understand free spins is:</p><p><strong>You register and automatically receive 20 free spins. You use all 20 spins on the slot game Starburst, and you win 300 {currency}. That 300 {currency} is added to your bonus balance, not real money yet. If the casino has a 10x turnover requirement, you must bet 3,000 {currency} (300 {currency} x 10) on eligible games before you can withdraw it.</strong></p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'two_column_table', '', 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Key Terms You Should Know About Free Spins' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Simple Explanation', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Turnover Requirements', 1
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>You must bet your free spin winnings a certain number of times.</p>', 2
UNION ALL SELECT @sec, 2, 'left', 'text', 'Eligible Games', 1
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Only certain slot games can be played with your free spins. Other games might not count or be restricted.</p>', 2
UNION ALL SELECT @sec, 3, 'left', 'text', 'Maximum Cashout', 1
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>The limit on how much you can withdraw from your free spin winnings.</p>', 2
UNION ALL SELECT @sec, 4, 'left', 'text', 'Expiry Time', 1
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Free spins usually expire within 24 to 72 hours. Use them fast, or they''ll disappear.</p>', 2
UNION ALL SELECT @sec, 5, 'left', 'text', 'Bonus Conversion', 1
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>Winnings from spins are turned into bonus money, not real cash, until you meet the terms.</p>', 2
UNION ALL SELECT @sec, 6, 'left', 'text', 'Spin Value', 1
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>Each free spin has a fixed bet amount (e.g., 5 {currency} per spin). You can''t change the value.</p>', 2
UNION ALL SELECT @sec, 7, 'left', 'text', 'Free Spin Type', 1
UNION ALL SELECT @sec, 7, 'right', 'richtext', '<p>Some are no deposit free spins (just for signing up), others are given after a real money deposit.</p>', 2
UNION ALL SELECT @sec, 8, 'left', 'text', 'Max Bet Limit', 1
UNION ALL SELECT @sec, 8, 'right', 'richtext', '<p>While using free spin winnings, you may not bet over a certain amount (e.g., 20 {currency} per spin).</p>', 2
UNION ALL SELECT @sec, 9, 'left', 'text', 'Restricted Countries', 1
UNION ALL SELECT @sec, 9, 'right', 'richtext', '<p>Not all offers are available in every region. Some free spins may not be valid in {region}, and using a VPN to get around this usually breaks the casino''s terms.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'bonus_listing_table', 'section--tight-top', 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Latest Free Spin Bonuses {region} (Updated Weekly)' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'free_spins', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>We know how exciting it must be to receive free spin bonuses, so here''s a list of free spin bonuses you can claim that offers the best value to you.</p><p>Most Popular Slot Bonuses:</p>', 9
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'custom', 10
UNION ALL SELECT @sec, 0, 'ctaLabel', 'text', 'Claim Here', 11
UNION ALL SELECT @sec, 1, 'column', 'text', 'details', 1
UNION ALL SELECT @sec, 1, 'label', 'text', 'Free Spin Detail', 2
UNION ALL SELECT @sec, 2, 'column', 'text', 'turnover', 1
UNION ALL SELECT @sec, 2, 'label', 'text', '', 2
UNION ALL SELECT @sec, 3, 'column', 'text', 'eligibleGames', 1
UNION ALL SELECT @sec, 3, 'label', 'text', '', 2
UNION ALL SELECT @sec, 4, 'column', 'text', 'code', 1
UNION ALL SELECT @sec, 4, 'label', 'text', '', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'numbered_steps', '', 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Claim Free Spins Step-by-Step' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 3
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 10
UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose a trusted online casino from the table', 1
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Pick a licensed and safe casino from our recommended list or comparison table.</p>', 2
UNION ALL SELECT @sec, 2, 'title', 'text', 'Create a player account', 1
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Click the sign-up or register button and fill in your details. Usually your email, password and name.</p>', 2
UNION ALL SELECT @sec, 3, 'title', 'text', 'Verify account email or phone if required', 1
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Some casino sites may ask you to confirm your email or mobile number before giving the bonus.</p>', 2
UNION ALL SELECT @sec, 4, 'title', 'text', 'Enter bonus code if needed', 1
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Upon claiming, a bonus code may be required. Make sure to read the fine terms and make sure that you''ve applied or gotten the code before you start playing.</p>', 2
UNION ALL SELECT @sec, 5, 'title', 'text', 'Free spins credited automatically or after first deposit', 1
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Depending on the terms for the free spin, it will either be added to your account automatically or after your first deposit.</p>', 2
UNION ALL SELECT @sec, 6, 'title', 'text', 'Start playing eligible slot games', 1
UNION ALL SELECT @sec, 6, 'body', 'richtext', '<p>Use your spins on the slot titles listed in the bonus terms.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'numbered_steps', 'section--tight-top', 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Maximize your Free Spin Bonus' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 3
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 10
UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose slots with high RTP (Return to Player)', 1
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Pick slot games with RTP above 96% to improve your chances of winning.</p>', 2
UNION ALL SELECT @sec, 2, 'title', 'text', 'Look for free spin bonuses with low turnover rate', 1
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Lower turnover requirements, like 20x or 30x, make it easier to turn bonus winnings into real cash.</p>', 2
UNION ALL SELECT @sec, 3, 'title', 'text', 'Always read the bonus terms', 1
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Check the terms for game restrictions, wagering rules, expiry time, and cashout limits.</p>', 2
UNION ALL SELECT @sec, 4, 'title', 'text', 'Stack Bonuses Smartly', 1
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Combine free spin offers with deposit bonuses when possible to increase your playtime and rewards.</p>', 2
UNION ALL SELECT @sec, 5, 'title', 'text', 'Use Spins Before They Expire', 1
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Free spins often expire within 24 to 72 hours. Make sure to use them in time.</p>', 2
UNION ALL SELECT @sec, 6, 'title', 'text', 'Track your turnover progress', 1
UNION ALL SELECT @sec, 6, 'body', 'richtext', '<p>Keep an eye on how many more rounds you need to play to meet the requirements. Many casinos show a progress tracker.</p>', 2
UNION ALL SELECT @sec, 7, 'title', 'text', 'Check for Maximum Cashout Limits', 1
UNION ALL SELECT @sec, 7, 'body', 'richtext', '<p>Some free spin bonuses limit how much you can withdraw from your winnings. Always check the limit.</p>', 2
UNION ALL SELECT @sec, 8, 'title', 'text', 'Play on Mobile or Casino Apps', 1
UNION ALL SELECT @sec, 8, 'body', 'richtext', '<p>Some casinos offer mobile-exclusive free spins or promotions when you play on your phone or app.</p>', 2
UNION ALL SELECT @sec, 9, 'title', 'text', 'Sign Up for Email or SMS Notifications', 1
UNION ALL SELECT @sec, 9, 'body', 'richtext', '<p>Get early access to free spin offers by subscribing to casino updates and promotional alerts.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'two_column_table', '', 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Things to Watch Out for When Claiming Free Spins Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'What to Watch Out For', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Why It Matters', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '<p>In order to avoid getting scammed, it''s best if you make sure that the casino site you''re playing on is reliable and legitimate. Check our list of <a href="/{regionCode}/blacklist">blacklisted casinos</a> before you sign up.</p>', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Not reading turnover requirements or eligible games', 1
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>You may pick the wrong games or not meet the playthrough rules.</p>', 2
UNION ALL SELECT @sec, 2, 'left', 'text', 'Missing expiry deadlines', 1
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Free spins often expire in 24–72 hours, and you''ll lose them if not used in time.</p>', 2
UNION ALL SELECT @sec, 3, 'left', 'text', 'Trying to withdraw bonus money too early', 1
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>You must meet the turnover requirements before you can cash out any winnings.</p>', 2
UNION ALL SELECT @sec, 4, 'left', 'text', 'Using free spins on the wrong slot titles', 1
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Some spins are only valid on specific games, using them elsewhere won''t count.</p>', 2
UNION ALL SELECT @sec, 5, 'left', 'text', 'Ignoring account verification', 1
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>Not verifying your email or ID can delay or block your withdrawal.</p>', 2
UNION ALL SELECT @sec, 6, 'left', 'text', 'Exceeding max bet limits', 1
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>Betting over the allowed amount may cause you to forfeit your bonus and winnings.</p>', 2
UNION ALL SELECT @sec, 7, 'left', 'text', 'Forgetting to enter a bonus code if required', 1
UNION ALL SELECT @sec, 7, 'right', 'richtext', '<p>Without the correct code, you might not receive the free spins at all.</p>', 2
UNION ALL SELECT @sec, 8, 'left', 'text', 'Playing restricted games', 1
UNION ALL SELECT @sec, 8, 'right', 'richtext', '<p>Some games don''t count towards your turnover requirements and can cancel your bonus.</p>', 2
UNION ALL SELECT @sec, 9, 'left', 'text', 'Not checking max cashout limits', 1
UNION ALL SELECT @sec, 9, 'right', 'richtext', '<p>There may be a cap on how much you can withdraw from free spin winnings.</p>', 2
UNION ALL SELECT @sec, 10, 'left', 'text', 'Claiming from multiple accounts (bonus abuse)', 1
UNION ALL SELECT @sec, 10, 'right', 'richtext', '<p>Casinos can ban accounts or cancel winnings if abuse is detected.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'bonus_calculator', '', 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Bonus Calculator' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>If you''re unsure how much free spin bonus is available for you, use our free spin bonus calculator to estimate your rewards.</p>', 3
UNION ALL SELECT @sec, 0, 'currency', 'text', '{currency}', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'faq', '', 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Free Spins Bonuses in {region}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'Can I win real money from free spins in {region}?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>Yes. Free spin winnings are usually credited as bonus money first, and become withdrawable real cash once you meet the turnover requirement and any maximum cashout limit.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Do I need to deposit after using free spins?', 2
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Not for no deposit free spins, although some casinos ask for a small deposit before your first withdrawal. Free spins tied to a deposit offer are only credited after you deposit.</p>', 3
UNION ALL SELECT @sec, 3, 'question', 'text', 'Which slot games are best for free spins in {region}?', 2
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>You can only use spins on the slots named in the terms. Where you have a choice, games with an RTP above 96% and medium volatility give you the best chance of turning spins into winnings.</p>', 3
UNION ALL SELECT @sec, 4, 'question', 'text', 'How many times can I claim free spin bonuses in {region}?', 2
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Sign-up free spins are usually one per person per casino. Many casinos also run regular free spin promotions for existing players, such as weekly reloads or new game launches.</p>', 3
UNION ALL SELECT @sec, 5, 'question', 'text', 'Are free spins available on mobile in {region}?', 2
UNION ALL SELECT @sec, 5, 'answer', 'richtext', '<p>Yes. Most casinos let you claim and use free spins on mobile browsers or apps, and some offer mobile-exclusive spins.</p>', 3
UNION ALL SELECT @sec, 6, 'question', 'text', 'Do I need a {regionAdj} phone number or ID to claim free spins?', 2
UNION ALL SELECT @sec, 6, 'answer', 'richtext', '<p>Many casinos verify your phone number or ID to confirm you''re eligible and prevent duplicate accounts. Requirements differ by casino, so check the offer terms before signing up.</p>', 3
UNION ALL SELECT @sec, 7, 'question', 'text', 'Why are free spins limited to certain slots?', 2
UNION ALL SELECT @sec, 7, 'answer', 'richtext', '<p>Casinos use free spins to promote specific games and to control the cost of the offer. Spins used on other titles won''t count and may void the bonus.</p>', 3
UNION ALL SELECT @sec, 8, 'question', 'text', 'Do all spins have the same value?', 2
UNION ALL SELECT @sec, 8, 'answer', 'richtext', '<p>No. Each offer sets a fixed value per spin, which can differ between casinos and promotions. Check the spin value as well as the number of spins when comparing offers.</p>', 3
UNION ALL SELECT @sec, 9, 'question', 'text', 'Can I get free spins without signing up?', 2
UNION ALL SELECT @sec, 9, 'answer', 'richtext', '<p>Not for real money. You need a registered account to claim free spins, though many casinos let you try slots in demo mode without signing up.</p>', 3
UNION ALL SELECT @sec, 10, 'question', 'text', 'Are free spin bonuses safe to claim?', 2
UNION ALL SELECT @sec, 10, 'answer', 'richtext', '<p>Yes, when you claim them from licensed and trusted casinos. Gambling rules differ by country, so check your local regulations and avoid any casino on our blacklist.</p>', 3
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'cta_link_list', 'section--tight-top', 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Discover More' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'label', 'text', 'No Deposit Bonus', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/{regionCode}/bonuses/no_deposit', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Welcome Bonus', 3
UNION ALL SELECT @sec, 2, 'url', 'text', '/{regionCode}/bonuses/welcome', 4
UNION ALL SELECT @sec, 3, 'label', 'text', 'Deposit Bonus', 3
UNION ALL SELECT @sec, 3, 'url', 'text', '/{regionCode}/bonuses/deposit', 4
UNION ALL SELECT @sec, 4, 'label', 'text', 'Cashback Bonus', 3
UNION ALL SELECT @sec, 4, 'url', 'text', '/{regionCode}/bonuses/cashback', 4
UNION ALL SELECT @sec, 5, 'label', 'text', 'Loyalty Bonus', 3
UNION ALL SELECT @sec, 5, 'url', 'text', '/{regionCode}/bonuses/loyalty_vip', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- welcome
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @hub, 3, 'welcome', 'Welcome Bonuses', 'Welcome Bonuses {region} {year} | Top Casino Guide', 'Compare the best casino welcome bonuses in {region}. Check match rates, turnover, minimum deposits and bonus codes from trusted casinos, updated weekly.', 'published' FROM DUAL
WHERE @hub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @hub AND slug = 'welcome');
SET @page = (SELECT id FROM pages WHERE parent_id = @hub AND slug = 'welcome' LIMIT 1);
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'introduction_section', '', 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Welcome Bonuses Online Casino {region}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>A welcome bonus is a special reward that online casinos give to new players when they sign up and make their first deposit. It''s a way to say “thank you” for joining. The bonus can come as extra cash, free spins, or a mix of both, depending on the casino.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'rich_text', '', 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Welcome Bonuses Work' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>A welcome bonus is a special offer that online casinos give to new players when they make their first deposit. It''s usually a match bonus, meaning the casino will match your deposit by a percentage. Usually, the percentage would be 100% but some casinos go as high as 300%.</p><p>Here''s a simple example of how welcome bonuses work:</p><p><strong>100% welcome bonus up to 3,000 {currency}. If you deposit 3,000 {currency}, you''ll get an extra 3,000 {currency} in bonus funds, so you have 6,000 {currency} to play with.</strong></p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'two_column_table', '', 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Key Terms You Should Know About Welcome Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>We understand that it can be hard to understand the terms, especially if you''re a new player. Here''s a guide on the key terms you should know when it comes to welcome bonuses.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Simple Explanation', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Turnover Requirements', 1
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>The amount of money you need to bet before you can withdraw your bonus winnings.</p>', 2
UNION ALL SELECT @sec, 2, 'left', 'text', 'Minimum Deposit', 1
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>The smallest amount of money you need to deposit to get the welcome bonus.</p>', 2
UNION ALL SELECT @sec, 3, 'left', 'text', 'Eligible Games', 1
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Not all games count towards the turnover. Some bonuses only work on certain slots or games.</p>', 2
UNION ALL SELECT @sec, 4, 'left', 'text', 'Bonus Expiry Time', 1
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>The time limit to use your bonus or free spins before they disappear. It is usually 7 to 30 days.</p>', 2
UNION ALL SELECT @sec, 5, 'left', 'text', 'Bonus Code', 1
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>A special code you may need to enter during signup or deposit to unlock your welcome bonus.</p>', 2
UNION ALL SELECT @sec, 6, 'left', 'text', 'Deposit Match percentage', 1
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>The percentage of your deposit the casino gives you as a bonus. For example, 100% = double your money.</p>', 2
UNION ALL SELECT @sec, 7, 'left', 'text', 'Free Spins', 1
UNION ALL SELECT @sec, 7, 'right', 'richtext', '<p>Some welcome bonuses include free slot spins. These are usually limited to certain slot games.</p>', 2
UNION ALL SELECT @sec, 8, 'left', 'text', 'Max Bonus Amount', 1
UNION ALL SELECT @sec, 8, 'right', 'richtext', '<p>The highest amount of bonus money you can get, no matter how much you deposit.</p>', 2
UNION ALL SELECT @sec, 9, 'left', 'text', 'Game Contribution Percentage', 1
UNION ALL SELECT @sec, 9, 'right', 'richtext', '<p>Games like slots usually contribute 100% towards turnover, others may contribute less.</p>', 2
UNION ALL SELECT @sec, 10, 'left', 'text', 'Withdrawal Limit', 1
UNION ALL SELECT @sec, 10, 'right', 'richtext', '<p>Some welcome bonuses limit how much real money you can cash out from your bonus winnings.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'bonus_listing_table', 'section--tight-top', 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Latest Welcome Bonuses {region} (Updated Weekly)' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'welcome', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Start your online casino journey now and explore the sites that offer you the best welcome bonus.</p>', 9
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'custom', 10
UNION ALL SELECT @sec, 0, 'ctaLabel', 'text', 'Claim Here', 11
UNION ALL SELECT @sec, 1, 'column', 'text', 'details', 1
UNION ALL SELECT @sec, 1, 'label', 'text', 'Welcome Bonus Detail', 2
UNION ALL SELECT @sec, 2, 'column', 'text', 'turnover', 1
UNION ALL SELECT @sec, 2, 'label', 'text', '', 2
UNION ALL SELECT @sec, 3, 'column', 'text', 'minDeposit', 1
UNION ALL SELECT @sec, 3, 'label', 'text', '', 2
UNION ALL SELECT @sec, 4, 'column', 'text', 'code', 1
UNION ALL SELECT @sec, 4, 'label', 'text', '', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'numbered_steps', '', 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Claim a Welcome Bonus Step-by-Step' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 3
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 10
UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose a trusted online casino', 1
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Pick a safe and licensed casino that accepts {regionAdj} players and supports local payments.</p>', 2
UNION ALL SELECT @sec, 2, 'title', 'text', 'Register a new account', 1
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Sign up by providing basic details like your name, email, and phone number.</p>', 2
UNION ALL SELECT @sec, 3, 'title', 'text', 'Make a deposit', 1
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Add money using a payment method the casino allows, like local banks or e-wallets.</p>', 2
UNION ALL SELECT @sec, 4, 'title', 'text', 'Enter the bonus code (if needed)', 1
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Some casinos require a special code to unlock the welcome bonus. Check the offer details.</p>', 2
UNION ALL SELECT @sec, 5, 'title', 'text', 'Receive your bonus', 1
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Your bonus will be added to your account right away or after the casino confirms your deposit.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'two_column_table', '', 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Tips for Maximizing Welcome Bonuses Value' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'How To Maximize Your Welcome Bonus', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Explanation', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Deposit just enough to maximize the bonus', 1
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Put in the amount needed to get the full bonus, no more or less.</p>', 2
UNION ALL SELECT @sec, 2, 'left', 'text', 'Choose casinos with low turnover requirements', 1
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Pick casinos where you don''t have to play a lot to clear the bonus.</p>', 2
UNION ALL SELECT @sec, 3, 'left', 'text', 'Check which games count 100% toward turnover', 1
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Play games that fully count to meet bonus rules faster. Usually, slot games are the best when it comes to meeting turnover requirements.</p>', 2
UNION ALL SELECT @sec, 4, 'left', 'text', 'Don''t claim bonuses you can''t meet the terms for', 1
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Only take bonuses you can complete the rules for, to avoid losing it.</p>', 2
UNION ALL SELECT @sec, 5, 'left', 'text', 'Keep track of bonus expiry dates', 1
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>Most bonuses have expiry dates, remember to use it once you''ve activated to avoid it being expired.</p>', 2
UNION ALL SELECT @sec, 6, 'left', 'text', 'Avoid playing excluded games', 1
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>Some games don''t count toward the bonus, check the list first before playing.</p>', 2
UNION ALL SELECT @sec, 7, 'left', 'text', 'Play carefully to avoid big losses', 1
UNION ALL SELECT @sec, 7, 'right', 'richtext', '<p>Manage your bets to make your bonus last longer. Play smart, win more.</p>', 2
UNION ALL SELECT @sec, 8, 'left', 'text', 'Combine welcome bonus with free spins if possible', 1
UNION ALL SELECT @sec, 8, 'right', 'richtext', '<p>Use both to get more chances to win. Remember to check the fine print to see if stacking of bonuses are allowed.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'two_column_table', '', 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Things to Watch Out for When Claiming Welcome Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'What to Watch Out For', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Simple Explanation (For {regionAdj} players)', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '<p>Play smart and win more by depositing only at casinos that are reliable and trusted. Always check for licensing before depositing to avoid getting scammed. You can also check out our <a href="/{regionCode}/blacklist">blacklisted casino list</a> to avoid getting played.</p>', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Missing bonus code during deposit', 1
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>If a bonus code is needed and you don''t enter it, you won''t get the bonus. Always check the promotion page.</p>', 2
UNION ALL SELECT @sec, 2, 'left', 'text', 'Depositing less than the minimum amount', 1
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Some bonuses require a minimum deposit. Deposit the right amount to claim the bonus.</p>', 2
UNION ALL SELECT @sec, 3, 'left', 'text', 'Trying to cash out before meeting turnover', 1
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>You must meet the turnover rules before you can withdraw money. Cashing out early may cancel the bonus.</p>', 2
UNION ALL SELECT @sec, 4, 'left', 'text', 'Playing the wrong games', 1
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Some games (like table games) don''t count for bonuses. Always check which games are allowed.</p>', 2
UNION ALL SELECT @sec, 5, 'left', 'text', 'Not checking bonus expiry date', 1
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>Welcome bonuses often expire in 7–30 days. Use it in time or lose it.</p>', 2
UNION ALL SELECT @sec, 6, 'left', 'text', 'Using e-wallets that are excluded', 1
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>Some casinos serving {regionAdj} players don''t allow bonuses for e-wallet deposits. Check payment terms before depositing.</p>', 2
UNION ALL SELECT @sec, 7, 'left', 'text', 'Creating more than one account', 1
UNION ALL SELECT @sec, 7, 'right', 'richtext', '<p>Casinos may block players who try to claim bonuses using multiple accounts. Stick to one account.</p>', 2
UNION ALL SELECT @sec, 8, 'left', 'text', 'Ignoring full bonus terms', 1
UNION ALL SELECT @sec, 8, 'right', 'richtext', '<p>Always read the full terms, in English or your local language, before claiming. It helps you avoid losing your bonus.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'bonus_calculator', '', 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Bonus Calculator' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Unsure how to calculate your welcome bonus based on their terms? Use our bonus calculator and estimate your rewards.</p>', 3
UNION ALL SELECT @sec, 0, 'currency', 'text', '{currency}', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'faq', '', 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Welcome Bonuses in {region}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'What is a welcome bonus at an online casino?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>It''s a reward for new players, usually given on the first deposit. Most welcome bonuses match your deposit by a percentage and may include free spins.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'What is the best welcome bonus available in {region}?', 2
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>The best offer isn''t always the biggest one. Look for a fair turnover requirement, a reasonable minimum deposit and a long enough expiry period, and compare current offers in our weekly-updated table.</p>', 3
UNION ALL SELECT @sec, 3, 'question', 'text', 'Can I combine a welcome bonus with free spins?', 2
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Many welcome packages already include free spins. Stacking separate offers depends on the casino, so check the terms to see whether bonuses can be combined.</p>', 3
UNION ALL SELECT @sec, 4, 'question', 'text', 'Do I need to use a bonus code to claim the welcome bonus?', 2
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Some casinos require one, others credit the bonus automatically when you make your first deposit. Check the offer details or our table before you deposit.</p>', 3
UNION ALL SELECT @sec, 5, 'question', 'text', 'How fast are welcome bonuses credited to my account?', 2
UNION ALL SELECT @sec, 5, 'answer', 'richtext', '<p>Most are credited instantly after your deposit is confirmed. Some casinos take a few hours or need you to opt in or contact support first.</p>', 3
UNION ALL SELECT @sec, 6, 'question', 'text', 'Do welcome bonuses expire if not used?', 2
UNION ALL SELECT @sec, 6, 'answer', 'richtext', '<p>Yes. Welcome bonuses usually need to be used and their turnover completed within 7 to 30 days, or the bonus and related winnings are removed.</p>', 3
UNION ALL SELECT @sec, 7, 'question', 'text', 'Are welcome bonuses available on mobile devices?', 2
UNION ALL SELECT @sec, 7, 'answer', 'richtext', '<p>Yes. You can usually sign up, deposit and claim the welcome bonus on a mobile browser or casino app just as you would on desktop.</p>', 3
UNION ALL SELECT @sec, 8, 'question', 'text', 'Which games can I play with my welcome bonus?', 2
UNION ALL SELECT @sec, 8, 'answer', 'richtext', '<p>Slots usually count 100% towards turnover. Table games, live casino and jackpot games often count less or are excluded, so check the bonus terms.</p>', 3
UNION ALL SELECT @sec, 9, 'question', 'text', 'Can I withdraw money from my welcome bonus right away?', 2
UNION ALL SELECT @sec, 9, 'answer', 'richtext', '<p>No. You need to meet the turnover requirement before bonus funds or related winnings can be withdrawn, and some offers also cap the amount you can cash out.</p>', 3
UNION ALL SELECT @sec, 10, 'question', 'text', 'What happens if I deposit less than the required amount?', 2
UNION ALL SELECT @sec, 10, 'answer', 'richtext', '<p>The bonus usually won''t be activated, and most casinos won''t add it afterwards. Check the minimum deposit before you pay in.</p>', 3
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'cta_link_list', 'section--tight-top', 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Discover More' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'label', 'text', 'No Deposit Bonus', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/{regionCode}/bonuses/no_deposit', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Free Spins Bonus', 3
UNION ALL SELECT @sec, 2, 'url', 'text', '/{regionCode}/bonuses/free_spins', 4
UNION ALL SELECT @sec, 3, 'label', 'text', 'Deposit Bonus', 3
UNION ALL SELECT @sec, 3, 'url', 'text', '/{regionCode}/bonuses/deposit', 4
UNION ALL SELECT @sec, 4, 'label', 'text', 'Cashback Bonus', 3
UNION ALL SELECT @sec, 4, 'url', 'text', '/{regionCode}/bonuses/cashback', 4
UNION ALL SELECT @sec, 5, 'label', 'text', 'Loyalty Bonus', 3
UNION ALL SELECT @sec, 5, 'url', 'text', '/{regionCode}/bonuses/loyalty_vip', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- deposit
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @hub, 4, 'deposit', 'Deposit Bonuses', 'Deposit Bonuses {region} {year} | Top Casino Guide', 'Compare the best casino deposit bonuses in {region}. Check match rates, turnover, minimum deposits and bonus codes from trusted casinos, updated weekly.', 'published' FROM DUAL
WHERE @hub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @hub AND slug = 'deposit');
SET @page = (SELECT id FROM pages WHERE parent_id = @hub AND slug = 'deposit' LIMIT 1);
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'introduction_section', '', 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Deposit Bonuses Online Casino {region}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>A deposit bonus is a reward you get when you add money to your casino account. It can come as extra cash, free spins, or both. While most deposit bonuses are for new players, many online casinos also offer deposit bonuses for its regular members. It''s a fun way to get more to play with every time you make a deposit. Check our top casino picks to find the best deposit bonus deals today.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'rich_text', '', 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Deposit Bonuses Work' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Online casinos have their own set of terms when it comes to deposit bonuses. Depending on the casino, deposit bonuses are either credited into your account automatically or you may need to claim it. However, turnover rates may apply. An easy way to understand deposit bonus is:</p><p><strong>100% deposit bonus up to 3,000 {currency}. If you deposit 3,000 {currency}, you''ll get an extra 3,000 {currency} in bonus funds, so you have 6,000 {currency} to play with.</strong></p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'two_column_table', '', 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Key Terms You Should Know About Deposit Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>We understand that some of the terms can be confusing and we''re here to help. Here are the key terms you should know about deposit bonuses.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Simple Explanation', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Turnover Requirements', 1
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>The number of times you need to bet the bonus (or bonus + deposit) before you can withdraw any winnings. Example: 30 x 1,000 {currency} = 30,000 {currency} in bets needed.</p>', 2
UNION ALL SELECT @sec, 2, 'left', 'text', 'Eligible deposit amount', 1
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>The minimum deposit amount required to claim the bonus. Some promotions only work if you deposit a specific amount.</p>', 2
UNION ALL SELECT @sec, 3, 'left', 'text', 'Bonus validity period', 1
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>The time limit for using the bonus and meeting all requirements. If you don''t act in time, the bonus will expire, and you will not be able to withdraw your winnings.</p>', 2
UNION ALL SELECT @sec, 4, 'left', 'text', 'Eligible games', 1
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>This refers to the type of games you can play in order to activate or claim your bonus.</p>', 2
UNION ALL SELECT @sec, 5, 'left', 'text', 'Maximum cashout limit', 1
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>The most you can withdraw from your bonus winnings. If the limit is 500 {currency} and you win 1,000 {currency}, only 500 {currency} can be cashed out.</p>', 2
UNION ALL SELECT @sec, 6, 'left', 'text', 'Bonus Code / Promo Code', 1
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>A special code you enter during deposit or registration to claim a specific bonus offer. No code = no bonus in some cases.</p>', 2
UNION ALL SELECT @sec, 7, 'left', 'text', 'Minimum Bet Requirement', 1
UNION ALL SELECT @sec, 7, 'right', 'richtext', '<p>The lowest amount you can bet per spin or round while using a bonus. Betting too high might void your bonus.</p>', 2
UNION ALL SELECT @sec, 8, 'left', 'text', 'Bonus Abuse Policy', 1
UNION ALL SELECT @sec, 8, 'right', 'richtext', '<p>Rules set by casinos to prevent cheating. If you try to exploit the bonus (like betting patterns or multiple accounts), you can be banned.</p>', 2
UNION ALL SELECT @sec, 9, 'left', 'text', 'Bonus Cap', 1
UNION ALL SELECT @sec, 9, 'right', 'richtext', '<p>The maximum bonus amount you can receive. For example, 100% up to 300 {currency} means the bonus will not exceed 300 {currency}.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'bonus_listing_table', 'section--tight-top', 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Latest Deposit Bonuses {region} (Updated Weekly)' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'deposit', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Time to activate your deposit bonus and win more. To understand which deposit bonuses are worth it, check it out here.</p>', 9
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'custom', 10
UNION ALL SELECT @sec, 0, 'ctaLabel', 'text', 'Claim Here', 11
UNION ALL SELECT @sec, 1, 'column', 'text', 'details', 1
UNION ALL SELECT @sec, 1, 'label', 'text', 'Deposit Bonus Detail', 2
UNION ALL SELECT @sec, 2, 'column', 'text', 'turnover', 1
UNION ALL SELECT @sec, 2, 'label', 'text', '', 2
UNION ALL SELECT @sec, 3, 'column', 'text', 'minDeposit', 1
UNION ALL SELECT @sec, 3, 'label', 'text', '', 2
UNION ALL SELECT @sec, 4, 'column', 'text', 'code', 1
UNION ALL SELECT @sec, 4, 'label', 'text', '', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'numbered_steps', '', 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Claim a Deposit Bonus Step-by-Step' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>To fully utilize the deposit bonuses offered by the online casino sites, here''s a step-by-step guide:</p>', 3
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 10
UNION ALL SELECT @sec, 1, 'title', 'text', 'Sign Up or Log In', 1
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Create a new casino account or log into your existing one.</p>', 2
UNION ALL SELECT @sec, 2, 'title', 'text', 'Choose a Deposit Bonus Offer', 1
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Browse the promotions available and look for welcome bonuses, reload bonuses, or combo offers with free spins.</p>', 2
UNION ALL SELECT @sec, 3, 'title', 'text', 'Opt-In (If Required)', 1
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Some casinos ask you to opt-in to claim the bonus. You might do this on the promo page, in your account, or with their live chat support.</p>', 2
UNION ALL SELECT @sec, 4, 'title', 'text', 'Make a deposit', 1
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Deposit the minimum amount required to claim the bonus. Higher deposits may unlock bigger rewards.</p>', 2
UNION ALL SELECT @sec, 5, 'title', 'text', 'Receive your bonus instantly', 1
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Your bonus cash and/or free spins are usually credited right after your deposit. Some casinos add them within a few hours.</p>', 2
UNION ALL SELECT @sec, 6, 'title', 'text', 'Play Eligible Games', 1
UNION ALL SELECT @sec, 6, 'body', 'richtext', '<p>Remember to check the terms and conditions for games that allow you to use the claimed rewards.</p>', 2
UNION ALL SELECT @sec, 7, 'title', 'text', 'Meet turnover requirements', 1
UNION ALL SELECT @sec, 7, 'body', 'richtext', '<p>If the bonus has wagering (e.g., 30x the bonus), you''ll need to play through that amount before you can withdraw your winnings.</p>', 2
UNION ALL SELECT @sec, 8, 'title', 'text', 'Withdraw Your Winnings', 1
UNION ALL SELECT @sec, 8, 'body', 'richtext', '<p>Once all requirements are met, you can cash out your winnings or keep playing with your bonus boost!</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'numbered_steps', 'section--tight-top', 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Tips for Maximizing Deposit Bonuses Value' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 3
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 10
UNION ALL SELECT @sec, 1, 'title', 'text', 'Deposit just enough to get the maximum match', 1
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Don''t over-deposit. If the bonus is 100% up to 3,000 {currency}, deposit 3,000 {currency} to get the full reward.</p>', 2
UNION ALL SELECT @sec, 2, 'title', 'text', 'Choose casinos with low turnover requirements', 1
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>The lower the turnover, the easier it is to withdraw winnings. Check out our list of casinos here.</p>', 2
UNION ALL SELECT @sec, 3, 'title', 'text', 'Play games that contribute 100% to turnover requirement', 1
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Focus on slot games or games that fully count toward clearing your bonus.</p>', 2
UNION ALL SELECT @sec, 4, 'title', 'text', 'Track your bonus expiry date', 1
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Most bonuses have an expiry date ranging from 7 to 30 days. Set a reminder to use it in time.</p>', 2
UNION ALL SELECT @sec, 5, 'title', 'text', 'Use bonus codes if needed', 1
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Some casinos require a promo code during signup or deposit to activate your bonus.</p>', 2
UNION ALL SELECT @sec, 6, 'title', 'text', 'Start with small bets', 1
UNION ALL SELECT @sec, 6, 'body', 'richtext', '<p>Start by betting low. It gives you more time to meet your turnover requirement without risking big losses.</p>', 2
UNION ALL SELECT @sec, 7, 'title', 'text', 'Avoid restricted games', 1
UNION ALL SELECT @sec, 7, 'body', 'richtext', '<p>Check the bonus terms. Some games like jackpots or table games may not be allowed.</p>', 2
UNION ALL SELECT @sec, 8, 'title', 'text', 'Stick to one bonus at a time', 1
UNION ALL SELECT @sec, 8, 'body', 'richtext', '<p>Multiple bonuses can get confusing. Focus on one to stay on track and avoid violating terms.</p>', 2
UNION ALL SELECT @sec, 9, 'title', 'text', 'Track your turnover progress', 1
UNION ALL SELECT @sec, 9, 'body', 'richtext', '<p>Use the casino''s bonus tracker to know how close you are to meeting the requirements.</p>', 2
UNION ALL SELECT @sec, 10, 'title', 'text', 'Read bonus terms and player reviews first', 1
UNION ALL SELECT @sec, 10, 'body', 'richtext', '<p>Don''t just grab any offer. Make sure the bonuses come with fair terms and positive feedback from other players.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'two_column_table', '', 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Things to Watch Out for When Claiming Deposit Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'What to Watch Out For', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Why It Matters', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '<p>Make sure that the casino you''ve chosen is safe and secure, check out our list of <a href="/{regionCode}/blacklist">blacklisted casinos</a> to avoid getting scammed.</p>', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Forgetting to enter the bonus code', 1
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Some bonuses require a promo or bonus code during signup or deposit. If you miss it, you won''t get the bonus.</p>', 2
UNION ALL SELECT @sec, 2, 'left', 'text', 'Depositing less than the minimum required', 1
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Every bonus has a minimum deposit amount. If you deposit less than the required amount (e.g., 50 {currency}), the bonus won''t be activated.</p>', 2
UNION ALL SELECT @sec, 3, 'left', 'text', 'Trying to withdraw before completing the turnover requirements', 1
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>You must meet the wagering requirements first. If you try to withdraw early, the casino may cancel your bonus and any winnings.</p>', 2
UNION ALL SELECT @sec, 4, 'left', 'text', 'Playing games that are not allowed', 1
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Not all games count toward the bonus. Some games (like jackpots or certain table games) are excluded and can void your bonus if you play them.</p>', 2
UNION ALL SELECT @sec, 5, 'left', 'text', 'Betting more than the allowed amount', 1
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>Most bonuses have a max bet limit (e.g., 20 {currency} per spin) while the bonus is active. Going over this limit can cancel your bonus.</p>', 2
UNION ALL SELECT @sec, 6, 'left', 'text', 'Letting the bonus expire', 1
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>Deposit bonuses usually come with a time limit (7–30 days). If you don''t complete the requirements in time, the bonus and winnings will be removed.</p>', 2
UNION ALL SELECT @sec, 7, 'left', 'text', 'Using multiple accounts to claim the same bonus', 1
UNION ALL SELECT @sec, 7, 'right', 'richtext', '<p>Casinos strictly ban bonus abuse. Creating more than one account to claim extra bonuses can get you banned or blacklisted.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'bonus_calculator', '', 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Bonus Calculator' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>If you''re unsure how much deposit bonus is available for you, use our free deposit bonus calculator to estimate your rewards.</p>', 3
UNION ALL SELECT @sec, 0, 'currency', 'text', '{currency}', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'faq', '', 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Deposit Bonuses in {region}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'Can I claim multiple deposit bonuses?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>Yes, over time. Many casinos offer a welcome package across several deposits plus reload bonuses, but usually only one bonus can be active on your account at a time.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Do deposit bonuses expire?', 2
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Yes. Most deposit bonuses must be used and their turnover completed within 7 to 30 days, after which the bonus and any related winnings are removed.</p>', 3
UNION ALL SELECT @sec, 3, 'question', 'text', 'What games are eligible?', 2
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Slots usually count 100% towards turnover. Table games, live casino and jackpot games often count less or are excluded, so check the bonus terms before you play.</p>', 3
UNION ALL SELECT @sec, 4, 'question', 'text', 'Can mobile users claim deposit bonuses too?', 2
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Yes. Deposit bonuses can usually be claimed on mobile browsers and casino apps in the same way as on desktop.</p>', 3
UNION ALL SELECT @sec, 5, 'question', 'text', 'Is it safe to claim deposit bonuses in {region}?', 2
UNION ALL SELECT @sec, 5, 'answer', 'richtext', '<p>It is safe when you use licensed, reputable casinos and read the terms first. Gambling rules differ by country, so check your local regulations and avoid casinos on our blacklist.</p>', 3
UNION ALL SELECT @sec, 6, 'question', 'text', 'Do I need a promo code to claim a deposit bonus?', 2
UNION ALL SELECT @sec, 6, 'answer', 'richtext', '<p>Some casinos require one, others credit the bonus automatically or ask you to opt in. Check the promotion page or our table for any required code before you deposit.</p>', 3
UNION ALL SELECT @sec, 7, 'question', 'text', 'What happens if I cancel a deposit bonus?', 2
UNION ALL SELECT @sec, 7, 'answer', 'richtext', '<p>Cancelling usually removes the bonus funds and any winnings made with them. Your remaining real-money balance is normally kept, but check the casino''s terms first.</p>', 3
UNION ALL SELECT @sec, 8, 'question', 'text', 'Can I still withdraw my deposit if I don''t want the bonus?', 2
UNION ALL SELECT @sec, 8, 'answer', 'richtext', '<p>Usually yes, if you decline or cancel the bonus before you start playing with it. Once a bonus is active, your deposit may be locked until the turnover is met.</p>', 3
UNION ALL SELECT @sec, 9, 'question', 'text', 'Can I use bank transfer or e-Wallet for deposit bonuses?', 2
UNION ALL SELECT @sec, 9, 'answer', 'richtext', '<p>Most casinos accept both, but some exclude certain e-wallets or payment methods from bonus offers. Check the payment terms in the promotion before depositing.</p>', 3
UNION ALL SELECT @sec, 10, 'question', 'text', 'Why didn''t I receive my deposit bonus?', 2
UNION ALL SELECT @sec, 10, 'answer', 'richtext', '<p>Common reasons are a missed bonus code, depositing below the minimum, not opting in, or using an excluded payment method. If none apply, contact the casino''s live chat support.</p>', 3
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'cta_link_list', 'section--tight-top', 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Discover More' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'label', 'text', 'No Deposit Bonus', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/{regionCode}/bonuses/no_deposit', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Free Spins Bonus', 3
UNION ALL SELECT @sec, 2, 'url', 'text', '/{regionCode}/bonuses/free_spins', 4
UNION ALL SELECT @sec, 3, 'label', 'text', 'Welcome Bonus', 3
UNION ALL SELECT @sec, 3, 'url', 'text', '/{regionCode}/bonuses/welcome', 4
UNION ALL SELECT @sec, 4, 'label', 'text', 'Cashback Bonus', 3
UNION ALL SELECT @sec, 4, 'url', 'text', '/{regionCode}/bonuses/cashback', 4
UNION ALL SELECT @sec, 5, 'label', 'text', 'Loyalty Bonus', 3
UNION ALL SELECT @sec, 5, 'url', 'text', '/{regionCode}/bonuses/loyalty_vip', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- cashback
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @hub, 5, 'cashback', 'Cashback Bonuses', 'Cashback Bonuses {region} {year} | Top Casino Guide', 'Get money back on your losses with the best cashback bonuses in {region}. Compare cashback rates, turnover and payment cycles, updated weekly.', 'published' FROM DUAL
WHERE @hub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @hub AND slug = 'cashback');
SET @page = (SELECT id FROM pages WHERE parent_id = @hub AND slug = 'cashback' LIMIT 1);
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'introduction_section', '', 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Cashback Bonuses Online Casino {region}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>Think of cashback bonuses like a safety net. It gives players back a percentage of their net losses over a set time. These bonuses are usually offered either through cash or credits, to help you recover and manage your losses. We always highlight the best cashback offers so you can play with confidence, even when luck takes a break.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'rich_text', '', 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Cashback Bonuses Work' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Each online casino has their own set of terms when it comes to cashback bonuses. Depending on the casino, cashback bonuses are either credited into your account automatically or you may need to claim it. However, turnover rates may apply. An easy way to understand cashback bonus is:</p><p><strong>Lose 10,000 {currency} → get 10% cashback = 1,000 {currency} you will be receiving as cashback bonus</strong></p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'two_column_table', '', 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Key Terms You Should Know About Cashback Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>We understand that some of the terms can be confusing and we''re here to help. Here are the key terms you should know about cashback bonuses.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Simple Explanation', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Cashback Percentage', 1
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>The % of your losses you get back, usually between 5% and 25%.</p>', 2
UNION ALL SELECT @sec, 2, 'left', 'text', 'Net Loss Definition', 1
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>How much you lost after taking out your winnings.</p>', 2
UNION ALL SELECT @sec, 3, 'left', 'text', 'Cashback turnover', 1
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Sometimes you need to play with the bonus money a few times before you can withdraw it.</p>', 2
UNION ALL SELECT @sec, 4, 'left', 'text', 'Payment Cycle', 1
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Cashback is paid on a daily, weekly, or monthly basis.</p>', 2
UNION ALL SELECT @sec, 5, 'left', 'text', 'Real vs Bonus Cashback', 1
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>Real cash allows instant withdrawal, bonus cash may have terms and conditions applied.</p>', 2
UNION ALL SELECT @sec, 6, 'left', 'text', 'Minimum Loss Requirement', 1
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>You need to lose a certain amount to get cashback.</p>', 2
UNION ALL SELECT @sec, 7, 'left', 'text', 'Maximum Cashback Limit', 1
UNION ALL SELECT @sec, 7, 'right', 'richtext', '<p>The most amount of credit or cash you can claim, no matter how much you lost.</p>', 2
UNION ALL SELECT @sec, 8, 'left', 'text', 'Eligible Games', 1
UNION ALL SELECT @sec, 8, 'right', 'richtext', '<p>Depending on each online casino site, usually slot games offer cashback bonuses.</p>', 2
UNION ALL SELECT @sec, 9, 'left', 'text', 'Opt-in Required', 1
UNION ALL SELECT @sec, 9, 'right', 'richtext', '<p>You might need to click or activate the bonus before playing.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'bonus_listing_table', 'section--tight-top', 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Latest Cashback Bonuses {region} (Updated Weekly)' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'cashback', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>To activate your cashback bonus, check out this list that''s updated weekly for all your claiming pleasures.</p>', 9
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'custom', 10
UNION ALL SELECT @sec, 0, 'ctaLabel', 'text', 'Claim Here', 11
UNION ALL SELECT @sec, 1, 'column', 'text', 'details', 1
UNION ALL SELECT @sec, 1, 'label', 'text', 'Cashback Bonus Detail', 2
UNION ALL SELECT @sec, 2, 'column', 'text', 'turnover', 1
UNION ALL SELECT @sec, 2, 'label', 'text', '', 2
UNION ALL SELECT @sec, 3, 'column', 'text', 'minDeposit', 1
UNION ALL SELECT @sec, 3, 'label', 'text', '', 2
UNION ALL SELECT @sec, 4, 'column', 'text', 'code', 1
UNION ALL SELECT @sec, 4, 'label', 'text', '', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'numbered_steps', '', 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Claim a Cashback Bonus Step-by-Step' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Claiming cashback bonuses can be tricky, but with our step-by-step path getting lost money back becomes easy.</p>', 3
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 10
UNION ALL SELECT @sec, 1, 'title', 'text', 'Pick the Right Casino', 1
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Browse our top-rated online casinos that offer reliable cashback bonuses. We review the % rate, payout speed, and terms so you don''t have to.</p>', 2
UNION ALL SELECT @sec, 2, 'title', 'text', 'Sign Up or Log In', 1
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Create an account or log in to your existing one. Make sure your details are accurate to avoid any payment delays.</p>', 2
UNION ALL SELECT @sec, 3, 'title', 'text', 'Activate the Cashback Offer', 1
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Find the cashback promo in your account or promo page and click “Opt In” or “Activate.” No opt-in = no cashback!</p>', 2
UNION ALL SELECT @sec, 4, 'title', 'text', 'Play Eligible Games', 1
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Most cashback bonuses apply to slots, but always check the casino''s terms. Check out the list of casinos that offer cashback bonuses here.</p>', 2
UNION ALL SELECT @sec, 5, 'title', 'text', 'Wait for the Bonus Cycle to End', 1
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Depending on the offer, cashback is calculated daily, weekly, or monthly based on your net losses.</p>', 2
UNION ALL SELECT @sec, 6, 'title', 'text', 'Cashback Is Credited', 1
UNION ALL SELECT @sec, 6, 'body', 'richtext', '<p>Once the cycle ends, your cashback will be credited, either as real money or bonus funds. Remember to check the turnover requirements if any.</p>', 2
UNION ALL SELECT @sec, 7, 'title', 'text', 'Play More or Cash Out', 1
UNION ALL SELECT @sec, 7, 'body', 'richtext', '<p>Use your cashback to keep playing or withdraw it, depending on the bonus type. Either way, it''s money back in your pocket.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'rich_text', 'section--tight-top', 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Maximize your Cashback Benefits' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Cashback bonuses help with your losses, keeping you playing longer. Here''s how to get the most from them:</p><ul><li>Pick casinos with high cashback rates (5%–25%), better if they offer cash.</li><li>Play games that count 100% towards cashback to maximize rewards.</li><li>Always opt-in to activate your cashback bonus.</li><li>Know the casino''s net loss tracking cycle. Find out if it''s daily, weekly, or monthly so you can time your play accordingly.</li><li>Use cashback offers during other promotions to stack bonuses for extra value if allowed.</li><li>Read the terms carefully for turnover requirements, eligible games, and payout rules.</li><li>Track your net losses to see how much cashback you can expect.</li></ul><p>Check our updated reviews to find the best cashback deals and play smarter.</p>', 2
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', 4
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'surface-muted', 5
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'surface-muted', 6
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'two_column_table', '', 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Things to Watch Out for When Claiming Cashback Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Cashback may sound rewarding with no risk, but there are details you shouldn''t miss. Let us break it down for you and here''s what you should take note of to avoid any unwanted surprises.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Common Mistake', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'What to Do Instead', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '<p>Make sure that the casino you''ve chosen is safe and secure, check out our list of <a href="/{regionCode}/blacklist">blacklisted casinos</a> to avoid getting scammed.</p>', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Assuming all cashback is real cash', 1
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Check if it''s real money or bonus credits with turnover requirements.</p>', 2
UNION ALL SELECT @sec, 2, 'left', 'text', 'Ignoring cashback claim periods', 1
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Claim within the deadline as some offers expire within 24–48 hours.</p>', 2
UNION ALL SELECT @sec, 3, 'left', 'text', 'Playing excluded games', 1
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Stick to games that are participating in the cashback bonus or promo.</p>', 2
UNION ALL SELECT @sec, 4, 'left', 'text', 'Forgetting to opt-in', 1
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Always activate the cashback promo before playing.</p>', 2
UNION ALL SELECT @sec, 5, 'left', 'text', 'Assuming cashback is automatic', 1
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>Some casinos require you to manually claim through your account or their live chat.</p>', 2
UNION ALL SELECT @sec, 6, 'left', 'text', 'Overlooking turnover requirements', 1
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>If it''s bonus cashback, check their turnover rate before cashing out.</p>', 2
UNION ALL SELECT @sec, 7, 'left', 'text', 'Not tracking cashback cycles', 1
UNION ALL SELECT @sec, 7, 'right', 'richtext', '<p>Know if it''s daily, weekly, or monthly so you can time your play smartly.</p>', 2
UNION ALL SELECT @sec, 8, 'left', 'text', 'Ignoring min/max cashback limits', 1
UNION ALL SELECT @sec, 8, 'right', 'richtext', '<p>Check the minimum loss needed and maximum cashback cap.</p>', 2
UNION ALL SELECT @sec, 9, 'left', 'text', 'Thinking you can''t stack bonuses', 1
UNION ALL SELECT @sec, 9, 'right', 'richtext', '<p>Some casinos allow promo stacking, read the terms to maximize rewards.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'bonus_calculator', '', 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Bonus Calculator' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>If you''re unsure how much cashback bonus is available for you, use our free cashback bonus calculator to estimate your rewards.</p>', 3
UNION ALL SELECT @sec, 0, 'currency', 'text', '{currency}', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'faq', '', 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Cashback Bonuses in {region}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'Is cashback real money or bonus funds?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>It depends on the casino. Real-money cashback can be withdrawn straight away, while bonus cashback usually has a turnover requirement before you can cash it out.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'What is the typical cashback percentage?', 2
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Most casinos offer between 5% and 25% of net losses, with higher rates often reserved for VIP or loyalty members.</p>', 3
UNION ALL SELECT @sec, 3, 'question', 'text', 'How often is cashback paid?', 2
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Cashback is usually paid daily, weekly or monthly, depending on the offer. The payment cycle is stated in the promotion terms.</p>', 3
UNION ALL SELECT @sec, 4, 'question', 'text', 'What''s the maximum cashback amount?', 2
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Each offer sets its own cap, no matter how much you lose. Check the maximum cashback limit in the terms or in our table before you play.</p>', 3
UNION ALL SELECT @sec, 5, 'question', 'text', 'Are cashback offers better than free spins?', 2
UNION ALL SELECT @sec, 5, 'answer', 'richtext', '<p>They suit different players. Cashback softens losses over time and often works across more games, while free spins give you a fixed number of chances to win on specific slots.</p>', 3
UNION ALL SELECT @sec, 6, 'question', 'text', 'Can I claim cashback if I used another bonus?', 2
UNION ALL SELECT @sec, 6, 'answer', 'richtext', '<p>Sometimes. Some casinos exclude losses made while another bonus is active, while others allow stacking, so read the terms of both offers.</p>', 3
UNION ALL SELECT @sec, 7, 'question', 'text', 'Does cashback apply to winnings too?', 2
UNION ALL SELECT @sec, 7, 'answer', 'richtext', '<p>No. Cashback is calculated on net losses, which are your total bets minus your winnings over the cashback period. If you finish the period ahead, there''s nothing to return.</p>', 3
UNION ALL SELECT @sec, 8, 'question', 'text', 'What happens if I miss the cashback claim window?', 2
UNION ALL SELECT @sec, 8, 'answer', 'richtext', '<p>If the offer has to be claimed manually, missing the deadline usually means losing that period''s cashback. Set a reminder or choose casinos that credit cashback automatically.</p>', 3
UNION ALL SELECT @sec, 9, 'question', 'text', 'Does VIP level affect cashback rate?', 2
UNION ALL SELECT @sec, 9, 'answer', 'richtext', '<p>Often, yes. Many casinos raise the cashback percentage, cap or payment frequency as you move up their loyalty or VIP tiers.</p>', 3
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'cta_link_list', 'section--tight-top', 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Discover More' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'label', 'text', 'No Deposit Bonus', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/{regionCode}/bonuses/no_deposit', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Free Spins Bonus', 3
UNION ALL SELECT @sec, 2, 'url', 'text', '/{regionCode}/bonuses/free_spins', 4
UNION ALL SELECT @sec, 3, 'label', 'text', 'Welcome Bonus', 3
UNION ALL SELECT @sec, 3, 'url', 'text', '/{regionCode}/bonuses/welcome', 4
UNION ALL SELECT @sec, 4, 'label', 'text', 'Deposit Bonus', 3
UNION ALL SELECT @sec, 4, 'url', 'text', '/{regionCode}/bonuses/deposit', 4
UNION ALL SELECT @sec, 5, 'label', 'text', 'Loyalty Bonus', 3
UNION ALL SELECT @sec, 5, 'url', 'text', '/{regionCode}/bonuses/loyalty_vip', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;

-- loyalty_vip
INSERT INTO pages (parent_id, sort_order, slug, title, meta_title, meta_description, status)
SELECT @hub, 6, 'loyalty_vip', 'Loyalty & VIP Programs', 'Casino Loyalty & VIP Programs {region} {year} | Top Casino Guide', 'Compare online casino loyalty and VIP programs in {region}. See point conversion rates, cashback and VIP perks from trusted casinos, updated weekly.', 'published' FROM DUAL
WHERE @hub IS NOT NULL AND NOT EXISTS (SELECT 1 FROM pages WHERE parent_id = @hub AND slug = 'loyalty_vip');
SET @page = (SELECT id FROM pages WHERE parent_id = @hub AND slug = 'loyalty_vip' LIMIT 1);
SET @seeded = (SELECT COUNT(*) FROM page_sections WHERE page_id = @page);
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'introduction_section', '', 0 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Loyalty Program Online Casino {region}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'Top Casino Guide', 3
UNION ALL SELECT @sec, 0, 'paragraph', 'richtext', '<p>A casino loyalty program rewards regular and active players. Perks are based on how much you deposit, play, or the points you earn. Common rewards include cashback, free spins, and exclusive gifts. The more you play, the more you get in return.</p>', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'rich_text', '', 1 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How Loyalty Programs Work' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>In most online casino loyalty programs, players earn points every time they place real money bets. As these points add up, players move through different loyalty levels like Bronze, Silver, Gold, Platinum, and VIP.</p><p>These levels unlock better rewards, which can include bonus cash, special gifts, free trips, or even free spins with no turnover requirements. VIP players often get extra perks, such as a dedicated account manager or exclusive promotions tailored just for them.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'two_column_table', '', 2 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Key Terms You Should Know About Loyalty Programs and VIP Bonuses' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Term', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Simple Explanation', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Comp Points', 1
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Points earned when you bet with real money. Can be redeemed for bonuses or rewards.</p>', 2
UNION ALL SELECT @sec, 2, 'left', 'text', 'Tier Status', 1
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Your level in the loyalty program (e.g., Bronze, Silver, Gold, VIP). Higher tiers offer better perks.</p>', 2
UNION ALL SELECT @sec, 3, 'left', 'text', 'Point Conversion Rate', 1
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>How many points you need to exchange for bonuses or cash. Example: 1,000 points = 10 {currency}.</p>', 2
UNION ALL SELECT @sec, 4, 'left', 'text', 'VIP Cashback Percentage', 1
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>The percentage of your losses returned as cashback for VIP members. Higher tiers get more.</p>', 2
UNION ALL SELECT @sec, 5, 'left', 'text', 'Exclusive Tournament Access', 1
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>Entry to private games or competitions available only to loyalty or VIP players.</p>', 2
UNION ALL SELECT @sec, 6, 'left', 'text', 'Turnover Multiplier', 1
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>How many times you must play through your bonus or points before withdrawing winnings.</p>', 2
UNION ALL SELECT @sec, 7, 'left', 'text', 'No-Wager Rewards', 1
UNION ALL SELECT @sec, 7, 'right', 'richtext', '<p>Bonuses or free spins that don''t require wagering before you can cash out.</p>', 2
UNION ALL SELECT @sec, 8, 'left', 'text', 'Personal Account Manager', 1
UNION ALL SELECT @sec, 8, 'right', 'richtext', '<p>A dedicated casino rep for VIP players to help with faster support and custom rewards.</p>', 2
UNION ALL SELECT @sec, 9, 'left', 'text', 'Exclusive promotions', 1
UNION ALL SELECT @sec, 9, 'right', 'richtext', '<p>Special offers or deals made just for you, based on your play and loyalty level.</p>', 2
UNION ALL SELECT @sec, 10, 'left', 'text', 'Loyalty Bonus', 1
UNION ALL SELECT @sec, 10, 'right', 'richtext', '<p>Extra bonus given to regular players as part of the casino''s rewards system.</p>', 2
UNION ALL SELECT @sec, 11, 'left', 'text', 'Monthly Reload Bonus', 1
UNION ALL SELECT @sec, 11, 'right', 'richtext', '<p>A bonus offered every month for loyal players who deposit regularly.</p>', 2
UNION ALL SELECT @sec, 12, 'left', 'text', 'Birthday or Anniversary Bonus', 1
UNION ALL SELECT @sec, 12, 'right', 'richtext', '<p>Special bonuses gifted on your birthday or sign-up anniversary.</p>', 2
UNION ALL SELECT @sec, 13, 'left', 'text', 'Invite-Only Events', 1
UNION ALL SELECT @sec, 13, 'right', 'richtext', '<p>Private events, tournaments, or trips available only to top-tier VIPs.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'bonus_listing_table', 'section--tight-top', 3 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Latest Loyalty and VIP Programs {region} (Updated Weekly)' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'bonusType', 'text', 'loyalty_vip', 3
UNION ALL SELECT @sec, 0, 'limit', 'text', '5', 4
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Ready to be treated like a VIP and enjoy exclusive rewards? Check out this list for the latest list of casinos that offer the best money for value loyalty programs.</p>', 9
UNION ALL SELECT @sec, 0, 'columnsMode', 'text', 'custom', 10
UNION ALL SELECT @sec, 0, 'ctaLabel', 'text', 'Join Now', 11
UNION ALL SELECT @sec, 1, 'column', 'text', 'details', 1
UNION ALL SELECT @sec, 1, 'label', 'text', 'Loyalty Program Name', 2
UNION ALL SELECT @sec, 2, 'column', 'text', 'pointConversion', 1
UNION ALL SELECT @sec, 2, 'label', 'text', '', 2
UNION ALL SELECT @sec, 3, 'column', 'text', 'maxRebate', 1
UNION ALL SELECT @sec, 3, 'label', 'text', 'Cashback', 2
UNION ALL SELECT @sec, 4, 'column', 'text', 'perks', 1
UNION ALL SELECT @sec, 4, 'label', 'text', 'Special VIP Perks', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'numbered_steps', '', 4 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Join a Casino Loyalty Program Step-by-Step' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 3
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 10
UNION ALL SELECT @sec, 1, 'title', 'text', 'Sign up at a trusted online casino', 1
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Start by registering at a licensed casino that offers a loyalty program. You can also check our list for some recommendations.</p>', 2
UNION ALL SELECT @sec, 2, 'title', 'text', 'Play games with real money', 1
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Once you''re signed in, play your favorite games using real money to start earning points.</p>', 2
UNION ALL SELECT @sec, 3, 'title', 'text', 'Earn loyalty points automatically', 1
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Every time you place a real money bet, you''ll collect loyalty points without needing to do anything extra.</p>', 2
UNION ALL SELECT @sec, 4, 'title', 'text', 'Move up to higher loyalty tiers', 1
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>As you play and deposit more, you''ll reach higher loyalty levels like Silver, Gold, or VIP. When your tier increases, so do your rewards.</p>', 2
UNION ALL SELECT @sec, 5, 'title', 'text', 'Use your points for rewards', 1
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Depending on your loyalty progress, the points you''ve accumulated can be used in exchange for other bonuses, free spins or even cash prizes.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'two_column_table', '', 5 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Tips for Maximizing Loyalty Rewards' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>In order to benefit the most from your loyalty rewards, here are some tricks to help you win more and level up quicker.</p>', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'Tip', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Simple Explanation', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Stick to 1–2 trusted {regionAdj}-friendly casinos', 1
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Choose online casinos that support {currency} and local banking for smoother gameplay and faster loyalty progress.</p>', 2
UNION ALL SELECT @sec, 2, 'left', 'text', 'Play slot games with 100% contribution', 1
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>{regionAdj} players love slots, and they usually count fully toward loyalty points and/or any turnover requirements.</p>', 2
UNION ALL SELECT @sec, 3, 'left', 'text', 'Check point expiry and cashback reset dates', 1
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Some casinos reset points monthly, so don''t let your hard-earned rewards go to waste.</p>', 2
UNION ALL SELECT @sec, 4, 'left', 'text', 'Use VIP bonuses during active play hours', 1
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Make the most of high-tier offers when you plan longer play sessions, like evenings or weekends.</p>', 2
UNION ALL SELECT @sec, 5, 'left', 'text', 'Look for {regionAdj}-exclusive rewards', 1
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>Some casinos give special bonuses for {regionAdj} festivals or local tournaments.</p>', 2
UNION ALL SELECT @sec, 6, 'left', 'text', 'Redeem before withdrawing', 1
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>In many casinos, withdrawing may reset your loyalty points. Always redeem first!</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'two_column_table', '', 6 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Things to Watch Out for When Joining Loyalty Programs' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '', 2
UNION ALL SELECT @sec, 0, 'headerLeft', 'text', 'What to Watch Out For', 3
UNION ALL SELECT @sec, 0, 'headerRight', 'text', 'Why You Should Watch Out', 4
UNION ALL SELECT @sec, 0, 'outro', 'richtext', '<p>In order to fully utilize your loyalty perks, remember to always only play at trusted and reliable casino sites. Check out our list of <a href="/{regionCode}/blacklist">blacklisted casinos</a>, so you can play safe and play smart.</p>', 5
UNION ALL SELECT @sec, 1, 'left', 'text', 'Playing at too many casinos', 1
UNION ALL SELECT @sec, 1, 'right', 'richtext', '<p>Splitting your play across many sites makes it harder to collect enough points fast.</p>', 2
UNION ALL SELECT @sec, 2, 'left', 'text', 'Not reading the VIP terms and conditions', 1
UNION ALL SELECT @sec, 2, 'right', 'richtext', '<p>Some rewards are seasonal or limited-time only. Always read the fine print.</p>', 2
UNION ALL SELECT @sec, 3, 'left', 'text', 'Ignoring loyalty point expiry dates', 1
UNION ALL SELECT @sec, 3, 'right', 'richtext', '<p>Points don''t last forever. If you don''t use them in time, they''ll be lost.</p>', 2
UNION ALL SELECT @sec, 4, 'left', 'text', 'Assuming all games earn equal points', 1
UNION ALL SELECT @sec, 4, 'right', 'richtext', '<p>Not every game helps you earn points the same way. Slots usually count more than table games.</p>', 2
UNION ALL SELECT @sec, 5, 'left', 'text', 'Missing upgrade deadlines', 1
UNION ALL SELECT @sec, 5, 'right', 'richtext', '<p>Some loyalty programs reset tiers monthly. You might need to maintain activity to keep your status.</p>', 2
UNION ALL SELECT @sec, 6, 'left', 'text', 'Thinking cashback is always automatic', 1
UNION ALL SELECT @sec, 6, 'right', 'richtext', '<p>Some casinos require you to manually claim cashback or bonuses before they expire.</p>', 2
UNION ALL SELECT @sec, 7, 'left', 'text', 'Not using rewards before withdrawing', 1
UNION ALL SELECT @sec, 7, 'right', 'richtext', '<p>Withdrawing your balance may reset your points or cancel some bonus offers.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'bonus_calculator', '', 7 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Bonus Calculator' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>If you''re unsure how the bonuses work or what can help you gain more points for your loyalty rewards, use our calculator to help you track your progress.</p>', 3
UNION ALL SELECT @sec, 0, 'currency', 'text', '{currency}', 8
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'faq', '', 8 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'FAQs about Online Casino Loyalty Programs in {region}' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'How do casino loyalty points work?', 2
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>You earn points for every real-money bet you place. Points build up to move you through loyalty tiers and can be exchanged for bonuses, free spins or cash at the casino''s conversion rate.</p>', 3
UNION ALL SELECT @sec, 2, 'question', 'text', 'Are VIP bonuses better than regular bonuses?', 2
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Often, yes. VIP bonuses tend to have higher values, lower or no turnover, and personalised offers, but they''re only available once you reach a qualifying tier.</p>', 3
UNION ALL SELECT @sec, 3, 'question', 'text', 'How fast can I reach VIP status?', 2
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>It depends on how much you play and each casino''s tier thresholds. Some top tiers are invite-only, so don''t increase your spending just to chase a status level.</p>', 3
UNION ALL SELECT @sec, 4, 'question', 'text', 'Do loyalty points expire?', 2
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>At many casinos, yes. Points may expire after a period of inactivity or reset monthly, so check the program terms and redeem them in time.</p>', 3
UNION ALL SELECT @sec, 5, 'question', 'text', 'Which games help me earn the most loyalty points?', 2
UNION ALL SELECT @sec, 5, 'answer', 'richtext', '<p>Slots usually earn points at the full rate. Table games and live casino often earn fewer points per bet, and some games don''t earn any.</p>', 3
UNION ALL SELECT @sec, 6, 'question', 'text', 'Can I use my loyalty points to get real money?', 2
UNION ALL SELECT @sec, 6, 'answer', 'richtext', '<p>Many programs let you convert points into cash or bonus credit. Cash conversions can usually be withdrawn, while bonus credit may carry a turnover requirement.</p>', 3
UNION ALL SELECT @sec, 7, 'question', 'text', 'What''s the difference between a loyalty program and a VIP club?', 2
UNION ALL SELECT @sec, 7, 'answer', 'richtext', '<p>A loyalty program is usually open to every player and rewards regular play with points and tiers. A VIP club is the top level, often invite-only, with perks like a personal account manager and exclusive events.</p>', 3
UNION ALL SELECT @sec, 8, 'question', 'text', 'Are {regionAdj} players eligible for loyalty programs?', 2
UNION ALL SELECT @sec, 8, 'answer', 'richtext', '<p>Usually, yes, if the casino accepts players from {region}. Gambling rules differ by country, so check your local regulations and stick to licensed operators.</p>', 3
UNION ALL SELECT @sec, 9, 'question', 'text', 'Can I lose my loyalty tier?', 2
UNION ALL SELECT @sec, 9, 'answer', 'richtext', '<p>Yes. Some programs review tiers monthly or yearly, and you may drop a level if you don''t keep up the required activity.</p>', 3
UNION ALL SELECT @sec, 10, 'question', 'text', 'Do I need to do anything to join a loyalty program?', 2
UNION ALL SELECT @sec, 10, 'answer', 'richtext', '<p>Usually not. Most casinos enrol you automatically when you register and start playing with real money, though a few ask you to opt in first.</p>', 3
) AS rows_to_insert WHERE @sec IS NOT NULL;
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page, 'cta_link_list', 'section--tight-top', 9 FROM DUAL WHERE @page IS NOT NULL AND @seeded = 0;
SET @sec = IF(@page IS NULL OR @seeded > 0, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Discover More' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'label', 'text', 'No Deposit Bonus', 3
UNION ALL SELECT @sec, 1, 'url', 'text', '/{regionCode}/bonuses/no_deposit', 4
UNION ALL SELECT @sec, 2, 'label', 'text', 'Free Spins Bonus', 3
UNION ALL SELECT @sec, 2, 'url', 'text', '/{regionCode}/bonuses/free_spins', 4
UNION ALL SELECT @sec, 3, 'label', 'text', 'Welcome Bonus', 3
UNION ALL SELECT @sec, 3, 'url', 'text', '/{regionCode}/bonuses/welcome', 4
UNION ALL SELECT @sec, 4, 'label', 'text', 'Deposit Bonus', 3
UNION ALL SELECT @sec, 4, 'url', 'text', '/{regionCode}/bonuses/deposit', 4
UNION ALL SELECT @sec, 5, 'label', 'text', 'Cashback Bonus', 3
UNION ALL SELECT @sec, 5, 'url', 'text', '/{regionCode}/bonuses/cashback', 4
) AS rows_to_insert WHERE @sec IS NOT NULL;

SET @templated = (SELECT COUNT(*) FROM page_sections s JOIN pages p ON p.id = s.page_id WHERE p.parent_id = @hub);
DELETE s FROM page_sections s
JOIN pages p ON p.id = s.page_id
JOIN pages hub ON hub.id = p.parent_id AND hub.slug = 'bonuses'
JOIN pages region ON region.id = hub.parent_id AND region.parent_id IS NULL AND region.slug IN ('th', 'my', 'sg')
WHERE @templated > 0 AND p.slug IN ('no_deposit', 'free_spins', 'welcome', 'deposit', 'cashback', 'loyalty_vip');

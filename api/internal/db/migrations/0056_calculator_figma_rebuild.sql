-- /calculator rebuilt to the Figma "D / Calculator" frame: the header copy,
-- the redesigned calculator (heading replaces Figma's "XXX Calculator"
-- placeholder), "How To Use" step cards, "Bonus Types & Real-Life Examples"
-- as titled cards, the two explainer sections, and the 10-question FAQ.
-- The introduction_section is kept (only its copy changes); every other
-- section is replaced.

SET @page = (SELECT id FROM pages WHERE slug = 'calculator' AND parent_id IS NULL LIMIT 1);
SET @intro = (SELECT id FROM page_sections WHERE page_id = @page AND block_type = 'introduction_section' ORDER BY sort_order LIMIT 1);

DELETE FROM page_sections WHERE page_id = @page AND (@intro IS NULL OR id <> @intro);

UPDATE page_section_fields SET text_value = 'Top-Rated Online Casino Bonus Calculator' WHERE section_id = @intro AND item_index = 0 AND field_key = 'heading';
UPDATE page_section_fields SET text_value = '' WHERE section_id = @intro AND item_index = 0 AND field_key = 'highlightText';
UPDATE page_section_fields SET text_value = 'Check Your Real Bonus ROI' WHERE section_id = @intro AND item_index = 0 AND field_key = 'subheading';
UPDATE page_section_fields SET text_value = '<p>Our Online Casino Bonus Calculator gives you the full picture of the total bonus you will be receiving, total wallet balance, and the total amount you need to bet in order to achieve the withdrawn requirements. So, you can understand the real value, risks, and potential profits behind any bonus offer whether its No Deposit Bonus, Free Spins Bonus, Welcome Bonus, Deposit Bonus, Cashback Bonus, or Loyalty / VIP Bonus.</p>' WHERE section_id = @intro AND item_index = 0 AND field_key = 'paragraph';

INSERT INTO page_sections (page_id, block_type, sort_order) SELECT @page, 'bonus_calculator', 1 FROM DUAL WHERE @page IS NOT NULL;
SET @sec = IF(@page IS NULL, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Online Casino Bonus Calculator' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'currency', 'text', '$', 8
UNION ALL SELECT @sec, 0, 'wagerBasis', 'text', 'bonus', 9
) AS rows_to_insert WHERE @sec IS NOT NULL;

INSERT INTO page_sections (page_id, block_type, sort_order) SELECT @page, 'rich_text', 2 FROM DUAL WHERE @page IS NOT NULL;
SET @sec = IF(@page IS NULL, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Why Use a Bonus Calculator Before Claiming Offers?' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p><strong>Real Bonus ≠ Advertised Bonus</strong></p><p>Most online casinos advertise flashy offers, but don’t always explain what’s really required to unlock your bonus. This tool shows:</p><ul><li>How much you must bet to clear your bonus</li><li>How your chosen game affects contribution</li><li>Whether the bonus is actually worth your time</li></ul><p>Things you need to be mindful about:</p><ul><li>Don’t get stuck with high turnover multipliers</li><li>Understand the impact of game contribution rates</li><li>Know your expected real balance after turnover</li></ul>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;

INSERT INTO page_sections (page_id, block_type, sort_order) SELECT @page, 'numbered_steps', 3 FROM DUAL WHERE @page IS NOT NULL;
SET @sec = IF(@page IS NULL, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How To Use the Interactive Online Casino Bonus Calculator' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'steps', 10
UNION ALL SELECT @sec, 1, 'title', 'text', 'Enter Your Bonus Details', 1
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<ul><li>Deposit amount</li><li>Bonus percentage (%)</li><li>Max bonus allowed by the online casino</li></ul>', 2
UNION ALL SELECT @sec, 2, 'title', 'text', 'Input Turnover Conditions', 1
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<ul><li>Turnover requirement (e.g., 30x bonus, 30x deposit+bonus)</li><li>Game contribution rate (e.g., 100% slots, 10% roulette)</li></ul>', 2
UNION ALL SELECT @sec, 3, 'title', 'text', 'View Bonus Outcome Insights', 1
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<ul><li>Total bonus you’ll receive</li><li>Final wallet balance (deposit + bonus)</li><li>Total betting amount required to withdraw winnings</li></ul>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;

INSERT INTO page_sections (page_id, block_type, sort_order) SELECT @page, 'numbered_steps', 4 FROM DUAL WHERE @page IS NOT NULL;
SET @sec = IF(@page IS NULL, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Bonus Types & Real-Life Examples' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Online casino bonuses help you play longer, try out more games, and potentially win bigger amounts of money. However, not all bonuses are created equal. Understanding how each type works, knowing how to figure out your chances with each one, and being able to use that knowledge as you play can make a big difference. Our Online Casino Bonus Calculator helps by making things simple and showing you how to apply each bonus clearly and step by step.</p>', 3
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 4
UNION ALL SELECT @sec, 0, 'labelMode', 'text', 'titles', 10
UNION ALL SELECT @sec, 1, 'title', 'text', 'Deposit Bonuses', 1
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Deposit bonuses are really common at online casinos, and a lot of players like to take advantage of them. These usually show up as a certain amount you can get, like 100% up to $500. This means that if you put $500 into your account, the casino will give you another $500 on top for you to use. The calculator checks how much bonus you can get depending on how much you deposit and what the cap is. It also clarifies whether wagering requirements apply to just the bonus funds or the total amount (deposit + bonus), which can make a significant difference in how much you need to bet before withdrawing.</p>', 2
UNION ALL SELECT @sec, 2, 'title', 'text', 'Free Spins Bonuses', 1
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Free spins are something slot players really like because you get a chance to win without having to use your own cash. Instead of a cash bonus, you''re given spins on specific slot games. For example, if you play 20 spins and each one is $0.50, you will get a $10 bonus in the end. Our calculator goes step-by-step to show you the amount of money you can bet in spins and lets you know if you need to meet the turnover requirement based on your total spins or on how much you actually won. This helps players see how much money they might make and what risks they need to be aware of before they start playing.</p>', 2
UNION ALL SELECT @sec, 3, 'title', 'text', 'No Deposit Bonuses', 1
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>No deposit bonuses are great for new players who want to see how a online casino works before risking any of their own money. These often give you a small amount of extra cash or free chips, like $10 bonus, without you having to put in your own money. However, they''re usually capped, with winnings often limited to amounts like up to $50. Our calculator shows you exactly how much you can win and the minimum amount you need to bet before you can ask for any withdrawals, so you know exactly where you stand from the very beginning.</p>', 2
UNION ALL SELECT @sec, 4, 'title', 'text', 'Cashback Bonuses', 1
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Cashback bonuses are meant to help you out when you are losing money by giving you back a portion of your total losses. For example, if you lost $500 and earned 10% cashback, you’ll get $50 put back in your account. The bonus calculator makes it easier to see how much of a difference a cashback can make in lowering your risk. It also shows your effective return rate, providing insight into how much value you''re actually getting back compared to your losses, often without any turnover obligations.</p>', 2
UNION ALL SELECT @sec, 5, 'title', 'text', 'Welcome Bonuses', 1
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Welcome bonuses are sets of benefits that new players get when they join a online casino. These often offer you a match bonus every time you make a deposit, plus give you some free spins. A typical structure might look like:</p><ul><li>1st deposit: 100% match up to $500</li><li>2nd deposit: 50% match up to $300</li><li>3rd deposit: 25% match up to $200</li></ul><p>Our calculator adds up your first deposit bonuses together and shows you the total amount you need to turnover before you can withdraw the winnings, which helps new players see the full requirements of the welcome offer in one place.</p>', 2
UNION ALL SELECT @sec, 6, 'title', 'text', 'Loyalty / VIP Bonuses', 1
UNION ALL SELECT @sec, 6, 'body', 'richtext', '<p>Loyalty and VIP programs give loyal players extra rewards, special cashback, and perks just for them. These can include weekly rewards, reaching new achievement goals, and the chance to move up to higher tiers that give you better rates of rebates. The calculator keeps an eye on your long-term profit, figuring in how often you get bonuses, how much each bonus is worth, and what kind of choices you make. This lets loyal players get all the perks and rewards from sticking with one casino for the long haul.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;

INSERT INTO page_sections (page_id, block_type, sort_order) SELECT @page, 'rich_text', 5 FROM DUAL WHERE @page IS NOT NULL;
SET @sec = IF(@page IS NULL, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'How to Interpret Bonus Turnover Results' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Understanding how to look at bonus turnover makes it easier to figure out if a casino bonus is really worth your time and money. While big bonus amounts might look exciting, it’s important to remember that most bonuses come with certain conditions to meet before you can withdraw the money. Our Online Casino Bonus Calculator helps you easily see how much you need to wager to get your money, so you always know what you’re working towards.</p><h3>Understand Your Required Total Bet Amount</h3><p>When you claim a bonus, you''re typically required to make a certain amount of total bets before the bonus—and any winnings from it—can be withdrawn. This is known as the turnover requirement, and a lot of players end up surprised at just how many times they have to play through a bonus before they can actually withdraw their winnings.</p><p>For instance, if you make a deposit of $1,000, you’ll get an extra $1,000 on top of it, but you need to bet that bonus 30 times before you can cash it out. This means you’ll need to bet a total of $30,000 before you''re eligible to withdraw your bonus funds. That’s not just your bonus—it’s a boost to the bonus or sometimes even adds on to what you put in, depending on how the online casino’s terms are set up. Our calculator helps you see how much you can hope to win so that you can decide if this goal fits with what you’re comfortable trying to achieve.</p><h3>Estimate Your ROI or Bonus Risk Level</h3><p>Beyond just showing turnover totals, the calculator also helps you estimate your Return on Investment (ROI) and evaluate the risk level associated with each bonus. This is where things get strategic.</p><p>With the numbers laid out in a clean and easy-to-find way, you can easily check to see if things are on track:</p><ul><li>You’re likely to turn a profit based on your average game returns and betting patterns.</li><li>You’re risking too much and possibly falling into endless turnover loops that rarely result in actual withdrawals.</li></ul><p>For example, a bonus with a significant amount can look good on paper, but it could actually push you to keep betting even if you end up losing most of your deposit. On the other hand, if you choose a bonus with a smaller bonus amount and lower playthrough requirements, it might actually give you a better chance to actually get your winnings.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;

INSERT INTO page_sections (page_id, block_type, sort_order) SELECT @page, 'rich_text', 6 FROM DUAL WHERE @page IS NOT NULL;
SET @sec = IF(@page IS NULL, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Why Our Bonus Calculator Is Accurate and Trustworthy' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Our Online Casino Bonus Calculator is a tool you can really rely on because it’s based on real math and the actual rules for casinos. Every feature is made to be totally clear and fair, so players know exactly what they’re getting into and there are no surprises.</p><h3>Built on Verified Casino Mathematics and Regulatory Standards</h3><p>Our bonus calculator works like the ones real online casinos and experts use by applying simple but helpful math to help you figure out your bonuses. These aren’t just random numbers or made-up formulas. They’re set up carefully so they match the same bonus rules and turnover (play-through) requirements you see in real gambling sites.</p><p>We factor in:</p><ul><li>Deposit-match multipliers decide how much bonus credit you get relative to how much you deposit.</li><li>Bonus caps come into play when you reach specific levels and variable structures help make sure the bonus amounts go up and down the right way.</li><li>Game contribution rates, adjusting for how much different games count toward the turnover, whether it''s 100% for slots or 10% for blackjack.</li></ul><h3>Peer-Reviewed by iGaming Analysts and Gambling Risk Experts</h3><p>To make sure our calculator is accurate and reliable, we have certified people in the iGaming industry check it regularly. Every quarter, the tool goes through a thorough check, and during this process, it’s made sure that it meets all the requirements and is at its best quality.</p><ul><li>Peer audits by experts in gambling and finance to make sure everything is done the same way as in other countries.</li><li>Real-world scenario testing, which means actually looking at real online casino bonuses and player activity to check the accuracy of our findings.</li><li>Benchmarking against licensed online casinos from around the world and checking that what we offer meets the standards of trusted and regulated online casinos in places that have tough rules.</li></ul>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;

INSERT INTO page_sections (page_id, block_type, sort_order) SELECT @page, 'faq', 7 FROM DUAL WHERE @page IS NOT NULL;
SET @sec = IF(@page IS NULL, NULL, LAST_INSERT_ID());
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Online Casino Bonus Calculator FAQs' AS text_value, 1 AS sort_order
UNION ALL SELECT @sec, 1, 'question', 'text', 'What is an online casino bonus calculator?', 1
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>A free tool that turns a bonus offer’s terms into real numbers: the bonus you’ll receive, your total wallet balance, and how much you need to bet before you can withdraw.</p>', 2
UNION ALL SELECT @sec, 2, 'question', 'text', 'How does the calculator work?', 1
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Enter the deposit, bonus percentage, maximum bonus, wagering requirement and game contribution rate, then choose whether wagering applies to the bonus only or to deposit + bonus. The calculator caps the bonus at the maximum, multiplies by the wagering requirement and adjusts for the contribution rate.</p>', 2
UNION ALL SELECT @sec, 3, 'question', 'text', 'Why is turnover important in casino bonuses?', 1
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Turnover decides when bonus money becomes withdrawable. A 30x requirement on a $100 bonus means $3,000 in bets, and more if your game only partly counts toward it.</p>', 2
UNION ALL SELECT @sec, 4, 'question', 'text', 'Can I use this calculator for all types of bonuses?', 1
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Yes. It works for deposit, welcome, no deposit, free spins, cashback and VIP offers: enter the value of the bonus and its wagering terms. For multi-deposit welcome packages, calculate each deposit and add the results.</p>', 2
UNION ALL SELECT @sec, 5, 'question', 'text', 'Does the calculator consider game contribution rates?', 1
UNION ALL SELECT @sec, 5, 'answer', 'richtext', '<p>Yes. If slots count 100% but blackjack only 10%, the same requirement needs ten times more betting on blackjack, and the result shows that.</p>', 2
UNION ALL SELECT @sec, 6, 'question', 'text', 'Is this calculator accurate for real casino terms?', 1
UNION ALL SELECT @sec, 6, 'answer', 'richtext', '<p>It calculates exactly what you enter, so the result is as accurate as the terms you copy from the casino’s bonus page. Always check whether wagering applies to the bonus only or to deposit + bonus.</p>', 2
UNION ALL SELECT @sec, 7, 'question', 'text', 'Can it tell if I’m going to make some extra money with a bonus?', 1
UNION ALL SELECT @sec, 7, 'answer', 'richtext', '<p>It can’t predict wins, but it shows how much betting a bonus demands. Comparing that with the game’s RTP tells you whether an offer is realistic or likely to cost more than it gives.</p>', 2
UNION ALL SELECT @sec, 8, 'question', 'text', 'Does it work for mobile users?', 1
UNION ALL SELECT @sec, 8, 'answer', 'richtext', '<p>Yes. The calculator runs in your browser on any phone, tablet or desktop.</p>', 2
UNION ALL SELECT @sec, 9, 'question', 'text', 'Is the bonus calculator free to use?', 1
UNION ALL SELECT @sec, 9, 'answer', 'richtext', '<p>Yes, it’s completely free and nothing you enter is stored.</p>', 2
UNION ALL SELECT @sec, 10, 'question', 'text', 'Can it help avoid bad bonus traps?', 1
UNION ALL SELECT @sec, 10, 'answer', 'richtext', '<p>Yes. Very high multipliers, low contribution rates and deposit + bonus wagering stand out immediately in the Total Bet Required figure, so you can skip offers that are unlikely to pay out.</p>', 2
) AS rows_to_insert WHERE @sec IS NOT NULL;

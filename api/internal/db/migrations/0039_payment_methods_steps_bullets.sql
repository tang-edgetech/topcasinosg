-- Reformats the "How to Make a Deposit"/"How to Withdraw Your Funds"
-- numbered_steps body copy (seeded by 0034/0036) from single paragraphs into
-- bulleted lists, matching the Figma design where each step's body reads as
-- a caret-bullet checklist rather than a paragraph - see NumberedStepsSection.tsx.

SET @th_page = (
  SELECT p.id FROM pages p
  JOIN pages region ON region.id = p.parent_id
  WHERE region.slug = 'th' AND p.slug = 'payment-methods'
);
SET @my_page = (
  SELECT p.id FROM pages p
  JOIN pages region ON region.id = p.parent_id
  WHERE region.slug = 'my' AND p.slug = 'payment-methods'
);
SET @sg_page = (
  SELECT p.id FROM pages p
  JOIN pages region ON region.id = p.parent_id
  WHERE region.slug = 'sg' AND p.slug = 'payment-methods'
);

SET @th_deposit = (SELECT id FROM page_sections WHERE page_id = @th_page AND sort_order = 4);
SET @th_withdraw = (SELECT id FROM page_sections WHERE page_id = @th_page AND sort_order = 5);
SET @my_deposit = (SELECT id FROM page_sections WHERE page_id = @my_page AND sort_order = 4);
SET @my_withdraw = (SELECT id FROM page_sections WHERE page_id = @my_page AND sort_order = 5);
SET @sg_deposit = (SELECT id FROM page_sections WHERE page_id = @sg_page AND sort_order = 4);
SET @sg_withdraw = (SELECT id FROM page_sections WHERE page_id = @sg_page AND sort_order = 5);

UPDATE page_section_fields SET text_value = '<ul><li>Pick a site that accepts Thai players, supports THB, and is licensed by a reputable regulator (e.g., PAGCOR, Curacao, MGA).</li><li>Check if your preferred payment method is supported.</li></ul>' WHERE section_id = @th_deposit AND item_index = 1 AND field_key = 'body';
UPDATE page_section_fields SET text_value = '<ul><li>Pick a site that accepts Malaysian players, supports MYR, and is licensed by a reputable regulator (e.g., PAGCOR, Curacao, MGA).</li><li>Check if your preferred payment method is supported.</li></ul>' WHERE section_id = @my_deposit AND item_index = 1 AND field_key = 'body';
UPDATE page_section_fields SET text_value = '<ul><li>Pick a site that accepts Singapore players, supports SGD, and is licensed by a reputable regulator (e.g., PAGCOR, Curacao, MGA).</li><li>Check if your preferred payment method is supported.</li></ul>' WHERE section_id = @sg_deposit AND item_index = 1 AND field_key = 'body';

UPDATE page_section_fields SET text_value = '<ul><li>Sign up with your email and a secure password.</li><li>Fill in accurate personal details (must match your payment method).</li><li>Most casinos will ask you to verify your identity (upload ID/passport, proof of address) to ensure compliance with KYC (Know Your Customer) and improve account security.</li></ul>' WHERE section_id IN (@th_deposit, @my_deposit, @sg_deposit) AND item_index = 2 AND field_key = 'body';

UPDATE page_section_fields SET text_value = '<ul><li>Log in and navigate to the "Cashier", "Wallet", or "Deposit" area.</li><li>Choose your preferred payment method (e.g., bank transfer, e-wallet, crypto).</li></ul>' WHERE section_id IN (@th_deposit, @my_deposit, @sg_deposit) AND item_index = 3 AND field_key = 'body';

UPDATE page_section_fields SET text_value = '<ul><li>Input the amount you wish to deposit (within the min/max limits shown).</li><li>Make sure to check if there''s a bonus code you can apply for promotions!</li></ul>' WHERE section_id IN (@th_deposit, @my_deposit, @sg_deposit) AND item_index = 4 AND field_key = 'body';

UPDATE page_section_fields SET text_value = '<ul><li>For bank transfers, you''ll be redirected to your bank or given transfer details.</li><li>For e-wallets, you may be redirected to log in and confirm payment.</li><li>For crypto, the site will provide a wallet address to send the funds.</li></ul>' WHERE section_id IN (@th_deposit, @my_deposit, @sg_deposit) AND item_index = 5 AND field_key = 'body';

UPDATE page_section_fields SET text_value = '<ul><li>Once confirmed, your funds will appear in your casino account.</li><li>You''re now ready to explore games, claim bonuses, or join live tables.</li></ul>' WHERE section_id IN (@th_deposit, @my_deposit, @sg_deposit) AND item_index = 6 AND field_key = 'body';

UPDATE page_section_fields SET text_value = '<ul><li>Before your first withdrawal, the casino must verify your identity (this is standard across all licensed platforms).</li><li>This KYC process protects you from fraud and ensures your funds are safe.</li><li>You may need to upload a government-issued ID (passport, national ID card), proof of address (utility bill, bank statement), and payment method verification (screenshot or statement).</li></ul>' WHERE section_id IN (@th_withdraw, @my_withdraw, @sg_withdraw) AND item_index = 1 AND field_key = 'body';

UPDATE page_section_fields SET text_value = '<ul><li>Log into your casino account, navigate to the "Withdrawal" or "Cashier" section, and select the same payment method used for your deposit (most casinos require this).</li></ul>' WHERE section_id IN (@th_withdraw, @my_withdraw, @sg_withdraw) AND item_index = 2 AND field_key = 'body';

UPDATE page_section_fields SET text_value = '<ul><li>Always read the casino''s withdrawal policy to avoid delays.</li><li>Choose the amount you want to cash out, making sure it''s within the minimum and maximum withdrawal limits - some methods may charge a small fee, so check before confirming.</li></ul>' WHERE section_id IN (@th_withdraw, @my_withdraw, @sg_withdraw) AND item_index = 3 AND field_key = 'body';

UPDATE page_section_fields SET text_value = '<ul><li>Submit your withdrawal request.</li><li>You''ll receive a confirmation email or notification.</li><li>Processing times vary by method (e.g., e-wallets: ~1-6 hrs, bank transfers: 1-2 days).</li></ul>' WHERE section_id IN (@th_withdraw, @my_withdraw, @sg_withdraw) AND item_index = 4 AND field_key = 'body';

UPDATE page_section_fields SET text_value = '<ul><li>Most casinos allow you to track the status under "Transaction History".</li><li>Once approved, the funds will be transferred to your chosen method.</li></ul>' WHERE section_id IN (@th_withdraw, @my_withdraw, @sg_withdraw) AND item_index = 5 AND field_key = 'body';

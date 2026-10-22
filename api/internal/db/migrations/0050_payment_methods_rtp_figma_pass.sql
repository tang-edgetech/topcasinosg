-- Second Figma pass on /{region}/payment-methods ("D / Country / TH /
-- Payment Method") and /{region}/rtp ("D / Country / TH / RTP"), th/my/sg:
-- * Deposit/Withdraw steps: two-tone headings ("How to [Make a Deposit]" in
--   blue, "How to [Withdraw Your Funds]" in green, matching Step labels),
--   step copy restored to the design's paragraph + bullet structure.
-- * "Safety Tips" and "Your Role" become checklist_callout boxes (they were
--   still plain icon_box_group lists).
-- * "Our Recommended Payment Security Standards" becomes info_card_columns
--   (two columns of white/tinted cards), built from the existing card copy.
-- * RTP: first FAQ question uses the design's wording, "Suggestions" sits
--   tight under the watch-outs panel.

-- ===================== TH payment-methods =====================
SET @page_id = (SELECT p.id FROM pages p JOIN pages region ON region.id = p.parent_id WHERE region.slug = 'th' AND p.slug = 'payment-methods');

SET @deposit = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 4 AND block_type = 'numbered_steps' LIMIT 1);
UPDATE page_section_fields SET text_value = 'Make a Deposit' WHERE section_id = @deposit AND item_index = 0 AND field_key = 'highlightText';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @deposit, 0, 'highlightText', 'text', 'Make a Deposit', 8 WHERE @deposit IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_section_fields WHERE section_id = @deposit AND item_index = 0 AND field_key = 'highlightText');
UPDATE page_section_fields SET text_value = 'primary' WHERE section_id = @deposit AND item_index = 0 AND field_key = 'accent';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @deposit, 0, 'accent', 'text', 'primary', 9 WHERE @deposit IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_section_fields WHERE section_id = @deposit AND item_index = 0 AND field_key = 'accent');
UPDATE page_section_fields SET text_value = '<p>Depositing money into a Thai-friendly online casino is quick and straightforward when you choose the right payment method. Here’s a complete guide to help you make your first deposit with confidence. You also can refer to our <a href="/th/reviews"><strong>most trusted Thai casino list</strong></a> for recommendations.</p>' WHERE section_id = @deposit AND item_index = 0 AND field_key = 'intro';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @deposit, 0, 'intro', 'richtext', '<p>Depositing money into a Thai-friendly online casino is quick and straightforward when you choose the right payment method. Here’s a complete guide to help you make your first deposit with confidence. You also can refer to our <a href="/th/reviews"><strong>most trusted Thai casino list</strong></a> for recommendations.</p>', 3 WHERE @deposit IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_section_fields WHERE section_id = @deposit AND item_index = 0 AND field_key = 'intro');
UPDATE page_section_fields SET text_value = '<p>Most deposits are processed instantly, especially with e-wallets and crypto.</p><ul><li>Follow the system prompts:<ul><li>For bank transfers, you’ll be redirected to your bank or given transfer details.</li><li>For e-wallets, you may be redirected to log in and confirm payment.</li><li>For crypto, the site will provide a wallet address to send the funds.</li></ul></li></ul>' WHERE section_id = @deposit AND item_index = 5 AND field_key = 'body';

SET @withdraw = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 5 AND block_type = 'numbered_steps' LIMIT 1);
UPDATE page_section_fields SET text_value = 'Withdraw Your Funds' WHERE section_id = @withdraw AND item_index = 0 AND field_key = 'highlightText';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @withdraw, 0, 'highlightText', 'text', 'Withdraw Your Funds', 8 WHERE @withdraw IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_section_fields WHERE section_id = @withdraw AND item_index = 0 AND field_key = 'highlightText');
UPDATE page_section_fields SET text_value = 'success' WHERE section_id = @withdraw AND item_index = 0 AND field_key = 'accent';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @withdraw, 0, 'accent', 'text', 'success', 9 WHERE @withdraw IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_section_fields WHERE section_id = @withdraw AND item_index = 0 AND field_key = 'accent');
UPDATE page_section_fields SET text_value = '<p>Before your first withdrawal, the casino must verify your identity (this is standard across all licensed platforms). This KYC process protects you from fraud and ensures your funds are safe.</p><p>You may need to upload:</p><ul><li>A government-issued ID (passport, national ID card)</li><li>Proof of address (utility bill, bank statement)</li><li>Payment method verification (screenshot or statement)</li></ul>' WHERE section_id = @withdraw AND item_index = 1 AND field_key = 'body';
UPDATE page_section_fields SET text_value = '<ul><li>Log into your casino account</li><li>Navigate to the “Withdrawal” or “Cashier” section</li><li>Select the same payment method used for your deposit (most casinos require this)</li></ul>' WHERE section_id = @withdraw AND item_index = 2 AND field_key = 'body';
UPDATE page_section_fields SET text_value = '<p>Always read the casino’s withdrawal policy to avoid delays.</p><ul><li>Choose the amount you want to cash out</li><li>Make sure it’s within the minimum and maximum withdrawal limits</li><li>Some methods may charge a small fee—check before confirming</li></ul>' WHERE section_id = @withdraw AND item_index = 3 AND field_key = 'body';
UPDATE page_section_fields SET text_value = '<ul><li>Submit your withdrawal request</li><li>You’ll receive a confirmation email or notification</li><li>Processing times vary by method (e.g., e-wallets: ~1–6 hrs, bank transfers: 1–2 days)</li></ul>' WHERE section_id = @withdraw AND item_index = 4 AND field_key = 'body';
UPDATE page_section_fields SET text_value = '<ul><li>Most casinos allow you to track the status under “Transaction History”</li><li>Once approved, the funds will be transferred to your chosen method</li></ul>' WHERE section_id = @withdraw AND item_index = 5 AND field_key = 'body';

SET @old = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 6 AND block_type = 'icon_box_group' LIMIT 1);
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page_id, 'checklist_callout', '', 65 WHERE @old IS NOT NULL;
SET @new = IF(@old IS NOT NULL AND ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @new AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Safety Tips' AS text_value, 1 AS sort_order
UNION ALL SELECT @new, 0, 'subtext', 'text', 'for Withdrawing in Thailand', 2
UNION ALL SELECT @new, 0, 'layout', 'text', 'split', 3
UNION ALL SELECT @new, 1, 'text', 'text', 'Use licensed casinos only to avoid delayed or blocked withdrawals', 4
UNION ALL SELECT @new, 2, 'text', 'text', 'Avoid using third-party accounts (must match your name)', 5
UNION ALL SELECT @new, 3, 'text', 'text', 'Enable 2FA for added account security', 6
UNION ALL SELECT @new, 4, 'text', 'text', 'Double-check fees and limits before confirming', 7
UNION ALL SELECT @new, 0, 'bgType', 'text', 'color', 8
UNION ALL SELECT @new, 0, 'bgFrom', 'text', 'surface-muted', 9
UNION ALL SELECT @new, 0, 'bgTo', 'text', 'surface-muted', 10
) AS rows_to_insert WHERE @new > 0;
DELETE FROM page_sections WHERE id = @old AND @new > 0;
UPDATE page_sections SET sort_order = 6 WHERE id = @new AND @new > 0;

SET @sec7 = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 7 AND block_type = 'icon_box_group' LIMIT 1);
SET @sec8 = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 8 AND block_type = 'icon_box_group' LIMIT 1);
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page_id, 'info_card_columns', '', 75 WHERE @sec7 IS NOT NULL;
SET @cards = IF(@sec7 IS NOT NULL AND ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @cards, 0, 'heading', 'text', 'Our Recommended Payment Security Standards to Protect You', 1 WHERE @cards > 0
UNION ALL SELECT @cards, 0, 'intro', 'richtext', f.text_value, 2 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 0 AND f.field_key = 'body';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @cards, 1, 'column', 'text', 'left', 1 WHERE @cards > 0
UNION ALL SELECT @cards, 1, 'tinted', 'text', 'no', 2 WHERE @cards > 0
UNION ALL SELECT @cards, 1, 'title', 'text', f.text_value, 3 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 1 AND f.field_key = 'heading'
UNION ALL SELECT @cards, 1, 'body', 'richtext', f.text_value, 4 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 1 AND f.field_key = 'text';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @cards, 2, 'column', 'text', 'right', 1 WHERE @cards > 0
UNION ALL SELECT @cards, 2, 'tinted', 'text', 'yes', 2 WHERE @cards > 0
UNION ALL SELECT @cards, 2, 'title', 'text', f.text_value, 3 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 2 AND f.field_key = 'heading'
UNION ALL SELECT @cards, 2, 'body', 'richtext', f.text_value, 4 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 2 AND f.field_key = 'text';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @cards, 3, 'column', 'text', 'left', 1 WHERE @cards > 0
UNION ALL SELECT @cards, 3, 'tinted', 'text', 'yes', 2 WHERE @cards > 0
UNION ALL SELECT @cards, 3, 'title', 'text', f.text_value, 3 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 3 AND f.field_key = 'heading'
UNION ALL SELECT @cards, 3, 'body', 'richtext', f.text_value, 4 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 3 AND f.field_key = 'text';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @cards, 4, 'column', 'text', 'right', 1 WHERE @cards > 0
UNION ALL SELECT @cards, 4, 'tinted', 'text', 'no', 2 WHERE @cards > 0
UNION ALL SELECT @cards, 4, 'title', 'text', f.text_value, 3 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 4 AND f.field_key = 'heading'
UNION ALL SELECT @cards, 4, 'body', 'richtext', f.text_value, 4 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 4 AND f.field_key = 'text';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @cards, 5, 'column', 'text', 'right', 1 WHERE @cards > 0
UNION ALL SELECT @cards, 5, 'tinted', 'text', 'yes', 2 WHERE @cards > 0
UNION ALL SELECT @cards, 5, 'title', 'text', f.text_value, 3 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec8 AND f.item_index = 1 AND f.field_key = 'heading'
UNION ALL SELECT @cards, 5, 'body', 'richtext', f.text_value, 4 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec8 AND f.item_index = 1 AND f.field_key = 'text';
DELETE FROM page_sections WHERE @cards > 0 AND id IN (@sec7, @sec8);
UPDATE page_sections SET sort_order = 7 WHERE id = @cards AND @cards > 0;

SET @old = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 9 AND block_type = 'icon_box_group' LIMIT 1);
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page_id, 'checklist_callout', '', 95 WHERE @old IS NOT NULL;
SET @new = IF(@old IS NOT NULL AND ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @new AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Your Role' AS text_value, 1 AS sort_order
UNION ALL SELECT @new, 0, 'subtext', 'text', 'in Staying Safe', 2
UNION ALL SELECT @new, 0, 'layout', 'text', 'split', 3
UNION ALL SELECT @new, 1, 'text', 'text', 'Never share your login or wallet credentials', 4
UNION ALL SELECT @new, 2, 'text', 'text', 'Use 2-factor authentication (2FA) where available', 5
UNION ALL SELECT @new, 3, 'text', 'text', 'Stick to casinos verified on our trusted Thai casino list', 6
) AS rows_to_insert WHERE @new > 0;
DELETE FROM page_sections WHERE id = @old AND @new > 0;
UPDATE page_sections SET sort_order = 9 WHERE id = @new AND @new > 0;

-- ===================== TH rtp =====================
SET @page_id = (SELECT p.id FROM pages p JOIN pages region ON region.id = p.parent_id WHERE region.slug = 'th' AND p.slug = 'rtp');
UPDATE page_section_fields f JOIN page_sections s ON s.id = f.section_id
SET f.text_value = 'Good RTP?'
WHERE s.page_id = @page_id AND s.block_type = 'faq' AND f.item_index = 1 AND f.field_key = 'question' AND f.text_value = 'What counts as a good RTP?';
UPDATE page_sections SET custom_class = 'section--tight-top'
WHERE page_id = @page_id AND sort_order = 7 AND block_type = 'highlight_panel' AND custom_class = '';

-- ===================== MY payment-methods =====================
SET @page_id = (SELECT p.id FROM pages p JOIN pages region ON region.id = p.parent_id WHERE region.slug = 'my' AND p.slug = 'payment-methods');

SET @deposit = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 4 AND block_type = 'numbered_steps' LIMIT 1);
UPDATE page_section_fields SET text_value = 'Make a Deposit' WHERE section_id = @deposit AND item_index = 0 AND field_key = 'highlightText';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @deposit, 0, 'highlightText', 'text', 'Make a Deposit', 8 WHERE @deposit IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_section_fields WHERE section_id = @deposit AND item_index = 0 AND field_key = 'highlightText');
UPDATE page_section_fields SET text_value = 'primary' WHERE section_id = @deposit AND item_index = 0 AND field_key = 'accent';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @deposit, 0, 'accent', 'text', 'primary', 9 WHERE @deposit IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_section_fields WHERE section_id = @deposit AND item_index = 0 AND field_key = 'accent');
UPDATE page_section_fields SET text_value = '<p>Depositing money into a Malaysian-friendly online casino is quick and straightforward when you choose the right payment method. Here’s a complete guide to help you make your first deposit with confidence. You also can refer to our <a href="/my/reviews"><strong>most trusted Malaysian casino list</strong></a> for recommendations.</p>' WHERE section_id = @deposit AND item_index = 0 AND field_key = 'intro';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @deposit, 0, 'intro', 'richtext', '<p>Depositing money into a Malaysian-friendly online casino is quick and straightforward when you choose the right payment method. Here’s a complete guide to help you make your first deposit with confidence. You also can refer to our <a href="/my/reviews"><strong>most trusted Malaysian casino list</strong></a> for recommendations.</p>', 3 WHERE @deposit IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_section_fields WHERE section_id = @deposit AND item_index = 0 AND field_key = 'intro');
UPDATE page_section_fields SET text_value = '<p>Most deposits are processed instantly, especially with e-wallets and crypto.</p><ul><li>Follow the system prompts:<ul><li>For bank transfers, you’ll be redirected to your bank or given transfer details.</li><li>For e-wallets, you may be redirected to log in and confirm payment.</li><li>For crypto, the site will provide a wallet address to send the funds.</li></ul></li></ul>' WHERE section_id = @deposit AND item_index = 5 AND field_key = 'body';

SET @withdraw = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 5 AND block_type = 'numbered_steps' LIMIT 1);
UPDATE page_section_fields SET text_value = 'Withdraw Your Funds' WHERE section_id = @withdraw AND item_index = 0 AND field_key = 'highlightText';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @withdraw, 0, 'highlightText', 'text', 'Withdraw Your Funds', 8 WHERE @withdraw IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_section_fields WHERE section_id = @withdraw AND item_index = 0 AND field_key = 'highlightText');
UPDATE page_section_fields SET text_value = 'success' WHERE section_id = @withdraw AND item_index = 0 AND field_key = 'accent';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @withdraw, 0, 'accent', 'text', 'success', 9 WHERE @withdraw IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_section_fields WHERE section_id = @withdraw AND item_index = 0 AND field_key = 'accent');
UPDATE page_section_fields SET text_value = '<p>Before your first withdrawal, the casino must verify your identity (this is standard across all licensed platforms). This KYC process protects you from fraud and ensures your funds are safe.</p><p>You may need to upload:</p><ul><li>A government-issued ID (passport, national ID card)</li><li>Proof of address (utility bill, bank statement)</li><li>Payment method verification (screenshot or statement)</li></ul>' WHERE section_id = @withdraw AND item_index = 1 AND field_key = 'body';
UPDATE page_section_fields SET text_value = '<ul><li>Log into your casino account</li><li>Navigate to the “Withdrawal” or “Cashier” section</li><li>Select the same payment method used for your deposit (most casinos require this)</li></ul>' WHERE section_id = @withdraw AND item_index = 2 AND field_key = 'body';
UPDATE page_section_fields SET text_value = '<p>Always read the casino’s withdrawal policy to avoid delays.</p><ul><li>Choose the amount you want to cash out</li><li>Make sure it’s within the minimum and maximum withdrawal limits</li><li>Some methods may charge a small fee—check before confirming</li></ul>' WHERE section_id = @withdraw AND item_index = 3 AND field_key = 'body';
UPDATE page_section_fields SET text_value = '<ul><li>Submit your withdrawal request</li><li>You’ll receive a confirmation email or notification</li><li>Processing times vary by method (e.g., e-wallets: ~1–6 hrs, bank transfers: 1–2 days)</li></ul>' WHERE section_id = @withdraw AND item_index = 4 AND field_key = 'body';
UPDATE page_section_fields SET text_value = '<ul><li>Most casinos allow you to track the status under “Transaction History”</li><li>Once approved, the funds will be transferred to your chosen method</li></ul>' WHERE section_id = @withdraw AND item_index = 5 AND field_key = 'body';

SET @old = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 6 AND block_type = 'icon_box_group' LIMIT 1);
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page_id, 'checklist_callout', '', 65 WHERE @old IS NOT NULL;
SET @new = IF(@old IS NOT NULL AND ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @new AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Safety Tips' AS text_value, 1 AS sort_order
UNION ALL SELECT @new, 0, 'subtext', 'text', 'for Withdrawing in Malaysia', 2
UNION ALL SELECT @new, 0, 'layout', 'text', 'split', 3
UNION ALL SELECT @new, 1, 'text', 'text', 'Use licensed casinos only to avoid delayed or blocked withdrawals', 4
UNION ALL SELECT @new, 2, 'text', 'text', 'Avoid using third-party accounts (must match your name)', 5
UNION ALL SELECT @new, 3, 'text', 'text', 'Enable 2FA for added account security', 6
UNION ALL SELECT @new, 4, 'text', 'text', 'Double-check fees and limits before confirming', 7
UNION ALL SELECT @new, 0, 'bgType', 'text', 'color', 8
UNION ALL SELECT @new, 0, 'bgFrom', 'text', 'surface-muted', 9
UNION ALL SELECT @new, 0, 'bgTo', 'text', 'surface-muted', 10
) AS rows_to_insert WHERE @new > 0;
DELETE FROM page_sections WHERE id = @old AND @new > 0;
UPDATE page_sections SET sort_order = 6 WHERE id = @new AND @new > 0;

SET @sec7 = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 7 AND block_type = 'icon_box_group' LIMIT 1);
SET @sec8 = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 8 AND block_type = 'icon_box_group' LIMIT 1);
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page_id, 'info_card_columns', '', 75 WHERE @sec7 IS NOT NULL;
SET @cards = IF(@sec7 IS NOT NULL AND ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @cards, 0, 'heading', 'text', 'Our Recommended Payment Security Standards to Protect You', 1 WHERE @cards > 0
UNION ALL SELECT @cards, 0, 'intro', 'richtext', f.text_value, 2 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 0 AND f.field_key = 'body';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @cards, 1, 'column', 'text', 'left', 1 WHERE @cards > 0
UNION ALL SELECT @cards, 1, 'tinted', 'text', 'no', 2 WHERE @cards > 0
UNION ALL SELECT @cards, 1, 'title', 'text', f.text_value, 3 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 1 AND f.field_key = 'heading'
UNION ALL SELECT @cards, 1, 'body', 'richtext', f.text_value, 4 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 1 AND f.field_key = 'text';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @cards, 2, 'column', 'text', 'right', 1 WHERE @cards > 0
UNION ALL SELECT @cards, 2, 'tinted', 'text', 'yes', 2 WHERE @cards > 0
UNION ALL SELECT @cards, 2, 'title', 'text', f.text_value, 3 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 2 AND f.field_key = 'heading'
UNION ALL SELECT @cards, 2, 'body', 'richtext', f.text_value, 4 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 2 AND f.field_key = 'text';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @cards, 3, 'column', 'text', 'left', 1 WHERE @cards > 0
UNION ALL SELECT @cards, 3, 'tinted', 'text', 'yes', 2 WHERE @cards > 0
UNION ALL SELECT @cards, 3, 'title', 'text', f.text_value, 3 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 3 AND f.field_key = 'heading'
UNION ALL SELECT @cards, 3, 'body', 'richtext', f.text_value, 4 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 3 AND f.field_key = 'text';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @cards, 4, 'column', 'text', 'right', 1 WHERE @cards > 0
UNION ALL SELECT @cards, 4, 'tinted', 'text', 'no', 2 WHERE @cards > 0
UNION ALL SELECT @cards, 4, 'title', 'text', f.text_value, 3 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 4 AND f.field_key = 'heading'
UNION ALL SELECT @cards, 4, 'body', 'richtext', f.text_value, 4 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 4 AND f.field_key = 'text';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @cards, 5, 'column', 'text', 'right', 1 WHERE @cards > 0
UNION ALL SELECT @cards, 5, 'tinted', 'text', 'yes', 2 WHERE @cards > 0
UNION ALL SELECT @cards, 5, 'title', 'text', f.text_value, 3 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec8 AND f.item_index = 1 AND f.field_key = 'heading'
UNION ALL SELECT @cards, 5, 'body', 'richtext', f.text_value, 4 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec8 AND f.item_index = 1 AND f.field_key = 'text';
DELETE FROM page_sections WHERE @cards > 0 AND id IN (@sec7, @sec8);
UPDATE page_sections SET sort_order = 7 WHERE id = @cards AND @cards > 0;

SET @old = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 9 AND block_type = 'icon_box_group' LIMIT 1);
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page_id, 'checklist_callout', '', 95 WHERE @old IS NOT NULL;
SET @new = IF(@old IS NOT NULL AND ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @new AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Your Role' AS text_value, 1 AS sort_order
UNION ALL SELECT @new, 0, 'subtext', 'text', 'in Staying Safe', 2
UNION ALL SELECT @new, 0, 'layout', 'text', 'split', 3
UNION ALL SELECT @new, 1, 'text', 'text', 'Never share your login or wallet credentials', 4
UNION ALL SELECT @new, 2, 'text', 'text', 'Use 2-factor authentication (2FA) where available', 5
UNION ALL SELECT @new, 3, 'text', 'text', 'Stick to casinos verified on our trusted Malaysian casino list', 6
) AS rows_to_insert WHERE @new > 0;
DELETE FROM page_sections WHERE id = @old AND @new > 0;
UPDATE page_sections SET sort_order = 9 WHERE id = @new AND @new > 0;

-- ===================== MY rtp =====================
SET @page_id = (SELECT p.id FROM pages p JOIN pages region ON region.id = p.parent_id WHERE region.slug = 'my' AND p.slug = 'rtp');
UPDATE page_section_fields f JOIN page_sections s ON s.id = f.section_id
SET f.text_value = 'Good RTP?'
WHERE s.page_id = @page_id AND s.block_type = 'faq' AND f.item_index = 1 AND f.field_key = 'question' AND f.text_value = 'What counts as a good RTP?';
UPDATE page_sections SET custom_class = 'section--tight-top'
WHERE page_id = @page_id AND sort_order = 7 AND block_type = 'highlight_panel' AND custom_class = '';

-- ===================== SG payment-methods =====================
SET @page_id = (SELECT p.id FROM pages p JOIN pages region ON region.id = p.parent_id WHERE region.slug = 'sg' AND p.slug = 'payment-methods');

SET @deposit = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 4 AND block_type = 'numbered_steps' LIMIT 1);
UPDATE page_section_fields SET text_value = 'Make a Deposit' WHERE section_id = @deposit AND item_index = 0 AND field_key = 'highlightText';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @deposit, 0, 'highlightText', 'text', 'Make a Deposit', 8 WHERE @deposit IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_section_fields WHERE section_id = @deposit AND item_index = 0 AND field_key = 'highlightText');
UPDATE page_section_fields SET text_value = 'primary' WHERE section_id = @deposit AND item_index = 0 AND field_key = 'accent';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @deposit, 0, 'accent', 'text', 'primary', 9 WHERE @deposit IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_section_fields WHERE section_id = @deposit AND item_index = 0 AND field_key = 'accent');
UPDATE page_section_fields SET text_value = '<p>Depositing money into a Singaporean-friendly online casino is quick and straightforward when you choose the right payment method. Here’s a complete guide to help you make your first deposit with confidence. You also can refer to our <a href="/sg/reviews"><strong>most trusted Singaporean casino list</strong></a> for recommendations.</p>' WHERE section_id = @deposit AND item_index = 0 AND field_key = 'intro';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @deposit, 0, 'intro', 'richtext', '<p>Depositing money into a Singaporean-friendly online casino is quick and straightforward when you choose the right payment method. Here’s a complete guide to help you make your first deposit with confidence. You also can refer to our <a href="/sg/reviews"><strong>most trusted Singaporean casino list</strong></a> for recommendations.</p>', 3 WHERE @deposit IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_section_fields WHERE section_id = @deposit AND item_index = 0 AND field_key = 'intro');
UPDATE page_section_fields SET text_value = '<p>Most deposits are processed instantly, especially with e-wallets and crypto.</p><ul><li>Follow the system prompts:<ul><li>For bank transfers, you’ll be redirected to your bank or given transfer details.</li><li>For e-wallets, you may be redirected to log in and confirm payment.</li><li>For crypto, the site will provide a wallet address to send the funds.</li></ul></li></ul>' WHERE section_id = @deposit AND item_index = 5 AND field_key = 'body';

SET @withdraw = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 5 AND block_type = 'numbered_steps' LIMIT 1);
UPDATE page_section_fields SET text_value = 'Withdraw Your Funds' WHERE section_id = @withdraw AND item_index = 0 AND field_key = 'highlightText';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @withdraw, 0, 'highlightText', 'text', 'Withdraw Your Funds', 8 WHERE @withdraw IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_section_fields WHERE section_id = @withdraw AND item_index = 0 AND field_key = 'highlightText');
UPDATE page_section_fields SET text_value = 'success' WHERE section_id = @withdraw AND item_index = 0 AND field_key = 'accent';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @withdraw, 0, 'accent', 'text', 'success', 9 WHERE @withdraw IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_section_fields WHERE section_id = @withdraw AND item_index = 0 AND field_key = 'accent');
UPDATE page_section_fields SET text_value = '<p>Before your first withdrawal, the casino must verify your identity (this is standard across all licensed platforms). This KYC process protects you from fraud and ensures your funds are safe.</p><p>You may need to upload:</p><ul><li>A government-issued ID (passport, national ID card)</li><li>Proof of address (utility bill, bank statement)</li><li>Payment method verification (screenshot or statement)</li></ul>' WHERE section_id = @withdraw AND item_index = 1 AND field_key = 'body';
UPDATE page_section_fields SET text_value = '<ul><li>Log into your casino account</li><li>Navigate to the “Withdrawal” or “Cashier” section</li><li>Select the same payment method used for your deposit (most casinos require this)</li></ul>' WHERE section_id = @withdraw AND item_index = 2 AND field_key = 'body';
UPDATE page_section_fields SET text_value = '<p>Always read the casino’s withdrawal policy to avoid delays.</p><ul><li>Choose the amount you want to cash out</li><li>Make sure it’s within the minimum and maximum withdrawal limits</li><li>Some methods may charge a small fee—check before confirming</li></ul>' WHERE section_id = @withdraw AND item_index = 3 AND field_key = 'body';
UPDATE page_section_fields SET text_value = '<ul><li>Submit your withdrawal request</li><li>You’ll receive a confirmation email or notification</li><li>Processing times vary by method (e.g., e-wallets: ~1–6 hrs, bank transfers: 1–2 days)</li></ul>' WHERE section_id = @withdraw AND item_index = 4 AND field_key = 'body';
UPDATE page_section_fields SET text_value = '<ul><li>Most casinos allow you to track the status under “Transaction History”</li><li>Once approved, the funds will be transferred to your chosen method</li></ul>' WHERE section_id = @withdraw AND item_index = 5 AND field_key = 'body';

SET @old = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 6 AND block_type = 'icon_box_group' LIMIT 1);
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page_id, 'checklist_callout', '', 65 WHERE @old IS NOT NULL;
SET @new = IF(@old IS NOT NULL AND ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @new AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Safety Tips' AS text_value, 1 AS sort_order
UNION ALL SELECT @new, 0, 'subtext', 'text', 'for Withdrawing in Singapore', 2
UNION ALL SELECT @new, 0, 'layout', 'text', 'split', 3
UNION ALL SELECT @new, 1, 'text', 'text', 'Use licensed casinos only to avoid delayed or blocked withdrawals', 4
UNION ALL SELECT @new, 2, 'text', 'text', 'Avoid using third-party accounts (must match your name)', 5
UNION ALL SELECT @new, 3, 'text', 'text', 'Enable 2FA for added account security', 6
UNION ALL SELECT @new, 4, 'text', 'text', 'Double-check fees and limits before confirming', 7
UNION ALL SELECT @new, 0, 'bgType', 'text', 'color', 8
UNION ALL SELECT @new, 0, 'bgFrom', 'text', 'surface-muted', 9
UNION ALL SELECT @new, 0, 'bgTo', 'text', 'surface-muted', 10
) AS rows_to_insert WHERE @new > 0;
DELETE FROM page_sections WHERE id = @old AND @new > 0;
UPDATE page_sections SET sort_order = 6 WHERE id = @new AND @new > 0;

SET @sec7 = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 7 AND block_type = 'icon_box_group' LIMIT 1);
SET @sec8 = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 8 AND block_type = 'icon_box_group' LIMIT 1);
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page_id, 'info_card_columns', '', 75 WHERE @sec7 IS NOT NULL;
SET @cards = IF(@sec7 IS NOT NULL AND ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @cards, 0, 'heading', 'text', 'Our Recommended Payment Security Standards to Protect You', 1 WHERE @cards > 0
UNION ALL SELECT @cards, 0, 'intro', 'richtext', f.text_value, 2 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 0 AND f.field_key = 'body';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @cards, 1, 'column', 'text', 'left', 1 WHERE @cards > 0
UNION ALL SELECT @cards, 1, 'tinted', 'text', 'no', 2 WHERE @cards > 0
UNION ALL SELECT @cards, 1, 'title', 'text', f.text_value, 3 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 1 AND f.field_key = 'heading'
UNION ALL SELECT @cards, 1, 'body', 'richtext', f.text_value, 4 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 1 AND f.field_key = 'text';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @cards, 2, 'column', 'text', 'right', 1 WHERE @cards > 0
UNION ALL SELECT @cards, 2, 'tinted', 'text', 'yes', 2 WHERE @cards > 0
UNION ALL SELECT @cards, 2, 'title', 'text', f.text_value, 3 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 2 AND f.field_key = 'heading'
UNION ALL SELECT @cards, 2, 'body', 'richtext', f.text_value, 4 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 2 AND f.field_key = 'text';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @cards, 3, 'column', 'text', 'left', 1 WHERE @cards > 0
UNION ALL SELECT @cards, 3, 'tinted', 'text', 'yes', 2 WHERE @cards > 0
UNION ALL SELECT @cards, 3, 'title', 'text', f.text_value, 3 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 3 AND f.field_key = 'heading'
UNION ALL SELECT @cards, 3, 'body', 'richtext', f.text_value, 4 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 3 AND f.field_key = 'text';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @cards, 4, 'column', 'text', 'right', 1 WHERE @cards > 0
UNION ALL SELECT @cards, 4, 'tinted', 'text', 'no', 2 WHERE @cards > 0
UNION ALL SELECT @cards, 4, 'title', 'text', f.text_value, 3 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 4 AND f.field_key = 'heading'
UNION ALL SELECT @cards, 4, 'body', 'richtext', f.text_value, 4 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec7 AND f.item_index = 4 AND f.field_key = 'text';
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @cards, 5, 'column', 'text', 'right', 1 WHERE @cards > 0
UNION ALL SELECT @cards, 5, 'tinted', 'text', 'yes', 2 WHERE @cards > 0
UNION ALL SELECT @cards, 5, 'title', 'text', f.text_value, 3 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec8 AND f.item_index = 1 AND f.field_key = 'heading'
UNION ALL SELECT @cards, 5, 'body', 'richtext', f.text_value, 4 FROM page_section_fields f WHERE @cards > 0 AND f.section_id = @sec8 AND f.item_index = 1 AND f.field_key = 'text';
DELETE FROM page_sections WHERE @cards > 0 AND id IN (@sec7, @sec8);
UPDATE page_sections SET sort_order = 7 WHERE id = @cards AND @cards > 0;

SET @old = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 9 AND block_type = 'icon_box_group' LIMIT 1);
INSERT INTO page_sections (page_id, block_type, custom_class, sort_order) SELECT @page_id, 'checklist_callout', '', 95 WHERE @old IS NOT NULL;
SET @new = IF(@old IS NOT NULL AND ROW_COUNT() > 0, LAST_INSERT_ID(), 0);
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @new AS section_id, 0 AS item_index, 'heading' AS field_key, 'text' AS field_type, 'Your Role' AS text_value, 1 AS sort_order
UNION ALL SELECT @new, 0, 'subtext', 'text', 'in Staying Safe', 2
UNION ALL SELECT @new, 0, 'layout', 'text', 'split', 3
UNION ALL SELECT @new, 1, 'text', 'text', 'Never share your login or wallet credentials', 4
UNION ALL SELECT @new, 2, 'text', 'text', 'Use 2-factor authentication (2FA) where available', 5
UNION ALL SELECT @new, 3, 'text', 'text', 'Stick to casinos verified on our trusted Singaporean casino list', 6
) AS rows_to_insert WHERE @new > 0;
DELETE FROM page_sections WHERE id = @old AND @new > 0;
UPDATE page_sections SET sort_order = 9 WHERE id = @new AND @new > 0;

-- ===================== SG rtp =====================
SET @page_id = (SELECT p.id FROM pages p JOIN pages region ON region.id = p.parent_id WHERE region.slug = 'sg' AND p.slug = 'rtp');
UPDATE page_section_fields f JOIN page_sections s ON s.id = f.section_id
SET f.text_value = 'Good RTP?'
WHERE s.page_id = @page_id AND s.block_type = 'faq' AND f.item_index = 1 AND f.field_key = 'question' AND f.text_value = 'What counts as a good RTP?';
UPDATE page_sections SET custom_class = 'section--tight-top'
WHERE page_id = @page_id AND sort_order = 7 AND block_type = 'highlight_panel' AND custom_class = '';

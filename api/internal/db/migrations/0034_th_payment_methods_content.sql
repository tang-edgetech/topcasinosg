-- Seeds real content (sourced from the Figma frame "D / Country / TH /
-- Payment Method") onto the "payment-methods" page under the Thailand
-- region page (created by 0033), matching the 6 requested sections: Most
-- Trusted Payment Methods, Fees/Processing Time/Limits, How to Deposit, How
-- to Withdraw, Payment Security Standards, FAQs. Uses the "comparison_table"
-- and "numbered_steps" block types added alongside this migration. Guarded
-- by NOT EXISTS on the target page already having sections, so this only
-- ever seeds once and never clobbers admin edits made afterward.

SET @page_id = (
  SELECT p.id FROM pages p
  JOIN pages region ON region.id = p.parent_id
  WHERE region.slug = 'th' AND p.slug = 'payment-methods'
  LIMIT 1
);

-- Section 1: Most Trusted Payment Methods (icon_box_group, 5 boxes)
INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'icon_box_group', 1 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'Most Trusted Payment Methods in Thailand', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'displayMode', 'text', 'default', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'layout', 'text', 'vertical', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'columns', 'text', '1', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'colorNormal', 'text', 'primary', 5 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'colorHover', 'text', 'secondary', 6 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'colorActive', 'text', 'primary', 7 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingAlignMobile', 'text', 'left', 9 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingAlignDesktop', 'text', 'left', 10 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 11 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'heading', 'text', 'Local Bank Transfers', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'text', 'richtext', '<p>Local bank transfers remain the top choice for many Thai players due to familiarity and ease of use. Most Thai online casinos support direct transfers from major banks. It''s ideal for players who prefer direct THB transfers with no third-party apps.</p><p><strong>Supported Banks May Include:</strong> Kasikorn Bank (KBank), Siam Commercial Bank (SCB), Bangkok Bank, Krungthai Bank, TMBThanachart Bank (ttb)</p><p><strong>Why Players Use It:</strong></p><ul><li>Strong trust and brand recognition</li><li>THB deposits without currency conversion</li><li>Works with internet and mobile banking apps</li><li>May take 1-24 hours for withdrawals</li></ul>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 2, 'heading', 'text', 'E-Wallets', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'text', 'richtext', '<p>E-wallets are ideal for mobile-first users and players who prioritize speed and privacy. Most e-wallet transactions are processed instantly.</p><p><strong>Popular Options in Thailand:</strong> TrueMoney Wallet, Skrill, Neteller, AirPay, Line Pay</p><p><strong>Why Players Use It:</strong></p><ul><li>Instant deposits</li><li>Withdrawals typically under 6 hours</li><li>Extra security with 2FA</li><li>Easy to link with local bank accounts</li></ul>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 3, 'heading', 'text', 'Cryptocurrencies', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'text', 'richtext', '<p>Crypto offers unmatched privacy and global accessibility for players seeking anonymous, borderless transactions. However, users should understand wallet setup and volatility risks.</p><p><strong>Common Coins Accepted:</strong> Bitcoin (BTC), Ethereum (ETH), Tether (USDT), Binance Coin (BNB)</p><p><strong>Why Players Use It:</strong></p><ul><li>High withdrawal limits</li><li>Low fees</li><li>Faster international transfers</li><li>No bank involvement</li></ul>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 4, 'heading', 'text', 'Credit & Debit Cards', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'text', 'richtext', '<p>Cards are a familiar method for many players, especially those used to international online purchases.</p><p><strong>Typically Accepted:</strong> Visa, Mastercard, UnionPay</p><p><strong>Why Players Use It:</strong></p><ul><li>Fast deposits</li><li>Withdrawals may not be available for all cards</li><li>Some Thai banks may block gambling-related charges</li><li>Ideal for use with international platforms</li></ul>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 5, 'heading', 'text', 'Mobile Payment Solutions', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'text', 'richtext', '<p>For players on the go, mobile-focused payment systems provide fast and convenient transactions without switching devices.</p><p><strong>Examples:</strong> PromptPay, QR code transfers, mobile banking apps (e.g., SCB Easy, K PLUS)</p><p><strong>Why Players Use It:</strong></p><ul><li>Perfect for mobile casino play</li><li>Seamless integration with Thai banks</li><li>Real-time payment confirmations</li></ul>', 3 WHERE @sec > 0;

-- Section 2: Trust Factors callout (icon_box_group, heading + body only)
INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'icon_box_group', 2 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 1)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 2);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'Trust Factors', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p><strong>You Should Look for in Online Casinos</strong></p><ul><li>SSL encryption on checkout pages</li><li>Casino license and regulator-backed policies</li><li>Clear T&amp;Cs for deposit/withdrawal limits and processing times</li><li>Player reviews and forum mentions</li></ul>', 8 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'columns', 'text', '1', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', 11 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'white', 12 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'white', 13 WHERE @sec > 0
) AS ignored;

-- Section 3: Fees, Processing Time & Limits (comparison_table)
INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'comparison_table', 3 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 2)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 3);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'Fees, Processing Time & Limits', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Choosing the right payment method can impact your gaming experience significantly. From how quickly you receive your winnings to how much you can deposit or withdraw, every option has its pros and cons.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'tipHeading', 'text', 'Use this table to:', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'tipBody', 'richtext', '<ul><li>Identify the fastest withdrawal options</li><li>Avoid unnecessary transaction fees</li><li>Find THB-friendly deposit methods</li><li>Choose secure and verified channels for real money play</li></ul>', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'recommendation', 'richtext', '<p>We only recommend payment methods supported by licensed casinos with proper security standards (SSL encryption, AML compliance, and ID verification where required).</p>', 5 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'label', 'text', 'TrueMoney Wallet', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'options', 'text', 'E-wallet - Instant top-up', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'processingTime', 'text', 'Instant to 6 Hours', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 2, 'label', 'text', 'Kasikorn Bank Transfer', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'options', 'text', 'Bank transfer - Direct THB', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'processingTime', 'text', '1 to 24 Hours', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 3, 'label', 'text', 'USDT (Crypto)', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'options', 'text', 'Crypto - Blockchain transfer', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'processingTime', 'text', 'Instant to 1 Hour', 3 WHERE @sec > 0
) AS ignored;

-- Section 4: How to Make a Deposit (numbered_steps, 6 steps)
INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'numbered_steps', 4 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 3)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 4);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'How to Make a Deposit', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'at Online Casinos in Thailand', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Depositing money into a Thai-friendly online casino is quick and straightforward when you choose the right payment method. Here''s a complete guide to help you make your first deposit with confidence. You can also refer to our most trusted Thai casino list for recommendations.</p>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose a Trusted Online Casino', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Pick a site that accepts Thai players, supports THB, and is licensed by a reputable regulator (e.g., PAGCOR, Curacao, MGA). Check if your preferred payment method is supported.</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 2, 'title', 'text', 'Register and Verify Your Account', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Sign up with your email and a secure password. Fill in accurate personal details (must match your payment method). Most casinos will ask you to verify your identity (upload ID/passport, proof of address) to ensure compliance with KYC (Know Your Customer) and improve account security.</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 3, 'title', 'text', 'Go to the Deposit/Cashier Section', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Log in and navigate to the "Cashier", "Wallet", or "Deposit" area. Choose your preferred payment method (e.g., bank transfer, e-wallet, crypto).</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 4, 'title', 'text', 'Enter Deposit Amount', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Input the amount you wish to deposit (within the min/max limits shown). Make sure to check if there''s a bonus code you can apply for promotions!</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 5, 'title', 'text', 'Complete the Transaction', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Follow the system prompts: for bank transfers, you''ll be redirected to your bank or given transfer details; for e-wallets, you may be redirected to log in and confirm payment; for crypto, the site will provide a wallet address to send the funds.</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 6, 'title', 'text', 'Check Your Balance & Start Playing', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 6, 'body', 'richtext', '<p>Once confirmed, your funds will appear in your casino account. You''re now ready to explore games, claim bonuses, or join live tables.</p>', 2 WHERE @sec > 0
) AS ignored;

-- Section 5: How to Withdraw Your Funds (numbered_steps, 5 steps)
INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'numbered_steps', 5 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 4)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 5);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'How to Withdraw Your Funds', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'from Online Casinos in Thailand', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>After a winning streak, the next big moment is cashing out your funds. Withdrawing your money from a Thai-friendly online casino is safe and straightforward, as long as you follow a few key steps.</p>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'title', 'text', 'Confirm Your Account is Verified', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Before your first withdrawal, the casino must verify your identity (this is standard across all licensed platforms). This KYC process protects you from fraud and ensures your funds are safe. You may need to upload a government-issued ID (passport, national ID card), proof of address (utility bill, bank statement), and payment method verification (screenshot or statement).</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 2, 'title', 'text', 'Go to the Withdrawal or Cashier Page', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Log into your casino account, navigate to the "Withdrawal" or "Cashier" section, and select the same payment method used for your deposit (most casinos require this).</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 3, 'title', 'text', 'Enter Withdrawal Amount', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Always read the casino''s withdrawal policy to avoid delays. Choose the amount you want to cash out, making sure it''s within the minimum and maximum withdrawal limits - some methods may charge a small fee, so check before confirming.</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 4, 'title', 'text', 'Confirm the Request & Wait for Processing', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Submit your withdrawal request. You''ll receive a confirmation email or notification. Processing times vary by method (e.g., e-wallets: ~1-6 hrs, bank transfers: 1-2 days).</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 5, 'title', 'text', 'Track and Receive Your Winnings', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Most casinos allow you to track the status under "Transaction History". Once approved, the funds will be transferred to your chosen method.</p>', 2 WHERE @sec > 0
) AS ignored;

-- Section 6: Safety Tips callout (icon_box_group, heading + body only)
INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'icon_box_group', 6 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 5)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 6);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'Safety Tips', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p><strong>for Withdrawing in Thailand</strong></p><ul><li>Use licensed casinos only to avoid delayed or blocked withdrawals</li><li>Avoid using third-party accounts (must match your name)</li><li>Enable 2FA for added account security</li><li>Double-check fees and limits before confirming</li></ul>', 8 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'columns', 'text', '1', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', 11 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'white', 12 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'white', 13 WHERE @sec > 0
) AS ignored;

-- Section 7: Our Recommended Payment Security Standards (icon_box_group, 4 boxes, 2 columns)
INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'icon_box_group', 7 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 6)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 7);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'Our Recommended Payment Security Standards to Protect You', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p>Online casino payments involve sensitive information and real money. That''s why we only recommend platforms and methods that meet strict international security standards. Your money and personal data are always safe when using trusted casinos and verified payment methods.</p>', 8 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'columns', 'text', '2', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingAlignMobile', 'text', 'left', 9 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'headingAlignDesktop', 'text', 'left', 10 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 11 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'heading', 'text', 'Licensed & Regulated Casino Partners', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'text', 'richtext', '<p>We only list casinos that hold valid gaming licenses from respected authorities such as:</p><ul><li>Curacao eGaming</li><li>Malta Gaming Authority (MGA)</li><li>PAGCOR</li><li>Isle of Man &amp; Gibraltar Regulatory Bodies</li></ul><p>These licenses require casinos to comply with financial security, anti-fraud, and fair play standards to ensure that your funds are held in secure, segregated accounts.</p>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 2, 'heading', 'text', 'KYC & AML Compliance', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'text', 'richtext', '<p>Casinos we recommend enforce Know Your Customer (KYC) and Anti-Money Laundering (AML) protocols:</p><ul><li>Identity verification ensures funds are only accessed by the rightful owner</li><li>Prevents fraudulent withdrawals and bonus abuse</li><li>Adds an additional layer of trust for long-term players</li></ul>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 3, 'heading', 'text', 'End-to-End Encryption (SSL)', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'text', 'richtext', '<p>All listed casinos use SSL encryption (Secure Socket Layer) to protect data during deposits and withdrawals.</p><p><strong>What this means:</strong></p><ul><li>Your payment info is encrypted in transit</li><li>No third party can intercept your data</li><li>Look for the padlock icon in your browser bar</li></ul>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 4, 'heading', 'text', 'Secure Payment Gateways', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'text', 'richtext', '<p>All supported methods, including bank transfers, e-wallets, crypto, and cards, must process payments via PCI DSS-compliant gateways or blockchain smart contracts (for crypto), ensuring industry-standard safety.</p>', 3 WHERE @sec > 0
) AS ignored;

-- Section 8: Real Player Feedback & Continuous Monitoring (icon_box_group, 1 wide box)
INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'icon_box_group', 8 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 7)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 8);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'columns', 'text', '1', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 11 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'heading', 'text', 'Real Player Feedback & Continuous Monitoring', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'text', 'richtext', '<p>We monitor player complaints, withdrawal issues, and support response times regularly to ensure all payment methods and casinos continue to meet our quality and security benchmarks.</p>', 3 WHERE @sec > 0
) AS ignored;

-- Section 9: Your Role in Staying Safe callout (icon_box_group, heading + body only)
INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'icon_box_group', 9 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 8)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 9);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'Your Role', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p><strong>in Staying Safe</strong></p><ul><li>Never share your login or wallet credentials</li><li>Use 2-factor authentication (2FA) where available</li><li>Stick to casinos verified on our trusted Thai casino list</li><li>Double-check fees and limits before confirming</li></ul>', 8 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'columns', 'text', '1', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', 11 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'white', 12 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'white', 13 WHERE @sec > 0
) AS ignored;

-- Section 10: FAQs (faq, 4 items)
INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'faq', 10 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 9)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 10);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT * FROM (
SELECT @sec, 0, 'heading', 'text', 'FAQs', 1 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'question', 'text', 'Fastest method?', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>TrueMoney or Crypto.</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 2, 'question', 'text', 'TrueMoney for withdrawals?', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Yes, supported by many casinos.</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 3, 'question', 'text', 'Are crypto casinos safe?', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Yes, if licensed and encrypted.</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 4, 'question', 'text', 'Minimum deposit?', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Usually 100 THB.</p>', 2 WHERE @sec > 0
) AS ignored;

-- Publish the page now that it has real content.
UPDATE pages SET status = 'published' WHERE id = @page_id AND status = 'draft';

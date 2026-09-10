-- Same seeding as 0034 (Thailand), adapted for Malaysia and Singapore using
-- each region's own currency/banks and its real seeded Payment Methods
-- (see the "comparison_table" rows below). Guarded by NOT EXISTS so this
-- only ever seeds once and never clobbers admin edits made afterward.

-- ===================== MALAYSIA =====================
SET @page_id = (
  SELECT p.id FROM pages p
  JOIN pages region ON region.id = p.parent_id
  WHERE region.slug = 'my' AND p.slug = 'payment-methods'
  LIMIT 1
);

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'icon_box_group', 1 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'Most Trusted Payment Methods in Malaysia', 1 WHERE @sec > 0
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
UNION ALL SELECT @sec, 1, 'text', 'richtext', '<p>Local bank transfers remain the top choice for many Malaysian players due to familiarity and ease of use. Most Malaysia-friendly online casinos support direct transfers from major banks. It''s ideal for players who prefer direct MYR transfers with no third-party apps.</p><p><strong>Supported Banks May Include:</strong> Maybank, CIMB Bank, Public Bank, RHB Bank, Hong Leong Bank</p><p><strong>Why Players Use It:</strong></p><ul><li>Strong trust and brand recognition</li><li>MYR deposits without currency conversion</li><li>Works with internet and mobile banking apps, including DuitNow</li><li>May take 1-24 hours for withdrawals</li></ul>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 2, 'heading', 'text', 'E-Wallets', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'text', 'richtext', '<p>E-wallets are ideal for mobile-first users and players who prioritize speed and privacy. Most e-wallet transactions are processed instantly.</p><p><strong>Popular Options in Malaysia:</strong> Touch ''n Go eWallet, GrabPay, Boost, Skrill, Neteller</p><p><strong>Why Players Use It:</strong></p><ul><li>Instant deposits</li><li>Withdrawals typically under 6 hours</li><li>Extra security with 2FA</li><li>Easy to link with local bank accounts</li></ul>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 3, 'heading', 'text', 'Cryptocurrencies', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'text', 'richtext', '<p>Crypto offers unmatched privacy and global accessibility for players seeking anonymous, borderless transactions. However, users should understand wallet setup and volatility risks.</p><p><strong>Common Coins Accepted:</strong> Bitcoin (BTC), Ethereum (ETH), Tether (USDT), Binance Coin (BNB)</p><p><strong>Why Players Use It:</strong></p><ul><li>High withdrawal limits</li><li>Low fees</li><li>Faster international transfers</li><li>No bank involvement</li></ul>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 4, 'heading', 'text', 'Credit & Debit Cards', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'text', 'richtext', '<p>Cards are a familiar method for many players, especially those used to international online purchases.</p><p><strong>Typically Accepted:</strong> Visa, Mastercard, UnionPay</p><p><strong>Why Players Use It:</strong></p><ul><li>Fast deposits</li><li>Withdrawals may not be available for all cards</li><li>Some Malaysian banks may block gambling-related charges</li><li>Ideal for use with international platforms</li></ul>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 5, 'heading', 'text', 'Mobile Payment Solutions', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'text', 'richtext', '<p>For players on the go, mobile-focused payment systems provide fast and convenient transactions without switching devices.</p><p><strong>Examples:</strong> DuitNow QR, mobile banking apps (e.g., Maybank2u, CIMB Clicks)</p><p><strong>Why Players Use It:</strong></p><ul><li>Perfect for mobile casino play</li><li>Seamless integration with Malaysian banks</li><li>Real-time payment confirmations</li></ul>', 3 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'icon_box_group', 2 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 1)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 2);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'Trust Factors', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p><strong>You Should Look for in Online Casinos</strong></p><ul><li>SSL encryption on checkout pages</li><li>Casino license and regulator-backed policies</li><li>Clear T&amp;Cs for deposit/withdrawal limits and processing times</li><li>Player reviews and forum mentions</li></ul>', 8 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'columns', 'text', '1', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', 11 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'white', 12 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'white', 13 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'comparison_table', 3 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 2)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 3);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'Fees, Processing Time & Limits', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Choosing the right payment method can impact your gaming experience significantly. From how quickly you receive your winnings to how much you can deposit or withdraw, every option has its pros and cons.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'tipHeading', 'text', 'Use this table to:', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'tipBody', 'richtext', '<ul><li>Identify the fastest withdrawal options</li><li>Avoid unnecessary transaction fees</li><li>Find MYR-friendly deposit methods</li><li>Choose secure and verified channels for real money play</li></ul>', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'recommendation', 'richtext', '<p>We only recommend payment methods supported by licensed casinos with proper security standards (SSL encryption, AML compliance, and ID verification where required).</p>', 5 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'label', 'text', 'Touch ''n Go eWallet', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'options', 'text', 'E-wallet - Instant top-up', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'processingTime', 'text', 'Instant to 6 Hours', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 2, 'label', 'text', 'Maybank Transfer', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'options', 'text', 'Bank transfer - Direct MYR', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'processingTime', 'text', '1 to 24 Hours', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 3, 'label', 'text', 'Bitcoin', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'options', 'text', 'Crypto - Blockchain transfer', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'processingTime', 'text', 'Instant to 1 Hour', 3 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'numbered_steps', 4 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 3)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 4);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'How to Make a Deposit', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'at Online Casinos in Malaysia', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Depositing money into a Malaysia-friendly online casino is quick and straightforward when you choose the right payment method. Here''s a complete guide to help you make your first deposit with confidence. You can also refer to our most trusted Malaysia casino list for recommendations.</p>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose a Trusted Online Casino', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Pick a site that accepts Malaysian players, supports MYR, and is licensed by a reputable regulator (e.g., PAGCOR, Curacao, MGA). Check if your preferred payment method is supported.</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 2, 'title', 'text', 'Register and Verify Your Account', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Sign up with your email and a secure password. Fill in accurate personal details (must match your payment method). Most casinos will ask you to verify your identity (upload ID/passport, proof of address) to ensure compliance with KYC (Know Your Customer) and improve account security.</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 3, 'title', 'text', 'Go to the Deposit/Cashier Section', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Log in and navigate to the "Cashier", "Wallet", or "Deposit" area. Choose your preferred payment method (e.g., bank transfer, e-wallet, crypto).</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 4, 'title', 'text', 'Enter Deposit Amount', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Input the amount you wish to deposit (within the min/max limits shown). Make sure to check if there''s a bonus code you can apply for promotions!</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 5, 'title', 'text', 'Complete the Transaction', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Follow the system prompts: for bank transfers, you''ll be redirected to your bank or given transfer details; for e-wallets, you may be redirected to log in and confirm payment; for crypto, the site will provide a wallet address to send the funds.</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 6, 'title', 'text', 'Check Your Balance & Start Playing', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 6, 'body', 'richtext', '<p>Once confirmed, your funds will appear in your casino account. You''re now ready to explore games, claim bonuses, or join live tables.</p>', 2 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'numbered_steps', 5 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 4)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 5);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'How to Withdraw Your Funds', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'from Online Casinos in Malaysia', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>After a winning streak, the next big moment is cashing out your funds. Withdrawing your money from a Malaysia-friendly online casino is safe and straightforward, as long as you follow a few key steps.</p>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'title', 'text', 'Confirm Your Account is Verified', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Before your first withdrawal, the casino must verify your identity (this is standard across all licensed platforms). This KYC process protects you from fraud and ensures your funds are safe. You may need to upload a government-issued ID (passport, national ID card), proof of address (utility bill, bank statement), and payment method verification (screenshot or statement).</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 2, 'title', 'text', 'Go to the Withdrawal or Cashier Page', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Log into your casino account, navigate to the "Withdrawal" or "Cashier" section, and select the same payment method used for your deposit (most casinos require this).</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 3, 'title', 'text', 'Enter Withdrawal Amount', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Always read the casino''s withdrawal policy to avoid delays. Choose the amount you want to cash out, making sure it''s within the minimum and maximum withdrawal limits - some methods may charge a small fee, so check before confirming.</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 4, 'title', 'text', 'Confirm the Request & Wait for Processing', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Submit your withdrawal request. You''ll receive a confirmation email or notification. Processing times vary by method (e.g., e-wallets: ~1-6 hrs, bank transfers: 1-2 days).</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 5, 'title', 'text', 'Track and Receive Your Winnings', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Most casinos allow you to track the status under "Transaction History". Once approved, the funds will be transferred to your chosen method.</p>', 2 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'icon_box_group', 6 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 5)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 6);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'Safety Tips', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p><strong>for Withdrawing in Malaysia</strong></p><ul><li>Use licensed casinos only to avoid delayed or blocked withdrawals</li><li>Avoid using third-party accounts (must match your name)</li><li>Enable 2FA for added account security</li><li>Double-check fees and limits before confirming</li></ul>', 8 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'columns', 'text', '1', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', 11 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'white', 12 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'white', 13 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'icon_box_group', 7 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 6)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 7);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
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
UNION ALL SELECT @sec, 4, 'text', 'richtext', '<p>All supported methods, including bank transfers, e-wallets, crypto, and cards, must process payments via PCI DSS-compliant gateways or blockchain smart contracts (for crypto), ensuring industry-standard safety.</p>', 3 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'icon_box_group', 8 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 7)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 8);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'columns', 'text', '1', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 11 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'heading', 'text', 'Real Player Feedback & Continuous Monitoring', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'text', 'richtext', '<p>We monitor player complaints, withdrawal issues, and support response times regularly to ensure all payment methods and casinos continue to meet our quality and security benchmarks.</p>', 3 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'icon_box_group', 9 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 8)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 9);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'Your Role', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p><strong>in Staying Safe</strong></p><ul><li>Never share your login or wallet credentials</li><li>Use 2-factor authentication (2FA) where available</li><li>Stick to casinos verified on our trusted Malaysia casino list</li><li>Double-check fees and limits before confirming</li></ul>', 8 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'columns', 'text', '1', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', 11 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'white', 12 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'white', 13 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'faq', 10 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 9)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 10);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'FAQs', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'question', 'text', 'Fastest method?', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>Touch ''n Go eWallet or Crypto.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'question', 'text', 'Touch ''n Go for withdrawals?', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Yes, supported by many casinos.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'question', 'text', 'Are crypto casinos safe?', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Yes, if licensed and encrypted.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'question', 'text', 'Minimum deposit?', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Usually 50 MYR.</p>', 2 WHERE @sec > 0;

UPDATE pages SET status = 'published' WHERE id = @page_id AND status = 'draft';

-- ===================== SINGAPORE =====================
SET @page_id = (
  SELECT p.id FROM pages p
  JOIN pages region ON region.id = p.parent_id
  WHERE region.slug = 'sg' AND p.slug = 'payment-methods'
  LIMIT 1
);

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'icon_box_group', 1 WHERE @page_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'Most Trusted Payment Methods in Singapore', 1 WHERE @sec > 0
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
UNION ALL SELECT @sec, 1, 'text', 'richtext', '<p>Local bank transfers remain a top choice for many Singaporean players due to familiarity and ease of use. Most Singapore-friendly online casinos support direct transfers from major banks. It''s ideal for players who prefer direct SGD transfers with no third-party apps.</p><p><strong>Supported Banks May Include:</strong> DBS/POSB, OCBC, UOB, Standard Chartered, Maybank Singapore</p><p><strong>Why Players Use It:</strong></p><ul><li>Strong trust and brand recognition</li><li>SGD deposits without currency conversion</li><li>Works with internet and mobile banking apps</li><li>May take 1-24 hours for withdrawals</li></ul>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 2, 'heading', 'text', 'E-Wallets', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'text', 'richtext', '<p>E-wallets are ideal for mobile-first users and players who prioritize speed and privacy. Most e-wallet transactions are processed instantly.</p><p><strong>Popular Options in Singapore:</strong> PayNow, GrabPay, PayLah!, Skrill, Neteller</p><p><strong>Why Players Use It:</strong></p><ul><li>Instant deposits</li><li>Withdrawals typically under 6 hours</li><li>Extra security with 2FA</li><li>Easy to link with local bank accounts</li></ul>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 3, 'heading', 'text', 'Cryptocurrencies', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'text', 'richtext', '<p>Crypto offers unmatched privacy and global accessibility for players seeking anonymous, borderless transactions. However, users should understand wallet setup and volatility risks.</p><p><strong>Common Coins Accepted:</strong> Bitcoin (BTC), Ethereum (ETH), Tether (USDT), Binance Coin (BNB)</p><p><strong>Why Players Use It:</strong></p><ul><li>High withdrawal limits</li><li>Low fees</li><li>Faster international transfers</li><li>No bank involvement</li></ul>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 4, 'heading', 'text', 'Credit & Debit Cards', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'text', 'richtext', '<p>Cards are a familiar method for many players, especially those used to international online purchases.</p><p><strong>Typically Accepted:</strong> Visa, Mastercard, UnionPay</p><p><strong>Why Players Use It:</strong></p><ul><li>Fast deposits</li><li>Withdrawals may not be available for all cards</li><li>Some Singapore banks may flag gambling-related charges</li><li>Ideal for use with international platforms</li></ul>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 5, 'heading', 'text', 'Mobile Payment Solutions', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'text', 'richtext', '<p>For players on the go, mobile-focused payment systems provide fast and convenient transactions without switching devices.</p><p><strong>Examples:</strong> PayNow QR, mobile banking apps (e.g., DBS PayLah!, OCBC Pay Anyone)</p><p><strong>Why Players Use It:</strong></p><ul><li>Perfect for mobile casino play</li><li>Seamless integration with Singapore banks</li><li>Real-time payment confirmations</li></ul>', 3 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'icon_box_group', 2 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 1)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 2);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'Trust Factors', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p><strong>You Should Look for in Online Casinos</strong></p><ul><li>SSL encryption on checkout pages</li><li>Casino license and regulator-backed policies</li><li>Clear T&amp;Cs for deposit/withdrawal limits and processing times</li><li>Player reviews and forum mentions</li></ul>', 8 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'columns', 'text', '1', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', 11 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'white', 12 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'white', 13 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'comparison_table', 3 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 2)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 3);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'Fees, Processing Time & Limits', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Choosing the right payment method can impact your gaming experience significantly. From how quickly you receive your winnings to how much you can deposit or withdraw, every option has its pros and cons.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'tipHeading', 'text', 'Use this table to:', 3 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'tipBody', 'richtext', '<ul><li>Identify the fastest withdrawal options</li><li>Avoid unnecessary transaction fees</li><li>Find SGD-friendly deposit methods</li><li>Choose secure and verified channels for real money play</li></ul>', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'recommendation', 'richtext', '<p>We only recommend payment methods supported by licensed casinos with proper security standards (SSL encryption, AML compliance, and ID verification where required).</p>', 5 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'label', 'text', 'PayNow', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'options', 'text', 'Instant transfer - Mobile number linked', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'processingTime', 'text', 'Instant to 1 Hour', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 2, 'label', 'text', 'DBS/POSB Transfer', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'options', 'text', 'Bank transfer - Direct SGD', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'processingTime', 'text', '1 to 24 Hours', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 3, 'label', 'text', 'Ethereum', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'options', 'text', 'Crypto - Blockchain transfer', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'processingTime', 'text', 'Instant to 1 Hour', 3 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'numbered_steps', 4 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 3)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 4);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'How to Make a Deposit', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'at Online Casinos in Singapore', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>Depositing money into a Singapore-friendly online casino is quick and straightforward when you choose the right payment method. Here''s a complete guide to help you make your first deposit with confidence. You can also refer to our most trusted Singapore casino list for recommendations.</p>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'title', 'text', 'Choose a Trusted Online Casino', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Pick a site that accepts Singapore players, supports SGD, and is licensed by a reputable regulator (e.g., PAGCOR, Curacao, MGA). Check if your preferred payment method is supported.</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 2, 'title', 'text', 'Register and Verify Your Account', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Sign up with your email and a secure password. Fill in accurate personal details (must match your payment method). Most casinos will ask you to verify your identity (upload ID/passport, proof of address) to ensure compliance with KYC (Know Your Customer) and improve account security.</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 3, 'title', 'text', 'Go to the Deposit/Cashier Section', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Log in and navigate to the "Cashier", "Wallet", or "Deposit" area. Choose your preferred payment method (e.g., bank transfer, e-wallet, crypto).</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 4, 'title', 'text', 'Enter Deposit Amount', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Input the amount you wish to deposit (within the min/max limits shown). Make sure to check if there''s a bonus code you can apply for promotions!</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 5, 'title', 'text', 'Complete the Transaction', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Follow the system prompts: for bank transfers, you''ll be redirected to your bank or given transfer details; for e-wallets, you may be redirected to log in and confirm payment; for crypto, the site will provide a wallet address to send the funds.</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 6, 'title', 'text', 'Check Your Balance & Start Playing', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 6, 'body', 'richtext', '<p>Once confirmed, your funds will appear in your casino account. You''re now ready to explore games, claim bonuses, or join live tables.</p>', 2 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'numbered_steps', 5 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 4)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 5);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'How to Withdraw Your Funds', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'subheading', 'text', 'from Online Casinos in Singapore', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'intro', 'richtext', '<p>After a winning streak, the next big moment is cashing out your funds. Withdrawing your money from a Singapore-friendly online casino is safe and straightforward, as long as you follow a few key steps.</p>', 3 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'title', 'text', 'Confirm Your Account is Verified', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'body', 'richtext', '<p>Before your first withdrawal, the casino must verify your identity (this is standard across all licensed platforms). This KYC process protects you from fraud and ensures your funds are safe. You may need to upload a government-issued ID (passport, national ID card), proof of address (utility bill, bank statement), and payment method verification (screenshot or statement).</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 2, 'title', 'text', 'Go to the Withdrawal or Cashier Page', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'body', 'richtext', '<p>Log into your casino account, navigate to the "Withdrawal" or "Cashier" section, and select the same payment method used for your deposit (most casinos require this).</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 3, 'title', 'text', 'Enter Withdrawal Amount', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'body', 'richtext', '<p>Always read the casino''s withdrawal policy to avoid delays. Choose the amount you want to cash out, making sure it''s within the minimum and maximum withdrawal limits - some methods may charge a small fee, so check before confirming.</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 4, 'title', 'text', 'Confirm the Request & Wait for Processing', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'body', 'richtext', '<p>Submit your withdrawal request. You''ll receive a confirmation email or notification. Processing times vary by method (e.g., e-wallets: ~1-6 hrs, bank transfers: 1-2 days).</p>', 2 WHERE @sec > 0

UNION ALL SELECT @sec, 5, 'title', 'text', 'Track and Receive Your Winnings', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'body', 'richtext', '<p>Most casinos allow you to track the status under "Transaction History". Once approved, the funds will be transferred to your chosen method.</p>', 2 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'icon_box_group', 6 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 5)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 6);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'Safety Tips', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p><strong>for Withdrawing in Singapore</strong></p><ul><li>Use licensed casinos only to avoid delayed or blocked withdrawals</li><li>Avoid using third-party accounts (must match your name)</li><li>Enable 2FA for added account security</li><li>Double-check fees and limits before confirming</li></ul>', 8 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'columns', 'text', '1', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', 11 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'white', 12 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'white', 13 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'icon_box_group', 7 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 6)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 7);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
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
UNION ALL SELECT @sec, 4, 'text', 'richtext', '<p>All supported methods, including bank transfers, e-wallets, crypto, and cards, must process payments via PCI DSS-compliant gateways or blockchain smart contracts (for crypto), ensuring industry-standard safety.</p>', 3 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'icon_box_group', 8 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 7)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 8);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'columns', 'text', '1', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'none', 11 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'heading', 'text', 'Real Player Feedback & Continuous Monitoring', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'text', 'richtext', '<p>We monitor player complaints, withdrawal issues, and support response times regularly to ensure all payment methods and casinos continue to meet our quality and security benchmarks.</p>', 3 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'icon_box_group', 9 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 8)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 9);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'Your Role', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'body', 'richtext', '<p><strong>in Staying Safe</strong></p><ul><li>Never share your login or wallet credentials</li><li>Use 2-factor authentication (2FA) where available</li><li>Stick to casinos verified on our trusted Singapore casino list</li><li>Double-check fees and limits before confirming</li></ul>', 8 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'columns', 'text', '1', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgType', 'text', 'color', 11 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgFrom', 'text', 'white', 12 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'bgTo', 'text', 'white', 13 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'faq', 10 WHERE @page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 9)
  AND NOT EXISTS (SELECT 1 FROM page_sections WHERE page_id = @page_id AND sort_order = 10);
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'FAQs', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'question', 'text', 'Fastest method?', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'answer', 'richtext', '<p>PayNow or Crypto.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'question', 'text', 'PayNow for withdrawals?', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'answer', 'richtext', '<p>Yes, supported by many casinos.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'question', 'text', 'Are crypto casinos safe?', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'answer', 'richtext', '<p>Yes, if licensed and encrypted.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'question', 'text', 'Minimum deposit?', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'answer', 'richtext', '<p>Usually 20 SGD.</p>', 2 WHERE @sec > 0;

UPDATE pages SET status = 'published' WHERE id = @page_id AND status = 'draft';

-- Replaces the generic icon_box_group sections seeded in 0034/0036/0037 for
-- "Most Trusted Payment Methods" (sort_order 1) and "Trust Factors"
-- (sort_order 2) with the two new block types built specifically for this
-- card layout (feature_cards, checklist_callout) - the generic icon-box
-- component can't produce the bordered-card / heading+description-above-
-- image-and-details structure the reference design actually uses. Guarded:
-- only touches a page whose sort_order 1 section is still icon_box_group
-- (i.e. hasn't been migrated to feature_cards yet), so this is a no-op if
-- run again.

-- ============== Thailand ==============
SET @page_id = (SELECT p.id FROM pages p JOIN pages r ON r.id = p.parent_id WHERE r.slug = 'th' AND p.slug = 'payment-methods' LIMIT 1);
SET @old_sec1 = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 1 AND block_type = 'icon_box_group');
SET @old_sec2 = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 2 AND block_type = 'icon_box_group');

DELETE FROM page_section_fields WHERE section_id IN (@old_sec1, @old_sec2);
DELETE FROM page_sections WHERE id IN (@old_sec1, @old_sec2);

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'feature_cards', 1 WHERE @page_id IS NOT NULL AND @old_sec1 IS NOT NULL;
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'Most Trusted Payment Methods in Thailand', 1 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'heading', 'text', 'Local Bank Transfers', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'description', 'richtext', '<p>Local bank transfers remain the top choice for many Thai players due to familiarity and ease of use. Most Thai online casinos support direct transfers from major banks. It''s ideal for players who prefer direct THB transfers with no third-party apps.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'detail1Heading', 'text', 'Supported Banks May Include:', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'detail1Body', 'richtext', '<p>Kasikorn Bank (KBank), Siam Commercial Bank (SCB), Bangkok Bank, Krungthai Bank, TMBThanachart Bank (ttb)</p>', 5 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'detail2Heading', 'text', 'Why Players Use It:', 6 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'detail2Body', 'richtext', '<ul><li>Strong trust and brand recognition</li><li>THB deposits without currency conversion</li><li>Works with internet and mobile banking apps</li><li>May take 1-24 hours for withdrawals</li></ul>', 7 WHERE @sec > 0

UNION ALL SELECT @sec, 2, 'heading', 'text', 'E-Wallets', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'description', 'richtext', '<p>E-wallets are ideal for mobile-first users and players who prioritize speed and privacy. Most e-wallet transactions are processed instantly. For common use case, it''s for instant top-ups and withdrawals within a few hours.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'detail1Heading', 'text', 'Popular Options in Thailand:', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'detail1Body', 'richtext', '<p>TrueMoney Wallet, Skrill, Neteller, AirPay, Line Pay</p>', 5 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'detail2Heading', 'text', 'Key Benefits:', 6 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'detail2Body', 'richtext', '<ul><li>Instant deposits</li><li>Withdrawals typically under 6 hours</li><li>Extra security with 2FA</li><li>Easy to link with local bank accounts</li></ul>', 7 WHERE @sec > 0

UNION ALL SELECT @sec, 3, 'heading', 'text', 'Cryptocurrencies', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'description', 'richtext', '<p>Crypto offers unmatched privacy and global accessibility for players seeking anonymous, borderless transactions. However, users should understand wallet setup and volatility risks.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'detail1Heading', 'text', 'Common Coins Accepted:', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'detail1Body', 'richtext', '<p>Bitcoin (BTC), Ethereum (ETH), Tether (USDT), Binance Coin (BNB)</p>', 5 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'detail2Heading', 'text', 'Reasons Players Use Crypto:', 6 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'detail2Body', 'richtext', '<ul><li>High withdrawal limits</li><li>Low fees</li><li>Faster international transfers</li><li>No bank involvement</li></ul>', 7 WHERE @sec > 0

UNION ALL SELECT @sec, 4, 'heading', 'text', 'Credit & Debit Cards', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'description', 'richtext', '<p>Cards are a familiar method for many players, especially those used to international online purchases.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'detail1Heading', 'text', 'Typically Accepted:', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'detail1Body', 'richtext', '<p>Visa, Mastercard, UnionPay</p>', 5 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'detail2Heading', 'text', 'Considerations:', 6 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'detail2Body', 'richtext', '<ul><li>Fast deposits</li><li>Withdrawals may not be available for all cards</li><li>Some Thai banks may block gambling-related charges</li><li>Ideal for use with international platforms</li></ul>', 7 WHERE @sec > 0

UNION ALL SELECT @sec, 5, 'heading', 'text', 'Mobile Payment Solutions', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'description', 'richtext', '<p>For players on the go, mobile-focused payment systems provide fast and convenient transactions without switching devices.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'detail1Heading', 'text', 'Examples:', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'detail1Body', 'richtext', '<p>PromptPay, QR code transfers, mobile banking apps (e.g., SCB Easy, K PLUS)</p>', 5 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'detail2Heading', 'text', 'Highlights:', 6 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'detail2Body', 'richtext', '<ul><li>Perfect for mobile casino play</li><li>Seamless integration with Thai banks</li><li>Real-time payment confirmations</li></ul>', 7 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'checklist_callout', 2 WHERE @page_id IS NOT NULL AND @old_sec2 IS NOT NULL;
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'Trust Factors', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'You Should Look for in Online Casinos', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'text', 'text', 'SSL encryption on checkout pages', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'text', 'text', 'Casino license and regulator-backed policies', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'text', 'text', 'Clear T&Cs for deposit/withdrawal limits and processing times', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'text', 'text', 'Player reviews and forum mentions', 1 WHERE @sec > 0;

-- ============== Malaysia ==============
SET @page_id = (SELECT p.id FROM pages p JOIN pages r ON r.id = p.parent_id WHERE r.slug = 'my' AND p.slug = 'payment-methods' LIMIT 1);
SET @old_sec1 = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 1 AND block_type = 'icon_box_group');
SET @old_sec2 = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 2 AND block_type = 'icon_box_group');

DELETE FROM page_section_fields WHERE section_id IN (@old_sec1, @old_sec2);
DELETE FROM page_sections WHERE id IN (@old_sec1, @old_sec2);

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'feature_cards', 1 WHERE @page_id IS NOT NULL AND @old_sec1 IS NOT NULL;
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'Most Trusted Payment Methods in Malaysia', 1 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'heading', 'text', 'Local Bank Transfers', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'description', 'richtext', '<p>Local bank transfers remain the top choice for many Malaysian players due to familiarity and ease of use. Most Malaysia-friendly online casinos support direct transfers from major banks. It''s ideal for players who prefer direct MYR transfers with no third-party apps.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'detail1Heading', 'text', 'Supported Banks May Include:', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'detail1Body', 'richtext', '<p>Maybank, CIMB Bank, Public Bank, RHB Bank, Hong Leong Bank</p>', 5 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'detail2Heading', 'text', 'Why Players Use It:', 6 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'detail2Body', 'richtext', '<ul><li>Strong trust and brand recognition</li><li>MYR deposits without currency conversion</li><li>Works with internet and mobile banking apps, including DuitNow</li><li>May take 1-24 hours for withdrawals</li></ul>', 7 WHERE @sec > 0

UNION ALL SELECT @sec, 2, 'heading', 'text', 'E-Wallets', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'description', 'richtext', '<p>E-wallets are ideal for mobile-first users and players who prioritize speed and privacy. Most e-wallet transactions are processed instantly.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'detail1Heading', 'text', 'Popular Options in Malaysia:', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'detail1Body', 'richtext', '<p>Touch ''n Go eWallet, GrabPay, Boost, Skrill, Neteller</p>', 5 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'detail2Heading', 'text', 'Key Benefits:', 6 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'detail2Body', 'richtext', '<ul><li>Instant deposits</li><li>Withdrawals typically under 6 hours</li><li>Extra security with 2FA</li><li>Easy to link with local bank accounts</li></ul>', 7 WHERE @sec > 0

UNION ALL SELECT @sec, 3, 'heading', 'text', 'Cryptocurrencies', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'description', 'richtext', '<p>Crypto offers unmatched privacy and global accessibility for players seeking anonymous, borderless transactions. However, users should understand wallet setup and volatility risks.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'detail1Heading', 'text', 'Common Coins Accepted:', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'detail1Body', 'richtext', '<p>Bitcoin (BTC), Ethereum (ETH), Tether (USDT), Binance Coin (BNB)</p>', 5 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'detail2Heading', 'text', 'Reasons Players Use Crypto:', 6 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'detail2Body', 'richtext', '<ul><li>High withdrawal limits</li><li>Low fees</li><li>Faster international transfers</li><li>No bank involvement</li></ul>', 7 WHERE @sec > 0

UNION ALL SELECT @sec, 4, 'heading', 'text', 'Credit & Debit Cards', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'description', 'richtext', '<p>Cards are a familiar method for many players, especially those used to international online purchases.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'detail1Heading', 'text', 'Typically Accepted:', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'detail1Body', 'richtext', '<p>Visa, Mastercard, UnionPay</p>', 5 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'detail2Heading', 'text', 'Considerations:', 6 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'detail2Body', 'richtext', '<ul><li>Fast deposits</li><li>Withdrawals may not be available for all cards</li><li>Some Malaysian banks may block gambling-related charges</li><li>Ideal for use with international platforms</li></ul>', 7 WHERE @sec > 0

UNION ALL SELECT @sec, 5, 'heading', 'text', 'Mobile Payment Solutions', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'description', 'richtext', '<p>For players on the go, mobile-focused payment systems provide fast and convenient transactions without switching devices.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'detail1Heading', 'text', 'Examples:', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'detail1Body', 'richtext', '<p>DuitNow QR, mobile banking apps (e.g., Maybank2u, CIMB Clicks)</p>', 5 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'detail2Heading', 'text', 'Highlights:', 6 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'detail2Body', 'richtext', '<ul><li>Perfect for mobile casino play</li><li>Seamless integration with Malaysian banks</li><li>Real-time payment confirmations</li></ul>', 7 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'checklist_callout', 2 WHERE @page_id IS NOT NULL AND @old_sec2 IS NOT NULL;
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'Trust Factors', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'You Should Look for in Online Casinos', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'text', 'text', 'SSL encryption on checkout pages', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'text', 'text', 'Casino license and regulator-backed policies', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'text', 'text', 'Clear T&Cs for deposit/withdrawal limits and processing times', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'text', 'text', 'Player reviews and forum mentions', 1 WHERE @sec > 0;

-- ============== Singapore ==============
SET @page_id = (SELECT p.id FROM pages p JOIN pages r ON r.id = p.parent_id WHERE r.slug = 'sg' AND p.slug = 'payment-methods' LIMIT 1);
SET @old_sec1 = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 1 AND block_type = 'icon_box_group');
SET @old_sec2 = (SELECT id FROM page_sections WHERE page_id = @page_id AND sort_order = 2 AND block_type = 'icon_box_group');

DELETE FROM page_section_fields WHERE section_id IN (@old_sec1, @old_sec2);
DELETE FROM page_sections WHERE id IN (@old_sec1, @old_sec2);

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'feature_cards', 1 WHERE @page_id IS NOT NULL AND @old_sec1 IS NOT NULL;
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'Most Trusted Payment Methods in Singapore', 1 WHERE @sec > 0

UNION ALL SELECT @sec, 1, 'heading', 'text', 'Local Bank Transfers', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'description', 'richtext', '<p>Local bank transfers remain a top choice for many Singaporean players due to familiarity and ease of use. Most Singapore-friendly online casinos support direct transfers from major banks. It''s ideal for players who prefer direct SGD transfers with no third-party apps.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'detail1Heading', 'text', 'Supported Banks May Include:', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'detail1Body', 'richtext', '<p>DBS/POSB, OCBC, UOB, Standard Chartered, Maybank Singapore</p>', 5 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'detail2Heading', 'text', 'Why Players Use It:', 6 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'detail2Body', 'richtext', '<ul><li>Strong trust and brand recognition</li><li>SGD deposits without currency conversion</li><li>Works with internet and mobile banking apps</li><li>May take 1-24 hours for withdrawals</li></ul>', 7 WHERE @sec > 0

UNION ALL SELECT @sec, 2, 'heading', 'text', 'E-Wallets', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'description', 'richtext', '<p>E-wallets are ideal for mobile-first users and players who prioritize speed and privacy. Most e-wallet transactions are processed instantly.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'detail1Heading', 'text', 'Popular Options in Singapore:', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'detail1Body', 'richtext', '<p>PayNow, GrabPay, PayLah!, Skrill, Neteller</p>', 5 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'detail2Heading', 'text', 'Key Benefits:', 6 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'detail2Body', 'richtext', '<ul><li>Instant deposits</li><li>Withdrawals typically under 6 hours</li><li>Extra security with 2FA</li><li>Easy to link with local bank accounts</li></ul>', 7 WHERE @sec > 0

UNION ALL SELECT @sec, 3, 'heading', 'text', 'Cryptocurrencies', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'description', 'richtext', '<p>Crypto offers unmatched privacy and global accessibility for players seeking anonymous, borderless transactions. However, users should understand wallet setup and volatility risks.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'detail1Heading', 'text', 'Common Coins Accepted:', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'detail1Body', 'richtext', '<p>Bitcoin (BTC), Ethereum (ETH), Tether (USDT), Binance Coin (BNB)</p>', 5 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'detail2Heading', 'text', 'Reasons Players Use Crypto:', 6 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'detail2Body', 'richtext', '<ul><li>High withdrawal limits</li><li>Low fees</li><li>Faster international transfers</li><li>No bank involvement</li></ul>', 7 WHERE @sec > 0

UNION ALL SELECT @sec, 4, 'heading', 'text', 'Credit & Debit Cards', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'description', 'richtext', '<p>Cards are a familiar method for many players, especially those used to international online purchases.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'detail1Heading', 'text', 'Typically Accepted:', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'detail1Body', 'richtext', '<p>Visa, Mastercard, UnionPay</p>', 5 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'detail2Heading', 'text', 'Considerations:', 6 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'detail2Body', 'richtext', '<ul><li>Fast deposits</li><li>Withdrawals may not be available for all cards</li><li>Some Singapore banks may flag gambling-related charges</li><li>Ideal for use with international platforms</li></ul>', 7 WHERE @sec > 0

UNION ALL SELECT @sec, 5, 'heading', 'text', 'Mobile Payment Solutions', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'description', 'richtext', '<p>For players on the go, mobile-focused payment systems provide fast and convenient transactions without switching devices.</p>', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'detail1Heading', 'text', 'Examples:', 4 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'detail1Body', 'richtext', '<p>PayNow QR, mobile banking apps (e.g., DBS PayLah!, OCBC Pay Anyone)</p>', 5 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'detail2Heading', 'text', 'Highlights:', 6 WHERE @sec > 0
UNION ALL SELECT @sec, 5, 'detail2Body', 'richtext', '<ul><li>Perfect for mobile casino play</li><li>Seamless integration with Singapore banks</li><li>Real-time payment confirmations</li></ul>', 7 WHERE @sec > 0;

INSERT INTO page_sections (page_id, block_type, sort_order)
SELECT @page_id, 'checklist_callout', 2 WHERE @page_id IS NOT NULL AND @old_sec2 IS NOT NULL;
SET @sec = LAST_INSERT_ID();
INSERT INTO page_section_fields (section_id, item_index, field_key, field_type, text_value, sort_order)
SELECT @sec, 0, 'heading', 'text', 'Trust Factors', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 0, 'subtext', 'text', 'You Should Look for in Online Casinos', 2 WHERE @sec > 0
UNION ALL SELECT @sec, 1, 'text', 'text', 'SSL encryption on checkout pages', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 2, 'text', 'text', 'Casino license and regulator-backed policies', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 3, 'text', 'text', 'Clear T&Cs for deposit/withdrawal limits and processing times', 1 WHERE @sec > 0
UNION ALL SELECT @sec, 4, 'text', 'text', 'Player reviews and forum mentions', 1 WHERE @sec > 0;

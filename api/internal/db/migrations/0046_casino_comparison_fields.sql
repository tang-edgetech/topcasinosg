-- Per-casino values for the "Comparison of Online Casino Ratings" table on
-- the /{region} page (Figma "D / Country / TH"): RTP %, crypto payment
-- support, and local banking speed. rtp_percentage is NULL when unknown so
-- the table can show a placeholder instead of a misleading 0.
ALTER TABLE casinos
    ADD COLUMN rtp_percentage DECIMAL(5,2) NULL AFTER cta_url,
    ADD COLUMN crypto_supported TINYINT(1) NOT NULL DEFAULT 0 AFTER rtp_percentage,
    ADD COLUMN local_banking_speed VARCHAR(100) NOT NULL DEFAULT '' AFTER crypto_supported;

-- payment_methods is a utf8mb4_bin JSON column, so LIKE is case-sensitive
-- there — LOWER() makes the match case-insensitive.
UPDATE casinos
SET crypto_supported = 1
WHERE LOWER(payment_methods) LIKE '%usdt%'
   OR LOWER(payment_methods) LIKE '%bitcoin%'
   OR LOWER(payment_methods) LIKE '%crypto%';

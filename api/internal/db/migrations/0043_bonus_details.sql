-- Structured per-type comparison values for the bonus tables on the
-- bonus hub/type pages (Figma "D / Country / TH / Bonuses"): turnover, max
-- claim, withdrawal limit, minimum deposit, payment frequency, and the
-- Loyalty/VIP columns. Free text (see domain.BonusDetails). Previously these
-- only existed embedded in `terms`, so the tables couldn't show them as
-- their own columns.
ALTER TABLE bonuses
    ADD COLUMN turnover_requirement VARCHAR(255) NOT NULL DEFAULT '' AFTER valid_until,
    ADD COLUMN max_claim VARCHAR(255) NOT NULL DEFAULT '' AFTER turnover_requirement,
    ADD COLUMN withdrawal_limit VARCHAR(255) NOT NULL DEFAULT '' AFTER max_claim,
    ADD COLUMN min_deposit VARCHAR(255) NOT NULL DEFAULT '' AFTER withdrawal_limit,
    ADD COLUMN payment_frequency VARCHAR(255) NOT NULL DEFAULT '' AFTER min_deposit,
    ADD COLUMN upgrade_bonus VARCHAR(255) NOT NULL DEFAULT '' AFTER payment_frequency,
    ADD COLUMN max_rebate VARCHAR(255) NOT NULL DEFAULT '' AFTER upgrade_bonus,
    ADD COLUMN perks VARCHAR(500) NOT NULL DEFAULT '' AFTER max_rebate,
    ADD COLUMN eligible_provider_id BIGINT UNSIGNED NULL AFTER perks,
    ADD KEY idx_bonuses_eligible_provider (eligible_provider_id),
    ADD CONSTRAINT fk_bonuses_eligible_provider FOREIGN KEY (eligible_provider_id) REFERENCES game_providers (id) ON DELETE SET NULL;

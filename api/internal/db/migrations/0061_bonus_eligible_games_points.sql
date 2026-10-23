-- Two bonus details used by the per-type bonus page tables (Figma
-- "Bonuses - Free Spins" / "- Loyalty Bonus"): the games a free-spins offer
-- can be used on, and a loyalty program's point conversion rate.

ALTER TABLE bonuses
    ADD COLUMN eligible_games VARCHAR(255) NOT NULL DEFAULT '' AFTER perks,
    ADD COLUMN point_conversion_rate VARCHAR(255) NOT NULL DEFAULT '' AFTER eligible_games;

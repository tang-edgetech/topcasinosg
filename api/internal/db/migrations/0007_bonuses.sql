CREATE TABLE bonuses (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    region_id BIGINT UNSIGNED NOT NULL,
    casino_id BIGINT UNSIGNED NULL,
    -- Matches the actual bonus categories found in the Figma component set
    -- (Comp / Table / Bonus - Welcome Bonus, No Deposit, Free Spins, etc.)
    bonus_type ENUM('welcome', 'no_deposit', 'free_spins', 'cashback', 'loyalty_vip', 'deposit') NOT NULL,
    title VARCHAR(200) NOT NULL,
    terms MEDIUMTEXT NOT NULL,
    code VARCHAR(50) NULL,
    valid_from DATE NULL,
    valid_until DATE NULL,
    status ENUM('draft', 'scheduled', 'published') NOT NULL DEFAULT 'draft',
    publish_at DATETIME NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_bonuses_region (region_id),
    KEY idx_bonuses_status (status),
    CONSTRAINT fk_bonuses_region FOREIGN KEY (region_id) REFERENCES regions (id) ON DELETE CASCADE,
    CONSTRAINT fk_bonuses_casino FOREIGN KEY (casino_id) REFERENCES casinos (id) ON DELETE SET NULL,
    CONSTRAINT fk_bonuses_created_by FOREIGN KEY (created_by) REFERENCES admin_users (id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE menu_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    location ENUM('header', 'footer') NOT NULL,
    parent_id BIGINT UNSIGNED NULL,
    label VARCHAR(255) NOT NULL,
    href VARCHAR(500) NULL,
    source_type ENUM('static', 'dynamic_regions', 'dynamic_casinos') NOT NULL DEFAULT 'static',
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_menu_items_location (location),
    KEY idx_menu_items_parent (parent_id),
    CONSTRAINT fk_menu_items_parent FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Seed with the site's existing hardcoded header/footer structure so the
-- cutover to DB-driven menus doesn't blank the live site. Explicit ids keep
-- the parent/child inserts simple (no session variables needed); MySQL
-- advances the AUTO_INCREMENT counter past the highest explicit id used.

-- Header: "Top Casino Game" tab.
INSERT INTO menu_items (id, location, parent_id, label, href, source_type, sort_order) VALUES
    (1, 'header', NULL, 'Top Casino Game', NULL, 'static', 1),
    (2, 'header', 1, 'Regions', NULL, 'dynamic_regions', 1),
    (3, 'header', 1, 'More', NULL, 'static', 2),
    (4, 'header', 3, 'Blacklisted Casinos', '/blacklist', 'static', 1),
    (5, 'header', 3, 'All Casino Reviews', '/casinos', 'static', 2);

-- Header: "Casino Reviews" tab.
INSERT INTO menu_items (id, location, parent_id, label, href, source_type, sort_order) VALUES
    (6, 'header', NULL, 'Casino Reviews', NULL, 'static', 2),
    (7, 'header', 6, 'Reviews', NULL, 'dynamic_casinos', 1),
    (8, 'header', 6, 'View All Reviews →', '/casinos', 'static', 2);

-- Header: "Casino Types" tab.
INSERT INTO menu_items (id, location, parent_id, label, href, source_type, sort_order) VALUES
    (9, 'header', NULL, 'Casino Types', NULL, 'static', 3),
    (10, 'header', 9, 'Game Types', NULL, 'static', 1),
    (11, 'header', 10, 'Blackjack', '/guides?category=blackjack', 'static', 1),
    (12, 'header', 10, 'Baccarat', '/guides?category=baccarat', 'static', 2),
    (13, 'header', 10, 'Roulette', '/guides?category=roulette', 'static', 3),
    (14, 'header', 10, 'Sic Bo', '/guides?category=sic-bo', 'static', 4),
    (15, 'header', 10, 'Bingo', '/guides?category=bingo', 'static', 5),
    (16, 'header', 10, 'Sports Betting', '/guides?category=sports-betting', 'static', 6),
    (17, 'header', 10, 'Video Poker', '/guides?category=video-poker', 'static', 7);

-- Header: "Casino News & Blog" tab.
INSERT INTO menu_items (id, location, parent_id, label, href, source_type, sort_order) VALUES
    (18, 'header', NULL, 'Casino News & Blog', NULL, 'static', 4),
    (19, 'header', 18, 'Content', NULL, 'static', 1),
    (20, 'header', 19, 'Latest News', '/news', 'static', 1),
    (21, 'header', 19, 'All Guides', '/guides', 'static', 2);

-- Header: "Casino Bonus" tab.
INSERT INTO menu_items (id, location, parent_id, label, href, source_type, sort_order) VALUES
    (22, 'header', NULL, 'Casino Bonus', NULL, 'static', 5),
    (23, 'header', 22, 'Bonus Types', NULL, 'static', 1),
    (24, 'header', 23, 'Welcome Bonus', '/bonuses?type=welcome-bonus', 'static', 1),
    (25, 'header', 23, 'No Deposit Bonus', '/bonuses?type=no-deposit-bonus', 'static', 2),
    (26, 'header', 23, 'Free Spins', '/bonuses?type=free-spins', 'static', 3),
    (27, 'header', 23, 'Deposit Bonus', '/bonuses?type=deposit-bonus', 'static', 4),
    (28, 'header', 23, 'Cashback', '/bonuses?type=cashback', 'static', 5),
    (29, 'header', 23, 'Loyalty / VIP Bonus', '/bonuses?type=loyalty-vip-bonus', 'static', 6);

-- Footer: "Our Background" column.
INSERT INTO menu_items (id, location, parent_id, label, href, source_type, sort_order) VALUES
    (30, 'footer', NULL, 'Our Background', NULL, 'static', 1),
    (31, 'footer', 30, 'About Us', '/about', 'static', 1),
    (32, 'footer', 30, '25 Step Factor Review', '/about/review-methodology', 'static', 2),
    (33, 'footer', 30, 'Our Authors', '/authors', 'static', 3),
    (34, 'footer', 30, 'Responsible Gambling', '/responsible-gambling', 'static', 4),
    (35, 'footer', 30, 'Privacy Policy', '/privacy-policy', 'static', 5),
    (36, 'footer', 30, 'Sitemap', '/sitemap', 'static', 6);

-- Footer: "Casino Reviews" column (dynamic — no static children needed).
INSERT INTO menu_items (id, location, parent_id, label, href, source_type, sort_order) VALUES
    (37, 'footer', NULL, 'Casino Reviews', NULL, 'dynamic_casinos', 2);

-- Footer: "Casino Games" column.
INSERT INTO menu_items (id, location, parent_id, label, href, source_type, sort_order) VALUES
    (38, 'footer', NULL, 'Casino Games', NULL, 'static', 3),
    (39, 'footer', 38, 'Live Casino', '/guides?category=live-casino', 'static', 1),
    (40, 'footer', 38, 'Online Slots', '/guides?category=online-slots', 'static', 2),
    (41, 'footer', 38, 'Sports Betting', '/guides?category=sports-betting', 'static', 3),
    (42, 'footer', 38, 'eSports Betting', '/guides?category=esports-betting', 'static', 4),
    (43, 'footer', 38, '4D Online Betting', '/guides?category=4d-online-betting', 'static', 5),
    (44, 'footer', 38, 'Fishing Online', '/guides?category=fishing-online', 'static', 6),
    (45, 'footer', 38, 'Lottery Online', '/guides?category=lottery-online', 'static', 7);

-- Footer: "News Blog" column.
INSERT INTO menu_items (id, location, parent_id, label, href, source_type, sort_order) VALUES
    (46, 'footer', NULL, 'News Blog', NULL, 'static', 4),
    (47, 'footer', 46, 'Casino Guides', '/guides', 'static', 1),
    (48, 'footer', 46, 'Legal Online Casino', '/guides', 'static', 2),
    (49, 'footer', 46, 'Blacklisted Casino', '/blacklist', 'static', 3);

-- Footer: "Get in Touch" column.
INSERT INTO menu_items (id, location, parent_id, label, href, source_type, sort_order) VALUES
    (50, 'footer', NULL, 'Get in Touch', NULL, 'static', 5),
    (51, 'footer', 50, 'Contact Us', '/contact', 'static', 1),
    (52, 'footer', 50, 'Get Listed Now', '/get-listed', 'static', 2),
    (53, 'footer', 50, 'Report a Casino', '/report-a-casino', 'static', 3),
    (54, 'footer', 50, 'Join as Affiliate', '/affiliate', 'static', 4);

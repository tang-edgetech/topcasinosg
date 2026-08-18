-- Sidebar (Figma "Comp / Header / Sidebar"): the right-hand widget shown on
-- every non-Home page (Introduction Section pages). Exactly 3 fixed
-- sections always exist (seeded below, never created/deleted by admins —
-- only their heading and links are editable), each holding an ordered list
-- of links. has_dropdown is purely a visual caret in the Figma design (no
-- functional submenu behind it yet).
CREATE TABLE sidebar_sections (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    section_key ENUM('most_popular_topics', 'region_casino_games', 'casino_bonuses') NOT NULL,
    heading VARCHAR(150) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_sidebar_sections_key (section_key)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE sidebar_links (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    section_id BIGINT UNSIGNED NOT NULL,
    label VARCHAR(150) NOT NULL,
    url VARCHAR(500) NOT NULL,
    has_dropdown TINYINT(1) NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_sidebar_links_section FOREIGN KEY (section_id) REFERENCES sidebar_sections (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

INSERT INTO sidebar_sections (section_key, heading, sort_order) VALUES
('most_popular_topics', 'Most Popular Topics', 1),
('region_casino_games', 'Singapore Casino Games', 2),
('casino_bonuses', 'Casino Bonuses', 3);

INSERT INTO sidebar_links (section_id, label, url, has_dropdown, sort_order)
SELECT s.id, l.label, l.url, l.has_dropdown, l.sort_order FROM sidebar_sections s
JOIN (
  SELECT 'most_popular_topics' AS section_key, 'Real Money Casino' AS label, '/guides' AS url, 0 AS has_dropdown, 1 AS sort_order
  UNION ALL SELECT 'most_popular_topics', 'Online Gambling Sites', '/guides', 0, 2
  UNION ALL SELECT 'most_popular_topics', 'Singapore Casino', '/sg', 0, 3
  UNION ALL SELECT 'most_popular_topics', 'Fastest Payout Casinos', '/casinos', 0, 4
  UNION ALL SELECT 'most_popular_topics', 'Best Payout Casino', '/casinos', 0, 5
  UNION ALL SELECT 'most_popular_topics', 'Free Casino Games', '/guides', 0, 6

  UNION ALL SELECT 'region_casino_games', 'Blackjack', '/casinos?gameType=blackjack', 1, 1
  UNION ALL SELECT 'region_casino_games', 'Baccarat', '/casinos?gameType=baccarat', 1, 2
  UNION ALL SELECT 'region_casino_games', 'Bingo', '/casinos?gameType=bingo', 1, 3
  UNION ALL SELECT 'region_casino_games', 'Roulette', '/casinos?gameType=roulette', 1, 4
  UNION ALL SELECT 'region_casino_games', 'Sic Bo', '/casinos?gameType=sic_bo', 1, 5
  UNION ALL SELECT 'region_casino_games', 'Sports Betting', '/guides', 0, 6
  UNION ALL SELECT 'region_casino_games', 'Video Poker', '/casinos?gameType=video_poker', 0, 7
  UNION ALL SELECT 'region_casino_games', 'Keno', '/guides', 0, 8
  UNION ALL SELECT 'region_casino_games', 'Pai Gow Poker', '/casinos?gameType=poker', 0, 9
  UNION ALL SELECT 'region_casino_games', 'Craps', '/casinos?gameType=craps', 0, 10

  UNION ALL SELECT 'casino_bonuses', 'High Roller Bonus', '/th/bonuses/loyalty_vip', 0, 1
  UNION ALL SELECT 'casino_bonuses', 'Free Spins', '/th/bonuses/free_spins', 0, 2
  UNION ALL SELECT 'casino_bonuses', 'Free Bet', '/th/bonuses/no_deposit', 0, 3
  UNION ALL SELECT 'casino_bonuses', 'No Deposit Casino Bonus', '/th/bonuses/no_deposit', 0, 4
) l ON l.section_key = s.section_key;

ALTER TABLE admin_users
    ADD COLUMN theme_preference ENUM('light', 'dark') NOT NULL DEFAULT 'light' AFTER can_manage_admins;

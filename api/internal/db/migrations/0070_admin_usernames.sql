-- Admin users sign in with their email or a unique username. Existing
-- accounts get a username from their email's local part (lowercased, other
-- characters dropped); a clash or a result under 3 characters gets the
-- account id appended so every username is unique.
ALTER TABLE admin_users ADD COLUMN username VARCHAR(30) NULL AFTER email;

UPDATE admin_users
SET username = LEFT(REGEXP_REPLACE(LOWER(SUBSTRING_INDEX(email, '@', 1)), '[^a-z0-9._-]', ''), 30);

UPDATE admin_users u
JOIN (
    SELECT username FROM admin_users GROUP BY username HAVING COUNT(*) > 1
) dup ON dup.username = u.username
SET u.username = CONCAT(LEFT(u.username, 20), '-', u.id);

UPDATE admin_users
SET username = CONCAT('user-', id)
WHERE CHAR_LENGTH(username) < 3;

ALTER TABLE admin_users
    MODIFY username VARCHAR(30) NOT NULL,
    ADD UNIQUE KEY uq_admin_users_username (username);

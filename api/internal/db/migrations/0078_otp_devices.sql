-- Two-factor devices: each admin user can register up to two authenticator
-- apps (see domain.MaxOTPDevices), managed under My Account. A row with
-- confirmed_at NULL is a setup in progress (QR shown, code not yet entered);
-- only confirmed rows count as enrolled devices.
--
-- Existing enrollments move over as each user's first device. The old
-- admin_users.otp_secret_encrypted / otp_confirmed_at columns are left in
-- place but no longer read.
CREATE TABLE IF NOT EXISTS admin_user_otp_devices (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    admin_user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(60) NOT NULL,
    secret_encrypted VARBINARY(512) NOT NULL,
    confirmed_at DATETIME NULL,
    last_used_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_admin_user_otp_devices_user (admin_user_id),
    CONSTRAINT fk_admin_user_otp_devices_user FOREIGN KEY (admin_user_id) REFERENCES admin_users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

INSERT INTO admin_user_otp_devices (admin_user_id, name, secret_encrypted, confirmed_at, created_at)
SELECT id, 'Authenticator app', otp_secret_encrypted, otp_confirmed_at, otp_confirmed_at
FROM admin_users
WHERE otp_secret_encrypted IS NOT NULL AND otp_confirmed_at IS NOT NULL;

-- Whether the session was signed in with a 2FA code. While 2FA is required,
-- a session without it can't be refreshed, so turning the switch on makes
-- everyone sign in again with a code.
ALTER TABLE refresh_tokens
    ADD COLUMN otp_verified BOOLEAN NOT NULL DEFAULT FALSE AFTER token_hash;

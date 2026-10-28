package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

// OTPDeviceRepo stores each admin user's 2FA authenticator apps.
type OTPDeviceRepo struct {
	db *sql.DB
}

func NewOTPDeviceRepo(db *sql.DB) *OTPDeviceRepo {
	return &OTPDeviceRepo{db: db}
}

const otpDeviceColumns = `id, admin_user_id, name, secret_encrypted, confirmed_at, last_used_at, created_at`

func scanOTPDevice(row interface{ Scan(...any) error }) (*domain.OTPDevice, error) {
	var d domain.OTPDevice
	if err := row.Scan(&d.ID, &d.UserID, &d.Name, &d.SecretEncrypted, &d.ConfirmedAt, &d.LastUsedAt, &d.CreatedAt); err != nil {
		return nil, err
	}
	return &d, nil
}

// ListConfirmed returns the user's enrolled devices, oldest first.
func (r *OTPDeviceRepo) ListConfirmed(ctx context.Context, userID int64) ([]domain.OTPDevice, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT `+otpDeviceColumns+` FROM admin_user_otp_devices
		WHERE admin_user_id = ? AND confirmed_at IS NOT NULL ORDER BY confirmed_at, id`, userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var devices []domain.OTPDevice
	for rows.Next() {
		d, err := scanOTPDevice(rows)
		if err != nil {
			return nil, err
		}
		devices = append(devices, *d)
	}
	return devices, rows.Err()
}

// CreatePending starts a device setup, replacing any setup the user left
// unfinished, so there is at most one pending device per user.
func (r *OTPDeviceRepo) CreatePending(ctx context.Context, userID int64, name string, encryptedSecret []byte) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if _, err := tx.ExecContext(ctx,
		`DELETE FROM admin_user_otp_devices WHERE admin_user_id = ? AND confirmed_at IS NULL`, userID,
	); err != nil {
		return err
	}
	if _, err := tx.ExecContext(ctx,
		`INSERT INTO admin_user_otp_devices (admin_user_id, name, secret_encrypted) VALUES (?, ?, ?)`,
		userID, name, encryptedSecret,
	); err != nil {
		return err
	}
	return tx.Commit()
}

func (r *OTPDeviceRepo) GetPending(ctx context.Context, userID int64) (*domain.OTPDevice, error) {
	row := r.db.QueryRowContext(ctx,
		`SELECT `+otpDeviceColumns+` FROM admin_user_otp_devices
		WHERE admin_user_id = ? AND confirmed_at IS NULL ORDER BY id DESC LIMIT 1`, userID,
	)
	d, err := scanOTPDevice(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return d, err
}

// Confirm enrolls a pending device; its first code counts as its first use.
func (r *OTPDeviceRepo) Confirm(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE admin_user_otp_devices SET confirmed_at = NOW(), last_used_at = NOW() WHERE id = ?`, id,
	)
	return err
}

func (r *OTPDeviceRepo) MarkUsed(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `UPDATE admin_user_otp_devices SET last_used_at = NOW() WHERE id = ?`, id)
	return err
}

// Delete removes one of the user's devices; ErrNotFound if it isn't theirs.
func (r *OTPDeviceRepo) Delete(ctx context.Context, userID, id int64) error {
	res, err := r.db.ExecContext(ctx,
		`DELETE FROM admin_user_otp_devices WHERE id = ? AND admin_user_id = ?`, id, userID,
	)
	if err != nil {
		return err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return ErrNotFound
	}
	return nil
}

// DeleteAllForUser clears enrollment so the user must scan a fresh QR next
// login — used by a higher role helping someone who lost their devices.
func (r *OTPDeviceRepo) DeleteAllForUser(ctx context.Context, userID int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM admin_user_otp_devices WHERE admin_user_id = ?`, userID)
	return err
}

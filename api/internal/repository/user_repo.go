package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

var ErrNotFound = errors.New("record not found")

type UserRepo struct {
	db *sql.DB
}

func NewUserRepo(db *sql.DB) *UserRepo {
	return &UserRepo{db: db}
}

const userColumns = `id, email, password_hash, full_name, role, can_manage_admins, status,
	otp_secret_encrypted, otp_confirmed_at, created_by, created_at, updated_at`

func scanUser(row interface{ Scan(...any) error }) (*domain.AdminUser, error) {
	var u domain.AdminUser
	if err := row.Scan(
		&u.ID, &u.Email, &u.PasswordHash, &u.FullName, &u.Role, &u.CanManageAdmins, &u.Status,
		&u.OTPSecretEncrypted, &u.OTPConfirmedAt, &u.CreatedBy, &u.CreatedAt, &u.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepo) CountAll(ctx context.Context) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM admin_users`).Scan(&count)
	return count, err
}

func (r *UserRepo) Create(ctx context.Context, u *domain.AdminUser) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
		INSERT INTO admin_users (email, password_hash, full_name, role, can_manage_admins, status, created_by)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		u.Email, u.PasswordHash, u.FullName, u.Role, u.CanManageAdmins, u.Status, u.CreatedBy,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *UserRepo) GetByEmail(ctx context.Context, email string) (*domain.AdminUser, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+userColumns+` FROM admin_users WHERE email = ?`, email)
	u, err := scanUser(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return u, err
}

func (r *UserRepo) GetByID(ctx context.Context, id int64) (*domain.AdminUser, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+userColumns+` FROM admin_users WHERE id = ?`, id)
	u, err := scanUser(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return u, err
}

func (r *UserRepo) ExistsEmail(ctx context.Context, email string, excludeID int64) (bool, error) {
	var count int
	err := r.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM admin_users WHERE email = ? AND id != ?`, email, excludeID,
	).Scan(&count)
	return count > 0, err
}

// ListByRoles returns non-deleted users whose role is in roles, ordered by
// role then name. Callers pass exactly the roles the current actor may see.
func (r *UserRepo) ListByRoles(ctx context.Context, roles []domain.Role) ([]domain.AdminUser, error) {
	if len(roles) == 0 {
		return nil, nil
	}
	placeholders := ""
	args := make([]any, 0, len(roles))
	for i, role := range roles {
		if i > 0 {
			placeholders += ", "
		}
		placeholders += "?"
		args = append(args, role)
	}

	rows, err := r.db.QueryContext(ctx,
		`SELECT `+userColumns+` FROM admin_users WHERE role IN (`+placeholders+`) AND status != 'deleted' ORDER BY role, full_name`,
		args...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []domain.AdminUser
	for rows.Next() {
		u, err := scanUser(rows)
		if err != nil {
			return nil, err
		}
		users = append(users, *u)
	}
	return users, rows.Err()
}

func (r *UserRepo) UpdateProfile(ctx context.Context, id int64, email, fullName string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE admin_users SET email = ?, full_name = ? WHERE id = ?`, email, fullName, id,
	)
	return err
}

func (r *UserRepo) UpdateStatus(ctx context.Context, id int64, status domain.Status) error {
	_, err := r.db.ExecContext(ctx, `UPDATE admin_users SET status = ? WHERE id = ?`, status, id)
	return err
}

func (r *UserRepo) UpdatePassword(ctx context.Context, id int64, passwordHash string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE admin_users SET password_hash = ? WHERE id = ?`, passwordHash, id)
	return err
}

func (r *UserRepo) UpdateCanManageAdmins(ctx context.Context, id int64, canManageAdmins bool) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE admin_users SET can_manage_admins = ? WHERE id = ? AND role = 'admin'`, canManageAdmins, id,
	)
	return err
}

func (r *UserRepo) SetOTPSecret(ctx context.Context, id int64, encryptedSecret []byte) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE admin_users SET otp_secret_encrypted = ?, otp_confirmed_at = NULL WHERE id = ?`, encryptedSecret, id,
	)
	return err
}

func (r *UserRepo) ConfirmOTP(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE admin_users SET otp_confirmed_at = NOW() WHERE id = ?`, id,
	)
	return err
}

// ResetOTP clears enrollment so the user must scan a fresh QR next login —
// used by a higher role helping a lower role who lost their authenticator.
func (r *UserRepo) ResetOTP(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE admin_users SET otp_secret_encrypted = NULL, otp_confirmed_at = NULL WHERE id = ?`, id,
	)
	return err
}

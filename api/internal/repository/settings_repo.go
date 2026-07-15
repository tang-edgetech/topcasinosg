package repository

import (
	"context"
	"database/sql"
)

const SettingTwoFactorEnabled = "two_factor_enabled"

type SettingsRepo struct {
	db *sql.DB
}

func NewSettingsRepo(db *sql.DB) *SettingsRepo {
	return &SettingsRepo{db: db}
}

func (r *SettingsRepo) Get(ctx context.Context, key string) (string, error) {
	var value string
	err := r.db.QueryRowContext(ctx, `SELECT setting_value FROM system_settings WHERE setting_key = ?`, key).Scan(&value)
	return value, err
}

func (r *SettingsRepo) Set(ctx context.Context, key, value string) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)
		ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`, key, value)
	return err
}

func (r *SettingsRepo) Is2FAEnabled(ctx context.Context) (bool, error) {
	value, err := r.Get(ctx, SettingTwoFactorEnabled)
	if err != nil {
		return false, err
	}
	return value == "true", nil
}

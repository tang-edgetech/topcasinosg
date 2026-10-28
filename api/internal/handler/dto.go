package handler

import (
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

// UserDTO is the only shape of an admin_users row ever sent over the wire —
// it deliberately excludes password_hash and every 2FA secret.
type UserDTO struct {
	ID              int64     `json:"id"`
	Email           string    `json:"email"`
	Username        string    `json:"username"`
	FullName        string    `json:"fullName"`
	Role            string    `json:"role"`
	ThemePreference string    `json:"themePreference"`
	Status          string    `json:"status"`
	OTPEnrolled     bool      `json:"otpEnrolled"`
	OTPDevices      int       `json:"otpDevices"`
	CreatedAt       time.Time `json:"createdAt"`
}

func toUserDTO(u *domain.AdminUser) UserDTO {
	return UserDTO{
		ID:              u.ID,
		Email:           u.Email,
		Username:        u.Username,
		FullName:        u.FullName,
		Role:            string(u.Role),
		ThemePreference: string(u.ThemePreference),
		Status:          string(u.Status),
		OTPEnrolled:     u.OTPEnrolled(),
		OTPDevices:      u.OTPDeviceCount,
		CreatedAt:       u.CreatedAt,
	}
}

func toUserDTOs(users []domain.AdminUser) []UserDTO {
	dtos := make([]UserDTO, len(users))
	for i := range users {
		dtos[i] = toUserDTO(&users[i])
	}
	return dtos
}

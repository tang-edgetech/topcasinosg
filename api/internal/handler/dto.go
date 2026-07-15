package handler

import (
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

// UserDTO is the only shape of an admin_users row ever sent over the wire —
// it deliberately excludes password_hash and otp_secret_encrypted.
type UserDTO struct {
	ID              int64     `json:"id"`
	Email           string    `json:"email"`
	FullName        string    `json:"fullName"`
	Role            string    `json:"role"`
	CanManageAdmins bool      `json:"canManageAdmins"`
	Status          string    `json:"status"`
	OTPEnrolled     bool      `json:"otpEnrolled"`
	CreatedAt       time.Time `json:"createdAt"`
}

func toUserDTO(u *domain.AdminUser) UserDTO {
	return UserDTO{
		ID:              u.ID,
		Email:           u.Email,
		FullName:        u.FullName,
		Role:            string(u.Role),
		CanManageAdmins: u.CanManageAdmins,
		Status:          string(u.Status),
		OTPEnrolled:     u.OTPEnrolled(),
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

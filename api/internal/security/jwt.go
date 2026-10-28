package security

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const (
	AccessTokenTTL    = 15 * time.Minute
	EphemeralTokenTTL = 5 * time.Minute

	PurposeOTPVerify = "otp_verify" // password checked out, user already enrolled in OTP
	PurposeOTPSetup  = "otp_setup"  // password checked out, user must enroll OTP first
)

var ErrInvalidToken = errors.New("invalid or expired token")

type AccessClaims struct {
	UserID int64  `json:"uid"`
	Role   string `json:"role"`
	// OTP: the session was signed in with a 2FA code.
	OTP bool `json:"otp,omitempty"`
	// SID is the admin_sessions row; signing that session out ends this token too.
	SID string `json:"sid,omitempty"`
	jwt.RegisteredClaims
}

type EphemeralClaims struct {
	UserID  int64  `json:"uid"`
	Purpose string `json:"purpose"`
	jwt.RegisteredClaims
}

type JWTIssuer struct {
	secret []byte
}

func NewJWTIssuer(secret string) *JWTIssuer {
	return &JWTIssuer{secret: []byte(secret)}
}

func (j *JWTIssuer) GenerateAccessToken(userID int64, role string, otpVerified bool, sessionID string) (string, error) {
	claims := AccessClaims{
		UserID: userID,
		Role:   role,
		OTP:    otpVerified,
		SID:    sessionID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(AccessTokenTTL)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(j.secret)
}

func (j *JWTIssuer) ParseAccessToken(tokenString string) (*AccessClaims, error) {
	claims := &AccessClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (any, error) {
		return j.secret, nil
	})
	if err != nil || !token.Valid {
		return nil, ErrInvalidToken
	}
	return claims, nil
}

// GenerateEphemeralToken issues the short-lived token handed back after a
// successful password check, before OTP has been verified/enrolled.
func (j *JWTIssuer) GenerateEphemeralToken(userID int64, purpose string) (string, error) {
	claims := EphemeralClaims{
		UserID:  userID,
		Purpose: purpose,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(EphemeralTokenTTL)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(j.secret)
}

func (j *JWTIssuer) ParseEphemeralToken(tokenString, expectedPurpose string) (*EphemeralClaims, error) {
	claims := &EphemeralClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (any, error) {
		return j.secret, nil
	})
	if err != nil || !token.Valid || claims.Purpose != expectedPurpose {
		return nil, ErrInvalidToken
	}
	return claims, nil
}

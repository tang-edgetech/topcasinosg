package security

import (
	"github.com/pquerna/otp/totp"
)

// GenerateTOTPSecret creates a new secret and its otpauth:// URI. The frontend
// renders the URI as a QR code client-side — the API never generates an image.
func GenerateTOTPSecret(issuer, accountEmail string) (secret string, otpauthURL string, err error) {
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      issuer,
		AccountName: accountEmail,
	})
	if err != nil {
		return "", "", err
	}
	return key.Secret(), key.URL(), nil
}

func ValidateTOTPCode(secret, code string) bool {
	return totp.Validate(code, secret)
}

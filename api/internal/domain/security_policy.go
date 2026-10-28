package domain

import (
	"strconv"
	"strings"
	"unicode"
)

// SecurityPolicy is Settings > Security's sign-in lockout and password rules,
// stored as JSON in site_settings.security_policy; the JSON names are also
// the API's.
type SecurityPolicy struct {
	// LockoutAttempts wrong passwords or 2FA codes in a row lock the account
	// for LockoutMinutes. 0 turns the lockout off.
	LockoutAttempts int `json:"lockoutAttempts"`
	LockoutMinutes  int `json:"lockoutMinutes"`

	PasswordMinLength     int  `json:"passwordMinLength"`
	PasswordRequireMixed  bool `json:"passwordRequireMixed"` // upper and lower case
	PasswordRequireNumber bool `json:"passwordRequireNumber"`
	PasswordRequireSymbol bool `json:"passwordRequireSymbol"`
	// ForcePasswordChange: a new account, or a password an admin reset, must
	// be changed by its owner at the next sign-in.
	ForcePasswordChange bool `json:"forcePasswordChange"`
}

// Limits on what Settings > Security accepts.
const (
	MinLockoutAttempts = 3
	MaxLockoutAttempts = 20
	MaxLockoutMinutes  = 1440
	MinPasswordLength  = 8
	// MaxPasswordLength: bcrypt only uses the first 72 bytes.
	MaxPasswordLength = 72
)

func DefaultSecurityPolicy() SecurityPolicy {
	return SecurityPolicy{
		LockoutAttempts:     5,
		LockoutMinutes:      15,
		PasswordMinLength:   MinPasswordLength,
		ForcePasswordChange: true,
	}
}

// PasswordProblem says what a password is missing under the policy, or ""
// when it is acceptable.
func (p SecurityPolicy) PasswordProblem(password string) string {
	minLength := max(p.PasswordMinLength, MinPasswordLength)
	if len([]rune(password)) < minLength {
		return "password must be at least " + strconv.Itoa(minLength) + " characters"
	}
	if len(password) > MaxPasswordLength {
		return "password must be at most 72 characters"
	}
	var upper, lower, digit, symbol bool
	for _, r := range password {
		switch {
		case unicode.IsUpper(r):
			upper = true
		case unicode.IsLower(r):
			lower = true
		case unicode.IsDigit(r):
			digit = true
		case !unicode.IsSpace(r):
			symbol = true
		}
	}
	var missing []string
	if p.PasswordRequireMixed && !(upper && lower) {
		missing = append(missing, "upper and lower case letters")
	}
	if p.PasswordRequireNumber && !digit {
		missing = append(missing, "a number")
	}
	if p.PasswordRequireSymbol && !symbol {
		missing = append(missing, "a symbol")
	}
	if len(missing) > 0 {
		return "password must contain " + strings.Join(missing, ", ")
	}
	return ""
}

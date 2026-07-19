package domain

import "time"

// BonusType mirrors the categories found in the Figma component set
// (Comp / Table / Bonus - Welcome Bonus, No Deposit, Free Spins, Cashback,
// Loyalty VIP programs, Deposit).
type BonusType string

const (
	BonusTypeWelcome    BonusType = "welcome"
	BonusTypeNoDeposit  BonusType = "no_deposit"
	BonusTypeFreeSpins  BonusType = "free_spins"
	BonusTypeCashback   BonusType = "cashback"
	BonusTypeLoyaltyVIP BonusType = "loyalty_vip"
	BonusTypeDeposit    BonusType = "deposit"
)

func (t BonusType) Valid() bool {
	switch t {
	case BonusTypeWelcome, BonusTypeNoDeposit, BonusTypeFreeSpins, BonusTypeCashback, BonusTypeLoyaltyVIP, BonusTypeDeposit:
		return true
	default:
		return false
	}
}

// Bonus is region-scoped content (unlike Casino, which is global) — the
// reference shape for Payment Methods, RTP entries, Guides, Blacklist
// entries, and News: draft/scheduled/published + publish_at, optionally tied
// to a region and/or casino.
type Bonus struct {
	ID         int64
	RegionID   int64
	CasinoID   *int64
	BonusType  BonusType
	Title      string
	Terms      string
	Code       *string
	ValidFrom  *time.Time
	ValidUntil *time.Time
	Status     ContentStatus
	PublishAt  *time.Time
	CreatedBy  *int64
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

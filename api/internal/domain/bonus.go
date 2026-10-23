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

// BonusDetails are the structured, per-type comparison values shown as
// table columns on the bonus hub/type pages (Figma "D / Country / TH /
// Bonuses") - free-text on purpose (e.g. "40x bonus + winnings", "Minimum
// SGD 50"), since the design mixes numbers and conditions. Which ones a
// given bonus uses depends on its BonusType; unused ones stay empty.
type BonusDetails struct {
	TurnoverRequirement string
	MaxClaim            string
	WithdrawalLimit     string
	MinDeposit          string
	PaymentFrequency    string
	UpgradeBonus        string
	MaxRebate           string
	Perks               string
	EligibleGames       string
	PointConversionRate string
	EligibleProviderID  *int64
}

// Bonus is region-scoped content (unlike Casino, which is global) — the
// reference shape for Payment Methods, RTP entries, Guides, Blacklist
// entries, and News: draft/scheduled/published + publish_at, optionally tied
// to a region and/or casino.
type Bonus struct {
	ID        int64
	RegionID  int64
	CasinoID  *int64
	BonusType BonusType
	Title     string
	// Slug is a unique, admin-set identifier for the bonus's public detail
	// page (/bonuses/{slug}) - same pattern as domain.Guide.Slug.
	Slug       string
	Terms      string
	Code       *string
	ValidFrom  *time.Time
	ValidUntil *time.Time
	BonusDetails
	Status    ContentStatus
	PublishAt *time.Time
	CreatedBy *int64
	CreatedAt time.Time
	UpdatedAt time.Time
}

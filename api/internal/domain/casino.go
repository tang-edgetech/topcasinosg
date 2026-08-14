package domain

import "time"

// RiskStatus is an admin's editorial risk-tier call for a casino — always
// set explicitly, never derived from SafeIndex (a numeric score and a risk
// label can legitimately disagree; same reasoning as why ContentStatus is
// always explicit rather than computed elsewhere in this codebase).
type RiskStatus string

const (
	RiskStatusLow    RiskStatus = "low"
	RiskStatusMedium RiskStatus = "medium"
	RiskStatusHigh   RiskStatus = "high"
)

func (s RiskStatus) Valid() bool {
	switch s {
	case RiskStatusLow, RiskStatusMedium, RiskStatusHigh:
		return true
	default:
		return false
	}
}

// GameType is a fixed taxonomy of casino game categories (Games checklist,
// Figma Brand Page) — hardcoded like BonusType/RTPCategory rather than
// admin-managed, since the set of standard casino game types is stable.
type GameType string

const (
	GameTypeSlots      GameType = "slots"
	GameTypeBlackjack  GameType = "blackjack"
	GameTypeBaccarat   GameType = "baccarat"
	GameTypeRoulette   GameType = "roulette"
	GameTypeSicBo      GameType = "sic_bo"
	GameTypeCraps      GameType = "craps"
	GameTypePoker      GameType = "poker"
	GameTypeVideoPoker GameType = "video_poker"
	GameTypeBingo      GameType = "bingo"
)

// AllGameTypes is the fixed order the Games checklist renders in.
var AllGameTypes = []GameType{
	GameTypeSlots, GameTypeBlackjack, GameTypeBaccarat, GameTypeRoulette, GameTypeSicBo,
	GameTypeCraps, GameTypePoker, GameTypeVideoPoker, GameTypeBingo,
}

func (g GameType) Valid() bool {
	for _, t := range AllGameTypes {
		if g == t {
			return true
		}
	}
	return false
}

// Casino is a global brand/review page (e.g. "EU9 Casino Review") — not
// duplicated per region. A casino can serve several regions (see RegionIDs,
// backed by the casino_regions join table).
type Casino struct {
	ID             int64
	Slug           string
	Name           string
	LogoMediaID    *int64
	// LogoURL is resolved via a LEFT JOIN against media in every repo read
	// path (mirrors GameProvider/License/Region) — never set on write.
	LogoURL        *string
	Rating         float64
	Summary        string
	Content        string
	Languages      []string
	PaymentMethods []string
	Pros           []string
	Cons           []string
	SafeIndex      *int
	RiskStatus     *RiskStatus
	SupportedGames []string
	PayoutSpeed    string
	CTAURL         string
	Status         ContentStatus
	PublishAt      *time.Time
	CreatedBy      *int64
	CreatedAt      time.Time
	UpdatedAt      time.Time

	RegionIDs       []int64
	GameProviderIDs []int64
	LicenseIDs      []int64
}

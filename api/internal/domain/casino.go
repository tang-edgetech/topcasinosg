package domain

import "time"

// Casino is a global brand/review page (e.g. "EU9 Casino Review") — not
// duplicated per region. A casino can serve several regions (see RegionIDs,
// backed by the casino_regions join table).
type Casino struct {
	ID             int64
	Slug           string
	Name           string
	LogoMediaID    *int64
	Rating         float64
	Summary        string
	Content        string
	Languages      []string
	PaymentMethods []string
	PayoutSpeed    string
	CTAURL         string
	Status         ContentStatus
	PublishAt      *time.Time
	CreatedBy      *int64
	CreatedAt      time.Time
	UpdatedAt      time.Time

	RegionIDs []int64
}

package domain

import "time"

type Language string

const (
	LanguageEN Language = "en"
	LanguageCN Language = "cn"
)

func (l Language) Valid() bool {
	return l == LanguageEN || l == LanguageCN
}

// SiteSettings is a singleton row (id always 1) holding global config that
// must exist before the Super Admin is even created — the setup wizard
// writes this at the same time as bootstrapping the first account.
type SiteSettings struct {
	SiteURL          string
	SiteTitle        string
	SEOIndex         bool
	SEOFollow        bool
	Timezone         string
	Language         Language
	LogoURL          *string
	FaviconURL       *string
	TwoFactorEnabled bool
	UpdatedAt        time.Time
}

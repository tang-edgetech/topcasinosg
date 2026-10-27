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
	FooterContact
	SocialDefaults
	UpdatedAt time.Time
}

// SocialDefaults are the site-wide sharing defaults: the image used when a
// page has no share image of its own, and the site's X/Twitter handle.
type SocialDefaults struct {
	OGImageURL    *string
	TwitterHandle string
}

// FooterContact is the public site footer's description and contact block.
type FooterContact struct {
	FooterDescription string
	ContactAddress    string
	ContactEmail      string
	FacebookURL       string
	SkypeURL          string
}

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
	Footer    FooterConfig
	UpdatedAt time.Time
}

// FooterConfig is the public footer's arrangement and the parts that used
// to be hardcoded in web/'s Footer.tsx. Stored as JSON in
// site_settings.footer_config; the JSON names are also the API's.
type FooterConfig struct {
	Layout FooterLayout `json:"layout"`
	// Bottom bar. Copyright may contain {year}, replaced with the current year.
	CertifiedByLabel string        `json:"certifiedByLabel"`
	Copyright        string        `json:"copyright"`
	PoweredBy        string        `json:"poweredBy"`
	Badges           []FooterBadge `json:"badges"`
}

// FooterLayout chooses which footer blocks show and where the brand block sits.
type FooterLayout struct {
	// BrandPosition: "right" (beside the link columns, on the right) or "left".
	BrandPosition string `json:"brandPosition"`
	ShowLinks     bool   `json:"showLinks"`
	ShowBrand     bool   `json:"showBrand"`
	ShowBadges    bool   `json:"showBadges"`
	ShowCopyright bool   `json:"showCopyright"`
}

// FooterBadge is one certification logo in the bottom bar. ImageURL is an
// uploaded file (/uploads/...), a web/ public path (/certifications/...) or
// a full URL; LinkURL is optional.
type FooterBadge struct {
	Name     string `json:"name"`
	ImageURL string `json:"imageUrl"`
	LinkURL  string `json:"linkUrl"`
}

const (
	FooterBrandRight = "right"
	FooterBrandLeft  = "left"
	MaxFooterBadges  = 12
)

// DefaultFooterConfig is the footer as it was before it became editable.
func DefaultFooterConfig() FooterConfig {
	return FooterConfig{
		Layout:           FooterLayout{BrandPosition: FooterBrandRight, ShowLinks: true, ShowBrand: true, ShowBadges: true, ShowCopyright: true},
		CertifiedByLabel: "topcasinosg.com.sg is certified by:",
		Copyright:        "Copyright © {year} topcasinosg.com.sg",
		PoweredBy:        "Powered by topcasinosg.com.sg",
		Badges: []FooterBadge{
			{Name: "TRUSTe Certified Privacy", ImageURL: "/certifications/truste.webp"},
			{Name: "DMCA Protected", ImageURL: "/certifications/dmca.webp"},
			{Name: "Norton Secured", ImageURL: "/certifications/norton.webp"},
			{Name: "Sucuri Security", ImageURL: "/certifications/sucuri.webp"},
			{Name: "Cloudflare", ImageURL: "/certifications/cloudflare.webp"},
		},
	}
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

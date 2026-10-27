package domain

// SEO entity types: the content types that can carry their own SeoMeta.
const (
	SeoEntityPage   = "page"
	SeoEntityCasino = "casino"
	SeoEntityGuide  = "guide"
	SeoEntityNews   = "news"
	SeoEntityBonus  = "bonus"
)

var SeoEntityTypes = []string{SeoEntityPage, SeoEntityCasino, SeoEntityGuide, SeoEntityNews, SeoEntityBonus}

// SeoMeta holds one item's optional SEO and social sharing overrides. Every
// empty field falls back to a default the public site builds from the item
// itself (its title, excerpt, cover image, own URL...). Pages keep their
// meta title/description on the page row, so those two are unused for them.
type SeoMeta struct {
	EntityType      string
	EntityID        int64
	MetaTitle       string
	MetaDescription string
	Keywords        string
	OGTitle         string
	OGDescription   string
	OGImageMediaID  *int64
	// OGImageURL is read-only, looked up from media at read time.
	OGImageURL     *string
	CanonicalURL   string
	RobotsNoindex  bool
	RobotsNofollow bool
	ArticleAuthor  string
}

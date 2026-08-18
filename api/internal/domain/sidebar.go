package domain

import "time"

// SidebarSectionKey identifies one of the 3 fixed sections in the Sidebar
// widget (Figma "Comp / Header / Sidebar", shown on every non-Home page).
// The set of sections is fixed — admins edit each section's heading and
// links, but never add/remove a section itself.
type SidebarSectionKey string

const (
	SidebarSectionMostPopularTopics SidebarSectionKey = "most_popular_topics"
	SidebarSectionRegionCasinoGames SidebarSectionKey = "region_casino_games"
	SidebarSectionCasinoBonuses     SidebarSectionKey = "casino_bonuses"
)

type SidebarLink struct {
	ID          int64
	SectionID   int64
	Label       string
	URL         string
	HasDropdown bool
	SortOrder   int
}

type SidebarSection struct {
	ID        int64
	Key       SidebarSectionKey
	Heading   string
	SortOrder int
	Links     []SidebarLink
	CreatedAt time.Time
	UpdatedAt time.Time
}

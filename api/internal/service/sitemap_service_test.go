package service

import (
	"testing"

	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

func TestSitemapPagePaths(t *testing.T) {
	id := func(n int64) *int64 { return &n }
	pages := []repository.SitemapPage{
		{ID: 1, Slug: "home"},
		{ID: 2, Slug: "casino-games"},
		{ID: 3, ParentID: id(2), Slug: "blackjack"},
		{ID: 4, ParentID: id(3), Slug: "strategy-chart"},
		{ID: 5, ParentID: id(1), Slug: "welcome"},
		{ID: 6, ParentID: id(7), Slug: "loop-a"},
		{ID: 7, ParentID: id(6), Slug: "loop-b"},
	}
	got := sitemapPagePaths(pages)
	want := map[int64]string{
		1: "/",
		2: "/casino-games",
		3: "/casino-games/blackjack",
		4: "/casino-games/blackjack/strategy-chart",
		5: "/home/welcome",
	}
	for pageID, path := range want {
		if got[pageID] != path {
			t.Errorf("page %d: got %q, want %q", pageID, got[pageID], path)
		}
	}
}

func TestCheckSitemapURL(t *testing.T) {
	ok := []string{"/promotions/cny-2027", "https://topcasinosg.com.sg/tools", "http://TopCasinoSG.com.sg/x", "https://www.topcasinosg.com.sg/y"}
	bad := []string{"//evil.com/x", "https://evil.com/x", "ftp://topcasinosg.com.sg/x", "promotions", "/a b", "javascript:alert(1)"}
	for _, u := range ok {
		if err := checkSitemapURL(u, "topcasinosg.com.sg"); err != nil {
			t.Errorf("%q: unexpected error %v", u, err)
		}
	}
	for _, u := range bad {
		if err := checkSitemapURL(u, "topcasinosg.com.sg"); err == nil {
			t.Errorf("%q: expected an error", u)
		}
	}
}

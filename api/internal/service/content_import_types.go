package service

import (
	"context"
	"strings"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

func importRange(min, max float64) (*float64, *float64) { return &min, &max }

func importStatusColumn() domain.ImportColumn {
	return domain.ImportColumn{
		Key: "status", Kind: importKindEnum, Values: []string{string(domain.ContentStatusDraft), string(domain.ContentStatusPublished)},
		Help: "draft or published. Empty keeps new items as drafts and existing ones unchanged.", Example: "published",
	}
}

func importRegionKey(code, name string) string {
	return strings.ToLower(code) + importListSeparator + strings.ToLower(strings.TrimSpace(name))
}

func gameTypeValues() []string {
	values := make([]string, len(domain.AllGameTypes))
	for i, t := range domain.AllGameTypes {
		values[i] = string(t)
	}
	return values
}

// definitions is every importable content type, in admin menu order.
func (s *ContentImportService) definitions() []importDef {
	return []importDef{
		s.casinoImport(), s.bonusImport(), s.paymentMethodImport(), s.rtpImport(), s.blacklistImport(),
		s.guideImport(), s.newsImport(), s.providerImport(), s.licenseImport(), s.regionImport(),
	}
}

func (s *ContentImportService) casinoImport() importDef {
	ratingMin, ratingMax := importRange(0, 9.9)
	pctMin, pctMax := importRange(0, 100)
	return importDef{
		spec: domain.ImportType{
			Key: "casinos", Label: "Casinos", MatchBy: "slug",
			Columns: []domain.ImportColumn{
				{Key: "slug", Kind: importKindSlug, Required: true, MaxLength: 150, Help: "Unique web address part; an existing casino with this slug is updated.", Example: "eu9"},
				{Key: "name", Kind: importKindText, Required: true, MaxLength: 150, Help: "Casino name.", Example: "EU9"},
				{Key: "rating", Kind: importKindNumber, Min: ratingMin, Max: ratingMax, Help: "Score out of 10 (0 to 9.9).", Example: "9.2"},
				{Key: "summary", Kind: importKindText, MaxLength: 500, Help: "Short description.", Example: "Fast payouts and a big live casino."},
				{Key: "content", Kind: importKindHTML, Help: "Review text as HTML.", Example: "<p>Full review…</p>"},
				{Key: "regions", Kind: importKindRegions, Required: true, Help: "Region codes the casino appears in.", Example: "my|sg"},
				{Key: "languages", Kind: importKindList, Help: "Supported languages.", Example: "English|Chinese"},
				{Key: "currencies", Kind: importKindList, Help: "Supported currencies.", Example: "MYR|SGD"},
				{Key: "paymentMethods", Kind: importKindList, Help: "Payment method names shown on the casino.", Example: "GrabPay|Touch 'n Go"},
				{Key: "pros", Kind: importKindList, Help: "Good points.", Example: "Fast withdrawals|24/7 support"},
				{Key: "cons", Kind: importKindList, Help: "Weak points.", Example: "High wagering"},
				{Key: "safeIndex", Kind: importKindInteger, Min: pctMin, Max: pctMax, Help: "Safety index 0 to 100.", Example: "85"},
				{Key: "riskStatus", Kind: importKindEnum, Values: []string{string(domain.RiskStatusLow), string(domain.RiskStatusMedium), string(domain.RiskStatusHigh)}, Help: "Risk tier.", Example: "low"},
				{Key: "supportedGames", Kind: importKindList, Values: gameTypeValues(), Help: "Game types offered.", Example: "slots|baccarat"},
				{Key: "payoutSpeed", Kind: importKindText, MaxLength: 100, Help: "e.g. Instant, 1-3 days.", Example: "Instant"},
				{Key: "ctaUrl", Kind: importKindText, MaxLength: 500, Help: "Visit Site link.", Example: "https://example.com"},
				{Key: "gameProviders", Kind: importKindProviders, Help: "Game provider names (as in Game Providers).", Example: "Playtech|JILI Games"},
				{Key: "licenses", Kind: importKindLicenses, Help: "License names (as in Licenses).", Example: "PAGCOR"},
				{Key: "rtpPercentage", Kind: importKindNumber, Min: pctMin, Max: pctMax, Help: "Average RTP %.", Example: "96.5"},
				{Key: "cryptoSupported", Kind: importKindBoolean, Help: "yes or no.", Example: "yes"},
				{Key: "localBankingSpeed", Kind: importKindText, MaxLength: 100, Help: "e.g. Same day.", Example: "Same day"},
				importStatusColumn(),
			},
		},
		key: func(r importRow) string { return r.text("slug") },
		plan: func(ctx context.Context, lk *importLookups) (*importPlan, error) {
			list, _, err := s.casinos.ListAdmin(ctx, 1, importLookupPageSize)
			if err != nil {
				return nil, err
			}
			existing := make(map[string]domain.Casino, len(list))
			for _, c := range list {
				existing[c.Slug] = c
			}
			return &importPlan{
				exists: func(key string) bool { _, ok := existing[key]; return ok },
				write: func(ctx context.Context, actor *domain.AdminUser, r importRow, lk *importLookups) error {
					providerIDs := lk.providerList(r.list("gameProviders"))
					licenseIDs := lk.licenseList(r.list("licenses"))
					in := CasinoInput{
						Slug: r.text("slug"), Name: r.text("name"), Rating: r.number("rating"), Summary: r.text("summary"), Content: r.text("content"),
						Languages: r.list("languages"), Currencies: r.list("currencies"), PaymentMethods: r.list("paymentMethods"),
						Pros: r.list("pros"), Cons: r.list("cons"), SafeIndex: r.integerPtr("safeIndex"), SupportedGames: r.list("supportedGames"),
						PayoutSpeed: r.text("payoutSpeed"), CTAURL: r.text("ctaUrl"), RegionIDs: lk.regionList(r.list("regions")),
						GameProviderIDs: &providerIDs, LicenseIDs: &licenseIDs, RTPPercentage: r.numberPtr("rtpPercentage"),
						CryptoSupported: r.boolean("cryptoSupported", false), LocalBankingSpeed: r.text("localBankingSpeed"),
					}
					if r.has("riskStatus") {
						risk := domain.RiskStatus(r.text("riskStatus"))
						in.RiskStatus = &risk
					}
					id := int64(0)
					if e, ok := existing[in.Slug]; ok {
						in.LogoMediaID = e.LogoMediaID
						if err := s.casinos.Update(ctx, e.ID, in); err != nil {
							return err
						}
						id = e.ID
					} else {
						created, err := s.casinos.Create(ctx, actor, in)
						if err != nil {
							return err
						}
						id = created.ID
					}
					return applyImportStatus(ctx, r, id, s.casinos.SetStatus)
				},
			}, nil
		},
	}
}

func (s *ContentImportService) bonusImport() importDef {
	types := []string{
		string(domain.BonusTypeWelcome), string(domain.BonusTypeNoDeposit), string(domain.BonusTypeFreeSpins),
		string(domain.BonusTypeCashback), string(domain.BonusTypeLoyaltyVIP), string(domain.BonusTypeDeposit),
	}
	detail := func(key, help, example string) domain.ImportColumn {
		return domain.ImportColumn{Key: key, Kind: importKindText, Help: help, Example: example}
	}
	return importDef{
		spec: domain.ImportType{
			Key: "bonuses", Label: "Bonuses", MatchBy: "slug",
			Columns: []domain.ImportColumn{
				{Key: "slug", Kind: importKindSlug, Required: true, MaxLength: 200, Help: "Unique; an existing bonus with this slug is updated.", Example: "eu9-welcome-bonus-my"},
				{Key: "title", Kind: importKindText, Required: true, MaxLength: 200, Help: "Bonus title.", Example: "100% Welcome Bonus up to MYR 1,000"},
				{Key: "region", Kind: importKindRegion, Required: true, Help: "Region code.", Example: "my"},
				{Key: "casino", Kind: importKindCasino, Help: "Casino slug.", Example: "eu9"},
				{Key: "bonusType", Kind: importKindEnum, Required: true, Values: types, Help: "Bonus type.", Example: "welcome"},
				{Key: "terms", Kind: importKindHTML, Help: "Terms as HTML.", Example: "<p>18+. T&Cs apply.</p>"},
				{Key: "code", Kind: importKindText, MaxLength: 50, Help: "Bonus code, if any.", Example: "WELCOME100"},
				{Key: "validFrom", Kind: importKindDate, Help: "Start date (YYYY-MM-DD).", Example: "2026-01-01"},
				{Key: "validUntil", Kind: importKindDate, Help: "End date (YYYY-MM-DD).", Example: "2026-12-31"},
				detail("turnoverRequirement", "e.g. 25x", "25x"),
				detail("maxClaim", "e.g. MYR 1,000", "MYR 1,000"),
				detail("withdrawalLimit", "e.g. MYR 5,000", ""),
				detail("minDeposit", "e.g. MYR 30", "MYR 30"),
				detail("paymentFrequency", "Cashback: e.g. Weekly", ""),
				detail("upgradeBonus", "Loyalty / VIP upgrade reward", ""),
				detail("maxRebate", "Cashback cap", ""),
				detail("perks", "Loyalty / VIP perks", ""),
				detail("eligibleGames", "Games the bonus counts on", "Slots"),
				detail("pointConversionRate", "Loyalty points rate", ""),
				{Key: "eligibleProvider", Kind: importKindProvider, Help: "Free spins: game provider name.", Example: ""},
				importStatusColumn(),
			},
		},
		key: func(r importRow) string { return r.text("slug") },
		plan: func(ctx context.Context, lk *importLookups) (*importPlan, error) {
			list, _, err := s.bonuses.ListAdmin(ctx, nil, 1, importLookupPageSize)
			if err != nil {
				return nil, err
			}
			existing := make(map[string]int64, len(list))
			for _, b := range list {
				existing[b.Slug] = b.ID
			}
			return &importPlan{
				exists: func(key string) bool { _, ok := existing[key]; return ok },
				write: func(ctx context.Context, actor *domain.AdminUser, r importRow, lk *importLookups) error {
					in := BonusInput{
						RegionID: lk.region(r.text("region")), CasinoID: lk.casinoPtr(r.text("casino")), BonusType: domain.BonusType(r.text("bonusType")),
						Title: r.text("title"), Slug: r.text("slug"), Terms: r.text("terms"), Code: r.textPtr("code"),
						ValidFrom: r.date("validFrom"), ValidUntil: r.date("validUntil"),
						BonusDetails: domain.BonusDetails{
							TurnoverRequirement: r.text("turnoverRequirement"), MaxClaim: r.text("maxClaim"), WithdrawalLimit: r.text("withdrawalLimit"),
							MinDeposit: r.text("minDeposit"), PaymentFrequency: r.text("paymentFrequency"), UpgradeBonus: r.text("upgradeBonus"),
							MaxRebate: r.text("maxRebate"), Perks: r.text("perks"), EligibleGames: r.text("eligibleGames"),
							PointConversionRate: r.text("pointConversionRate"), EligibleProviderID: lk.providerPtr(r.text("eligibleProvider")),
						},
					}
					id, ok := existing[in.Slug]
					if ok {
						if err := s.bonuses.Update(ctx, id, in); err != nil {
							return err
						}
					} else {
						created, err := s.bonuses.Create(ctx, actor, in)
						if err != nil {
							return err
						}
						id = created.ID
					}
					return applyImportStatus(ctx, r, id, s.bonuses.SetStatus)
				},
			}, nil
		},
	}
}

func (s *ContentImportService) paymentMethodImport() importDef {
	return importDef{
		spec: domain.ImportType{
			Key: "payment_methods", Label: "Payment Methods", MatchBy: "region + name",
			Columns: []domain.ImportColumn{
				{Key: "region", Kind: importKindRegion, Required: true, Help: "Region code.", Example: "sg"},
				{Key: "name", Kind: importKindText, Required: true, MaxLength: 150, Help: "Name; an existing one with the same region and name is updated.", Example: "PayNow"},
				{Key: "description", Kind: importKindHTML, Help: "Description as HTML.", Example: "<p>Instant bank transfers in Singapore.</p>"},
				importStatusColumn(),
			},
		},
		key: func(r importRow) string { return importRegionKey(r.text("region"), r.text("name")) },
		plan: func(ctx context.Context, lk *importLookups) (*importPlan, error) {
			list, _, err := s.paymentMethods.ListAdmin(ctx, nil, 1, importLookupPageSize)
			if err != nil {
				return nil, err
			}
			existing := make(map[string]domain.PaymentMethod, len(list))
			for _, p := range list {
				existing[importRegionKey(lk.regionCodes[p.RegionID], p.Name)] = p
			}
			return &importPlan{
				exists: func(key string) bool { _, ok := existing[key]; return ok },
				write: func(ctx context.Context, actor *domain.AdminUser, r importRow, lk *importLookups) error {
					in := PaymentMethodInput{RegionID: lk.region(r.text("region")), Name: r.text("name"), Description: r.text("description")}
					var id int64
					if e, ok := existing[importRegionKey(r.text("region"), r.text("name"))]; ok {
						in.IconMediaID = e.IconMediaID
						if err := s.paymentMethods.Update(ctx, e.ID, in); err != nil {
							return err
						}
						id = e.ID
					} else {
						created, err := s.paymentMethods.Create(ctx, actor, in)
						if err != nil {
							return err
						}
						id = created.ID
					}
					return applyImportStatus(ctx, r, id, s.paymentMethods.SetStatus)
				},
			}, nil
		},
	}
}

func (s *ContentImportService) rtpImport() importDef {
	pctMin, pctMax := importRange(0, 100)
	categories := []string{string(domain.RTPCategorySlot), string(domain.RTPCategoryTable), string(domain.RTPCategoryLive), string(domain.RTPCategoryOther)}
	rtpKey := func(region, game, casino string) string {
		return importRegionKey(region, game) + importListSeparator + casino
	}
	return importDef{
		spec: domain.ImportType{
			Key: "rtp", Label: "RTP Entries", MatchBy: "region + gameName + casino",
			Columns: []domain.ImportColumn{
				{Key: "region", Kind: importKindRegion, Required: true, Help: "Region code.", Example: "th"},
				{Key: "gameName", Kind: importKindText, Required: true, MaxLength: 150, Help: "Game name.", Example: "Mega Moolah"},
				{Key: "category", Kind: importKindEnum, Required: true, Values: categories, Help: "Game category.", Example: "slot"},
				{Key: "rtpPercentage", Kind: importKindNumber, Required: true, Min: pctMin, Max: pctMax, Help: "RTP % (0 to 100).", Example: "96.5"},
				{Key: "casino", Kind: importKindCasino, Help: "Casino slug the card links to.", Example: "yes8"},
				{Key: "gameProvider", Kind: importKindProvider, Help: "Game provider name.", Example: "Microgaming"},
				importStatusColumn(),
			},
		},
		key: func(r importRow) string { return rtpKey(r.text("region"), r.text("gameName"), r.text("casino")) },
		plan: func(ctx context.Context, lk *importLookups) (*importPlan, error) {
			list, _, err := s.rtp.ListAdmin(ctx, nil, 1, importLookupPageSize)
			if err != nil {
				return nil, err
			}
			existing := make(map[string]domain.RTPEntry, len(list))
			for _, e := range list {
				casino := ""
				if e.CasinoID != nil {
					casino = lk.casinoSlugs[*e.CasinoID]
				}
				existing[rtpKey(lk.regionCodes[e.RegionID], e.GameName, casino)] = e
			}
			return &importPlan{
				exists: func(key string) bool { _, ok := existing[key]; return ok },
				write: func(ctx context.Context, actor *domain.AdminUser, r importRow, lk *importLookups) error {
					in := RTPEntryInput{
						RegionID: lk.region(r.text("region")), CasinoID: lk.casinoPtr(r.text("casino")), GameProviderID: lk.providerPtr(r.text("gameProvider")),
						GameName: r.text("gameName"), Category: domain.RTPCategory(r.text("category")), RTPPercentage: r.number("rtpPercentage"),
					}
					var id int64
					if e, ok := existing[rtpKey(r.text("region"), r.text("gameName"), r.text("casino"))]; ok {
						in.ImageMediaID = e.ImageMediaID
						if err := s.rtp.Update(ctx, e.ID, in); err != nil {
							return err
						}
						id = e.ID
					} else {
						created, err := s.rtp.Create(ctx, actor, in)
						if err != nil {
							return err
						}
						id = created.ID
					}
					return applyImportStatus(ctx, r, id, s.rtp.SetStatus)
				},
			}, nil
		},
	}
}

func (s *ContentImportService) blacklistImport() importDef {
	ratingMin, ratingMax := importRange(0, 10)
	return importDef{
		spec: domain.ImportType{
			Key: "blacklist", Label: "Blacklist", MatchBy: "region + name",
			Columns: []domain.ImportColumn{
				{Key: "name", Kind: importKindText, Required: true, MaxLength: 150, Help: "Casino name; an existing entry with the same region and name is updated.", Example: "RoyalWin888"},
				{Key: "region", Kind: importKindRegion, Help: "Region code; empty = shown in every region.", Example: ""},
				{Key: "rating", Kind: importKindNumber, Min: ratingMin, Max: ratingMax, Help: "Score out of 10.", Example: "1.6"},
				{Key: "reasons", Kind: importKindList, Help: "Why it is blacklisted (the card shows the first three).", Example: "Payment Issues|No Licensing|Rigged Games"},
				{Key: "details", Kind: importKindHTML, Help: "Details as HTML.", Example: "<p>Players report unpaid withdrawals.</p>"},
				importStatusColumn(),
			},
		},
		key: func(r importRow) string { return importRegionKey(r.text("region"), r.text("name")) },
		plan: func(ctx context.Context, lk *importLookups) (*importPlan, error) {
			list, _, err := s.blacklist.ListAdmin(ctx, nil, 1, importLookupPageSize)
			if err != nil {
				return nil, err
			}
			existing := make(map[string]domain.BlacklistEntry, len(list))
			for _, e := range list {
				existing[importRegionKey(lk.regionCodeOf(e.RegionID), e.Name)] = e
			}
			return &importPlan{
				exists: func(key string) bool { _, ok := existing[key]; return ok },
				write: func(ctx context.Context, actor *domain.AdminUser, r importRow, lk *importLookups) error {
					reasons := r.list("reasons")
					in := BlacklistEntryInput{
						RegionID: lk.regionPtr(r.text("region")), Name: r.text("name"), Rating: r.numberPtr("rating"),
						Reasons: reasons, Details: r.text("details"),
					}
					if len(reasons) > 0 {
						in.Reason = reasons[0]
					}
					var id int64
					if e, ok := existing[importRegionKey(r.text("region"), r.text("name"))]; ok {
						in.LogoMediaID = e.LogoMediaID
						if err := s.blacklist.Update(ctx, e.ID, in); err != nil {
							return err
						}
						id = e.ID
					} else {
						created, err := s.blacklist.Create(ctx, actor, in)
						if err != nil {
							return err
						}
						id = created.ID
					}
					return applyImportStatus(ctx, r, id, s.blacklist.SetStatus)
				},
			}, nil
		},
	}
}

func (s *ContentImportService) guideImport() importDef {
	return importDef{
		spec: domain.ImportType{
			Key: "guides", Label: "Guides", MatchBy: "slug",
			Columns: []domain.ImportColumn{
				{Key: "slug", Kind: importKindSlug, Required: true, MaxLength: 200, Help: "Unique; an existing guide with this slug is updated.", Example: "how-to-pick-the-right-casino"},
				{Key: "title", Kind: importKindText, Required: true, MaxLength: 200, Help: "Guide title.", Example: "How to Pick the Right Casino"},
				{Key: "region", Kind: importKindRegion, Help: "Region code; empty = the global guide.", Example: ""},
				{Key: "excerpt", Kind: importKindText, MaxLength: 500, Help: "Short summary for cards.", Example: "Learn how to identify safe, licensed operators."},
				{Key: "content", Kind: importKindHTML, Help: "Guide text as HTML.", Example: "<p>Start with the licence…</p>"},
				importStatusColumn(),
			},
		},
		key: func(r importRow) string { return r.text("slug") },
		plan: func(ctx context.Context, lk *importLookups) (*importPlan, error) {
			list, _, err := s.guides.ListAdmin(ctx, nil, 1, importLookupPageSize)
			if err != nil {
				return nil, err
			}
			existing := make(map[string]domain.Guide, len(list))
			for _, g := range list {
				existing[g.Slug] = g
			}
			return &importPlan{
				exists: func(key string) bool { _, ok := existing[key]; return ok },
				write: func(ctx context.Context, actor *domain.AdminUser, r importRow, lk *importLookups) error {
					in := GuideInput{RegionID: lk.regionPtr(r.text("region")), Title: r.text("title"), Slug: r.text("slug"), Excerpt: r.text("excerpt"), Content: r.text("content")}
					var id int64
					if e, ok := existing[in.Slug]; ok {
						in.CoverMediaID = e.CoverMediaID
						if err := s.guides.Update(ctx, e.ID, in); err != nil {
							return err
						}
						id = e.ID
					} else {
						created, err := s.guides.Create(ctx, actor, in)
						if err != nil {
							return err
						}
						id = created.ID
					}
					return applyImportStatus(ctx, r, id, s.guides.SetStatus)
				},
			}, nil
		},
	}
}

func (s *ContentImportService) newsImport() importDef {
	return importDef{
		spec: domain.ImportType{
			Key: "news", Label: "News", MatchBy: "slug",
			Columns: []domain.ImportColumn{
				{Key: "slug", Kind: importKindSlug, Required: true, MaxLength: 200, Help: "Unique; an existing article with this slug is updated.", Example: "singapore-tightens-online-gambling-laws"},
				{Key: "title", Kind: importKindText, Required: true, MaxLength: 200, Help: "Article title.", Example: "Singapore Tightens Online Gambling Laws"},
				{Key: "excerpt", Kind: importKindText, MaxLength: 500, Help: "Short summary for cards.", Example: "New rules take effect next year."},
				{Key: "content", Kind: importKindHTML, Help: "Article text as HTML.", Example: "<p>The new rules…</p>"},
				importStatusColumn(),
			},
		},
		key: func(r importRow) string { return r.text("slug") },
		plan: func(ctx context.Context, lk *importLookups) (*importPlan, error) {
			list, _, err := s.news.ListAdmin(ctx, 1, importLookupPageSize)
			if err != nil {
				return nil, err
			}
			existing := make(map[string]domain.NewsArticle, len(list))
			for _, a := range list {
				existing[a.Slug] = a
			}
			return &importPlan{
				exists: func(key string) bool { _, ok := existing[key]; return ok },
				write: func(ctx context.Context, actor *domain.AdminUser, r importRow, lk *importLookups) error {
					in := NewsArticleInput{Title: r.text("title"), Slug: r.text("slug"), Excerpt: r.text("excerpt"), Content: r.text("content")}
					var id int64
					if e, ok := existing[in.Slug]; ok {
						in.CoverMediaID = e.CoverMediaID
						if err := s.news.Update(ctx, e.ID, in); err != nil {
							return err
						}
						id = e.ID
					} else {
						created, err := s.news.Create(ctx, actor, in)
						if err != nil {
							return err
						}
						id = created.ID
					}
					return applyImportStatus(ctx, r, id, s.news.SetStatus)
				},
			}, nil
		},
	}
}

func (s *ContentImportService) providerImport() importDef {
	return importDef{
		spec: domain.ImportType{
			Key: "game_providers", Label: "Game Providers", MatchBy: "name", AdminOnly: true,
			Columns: []domain.ImportColumn{
				{Key: "name", Kind: importKindText, Required: true, MaxLength: 150, Help: "Provider name; an existing provider with this name is updated.", Example: "Playtech"},
				{Key: "sortOrder", Kind: importKindInteger, Help: "Display order, lowest first. Empty keeps the current order.", Example: "1"},
			},
		},
		key: func(r importRow) string { return strings.ToLower(r.text("name")) },
		plan: func(ctx context.Context, lk *importLookups) (*importPlan, error) {
			list, err := s.providers.List(ctx)
			if err != nil {
				return nil, err
			}
			existing := make(map[string]domain.GameProvider, len(list))
			for _, p := range list {
				existing[strings.ToLower(p.Name)] = p
			}
			return &importPlan{
				exists: func(key string) bool { _, ok := existing[key]; return ok },
				write: func(ctx context.Context, actor *domain.AdminUser, r importRow, lk *importLookups) error {
					if e, ok := existing[strings.ToLower(r.text("name"))]; ok {
						return s.providers.Update(ctx, actor, e.ID, r.text("name"), e.LogoMediaID, r.integer("sortOrder", e.SortOrder))
					}
					_, err := s.providers.Create(ctx, actor, r.text("name"), nil, r.integer("sortOrder", 0))
					return err
				},
			}, nil
		},
	}
}

func (s *ContentImportService) licenseImport() importDef {
	return importDef{
		spec: domain.ImportType{
			Key: "licenses", Label: "Licenses", MatchBy: "name", AdminOnly: true,
			Columns: []domain.ImportColumn{
				{Key: "name", Kind: importKindText, Required: true, MaxLength: 150, Help: "License / regulator name; an existing one with this name is updated.", Example: "PAGCOR"},
				{Key: "sortOrder", Kind: importKindInteger, Help: "Display order, lowest first. Empty keeps the current order.", Example: "1"},
			},
		},
		key: func(r importRow) string { return strings.ToLower(r.text("name")) },
		plan: func(ctx context.Context, lk *importLookups) (*importPlan, error) {
			list, err := s.licenses.List(ctx)
			if err != nil {
				return nil, err
			}
			existing := make(map[string]domain.License, len(list))
			for _, l := range list {
				existing[strings.ToLower(l.Name)] = l
			}
			return &importPlan{
				exists: func(key string) bool { _, ok := existing[key]; return ok },
				write: func(ctx context.Context, actor *domain.AdminUser, r importRow, lk *importLookups) error {
					if e, ok := existing[strings.ToLower(r.text("name"))]; ok {
						return s.licenses.Update(ctx, actor, e.ID, r.text("name"), e.LogoMediaID, r.integer("sortOrder", e.SortOrder))
					}
					_, err := s.licenses.Create(ctx, actor, r.text("name"), nil, r.integer("sortOrder", 0))
					return err
				},
			}, nil
		},
	}
}

func (s *ContentImportService) regionImport() importDef {
	return importDef{
		spec: domain.ImportType{
			Key: "regions", Label: "Regions", MatchBy: "code", AdminOnly: true,
			Columns: []domain.ImportColumn{
				{Key: "code", Kind: importKindSlug, Required: true, MaxLength: 10, Help: "Short lowercase code used in URLs (/th); an existing region with this code is updated.", Example: "th"},
				{Key: "name", Kind: importKindText, Required: true, MaxLength: 100, Help: "Country name.", Example: "Thailand"},
				{Key: "demonym", Kind: importKindText, MaxLength: 100, Help: "e.g. Thai (used in text like “Thai players”).", Example: "Thai"},
				{Key: "currencyCode", Kind: importKindText, MaxLength: 10, Help: "e.g. THB.", Example: "THB"},
				{Key: "sortOrder", Kind: importKindInteger, Help: "Display order, lowest first. Empty keeps the current order.", Example: "1"},
				{Key: "active", Kind: importKindBoolean, Help: "yes or no. Empty: new regions are active, existing ones unchanged.", Example: "yes"},
			},
		},
		key: func(r importRow) string { return strings.ToLower(r.text("code")) },
		plan: func(ctx context.Context, lk *importLookups) (*importPlan, error) {
			list, err := s.regions.List(ctx)
			if err != nil {
				return nil, err
			}
			existing := make(map[string]domain.Region, len(list))
			for _, region := range list {
				existing[strings.ToLower(region.Code)] = region
			}
			return &importPlan{
				exists: func(key string) bool { _, ok := existing[key]; return ok },
				write: func(ctx context.Context, actor *domain.AdminUser, r importRow, lk *importLookups) error {
					in := RegionInput{Code: strings.ToLower(r.text("code")), Name: r.text("name"), Demonym: r.text("demonym"), CurrencyCode: r.text("currencyCode")}
					var id int64
					if e, ok := existing[in.Code]; ok {
						in.FlagMediaID, in.SortOrder = e.FlagMediaID, r.integer("sortOrder", e.SortOrder)
						if err := s.regions.Update(ctx, actor, e.ID, in); err != nil {
							return err
						}
						id = e.ID
					} else {
						in.SortOrder = r.integer("sortOrder", 0)
						created, err := s.regions.Create(ctx, actor, in)
						if err != nil {
							return err
						}
						id = created.ID
					}
					if !r.has("active") {
						return nil
					}
					return s.regions.SetActive(ctx, actor, id, r.boolean("active", true))
				},
			}, nil
		},
	}
}

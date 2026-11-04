package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"sort"
	"strconv"
	"strings"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

// ContentChangeService handles changes proposed through the Content API: it
// checks them with the same rules as the admin editors, stores them as
// pending, and applies one only when an admin approves it. New pages and
// articles are created as drafts; an update changes the existing content.
type ContentChangeService struct {
	changes *repository.ContentChangeRepo
	pages   *PageService
	news    *NewsArticleService
	media   *MediaService
}

func NewContentChangeService(changes *repository.ContentChangeRepo, pages *PageService, news *NewsArticleService, media *MediaService) *ContentChangeService {
	return &ContentChangeService{changes: changes, pages: pages, news: news, media: media}
}

// FieldInput is one value of a page section, in the Content API's JSON
// shape (the same as the admin's). MediaURL is filled in on reads only.
type FieldInput struct {
	ItemIndex int     `json:"itemIndex"`
	FieldKey  string  `json:"fieldKey"`
	FieldType string  `json:"fieldType"`
	TextValue string  `json:"textValue"`
	MediaID   *int64  `json:"mediaId"`
	MediaURL  *string `json:"mediaUrl,omitempty"`
	URLValue  string  `json:"urlValue"`
	SortOrder int     `json:"sortOrder"`
}

// SectionInput is one page section (a Container, a Global Section or a
// component); a section's order is its place in the list.
type SectionInput struct {
	BlockType   string `json:"blockType"`
	CustomClass string `json:"customClass"`
	CustomID    string `json:"customId"`
	InContainer bool   `json:"inContainer"`
	// Depth is the level: 0 directly on the page, N inside the nearest
	// Container before it at level N-1. Without it, inContainer true means
	// level 1.
	Depth int `json:"depth"`
	// SortOrder is accepted so the admin's own section shape can be sent
	// as is, but ignored: the list order is the page order.
	SortOrder int          `json:"sortOrder,omitempty"`
	Fields    []FieldInput `json:"fields"`
}

// PageChange is a proposed new page (ParentID, Slug, Title and Sections) or
// an update to one, where anything left out stays as it is. Sections, when
// given, replace the page's whole section list.
type PageChange struct {
	ParentID        *int64          `json:"parentId,omitempty"`
	Slug            string          `json:"slug,omitempty"`
	Title           *string         `json:"title,omitempty"`
	MetaTitle       *string         `json:"metaTitle,omitempty"`
	MetaDescription *string         `json:"metaDescription,omitempty"`
	Sections        *[]SectionInput `json:"sections,omitempty"`
}

// NewsChange is a proposed new news article or an update to one, where
// anything left out stays as it is.
type NewsChange struct {
	Title        *string `json:"title,omitempty"`
	Slug         *string `json:"slug,omitempty"`
	Excerpt      *string `json:"excerpt,omitempty"`
	Content      *string `json:"content,omitempty"`
	CoverMediaID *int64  `json:"coverMediaId,omitempty"`
}

// Proposal is what a tool submits: the change, why (Note), and whether to
// only check it (DryRun) instead of storing it.
type Proposal struct {
	Key      *domain.APIKey
	TargetID *int64
	Note     string
	DryRun   bool
	// Global: TargetID is a Global Section (shown on every page that places
	// it), not a page.
	Global bool
}

var slugPattern = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

func invalid(format string, args ...any) error {
	return fmt.Errorf("%w: %s", ErrInvalidChange, fmt.Sprintf(format, args...))
}

// SectionInputs converts stored sections to the Content API's shape, in
// display order.
func SectionInputs(sections []domain.PageSection) []SectionInput {
	out := make([]SectionInput, len(sections))
	for i, s := range sections {
		fields := make([]FieldInput, len(s.Fields))
		for j, f := range s.Fields {
			fields[j] = FieldInput{
				ItemIndex: f.ItemIndex, FieldKey: f.FieldKey, FieldType: f.FieldType, TextValue: f.TextValue,
				MediaID: f.MediaID, MediaURL: f.MediaURL, URLValue: f.URLValue, SortOrder: f.SortOrder,
			}
		}
		out[i] = SectionInput{BlockType: s.BlockType, CustomClass: s.CustomClass, CustomID: s.CustomID, InContainer: s.InContainer, Depth: s.Depth, Fields: fields}
	}
	return out
}

func toDomainSectionList(pageID int64, sections []SectionInput) []domain.PageSection {
	out := make([]domain.PageSection, len(sections))
	for i, s := range sections {
		fields := make([]domain.PageSectionField, len(s.Fields))
		for j, f := range s.Fields {
			fields[j] = domain.PageSectionField{
				ItemIndex: f.ItemIndex, FieldKey: f.FieldKey, FieldType: f.FieldType, TextValue: f.TextValue,
				MediaID: f.MediaID, URLValue: f.URLValue, SortOrder: f.SortOrder,
			}
		}
		out[i] = domain.PageSection{
			PageID: pageID, BlockType: s.BlockType, CustomClass: s.CustomClass, CustomID: s.CustomID,
			InContainer: s.InContainer, Depth: s.Depth, SortOrder: i, Fields: fields,
		}
	}
	domain.NormalizeSectionDepths(out)
	return out
}

// checkPageSections explains exactly which section breaks which rule, since
// the caller is usually an AI tool that has to fix and resend it.
func (s *ContentChangeService) checkPageSections(ctx context.Context, kind string, sections []SectionInput) error {
	var open []int // depths of the Containers the next section can be inside
	for i, section := range sections {
		where := fmt.Sprintf("sections[%d]", i)
		if !isKnownBlockType(section.BlockType) {
			return invalid("%s: unknown blockType %q (GET /api/v1/schema lists them)", where, section.BlockType)
		}
		depth := section.Depth
		if depth <= 0 && section.InContainer {
			depth = 1
		}
		if depth < 0 || depth > domain.MaxSectionDepth {
			return invalid("%s: depth must be 0 to %d (got %d)", where, domain.MaxSectionDepth, depth)
		}
		for len(open) > 0 && open[len(open)-1] >= depth {
			open = open[:len(open)-1]
		}
		if depth > 0 && (len(open) == 0 || open[len(open)-1] != depth-1) {
			return invalid("%s: depth %d needs a Container at depth %d before it (a section belongs to the nearest Container before it, one level up)", where, depth, depth-1)
		}
		if depth == 0 && section.BlockType != domain.BlockTypeContainer && section.BlockType != domain.BlockTypeGlobalSection {
			return invalid("%s: %q is a component, so it must be inside a Container: put a container section before it and give this one depth 1", where, section.BlockType)
		}
		if section.BlockType == domain.BlockTypeContainer {
			if depth >= domain.MaxSectionDepth {
				return invalid("%s: a Container can be at most at depth %d, so it has room for components", where, domain.MaxSectionDepth-1)
			}
			open = append(open, depth)
		}
		for j, f := range section.Fields {
			fwhere := fmt.Sprintf("%s.fields[%d]", where, j)
			if !isKnownFieldType(f.FieldType) {
				return invalid("%s: fieldType must be text, richtext, image or button (got %q)", fwhere, f.FieldType)
			}
			if strings.TrimSpace(f.FieldKey) == "" {
				return invalid("%s: fieldKey is required", fwhere)
			}
			if f.MediaID != nil {
				if _, err := s.media.Get(ctx, *f.MediaID); err != nil {
					return invalid("%s: mediaId %d is not in the Media Library (upload it with POST /api/v1/media)", fwhere, *f.MediaID)
				}
			}
			if section.BlockType == domain.BlockTypeGlobalSection && f.FieldKey == "globalId" {
				id, err := strconv.ParseInt(strings.TrimSpace(f.TextValue), 10, 64)
				if err != nil {
					return invalid("%s: globalId must be a Global Section id (GET /api/v1/global-sections)", fwhere)
				}
				if _, err := s.pages.GlobalSections(ctx, id); err != nil {
					return invalid("%s: there is no Global Section %d", fwhere, id)
				}
			}
		}
	}
	// The same rules the admin editor's save goes through.
	if kind == domain.PageKindGlobal && hasGlobalSectionBlock(toDomainSectionList(0, sections)) {
		return invalid("a Global Section can't include another Global Section (no global_section blocks in it)")
	}
	if err := checkSections(kind, toDomainSectionList(0, sections)); err != nil {
		return invalid("%s", err.Error())
	}
	return nil
}

// livePage is a page of the given kind (a normal page, or a Global Section
// for Proposal.Global).
func (s *ContentChangeService) livePage(ctx context.Context, id int64, kind string) (*domain.Page, error) {
	page, err := s.pages.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if page.Kind != kind {
		return nil, repository.ErrNotFound
	}
	return page, nil
}

// changeTarget is what a stored page change updates: a page or a Global
// Section (checked when it was proposed).
func (s *ContentChangeService) changeTarget(ctx context.Context, id int64) (*domain.Page, error) {
	page, err := s.pages.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if page.Kind != domain.PageKindPage && page.Kind != domain.PageKindGlobal {
		return nil, repository.ErrNotFound
	}
	return page, nil
}

// PageFingerprint identifies a page's current editable content, to tell
// whether it changed after a proposal was based on it.
func (s *ContentChangeService) PageFingerprint(ctx context.Context, id int64) (string, error) {
	page, err := s.changeTarget(ctx, id)
	if err != nil {
		return "", err
	}
	sections, err := s.pages.Sections(ctx, id)
	if err != nil {
		return "", err
	}
	inputs := SectionInputs(sections)
	for i := range inputs {
		for j := range inputs[i].Fields {
			inputs[i].Fields[j].MediaURL = nil
		}
	}
	return fingerprint(map[string]any{
		"title": page.Title, "metaTitle": page.MetaTitle, "metaDescription": page.MetaDescription, "sections": inputs,
	})
}

func (s *ContentChangeService) newsFingerprint(ctx context.Context, id int64) (string, error) {
	n, err := s.news.Get(ctx, id)
	if err != nil {
		return "", err
	}
	return fingerprint(map[string]any{
		"title": n.Title, "slug": n.Slug, "excerpt": n.Excerpt, "content": n.Content, "coverMediaId": n.CoverMediaID,
	})
}

func fingerprint(v any) (string, error) {
	encoded, err := json.Marshal(v)
	if err != nil {
		return "", err
	}
	sum := sha256.Sum256(encoded)
	return hex.EncodeToString(sum[:]), nil
}

// ProposePage checks a page change and, unless it's a dry run, stores it
// as pending. With p.TargetID it updates that page; without, it's a new page.
func (s *ContentChangeService) ProposePage(ctx context.Context, p Proposal, change PageChange) (*domain.ContentChange, error) {
	var warnings []string
	if change.Sections != nil {
		kind := domain.PageKindPage
		if p.Global {
			kind = domain.PageKindGlobal
		}
		if err := s.checkPageSections(ctx, kind, *change.Sections); err != nil {
			return nil, err
		}
		var err error
		if warnings, err = s.fieldWarnings(ctx, *change.Sections); err != nil {
			return nil, err
		}
	}
	result, err := s.proposePage(ctx, p, change)
	if result != nil {
		result.Warnings = warnings
	}
	return result, err
}

// fieldWarnings points out field keys that no section of that block type
// uses anywhere on the site: usually a misspelt key, which the website
// would simply not show. It's a warning, not an error, since a block can
// gain new fields.
func (s *ContentChangeService) fieldWarnings(ctx context.Context, sections []SectionInput) ([]string, error) {
	catalog, err := s.pages.FieldCatalog(ctx)
	if err != nil {
		return nil, err
	}
	known := map[string]map[string]bool{}
	for _, u := range catalog {
		if known[u.BlockType] == nil {
			known[u.BlockType] = map[string]bool{}
		}
		known[u.BlockType][u.FieldKey] = true
	}
	var warnings []string
	for i, section := range sections {
		keys := known[section.BlockType]
		if len(keys) == 0 {
			continue
		}
		for j, f := range section.Fields {
			if !keys[f.FieldKey] {
				var list []string
				for k := range keys {
					list = append(list, k)
				}
				sort.Strings(list)
				warnings = append(warnings, fmt.Sprintf("sections[%d].fields[%d]: no %q section on the site uses the field %q, so it may not show. Fields in use: %s",
					i, j, section.BlockType, f.FieldKey, strings.Join(list, ", ")))
			}
		}
	}
	return warnings, nil
}

func (s *ContentChangeService) proposePage(ctx context.Context, p Proposal, change PageChange) (*domain.ContentChange, error) {
	if change.Title != nil && strings.TrimSpace(*change.Title) == "" {
		return nil, invalid("title can't be empty")
	}
	c := &domain.ContentChange{ContentType: domain.ContentChangePage, TargetID: p.TargetID}
	if p.Global {
		if p.TargetID == nil {
			return nil, invalid("a Global Section is created in the dashboard (Pages > Global Sections); the API changes existing ones")
		}
		if change.MetaTitle != nil || change.MetaDescription != nil {
			return nil, invalid("a Global Section has no SEO fields: send name and sections only")
		}
	}
	if p.TargetID != nil {
		kind := domain.PageKindPage
		if p.Global {
			kind = domain.PageKindGlobal
		}
		page, err := s.livePage(ctx, *p.TargetID, kind)
		if err != nil {
			return nil, err
		}
		if change.Slug != "" || change.ParentID != nil {
			return nil, invalid("an update can't change the page's slug or parent; ask an admin to do that")
		}
		if change.Title == nil && change.MetaTitle == nil && change.MetaDescription == nil && change.Sections == nil {
			return nil, invalid("nothing to change: send title, metaTitle, metaDescription or sections")
		}
		c.Action, c.Label = domain.ContentChangeUpdate, page.Title
		if change.Title != nil {
			c.Label = *change.Title
		}
		if c.BaseHash, err = s.PageFingerprint(ctx, page.ID); err != nil {
			return nil, err
		}
	} else {
		if change.Title == nil {
			return nil, invalid("title is required for a new page")
		}
		if !slugPattern.MatchString(change.Slug) {
			return nil, invalid("slug is required for a new page: lowercase letters, numbers and hyphens, e.g. \"payment-guide\"")
		}
		if change.ParentID != nil {
			if _, err := s.livePage(ctx, *change.ParentID, domain.PageKindPage); err != nil {
				return nil, invalid("parentId %d is not a page", *change.ParentID)
			}
		}
		paths, err := s.pages.PathsByID(ctx)
		if err != nil {
			return nil, err
		}
		target := change.Slug
		if change.ParentID != nil {
			target = paths[*change.ParentID] + "/" + change.Slug
		}
		for _, path := range paths {
			if path == target {
				return nil, invalid("a page already exists at /%s", target)
			}
		}
		c.Action, c.Label = domain.ContentChangeCreate, *change.Title
	}
	return s.store(ctx, p, c, change)
}

// ProposeNews checks a news change and, unless it's a dry run, stores it
// as pending. With p.TargetID it updates that article; without, it's new.
func (s *ContentChangeService) ProposeNews(ctx context.Context, p Proposal, change NewsChange) (*domain.ContentChange, error) {
	if change.Title != nil && strings.TrimSpace(*change.Title) == "" {
		return nil, invalid("title can't be empty")
	}
	if change.Slug != nil && !slugPattern.MatchString(*change.Slug) {
		return nil, invalid("slug must be lowercase letters, numbers and hyphens, e.g. \"new-casino-rules-2026\"")
	}
	if change.CoverMediaID != nil {
		if _, err := s.media.Get(ctx, *change.CoverMediaID); err != nil {
			return nil, invalid("coverMediaId %d is not in the Media Library (upload it with POST /api/v1/media)", *change.CoverMediaID)
		}
	}
	c := &domain.ContentChange{ContentType: domain.ContentChangeNews, TargetID: p.TargetID}
	var excludeID int64
	if p.TargetID != nil {
		article, err := s.news.Get(ctx, *p.TargetID)
		if err != nil {
			return nil, err
		}
		if change.Title == nil && change.Slug == nil && change.Excerpt == nil && change.Content == nil && change.CoverMediaID == nil {
			return nil, invalid("nothing to change: send title, slug, excerpt, content or coverMediaId")
		}
		excludeID = article.ID
		c.Action, c.Label = domain.ContentChangeUpdate, article.Title
		if change.Title != nil {
			c.Label = *change.Title
		}
		if c.BaseHash, err = s.newsFingerprint(ctx, article.ID); err != nil {
			return nil, err
		}
	} else {
		if change.Title == nil || change.Slug == nil {
			return nil, invalid("title and slug are required for a new article")
		}
		c.Action, c.Label = domain.ContentChangeCreate, *change.Title
	}
	if change.Slug != nil {
		exists, err := s.news.news.ExistsSlug(ctx, *change.Slug, excludeID)
		if err != nil {
			return nil, err
		}
		if exists {
			return nil, invalid("another article already uses the slug %q", *change.Slug)
		}
	}
	return s.store(ctx, p, c, change)
}

func (s *ContentChangeService) store(ctx context.Context, p Proposal, c *domain.ContentChange, change any) (*domain.ContentChange, error) {
	payload, err := json.Marshal(change)
	if err != nil {
		return nil, err
	}
	c.Payload, c.Note, c.Status = payload, strings.TrimSpace(p.Note), domain.ContentChangePending
	if len(c.Label) > 255 {
		c.Label = c.Label[:255]
	}
	if p.Key != nil {
		c.APIKeyID, c.APIKeyName = &p.Key.ID, p.Key.Name
	}
	if p.DryRun {
		return c, nil
	}
	id, err := s.changes.Create(ctx, c)
	if err != nil {
		return nil, err
	}
	return s.Get(ctx, id)
}

// Get returns a change; a pending update is marked Outdated when its
// content was edited after the change was proposed.
func (s *ContentChangeService) Get(ctx context.Context, id int64) (*domain.ContentChange, error) {
	c, err := s.changes.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	s.markOutdated(ctx, c)
	return c, nil
}

func (s *ContentChangeService) markOutdated(ctx context.Context, c *domain.ContentChange) {
	if c.Status != domain.ContentChangePending || c.Action != domain.ContentChangeUpdate || c.TargetID == nil {
		return
	}
	current, err := s.currentFingerprint(ctx, c)
	c.Outdated = err != nil || current != c.BaseHash
}

func (s *ContentChangeService) currentFingerprint(ctx context.Context, c *domain.ContentChange) (string, error) {
	if c.ContentType == domain.ContentChangeNews {
		return s.newsFingerprint(ctx, *c.TargetID)
	}
	return s.PageFingerprint(ctx, *c.TargetID)
}

func (s *ContentChangeService) List(ctx context.Context, f repository.ContentChangeFilter) ([]domain.ContentChange, int, error) {
	if f.Limit < 1 || f.Limit > 100 {
		f.Limit = 20
	}
	changes, total, err := s.changes.List(ctx, f)
	if err != nil {
		return nil, 0, err
	}
	for i := range changes {
		s.markOutdated(ctx, &changes[i])
	}
	return changes, total, nil
}

func (s *ContentChangeService) CountPending(ctx context.Context) (int, error) {
	return s.changes.CountPending(ctx)
}

// PageChangeOf decodes a page change's payload.
func PageChangeOf(c *domain.ContentChange) (PageChange, error) {
	var change PageChange
	err := json.Unmarshal(c.Payload, &change)
	return change, err
}

// NewsChangeOf decodes a news change's payload.
func NewsChangeOf(c *domain.ContentChange) (NewsChange, error) {
	var change NewsChange
	err := json.Unmarshal(c.Payload, &change)
	return change, err
}

// PreviewToken stores a page update's proposed sections as a one-hour
// preview (see PageService.CreatePreview); it returns "" when the change
// has no sections to show on an existing page.
func (s *ContentChangeService) PreviewToken(ctx context.Context, c *domain.ContentChange) (string, error) {
	if c.ContentType != domain.ContentChangePage || c.TargetID == nil {
		return "", nil
	}
	change, err := PageChangeOf(c)
	if err != nil || change.Sections == nil {
		return "", err
	}
	return s.pages.CreatePreview(ctx, *c.TargetID, toDomainSectionList(*c.TargetID, *change.Sections))
}

// Approve applies a pending change. When its content was edited after the
// change was proposed it refuses with ErrChangeOutdated, unless force.
func (s *ContentChangeService) Approve(ctx context.Context, id int64, reviewer *domain.AdminUser, note string, force bool) (*domain.ContentChange, error) {
	c, err := s.Get(ctx, id)
	if err != nil {
		return nil, err
	}
	if c.Status != domain.ContentChangePending {
		return nil, ErrChangeNotPending
	}
	if c.Outdated && !force {
		return nil, ErrChangeOutdated
	}
	// Claim it first, so a second reviewer can't apply it twice.
	reviewerID := reviewer.ID
	if err := s.changes.SetStatus(ctx, id, domain.ContentChangeApproved, strings.TrimSpace(note), &reviewerID, nil); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, ErrChangeNotPending
		}
		return nil, err
	}
	resultID, err := s.apply(ctx, c, reviewer)
	if err != nil {
		_ = s.changes.Reopen(context.WithoutCancel(ctx), id)
		return nil, err
	}
	if err := s.changes.SetResult(ctx, id, resultID); err != nil {
		return nil, err
	}
	return s.Get(ctx, id)
}

func (s *ContentChangeService) apply(ctx context.Context, c *domain.ContentChange, reviewer *domain.AdminUser) (int64, error) {
	reviewerID := reviewer.ID
	switch c.ContentType {
	case domain.ContentChangePage:
		change, err := PageChangeOf(c)
		if err != nil {
			return 0, err
		}
		if c.TargetID == nil {
			page, err := s.pages.Create(ctx, PageInput{
				ParentID: change.ParentID, Slug: change.Slug, Title: deref(change.Title),
				MetaTitle: deref(change.MetaTitle), MetaDescription: deref(change.MetaDescription),
			})
			if err != nil {
				return 0, err
			}
			if change.Sections != nil {
				if err := s.pages.ReplaceSections(ctx, page.ID, toDomainSectionList(page.ID, *change.Sections), &reviewerID, domain.PageRevisionAIChange); err != nil {
					_ = s.pages.Delete(context.WithoutCancel(ctx), page.ID)
					return 0, err
				}
			}
			return page.ID, nil
		}
		page, err := s.changeTarget(ctx, *c.TargetID)
		if err != nil {
			return 0, err
		}
		if change.Sections != nil {
			if err := s.pages.ReplaceSections(ctx, page.ID, toDomainSectionList(page.ID, *change.Sections), &reviewerID, domain.PageRevisionAIChange); err != nil {
				return 0, err
			}
		}
		if page.Kind == domain.PageKindGlobal {
			if change.Title != nil {
				if err := s.pages.RenameGlobal(ctx, page.ID, *change.Title); err != nil {
					return 0, err
				}
			}
			return page.ID, nil
		}
		if change.Title != nil {
			if err := s.pages.Update(ctx, page.ID, PageInput{ParentID: page.ParentID, Slug: page.Slug, Title: *change.Title}); err != nil {
				return 0, err
			}
		}
		if change.MetaTitle != nil || change.MetaDescription != nil {
			seo := SEOInput{MetaTitle: page.MetaTitle, MetaDescription: page.MetaDescription}
			if change.MetaTitle != nil {
				seo.MetaTitle = *change.MetaTitle
			}
			if change.MetaDescription != nil {
				seo.MetaDescription = *change.MetaDescription
			}
			if err := s.pages.UpdateSEO(ctx, page.ID, seo); err != nil {
				return 0, err
			}
		}
		return page.ID, nil

	case domain.ContentChangeNews:
		change, err := NewsChangeOf(c)
		if err != nil {
			return 0, err
		}
		if c.TargetID == nil {
			article, err := s.news.Create(ctx, reviewer, NewsArticleInput{
				Title: deref(change.Title), Slug: deref(change.Slug), CoverMediaID: change.CoverMediaID,
				Excerpt: deref(change.Excerpt), Content: deref(change.Content),
			})
			if err != nil {
				return 0, err
			}
			return article.ID, nil
		}
		current, err := s.news.Get(ctx, *c.TargetID)
		if err != nil {
			return 0, err
		}
		in := NewsArticleInput{
			Title: current.Title, Slug: current.Slug, CoverMediaID: current.CoverMediaID, Excerpt: current.Excerpt, Content: current.Content,
		}
		if change.Title != nil {
			in.Title = *change.Title
		}
		if change.Slug != nil {
			in.Slug = *change.Slug
		}
		if change.Excerpt != nil {
			in.Excerpt = *change.Excerpt
		}
		if change.Content != nil {
			in.Content = *change.Content
		}
		if change.CoverMediaID != nil {
			in.CoverMediaID = change.CoverMediaID
		}
		if err := s.news.Update(ctx, current.ID, in); err != nil {
			return 0, err
		}
		return current.ID, nil
	}
	return 0, fmt.Errorf("unknown content type %q", c.ContentType)
}

// Reject closes a pending change without applying it.
func (s *ContentChangeService) Reject(ctx context.Context, id int64, reviewer *domain.AdminUser, note string) (*domain.ContentChange, error) {
	reviewerID := reviewer.ID
	if err := s.changes.SetStatus(ctx, id, domain.ContentChangeRejected, strings.TrimSpace(note), &reviewerID, nil); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			if _, getErr := s.changes.GetByID(ctx, id); getErr != nil {
				return nil, getErr
			}
			return nil, ErrChangeNotPending
		}
		return nil, err
	}
	return s.Get(ctx, id)
}

// Withdraw lets the key that proposed a pending change take it back.
func (s *ContentChangeService) Withdraw(ctx context.Context, id int64, key *domain.APIKey) (*domain.ContentChange, error) {
	c, err := s.changes.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if c.APIKeyID == nil || *c.APIKeyID != key.ID {
		return nil, repository.ErrNotFound
	}
	if err := s.changes.SetStatus(ctx, id, domain.ContentChangeWithdrawn, "", nil, nil); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, ErrChangeNotPending
		}
		return nil, err
	}
	return s.Get(ctx, id)
}

func deref(v *string) string {
	if v == nil {
		return ""
	}
	return *v
}

package service

import (
	"context"
	"strings"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

// PageService manages the flexible block-based page builder (Homepage,
// About, ...). Content-management roles (Super Admin, Admin, Editor) can all
// edit pages, same tier as Casinos/Guides/News — a page is content, not
// site-structural config like Regions or Navigation.
type PageService struct {
	pages *repository.PageRepo
}

func NewPageService(pages *repository.PageRepo) *PageService {
	return &PageService{pages: pages}
}

func (s *PageService) List(ctx context.Context) ([]domain.Page, error) {
	return s.pages.List(ctx)
}

func (s *PageService) GetByID(ctx context.Context, id int64) (*domain.Page, error) {
	return s.pages.GetByID(ctx, id)
}

func (s *PageService) GetPublishedBySlug(ctx context.Context, slug string) (*domain.Page, error) {
	return s.pages.GetPublishedBySlug(ctx, slug)
}

// ResolvePath is the public website's hierarchical read — a full URL path
// ("legal/privacy-policy") is resolved segment by segment against the
// parent/slug tree (built once via ListPathNodes, since the whole tree is
// needed regardless of depth), then the leaf id's own publish status is
// checked. An unpublished ancestor doesn't block a published descendant —
// the hierarchy is a URL-structuring relationship, not a visibility
// cascade — so intermediate segments only need to match by slug/parent, not
// pass EffectivelyPublishedSQL themselves.
func (s *PageService) ResolvePath(ctx context.Context, path string) (*domain.Page, error) {
	segments := splitPath(path)
	if len(segments) == 0 {
		return nil, repository.ErrNotFound
	}

	nodes, err := s.pages.ListPathNodes(ctx)
	if err != nil {
		return nil, err
	}
	childrenByParentKey := make(map[int64][]repository.PathNode)
	for _, n := range nodes {
		childrenByParentKey[parentKey(n.ParentID)] = append(childrenByParentKey[parentKey(n.ParentID)], n)
	}

	var currentParentKey int64 = 0
	var leafID int64
	for _, segment := range segments {
		found := false
		for _, n := range childrenByParentKey[currentParentKey] {
			if n.Slug == segment {
				leafID = n.ID
				currentParentKey = n.ID
				found = true
				break
			}
		}
		if !found {
			return nil, repository.ErrNotFound
		}
	}

	return s.pages.GetPublishedByID(ctx, leafID)
}

// PathsByID computes every page's full URL path (its own slug preceded by
// every ancestor's, root-first) in one pass over the whole tree — used by
// the admin Pages list so each row can show where it actually lives, and by
// the parent picker to label options unambiguously (two pages can share a
// slug under different parents, so the slug alone isn't enough).
func (s *PageService) PathsByID(ctx context.Context) (map[int64]string, error) {
	nodes, err := s.pages.ListPathNodes(ctx)
	if err != nil {
		return nil, err
	}
	byID := make(map[int64]repository.PathNode, len(nodes))
	for _, n := range nodes {
		byID[n.ID] = n
	}

	paths := make(map[int64]string, len(nodes))
	var resolve func(id int64, seen map[int64]bool) string
	resolve = func(id int64, seen map[int64]bool) string {
		if p, ok := paths[id]; ok {
			return p
		}
		n, ok := byID[id]
		if !ok || seen[id] {
			return "" // orphaned reference or a cycle that write-time validation should have prevented
		}
		seen[id] = true
		if n.ParentID == nil {
			paths[id] = n.Slug
		} else {
			parentPath := resolve(*n.ParentID, seen)
			if parentPath == "" {
				paths[id] = n.Slug
			} else {
				paths[id] = parentPath + "/" + n.Slug
			}
		}
		return paths[id]
	}
	for _, n := range nodes {
		resolve(n.ID, map[int64]bool{})
	}
	return paths, nil
}

func splitPath(path string) []string {
	var segments []string
	for _, s := range strings.Split(path, "/") {
		if s != "" {
			segments = append(segments, s)
		}
	}
	return segments
}

func parentKey(id *int64) int64 {
	if id == nil {
		return 0
	}
	return *id
}

func (s *PageService) Sections(ctx context.Context, pageID int64) ([]domain.PageSection, error) {
	return s.pages.GetSectionsWithFields(ctx, pageID)
}

type PageInput struct {
	ParentID        *int64
	Slug            string
	Title           string
	MetaTitle       string
	MetaDescription string
}

func (s *PageService) Create(ctx context.Context, in PageInput) (*domain.Page, error) {
	exists, err := s.pages.ExistsSlugUnderParent(ctx, in.Slug, in.ParentID, 0)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrAlreadyExists
	}
	if in.ParentID != nil {
		if _, err := s.pages.GetByID(ctx, *in.ParentID); err != nil {
			return nil, err
		}
	}
	id, err := s.pages.Create(ctx, &domain.Page{
		ParentID: in.ParentID, Slug: in.Slug, Title: in.Title, MetaTitle: in.MetaTitle, MetaDescription: in.MetaDescription,
		Status: domain.ContentStatusDraft,
	})
	if err != nil {
		return nil, err
	}
	return s.pages.GetByID(ctx, id)
}

// Update is the "Page Details" tab's save — title + slug + parent. The
// Homepage must stay slug "home" with no parent (the public site's / route
// looks it up by that exact slug, at the root) — enforced here, not just
// client-side, since this is a contentStaff-reachable endpoint. A parent
// change is also checked against the page's own subtree: setting a page's
// parent to itself or to one of its descendants would create a cycle that
// PathsByID/ResolvePath can't walk out of.
func (s *PageService) Update(ctx context.Context, id int64, in PageInput) error {
	current, err := s.pages.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if current.Slug == "home" && (in.Slug != "home" || in.ParentID != nil) {
		return ErrHomeSlugLocked
	}
	exists, err := s.pages.ExistsSlugUnderParent(ctx, in.Slug, in.ParentID, id)
	if err != nil {
		return err
	}
	if exists {
		return ErrAlreadyExists
	}
	if in.ParentID != nil {
		if *in.ParentID == id {
			return ErrInvalidParent
		}
		if _, err := s.pages.GetByID(ctx, *in.ParentID); err != nil {
			return err
		}
		isDescendant, err := s.isDescendant(ctx, id, *in.ParentID)
		if err != nil {
			return err
		}
		if isDescendant {
			return ErrInvalidParent
		}
	}
	return s.pages.UpdateDetails(ctx, id, in.Title, in.Slug, in.ParentID)
}

// isDescendant reports whether `candidateID` is anywhere in `ancestorID`'s
// subtree, by walking candidateID's own parent chain back up looking for
// ancestorID - cheaper than computing the full subtree when only one
// candidate needs checking.
func (s *PageService) isDescendant(ctx context.Context, ancestorID, candidateID int64) (bool, error) {
	nodes, err := s.pages.ListPathNodes(ctx)
	if err != nil {
		return false, err
	}
	byID := make(map[int64]repository.PathNode, len(nodes))
	for _, n := range nodes {
		byID[n.ID] = n
	}
	seen := map[int64]bool{}
	current := candidateID
	for {
		n, ok := byID[current]
		if !ok || n.ParentID == nil || seen[current] {
			return false, nil
		}
		seen[current] = true
		if *n.ParentID == ancestorID {
			return true, nil
		}
		current = *n.ParentID
	}
}

type SEOInput struct {
	MetaTitle       string
	MetaDescription string
}

func (s *PageService) UpdateSEO(ctx context.Context, id int64, in SEOInput) error {
	return s.pages.UpdateSEO(ctx, id, in.MetaTitle, in.MetaDescription)
}

type SnippetsInput struct {
	HeadSnippet   string
	BodySnippet   string
	FooterSnippet string
}

func (s *PageService) UpdateSnippets(ctx context.Context, id int64, in SnippetsInput) error {
	return s.pages.UpdateSnippets(ctx, id, in.HeadSnippet, in.BodySnippet, in.FooterSnippet)
}

func (s *PageService) SetStatus(ctx context.Context, id int64, status domain.ContentStatus, publishAt *time.Time) error {
	if !status.Valid() {
		return ErrInvalidContentStatus
	}
	if status == domain.ContentStatusScheduled && publishAt == nil {
		return ErrPublishAtRequired
	}
	var publishAtStr *string
	if publishAt != nil {
		v := publishAt.UTC().Format("2006-01-02 15:04:05")
		publishAtStr = &v
	}
	return s.pages.SetStatus(ctx, id, status, publishAtStr)
}

func (s *PageService) Delete(ctx context.Context, id int64) error {
	return s.pages.Delete(ctx, id)
}

// ReplaceSections validates the whole submitted block tree before writing
// anything — an unknown field_type/empty block_type fails the entire save
// rather than silently persisting a section the frontend won't know how to
// render.
func (s *PageService) ReplaceSections(ctx context.Context, pageID int64, sections []domain.PageSection) error {
	for i := range sections {
		if !isKnownBlockType(sections[i].BlockType) {
			return ErrInvalidBlockType
		}
		for j := range sections[i].Fields {
			if !isKnownFieldType(sections[i].Fields[j].FieldType) {
				return ErrInvalidFieldType
			}
		}
	}
	return s.pages.ReplaceSections(ctx, pageID, sections)
}

func isKnownBlockType(t string) bool {
	for _, known := range domain.KnownBlockTypes {
		if t == known {
			return true
		}
	}
	return false
}

func isKnownFieldType(t string) bool {
	switch t {
	case "text", "richtext", "image", "button":
		return true
	default:
		return false
	}
}

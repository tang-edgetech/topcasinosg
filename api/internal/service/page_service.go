package service

import (
	"context"
	"fmt"
	"sort"
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
	sortOrder, err := s.pages.NextSortOrder(ctx, in.ParentID)
	if err != nil {
		return nil, err
	}
	id, err := s.pages.Create(ctx, &domain.Page{
		ParentID: in.ParentID, SortOrder: sortOrder, Slug: in.Slug, Title: in.Title,
		MetaTitle: in.MetaTitle, MetaDescription: in.MetaDescription,
		Status: domain.ContentStatusDraft,
	})
	if err != nil {
		return nil, err
	}
	return s.pages.GetByID(ctx, id)
}

// Reorder persists a drag-and-drop reorder of one parent's children (nil
// parentID means the root level) - the admin always sends the FULL sibling
// order, not a moved-item/target-index pair, same "replace the whole
// ordered list" contract ReplaceSections already uses for page_sections.
func (s *PageService) Reorder(ctx context.Context, parentID *int64, orderedIDs []int64) error {
	return s.pages.Reorder(ctx, parentID, orderedIDs)
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
// render. Pages and global sections keep the saved version as a revision
// (savedBy and source say who saved it and how); templates don't.
func (s *PageService) ReplaceSections(ctx context.Context, pageID int64, sections []domain.PageSection, savedBy *int64, source string) error {
	page, err := s.pages.GetByID(ctx, pageID)
	if err != nil {
		return err
	}
	if err := checkSections(page.Kind, sections); err != nil {
		return err
	}
	var revision *domain.PageRevision
	if page.Kind != domain.PageKindTemplate {
		revision = &domain.PageRevision{SavedByID: savedBy, Source: source}
	}
	return s.pages.ReplaceSections(ctx, pageID, sections, revision)
}

// checkSections is every rule a save of sections into a page of this kind
// must pass.
func checkSections(kind string, sections []domain.PageSection) error {
	if err := validateSections(sections); err != nil {
		return err
	}
	if kind == domain.PageKindGlobal && hasGlobalSectionBlock(sections) {
		return ErrNestedGlobal
	}
	// Templates may hold a single component: it is inserted into a Container.
	if kind != domain.PageKindTemplate {
		if err := validateHierarchy(sections); err != nil {
			return err
		}
	}
	return nil
}

// Revisions lists a page's saved versions, newest first.
func (s *PageService) Revisions(ctx context.Context, pageID int64) ([]domain.PageRevision, error) {
	if _, err := s.pages.GetByID(ctx, pageID); err != nil {
		return nil, err
	}
	return s.pages.ListRevisions(ctx, pageID)
}

func hasGlobalSectionBlock(sections []domain.PageSection) bool {
	for _, section := range sections {
		if section.BlockType == domain.BlockTypeGlobalSection {
			return true
		}
	}
	return false
}

func (s *PageService) ListGlobals(ctx context.Context) ([]domain.GlobalSection, error) {
	return s.pages.ListGlobals(ctx)
}

// CreateGlobal stores a new global section as a published page of kind
// global. Its slug starts with "_", which normal page slugs can't, so it
// never collides with a real URL; it is hidden from page lists and paths.
func (s *PageService) CreateGlobal(ctx context.Context, name string, sections []domain.PageSection) (*domain.GlobalSection, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, ErrGlobalNameRequired
	}
	if hasGlobalSectionBlock(sections) {
		return nil, ErrNestedGlobal
	}
	if err := validateSections(sections); err != nil {
		return nil, err
	}
	if err := validateHierarchy(sections); err != nil {
		return nil, err
	}
	id, err := s.pages.Create(ctx, &domain.Page{
		Kind:   domain.PageKindGlobal,
		Slug:   fmt.Sprintf("_global-%d", time.Now().UnixNano()),
		Title:  name,
		Status: domain.ContentStatusPublished,
	})
	if err != nil {
		return nil, err
	}
	if len(sections) > 0 {
		if err := s.ReplaceSections(ctx, id, sections, nil, domain.PageRevisionEditor); err != nil {
			_ = s.pages.Delete(ctx, id)
			return nil, err
		}
	}
	return s.pages.GetGlobal(ctx, id)
}

func (s *PageService) RenameGlobal(ctx context.Context, id int64, name string) error {
	name = strings.TrimSpace(name)
	if name == "" {
		return ErrGlobalNameRequired
	}
	return s.pages.RenameGlobal(ctx, id, name)
}

// DeleteGlobal refuses while any page still places the global section, so
// deleting never leaves a hole in a live page.
func (s *PageService) DeleteGlobal(ctx context.Context, id int64) error {
	global, err := s.pages.GetGlobal(ctx, id)
	if err != nil {
		return err
	}
	if global.UsageCount > 0 {
		return ErrGlobalInUse
	}
	return s.pages.Delete(ctx, id)
}

// GetGlobal is one global section, with how many pages place it.
func (s *PageService) GetGlobal(ctx context.Context, id int64) (*domain.GlobalSection, error) {
	return s.pages.GetGlobal(ctx, id)
}

// GlobalUsedOn lists the ids of the pages that place a global section.
func (s *PageService) GlobalUsedOn(ctx context.Context, id int64) ([]int64, error) {
	return s.pages.GlobalUsedOn(ctx, id)
}

func (s *PageService) GlobalSections(ctx context.Context, id int64) ([]domain.PageSection, error) {
	if _, err := s.pages.GetGlobal(ctx, id); err != nil {
		return nil, err
	}
	return s.pages.GetSectionsWithFields(ctx, id)
}

// sectionDepth is a section's level; one stored before levels existed
// only says InContainer (level 1).
func sectionDepth(section domain.PageSection) int {
	if section.Depth <= 0 && section.InContainer {
		return 1
	}
	return section.Depth
}

// validateContainers checks, in display order, that every section above
// level 0 belongs to a Container exactly one level up (the nearest one
// before it), that no section is deeper than domain.MaxSectionDepth, and
// that a Container leaves room for components inside it.
func validateContainers(sections []domain.PageSection) error {
	ordered := make([]domain.PageSection, len(sections))
	copy(ordered, sections)
	sort.SliceStable(ordered, func(i, j int) bool { return ordered[i].SortOrder < ordered[j].SortOrder })
	var open []int // levels of the Containers the current section can be inside
	for _, section := range ordered {
		depth := sectionDepth(section)
		if depth < 0 || depth > domain.MaxSectionDepth {
			return ErrInvalidContainer
		}
		for len(open) > 0 && open[len(open)-1] >= depth {
			open = open[:len(open)-1]
		}
		if depth > 0 && (len(open) == 0 || open[len(open)-1] != depth-1) {
			return ErrInvalidContainer
		}
		if section.BlockType == domain.BlockTypeContainer {
			if depth >= domain.MaxSectionDepth {
				return ErrInvalidContainer
			}
			open = append(open, depth)
		}
	}
	return nil
}

// validateHierarchy enforces level 0 (directly on the page): only
// Containers, which render as <section>, and Global Sections, which bring
// their own Containers. Every other component is inside a Container, at
// level 1 or deeper, and renders as <div>. See domain.PageSection.
func validateHierarchy(sections []domain.PageSection) error {
	for _, section := range sections {
		if sectionDepth(section) > 0 {
			continue
		}
		if section.BlockType != domain.BlockTypeContainer && section.BlockType != domain.BlockTypeGlobalSection {
			return fmt.Errorf("%w (found %q)", ErrComponentOutsideContainer, section.BlockType)
		}
	}
	return nil
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

// FieldCatalog lists the fields each block type uses on stored pages.
func (s *PageService) FieldCatalog(ctx context.Context) ([]repository.FieldUsage, error) {
	return s.pages.FieldCatalog(ctx)
}

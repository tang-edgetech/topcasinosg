package handler

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/httpx"
	"github.com/tang-edgetech/topcasinosg/api/internal/middleware"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

// ContentAPIHandler serves the Content API (/api/v1), used by outside
// tools such as an AI assistant with an API key, plus the admin screens
// that manage those keys and review what they propose (AI Changes).
type ContentAPIHandler struct {
	keys     *service.APIKeyService
	changes  *service.ContentChangeService
	pages    *service.PageService
	news     *service.NewsArticleService
	media    *service.MediaService
	settings *service.SiteSettingsService
	audit    *service.AuditService
}

func NewContentAPIHandler(
	keys *service.APIKeyService, changes *service.ContentChangeService, pages *service.PageService,
	news *service.NewsArticleService, media *service.MediaService, settings *service.SiteSettingsService, audit *service.AuditService,
) *ContentAPIHandler {
	return &ContentAPIHandler{keys: keys, changes: changes, pages: pages, news: news, media: media, settings: settings, audit: audit}
}

// --- DTOs ---

type APIKeyDTO struct {
	ID            int64      `json:"id"`
	Name          string     `json:"name"`
	Prefix        string     `json:"prefix"`
	Mode          string     `json:"mode"`
	Scopes        []string   `json:"scopes"`
	CreatedByName string     `json:"createdByName"`
	CreatedAt     time.Time  `json:"createdAt"`
	LastUsedAt    *time.Time `json:"lastUsedAt"`
	RevokedAt     *time.Time `json:"revokedAt"`
}

func toAPIKeyDTO(k *domain.APIKey) APIKeyDTO {
	scopes := k.Scopes
	if scopes == nil {
		scopes = []string{}
	}
	return APIKeyDTO{
		ID: k.ID, Name: k.Name, Prefix: k.Prefix, Mode: k.Mode, Scopes: scopes, CreatedByName: k.CreatedByName,
		CreatedAt: k.CreatedAt, LastUsedAt: k.LastUsedAt, RevokedAt: k.RevokedAt,
	}
}

type ContentChangeDTO struct {
	ID             int64           `json:"id"`
	ContentType    string          `json:"contentType"`
	Action         string          `json:"action"`
	TargetID       *int64          `json:"targetId"`
	Label          string          `json:"label"`
	Note           string          `json:"note"`
	Status         string          `json:"status"`
	Outdated       bool            `json:"outdated"`
	APIKeyName     string          `json:"apiKeyName"`
	ReviewNote     string          `json:"reviewNote"`
	ReviewedByName string          `json:"reviewedByName"`
	ReviewedAt     *time.Time      `json:"reviewedAt"`
	ResultID       *int64          `json:"resultId"`
	CreatedAt      time.Time       `json:"createdAt"`
	Change         json.RawMessage `json:"change"`
}

func toContentChangeDTO(c *domain.ContentChange) ContentChangeDTO {
	return ContentChangeDTO{
		ID: c.ID, ContentType: c.ContentType, Action: c.Action, TargetID: c.TargetID, Label: c.Label, Note: c.Note,
		Status: c.Status, Outdated: c.Outdated, APIKeyName: c.APIKeyName, ReviewNote: c.ReviewNote,
		ReviewedByName: c.ReviewedByName, ReviewedAt: c.ReviewedAt, ResultID: c.ResultID, CreatedAt: c.CreatedAt,
		Change: json.RawMessage(c.Payload),
	}
}

type contentPageDTO struct {
	ID              int64     `json:"id"`
	ParentID        *int64    `json:"parentId"`
	Path            string    `json:"path"`
	Title           string    `json:"title"`
	MetaTitle       string    `json:"metaTitle"`
	MetaDescription string    `json:"metaDescription"`
	Status          string    `json:"status"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

func toContentPageDTO(p *domain.Page, paths map[int64]string) contentPageDTO {
	return contentPageDTO{
		ID: p.ID, ParentID: p.ParentID, Path: "/" + paths[p.ID], Title: p.Title, MetaTitle: p.MetaTitle,
		MetaDescription: p.MetaDescription, Status: string(p.Status), UpdatedAt: p.UpdatedAt,
	}
}

type contentNewsDTO struct {
	ID           int64     `json:"id"`
	Title        string    `json:"title"`
	Slug         string    `json:"slug"`
	Excerpt      string    `json:"excerpt"`
	Content      string    `json:"content,omitempty"`
	CoverMediaID *int64    `json:"coverMediaId"`
	CoverURL     *string   `json:"coverUrl"`
	Status       string    `json:"status"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

func toContentNewsDTO(n *domain.NewsArticle, withContent bool) contentNewsDTO {
	dto := contentNewsDTO{
		ID: n.ID, Title: n.Title, Slug: n.Slug, Excerpt: n.Excerpt, CoverMediaID: n.CoverMediaID, CoverURL: n.CoverURL,
		Status: string(n.Status), UpdatedAt: n.UpdatedAt,
	}
	if withContent {
		dto.Content = n.Content
	}
	return dto
}

func contentChangeErrorStatus(err error) int {
	switch {
	case errors.Is(err, repository.ErrNotFound):
		return http.StatusNotFound
	case errors.Is(err, service.ErrInvalidChange), errors.Is(err, service.ErrAPIKeyNameRequired), errors.Is(err, service.ErrInvalidAPIScopes), errors.Is(err, service.ErrInvalidAPIKeyMode):
		return http.StatusBadRequest
	case errors.Is(err, service.ErrChangeNotPending), errors.Is(err, service.ErrChangeOutdated), errors.Is(err, service.ErrAlreadyExists):
		return http.StatusConflict
	}
	if status := pageErrorStatus(err); status != http.StatusInternalServerError {
		return status
	}
	return http.StatusInternalServerError
}

func contentChangeError(w http.ResponseWriter, err error, notFound string) {
	status := contentChangeErrorStatus(err)
	switch status {
	case http.StatusNotFound:
		response.Err(w, status, notFound)
	case http.StatusInternalServerError:
		response.Err(w, status, "something went wrong on the server; try again")
	default:
		response.Err(w, status, err.Error())
	}
}

func requestID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id < 1 {
		response.Err(w, http.StatusBadRequest, "invalid id in the URL")
		return 0, false
	}
	return id, true
}

// previewURL turns a preview token into a link on the public site.
func (h *ContentAPIHandler) previewURL(ctx context.Context, token string) string {
	if token == "" {
		return ""
	}
	base := ""
	if settings, err := h.settings.Get(ctx); err == nil {
		base = strings.TrimRight(settings.SiteURL, "/")
	}
	return base + "/preview/" + token
}

// --- Content API (/api/v1), API key ---

// Me describes the key in use.
func (h *ContentAPIHandler) Me(w http.ResponseWriter, r *http.Request) {
	key := middleware.APIKeyFromContext(r.Context())
	owner := middleware.UserFromContext(r.Context())
	response.JSON(w, http.StatusOK, map[string]any{
		"name": key.Name, "mode": key.Mode, "scopes": key.Scopes, "actingFor": owner.FullName,
		"requestsPerMinute": middleware.APIKeyRequestsPerMinute, "whatThisKeyCanDo": keyAbilities(key),
	})
}

type schemaFieldDTO struct {
	Key        string `json:"key"`
	Type       string `json:"type"`
	Repeatable bool   `json:"repeatable"`
	UsedIn     int    `json:"usedInSections"`
	Example    string `json:"example,omitempty"`
}

type schemaBlockDTO struct {
	Type   string           `json:"type"`
	Fields []schemaFieldDTO `json:"fields"`
}

// Schema explains how page content is built: the rules, the field types,
// and each block type's fields as they're used on the site today.
func (h *ContentAPIHandler) Schema(w http.ResponseWriter, r *http.Request) {
	catalog, err := h.pages.FieldCatalog(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load the schema")
		return
	}
	fields := map[string][]schemaFieldDTO{}
	for _, u := range catalog {
		fields[u.BlockType] = append(fields[u.BlockType], schemaFieldDTO{
			Key: u.FieldKey, Type: u.FieldType, Repeatable: u.Repeatable, UsedIn: u.Sections, Example: u.Example,
		})
	}
	blocks := make([]schemaBlockDTO, 0, len(domain.KnownBlockTypes))
	for _, t := range domain.KnownBlockTypes {
		f := fields[t]
		if f == nil {
			f = []schemaFieldDTO{}
		}
		blocks = append(blocks, schemaBlockDTO{Type: t, Fields: f})
	}
	response.JSON(w, http.StatusOK, map[string]any{
		"rules": []string{
			"A page is an ordered list of sections. The order of the list is the order on the page.",
			"Level 0 (inContainer: false) may only hold a \"container\" or a \"global_section\".",
			"Every other block type is a component: it must come after a container and have inContainer: true. It belongs to the nearest container before it.",
			"A container can't be inside another container.",
			"Each section has fields. A field's itemIndex groups repeated items (0 for the section's own fields; 0, 1, 2... for each item of a list such as FAQ questions).",
			"Easiest way to edit a page: GET /api/v1/pages/{id}, change the text in the fields you need, and send the whole sections list back to POST /api/v1/pages/{id}/changes.",
			"Images use mediaId (an id from GET /api/v1/media, or one you upload with POST /api/v1/media).",
			approvalRule(middleware.APIKeyFromContext(r.Context())),
		},
		"endpoints": keyEndpoints(middleware.APIKeyFromContext(r.Context())),
		"fieldTypes": map[string]string{
			"text":     "Plain text in textValue.",
			"richtext": "HTML in textValue (paragraphs, headings, lists, links, bold/italic). Scripts and styles are removed.",
			"image":    "An image: mediaId from the Media Library.",
			"button":   "A link: the label in textValue and the URL in urlValue.",
		},
		"blockTypes": blocks,
	})
}

func (h *ContentAPIHandler) ListPages(w http.ResponseWriter, r *http.Request) {
	pages, err := h.pages.List(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load pages")
		return
	}
	paths, err := h.pages.PathsByID(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load pages")
		return
	}
	dtos := make([]contentPageDTO, len(pages))
	for i := range pages {
		dtos[i] = toContentPageDTO(&pages[i], paths)
	}
	response.JSON(w, http.StatusOK, map[string]any{"pages": dtos})
}

func (h *ContentAPIHandler) GetPage(w http.ResponseWriter, r *http.Request) {
	id, ok := requestID(w, r)
	if !ok {
		return
	}
	page, err := h.pages.GetByID(r.Context(), id)
	if err != nil || page.Kind != domain.PageKindPage {
		response.Err(w, http.StatusNotFound, "page not found")
		return
	}
	sections, err := h.pages.Sections(r.Context(), id)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load the page")
		return
	}
	paths, err := h.pages.PathsByID(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load the page")
		return
	}
	inputs := service.SectionInputs(sections)
	if inputs == nil {
		inputs = []service.SectionInput{}
	}
	response.JSON(w, http.StatusOK, map[string]any{"page": toContentPageDTO(page, paths), "sections": inputs})
}

func (h *ContentAPIHandler) ListGlobalSections(w http.ResponseWriter, r *http.Request) {
	globals, err := h.pages.ListGlobals(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load global sections")
		return
	}
	type globalDTO struct {
		ID   int64  `json:"id"`
		Name string `json:"name"`
	}
	dtos := make([]globalDTO, len(globals))
	for i, g := range globals {
		dtos[i] = globalDTO{ID: g.ID, Name: g.Name}
	}
	response.JSON(w, http.StatusOK, map[string]any{"globalSections": dtos})
}

func (h *ContentAPIHandler) ListNews(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	items, total, err := h.news.ListAdmin(r.Context(), page, pageSize)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load news")
		return
	}
	dtos := make([]contentNewsDTO, len(items))
	for i := range items {
		dtos[i] = toContentNewsDTO(&items[i], false)
	}
	response.JSON(w, http.StatusOK, map[string]any{"news": dtos, "total": total})
}

func (h *ContentAPIHandler) GetNews(w http.ResponseWriter, r *http.Request) {
	id, ok := requestID(w, r)
	if !ok {
		return
	}
	article, err := h.news.Get(r.Context(), id)
	if err != nil {
		contentChangeError(w, err, "article not found")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"article": toContentNewsDTO(article, true)})
}

func (h *ContentAPIHandler) ListMedia(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	items, total, err := h.media.List(r.Context(), nil, page, pageSize)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load media")
		return
	}
	dtos := make([]MediaDTO, len(items))
	for i := range items {
		dtos[i] = toMediaDTO(&items[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"media": dtos, "total": total})
}

// UploadMedia adds a file to the Media Library (multipart field "file"),
// the same as an admin upload.
func (h *ContentAPIHandler) UploadMedia(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxRequestBytes)
	if err := r.ParseMultipartForm(maxUploadMemory); err != nil {
		response.Err(w, http.StatusBadRequest, "file too large or invalid form")
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		response.Err(w, http.StatusBadRequest, "missing file field \"file\"")
		return
	}
	defer file.Close()
	media, err := h.media.Upload(r.Context(), middleware.UserFromContext(r.Context()), header.Filename, header.Size, file)
	if err != nil {
		response.Err(w, mediaErrorStatus(err), err.Error())
		return
	}
	h.recordKeyAction(r, domain.AuditActionCreate, "media", &media.ID, media.OriginalFilename, http.StatusCreated)
	response.JSON(w, http.StatusCreated, map[string]any{"media": toMediaDTO(media)})
}

type pageProposalRequest struct {
	Note   string `json:"note"`
	DryRun bool   `json:"dryRun"`
	service.PageChange
}

type newsProposalRequest struct {
	Note   string `json:"note"`
	DryRun bool   `json:"dryRun"`
	service.NewsChange
}

func isDryRun(r *http.Request, body bool) bool {
	v := r.URL.Query().Get("dryRun")
	return body || v == "1" || v == "true"
}

// ProposePage: POST /api/v1/pages (a new page) and POST
// /api/v1/pages/{id}/changes (an update).
func (h *ContentAPIHandler) ProposePage(w http.ResponseWriter, r *http.Request) {
	var target *int64
	if r.PathValue("id") != "" {
		id, ok := requestID(w, r)
		if !ok {
			return
		}
		target = &id
	}
	var req pageProposalRequest
	if err := decodeStrict(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, err.Error())
		return
	}
	p := service.Proposal{Key: middleware.APIKeyFromContext(r.Context()), TargetID: target, Note: req.Note, DryRun: isDryRun(r, req.DryRun)}
	change, err := h.changes.ProposePage(r.Context(), p, req.PageChange)
	h.respondProposal(w, r, change, err, p.DryRun, "page not found")
}

// ProposeNews: POST /api/v1/news (a new article) and POST
// /api/v1/news/{id}/changes (an update).
func (h *ContentAPIHandler) ProposeNews(w http.ResponseWriter, r *http.Request) {
	var target *int64
	if r.PathValue("id") != "" {
		id, ok := requestID(w, r)
		if !ok {
			return
		}
		target = &id
	}
	var req newsProposalRequest
	if err := decodeStrict(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, err.Error())
		return
	}
	p := service.Proposal{Key: middleware.APIKeyFromContext(r.Context()), TargetID: target, Note: req.Note, DryRun: isDryRun(r, req.DryRun)}
	change, err := h.changes.ProposeNews(r.Context(), p, req.NewsChange)
	h.respondProposal(w, r, change, err, p.DryRun, "article not found")
}

// decodeStrict reads a JSON body and names any field the API doesn't know,
// so a typo doesn't silently drop a change.
func decodeStrict(r *http.Request, v any) error {
	dec := json.NewDecoder(http.MaxBytesReader(nil, r.Body, 5<<20))
	dec.DisallowUnknownFields()
	if err := dec.Decode(v); err != nil {
		return fmt.Errorf("the request body is not valid JSON for this endpoint: %s", strings.TrimPrefix(err.Error(), "json: "))
	}
	return nil
}

func (h *ContentAPIHandler) respondProposal(w http.ResponseWriter, r *http.Request, change *domain.ContentChange, err error, dryRun bool, notFound string) {
	if err != nil {
		contentChangeError(w, err, notFound)
		return
	}
	if dryRun {
		response.JSON(w, http.StatusOK, map[string]any{
			"valid": true, "message": "This change is valid. Send it again without dryRun to submit it for approval.",
			"warnings": warningsOf(change),
		})
		return
	}
	h.recordKeyAction(r, domain.AuditActionCreate, "content-changes", &change.ID, change.Label, http.StatusCreated)
	if key := middleware.APIKeyFromContext(r.Context()); key.IsDirect() {
		// A Direct key's change is applied at once, recorded in AI Changes
		// as approved by the key's admin.
		applied, err := h.changes.Approve(r.Context(), change.ID, middleware.UserFromContext(r.Context()), "Applied at once (Direct API key: "+key.Name+")", true)
		if err != nil {
			contentChangeError(w, err, notFound)
			return
		}
		message := "Done. The change is live."
		if applied.Action == domain.ContentChangeCreate {
			message = fmt.Sprintf("Done. It was created as a draft (id %d); to put it on the site, PUT /api/v1/%s/%d/status with {\"status\": \"published\"}.", derefID(applied.ResultID), pluralType(applied.ContentType), derefID(applied.ResultID))
		}
		response.JSON(w, http.StatusCreated, map[string]any{
			"change": toContentChangeDTO(applied), "message": message, "warnings": warningsOf(change),
		})
		return
	}
	token, _ := h.changes.PreviewToken(r.Context(), change)
	response.JSON(w, http.StatusCreated, map[string]any{
		"change":     toContentChangeDTO(change),
		"previewUrl": h.previewURL(r.Context(), token),
		"message":    "Submitted. It goes live only after an admin approves it in the dashboard (AI Changes).",
		"warnings":   warningsOf(change),
	})
}

func derefID(id *int64) int64 {
	if id == nil {
		return 0
	}
	return *id
}

// pluralType: the /api/v1 area of a change's content type.
func pluralType(contentType string) string {
	if contentType == domain.ContentChangePage {
		return "pages"
	}
	return contentType
}

func approvalRule(key *domain.APIKey) string {
	if key.IsDirect() {
		return "This is a Direct key: page and news changes sent to POST /api/v1/pages/{id}/changes or /api/v1/news/{id}/changes go live at once (new ones are created as drafts)."
	}
	return "Nothing you send goes live by itself: every change waits for an admin to approve it."
}

// keyEndpoints lists the endpoints a key can use. A Direct key uses the
// admin endpoints of each area it has (see server/direct_api.go).
func keyEndpoints(key *domain.APIKey) []string {
	list := []string{
		"GET /api/v1/me - this key, its mode and areas",
		"GET /api/v1/changes - changes this key has sent (and whether they were approved)",
	}
	if key.HasScope(domain.APIScopePages) {
		list = append(list,
			"GET /api/v1/pages - every page with its id, path and status",
			"GET /api/v1/pages/{id} - one page with all its sections",
			"POST /api/v1/pages - a new page {title, slug, parentId, metaTitle, metaDescription, sections}",
			"POST /api/v1/pages/{id}/changes - change a page: send the whole sections list back, edited",
			"GET /api/v1/global-sections - reusable sections a page can include")
	}
	if key.HasScope(domain.APIScopeNews) {
		list = append(list,
			"GET /api/v1/news, GET /api/v1/news/{id} - news articles",
			"POST /api/v1/news - a new article {title, slug, excerpt, content, coverMediaId}",
			"POST /api/v1/news/{id}/changes - change an article")
	}
	if key.HasScope(domain.APIScopeMedia) {
		list = append(list, "GET /api/v1/media - the Media Library", "POST /api/v1/media - upload an image (multipart form, field \"file\")")
	}
	if !key.IsDirect() {
		return list
	}
	areas := map[string]string{
		domain.APIScopePages:          "pages (also PUT /api/v1/pages/{id} for title/slug/parent, PUT /api/v1/pages/{id}/seo), global-sections, section-templates",
		domain.APIScopeNews:           "news (also PUT /api/v1/news/{id})",
		domain.APIScopeMedia:          "media (PUT /api/v1/media/{id} for alt text and title)",
		domain.APIScopeCasinos:        "casinos, game-providers, licenses",
		domain.APIScopeBonuses:        "bonuses",
		domain.APIScopePaymentMethods: "payment-methods",
		domain.APIScopeRTP:            "rtp",
		domain.APIScopeGuides:         "guides",
		domain.APIScopeBlacklist:      "blacklist",
		domain.APIScopeRegions:        "regions (PUT /api/v1/regions/{id}/active {active} instead of delete)",
		domain.APIScopeNavigation:     "menu-items (header and footer menus), sidebar (GET, then PUT the whole sidebar back)",
		domain.APIScopeSnippets:       "snippets (PUT /api/v1/snippets/{id}/active {active}), pages/{id}/snippets",
		domain.APIScopeSettings:       "settings/site and settings/footer (GET, then PUT them back changed)",
	}
	list = append(list,
		"Direct key - for each area below: GET /api/v1/{area} lists, GET /api/v1/{area}/{id} reads one, POST /api/v1/{area} creates, PUT /api/v1/{area}/{id} updates (send the same fields GET returns), PUT /api/v1/{area}/{id}/status {\"status\": \"draft\" | \"published\" | \"scheduled\", \"publishAt\"} publishes or unpublishes, DELETE /api/v1/{area}/{id} moves it to the Recycle Bin",
		"SEO: GET/PUT /api/v1/seo/{page|news|casino|bonus|guide}/{id}",
		"GET /api/v1/recycle-bin - what was deleted; POST /api/v1/recycle-bin/{id}/restore - undo a delete",
		"Only pages, news, casinos, bonuses, payment-methods, rtp, guides, blacklist and snippets can be deleted by a key; ask an admin for anything else",
	)
	for _, scope := range key.Scopes {
		if a, ok := areas[scope]; ok {
			list = append(list, "Area: "+a)
		}
	}
	return list
}

// keyAbilities says in plain words what a key can do, for GET /api/v1/me.
func keyAbilities(key *domain.APIKey) []string {
	if !key.IsDirect() {
		return []string{
			"This is a \"Needs approval\" key. Page and news changes you send wait for an admin to approve them in the dashboard (AI Changes).",
			"You can upload images to the Media Library straight away.",
			"You can't publish, unpublish or delete anything.",
		}
	}
	return []string{
		"This is a Direct key. Changes go live straight away, with no approval step.",
		"You can use these areas: " + strings.Join(key.Scopes, ", ") + ".",
		"Deleting moves things to the Recycle Bin for 30 days; restore with POST /api/v1/recycle-bin/{id}/restore.",
		"GET /api/v1/schema explains every endpoint and how page content is built.",
	}
}

func warningsOf(c *domain.ContentChange) []string {
	if c.Warnings == nil {
		return []string{}
	}
	return c.Warnings
}

func (h *ContentAPIHandler) ListOwnChanges(w http.ResponseWriter, r *http.Request) {
	key := middleware.APIKeyFromContext(r.Context())
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	changes, total, err := h.changes.List(r.Context(), repository.ContentChangeFilter{
		Status: r.URL.Query().Get("status"), APIKeyID: &key.ID, Limit: 20, Offset: (page - 1) * 20,
	})
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load changes")
		return
	}
	dtos := make([]ContentChangeDTO, len(changes))
	for i := range changes {
		dtos[i] = toContentChangeDTO(&changes[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"changes": dtos, "total": total})
}

func (h *ContentAPIHandler) GetOwnChange(w http.ResponseWriter, r *http.Request) {
	id, ok := requestID(w, r)
	if !ok {
		return
	}
	key := middleware.APIKeyFromContext(r.Context())
	change, err := h.changes.Get(r.Context(), id)
	if err != nil || change.APIKeyID == nil || *change.APIKeyID != key.ID {
		response.Err(w, http.StatusNotFound, "change not found")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"change": toContentChangeDTO(change)})
}

func (h *ContentAPIHandler) WithdrawOwnChange(w http.ResponseWriter, r *http.Request) {
	id, ok := requestID(w, r)
	if !ok {
		return
	}
	change, err := h.changes.Withdraw(r.Context(), id, middleware.APIKeyFromContext(r.Context()))
	if err != nil {
		contentChangeError(w, err, "change not found")
		return
	}
	h.recordKeyAction(r, "withdraw", "content-changes", &change.ID, change.Label, http.StatusOK)
	response.JSON(w, http.StatusOK, map[string]any{"change": toContentChangeDTO(change)})
}

// recordKeyAction adds a Content API write to the activity log, credited
// to the key's admin and naming the key.
func (h *ContentAPIHandler) recordKeyAction(r *http.Request, action, entityType string, entityID *int64, label string, status int) {
	key := middleware.APIKeyFromContext(r.Context())
	owner := middleware.UserFromContext(r.Context())
	ip, port := middleware.ClientAddress(r)
	ownerID := owner.ID
	h.audit.Record(context.WithoutCancel(r.Context()), &domain.AuditLog{
		ActorID: &ownerID, ActorName: fmt.Sprintf("%s (API key: %s)", owner.FullName, key.Name), ActorRole: string(owner.Role),
		Action: action, EntityType: entityType, EntityID: entityID, EntityLabel: label,
		IPAddress: ip, IPPort: port, UserAgent: r.UserAgent(), RequestMethod: r.Method, RequestPath: r.URL.RequestURI(), StatusCode: status,
	})
}

// --- Admin: API keys (Super Admin and Admin) ---

func (h *ContentAPIHandler) ListKeys(w http.ResponseWriter, r *http.Request) {
	keys, err := h.keys.List(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load API keys")
		return
	}
	dtos := make([]APIKeyDTO, len(keys))
	for i := range keys {
		dtos[i] = toAPIKeyDTO(&keys[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"apiKeys": dtos})
}

type createAPIKeyRequest struct {
	Name   string   `json:"name"`
	Mode   string   `json:"mode"`
	Scopes []string `json:"scopes"`
}

// CreateKey returns the key itself once, as secretKey (a field name the
// activity log always hides).
func (h *ContentAPIHandler) CreateKey(w http.ResponseWriter, r *http.Request) {
	var req createAPIKeyRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	key, secret, err := h.keys.Create(r.Context(), requireActor(r), req.Name, req.Mode, req.Scopes)
	if err != nil {
		contentChangeError(w, err, "not found")
		return
	}
	dto := toAPIKeyDTO(key)
	response.JSON(w, http.StatusCreated, map[string]any{
		"id": dto.ID, "name": dto.Name, "prefix": dto.Prefix, "mode": dto.Mode, "scopes": dto.Scopes, "secretKey": secret,
	})
}

func (h *ContentAPIHandler) RevokeKey(w http.ResponseWriter, r *http.Request) {
	id, ok := requestID(w, r)
	if !ok {
		return
	}
	if err := h.keys.Revoke(r.Context(), id); err != nil {
		contentChangeError(w, err, "API key not found or already revoked")
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"revoked": true})
}

// --- Admin: reviewing changes (content staff) ---

func (h *ContentAPIHandler) ListChanges(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}
	changes, total, err := h.changes.List(r.Context(), repository.ContentChangeFilter{
		Status: r.URL.Query().Get("status"), Limit: pageSize, Offset: (page - 1) * pageSize,
	})
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load changes")
		return
	}
	dtos := make([]ContentChangeDTO, len(changes))
	for i := range changes {
		dtos[i] = toContentChangeDTO(&changes[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"changes": dtos, "total": total})
}

func (h *ContentAPIHandler) CountPending(w http.ResponseWriter, r *http.Request) {
	n, err := h.changes.CountPending(r.Context())
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not count changes")
		return
	}
	response.JSON(w, http.StatusOK, map[string]int{"pending": n})
}

// GetChange returns a change with the content it would replace (current),
// in the same shape as the change, for a side-by-side review.
func (h *ContentAPIHandler) GetChange(w http.ResponseWriter, r *http.Request) {
	id, ok := requestID(w, r)
	if !ok {
		return
	}
	change, err := h.changes.Get(r.Context(), id)
	if err != nil {
		contentChangeError(w, err, "change not found")
		return
	}
	var current any
	if change.TargetID != nil {
		switch change.ContentType {
		case domain.ContentChangePage:
			if page, err := h.pages.GetByID(r.Context(), *change.TargetID); err == nil {
				sections, _ := h.pages.Sections(r.Context(), page.ID)
				current = map[string]any{
					"title": page.Title, "metaTitle": page.MetaTitle, "metaDescription": page.MetaDescription,
					"sections": service.SectionInputs(sections),
				}
			}
		case domain.ContentChangeNews:
			if n, err := h.news.Get(r.Context(), *change.TargetID); err == nil {
				current = map[string]any{
					"title": n.Title, "slug": n.Slug, "excerpt": n.Excerpt, "content": n.Content,
					"coverMediaId": n.CoverMediaID, "coverUrl": n.CoverURL,
				}
			}
		}
	}
	response.JSON(w, http.StatusOK, map[string]any{"change": toContentChangeDTO(change), "current": current})
}

type reviewChangeRequest struct {
	Note  string `json:"note"`
	Force bool   `json:"force"`
}

func (h *ContentAPIHandler) ApproveChange(w http.ResponseWriter, r *http.Request) {
	id, ok := requestID(w, r)
	if !ok {
		return
	}
	var req reviewChangeRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	change, err := h.changes.Approve(r.Context(), id, requireActor(r), req.Note, req.Force)
	if err != nil {
		contentChangeError(w, err, "change not found")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"change": toContentChangeDTO(change)})
}

func (h *ContentAPIHandler) RejectChange(w http.ResponseWriter, r *http.Request) {
	id, ok := requestID(w, r)
	if !ok {
		return
	}
	var req reviewChangeRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	change, err := h.changes.Reject(r.Context(), id, requireActor(r), req.Note)
	if err != nil {
		contentChangeError(w, err, "change not found")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"change": toContentChangeDTO(change)})
}

// PreviewChange stores a page update's proposed sections as a one-hour
// preview on the public site.
func (h *ContentAPIHandler) PreviewChange(w http.ResponseWriter, r *http.Request) {
	id, ok := requestID(w, r)
	if !ok {
		return
	}
	change, err := h.changes.Get(r.Context(), id)
	if err != nil {
		contentChangeError(w, err, "change not found")
		return
	}
	token, err := h.changes.PreviewToken(r.Context(), change)
	if err != nil {
		contentChangeError(w, err, "page not found")
		return
	}
	if token == "" {
		response.Err(w, http.StatusBadRequest, "this change has no page content to preview")
		return
	}
	response.JSON(w, http.StatusOK, map[string]string{"token": token})
}

// --- Admin: page revisions ---

type PageRevisionDTO struct {
	ID          int64            `json:"id"`
	SavedByName string           `json:"savedByName"`
	Source      string           `json:"source"`
	CreatedAt   time.Time        `json:"createdAt"`
	Sections    []PageSectionDTO `json:"sections"`
}

func (h *ContentAPIHandler) PageRevisions(w http.ResponseWriter, r *http.Request) {
	id, ok := requestID(w, r)
	if !ok {
		return
	}
	revisions, err := h.pages.Revisions(r.Context(), id)
	if err != nil {
		contentChangeError(w, err, "page not found")
		return
	}
	dtos := make([]PageRevisionDTO, len(revisions))
	for i, rv := range revisions {
		dtos[i] = PageRevisionDTO{
			ID: rv.ID, SavedByName: rv.SavedByName, Source: rv.Source, CreatedAt: rv.CreatedAt, Sections: toSectionDTOs(rv.Sections),
		}
	}
	response.JSON(w, http.StatusOK, map[string]any{"revisions": dtos})
}

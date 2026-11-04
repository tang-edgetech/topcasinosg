package server

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/handler"
	"github.com/tang-edgetech/topcasinosg/api/internal/middleware"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

// A Direct API key uses the admin endpoints themselves: /api/v1/<path> runs
// /api/admin/<path>, as the key's admin, with the same validation, the same
// activity log and the same JSON. directScope decides which admin routes a
// key may use at all (never users, API keys, account, security settings,
// deployments, exports/imports or AI Changes reviews) and which scope each
// needs. Deleting goes to the Recycle Bin instead (recycleBin below).

// seoScopes: the scope for each SEO entity type (seo/{type}/{id}).
var seoScopes = map[string]string{
	domain.SeoEntityPage: domain.APIScopePages, domain.SeoEntityNews: domain.APIScopeNews, domain.SeoEntityCasino: domain.APIScopeCasinos,
	domain.SeoEntityBonus: domain.APIScopeBonuses, domain.SeoEntityGuide: domain.APIScopeGuides,
}

// areaScopes: the scope for each admin area, by the path's first segment.
var areaScopes = map[string]string{
	"pages": domain.APIScopePages, "global-sections": domain.APIScopePages, "section-templates": domain.APIScopePages,
	"news": domain.APIScopeNews, "media": domain.APIScopeMedia,
	"casinos": domain.APIScopeCasinos, "game-providers": domain.APIScopeCasinos, "licenses": domain.APIScopeCasinos,
	"bonuses": domain.APIScopeBonuses, "payment-methods": domain.APIScopePaymentMethods, "rtp": domain.APIScopeRTP,
	"guides": domain.APIScopeGuides, "blacklist": domain.APIScopeBlacklist, "regions": domain.APIScopeRegions,
	"menu-items": domain.APIScopeNavigation, "sidebar": domain.APIScopeNavigation, "snippets": domain.APIScopeSnippets,
}

// settingsPaths: the Site Settings a key may change (not 2FA or security).
var settingsPaths = map[string]bool{
	"settings/site": true, "settings/footer": true, "settings/theme": true, "settings/site/logo": true, "settings/site/favicon": true,
}

// directScope returns the scope an admin path (without /api/admin/) needs,
// or false when API keys can't use it.
func directScope(path string) (string, bool) {
	segments := strings.Split(path, "/")
	switch {
	case segments[0] == "seo" && len(segments) == 3:
		scope, ok := seoScopes[segments[1]]
		return scope, ok
	case segments[0] == "settings":
		return domain.APIScopeSettings, settingsPaths[path]
	case segments[0] == "pages" && len(segments) == 3 && segments[2] == "snippets":
		return domain.APIScopeSnippets, true
	}
	scope, ok := areaScopes[segments[0]]
	return scope, ok
}

// binTypes: what a key's DELETE moves to the Recycle Bin, by admin area.
// Each has GET and PUT .../status routes ({status, publishAt}), except
// snippets, which have .../active ({active}). Menu items are deleted for
// real when nothing is under them (see directAPI). Anything else (media,
// global sections, providers, licenses...) can't be deleted by a key.
var binTypes = map[string]bool{
	"pages": true, "news": true, "casinos": true, "bonuses": true, "payment-methods": true,
	"rtp": true, "guides": true, "blacklist": true, "snippets": true,
}

func directAPI(mux *http.ServeMux, bin *recycleBin, isGlobal func(context.Context, int64) bool) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		key := middleware.APIKeyFromContext(r.Context())
		path := strings.Trim(strings.TrimPrefix(r.URL.Path, "/api/v1/"), "/")
		scope, ok := directScope(path)
		if !ok || path == "" {
			response.Err(w, http.StatusNotFound, fmt.Sprintf("there is no %s /api/v1/%s, or API keys can't use it; GET /api/v1/schema lists what this key can do", r.Method, path))
			return
		}
		if !key.IsDirect() {
			response.Err(w, http.StatusForbidden, "this is a \"Needs approval\" key: it can only propose page and news changes (POST /api/v1/pages, /api/v1/news) and upload media; an admin can create a Direct key in Settings > API Keys")
			return
		}
		if !key.HasScope(scope) {
			response.Err(w, http.StatusForbidden, "this API key can't use "+scope+"; an admin can create a key that includes it")
			return
		}
		segments := strings.Split(path, "/")
		if r.Method != http.MethodGet && touchesGlobal(r.Context(), segments, isGlobal) && !handler.IsAdminRole(middleware.UserFromContext(r.Context())) {
			response.Err(w, http.StatusForbidden, "only an Admin's API key can change Global Sections: they show on many pages at once")
			return
		}
		if r.Method == http.MethodDelete && segments[0] == "menu-items" && len(segments) == 2 {
			// A menu item is deleted for real (the activity log keeps what it
			// was, so it can be added back), but only one with nothing under
			// it: deleting a parent would take its whole submenu with it.
			id, err := strconv.ParseInt(segments[1], 10, 64)
			if err != nil {
				response.Err(w, http.StatusBadRequest, "invalid menu item id")
				return
			}
			n, err := bin.menuChildren(r.Context(), id)
			if err != nil {
				response.Err(w, http.StatusServiceUnavailable, "could not check what is under this menu item, so it wasn't deleted; try again")
				return
			}
			if n > 0 {
				response.Err(w, http.StatusConflict, fmt.Sprintf("menu item %d has %d item(s) under it: delete or move those first (PUT /api/v1/menu-items/{id} with another parentId)", id, n))
				return
			}
		} else if r.Method == http.MethodDelete {
			id, err := strconv.ParseInt(segments[len(segments)-1], 10, 64)
			if !binTypes[segments[0]] || len(segments) != 2 || err != nil {
				response.Err(w, http.StatusForbidden, "API keys can't delete this; ask an admin to delete it in the dashboard")
				return
			}
			bin.moveToBin(w, r, segments[0], id)
			return
		}
		admin := r.Clone(r.Context())
		admin.URL.Path = "/api/admin/" + path
		admin.URL.RawPath = ""
		admin.RequestURI = admin.URL.RequestURI()
		mux.ServeHTTP(w, admin)
	})
}

// menuChildren counts the menu items directly under a menu item, in both
// menus, from the admin lists as the key's admin sees them. An error means
// it couldn't tell, and the item must not be deleted.
func (b *recycleBin) menuChildren(ctx context.Context, id int64) (int, error) {
	count := 0
	for _, location := range []domain.MenuLocation{domain.MenuLocationHeader, domain.MenuLocationFooter} {
		status, body := b.dispatch(ctx, http.MethodGet, "/api/admin/menu-items?location="+string(location), nil)
		if status != http.StatusOK {
			return 0, fmt.Errorf("menu items (%s): status %d", location, status)
		}
		var list struct {
			Data struct {
				MenuItems []struct {
					ParentID *int64 `json:"parentId"`
				} `json:"menuItems"`
			} `json:"data"`
		}
		if err := json.Unmarshal(body, &list); err != nil {
			return 0, err
		}
		for _, item := range list.Data.MenuItems {
			if item.ParentID != nil && *item.ParentID == id {
				count++
			}
		}
	}
	return count, nil
}

// touchesGlobal: the path changes a Global Section (global-sections/..., or
// pages/{id}/... where the page is one).
func touchesGlobal(ctx context.Context, segments []string, isGlobal func(context.Context, int64) bool) bool {
	if segments[0] == "global-sections" {
		return true
	}
	if segments[0] == "pages" && len(segments) > 1 {
		if id, err := strconv.ParseInt(segments[1], 10, 64); err == nil {
			return isGlobal(ctx, id)
		}
	}
	return false
}

// recycleBin keeps what Direct keys delete for domain.RecycleBinDays. An
// item is taken off the site by its own status route and deleted for good
// by its own DELETE route, both through the mux, so every step has the same
// checks and activity log entries as in the dashboard.
type recycleBin struct {
	mux   *http.ServeMux
	repo  *repository.RecycleBinRepo
	users *repository.UserRepo
	audit *service.AuditService
}

// dispatch runs an admin request in-process as the user in ctx (which must
// come from middleware.WithActingUser).
func (b *recycleBin) dispatch(ctx context.Context, method, path string, body any) (int, []byte) {
	var reader *bytes.Reader
	if body != nil {
		raw, _ := json.Marshal(body)
		reader = bytes.NewReader(raw)
	} else {
		reader = bytes.NewReader(nil)
	}
	req, err := http.NewRequestWithContext(ctx, method, path, reader)
	if err != nil {
		return http.StatusInternalServerError, nil
	}
	req.Header.Set("Content-Type", "application/json")
	res := &snapshotResponse{header: http.Header{}, status: http.StatusOK}
	b.mux.ServeHTTP(res, req)
	return res.status, res.body.Bytes()
}

// itemState reads an item's label and status ("active"/"inactive" for a
// snippet). found is false when the item no longer exists.
func (b *recycleBin) itemState(ctx context.Context, itemType string, id int64) (label, status string, publishAt *time.Time, found bool, err error) {
	code, body := b.dispatch(ctx, http.MethodGet, fmt.Sprintf("/api/admin/%s/%d", itemType, id), nil)
	if code == http.StatusNotFound {
		return "", "", nil, false, nil
	}
	if code != http.StatusOK {
		return "", "", nil, false, fmt.Errorf("reading %s %d: %s", itemType, id, envelopeError(body))
	}
	record := findRecord(middleware.DecodeEnvelopeData(body))
	for _, field := range []string{"title", "name", "gameName", "label", "slug"} {
		if v, _ := record[field].(string); v != "" {
			label = v
			break
		}
	}
	if active, ok := record["isActive"].(bool); ok {
		status = map[bool]string{true: "active", false: "inactive"}[active]
	} else {
		status, _ = record["status"].(string)
	}
	if v, _ := record["publishAt"].(string); v != "" {
		if t, err := time.Parse(time.RFC3339, v); err == nil {
			publishAt = &t
		}
	}
	return label, status, publishAt, true, nil
}

// findRecord returns the object that holds the item's status: the data
// itself, or the one object inside it that has one ({"page": ..., "sections": ...}).
func findRecord(data map[string]any) map[string]any {
	if _, ok := data["status"]; ok {
		return data
	}
	if _, ok := data["isActive"]; ok {
		return data
	}
	for _, v := range data {
		if m, ok := v.(map[string]any); ok {
			if _, ok := m["status"]; ok {
				return m
			}
			if _, ok := m["isActive"]; ok {
				return m
			}
		}
	}
	return data
}

func envelopeError(body []byte) string {
	var envelope struct {
		Error struct {
			Message string `json:"message"`
		} `json:"error"`
	}
	if json.Unmarshal(body, &envelope) == nil && envelope.Error.Message != "" {
		return envelope.Error.Message
	}
	return "unexpected response"
}

// setState sets a binned item to draft (a snippet to inactive), or puts
// its previous status back when restoring.
func (b *recycleBin) setState(ctx context.Context, itemType string, id int64, status string, publishAt *time.Time) (int, []byte) {
	if itemType == "snippets" {
		return b.dispatch(ctx, http.MethodPut, fmt.Sprintf("/api/admin/snippets/%d/active", id), map[string]bool{"active": status == "active"})
	}
	return b.dispatch(ctx, http.MethodPut, fmt.Sprintf("/api/admin/%s/%d/status", itemType, id), map[string]any{"status": status, "publishAt": publishAt})
}

func offSiteStatus(itemType string) string {
	if itemType == "snippets" {
		return "inactive"
	}
	return string(domain.ContentStatusDraft)
}

type recycleBinItemDTO struct {
	ID             int64     `json:"id"`
	ItemType       string    `json:"itemType"`
	ItemID         int64     `json:"itemId"`
	Label          string    `json:"label"`
	PreviousStatus string    `json:"previousStatus"`
	DeletedByName  string    `json:"deletedByName"`
	APIKeyName     string    `json:"apiKeyName"`
	DeletedAt      time.Time `json:"deletedAt"`
	DeleteAfter    time.Time `json:"deleteAfter"`
}

func toRecycleBinItemDTO(item *domain.RecycleBinItem) recycleBinItemDTO {
	return recycleBinItemDTO{
		ID: item.ID, ItemType: item.ItemType, ItemID: item.ItemID, Label: item.Label, PreviousStatus: item.PreviousStatus,
		DeletedByName: item.DeletedByName, APIKeyName: item.APIKeyName, DeletedAt: item.DeletedAt,
		DeleteAfter: item.DeletedAt.Add(domain.RecycleBinDays * 24 * time.Hour),
	}
}

func writeRaw(w http.ResponseWriter, status int, body []byte) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_, _ = w.Write(body)
}

// moveToBin: DELETE /api/v1/<type>/<id> from a Direct key.
func (b *recycleBin) moveToBin(w http.ResponseWriter, r *http.Request, itemType string, id int64) {
	ctx := r.Context()
	label, status, publishAt, found, err := b.itemState(ctx, itemType, id)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "something went wrong on the server; try again")
		return
	}
	if !found {
		response.Err(w, http.StatusNotFound, "not found")
		return
	}
	key := middleware.APIKeyFromContext(ctx)
	owner := middleware.UserFromContext(ctx)
	item := &domain.RecycleBinItem{
		ItemType: itemType, ItemID: id, Label: label, PreviousStatus: status, PreviousPublishAt: publishAt,
		DeletedByID: &owner.ID, APIKeyID: &key.ID, APIKeyName: key.Name,
	}
	binID, err := b.repo.Add(ctx, item)
	if errors.Is(err, repository.ErrAlreadyInBin) {
		response.Err(w, http.StatusConflict, "this is already in the Recycle Bin")
		return
	}
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "something went wrong on the server; try again")
		return
	}
	if code, body := b.setState(ctx, itemType, id, offSiteStatus(itemType), nil); code != http.StatusOK {
		_ = b.repo.Remove(ctx, binID)
		writeRaw(w, code, body)
		return
	}
	b.record(r, "move to recycle bin", itemType, id, label)
	saved, err := b.repo.Get(ctx, binID)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "something went wrong on the server; try again")
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{
		"deleted": true, "recycleBinItem": toRecycleBinItemDTO(saved),
		"message": fmt.Sprintf("Moved to the Recycle Bin and taken off the site. It will be deleted for good after %d days. To undo: POST /api/v1/recycle-bin/%d/restore", domain.RecycleBinDays, binID),
	})
}

// record adds a Recycle Bin action to the activity log.
func (b *recycleBin) record(r *http.Request, action, itemType string, id int64, label string) {
	actor := middleware.UserFromContext(r.Context())
	ip, port := middleware.ClientAddress(r)
	entry := &domain.AuditLog{
		ActorID: &actor.ID, ActorName: actor.FullName, ActorRole: string(actor.Role), Action: action, EntityType: itemType,
		EntityID: &id, EntityLabel: label, IPAddress: ip, IPPort: port, UserAgent: r.UserAgent(),
		RequestMethod: r.Method, RequestPath: r.URL.RequestURI(), StatusCode: http.StatusOK,
	}
	middleware.StampAPIKey(r, entry)
	b.audit.Record(context.WithoutCancel(r.Context()), entry)
}

func (b *recycleBin) list(w http.ResponseWriter, r *http.Request) {
	items, err := b.repo.List(r.Context(), nil)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load the Recycle Bin")
		return
	}
	dtos := make([]recycleBinItemDTO, len(items))
	for i := range items {
		dtos[i] = toRecycleBinItemDTO(&items[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"items": dtos, "keepDays": domain.RecycleBinDays})
}

func (b *recycleBin) binItem(w http.ResponseWriter, r *http.Request) (*domain.RecycleBinItem, bool) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || id < 1 {
		response.Err(w, http.StatusBadRequest, "invalid id in the URL")
		return nil, false
	}
	item, err := b.repo.Get(r.Context(), id)
	if err != nil {
		response.Err(w, http.StatusNotFound, "not in the Recycle Bin")
		return nil, false
	}
	return item, true
}

// actingContext: for a dashboard request, run the bin's admin calls as the
// signed-in admin (their role checks still apply).
func actingContext(r *http.Request) context.Context {
	return middleware.WithActingUser(r.Context(), middleware.UserFromContext(r.Context()))
}

// restore puts an item's previous status back and takes it out of the bin.
func (b *recycleBin) restore(w http.ResponseWriter, r *http.Request) {
	item, ok := b.binItem(w, r)
	if !ok {
		return
	}
	ctx := actingContext(r)
	if _, _, _, found, err := b.itemState(ctx, item.ItemType, item.ItemID); err != nil {
		response.Err(w, http.StatusInternalServerError, "something went wrong on the server; try again")
		return
	} else if !found {
		_ = b.repo.Remove(ctx, item.ID)
		response.Err(w, http.StatusNotFound, "this item no longer exists, so it can't be restored")
		return
	}
	if code, body := b.setState(ctx, item.ItemType, item.ItemID, item.PreviousStatus, item.PreviousPublishAt); code != http.StatusOK {
		writeRaw(w, code, body)
		return
	}
	if err := b.repo.Remove(ctx, item.ID); err != nil {
		response.Err(w, http.StatusInternalServerError, "something went wrong on the server; try again")
		return
	}
	b.record(r, "restore from recycle bin", item.ItemType, item.ItemID, item.Label)
	response.JSON(w, http.StatusOK, map[string]any{
		"restored": true, "message": fmt.Sprintf("Restored, with its previous status (%s).", item.PreviousStatus),
	})
}

// deleteNow empties one item from the bin (Recycle Bin > Delete now).
func (b *recycleBin) deleteNow(w http.ResponseWriter, r *http.Request) {
	item, ok := b.binItem(w, r)
	if !ok {
		return
	}
	code, body, err := b.purge(actingContext(r), item)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "something went wrong on the server; try again")
		return
	}
	if code != http.StatusOK && code != http.StatusNotFound {
		writeRaw(w, code, body)
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

// purge deletes a binned item for good and takes it out of the bin. An
// item someone has put back on the site since (no longer draft/inactive) is
// only taken out of the bin, not deleted.
func (b *recycleBin) purge(ctx context.Context, item *domain.RecycleBinItem) (int, []byte, error) {
	_, status, _, found, err := b.itemState(ctx, item.ItemType, item.ItemID)
	if err != nil {
		return 0, nil, err
	}
	code, body := http.StatusOK, []byte(nil)
	if found && status == offSiteStatus(item.ItemType) {
		code, body = b.dispatch(ctx, http.MethodDelete, fmt.Sprintf("/api/admin/%s/%d", item.ItemType, item.ItemID), nil)
	}
	if code == http.StatusOK || code == http.StatusNotFound {
		if err := b.repo.Remove(ctx, item.ID); err != nil {
			return 0, nil, err
		}
	}
	return code, body, nil
}

// purgeExpired empties what has been in the bin for RecycleBinDays, acting
// as the admin whose key deleted it. Runs at startup, then daily.
func (b *recycleBin) purgeExpired() {
	for {
		cutoff := time.Now().UTC().Add(-domain.RecycleBinDays * 24 * time.Hour)
		items, err := b.repo.List(context.Background(), &cutoff)
		if err != nil {
			log.Printf("recycle bin: %v", err)
		}
		for i := range items {
			item := &items[i]
			if item.DeletedByID == nil {
				continue
			}
			user, err := b.users.GetByID(context.Background(), *item.DeletedByID)
			if err != nil {
				continue
			}
			actor := *user
			actor.FullName = "Recycle Bin (emptied after " + strconv.Itoa(domain.RecycleBinDays) + " days)"
			ctx := middleware.WithActingUser(context.Background(), &actor)
			if code, body, err := b.purge(ctx, item); err != nil || (code != http.StatusOK && code != http.StatusNotFound) {
				log.Printf("recycle bin: could not delete %s %d: %v %s", item.ItemType, item.ItemID, err, envelopeError(body))
			}
		}
		time.Sleep(24 * time.Hour)
	}
}

// directKeysOnly lets only Direct keys through (the Recycle Bin endpoints).
func directKeysOnly(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !middleware.APIKeyFromContext(r.Context()).IsDirect() {
			response.Err(w, http.StatusForbidden, "only a Direct key can use the Recycle Bin")
			return
		}
		next(w, r)
	}
}

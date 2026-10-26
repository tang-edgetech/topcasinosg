package service

import (
	"archive/zip"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
	"github.com/tang-edgetech/topcasinosg/api/internal/storage"
	"github.com/tang-edgetech/topcasinosg/api/internal/version"
)

var (
	ErrTransferNothingSelected = errors.New("choose at least one item to export")
	ErrTransferInvalidBundle   = errors.New("this file is not a valid backoffice export")
	ErrTransferNewerFormat     = errors.New("this export was made by a newer version — update this backoffice first")
	ErrTransferReplaceNeedsAll = errors.New("replace needs a whole-backoffice export")
	ErrTransferInvalidMode     = errors.New("mode must be 'merge' or 'replace'")
)

const (
	transferDataFile      = "data.json"
	transferUploadsPrefix = "uploads/"
	maxTransferDataBytes  = 256 << 20
	maxTransferWarnings   = 50

	transferMenusGroup    = "menus"
	transferSidebarGroup  = "sidebar"
	transferSettingsGroup = "settings"
	transferAllItemID     = "all"
)

var uploadReference = regexp.MustCompile(`/uploads/([A-Za-z0-9._-]+)`)

// transferGroup is one entry in the export picker. Most map one-to-one to a
// table; menus pick a whole location, sidebar and settings are single items.
type transferGroup struct {
	Key         string
	Label       string
	Table       string
	LabelColumn string
	Detail      func(row domain.TransferRow, regions map[int64]string) string
}

func slugDetail(row domain.TransferRow, _ map[int64]string) string {
	return transferString(row["slug"])
}

func regionDetail(row domain.TransferRow, regions map[int64]string) string {
	id, ok := transferInt(row["region_id"])
	if !ok {
		return "All regions"
	}
	return strings.ToUpper(regions[id])
}

var transferGroups = []transferGroup{
	{Key: "pages", Label: "Pages", Table: "pages", LabelColumn: "title"},
	{Key: "casinos", Label: "Casinos", Table: "casinos", LabelColumn: "name", Detail: slugDetail},
	{Key: "bonuses", Label: "Bonuses", Table: "bonuses", LabelColumn: "title", Detail: regionDetail},
	{Key: "payment_methods", Label: "Payment Methods", Table: "payment_methods", LabelColumn: "name", Detail: regionDetail},
	{Key: "rtp_entries", Label: "RTP Entries", Table: "rtp_entries", LabelColumn: "game_name", Detail: regionDetail},
	{Key: "guides", Label: "Guides", Table: "guides", LabelColumn: "title", Detail: regionDetail},
	{Key: "blacklist_entries", Label: "Blacklist", Table: "blacklist_entries", LabelColumn: "name", Detail: regionDetail},
	{Key: "news_articles", Label: "News", Table: "news_articles", LabelColumn: "title", Detail: slugDetail},
	{Key: "regions", Label: "Regions", Table: "regions", LabelColumn: "name", Detail: func(row domain.TransferRow, _ map[int64]string) string {
		return strings.ToUpper(transferString(row["code"]))
	}},
	{Key: "game_providers", Label: "Game Providers", Table: "game_providers", LabelColumn: "name"},
	{Key: "licenses", Label: "Licenses", Table: "licenses", LabelColumn: "name"},
	{Key: "site_snippets", Label: "Snippets", Table: "site_snippets", LabelColumn: "name"},
	{Key: "media", Label: "Media Library", Table: "media", LabelColumn: "title", Detail: func(row domain.TransferRow, _ map[int64]string) string {
		return transferString(row["original_filename"])
	}},
	{Key: transferMenusGroup, Label: "Navigation", Table: "menu_items"},
	{Key: transferSidebarGroup, Label: "Sidebar", Table: "sidebar_sections"},
	{Key: transferSettingsGroup, Label: "Site Settings", Table: "site_settings"},
}

var transferMenuLocations = []domain.TransferCatalogItem{
	{ID: "header", Label: "Header menu"},
	{ID: "footer", Label: "Footer menu"},
}

type TransferService struct {
	repo    *repository.TransferRepo
	storage storage.Storage
}

func NewTransferService(repo *repository.TransferRepo, store storage.Storage) *TransferService {
	return &TransferService{repo: repo, storage: store}
}

func canTransfer(actor *domain.AdminUser) bool {
	return actor.Role == domain.RoleSuperAdmin || actor.Role == domain.RoleAdmin
}

// Catalog lists everything that can be exported, grouped like the admin menu.
func (s *TransferService) Catalog(ctx context.Context, actor *domain.AdminUser) ([]domain.TransferCatalogGroup, error) {
	if !canTransfer(actor) {
		return nil, ErrForbidden
	}
	columns, err := s.repo.Columns(ctx)
	if err != nil {
		return nil, err
	}
	regionRows, err := s.repo.AllRows(ctx, "regions", columns["regions"])
	if err != nil {
		return nil, err
	}
	regions := make(map[int64]string, len(regionRows))
	for _, row := range regionRows {
		id, _ := transferInt(row["id"])
		regions[id] = transferString(row["code"])
	}

	groups := make([]domain.TransferCatalogGroup, 0, len(transferGroups))
	for _, g := range transferGroups {
		group := domain.TransferCatalogGroup{Key: g.Key, Label: g.Label}
		switch g.Key {
		case transferMenusGroup:
			group.Items = transferMenuLocations
		case transferSidebarGroup:
			group.Items = []domain.TransferCatalogItem{{ID: transferAllItemID, Label: "Sidebar links"}}
		case transferSettingsGroup:
			group.Items = []domain.TransferCatalogItem{{ID: transferAllItemID, Label: "Site settings", Detail: "Title, logo, SEO, footer — not the site URL or 2FA"}}
		default:
			rows, err := s.repo.AllRows(ctx, g.Table, columns[g.Table])
			if err != nil {
				return nil, err
			}
			paths := map[int64]string{}
			if g.Table == "pages" {
				paths = pagePaths(rows)
			}
			for _, row := range rows {
				id, _ := transferInt(row["id"])
				item := domain.TransferCatalogItem{ID: strconv.FormatInt(id, 10), Label: transferString(row[g.LabelColumn])}
				if item.Label == "" {
					item.Label = transferString(row["filename"])
				}
				switch {
				case g.Table == "pages":
					item.Detail = "/" + paths[id]
				case g.Detail != nil:
					item.Detail = g.Detail(row, regions)
				}
				group.Items = append(group.Items, item)
			}
		}
		groups = append(groups, group)
	}
	return groups, nil
}

func pagePaths(rows []domain.TransferRow) map[int64]string {
	parents := make(map[int64]int64, len(rows))
	slugs := make(map[int64]string, len(rows))
	for _, row := range rows {
		id, _ := transferInt(row["id"])
		parent, _ := transferInt(row["parent_id"])
		parents[id] = parent
		slugs[id] = transferString(row["slug"])
	}
	paths := make(map[int64]string, len(rows))
	for id := range slugs {
		parts := []string{}
		for current, depth := id, 0; current != 0 && depth < len(rows); current, depth = parents[current], depth+1 {
			parts = append([]string{slugs[current]}, parts...)
		}
		paths[id] = strings.Join(parts, "/")
	}
	return paths
}

// exportSet collects rows by table while walking dependencies.
type exportSet struct {
	rows       map[string][]domain.TransferRow
	ids        map[string]map[int64]bool
	ownersDone map[string]map[int64]bool
}

func newExportSet() *exportSet {
	return &exportSet{rows: map[string][]domain.TransferRow{}, ids: map[string]map[int64]bool{}, ownersDone: map[string]map[int64]bool{}}
}

func (e *exportSet) add(table string, rows []domain.TransferRow) bool {
	if e.ids[table] == nil {
		e.ids[table] = map[int64]bool{}
	}
	added := false
	for _, row := range rows {
		if id, ok := transferInt(row["id"]); ok {
			if e.ids[table][id] {
				continue
			}
			e.ids[table][id] = true
		}
		e.rows[table] = append(e.rows[table], row)
		added = true
	}
	return added
}

// Export writes a zip with data.json plus every upload the exported rows use.
// A partial export also carries what the picked items depend on (a bonus's
// casino and region, a page's parent, images), so it imports cleanly into a
// backoffice that doesn't have them yet.
func (s *TransferService) Export(ctx context.Context, actor *domain.AdminUser, selection domain.TransferSelection, source string, w io.Writer) error {
	if !canTransfer(actor) {
		return ErrForbidden
	}
	columns, err := s.repo.Columns(ctx)
	if err != nil {
		return err
	}

	set := newExportSet()
	selected := map[string][]int64{}
	if selection.Whole {
		for _, t := range repository.TransferTables {
			rows, err := s.repo.AllRows(ctx, t.Name, columns[t.Name])
			if err != nil {
				return err
			}
			set.add(t.Name, rows)
		}
	} else {
		if err := s.collectSelection(ctx, columns, selection, set, selected); err != nil {
			return err
		}
		if len(set.rows) == 0 {
			return ErrTransferNothingSelected
		}
		if err := s.collectDependencies(ctx, columns, set); err != nil {
			return err
		}
	}

	files, err := s.collectFiles(ctx, columns, set, !selection.Whole)
	if err != nil {
		return err
	}
	users, err := s.referencedUsers(ctx, set)
	if err != nil {
		return err
	}

	bundle := domain.TransferBundle{
		Format:     domain.TransferFormat,
		AppVersion: version.Version,
		ExportedAt: time.Now().UTC(),
		Source:     source,
		Whole:      selection.Whole,
		Selected:   selected,
		Users:      users,
		Tables:     set.rows,
		Files:      files,
	}
	return s.writeZip(ctx, bundle, w)
}

func (s *TransferService) collectSelection(ctx context.Context, columns map[string][]repository.TransferColumn, selection domain.TransferSelection, set *exportSet, selected map[string][]int64) error {
	for _, g := range transferGroups {
		picked := selection.Items[g.Key]
		if len(picked) == 0 {
			continue
		}
		var rows []domain.TransferRow
		var err error
		switch g.Key {
		case transferMenusGroup:
			locations := make([]any, 0, len(picked))
			for _, l := range picked {
				for _, known := range transferMenuLocations {
					if l == known.ID {
						locations = append(locations, l)
					}
				}
			}
			rows, err = s.repo.RowsWhereIn(ctx, g.Table, columns[g.Table], "location", locations)
		case transferSidebarGroup:
			rows, err = s.repo.AllRows(ctx, g.Table, columns[g.Table])
		case transferSettingsGroup:
			rows, err = s.repo.RowsWhereIn(ctx, g.Table, columns[g.Table], "id", []any{repository.SingletonID})
		default:
			ids := make([]any, 0, len(picked))
			for _, p := range picked {
				if id, err := strconv.ParseInt(p, 10, 64); err == nil {
					ids = append(ids, id)
				}
			}
			rows, err = s.repo.RowsWhereIn(ctx, g.Table, columns[g.Table], "id", ids)
		}
		if err != nil {
			return err
		}
		set.add(g.Table, rows)
		for _, row := range rows {
			if id, ok := transferInt(row["id"]); ok {
				selected[g.Table] = append(selected[g.Table], id)
			}
		}
	}
	return nil
}

// collectDependencies repeats until nothing new turns up: child rows of every
// owner in the set, then every row a foreign key points at.
func (s *TransferService) collectDependencies(ctx context.Context, columns map[string][]repository.TransferColumn, set *exportSet) error {
	for changed := true; changed; {
		changed = false
		for _, t := range repository.TransferTables {
			if t.Owner != nil {
				if set.ownersDone[t.Name] == nil {
					set.ownersDone[t.Name] = map[int64]bool{}
				}
				var owners []any
				for id := range set.ids[t.Owner.Table] {
					if !set.ownersDone[t.Name][id] {
						set.ownersDone[t.Name][id] = true
						owners = append(owners, id)
					}
				}
				if len(owners) > 0 {
					rows, err := s.repo.RowsWhereIn(ctx, t.Name, columns[t.Name], t.Owner.Column, owners)
					if err != nil {
						return err
					}
					changed = set.add(t.Name, rows) || changed
				}
			}

			missing := map[string][]any{}
			for _, row := range set.rows[t.Name] {
				for column, refTable := range t.Refs {
					id, ok := transferInt(row[column])
					if ok && !set.ids[refTable][id] {
						missing[refTable] = append(missing[refTable], id)
					}
				}
			}
			for refTable, ids := range missing {
				rows, err := s.repo.RowsWhereIn(ctx, refTable, columns[refTable], "id", ids)
				if err != nil {
					return err
				}
				changed = set.add(refTable, rows) || changed
			}
		}
	}
	return nil
}

// collectFiles returns the upload filenames to pack: every media row's file
// plus any /uploads/ path mentioned in text (rich text, logo URLs). For a
// partial export, media rows behind those paths join the set too.
func (s *TransferService) collectFiles(ctx context.Context, columns map[string][]repository.TransferColumn, set *exportSet, addMediaRows bool) ([]string, error) {
	names := map[string]bool{}
	for table, rows := range set.rows {
		for _, row := range rows {
			if table == "media" {
				names[transferString(row["filename"])] = true
			}
			for _, value := range row {
				if text, ok := value.(string); ok && strings.Contains(text, "/uploads/") {
					for _, m := range uploadReference.FindAllStringSubmatch(text, -1) {
						names[m[1]] = true
					}
				}
			}
		}
	}

	if addMediaRows {
		var referenced []any
		for name := range names {
			referenced = append(referenced, name)
		}
		rows, err := s.repo.RowsWhereIn(ctx, "media", columns["media"], "filename", referenced)
		if err != nil {
			return nil, err
		}
		set.add("media", rows)
	}

	files := make([]string, 0, len(names))
	for name := range names {
		if storage.ValidFilename(name) && s.storage.Exists(ctx, name) {
			files = append(files, name)
		}
	}
	sort.Strings(files)
	return files, nil
}

func (s *TransferService) referencedUsers(ctx context.Context, set *exportSet) (map[string]string, error) {
	emails, err := s.repo.UserEmails(ctx)
	if err != nil {
		return nil, err
	}
	users := map[string]string{}
	for _, t := range repository.TransferTables {
		for _, row := range set.rows[t.Name] {
			for _, column := range t.UserRefs {
				if id, ok := transferInt(row[column]); ok && emails[id] != "" {
					users[strconv.FormatInt(id, 10)] = emails[id]
				}
			}
		}
	}
	return users, nil
}

func (s *TransferService) writeZip(ctx context.Context, bundle domain.TransferBundle, w io.Writer) error {
	archive := zip.NewWriter(w)
	data, err := archive.Create(transferDataFile)
	if err != nil {
		return err
	}
	encoder := json.NewEncoder(data)
	encoder.SetIndent("", " ")
	if err := encoder.Encode(bundle); err != nil {
		return err
	}
	for _, name := range bundle.Files {
		if err := s.copyFileToZip(ctx, archive, name); err != nil {
			return err
		}
	}
	return archive.Close()
}

func (s *TransferService) copyFileToZip(ctx context.Context, archive *zip.Writer, name string) error {
	src, err := s.storage.Open(ctx, name)
	if err != nil {
		return err
	}
	defer src.Close()
	dst, err := archive.CreateHeader(&zip.FileHeader{Name: transferUploadsPrefix + name, Method: zip.Store})
	if err != nil {
		return err
	}
	_, err = io.Copy(dst, src)
	return err
}

// Import applies an export zip. Merge matches items by their natural key
// (slug, code, name, page path) and creates or updates them; replace first
// empties every content table. Everything runs in one transaction — a dry
// run rolls it back and only reports what would change.
func (s *TransferService) Import(ctx context.Context, actor *domain.AdminUser, file io.ReaderAt, size int64, name string, mode domain.TransferMode, dryRun bool) (*domain.TransferReport, error) {
	if !canTransfer(actor) {
		return nil, ErrForbidden
	}
	if mode != domain.TransferModeMerge && mode != domain.TransferModeReplace {
		return nil, ErrTransferInvalidMode
	}
	archive, bundle, err := readTransferBundle(file, size)
	if err != nil {
		return nil, err
	}
	if mode == domain.TransferModeReplace && !bundle.Whole {
		return nil, ErrTransferReplaceNeedsAll
	}

	report := &domain.TransferReport{
		Name: name, Mode: mode, DryRun: dryRun, Whole: bundle.Whole,
		Source: bundle.Source, AppVersion: bundle.AppVersion, ExportedAt: bundle.ExportedAt,
		Tables: map[string]domain.TransferTableReport{}, Warnings: []string{},
	}

	writer, err := s.repo.BeginImport(ctx)
	if err != nil {
		return nil, err
	}
	defer writer.Rollback()

	run, err := newTransferRun(ctx, writer, bundle, report)
	if err != nil {
		return nil, err
	}
	if mode == domain.TransferModeReplace {
		if err := run.wipe(ctx); err != nil {
			return nil, err
		}
	}
	for _, t := range repository.TransferTables {
		if err := run.importTable(ctx, t, mode == domain.TransferModeReplace); err != nil {
			return nil, fmt.Errorf("%s: %w", t.Name, err)
		}
	}

	files, err := s.importFiles(ctx, archive, bundle.Files, dryRun)
	if err != nil {
		return nil, err
	}
	report.Files = files

	if dryRun {
		return report, nil
	}
	if err := writer.Commit(); err != nil {
		return nil, err
	}
	return report, nil
}

func readTransferBundle(file io.ReaderAt, size int64) (*zip.Reader, *domain.TransferBundle, error) {
	archive, err := zip.NewReader(file, size)
	if err != nil {
		return nil, nil, ErrTransferInvalidBundle
	}
	entry, err := archive.Open(transferDataFile)
	if err != nil {
		return nil, nil, ErrTransferInvalidBundle
	}
	defer entry.Close()

	decoder := json.NewDecoder(io.LimitReader(entry, maxTransferDataBytes))
	decoder.UseNumber()
	var bundle domain.TransferBundle
	if err := decoder.Decode(&bundle); err != nil || bundle.Format == 0 {
		return nil, nil, ErrTransferInvalidBundle
	}
	if bundle.Format > domain.TransferFormat {
		return nil, nil, ErrTransferNewerFormat
	}
	return archive, &bundle, nil
}

func (s *TransferService) importFiles(ctx context.Context, archive *zip.Reader, names []string, dryRun bool) (int, error) {
	written := 0
	for _, name := range names {
		if !storage.ValidFilename(name) || s.storage.Exists(ctx, name) {
			continue
		}
		entry, err := archive.Open(transferUploadsPrefix + name)
		if err != nil {
			continue
		}
		if !dryRun {
			if _, err := s.storage.Save(ctx, name, entry); err != nil {
				entry.Close()
				return written, err
			}
		}
		entry.Close()
		written++
	}
	return written, nil
}

// transferRun holds the state of one import: source→target ID maps and which
// source rows were written (whose child rows should follow).
type transferRun struct {
	writer   *repository.TransferWriter
	bundle   *domain.TransferBundle
	report   *domain.TransferReport
	columns  map[string][]repository.TransferColumn
	users    map[int64]int64
	selected map[string]map[int64]bool
	ids      map[string]map[int64]int64
	written  map[string]map[int64]bool
}

func newTransferRun(ctx context.Context, writer *repository.TransferWriter, bundle *domain.TransferBundle, report *domain.TransferReport) (*transferRun, error) {
	columns, err := writer.Columns(ctx)
	if err != nil {
		return nil, err
	}
	byEmail, err := writer.UserIDsByEmail(ctx)
	if err != nil {
		return nil, err
	}
	users := map[int64]int64{}
	for src, email := range bundle.Users {
		srcID, err := strconv.ParseInt(src, 10, 64)
		if target, ok := byEmail[strings.ToLower(email)]; err == nil && ok {
			users[srcID] = target
		}
	}
	selected := map[string]map[int64]bool{}
	for table, ids := range bundle.Selected {
		selected[table] = map[int64]bool{}
		for _, id := range ids {
			selected[table][id] = true
		}
	}
	return &transferRun{
		writer: writer, bundle: bundle, report: report, columns: columns, users: users, selected: selected,
		ids: map[string]map[int64]int64{}, written: map[string]map[int64]bool{},
	}, nil
}

func (r *transferRun) warn(format string, args ...any) {
	if len(r.report.Warnings) < maxTransferWarnings {
		r.report.Warnings = append(r.report.Warnings, fmt.Sprintf(format, args...))
	}
}

func (r *transferRun) count(table string, apply func(*domain.TransferTableReport)) {
	entry := r.report.Tables[table]
	apply(&entry)
	r.report.Tables[table] = entry
}

func selfRef(t repository.TransferTable) string {
	for column, refTable := range t.Refs {
		if refTable == t.Name {
			return column
		}
	}
	return ""
}

// wipe empties every content table, children first. Site settings stay and
// are overwritten instead.
func (r *transferRun) wipe(ctx context.Context) error {
	for i := len(repository.TransferTables) - 1; i >= 0; i-- {
		t := repository.TransferTables[i]
		if t.Singleton {
			continue
		}
		removed, err := r.writer.DeleteAll(ctx, t.Name, selfRef(t))
		if err != nil {
			return fmt.Errorf("clear %s: %w", t.Name, err)
		}
		if removed > 0 {
			r.count(t.Name, func(e *domain.TransferTableReport) { e.Deleted += int(removed) })
		}
	}
	return nil
}

func (r *transferRun) importTable(ctx context.Context, t repository.TransferTable, wiped bool) error {
	rows := r.bundle.Tables[t.Name]
	if len(rows) == 0 {
		return nil
	}
	columns, ok := r.columns[t.Name]
	if !ok {
		r.warn("%s isn't in this backoffice's database — skipped", t.Name)
		return nil
	}
	if r.ids[t.Name] == nil {
		r.ids[t.Name] = map[int64]int64{}
		r.written[t.Name] = map[int64]bool{}
	}
	if ref := selfRef(t); ref != "" {
		rows = parentsFirst(rows, ref)
	}

	clearedGroups := map[string]bool{}
	for _, row := range rows {
		srcID, hasID := transferInt(row["id"])

		if t.Owner != nil {
			ownerID, _ := transferInt(row[t.Owner.Column])
			if !r.written[t.Owner.Table][ownerID] {
				continue
			}
		}
		if t.Group != "" && !wiped {
			group := transferString(row[t.Group])
			if !clearedGroups[group] {
				clearedGroups[group] = true
				removed, err := r.writer.DeleteWhere(ctx, t.Name, t.Group, group, selfRef(t))
				if err != nil {
					return err
				}
				r.count(t.Name, func(e *domain.TransferTableReport) { e.Deleted += int(removed) })
			}
		}

		values, ok := r.mapRow(t, columns, row)
		if !ok {
			continue
		}

		var targetID int64
		var err error
		switch {
		case t.Singleton:
			targetID, err = r.upsertSingleton(ctx, t, values)
		case len(t.Key) > 0:
			targetID, err = r.upsertByKey(ctx, t, srcID, values)
		default:
			targetID, err = r.writer.Insert(ctx, t.Name, values)
			if err == nil {
				r.count(t.Name, func(e *domain.TransferTableReport) { e.Created++ })
				if hasID {
					r.written[t.Name][srcID] = true
				}
			}
		}
		if err != nil {
			return err
		}
		if hasID {
			r.ids[t.Name][srcID] = targetID
		}
	}
	return nil
}

func (r *transferRun) upsertSingleton(ctx context.Context, t repository.TransferTable, values map[string]any) (int64, error) {
	exists, err := r.writer.Exists(ctx, t.Name, repository.SingletonID)
	if err != nil {
		return 0, err
	}
	if exists {
		err = r.writer.Update(ctx, t.Name, repository.SingletonID, values)
		r.count(t.Name, func(e *domain.TransferTableReport) { e.Updated++ })
	} else {
		values["id"] = repository.SingletonID
		_, err = r.writer.Insert(ctx, t.Name, values)
		r.count(t.Name, func(e *domain.TransferTableReport) { e.Created++ })
	}
	return repository.SingletonID, err
}

func (r *transferRun) upsertByKey(ctx context.Context, t repository.TransferTable, srcID int64, values map[string]any) (int64, error) {
	key := make([]any, len(t.Key))
	for i, column := range t.Key {
		key[i] = values[column]
	}
	existing, err := r.writer.FindID(ctx, t.Name, t.Key, key)
	if err != nil {
		return 0, err
	}
	if existing == 0 {
		id, err := r.writer.Insert(ctx, t.Name, values)
		if err != nil {
			return 0, err
		}
		r.written[t.Name][srcID] = true
		r.count(t.Name, func(e *domain.TransferTableReport) { e.Created++ })
		return id, nil
	}

	if !r.bundle.Whole && !r.selected[t.Name][srcID] {
		r.count(t.Name, func(e *domain.TransferTableReport) { e.Linked++ })
		return existing, nil
	}
	update := make(map[string]any, len(values))
	for column, value := range values {
		if column != "created_at" && !contains(t.UserRefs, column) {
			update[column] = value
		}
	}
	if err := r.writer.Update(ctx, t.Name, existing, update); err != nil {
		return 0, err
	}
	if err := r.deleteChildren(ctx, t.Name, existing); err != nil {
		return 0, err
	}
	r.written[t.Name][srcID] = true
	r.count(t.Name, func(e *domain.TransferTableReport) { e.Updated++ })
	return existing, nil
}

// deleteChildren clears an updated row's owned rows (and theirs), which the
// bundle then re-creates.
func (r *transferRun) deleteChildren(ctx context.Context, table string, id int64) error {
	for _, child := range repository.TransferTables {
		if child.Owner == nil || child.Owner.Table != table {
			continue
		}
		if repository.HasID(r.columns[child.Name]) {
			childIDs, err := r.writer.IDsWhere(ctx, child.Name, child.Owner.Column, id)
			if err != nil {
				return err
			}
			for _, childID := range childIDs {
				if err := r.deleteChildren(ctx, child.Name, childID); err != nil {
					return err
				}
			}
		}
		if _, err := r.writer.DeleteWhere(ctx, child.Name, child.Owner.Column, id, ""); err != nil {
			return err
		}
	}
	return nil
}

// mapRow keeps the columns this database has and translates foreign keys and
// user references to this database's IDs. A required reference that can't
// be resolved skips the row.
func (r *transferRun) mapRow(t repository.TransferTable, columns []repository.TransferColumn, row domain.TransferRow) (map[string]any, bool) {
	values := make(map[string]any, len(columns))
	for _, c := range columns {
		value, present := row[c.Name]
		if !present || c.Name == "id" {
			continue
		}
		if refTable, isRef := t.Refs[c.Name]; isRef && value != nil {
			srcRef, _ := transferInt(value)
			target, found := r.ids[refTable][srcRef]
			if !found {
				if !c.Nullable {
					r.warn("skipped a %s row: its %s isn't in the file", t.Name, strings.TrimSuffix(c.Name, "_id"))
					return nil, false
				}
				r.warn("cleared %s on a %s row: the item it points to isn't in the file", c.Name, t.Name)
				value = nil
			} else {
				value = target
			}
		}
		if contains(t.UserRefs, c.Name) && value != nil {
			srcUser, _ := transferInt(value)
			if target, found := r.users[srcUser]; found {
				value = target
			} else {
				value = nil
			}
		}
		values[c.Name] = value
	}
	return values, true
}

// parentsFirst orders a self-referencing table so every parent is inserted
// before its children.
func parentsFirst(rows []domain.TransferRow, parentColumn string) []domain.TransferRow {
	byID := make(map[int64]domain.TransferRow, len(rows))
	for _, row := range rows {
		if id, ok := transferInt(row["id"]); ok {
			byID[id] = row
		}
	}
	ordered := make([]domain.TransferRow, 0, len(rows))
	placed := make(map[int64]bool, len(rows))
	var place func(row domain.TransferRow, depth int)
	place = func(row domain.TransferRow, depth int) {
		id, _ := transferInt(row["id"])
		if placed[id] {
			return
		}
		if parent, ok := transferInt(row[parentColumn]); ok && depth < len(rows) {
			if parentRow, inFile := byID[parent]; inFile {
				place(parentRow, depth+1)
			}
		}
		placed[id] = true
		ordered = append(ordered, row)
	}
	for _, row := range rows {
		place(row, 0)
	}
	return ordered
}

func transferInt(v any) (int64, bool) {
	switch value := v.(type) {
	case int64:
		return value, true
	case int:
		return int64(value), true
	case uint64:
		return int64(value), true
	case int32:
		return int64(value), true
	case uint32:
		return int64(value), true
	case float64:
		return int64(value), true
	case json.Number:
		n, err := value.Int64()
		return n, err == nil
	case string:
		n, err := strconv.ParseInt(value, 10, 64)
		return n, err == nil
	case []byte:
		n, err := strconv.ParseInt(string(bytes.TrimSpace(value)), 10, 64)
		return n, err == nil
	}
	return 0, false
}

func transferString(v any) string {
	switch value := v.(type) {
	case nil:
		return ""
	case string:
		return value
	case json.Number:
		return value.String()
	default:
		return fmt.Sprint(value)
	}
}

func contains(list []string, s string) bool {
	for _, item := range list {
		if item == s {
			return true
		}
	}
	return false
}

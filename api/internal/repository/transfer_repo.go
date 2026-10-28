package repository

import (
	"context"
	"database/sql"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

// TransferOwner marks a child table whose rows belong to one owner row and are
// replaced together with it (a casino's regions, a page's sections).
type TransferOwner struct {
	Table  string
	Column string
}

// TransferTable describes how one content table moves between backoffices.
// Rows are matched in the target by Key (after foreign keys are translated to
// the target's IDs), never by ID, since IDs differ between environments.
type TransferTable struct {
	Name      string
	Key       []string
	Refs      map[string]string
	UserRefs  []string
	Owner     *TransferOwner
	Group     string
	Singleton bool
	Skip      []string
}

// TransferTables lists every transferable table, parents before children.
// Users, sessions, the activity log and migrations never travel.
var TransferTables = []TransferTable{
	{Name: "media", Key: []string{"filename"}, UserRefs: []string{"uploaded_by"}},
	{Name: "regions", Key: []string{"code"}, Refs: map[string]string{"flag_media_id": "media"}},
	{Name: "game_providers", Key: []string{"name"}, Refs: map[string]string{"logo_media_id": "media"}},
	{Name: "licenses", Key: []string{"name"}, Refs: map[string]string{"logo_media_id": "media"}},
	{Name: "casinos", Key: []string{"slug"}, Refs: map[string]string{"logo_media_id": "media"}, UserRefs: []string{"created_by"}},
	{Name: "casino_regions", Owner: &TransferOwner{"casinos", "casino_id"}, Refs: map[string]string{"casino_id": "casinos", "region_id": "regions"}},
	{Name: "casino_licenses", Owner: &TransferOwner{"casinos", "casino_id"}, Refs: map[string]string{"casino_id": "casinos", "license_id": "licenses"}},
	{Name: "casino_game_providers", Owner: &TransferOwner{"casinos", "casino_id"}, Refs: map[string]string{"casino_id": "casinos", "game_provider_id": "game_providers"}},
	{Name: "bonuses", Key: []string{"slug"}, Refs: map[string]string{"region_id": "regions", "casino_id": "casinos", "eligible_provider_id": "game_providers"}, UserRefs: []string{"created_by"}},
	{Name: "payment_methods", Key: []string{"region_id", "name"}, Refs: map[string]string{"region_id": "regions", "icon_media_id": "media"}, UserRefs: []string{"created_by"}},
	{Name: "rtp_entries", Key: []string{"region_id", "casino_id", "game_name"}, Refs: map[string]string{"region_id": "regions", "casino_id": "casinos", "game_provider_id": "game_providers", "image_media_id": "media"}, UserRefs: []string{"created_by"}},
	{Name: "blacklist_entries", Key: []string{"region_id", "name"}, Refs: map[string]string{"region_id": "regions", "logo_media_id": "media"}, UserRefs: []string{"created_by"}},
	{Name: "guides", Key: []string{"slug"}, Refs: map[string]string{"region_id": "regions", "cover_media_id": "media"}, UserRefs: []string{"created_by"}},
	{Name: "news_articles", Key: []string{"slug"}, Refs: map[string]string{"cover_media_id": "media"}, UserRefs: []string{"created_by"}},
	{Name: "pages", Key: []string{"parent_id", "slug"}, Refs: map[string]string{"parent_id": "pages"}},
	{Name: "page_sections", Owner: &TransferOwner{"pages", "page_id"}, Refs: map[string]string{"page_id": "pages"}},
	{Name: "page_section_fields", Owner: &TransferOwner{"page_sections", "section_id"}, Refs: map[string]string{"section_id": "page_sections", "media_id": "media"}},
	{Name: "menu_items", Group: "location", Refs: map[string]string{"parent_id": "menu_items"}},
	{Name: "sidebar_sections", Key: []string{"section_key"}},
	{Name: "sidebar_links", Owner: &TransferOwner{"sidebar_sections", "section_id"}, Refs: map[string]string{"section_id": "sidebar_sections"}},
	{Name: "site_snippets", Key: []string{"name"}},
	{Name: "snippet_conditions", Owner: &TransferOwner{"site_snippets", "snippet_id"}, Refs: map[string]string{"snippet_id": "site_snippets", "page_id": "pages"}},
	{Name: "site_settings", Singleton: true, Skip: []string{"site_url", "two_factor_enabled", "security_policy"}},
}

// SingletonID is the fixed ID of single-row tables (site_settings).
const SingletonID = 1

const transferQueryChunk = 500

var transferAlwaysSkipped = map[string]bool{"updated_at": true}

func TransferTableByName(name string) (TransferTable, bool) {
	for _, t := range TransferTables {
		if t.Name == name {
			return t, true
		}
	}
	return TransferTable{}, false
}

type TransferColumn struct {
	Name     string
	DataType string
	Nullable bool
}

// HasID reports whether rows have their own id column (join tables don't).
func HasID(columns []TransferColumn) bool {
	for _, c := range columns {
		if c.Name == "id" {
			return true
		}
	}
	return false
}

type queryer interface {
	QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error)
}

type TransferRepo struct {
	db *sql.DB
}

func NewTransferRepo(db *sql.DB) *TransferRepo {
	return &TransferRepo{db: db}
}

// Columns returns the transferable columns of every table in TransferTables,
// read from the live schema so bundles survive future migrations: generated
// columns, updated_at and per-table Skip columns are left out.
func (r *TransferRepo) Columns(ctx context.Context) (map[string][]TransferColumn, error) {
	return loadTransferColumns(ctx, r.db)
}

func loadTransferColumns(ctx context.Context, q queryer) (map[string][]TransferColumn, error) {
	rows, err := q.QueryContext(ctx,
		`SELECT table_name, column_name, data_type, is_nullable = 'YES', extra
			FROM information_schema.columns
			WHERE table_schema = DATABASE()
			ORDER BY table_name, ordinal_position`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	skip := make(map[string]map[string]bool, len(TransferTables))
	for _, t := range TransferTables {
		skip[t.Name] = map[string]bool{}
		for _, c := range t.Skip {
			skip[t.Name][c] = true
		}
	}

	out := make(map[string][]TransferColumn)
	for rows.Next() {
		var table, extra string
		var c TransferColumn
		if err := rows.Scan(&table, &c.Name, &c.DataType, &c.Nullable, &extra); err != nil {
			return nil, err
		}
		tableSkip, known := skip[table]
		if !known || tableSkip[c.Name] || transferAlwaysSkipped[c.Name] || strings.Contains(strings.ToUpper(extra), "GENERATED") {
			continue
		}
		out[table] = append(out[table], c)
	}
	return out, rows.Err()
}

func (r *TransferRepo) AllRows(ctx context.Context, table string, columns []TransferColumn) ([]domain.TransferRow, error) {
	return selectTransferRows(ctx, r.db, table, columns, "", nil)
}

// RowsWhereIn returns rows whose column matches any of values.
func (r *TransferRepo) RowsWhereIn(ctx context.Context, table string, columns []TransferColumn, column string, values []any) ([]domain.TransferRow, error) {
	var out []domain.TransferRow
	for start := 0; start < len(values); start += transferQueryChunk {
		chunk := values[start:min(start+transferQueryChunk, len(values))]
		where := fmt.Sprintf("%s IN (%s)", quoteIdent(column), placeholders(len(chunk)))
		rows, err := selectTransferRows(ctx, r.db, table, columns, where, chunk)
		if err != nil {
			return nil, err
		}
		out = append(out, rows...)
	}
	return out, nil
}

// UserEmails maps admin user IDs to emails, so created_by survives the trip
// to a backoffice where the same person has a different ID.
func (r *TransferRepo) UserEmails(ctx context.Context) (map[int64]string, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT id, email FROM admin_users`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make(map[int64]string)
	for rows.Next() {
		var id int64
		var email string
		if err := rows.Scan(&id, &email); err != nil {
			return nil, err
		}
		out[id] = email
	}
	return out, rows.Err()
}

func selectTransferRows(ctx context.Context, q queryer, table string, columns []TransferColumn, where string, args []any) ([]domain.TransferRow, error) {
	names := make([]string, len(columns))
	for i, c := range columns {
		names[i] = quoteIdent(c.Name)
	}
	query := fmt.Sprintf("SELECT %s FROM %s", strings.Join(names, ", "), quoteIdent(table))
	if where != "" {
		query += " WHERE " + where
	}
	if HasID(columns) {
		query += " ORDER BY id"
	}

	rows, err := q.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []domain.TransferRow
	for rows.Next() {
		values := make([]any, len(columns))
		pointers := make([]any, len(columns))
		for i := range values {
			pointers[i] = &values[i]
		}
		if err := rows.Scan(pointers...); err != nil {
			return nil, err
		}
		row := make(domain.TransferRow, len(columns))
		for i, c := range columns {
			row[c.Name] = normalizeTransferValue(values[i], c.DataType)
		}
		out = append(out, row)
	}
	return out, rows.Err()
}

func normalizeTransferValue(v any, dataType string) any {
	switch value := v.(type) {
	case nil:
		return nil
	case []byte:
		return string(value)
	case time.Time:
		if dataType == "date" {
			return value.Format(time.DateOnly)
		}
		return value.UTC().Format(time.DateTime)
	case uint64:
		return int64(value)
	case int32:
		return int64(value)
	case uint32:
		return int64(value)
	case bool:
		if value {
			return int64(1)
		}
		return int64(0)
	default:
		return value
	}
}

// TransferWriter applies an import inside one transaction, so a failed or
// previewed import leaves the backoffice untouched.
type TransferWriter struct {
	tx *sql.Tx
}

func (r *TransferRepo) BeginImport(ctx context.Context) (*TransferWriter, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	return &TransferWriter{tx: tx}, nil
}

func (w *TransferWriter) Commit() error   { return w.tx.Commit() }
func (w *TransferWriter) Rollback() error { return w.tx.Rollback() }

func (w *TransferWriter) Columns(ctx context.Context) (map[string][]TransferColumn, error) {
	return loadTransferColumns(ctx, w.tx)
}

func (w *TransferWriter) UserIDsByEmail(ctx context.Context) (map[string]int64, error) {
	rows, err := w.tx.QueryContext(ctx, `SELECT id, email FROM admin_users`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make(map[string]int64)
	for rows.Next() {
		var id int64
		var email string
		if err := rows.Scan(&id, &email); err != nil {
			return nil, err
		}
		out[strings.ToLower(email)] = id
	}
	return out, rows.Err()
}

// FindID returns the ID of the row whose key columns equal values (NULL-safe),
// or 0 when there is none.
func (w *TransferWriter) FindID(ctx context.Context, table string, key []string, values []any) (int64, error) {
	conditions := make([]string, len(key))
	for i, column := range key {
		conditions[i] = quoteIdent(column) + " <=> ?"
	}
	var id int64
	err := w.tx.QueryRowContext(ctx,
		fmt.Sprintf("SELECT id FROM %s WHERE %s ORDER BY id LIMIT 1", quoteIdent(table), strings.Join(conditions, " AND ")),
		values...,
	).Scan(&id)
	if err == sql.ErrNoRows {
		return 0, nil
	}
	return id, err
}

func (w *TransferWriter) Exists(ctx context.Context, table string, id int64) (bool, error) {
	found, err := w.FindID(ctx, table, []string{"id"}, []any{id})
	return found != 0, err
}

// Insert writes one row and returns its new ID (0 for tables without one).
func (w *TransferWriter) Insert(ctx context.Context, table string, values map[string]any) (int64, error) {
	columns, args := splitColumns(values)
	quoted := make([]string, len(columns))
	for i, c := range columns {
		quoted[i] = quoteIdent(c)
	}
	res, err := w.tx.ExecContext(ctx,
		fmt.Sprintf("INSERT INTO %s (%s) VALUES (%s)", quoteIdent(table), strings.Join(quoted, ", "), placeholders(len(columns))),
		args...,
	)
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return 0, nil
	}
	return id, nil
}

func (w *TransferWriter) Update(ctx context.Context, table string, id int64, values map[string]any) error {
	columns, args := splitColumns(values)
	if len(columns) == 0 {
		return nil
	}
	sets := make([]string, len(columns))
	for i, c := range columns {
		sets[i] = quoteIdent(c) + " = ?"
	}
	_, err := w.tx.ExecContext(ctx,
		fmt.Sprintf("UPDATE %s SET %s WHERE id = ?", quoteIdent(table), strings.Join(sets, ", ")),
		append(args, id)...,
	)
	return err
}

func (w *TransferWriter) IDsWhere(ctx context.Context, table, column string, value any) ([]int64, error) {
	rows, err := w.tx.QueryContext(ctx,
		fmt.Sprintf("SELECT id FROM %s WHERE %s = ?", quoteIdent(table), quoteIdent(column)), value)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var ids []int64
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, rows.Err()
}

// DeleteWhere removes every row whose column equals value.
func (w *TransferWriter) DeleteWhere(ctx context.Context, table, column string, value any, selfRef string) (int64, error) {
	return w.deleteRows(ctx, table, selfRef, fmt.Sprintf("%s = ?", quoteIdent(column)), value)
}

func (w *TransferWriter) DeleteAll(ctx context.Context, table, selfRef string) (int64, error) {
	return w.deleteRows(ctx, table, selfRef, "1 = 1")
}

// deleteRows removes a self-referencing tree leaves first, so neither the
// parent foreign key nor a "unique per parent" key (pages' slug) is tripped
// along the way, as nulling every parent at once would.
func (w *TransferWriter) deleteRows(ctx context.Context, table, selfRef, where string, args ...any) (int64, error) {
	if selfRef == "" {
		res, err := w.tx.ExecContext(ctx, fmt.Sprintf("DELETE FROM %s WHERE %s", quoteIdent(table), where), args...)
		if err != nil {
			return 0, err
		}
		return res.RowsAffected()
	}

	leaves := fmt.Sprintf(
		"DELETE FROM %[1]s WHERE %[2]s AND id NOT IN (SELECT parent FROM (SELECT DISTINCT %[3]s AS parent FROM %[1]s WHERE %[3]s IS NOT NULL) AS parents)",
		quoteIdent(table), where, quoteIdent(selfRef),
	)
	var total int64
	for {
		res, err := w.tx.ExecContext(ctx, leaves, args...)
		if err != nil {
			return total, err
		}
		removed, err := res.RowsAffected()
		if err != nil {
			return total, err
		}
		if removed == 0 {
			return total, nil
		}
		total += removed
	}
}

func splitColumns(values map[string]any) ([]string, []any) {
	columns := make([]string, 0, len(values))
	for c := range values {
		columns = append(columns, c)
	}
	sort.Strings(columns)
	args := make([]any, len(columns))
	for i, c := range columns {
		args[i] = values[c]
	}
	return columns, args
}

func quoteIdent(name string) string {
	return "`" + strings.ReplaceAll(name, "`", "``") + "`"
}

func placeholders(n int) string {
	return strings.TrimSuffix(strings.Repeat("?, ", n), ", ")
}

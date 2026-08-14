package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"strings"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type CasinoRepo struct {
	db *sql.DB
}

func NewCasinoRepo(db *sql.DB) *CasinoRepo {
	return &CasinoRepo{db: db}
}

// media.url is joined in via casinoFromClause/casinoFromClausePrefixed below
// (mirrors GameProvider/License/Region's logo/flag resolution).
const casinoColumns = `casinos.id, casinos.slug, casinos.name, casinos.logo_media_id, media.url, casinos.rating,
	casinos.summary, casinos.content, casinos.languages, casinos.payment_methods, casinos.pros, casinos.cons,
	casinos.safe_index, casinos.risk_status, casinos.supported_games, casinos.payout_speed, casinos.cta_url,
	casinos.status, casinos.publish_at, casinos.created_by, casinos.created_at, casinos.updated_at`
const casinoFromClause = `casinos LEFT JOIN media ON media.id = casinos.logo_media_id`

// Same columns, prefixed for queries that JOIN casinos against another
// table (region filtering) where an unqualified column name would be
// ambiguous.
const casinoColumnsPrefixed = `c.id, c.slug, c.name, c.logo_media_id, media.url, c.rating, c.summary, c.content, c.languages,
	c.payment_methods, c.pros, c.cons, c.safe_index, c.risk_status, c.supported_games, c.payout_speed, c.cta_url,
	c.status, c.publish_at, c.created_by, c.created_at, c.updated_at`
const casinoFromClausePrefixed = `casinos c LEFT JOIN media ON media.id = c.logo_media_id`

func scanCasino(row interface{ Scan(...any) error }) (*domain.Casino, error) {
	var c domain.Casino
	var languagesJSON, paymentMethodsJSON, prosJSON, consJSON, supportedGamesJSON sql.NullString
	var riskStatus, logoURL sql.NullString
	if err := row.Scan(
		&c.ID, &c.Slug, &c.Name, &c.LogoMediaID, &logoURL, &c.Rating, &c.Summary, &c.Content, &languagesJSON, &paymentMethodsJSON,
		&prosJSON, &consJSON, &c.SafeIndex, &riskStatus, &supportedGamesJSON, &c.PayoutSpeed, &c.CTAURL, &c.Status,
		&c.PublishAt, &c.CreatedBy, &c.CreatedAt, &c.UpdatedAt,
	); err != nil {
		return nil, err
	}
	if logoURL.Valid {
		c.LogoURL = &logoURL.String
	}
	if riskStatus.Valid {
		rs := domain.RiskStatus(riskStatus.String)
		c.RiskStatus = &rs
	}
	if supportedGamesJSON.Valid && supportedGamesJSON.String != "" {
		_ = json.Unmarshal([]byte(supportedGamesJSON.String), &c.SupportedGames)
	}
	if languagesJSON.Valid && languagesJSON.String != "" {
		_ = json.Unmarshal([]byte(languagesJSON.String), &c.Languages)
	}
	if paymentMethodsJSON.Valid && paymentMethodsJSON.String != "" {
		_ = json.Unmarshal([]byte(paymentMethodsJSON.String), &c.PaymentMethods)
	}
	if prosJSON.Valid && prosJSON.String != "" {
		_ = json.Unmarshal([]byte(prosJSON.String), &c.Pros)
	}
	if consJSON.Valid && consJSON.String != "" {
		_ = json.Unmarshal([]byte(consJSON.String), &c.Cons)
	}
	return &c, nil
}

func (r *CasinoRepo) regionIDs(ctx context.Context, casinoID int64) ([]int64, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT region_id FROM casino_regions WHERE casino_id = ?`, casinoID)
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

// casinoAssociation names one of the three casino <-> entity many-to-many
// join tables (region, game provider, license) — all three share the exact
// same shape (a casino_id column plus one entity-id column), so a single
// generic read/sync/batch-attach helper set replaces what used to be three
// near-identical copies of each.
type casinoAssociation struct {
	table  string
	column string
}

var (
	casinoRegionAssoc       = casinoAssociation{table: "casino_regions", column: "region_id"}
	casinoGameProviderAssoc = casinoAssociation{table: "casino_game_providers", column: "game_provider_id"}
	casinoLicenseAssoc      = casinoAssociation{table: "casino_licenses", column: "license_id"}
)

func (r *CasinoRepo) associationIDs(ctx context.Context, a casinoAssociation, casinoID int64) ([]int64, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT `+a.column+` FROM `+a.table+` WHERE casino_id = ?`, casinoID)
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

func (r *CasinoRepo) syncAssociation(ctx context.Context, tx *sql.Tx, a casinoAssociation, casinoID int64, ids []int64) error {
	if _, err := tx.ExecContext(ctx, `DELETE FROM `+a.table+` WHERE casino_id = ?`, casinoID); err != nil {
		return err
	}
	for _, id := range ids {
		if _, err := tx.ExecContext(ctx,
			`INSERT INTO `+a.table+` (casino_id, `+a.column+`) VALUES (?, ?)`, casinoID, id,
		); err != nil {
			return err
		}
	}
	return nil
}

func (r *CasinoRepo) Create(ctx context.Context, c *domain.Casino) (int64, error) {
	languagesJSON, _ := json.Marshal(c.Languages)
	paymentMethodsJSON, _ := json.Marshal(c.PaymentMethods)
	prosJSON, _ := json.Marshal(c.Pros)
	consJSON, _ := json.Marshal(c.Cons)
	supportedGamesJSON, _ := json.Marshal(c.SupportedGames)

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	res, err := tx.ExecContext(ctx, `
		INSERT INTO casinos (slug, name, logo_media_id, rating, summary, content, languages, payment_methods,
			pros, cons, safe_index, risk_status, supported_games, payout_speed, cta_url, status, publish_at, created_by)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		c.Slug, c.Name, c.LogoMediaID, c.Rating, c.Summary, c.Content, languagesJSON, paymentMethodsJSON,
		prosJSON, consJSON, c.SafeIndex, c.RiskStatus, supportedGamesJSON, c.PayoutSpeed, c.CTAURL, c.Status,
		c.PublishAt, c.CreatedBy,
	)
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}
	if err := r.syncAssociation(ctx, tx, casinoRegionAssoc, id, c.RegionIDs); err != nil {
		return 0, err
	}
	if err := r.syncAssociation(ctx, tx, casinoGameProviderAssoc, id, c.GameProviderIDs); err != nil {
		return 0, err
	}
	if err := r.syncAssociation(ctx, tx, casinoLicenseAssoc, id, c.LicenseIDs); err != nil {
		return 0, err
	}
	return id, tx.Commit()
}

// Update overwrites the casino's own columns and its region associations
// (RegionIDs is a required field on every casino, so it is always
// synced from c.RegionIDs). gameProviderIDs and licenseIDs are taken as
// separate *[]int64 params rather than reading c.GameProviderIDs/LicenseIDs:
// a nil pointer means "caller didn't touch this association" and leaves the
// existing rows alone, while a non-nil pointer (including an empty slice)
// replaces them — so a partial update that omits these optional fields can't
// silently wipe out a casino's game providers/licenses the way a plain
// []int64 zero-value would.
func (r *CasinoRepo) Update(ctx context.Context, c *domain.Casino, gameProviderIDs, licenseIDs *[]int64) error {
	languagesJSON, _ := json.Marshal(c.Languages)
	paymentMethodsJSON, _ := json.Marshal(c.PaymentMethods)
	prosJSON, _ := json.Marshal(c.Pros)
	consJSON, _ := json.Marshal(c.Cons)
	supportedGamesJSON, _ := json.Marshal(c.SupportedGames)

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.ExecContext(ctx, `
		UPDATE casinos SET slug = ?, name = ?, logo_media_id = ?, rating = ?, summary = ?, content = ?,
			languages = ?, payment_methods = ?, pros = ?, cons = ?, safe_index = ?, risk_status = ?,
			supported_games = ?, payout_speed = ?, cta_url = ?
		WHERE id = ?`,
		c.Slug, c.Name, c.LogoMediaID, c.Rating, c.Summary, c.Content, languagesJSON, paymentMethodsJSON,
		prosJSON, consJSON, c.SafeIndex, c.RiskStatus, supportedGamesJSON, c.PayoutSpeed, c.CTAURL, c.ID,
	); err != nil {
		return err
	}
	if err := r.syncAssociation(ctx, tx, casinoRegionAssoc, c.ID, c.RegionIDs); err != nil {
		return err
	}
	if gameProviderIDs != nil {
		if err := r.syncAssociation(ctx, tx, casinoGameProviderAssoc, c.ID, *gameProviderIDs); err != nil {
			return err
		}
	}
	if licenseIDs != nil {
		if err := r.syncAssociation(ctx, tx, casinoLicenseAssoc, c.ID, *licenseIDs); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (r *CasinoRepo) attachAssociations(ctx context.Context, c *domain.Casino) error {
	ids, err := r.associationIDs(ctx, casinoRegionAssoc, c.ID)
	if err != nil {
		return err
	}
	c.RegionIDs = ids

	providerIDs, err := r.associationIDs(ctx, casinoGameProviderAssoc, c.ID)
	if err != nil {
		return err
	}
	c.GameProviderIDs = providerIDs

	licenseIDs, err := r.associationIDs(ctx, casinoLicenseAssoc, c.ID)
	if err != nil {
		return err
	}
	c.LicenseIDs = licenseIDs
	return nil
}

// attachAssociationBatch fills in one association (region/game
// provider/license) for a whole page of results with a single extra query
// (`casino_id IN (...)`) instead of one query per row.
func (r *CasinoRepo) attachAssociationBatch(
	ctx context.Context, a casinoAssociation, inClause string, args []any,
	byID map[int64]*domain.Casino, assign func(c *domain.Casino, id int64),
) error {
	rows, err := r.db.QueryContext(ctx,
		`SELECT casino_id, `+a.column+` FROM `+a.table+` WHERE casino_id IN (`+inClause+`)`, args...,
	)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var casinoID, entityID int64
		if err := rows.Scan(&casinoID, &entityID); err != nil {
			return err
		}
		if c, ok := byID[casinoID]; ok {
			assign(c, entityID)
		}
	}
	return rows.Err()
}

// attachAssociationsBatch fills in RegionIDs, GameProviderIDs, and
// LicenseIDs for a page of results with three extra queries instead of
// one-per-row, for list endpoints.
func (r *CasinoRepo) attachAssociationsBatch(ctx context.Context, items []domain.Casino) error {
	if len(items) == 0 {
		return nil
	}
	placeholders := make([]string, len(items))
	args := make([]any, len(items))
	byID := make(map[int64]*domain.Casino, len(items))
	for i := range items {
		placeholders[i] = "?"
		args[i] = items[i].ID
		byID[items[i].ID] = &items[i]
	}
	inClause := strings.Join(placeholders, ",")

	if err := r.attachAssociationBatch(ctx, casinoRegionAssoc, inClause, args, byID, func(c *domain.Casino, id int64) {
		c.RegionIDs = append(c.RegionIDs, id)
	}); err != nil {
		return err
	}
	if err := r.attachAssociationBatch(ctx, casinoGameProviderAssoc, inClause, args, byID, func(c *domain.Casino, id int64) {
		c.GameProviderIDs = append(c.GameProviderIDs, id)
	}); err != nil {
		return err
	}
	return r.attachAssociationBatch(ctx, casinoLicenseAssoc, inClause, args, byID, func(c *domain.Casino, id int64) {
		c.LicenseIDs = append(c.LicenseIDs, id)
	})
}

func (r *CasinoRepo) GetByID(ctx context.Context, id int64) (*domain.Casino, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+casinoColumns+` FROM `+casinoFromClause+` WHERE casinos.id = ?`, id)
	c, err := scanCasino(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return c, r.attachAssociations(ctx, c)
}

// GetPublishedBySlug is the public website's read for a single casino review
// page — 404s (via ErrNotFound) if it exists but isn't effectively published.
func (r *CasinoRepo) GetPublishedBySlug(ctx context.Context, slug string) (*domain.Casino, error) {
	row := r.db.QueryRowContext(ctx,
		`SELECT `+casinoColumns+` FROM `+casinoFromClause+` WHERE casinos.slug = ? AND `+EffectivelyPublishedSQL, slug,
	)
	c, err := scanCasino(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return c, r.attachAssociations(ctx, c)
}

func (r *CasinoRepo) ExistsSlug(ctx context.Context, slug string, excludeID int64) (bool, error) {
	var count int
	err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM casinos WHERE slug = ? AND id != ?`, slug, excludeID).Scan(&count)
	return count > 0, err
}

// ListAdmin returns every casino regardless of status, for the dashboard.
func (r *CasinoRepo) ListAdmin(ctx context.Context, limit, offset int) ([]domain.Casino, int, error) {
	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM casinos`).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.QueryContext(ctx,
		`SELECT `+casinoColumns+` FROM `+casinoFromClause+` ORDER BY casinos.updated_at DESC LIMIT ? OFFSET ?`, limit, offset,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var items []domain.Casino
	for rows.Next() {
		c, err := scanCasino(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, *c)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, err
	}
	return items, total, r.attachAssociationsBatch(ctx, items)
}

// ListPublished is the public website's listing (e.g. /sg — casinos serving
// Singapore), optionally filtered by region code and/or a single supported
// game type (the Reviews page's "choose by playing style" filter).
func (r *CasinoRepo) ListPublished(ctx context.Context, regionCode *string, gameType *string, limit, offset int) ([]domain.Casino, int, error) {
	joinClause := ""
	whereRegion := ""
	whereGameType := ""
	args := []any{}
	if regionCode != nil {
		joinClause = `JOIN casino_regions cr ON cr.casino_id = c.id JOIN regions rg ON rg.id = cr.region_id`
		whereRegion = `AND rg.code = ?`
		args = append(args, *regionCode)
	}
	if gameType != nil {
		whereGameType = `AND JSON_CONTAINS(c.supported_games, JSON_QUOTE(?))`
		args = append(args, *gameType)
	}

	countQuery := `SELECT COUNT(DISTINCT c.id) FROM casinos c ` + joinClause + ` WHERE ` + EffectivelyPublishedSQL +
		` ` + whereRegion + ` ` + whereGameType
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	listQuery := `SELECT ` + casinoColumnsPrefixed + ` FROM ` + casinoFromClausePrefixed + ` ` + joinClause +
		` WHERE ` + EffectivelyPublishedSQL + ` ` + whereRegion + ` ` + whereGameType +
		` ORDER BY c.rating DESC LIMIT ? OFFSET ?`
	rows, err := r.db.QueryContext(ctx, listQuery, append(args, limit, offset)...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var items []domain.Casino
	for rows.Next() {
		c, err := scanCasino(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, *c)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, err
	}
	return items, total, r.attachAssociationsBatch(ctx, items)
}

func (r *CasinoRepo) SetStatus(ctx context.Context, id int64, status domain.ContentStatus, publishAt *string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE casinos SET status = ?, publish_at = ? WHERE id = ?`, status, publishAt, id)
	return err
}

func (r *CasinoRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM casinos WHERE id = ?`, id)
	return err
}

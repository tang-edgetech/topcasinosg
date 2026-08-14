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

const casinoColumns = `id, slug, name, logo_media_id, rating, summary, content, languages, payment_methods,
	pros, cons, safe_index, risk_status, supported_games, payout_speed, cta_url, status, publish_at, created_by,
	created_at, updated_at`

// Same columns, prefixed for queries that JOIN casinos against another
// table (region filtering) where an unqualified column name would be
// ambiguous.
const casinoColumnsPrefixed = `c.id, c.slug, c.name, c.logo_media_id, c.rating, c.summary, c.content, c.languages,
	c.payment_methods, c.pros, c.cons, c.safe_index, c.risk_status, c.supported_games, c.payout_speed, c.cta_url,
	c.status, c.publish_at, c.created_by, c.created_at, c.updated_at`

func scanCasino(row interface{ Scan(...any) error }) (*domain.Casino, error) {
	var c domain.Casino
	var languagesJSON, paymentMethodsJSON, prosJSON, consJSON, supportedGamesJSON sql.NullString
	var riskStatus sql.NullString
	if err := row.Scan(
		&c.ID, &c.Slug, &c.Name, &c.LogoMediaID, &c.Rating, &c.Summary, &c.Content, &languagesJSON, &paymentMethodsJSON,
		&prosJSON, &consJSON, &c.SafeIndex, &riskStatus, &supportedGamesJSON, &c.PayoutSpeed, &c.CTAURL, &c.Status,
		&c.PublishAt, &c.CreatedBy, &c.CreatedAt, &c.UpdatedAt,
	); err != nil {
		return nil, err
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

func (r *CasinoRepo) syncRegions(ctx context.Context, tx *sql.Tx, casinoID int64, regionIDs []int64) error {
	if _, err := tx.ExecContext(ctx, `DELETE FROM casino_regions WHERE casino_id = ?`, casinoID); err != nil {
		return err
	}
	for _, regionID := range regionIDs {
		if _, err := tx.ExecContext(ctx,
			`INSERT INTO casino_regions (casino_id, region_id) VALUES (?, ?)`, casinoID, regionID,
		); err != nil {
			return err
		}
	}
	return nil
}

func (r *CasinoRepo) gameProviderIDs(ctx context.Context, casinoID int64) ([]int64, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT game_provider_id FROM casino_game_providers WHERE casino_id = ?`, casinoID)
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

func (r *CasinoRepo) syncGameProviders(ctx context.Context, tx *sql.Tx, casinoID int64, providerIDs []int64) error {
	if _, err := tx.ExecContext(ctx, `DELETE FROM casino_game_providers WHERE casino_id = ?`, casinoID); err != nil {
		return err
	}
	for _, providerID := range providerIDs {
		if _, err := tx.ExecContext(ctx,
			`INSERT INTO casino_game_providers (casino_id, game_provider_id) VALUES (?, ?)`, casinoID, providerID,
		); err != nil {
			return err
		}
	}
	return nil
}

func (r *CasinoRepo) licenseIDs(ctx context.Context, casinoID int64) ([]int64, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT license_id FROM casino_licenses WHERE casino_id = ?`, casinoID)
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

func (r *CasinoRepo) syncLicenses(ctx context.Context, tx *sql.Tx, casinoID int64, licenseIDs []int64) error {
	if _, err := tx.ExecContext(ctx, `DELETE FROM casino_licenses WHERE casino_id = ?`, casinoID); err != nil {
		return err
	}
	for _, licenseID := range licenseIDs {
		if _, err := tx.ExecContext(ctx,
			`INSERT INTO casino_licenses (casino_id, license_id) VALUES (?, ?)`, casinoID, licenseID,
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
	if err := r.syncRegions(ctx, tx, id, c.RegionIDs); err != nil {
		return 0, err
	}
	if err := r.syncGameProviders(ctx, tx, id, c.GameProviderIDs); err != nil {
		return 0, err
	}
	if err := r.syncLicenses(ctx, tx, id, c.LicenseIDs); err != nil {
		return 0, err
	}
	return id, tx.Commit()
}

func (r *CasinoRepo) Update(ctx context.Context, c *domain.Casino) error {
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
	if err := r.syncRegions(ctx, tx, c.ID, c.RegionIDs); err != nil {
		return err
	}
	if err := r.syncGameProviders(ctx, tx, c.ID, c.GameProviderIDs); err != nil {
		return err
	}
	if err := r.syncLicenses(ctx, tx, c.ID, c.LicenseIDs); err != nil {
		return err
	}
	return tx.Commit()
}

func (r *CasinoRepo) attachAssociations(ctx context.Context, c *domain.Casino) error {
	ids, err := r.regionIDs(ctx, c.ID)
	if err != nil {
		return err
	}
	c.RegionIDs = ids

	providerIDs, err := r.gameProviderIDs(ctx, c.ID)
	if err != nil {
		return err
	}
	c.GameProviderIDs = providerIDs

	licenseIDs, err := r.licenseIDs(ctx, c.ID)
	if err != nil {
		return err
	}
	c.LicenseIDs = licenseIDs
	return nil
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

	regionRows, err := r.db.QueryContext(ctx,
		`SELECT casino_id, region_id FROM casino_regions WHERE casino_id IN (`+inClause+`)`, args...,
	)
	if err != nil {
		return err
	}
	defer regionRows.Close()
	for regionRows.Next() {
		var casinoID, regionID int64
		if err := regionRows.Scan(&casinoID, &regionID); err != nil {
			return err
		}
		if c, ok := byID[casinoID]; ok {
			c.RegionIDs = append(c.RegionIDs, regionID)
		}
	}
	if err := regionRows.Err(); err != nil {
		return err
	}

	providerRows, err := r.db.QueryContext(ctx,
		`SELECT casino_id, game_provider_id FROM casino_game_providers WHERE casino_id IN (`+inClause+`)`, args...,
	)
	if err != nil {
		return err
	}
	defer providerRows.Close()
	for providerRows.Next() {
		var casinoID, providerID int64
		if err := providerRows.Scan(&casinoID, &providerID); err != nil {
			return err
		}
		if c, ok := byID[casinoID]; ok {
			c.GameProviderIDs = append(c.GameProviderIDs, providerID)
		}
	}
	if err := providerRows.Err(); err != nil {
		return err
	}

	licenseRows, err := r.db.QueryContext(ctx,
		`SELECT casino_id, license_id FROM casino_licenses WHERE casino_id IN (`+inClause+`)`, args...,
	)
	if err != nil {
		return err
	}
	defer licenseRows.Close()
	for licenseRows.Next() {
		var casinoID, licenseID int64
		if err := licenseRows.Scan(&casinoID, &licenseID); err != nil {
			return err
		}
		if c, ok := byID[casinoID]; ok {
			c.LicenseIDs = append(c.LicenseIDs, licenseID)
		}
	}
	return licenseRows.Err()
}

func (r *CasinoRepo) GetByID(ctx context.Context, id int64) (*domain.Casino, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+casinoColumns+` FROM casinos WHERE id = ?`, id)
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
		`SELECT `+casinoColumns+` FROM casinos WHERE slug = ? AND `+EffectivelyPublishedSQL, slug,
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
		`SELECT `+casinoColumns+` FROM casinos ORDER BY updated_at DESC LIMIT ? OFFSET ?`, limit, offset,
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
// Singapore), optionally filtered by region code.
func (r *CasinoRepo) ListPublished(ctx context.Context, regionCode *string, limit, offset int) ([]domain.Casino, int, error) {
	joinClause := ""
	whereRegion := ""
	args := []any{}
	if regionCode != nil {
		joinClause = `JOIN casino_regions cr ON cr.casino_id = c.id JOIN regions rg ON rg.id = cr.region_id`
		whereRegion = `AND rg.code = ?`
		args = append(args, *regionCode)
	}

	countQuery := `SELECT COUNT(DISTINCT c.id) FROM casinos c ` + joinClause + ` WHERE ` + EffectivelyPublishedSQL + ` ` + whereRegion
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	listQuery := `SELECT ` + casinoColumnsPrefixed + ` FROM casinos c ` + joinClause +
		` WHERE ` + EffectivelyPublishedSQL + ` ` + whereRegion + ` ORDER BY c.rating DESC LIMIT ? OFFSET ?`
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

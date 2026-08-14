package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type GameProviderRepo struct {
	db *sql.DB
}

func NewGameProviderRepo(db *sql.DB) *GameProviderRepo {
	return &GameProviderRepo{db: db}
}

const gameProviderColumns = `game_providers.id, game_providers.name, game_providers.logo_media_id, media.url,
	game_providers.sort_order, game_providers.created_at, game_providers.updated_at`
const gameProviderFromClause = `game_providers LEFT JOIN media ON media.id = game_providers.logo_media_id`

func scanGameProvider(row interface{ Scan(...any) error }) (*domain.GameProvider, error) {
	var p domain.GameProvider
	if err := row.Scan(&p.ID, &p.Name, &p.LogoMediaID, &p.LogoURL, &p.SortOrder, &p.CreatedAt, &p.UpdatedAt); err != nil {
		return nil, err
	}
	return &p, nil
}

// List returns every game provider, for both the admin dashboard and the
// public website — there's no draft/active distinction for this entity.
func (r *GameProviderRepo) List(ctx context.Context) ([]domain.GameProvider, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT `+gameProviderColumns+` FROM `+gameProviderFromClause+` ORDER BY game_providers.sort_order, game_providers.name`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var providers []domain.GameProvider
	for rows.Next() {
		p, err := scanGameProvider(rows)
		if err != nil {
			return nil, err
		}
		providers = append(providers, *p)
	}
	return providers, rows.Err()
}

func (r *GameProviderRepo) GetByID(ctx context.Context, id int64) (*domain.GameProvider, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+gameProviderColumns+` FROM `+gameProviderFromClause+` WHERE game_providers.id = ?`, id)
	p, err := scanGameProvider(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return p, err
}

func (r *GameProviderRepo) Create(ctx context.Context, p *domain.GameProvider) (int64, error) {
	res, err := r.db.ExecContext(ctx,
		`INSERT INTO game_providers (name, logo_media_id, sort_order) VALUES (?, ?, ?)`,
		p.Name, p.LogoMediaID, p.SortOrder,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *GameProviderRepo) Update(ctx context.Context, id int64, name string, logoMediaID *int64, sortOrder int) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE game_providers SET name = ?, logo_media_id = ?, sort_order = ? WHERE id = ?`, name, logoMediaID, sortOrder, id,
	)
	return err
}

func (r *GameProviderRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM game_providers WHERE id = ?`, id)
	return err
}

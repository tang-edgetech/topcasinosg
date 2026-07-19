package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type MediaRepo struct {
	db *sql.DB
}

func NewMediaRepo(db *sql.DB) *MediaRepo {
	return &MediaRepo{db: db}
}

const mediaColumns = `id, filename, original_filename, title, alt_text, description, mime_type, kind, file_size, url, uploaded_by, created_at`

func scanMedia(row interface{ Scan(...any) error }) (*domain.Media, error) {
	var m domain.Media
	var description sql.NullString
	if err := row.Scan(
		&m.ID, &m.Filename, &m.OriginalFilename, &m.Title, &m.AltText, &description, &m.MimeType, &m.Kind,
		&m.FileSize, &m.URL, &m.UploadedBy, &m.CreatedAt,
	); err != nil {
		return nil, err
	}
	m.Description = description.String
	return &m, nil
}

func (r *MediaRepo) Create(ctx context.Context, m *domain.Media) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
		INSERT INTO media (filename, original_filename, title, alt_text, description, mime_type, kind, file_size, url, uploaded_by)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		m.Filename, m.OriginalFilename, m.Title, m.AltText, m.Description, m.MimeType, m.Kind, m.FileSize, m.URL, m.UploadedBy,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *MediaRepo) GetByID(ctx context.Context, id int64) (*domain.Media, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+mediaColumns+` FROM media WHERE id = ?`, id)
	m, err := scanMedia(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return m, err
}

// List returns a page of media, newest first, optionally filtered by kind,
// plus the total count matching the filter (for pagination).
func (r *MediaRepo) List(ctx context.Context, kind *domain.MediaKind, limit, offset int) ([]domain.Media, int, error) {
	whereClause := ""
	args := []any{}
	if kind != nil {
		whereClause = "WHERE kind = ?"
		args = append(args, *kind)
	}

	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM media `+whereClause, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.QueryContext(ctx,
		`SELECT `+mediaColumns+` FROM media `+whereClause+` ORDER BY created_at DESC LIMIT ? OFFSET ?`,
		append(args, limit, offset)...,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var items []domain.Media
	for rows.Next() {
		m, err := scanMedia(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, *m)
	}
	return items, total, rows.Err()
}

func (r *MediaRepo) UpdateMetadata(ctx context.Context, id int64, title, altText, description string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE media SET title = ?, alt_text = ?, description = ? WHERE id = ?`, title, altText, description, id,
	)
	return err
}

func (r *MediaRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM media WHERE id = ?`, id)
	return err
}

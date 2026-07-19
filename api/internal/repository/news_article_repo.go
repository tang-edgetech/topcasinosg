package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type NewsArticleRepo struct {
	db *sql.DB
}

func NewNewsArticleRepo(db *sql.DB) *NewsArticleRepo {
	return &NewsArticleRepo{db: db}
}

const newsArticleColumns = `id, title, slug, cover_media_id, excerpt, content, status, publish_at,
	created_by, created_at, updated_at`

func scanNewsArticle(row interface{ Scan(...any) error }) (*domain.NewsArticle, error) {
	var n domain.NewsArticle
	if err := row.Scan(
		&n.ID, &n.Title, &n.Slug, &n.CoverMediaID, &n.Excerpt, &n.Content, &n.Status, &n.PublishAt,
		&n.CreatedBy, &n.CreatedAt, &n.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &n, nil
}

func (r *NewsArticleRepo) Create(ctx context.Context, n *domain.NewsArticle) (int64, error) {
	res, err := r.db.ExecContext(ctx, `
		INSERT INTO news_articles (title, slug, cover_media_id, excerpt, content, status, publish_at, created_by)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		n.Title, n.Slug, n.CoverMediaID, n.Excerpt, n.Content, n.Status, n.PublishAt, n.CreatedBy,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *NewsArticleRepo) Update(ctx context.Context, n *domain.NewsArticle) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE news_articles SET title = ?, slug = ?, cover_media_id = ?, excerpt = ?, content = ?
		WHERE id = ?`,
		n.Title, n.Slug, n.CoverMediaID, n.Excerpt, n.Content, n.ID,
	)
	return err
}

func (r *NewsArticleRepo) GetByID(ctx context.Context, id int64) (*domain.NewsArticle, error) {
	row := r.db.QueryRowContext(ctx, `SELECT `+newsArticleColumns+` FROM news_articles WHERE id = ?`, id)
	n, err := scanNewsArticle(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return n, err
}

// GetPublishedBySlug is the public website's read for a single news article
// page — 404s (via ErrNotFound) if it exists but isn't effectively published.
func (r *NewsArticleRepo) GetPublishedBySlug(ctx context.Context, slug string) (*domain.NewsArticle, error) {
	row := r.db.QueryRowContext(ctx,
		`SELECT `+newsArticleColumns+` FROM news_articles WHERE slug = ? AND `+EffectivelyPublishedSQL, slug,
	)
	n, err := scanNewsArticle(row)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return n, err
}

func (r *NewsArticleRepo) ExistsSlug(ctx context.Context, slug string, excludeID int64) (bool, error) {
	var count int
	err := r.db.QueryRowContext(ctx,
		`SELECT COUNT(*) FROM news_articles WHERE slug = ? AND id != ?`, slug, excludeID,
	).Scan(&count)
	return count > 0, err
}

// ListAdmin returns every news article regardless of status, for the dashboard.
func (r *NewsArticleRepo) ListAdmin(ctx context.Context, limit, offset int) ([]domain.NewsArticle, int, error) {
	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM news_articles`).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.db.QueryContext(ctx,
		`SELECT `+newsArticleColumns+` FROM news_articles ORDER BY created_at DESC LIMIT ? OFFSET ?`, limit, offset,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var items []domain.NewsArticle
	for rows.Next() {
		n, err := scanNewsArticle(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, *n)
	}
	return items, total, rows.Err()
}

// ListPublished is the public website's news listing.
func (r *NewsArticleRepo) ListPublished(ctx context.Context, limit, offset int) ([]domain.NewsArticle, int, error) {
	countQuery := `SELECT COUNT(*) FROM news_articles WHERE ` + EffectivelyPublishedSQL
	var total int
	if err := r.db.QueryRowContext(ctx, countQuery).Scan(&total); err != nil {
		return nil, 0, err
	}

	listQuery := `SELECT ` + newsArticleColumns + ` FROM news_articles WHERE ` + EffectivelyPublishedSQL +
		` ORDER BY created_at DESC LIMIT ? OFFSET ?`
	rows, err := r.db.QueryContext(ctx, listQuery, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var items []domain.NewsArticle
	for rows.Next() {
		n, err := scanNewsArticle(rows)
		if err != nil {
			return nil, 0, err
		}
		items = append(items, *n)
	}
	return items, total, rows.Err()
}

func (r *NewsArticleRepo) SetStatus(ctx context.Context, id int64, status domain.ContentStatus, publishAt *string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE news_articles SET status = ?, publish_at = ? WHERE id = ?`, status, publishAt, id)
	return err
}

func (r *NewsArticleRepo) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM news_articles WHERE id = ?`, id)
	return err
}

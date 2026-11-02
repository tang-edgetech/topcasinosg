package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type ContentChangeRepo struct {
	db *sql.DB
}

func NewContentChangeRepo(db *sql.DB) *ContentChangeRepo {
	return &ContentChangeRepo{db: db}
}

const contentChangeColumns = `c.id, c.api_key_id, c.api_key_name, c.content_type, c.action, c.target_id, c.label,
	COALESCE(c.note, ''), c.payload, c.base_hash, c.status, COALESCE(c.review_note, ''), c.reviewed_by,
	COALESCE(u.full_name, ''), c.reviewed_at, c.result_id, c.created_at`

const contentChangeFrom = ` FROM content_changes c LEFT JOIN admin_users u ON u.id = c.reviewed_by`

func scanContentChange(row interface{ Scan(...any) error }) (*domain.ContentChange, error) {
	var c domain.ContentChange
	if err := row.Scan(
		&c.ID, &c.APIKeyID, &c.APIKeyName, &c.ContentType, &c.Action, &c.TargetID, &c.Label,
		&c.Note, &c.Payload, &c.BaseHash, &c.Status, &c.ReviewNote, &c.ReviewedByID,
		&c.ReviewedByName, &c.ReviewedAt, &c.ResultID, &c.CreatedAt,
	); err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *ContentChangeRepo) Create(ctx context.Context, c *domain.ContentChange) (int64, error) {
	res, err := r.db.ExecContext(ctx,
		`INSERT INTO content_changes (api_key_id, api_key_name, content_type, action, target_id, label, note, payload, base_hash)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		c.APIKeyID, c.APIKeyName, c.ContentType, c.Action, c.TargetID, c.Label, c.Note, c.Payload, c.BaseHash,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *ContentChangeRepo) GetByID(ctx context.Context, id int64) (*domain.ContentChange, error) {
	c, err := scanContentChange(r.db.QueryRowContext(ctx, `SELECT `+contentChangeColumns+contentChangeFrom+` WHERE c.id = ?`, id))
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return c, err
}

// ContentChangeFilter narrows List: an empty Status means every status, a
// nil APIKeyID every key.
type ContentChangeFilter struct {
	Status   string
	APIKeyID *int64
	Limit    int
	Offset   int
}

// List returns changes newest first, with the total that match.
func (r *ContentChangeRepo) List(ctx context.Context, f ContentChangeFilter) ([]domain.ContentChange, int, error) {
	where := ` WHERE 1 = 1`
	var args []any
	if f.Status != "" {
		where += ` AND c.status = ?`
		args = append(args, f.Status)
	}
	if f.APIKeyID != nil {
		where += ` AND c.api_key_id = ?`
		args = append(args, *f.APIKeyID)
	}
	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM content_changes c`+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	rows, err := r.db.QueryContext(ctx,
		`SELECT `+contentChangeColumns+contentChangeFrom+where+` ORDER BY c.id DESC LIMIT ? OFFSET ?`,
		append(args, f.Limit, f.Offset)...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	var changes []domain.ContentChange
	for rows.Next() {
		c, err := scanContentChange(rows)
		if err != nil {
			return nil, 0, err
		}
		changes = append(changes, *c)
	}
	return changes, total, rows.Err()
}

func (r *ContentChangeRepo) CountPending(ctx context.Context) (int, error) {
	var n int
	err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM content_changes WHERE status = ?`, domain.ContentChangePending).Scan(&n)
	return n, err
}

// SetStatus moves a pending change to its final status. It reports
// ErrNotFound when the change is no longer pending, so two reviewers can't
// both act on it.
func (r *ContentChangeRepo) SetStatus(ctx context.Context, id int64, status, reviewNote string, reviewedBy, resultID *int64) error {
	res, err := r.db.ExecContext(ctx,
		`UPDATE content_changes SET status = ?, review_note = ?, reviewed_by = ?, reviewed_at = UTC_TIMESTAMP(), result_id = ?
		WHERE id = ? AND status = ?`,
		status, reviewNote, reviewedBy, resultID, id, domain.ContentChangePending,
	)
	if err != nil {
		return err
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return ErrNotFound
	}
	return nil
}

// Reopen puts an approved change back to pending, for when applying it
// failed after it was claimed with SetStatus.
func (r *ContentChangeRepo) Reopen(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE content_changes SET status = ?, review_note = NULL, reviewed_by = NULL, reviewed_at = NULL WHERE id = ?`,
		domain.ContentChangePending, id)
	return err
}

func (r *ContentChangeRepo) SetResult(ctx context.Context, id, resultID int64) error {
	_, err := r.db.ExecContext(ctx, `UPDATE content_changes SET result_id = ? WHERE id = ?`, resultID, id)
	return err
}

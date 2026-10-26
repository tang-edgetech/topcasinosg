package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"strings"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type AuditRepo struct {
	db *sql.DB
}

func NewAuditRepo(db *sql.DB) *AuditRepo {
	return &AuditRepo{db: db}
}

const auditColumns = `id, actor_id, actor_name, actor_role, action, entity_type, entity_id, entity_label,
	changes, restricted, ip_address, ip_port, user_agent, request_method, request_path, status_code, error_message, created_at`

func scanAuditLog(row interface{ Scan(...any) error }) (*domain.AuditLog, error) {
	var l domain.AuditLog
	var changesJSON sql.NullString
	var port sql.NullInt32
	if err := row.Scan(
		&l.ID, &l.ActorID, &l.ActorName, &l.ActorRole, &l.Action, &l.EntityType, &l.EntityID, &l.EntityLabel,
		&changesJSON, &l.Restricted, &l.IPAddress, &port, &l.UserAgent,
		&l.RequestMethod, &l.RequestPath, &l.StatusCode, &l.ErrorMessage, &l.CreatedAt,
	); err != nil {
		return nil, err
	}
	if port.Valid {
		value := int(port.Int32)
		l.IPPort = &value
	}
	if changesJSON.Valid && changesJSON.String != "" {
		_ = json.Unmarshal([]byte(changesJSON.String), &l.Changes)
	}
	return &l, nil
}

func (r *AuditRepo) Insert(ctx context.Context, l *domain.AuditLog) error {
	var changes any
	if len(l.Changes) > 0 {
		encoded, err := json.Marshal(l.Changes)
		if err != nil {
			return err
		}
		changes = string(encoded)
	}
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO audit_logs (actor_id, actor_name, actor_role, action, entity_type, entity_id, entity_label,
			changes, restricted, ip_address, ip_port, user_agent, request_method, request_path, status_code, error_message, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		l.ActorID, l.ActorName, l.ActorRole, l.Action, l.EntityType, l.EntityID, l.EntityLabel,
		changes, l.Restricted, l.IPAddress, l.IPPort, l.UserAgent, l.RequestMethod, l.RequestPath, l.StatusCode, l.ErrorMessage, time.Now().UTC(),
	)
	return err
}

func auditVisibilityWhere(includeRestricted bool, onlyActorID *int64) ([]string, []any) {
	var where []string
	var args []any
	if !includeRestricted {
		where = append(where, "restricted = FALSE")
	}
	if onlyActorID != nil {
		where = append(where, "actor_id = ?")
		args = append(args, *onlyActorID)
	}
	return where, args
}

func (r *AuditRepo) List(ctx context.Context, f domain.AuditFilter) ([]domain.AuditLog, int, error) {
	where, args := auditVisibilityWhere(f.IncludeRestricted, f.OnlyActorID)
	if f.ActorID != nil {
		where = append(where, "actor_id = ?")
		args = append(args, *f.ActorID)
	}
	if f.EntityType != "" {
		where = append(where, "(entity_type = ? OR entity_type LIKE ?)")
		args = append(args, f.EntityType, f.EntityType+"/%")
	}
	if f.Action != "" {
		where = append(where, "action = ?")
		args = append(args, f.Action)
	}
	if f.ErrorsOnly {
		where = append(where, "status_code >= 400")
	}
	if f.From != nil {
		where = append(where, "created_at >= ?")
		args = append(args, f.From.UTC())
	}
	if f.To != nil {
		where = append(where, "created_at < ?")
		args = append(args, f.To.UTC())
	}
	whereClause := ""
	if len(where) > 0 {
		whereClause = " WHERE " + strings.Join(where, " AND ")
	}

	var total int
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM audit_logs`+whereClause, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	offset := (f.Page - 1) * f.PageSize
	rows, err := r.db.QueryContext(ctx,
		`SELECT `+auditColumns+` FROM audit_logs`+whereClause+` ORDER BY id DESC LIMIT ? OFFSET ?`,
		append(args, f.PageSize, offset)...,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var logs []domain.AuditLog
	for rows.Next() {
		l, err := scanAuditLog(rows)
		if err != nil {
			return nil, 0, err
		}
		logs = append(logs, *l)
	}
	return logs, total, rows.Err()
}

// ListActors returns everyone who appears in the entries the viewer may see,
// for the Activity Log's "User" filter — named as they were when they acted.
func (r *AuditRepo) ListActors(ctx context.Context, includeRestricted bool, onlyActorID *int64) ([]domain.AuditActor, error) {
	where, args := auditVisibilityWhere(includeRestricted, onlyActorID)
	where = append(where, "actor_id IS NOT NULL")
	rows, err := r.db.QueryContext(ctx,
		`SELECT actor_id, MAX(actor_name) FROM audit_logs WHERE `+strings.Join(where, " AND ")+
			` GROUP BY actor_id ORDER BY MAX(actor_name)`,
		args...,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var actors []domain.AuditActor
	for rows.Next() {
		var a domain.AuditActor
		if err := rows.Scan(&a.ID, &a.Name); err != nil {
			return nil, err
		}
		actors = append(actors, a)
	}
	return actors, rows.Err()
}

func (r *AuditRepo) DeleteOlderThan(ctx context.Context, cutoff time.Time) (int64, error) {
	res, err := r.db.ExecContext(ctx, `DELETE FROM audit_logs WHERE created_at < ?`, cutoff.UTC())
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

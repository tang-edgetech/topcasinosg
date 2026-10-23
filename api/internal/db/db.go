// Package db owns the MySQL connection and runs embedded SQL migrations on boot.
package db

import (
	"database/sql"
	"embed"
	"fmt"
	"io/fs"
	"log"
	"sort"
	"strings"
	"time"

	"github.com/go-sql-driver/mysql"
)

//go:embed migrations/*.sql
var migrationFiles embed.FS

// legacyDataFixMarker opens a migration that only corrects data written by
// older releases. A brand-new database never held that data, so there the
// migration is recorded as applied without running.
const legacyDataFixMarker = "-- legacy-data-fix"

// defaultMaxIdleConns is database/sql's own default, restored once migrations
// are done.
const defaultMaxIdleConns = 2

// utcSessionTimeZone pins every connection to UTC, so DB-generated times
// (DEFAULT CURRENT_TIMESTAMP, NOW()) match the UTC times the API writes and
// reads, whatever time zone the MySQL server itself runs in.
const utcSessionTimeZone = "'+00:00'"

// Open connects with the session time zone forced to UTC on top of the
// configured DSN, so a deployment can't accidentally run on server-local time.
func Open(dsn string) (*sql.DB, error) {
	cfg, err := mysql.ParseDSN(dsn)
	if err != nil {
		return nil, fmt.Errorf("parse mysql dsn: %w", err)
	}
	if cfg.Params == nil {
		cfg.Params = map[string]string{}
	}
	cfg.Params["time_zone"] = utcSessionTimeZone
	cfg.Loc = time.UTC
	cfg.ParseTime = true

	conn, err := sql.Open("mysql", cfg.FormatDSN())
	if err != nil {
		return nil, fmt.Errorf("open mysql: %w", err)
	}
	if err := conn.Ping(); err != nil {
		return nil, fmt.Errorf("ping mysql: %w", err)
	}
	return conn, nil
}

// Migrate applies every embedded migration that isn't already recorded in
// schema_migrations, in filename order. Migrations are plain SQL, not
// reversible — this project favors additive changes over down-migrations.
func Migrate(conn *sql.DB) error {
	// Each migration must start from a clean MySQL session: content seeds read
	// LAST_INSERT_ID() and @variables, and a pooled connection would carry
	// the previous migration's values over (an empty database then failed at
	// 0034, whose guarded INSERT was skipped but LAST_INSERT_ID() was stale).
	// With no idle connections kept, every statement below gets a new session.
	conn.SetMaxIdleConns(0)
	defer conn.SetMaxIdleConns(defaultMaxIdleConns)

	if _, err := conn.Exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
		filename VARCHAR(255) NOT NULL PRIMARY KEY,
		applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
	) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4`); err != nil {
		return fmt.Errorf("create schema_migrations: %w", err)
	}

	entries, err := fs.ReadDir(migrationFiles, "migrations")
	if err != nil {
		return fmt.Errorf("read migrations dir: %w", err)
	}
	names := make([]string, 0, len(entries))
	for _, e := range entries {
		names = append(names, e.Name())
	}
	sort.Strings(names)

	var previouslyApplied int
	if err := conn.QueryRow(`SELECT COUNT(*) FROM schema_migrations`).Scan(&previouslyApplied); err != nil {
		return fmt.Errorf("count applied migrations: %w", err)
	}
	isNewDatabase := previouslyApplied == 0

	for _, name := range names {
		var alreadyApplied int
		if err := conn.QueryRow(`SELECT COUNT(*) FROM schema_migrations WHERE filename = ?`, name).Scan(&alreadyApplied); err != nil {
			return fmt.Errorf("check migration %s: %w", name, err)
		}
		if alreadyApplied > 0 {
			continue
		}

		contents, err := migrationFiles.ReadFile("migrations/" + name)
		if err != nil {
			return fmt.Errorf("read migration %s: %w", name, err)
		}

		if isNewDatabase && strings.HasPrefix(strings.TrimSpace(string(contents)), legacyDataFixMarker) {
			log.Printf("db: skipping %s on a new database (nothing to fix)", name)
		} else if _, err := conn.Exec(string(contents)); err != nil {
			return fmt.Errorf("apply migration %s: %w", name, err)
		}
		if _, err := conn.Exec(`INSERT INTO schema_migrations (filename) VALUES (?)`, name); err != nil {
			return fmt.Errorf("record migration %s: %w", name, err)
		}
		log.Printf("db: applied migration %s", name)
	}

	return nil
}

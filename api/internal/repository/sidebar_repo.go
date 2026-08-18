package repository

import (
	"context"
	"database/sql"
	"sort"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

type SidebarRepo struct {
	db *sql.DB
}

func NewSidebarRepo(db *sql.DB) *SidebarRepo {
	return &SidebarRepo{db: db}
}

// GetAll returns all 3 sidebar sections (in sort_order) with their links
// (in sort_order) attached.
func (r *SidebarRepo) GetAll(ctx context.Context) ([]domain.SidebarSection, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT id, section_key, heading, sort_order, created_at, updated_at
			FROM sidebar_sections ORDER BY sort_order`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sections []domain.SidebarSection
	byID := make(map[int64]*domain.SidebarSection)
	for rows.Next() {
		var s domain.SidebarSection
		if err := rows.Scan(&s.ID, &s.Key, &s.Heading, &s.SortOrder, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		sections = append(sections, s)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	for i := range sections {
		byID[sections[i].ID] = &sections[i]
	}

	linkRows, err := r.db.QueryContext(ctx,
		`SELECT id, section_id, label, url, has_dropdown, sort_order FROM sidebar_links ORDER BY section_id, sort_order`,
	)
	if err != nil {
		return nil, err
	}
	defer linkRows.Close()

	for linkRows.Next() {
		var l domain.SidebarLink
		if err := linkRows.Scan(&l.ID, &l.SectionID, &l.Label, &l.URL, &l.HasDropdown, &l.SortOrder); err != nil {
			return nil, err
		}
		if s, ok := byID[l.SectionID]; ok {
			s.Links = append(s.Links, l)
		}
	}
	return sections, linkRows.Err()
}

// ReplaceAll updates every section's heading and fully replaces its links —
// same one-transaction full-replace convention as PageRepo.ReplaceSections
// (section IDs are fixed/pre-seeded, only their heading + links change).
func (r *SidebarRepo) ReplaceAll(ctx context.Context, sections []domain.SidebarSection) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	sort.SliceStable(sections, func(i, j int) bool { return sections[i].SortOrder < sections[j].SortOrder })
	for _, section := range sections {
		if _, err := tx.ExecContext(ctx,
			`UPDATE sidebar_sections SET heading = ? WHERE id = ?`, section.Heading, section.ID,
		); err != nil {
			return err
		}
		if _, err := tx.ExecContext(ctx, `DELETE FROM sidebar_links WHERE section_id = ?`, section.ID); err != nil {
			return err
		}
		sort.SliceStable(section.Links, func(i, j int) bool { return section.Links[i].SortOrder < section.Links[j].SortOrder })
		for _, link := range section.Links {
			if _, err := tx.ExecContext(ctx,
				`INSERT INTO sidebar_links (section_id, label, url, has_dropdown, sort_order) VALUES (?, ?, ?, ?, ?)`,
				section.ID, link.Label, link.URL, link.HasDropdown, link.SortOrder,
			); err != nil {
				return err
			}
		}
	}
	return tx.Commit()
}

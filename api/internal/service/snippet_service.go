package service

import (
	"context"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

// SnippetService manages both Snippets tabs — "Header & Footer" (kind
// global, unconditional) and "Code" (kind code, typed/prioritized/
// conditionally targeted). Every route that reaches this service is already
// behind superAdminOnly at the router (see server.go) — raw script
// injection is the most sensitive capability in this app, same tier as
// logo/favicon/2FA in Settings, and that applies equally to both kinds.
type SnippetService struct {
	snippets *repository.SnippetRepo
}

func NewSnippetService(snippets *repository.SnippetRepo) *SnippetService {
	return &SnippetService{snippets: snippets}
}

func (s *SnippetService) List(ctx context.Context) ([]domain.SiteSnippet, error) {
	return s.snippets.List(ctx)
}

func (s *SnippetService) GetByID(ctx context.Context, id int64) (*domain.SiteSnippet, error) {
	return s.snippets.GetByID(ctx, id)
}

func (s *SnippetService) ListMatchingGrouped(ctx context.Context, path string) (map[domain.SnippetLocation][]string, error) {
	return s.snippets.ListMatchingGrouped(ctx, path)
}

type ConditionInput struct {
	Field     domain.ConditionField
	Operator  domain.ConditionOperator
	PageID    *int64
	Value     string
	SortOrder int
}

type SnippetInput struct {
	Name       string
	Kind       domain.SnippetKind
	CodeType   *domain.CodeType
	Location   domain.SnippetLocation
	Content    string
	SortOrder  int
	Priority   int
	Conditions []ConditionInput
}

// validate checks everything up front — an invalid kind/codeType/priority/
// condition fails the whole save rather than silently persisting a snippet
// the public renderer or admin editor won't know how to handle. Same
// validate-then-write shape as PageService.ReplaceSections.
func (in SnippetInput) validate() error {
	if !in.Kind.Valid() {
		return ErrInvalidSnippetKind
	}
	if !in.Location.Valid() {
		return ErrInvalidSnippetLocation
	}
	if in.Kind == domain.SnippetKindCode {
		if in.CodeType == nil || !in.CodeType.Valid() {
			return ErrInvalidCodeType
		}
		if in.Priority < 0 || in.Priority > 100 {
			return ErrInvalidSnippetPriority
		}
		for _, c := range in.Conditions {
			if !(domain.SnippetCondition{Field: c.Field, Operator: c.Operator}).Valid() {
				return ErrInvalidSnippetCondition
			}
			if c.Field == domain.ConditionFieldPage && c.PageID == nil {
				return ErrInvalidSnippetCondition
			}
			if c.Field == domain.ConditionFieldURL && c.Value == "" {
				return ErrInvalidSnippetCondition
			}
		}
	} else if in.CodeType != nil {
		return ErrInvalidCodeType
	}
	return nil
}

func toDomainConditions(in []ConditionInput) []domain.SnippetCondition {
	conditions := make([]domain.SnippetCondition, len(in))
	for i, c := range in {
		conditions[i] = domain.SnippetCondition{
			Field: c.Field, Operator: c.Operator, PageID: c.PageID, Value: c.Value, SortOrder: c.SortOrder,
		}
	}
	return conditions
}

func (s *SnippetService) Create(ctx context.Context, in SnippetInput) (*domain.SiteSnippet, error) {
	if err := in.validate(); err != nil {
		return nil, err
	}
	id, err := s.snippets.Create(ctx, &domain.SiteSnippet{
		Name: in.Name, Kind: in.Kind, CodeType: in.CodeType, Location: in.Location, Content: in.Content,
		IsActive: true, SortOrder: in.SortOrder, Priority: in.Priority, Conditions: toDomainConditions(in.Conditions),
	})
	if err != nil {
		return nil, err
	}
	return s.snippets.GetByID(ctx, id)
}

func (s *SnippetService) Update(ctx context.Context, id int64, in SnippetInput) error {
	if err := in.validate(); err != nil {
		return err
	}
	existing, err := s.snippets.GetByID(ctx, id)
	if err != nil {
		return err
	}
	return s.snippets.Update(ctx, id, &domain.SiteSnippet{
		Name: in.Name, Kind: in.Kind, CodeType: in.CodeType, Location: in.Location, Content: in.Content,
		IsActive: existing.IsActive, SortOrder: in.SortOrder, Priority: in.Priority, Conditions: toDomainConditions(in.Conditions),
	})
}

func (s *SnippetService) SetActive(ctx context.Context, id int64, active bool) error {
	return s.snippets.SetActive(ctx, id, active)
}

func (s *SnippetService) Delete(ctx context.Context, id int64) error {
	return s.snippets.Delete(ctx, id)
}

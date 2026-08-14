package service

import (
	"context"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

// CasinoService — any content-management role (including Editor) may
// create/edit, matching "Editor: add/edit/delete contents".
type CasinoService struct {
	casinos *repository.CasinoRepo
}

func NewCasinoService(casinos *repository.CasinoRepo) *CasinoService {
	return &CasinoService{casinos: casinos}
}

type CasinoInput struct {
	Slug           string
	Name           string
	LogoMediaID    *int64
	Rating         float64
	Summary        string
	Content        string
	Languages      []string
	PaymentMethods []string
	Pros           []string
	Cons           []string
	SafeIndex      *int
	RiskStatus     *domain.RiskStatus
	SupportedGames []string
	PayoutSpeed     string
	CTAURL          string
	RegionIDs       []int64
	// GameProviderIDs/LicenseIDs are pointers so Update can tell "omitted by
	// the caller" (nil — leave existing associations alone) apart from
	// "explicitly set to an empty list" ([]int64{} — clear them). RegionIDs
	// stays a plain slice since a casino is required to belong to at least
	// one region, so it is always fully replaced on Update.
	GameProviderIDs *[]int64
	LicenseIDs      *[]int64
}

func validateSafeIndexAndRisk(safeIndex *int, riskStatus *domain.RiskStatus) error {
	if safeIndex != nil && (*safeIndex < 0 || *safeIndex > 100) {
		return ErrInvalidSafeIndex
	}
	if riskStatus != nil && !riskStatus.Valid() {
		return ErrInvalidRiskStatus
	}
	return nil
}

func validateSupportedGames(games []string) error {
	for _, g := range games {
		if !domain.GameType(g).Valid() {
			return ErrInvalidGameType
		}
	}
	return nil
}

func (s *CasinoService) Create(ctx context.Context, actor *domain.AdminUser, in CasinoInput) (*domain.Casino, error) {
	if err := validateSafeIndexAndRisk(in.SafeIndex, in.RiskStatus); err != nil {
		return nil, err
	}
	if err := validateSupportedGames(in.SupportedGames); err != nil {
		return nil, err
	}
	exists, err := s.casinos.ExistsSlug(ctx, in.Slug, 0)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrAlreadyExists
	}

	actorID := actor.ID
	c := &domain.Casino{
		Slug: in.Slug, Name: in.Name, LogoMediaID: in.LogoMediaID, Rating: in.Rating, Summary: in.Summary,
		Content: in.Content, Languages: in.Languages, PaymentMethods: in.PaymentMethods, Pros: in.Pros, Cons: in.Cons,
		SafeIndex: in.SafeIndex, RiskStatus: in.RiskStatus, SupportedGames: in.SupportedGames,
		PayoutSpeed: in.PayoutSpeed, CTAURL: in.CTAURL, Status: domain.ContentStatusDraft, CreatedBy: &actorID,
		RegionIDs: in.RegionIDs, GameProviderIDs: derefIDs(in.GameProviderIDs), LicenseIDs: derefIDs(in.LicenseIDs),
	}
	id, err := s.casinos.Create(ctx, c)
	if err != nil {
		return nil, err
	}
	return s.casinos.GetByID(ctx, id)
}

func (s *CasinoService) Update(ctx context.Context, id int64, in CasinoInput) error {
	if err := validateSafeIndexAndRisk(in.SafeIndex, in.RiskStatus); err != nil {
		return err
	}
	if err := validateSupportedGames(in.SupportedGames); err != nil {
		return err
	}
	exists, err := s.casinos.ExistsSlug(ctx, in.Slug, id)
	if err != nil {
		return err
	}
	if exists {
		return ErrAlreadyExists
	}
	return s.casinos.Update(ctx, &domain.Casino{
		ID: id, Slug: in.Slug, Name: in.Name, LogoMediaID: in.LogoMediaID, Rating: in.Rating, Summary: in.Summary,
		Content: in.Content, Languages: in.Languages, PaymentMethods: in.PaymentMethods, Pros: in.Pros, Cons: in.Cons,
		SafeIndex: in.SafeIndex, RiskStatus: in.RiskStatus, SupportedGames: in.SupportedGames,
		PayoutSpeed: in.PayoutSpeed, CTAURL: in.CTAURL, RegionIDs: in.RegionIDs,
	}, in.GameProviderIDs, in.LicenseIDs)
}

// derefIDs returns an empty slice for a nil pointer — used only on Create,
// where there is no existing association to accidentally clear.
func derefIDs(p *[]int64) []int64 {
	if p == nil {
		return nil
	}
	return *p
}

func (s *CasinoService) Get(ctx context.Context, id int64) (*domain.Casino, error) {
	return s.casinos.GetByID(ctx, id)
}

func (s *CasinoService) GetPublishedBySlug(ctx context.Context, slug string) (*domain.Casino, error) {
	return s.casinos.GetPublishedBySlug(ctx, slug)
}

func (s *CasinoService) ListAdmin(ctx context.Context, page, pageSize int) ([]domain.Casino, int, error) {
	page, pageSize = normalizePaging(page, pageSize)
	return s.casinos.ListAdmin(ctx, pageSize, (page-1)*pageSize)
}

func (s *CasinoService) ListPublished(ctx context.Context, regionCode *string, gameType *string, page, pageSize int) ([]domain.Casino, int, error) {
	page, pageSize = normalizePaging(page, pageSize)
	return s.casinos.ListPublished(ctx, regionCode, gameType, pageSize, (page-1)*pageSize)
}

func (s *CasinoService) SetStatus(ctx context.Context, id int64, status domain.ContentStatus, publishAt *time.Time) error {
	if !status.Valid() {
		return ErrInvalidContentStatus
	}
	if status == domain.ContentStatusScheduled && publishAt == nil {
		return ErrPublishAtRequired
	}
	var publishAtStr *string
	if publishAt != nil {
		s := publishAt.UTC().Format("2006-01-02 15:04:05")
		publishAtStr = &s
	}
	return s.casinos.SetStatus(ctx, id, status, publishAtStr)
}

func (s *CasinoService) Delete(ctx context.Context, id int64) error {
	return s.casinos.Delete(ctx, id)
}

package service

import (
	"context"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
)

// PaymentMethodService — any content-management role may create/edit
// (Editors included), same as Bonuses/Casinos.
type PaymentMethodService struct {
	paymentMethods *repository.PaymentMethodRepo
}

func NewPaymentMethodService(paymentMethods *repository.PaymentMethodRepo) *PaymentMethodService {
	return &PaymentMethodService{paymentMethods: paymentMethods}
}

type PaymentMethodInput struct {
	RegionID    int64
	Name        string
	Description string
	IconMediaID *int64
}

func (s *PaymentMethodService) Create(ctx context.Context, actor *domain.AdminUser, in PaymentMethodInput) (*domain.PaymentMethod, error) {
	actorID := actor.ID
	pm := &domain.PaymentMethod{
		RegionID: in.RegionID, Name: in.Name, Description: in.Description, IconMediaID: in.IconMediaID,
		Status: domain.ContentStatusDraft, CreatedBy: &actorID,
	}
	id, err := s.paymentMethods.Create(ctx, pm)
	if err != nil {
		return nil, err
	}
	return s.paymentMethods.GetByID(ctx, id)
}

func (s *PaymentMethodService) Update(ctx context.Context, id int64, in PaymentMethodInput) error {
	return s.paymentMethods.Update(ctx, &domain.PaymentMethod{
		ID: id, RegionID: in.RegionID, Name: in.Name, Description: in.Description, IconMediaID: in.IconMediaID,
	})
}

func (s *PaymentMethodService) Get(ctx context.Context, id int64) (*domain.PaymentMethod, error) {
	return s.paymentMethods.GetByID(ctx, id)
}

func (s *PaymentMethodService) ListAdmin(ctx context.Context, regionID *int64, page, pageSize int) ([]domain.PaymentMethod, int, error) {
	page, pageSize = normalizePaging(page, pageSize)
	return s.paymentMethods.ListAdmin(ctx, regionID, pageSize, (page-1)*pageSize)
}

func (s *PaymentMethodService) ListPublished(ctx context.Context, regionCode string, page, pageSize int) ([]domain.PaymentMethod, int, error) {
	page, pageSize = normalizePaging(page, pageSize)
	return s.paymentMethods.ListPublished(ctx, regionCode, pageSize, (page-1)*pageSize)
}

func (s *PaymentMethodService) SetStatus(ctx context.Context, id int64, status domain.ContentStatus, publishAt *time.Time) error {
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
	return s.paymentMethods.SetStatus(ctx, id, status, publishAtStr)
}

func (s *PaymentMethodService) Delete(ctx context.Context, id int64) error {
	return s.paymentMethods.Delete(ctx, id)
}

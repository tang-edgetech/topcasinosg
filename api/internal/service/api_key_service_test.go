package service

import (
	"testing"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
)

func TestCanDeleteAPIKey(t *testing.T) {
	creator := int64(7)
	key := &domain.APIKey{CreatedByID: &creator}
	cases := []struct {
		name  string
		actor *domain.AdminUser
		want  bool
	}{
		{"creator", &domain.AdminUser{ID: 7, Role: domain.RoleAdmin}, true},
		{"super admin", &domain.AdminUser{ID: 1, Role: domain.RoleSuperAdmin}, true},
		{"other admin", &domain.AdminUser{ID: 2, Role: domain.RoleAdmin}, false},
		{"editor", &domain.AdminUser{ID: 3, Role: domain.RoleEditor}, false},
		{"nobody", nil, false},
	}
	for _, c := range cases {
		if got := CanDeleteAPIKey(c.actor, key); got != c.want {
			t.Errorf("%s: got %v, want %v", c.name, got, c.want)
		}
	}
	if CanDeleteAPIKey(&domain.AdminUser{ID: 7, Role: domain.RoleAdmin}, &domain.APIKey{}) {
		t.Error("a key with no creator left can only be deleted by a Super Admin")
	}
}

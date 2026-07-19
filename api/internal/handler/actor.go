package handler

import (
	"net/http"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/middleware"
)

// requireActor is a small readability helper — every authenticated content
// handler needs the current user for created_by/audit purposes.
func requireActor(r *http.Request) *domain.AdminUser {
	return middleware.UserFromContext(r.Context())
}

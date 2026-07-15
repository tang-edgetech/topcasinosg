package handler

import (
	"net/http"

	"github.com/tang-edgetech/topcasinosg/api/internal/response"
)

func Health(w http.ResponseWriter, r *http.Request) {
	response.JSON(w, http.StatusOK, map[string]string{
		"status":  "ok",
		"service": "topcasinosg-api",
	})
}

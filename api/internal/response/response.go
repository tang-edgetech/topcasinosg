// Package response provides the JSON envelope every API endpoint returns,
// so frontend AJAX calls can rely on one shape: {success, data} or {success, error}.
package response

import (
	"encoding/json"
	"net/http"
)

type envelope struct {
	Success bool      `json:"success"`
	Data    any       `json:"data,omitempty"`
	Error   *apiError `json:"error,omitempty"`
}

type apiError struct {
	Message string `json:"message"`
}

func JSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(envelope{Success: true, Data: data})
}

// Err answers with an error message. For a 5xx the message also goes to the
// monitor as the reason, unless ServerErr already gave it the real error.
func Err(w http.ResponseWriter, status int, message string) {
	if status >= http.StatusInternalServerError {
		recordCause(w, message)
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(envelope{Success: false, Error: &apiError{Message: message}})
}

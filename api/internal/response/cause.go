package response

import "net/http"

// A failed request's real cause (a database error, say) is never sent to the
// visitor, but the monitor (internal/monitor) records it in the server log
// and the Telegram alert, so a 500 says why it happened. The monitor's
// ResponseWriter implements causeRecorder; middleware that wraps the writer
// keeps it reachable through Unwrap.
type causeRecorder interface {
	RecordCause(cause string)
}

func recordCause(w http.ResponseWriter, cause string) {
	for w != nil {
		if c, ok := w.(causeRecorder); ok {
			c.RecordCause(cause)
			return
		}
		u, ok := w.(interface{ Unwrap() http.ResponseWriter })
		if !ok {
			return
		}
		w = u.Unwrap()
	}
}

// ServerErr answers 500 with message, and passes err on to the monitor as
// the reason.
func ServerErr(w http.ResponseWriter, err error, message string) {
	if err != nil {
		recordCause(w, err.Error())
	}
	Err(w, http.StatusInternalServerError, message)
}

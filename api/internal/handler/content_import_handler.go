package handler

import (
	"errors"
	"io"
	"net/http"

	"github.com/tang-edgetech/topcasinosg/api/internal/response"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

const maxContentImportBytes = 10 << 20

type ContentImportHandler struct {
	imports *service.ContentImportService
}

func NewContentImportHandler(imports *service.ContentImportService) *ContentImportHandler {
	return &ContentImportHandler{imports: imports}
}

// Types lists every importable content type with its exact format, which
// the admin shows as the format guide and turns into CSV/JSON templates.
func (h *ContentImportHandler) Types(w http.ResponseWriter, r *http.Request) {
	response.JSON(w, http.StatusOK, map[string]any{"types": h.imports.Types()})
}

// Import takes one CSV or JSON file (form field "file") for the type in the
// path. dryRun=1 only checks it. Problems in the file come back in the
// report's errors (200), with nothing written.
func (h *ContentImportHandler) Import(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxContentImportBytes)
	if err := r.ParseMultipartForm(maxContentImportBytes); err != nil {
		response.Err(w, http.StatusBadRequest, "the file is too large (10 MB at most) or the upload is invalid")
		return
	}
	defer r.MultipartForm.RemoveAll()
	file, header, err := r.FormFile("file")
	if err != nil {
		response.Err(w, http.StatusBadRequest, `missing file field "file"`)
		return
	}
	defer file.Close()
	data, err := io.ReadAll(file)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "could not read the file")
		return
	}

	dryRun := r.FormValue("dryRun") == "1"
	report, err := h.imports.Import(r.Context(), requireActor(r), r.PathValue("type"), header.Filename, data, dryRun)
	if err != nil {
		response.Err(w, contentImportErrorStatus(err), err.Error())
		return
	}
	status := http.StatusOK
	if report.Applied {
		status = http.StatusCreated
	}
	response.JSON(w, status, map[string]any{"report": report})
}

func contentImportErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrUnknownImportType):
		return http.StatusNotFound
	case errors.Is(err, service.ErrImportFileType):
		return http.StatusBadRequest
	case errors.Is(err, service.ErrForbidden):
		return http.StatusForbidden
	default:
		return http.StatusInternalServerError
	}
}

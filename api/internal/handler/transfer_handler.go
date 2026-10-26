package handler

import (
	"errors"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/httpx"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

const (
	maxImportMemory = 32 << 20
	maxImportBytes  = 1 << 30
)

type TransferHandler struct {
	transfer *service.TransferService
}

func NewTransferHandler(transfer *service.TransferService) *TransferHandler {
	return &TransferHandler{transfer: transfer}
}

type TransferCatalogItemDTO struct {
	ID     string `json:"id"`
	Label  string `json:"label"`
	Detail string `json:"detail"`
}

type TransferCatalogGroupDTO struct {
	Key   string                   `json:"key"`
	Label string                   `json:"label"`
	Items []TransferCatalogItemDTO `json:"items"`
}

type exportRequest struct {
	Whole bool                `json:"whole"`
	Items map[string][]string `json:"items"`
}

func transferErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrForbidden):
		return http.StatusForbidden
	case errors.Is(err, service.ErrTransferNothingSelected),
		errors.Is(err, service.ErrTransferInvalidBundle),
		errors.Is(err, service.ErrTransferNewerFormat),
		errors.Is(err, service.ErrTransferReplaceNeedsAll),
		errors.Is(err, service.ErrTransferInvalidMode):
		return http.StatusBadRequest
	default:
		return http.StatusInternalServerError
	}
}

func transferErrorMessage(err error, fallback string) string {
	if transferErrorStatus(err) == http.StatusInternalServerError {
		log.Printf("transfer: %v", err)
		return fallback
	}
	return err.Error()
}

func (h *TransferHandler) Catalog(w http.ResponseWriter, r *http.Request) {
	groups, err := h.transfer.Catalog(r.Context(), requireActor(r))
	if err != nil {
		response.Err(w, transferErrorStatus(err), transferErrorMessage(err, "could not load the export list"))
		return
	}
	dtos := make([]TransferCatalogGroupDTO, len(groups))
	for i, g := range groups {
		items := make([]TransferCatalogItemDTO, len(g.Items))
		for j, item := range g.Items {
			items[j] = TransferCatalogItemDTO{ID: item.ID, Label: item.Label, Detail: item.Detail}
		}
		dtos[i] = TransferCatalogGroupDTO{Key: g.Key, Label: g.Label, Items: items}
	}
	response.JSON(w, http.StatusOK, map[string]any{"groups": dtos})
}

// Export builds the zip in a temp file first, so a failure halfway still
// returns a proper JSON error instead of a truncated download.
func (h *TransferHandler) Export(w http.ResponseWriter, r *http.Request) {
	var req exportRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}

	tmp, err := os.CreateTemp("", "tcsg-export-*.zip")
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not prepare the export")
		return
	}
	defer os.Remove(tmp.Name())
	defer tmp.Close()

	selection := domain.TransferSelection{Whole: req.Whole, Items: req.Items}
	if err := h.transfer.Export(r.Context(), requireActor(r), selection, r.Host, tmp); err != nil {
		response.Err(w, transferErrorStatus(err), transferErrorMessage(err, "could not build the export"))
		return
	}
	size, err := tmp.Seek(0, io.SeekCurrent)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not build the export")
		return
	}
	if _, err := tmp.Seek(0, io.SeekStart); err != nil {
		response.Err(w, http.StatusInternalServerError, "could not build the export")
		return
	}

	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", `attachment; filename="backoffice-export.zip"`)
	w.Header().Set("Content-Length", strconv.FormatInt(size, 10))
	w.WriteHeader(http.StatusOK)
	io.Copy(w, tmp)
}

// Import runs for real; Preview runs the same import and rolls it back.
func (h *TransferHandler) Import(w http.ResponseWriter, r *http.Request) {
	h.runImport(w, r, false)
}

func (h *TransferHandler) Preview(w http.ResponseWriter, r *http.Request) {
	h.runImport(w, r, true)
}

func (h *TransferHandler) runImport(w http.ResponseWriter, r *http.Request, dryRun bool) {
	r.Body = http.MaxBytesReader(w, r.Body, maxImportBytes)
	if err := r.ParseMultipartForm(maxImportMemory); err != nil {
		response.Err(w, http.StatusBadRequest, "file too large or invalid form")
		return
	}
	defer r.MultipartForm.RemoveAll()

	file, header, err := r.FormFile("file")
	if err != nil {
		response.Err(w, http.StatusBadRequest, `missing file field "file"`)
		return
	}
	defer file.Close()

	mode := domain.TransferMode(r.FormValue("mode"))
	report, err := h.transfer.Import(r.Context(), requireActor(r), file, header.Size, header.Filename, mode, dryRun)
	if err != nil {
		response.Err(w, transferErrorStatus(err), transferErrorMessage(err, "import failed — nothing was changed"))
		return
	}
	status := http.StatusOK
	if !dryRun {
		status = http.StatusCreated
	}
	response.JSON(w, status, report)
}

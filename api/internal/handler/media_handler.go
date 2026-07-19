package handler

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/httpx"
	"github.com/tang-edgetech/topcasinosg/api/internal/middleware"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
	"github.com/tang-edgetech/topcasinosg/api/internal/response"
	"github.com/tang-edgetech/topcasinosg/api/internal/service"
)

type MediaHandler struct {
	media *service.MediaService
}

func NewMediaHandler(media *service.MediaService) *MediaHandler {
	return &MediaHandler{media: media}
}

type MediaDTO struct {
	ID               int64     `json:"id"`
	OriginalFilename string    `json:"originalFilename"`
	Title            string    `json:"title"`
	AltText          string    `json:"altText"`
	Description      string    `json:"description"`
	MimeType         string    `json:"mimeType"`
	Kind             string    `json:"kind"`
	FileSize         int64     `json:"fileSize"`
	URL              string    `json:"url"`
	CreatedAt        time.Time `json:"createdAt"`
}

func toMediaDTO(m *domain.Media) MediaDTO {
	return MediaDTO{
		ID:               m.ID,
		OriginalFilename: m.OriginalFilename,
		Title:            m.Title,
		AltText:          m.AltText,
		Description:      m.Description,
		MimeType:         m.MimeType,
		Kind:             string(m.Kind),
		FileSize:         m.FileSize,
		URL:              m.URL,
		CreatedAt:        m.CreatedAt,
	}
}

func mediaErrorStatus(err error) int {
	switch {
	case errors.Is(err, service.ErrUnsupportedFileType), errors.Is(err, service.ErrFileTooLarge), errors.Is(err, service.ErrFileContentMismatch):
		return http.StatusBadRequest
	case errors.Is(err, repository.ErrNotFound):
		return http.StatusNotFound
	default:
		return http.StatusInternalServerError
	}
}

const (
	maxUploadMemory = 32 << 20  // buffer threshold before multipart spills to temp files
	maxRequestBytes = 201 << 20 // largest allowed single file (200MB video) + headroom
)

func (h *MediaHandler) Upload(w http.ResponseWriter, r *http.Request) {
	actor := middleware.UserFromContext(r.Context())

	r.Body = http.MaxBytesReader(w, r.Body, maxRequestBytes)
	if err := r.ParseMultipartForm(maxUploadMemory); err != nil {
		response.Err(w, http.StatusBadRequest, "file too large or invalid form")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		response.Err(w, http.StatusBadRequest, "missing file field \"file\"")
		return
	}
	defer file.Close()

	media, err := h.media.Upload(r.Context(), actor, header.Filename, header.Size, file)
	if err != nil {
		response.Err(w, mediaErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, map[string]any{"media": toMediaDTO(media)})
}

func (h *MediaHandler) List(w http.ResponseWriter, r *http.Request) {
	var kind *domain.MediaKind
	if k := r.URL.Query().Get("kind"); k != "" {
		mk := domain.MediaKind(k)
		kind = &mk
	}
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))

	items, total, err := h.media.List(r.Context(), kind, page, pageSize)
	if err != nil {
		response.Err(w, http.StatusInternalServerError, "could not load media")
		return
	}

	dtos := make([]MediaDTO, len(items))
	for i := range items {
		dtos[i] = toMediaDTO(&items[i])
	}
	response.JSON(w, http.StatusOK, map[string]any{"media": dtos, "total": total})
}

type updateMediaMetadataRequest struct {
	Title       string `json:"title"`
	AltText     string `json:"altText"`
	Description string `json:"description"`
}

func (h *MediaHandler) UpdateMetadata(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid media id")
		return
	}
	var req updateMediaMetadataRequest
	if err := httpx.DecodeJSON(r, &req); err != nil {
		response.Err(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.media.UpdateMetadata(r.Context(), id, req.Title, req.AltText, req.Description); err != nil {
		response.Err(w, mediaErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"updated": true})
}

func (h *MediaHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil {
		response.Err(w, http.StatusBadRequest, "invalid media id")
		return
	}
	if err := h.media.Delete(r.Context(), id); err != nil {
		response.Err(w, mediaErrorStatus(err), err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

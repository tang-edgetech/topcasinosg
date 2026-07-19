package service

import (
	"bytes"
	"context"
	"errors"
	"io"
	"net/http"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/tang-edgetech/topcasinosg/api/internal/domain"
	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
	"github.com/tang-edgetech/topcasinosg/api/internal/storage"
)

var (
	ErrUnsupportedFileType = errors.New("unsupported file type")
	ErrFileTooLarge        = errors.New("file exceeds the size limit for this type")
	ErrFileContentMismatch = errors.New("file content does not match its extension")
)

type mediaRule struct {
	kind    domain.MediaKind
	maxSize int64
}

const mb = 1 << 20

// Extension whitelist. Anything not listed here is rejected outright —
// intentionally not "everything except a blocklist".
var mediaRules = map[string]mediaRule{
	".jpg":  {domain.MediaKindImage, 10 * mb},
	".jpeg": {domain.MediaKindImage, 10 * mb},
	".png":  {domain.MediaKindImage, 10 * mb},
	".gif":  {domain.MediaKindImage, 10 * mb},
	".webp": {domain.MediaKindImage, 10 * mb},
	".svg":  {domain.MediaKindImage, 10 * mb},

	".json": {domain.MediaKindDocument, 20 * mb},
	".csv":  {domain.MediaKindDocument, 20 * mb},
	".doc":  {domain.MediaKindDocument, 20 * mb},
	".docx": {domain.MediaKindDocument, 20 * mb},
	".pdf":  {domain.MediaKindDocument, 20 * mb},

	".mp3": {domain.MediaKindAudio, 50 * mb},
	".wav": {domain.MediaKindAudio, 50 * mb},
	".ogg": {domain.MediaKindAudio, 50 * mb},
	".m4a": {domain.MediaKindAudio, 50 * mb},

	".mp4":  {domain.MediaKindVideo, 200 * mb},
	".webm": {domain.MediaKindVideo, 200 * mb},
	".mov":  {domain.MediaKindVideo, 200 * mb},
	".avi":  {domain.MediaKindVideo, 200 * mb},
}

var (
	svgScriptTag = regexp.MustCompile(`(?is)<script.*?</script>`)
	svgEventAttr = regexp.MustCompile(`(?i)\son\w+\s*=\s*("[^"]*"|'[^']*')`)
	svgJSHref    = regexp.MustCompile(`(?i)(href|xlink:href)\s*=\s*("javascript:[^"]*"|'javascript:[^']*')`)
)

// sanitizeSVG strips the common script-injection vectors (SVG can embed
// <script> tags and on* event handlers, executed if ever rendered inline).
// Not a full XML parse — a pragmatic pass appropriate here because uploads
// only ever come from authenticated staff accounts, not anonymous visitors.
func sanitizeSVG(content []byte) []byte {
	s := string(content)
	s = svgScriptTag.ReplaceAllString(s, "")
	s = svgEventAttr.ReplaceAllString(s, "")
	s = svgJSHref.ReplaceAllString(s, `$1="#"`)
	return []byte(s)
}

type MediaService struct {
	media   *repository.MediaRepo
	storage storage.Storage
}

func NewMediaService(media *repository.MediaRepo, store storage.Storage) *MediaService {
	return &MediaService{media: media, storage: store}
}

func (s *MediaService) Upload(ctx context.Context, actor *domain.AdminUser, originalFilename string, size int64, r io.Reader) (*domain.Media, error) {
	ext := strings.ToLower(filepath.Ext(originalFilename))
	rule, ok := mediaRules[ext]
	if !ok {
		return nil, ErrUnsupportedFileType
	}
	if size > rule.maxSize {
		return nil, ErrFileTooLarge
	}

	content, err := io.ReadAll(r)
	if err != nil {
		return nil, err
	}

	mimeType := http.DetectContentType(content)

	if ext == ".svg" {
		content = sanitizeSVG(content)
		peek := content
		if len(peek) > 1024 {
			peek = peek[:1024]
		}
		if !bytes.Contains(bytes.ToLower(peek), []byte("<svg")) {
			return nil, ErrFileContentMismatch
		}
		mimeType = "image/svg+xml"
	} else {
		// Magic-byte sniffing is reliable for images/audio/video — documents
		// (docx/csv/json) are too heterogeneous to sniff usefully, so those
		// lean on the extension whitelist + the auth boundary instead.
		if rule.kind == domain.MediaKindImage || rule.kind == domain.MediaKindAudio || rule.kind == domain.MediaKindVideo {
			if !strings.HasPrefix(mimeType, string(rule.kind)+"/") {
				return nil, ErrFileContentMismatch
			}
		}
	}

	filename, err := storage.GenerateFilename(string(rule.kind), ext)
	if err != nil {
		return nil, err
	}
	url, err := s.storage.Save(ctx, filename, bytes.NewReader(content))
	if err != nil {
		return nil, err
	}

	actorID := actor.ID
	m := &domain.Media{
		Filename:         filename,
		OriginalFilename: originalFilename,
		Title:            strings.TrimSuffix(originalFilename, ext),
		MimeType:         mimeType,
		Kind:             rule.kind,
		FileSize:         size,
		URL:              url,
		UploadedBy:       &actorID,
	}
	id, err := s.media.Create(ctx, m)
	if err != nil {
		return nil, err
	}
	return s.media.GetByID(ctx, id)
}

func (s *MediaService) List(ctx context.Context, kind *domain.MediaKind, page, pageSize int) ([]domain.Media, int, error) {
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 24
	}
	return s.media.List(ctx, kind, pageSize, (page-1)*pageSize)
}

func (s *MediaService) UpdateMetadata(ctx context.Context, id int64, title, altText, description string) error {
	return s.media.UpdateMetadata(ctx, id, title, altText, description)
}

func (s *MediaService) Delete(ctx context.Context, id int64) error {
	m, err := s.media.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if err := s.media.Delete(ctx, id); err != nil {
		return err
	}
	return s.storage.Delete(ctx, m.URL)
}

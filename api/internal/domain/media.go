package domain

import "time"

type MediaKind string

const (
	MediaKindImage    MediaKind = "image"
	MediaKindDocument MediaKind = "document"
	MediaKindAudio    MediaKind = "audio"
	MediaKindVideo    MediaKind = "video"
)

type Media struct {
	ID               int64
	Filename         string
	OriginalFilename string
	// Title/AltText/Description are editable metadata (Title defaults to the
	// original filename minus extension on upload). AltText matters for
	// image SEO/accessibility specifically, but is harmless on other kinds.
	Title       string
	AltText     string
	Description string
	MimeType    string
	Kind        MediaKind
	FileSize    int64
	URL         string
	UploadedBy  *int64
	CreatedAt   time.Time
}

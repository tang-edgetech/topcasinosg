// Package storage abstracts where uploaded files physically live. Local disk
// today is fine for a single API instance; swapping to S3-compatible object
// storage later (needed once there's more than one API instance behind a
// load balancer) means implementing Storage, not touching every caller.
package storage

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"io"
	"strings"
)

var ErrNotFound = errors.New("file not found")

type Storage interface {
	// Save writes r under a name derived from filename and returns the
	// public URL clients should use to fetch it.
	Save(ctx context.Context, filename string, r io.Reader) (url string, err error)
	Delete(ctx context.Context, url string) error
	// Open reads back a file saved under filename; ErrNotFound when missing.
	Open(ctx context.Context, filename string) (io.ReadCloser, error)
	Exists(ctx context.Context, filename string) bool
}

// ValidFilename rejects anything that could escape the upload directory.
func ValidFilename(name string) bool {
	return name != "" && name != "." && !strings.Contains(name, "..") && !strings.ContainsAny(name, `/\:`)
}

// GenerateFilename produces a collision-resistant name that keeps the
// original extension, so uploads never overwrite each other or leak the
// original (possibly sensitive) filename.
func GenerateFilename(prefix, ext string) (string, error) {
	raw := make([]byte, 16)
	if _, err := rand.Read(raw); err != nil {
		return "", err
	}
	return prefix + "-" + hex.EncodeToString(raw) + ext, nil
}

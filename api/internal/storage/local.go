package storage

import (
	"context"
	"errors"
	"io"
	"os"
	"path/filepath"
	"strings"
)

// LocalStorage saves files to disk and serves them back via the API's own
// /uploads/ static file route (see internal/server).
type LocalStorage struct {
	dir string
}

func NewLocalStorage(dir string) *LocalStorage {
	return &LocalStorage{dir: dir}
}

func (s *LocalStorage) Save(_ context.Context, filename string, r io.Reader) (string, error) {
	if err := os.MkdirAll(s.dir, 0o755); err != nil {
		return "", err
	}
	dst, err := os.Create(filepath.Join(s.dir, filename))
	if err != nil {
		return "", err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, r); err != nil {
		return "", err
	}
	return "/uploads/" + filename, nil
}

func (s *LocalStorage) Delete(_ context.Context, url string) error {
	name := strings.TrimPrefix(url, "/uploads/")
	if name == url || name == "" || strings.Contains(name, "..") || strings.ContainsAny(name, `/\`) {
		return errors.New("invalid upload url")
	}
	err := os.Remove(filepath.Join(s.dir, name))
	if errors.Is(err, os.ErrNotExist) {
		return nil
	}
	return err
}

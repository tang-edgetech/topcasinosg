package monitor

import (
	"fmt"
	"os"
	"path/filepath"
	"sync"
)

// RotatingFile is an append-only log file that is renamed to name.1 (name.1
// to name.2, and so on, keeping `backups` old files) once it would grow past
// maxBytes.
type RotatingFile struct {
	path     string
	maxBytes int64
	backups  int

	mu   sync.Mutex
	f    *os.File
	size int64
}

func OpenRotatingFile(path string, maxBytes int64, backups int) (*RotatingFile, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, err
	}
	r := &RotatingFile{path: path, maxBytes: maxBytes, backups: backups}
	if err := r.open(); err != nil {
		return nil, err
	}
	return r, nil
}

func (r *RotatingFile) open() error {
	f, err := os.OpenFile(r.path, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o640)
	if err != nil {
		return err
	}
	st, err := f.Stat()
	if err != nil {
		f.Close()
		return err
	}
	r.f, r.size = f, st.Size()
	return nil
}

func (r *RotatingFile) Write(p []byte) (int, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.f == nil {
		return 0, os.ErrClosed
	}
	if r.maxBytes > 0 && r.size > 0 && r.size+int64(len(p)) > r.maxBytes {
		if err := r.rotate(); err != nil {
			return 0, err
		}
	}
	n, err := r.f.Write(p)
	r.size += int64(n)
	return n, err
}

func (r *RotatingFile) rotate() error {
	r.f.Close()
	r.f = nil
	// Renames are best effort: if one fails the file is reopened and keeps
	// growing rather than logging stopping altogether.
	if r.backups <= 0 {
		os.Remove(r.path)
	} else {
		os.Remove(fmt.Sprintf("%s.%d", r.path, r.backups))
		for i := r.backups - 1; i >= 1; i-- {
			os.Rename(fmt.Sprintf("%s.%d", r.path, i), fmt.Sprintf("%s.%d", r.path, i+1))
		}
		os.Rename(r.path, r.path+".1")
	}
	return r.open()
}

func (r *RotatingFile) Close() error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.f == nil {
		return nil
	}
	err := r.f.Close()
	r.f = nil
	return err
}

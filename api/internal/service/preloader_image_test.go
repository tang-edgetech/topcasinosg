package service

import "testing"

func TestNormalizePreloaderImage(t *testing.T) {
	ok := []string{
		"/uploads/2026/11/loader.gif",
		"/uploads/a.JPG",
		"/uploads/a.jpeg",
		"/uploads/a.png",
		"/uploads/a.webp",
		"https://cdn.example.com/loader.gif?v=2",
	}
	for _, image := range ok {
		if got, err := normalizePreloaderImage(image); err != nil || got == nil || *got != image {
			t.Errorf("%q: got %v, %v; want it kept", image, got, err)
		}
	}
	if got, err := normalizePreloaderImage("  "); err != nil || got != nil {
		t.Errorf("blank: got %v, %v; want nil (site logo)", got, err)
	}
	bad := []string{"/uploads/a.svg", "/uploads/a.mp4", "//evil.example/a.gif", "javascript:alert(1).gif", "ftp://x/a.png", "loader.png"}
	for _, image := range bad {
		if _, err := normalizePreloaderImage(image); err != ErrInvalidPreloaderImage {
			t.Errorf("%q: got %v, want ErrInvalidPreloaderImage", image, err)
		}
	}
}

package service

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestDeploymentsParsesRunsWithOutput(t *testing.T) {
	dir := t.TempDir()
	log := strings.Join([]string{
		"[2026-10-29 11:00:00] deploying aaa1111 First (was 0000000)",
		"[2026-10-29 11:00:01] admin: building with path /opt/node",
		"Module not found: Can't resolve '@uiw/react-codemirror'",
		"[2026-10-29 11:00:20] admin: build FAILED — still serving the previous build",
		"[2026-10-29 11:00:21] finished with errors",
		"[2026-10-29 12:00:00] deploying bbb2222 Second (was aaa1111)",
		"[2026-10-29 12:00:05] api: building",
		"[2026-10-29 13:00:00] deploying ccc3333 Third (was bbb2222)",
		"   ",
		"[2026-10-29 13:00:30] done",
		"",
	}, "\n")
	if err := os.WriteFile(filepath.Join(dir, "deploy.log"), []byte(log), 0o644); err != nil {
		t.Fatal(err)
	}
	got := (&SystemService{logDir: dir}).deployments()
	if len(got) != 3 {
		t.Fatalf("got %d deployments, want 3", len(got))
	}
	want := []struct{ id, status string }{
		{"2026-10-29 13:00:00|ccc3333", "success"},
		{"2026-10-29 12:00:00|bbb2222", "interrupted"},
		{"2026-10-29 11:00:00|aaa1111", "failed"},
	}
	for i, w := range want {
		if got[i].ID != w.id || got[i].Status != w.status {
			t.Errorf("deployment %d: got %q %s, want %q %s", i, got[i].ID, got[i].Status, w.id, w.status)
		}
	}
	if out := got[2].Output; len(out) != 1 || !strings.Contains(out[0], "Module not found") {
		t.Errorf("failed deploy output = %q, want the build error", out)
	}
	if len(got[0].Output) != 0 {
		t.Errorf("blank lines kept as output: %q", got[0].Output)
	}
}

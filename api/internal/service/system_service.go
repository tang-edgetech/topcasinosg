package service

import (
	"bufio"
	"bytes"
	"context"
	"errors"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"runtime/debug"
	"strconv"
	"strings"
	"time"

	"github.com/tang-edgetech/topcasinosg/api/internal/repository"
	"github.com/tang-edgetech/topcasinosg/api/internal/version"
)

var (
	ErrDeploymentNotFound       = errors.New("deployment not found in deploy.log")
	ErrDeploymentNotResolvable  = errors.New("only a failed or interrupted deployment can be marked resolved")
	ErrDeploymentNeedsResolving = errors.New("mark this deployment resolved before removing it")
	ErrDeploymentRunning        = errors.New("a deployment that is still running can't be removed")
	ErrInvalidDeploymentLimit   = errors.New("the list limit must be between 1 and 50")
)

// MaxDeploymentLimit caps how many deployments the list can show.
const MaxDeploymentLimit = 50

// Build output kept per deployment (the newest lines), enough to see why a
// build failed without a separate log viewer.
const maxDeploymentOutputLines = 80

// SystemService reports what the server is running for Settings > Log: the
// git checkout, the API build and recent deploys (parsed from deploy.log),
// and records which deploys admins resolved or removed from the list.
type SystemService struct {
	logDir  string
	repoDir string
	reviews *repository.DeploymentReviewRepo
}

func NewSystemService(logDir, repoDir string, reviews *repository.DeploymentReviewRepo) *SystemService {
	return &SystemService{logDir: logDir, repoDir: repoDir, reviews: reviews}
}

// Log reads stop at this many bytes from the end of a file, so a huge log
// can't make a request slow or large.
const maxLogReadBytes = 2 << 20

type CommitInfo struct {
	Hash    string    `json:"hash"`
	Short   string    `json:"short"`
	Subject string    `json:"subject"`
	Author  string    `json:"author"`
	Date    time.Time `json:"date"`
}

type RepoStatus struct {
	Branch string      `json:"branch"`
	Head   *CommitInfo `json:"head"`
	// Remote is origin/<branch> as of the last fetch (deploy.sh fetches every
	// cron run); Behind counts the commits on it that aren't deployed yet.
	Remote    *CommitInfo `json:"remote"`
	Behind    int         `json:"behind"`
	FetchedAt *time.Time  `json:"fetchedAt"`
	Error     string      `json:"error,omitempty"`
}

type APIBuild struct {
	Version    string     `json:"version"`
	Commit     string     `json:"commit"`
	BuildDate  *time.Time `json:"buildDate"`
	CommitDate *time.Time `json:"commitDate"`
	Modified   bool       `json:"modified"`
	GoVersion  string     `json:"goVersion"`
	StartedAt  time.Time  `json:"startedAt"`
	// APIChanged says whether anything under api/ changed between Commit and
	// the checked-out HEAD, so a build from an older commit is only flagged
	// when the API itself is out of date. Nil when git can't tell.
	APIChanged *bool `json:"apiChanged"`
}

type Deployment struct {
	// ID identifies the deployment for resolve/remove: "<log timestamp>|<commit>".
	ID         string     `json:"id"`
	StartedAt  time.Time  `json:"startedAt"`
	FinishedAt *time.Time `json:"finishedAt"`
	Commit     string     `json:"commit"`
	Subject    string     `json:"subject"`
	Previous   string     `json:"previous"`
	// Status: running, success, failed, or interrupted (a later deploy
	// started without this one logging an end).
	Status string   `json:"status"`
	Steps  []string `json:"steps"`
	// Output is the end of the build output logged during this deploy.
	Output []string `json:"output"`
	// Resolved is set once an admin marked a failed/interrupted deploy resolved.
	Resolved *DeploymentResolution `json:"resolved"`
}

type DeploymentResolution struct {
	At     time.Time `json:"at"`
	ByName string    `json:"byName"`
	Note   string    `json:"note"`
}

type SystemStatus struct {
	API         APIBuild     `json:"api"`
	Repo        RepoStatus   `json:"repo"`
	Deployments []Deployment `json:"deployments"`
	// DeploymentLimit is how many deployments the list shows; Removed counts
	// the logged deploys admins removed from it.
	DeploymentLimit int `json:"deploymentLimit"`
	Removed         int `json:"removed"`
}

var startedAt = time.Now()

func (s *SystemService) Status(ctx context.Context) (SystemStatus, error) {
	limit, err := s.reviews.Limit(ctx)
	if err != nil {
		return SystemStatus{}, err
	}
	reviews, err := s.reviews.All(ctx)
	if err != nil {
		return SystemStatus{}, err
	}
	// Removed deploys drop out, so the list still fills up to the limit.
	deployments := []Deployment{}
	removed := 0
	for _, d := range s.deployments() {
		rv, ok := reviews[d.ID]
		if ok && rv.Removed {
			removed++
			continue
		}
		if ok && rv.ResolvedAt != nil {
			d.Resolved = &DeploymentResolution{At: *rv.ResolvedAt, ByName: rv.ResolvedByName, Note: rv.ResolutionNote}
		}
		if len(deployments) < limit {
			deployments = append(deployments, d)
		}
	}

	build := apiBuild()
	repo := s.repoStatus(ctx)
	if repo.Head != nil && build.Commit != "" && !strings.HasPrefix(repo.Head.Hash, build.Commit) {
		build.APIChanged = s.apiChangedSince(ctx, build.Commit)
	}
	return SystemStatus{API: build, Repo: repo, Deployments: deployments, DeploymentLimit: limit, Removed: removed}, nil
}

func (s *SystemService) SetDeploymentLimit(ctx context.Context, limit int) error {
	if limit < 1 || limit > MaxDeploymentLimit {
		return ErrInvalidDeploymentLimit
	}
	return s.reviews.SetLimit(ctx, limit)
}

func (s *SystemService) findDeployment(id string) (*Deployment, error) {
	for _, d := range s.deployments() {
		if d.ID == id {
			return &d, nil
		}
	}
	return nil, ErrDeploymentNotFound
}

// ResolveDeployment marks a failed or interrupted deploy as dealt with, which
// lets it be removed from the list.
func (s *SystemService) ResolveDeployment(ctx context.Context, id string, by int64, note string) error {
	d, err := s.findDeployment(id)
	if err != nil {
		return err
	}
	if d.Status != "failed" && d.Status != "interrupted" {
		return ErrDeploymentNotResolvable
	}
	note = strings.TrimSpace(note)
	if len([]rune(note)) > 500 {
		note = string([]rune(note)[:500])
	}
	return s.reviews.Resolve(ctx, id, by, note)
}

// RemoveDeployment hides a deploy from the list (deploy.log isn't changed).
// Successful deploys go straight away; failed or interrupted ones only once
// resolved, so a problem can't be dismissed without someone looking at it.
func (s *SystemService) RemoveDeployment(ctx context.Context, id string, by int64) error {
	d, err := s.findDeployment(id)
	if err != nil {
		return err
	}
	switch d.Status {
	case "running":
		return ErrDeploymentRunning
	case "failed", "interrupted":
		reviews, err := s.reviews.All(ctx)
		if err != nil {
			return err
		}
		if rv, ok := reviews[id]; !ok || rv.ResolvedAt == nil {
			return ErrDeploymentNeedsResolving
		}
	}
	return s.reviews.Remove(ctx, id, by)
}

// readLogEnd reads up to maxLogReadBytes from the end of a file as lines,
// dropping the first line when it was cut part-way.
func readLogEnd(path string) ([]string, bool, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, false, err
	}
	defer f.Close()
	st, err := f.Stat()
	if err != nil {
		return nil, false, err
	}
	offset := max(0, st.Size()-maxLogReadBytes)
	if _, err := f.Seek(offset, io.SeekStart); err != nil {
		return nil, false, err
	}
	data, err := io.ReadAll(f)
	if err != nil {
		return nil, false, err
	}
	if offset > 0 {
		if i := bytes.IndexByte(data, '\n'); i >= 0 {
			data = data[i+1:]
		}
	}
	var out []string
	sc := bufio.NewScanner(bytes.NewReader(data))
	sc.Buffer(make([]byte, 64*1024), maxLogReadBytes)
	for sc.Scan() {
		// Build tools redraw progress with \r; keep what the line ended as.
		line := sc.Text()
		if i := strings.LastIndexByte(strings.TrimRight(line, "\r"), '\r'); i >= 0 {
			line = line[i+1:]
		}
		out = append(out, strings.TrimRight(line, "\r"))
	}
	return out, offset > 0, sc.Err()
}

var (
	deployLinePattern  = regexp.MustCompile(`^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (.*)$`)
	deployStartPattern = regexp.MustCompile(`^deploying (\S+) (.*) \(was (\S*)\)$`)
)

// deployments parses deploy.log (see log() in deploy/cpanel/deploy.sh) into
// runs, newest first. Untimestamped lines are build output, kept (the last
// maxDeploymentOutputLines) on the run they were logged in.
func (s *SystemService) deployments() []Deployment {
	out := []Deployment{}
	lines, _, err := readLogEnd(filepath.Join(s.logDir, "deploy.log"))
	if err != nil {
		return out
	}
	var current *Deployment
	for _, line := range lines {
		m := deployLinePattern.FindStringSubmatch(line)
		if m == nil {
			if current != nil && current.Status == "running" && strings.TrimSpace(line) != "" {
				current.Output = append(current.Output, line)
				if len(current.Output) > maxDeploymentOutputLines {
					current.Output = current.Output[1:]
				}
			}
			continue
		}
		at, err := time.ParseInLocation("2006-01-02 15:04:05", m[1], time.Local)
		if err != nil {
			continue
		}
		msg := m[2]
		if start := deployStartPattern.FindStringSubmatch(msg); start != nil {
			if current != nil && current.Status == "running" {
				current.Status = "interrupted"
			}
			out = append(out, Deployment{
				ID: m[1] + "|" + start[1], StartedAt: at, Commit: start[1], Subject: start[2], Previous: start[3],
				Status: "running", Steps: []string{}, Output: []string{},
			})
			current = &out[len(out)-1]
			continue
		}
		if current == nil || current.Status != "running" {
			continue
		}
		switch msg {
		case "done":
			current.Status, current.FinishedAt = "success", &at
		case "finished with errors":
			current.Status, current.FinishedAt = "failed", &at
		default:
			current.Steps = append(current.Steps, msg)
		}
	}
	// Newest first.
	for i, j := 0, len(out)-1; i < j; i, j = i+1, j-1 {
		out[i], out[j] = out[j], out[i]
	}
	return out
}

func (s *SystemService) repoStatus(ctx context.Context) RepoStatus {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	var st RepoStatus
	head, err := s.commit(ctx, "HEAD")
	if err != nil {
		st.Error = "Git isn't available to the API: " + err.Error()
		return st
	}
	st.Head = head
	if branch, err := s.git(ctx, "rev-parse", "--abbrev-ref", "HEAD"); err == nil {
		st.Branch = branch
	}
	if st.Branch == "" || st.Branch == "HEAD" {
		return st
	}
	if remote, err := s.commit(ctx, "origin/"+st.Branch); err == nil {
		st.Remote = remote
		if n, err := s.git(ctx, "rev-list", "--count", "HEAD..origin/"+st.Branch); err == nil {
			st.Behind, _ = strconv.Atoi(n)
		}
	}
	if gitDir, err := s.git(ctx, "rev-parse", "--absolute-git-dir"); err == nil {
		if fi, err := os.Stat(filepath.Join(gitDir, "FETCH_HEAD")); err == nil {
			t := fi.ModTime()
			st.FetchedAt = &t
		}
	}
	return st
}

// apiChangedSince reports whether any file under api/ differs between commit
// and HEAD. Changes elsewhere (admin, web, shared) don't affect the API.
func (s *SystemService) apiChangedSince(ctx context.Context, commit string) *bool {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	out, err := s.git(ctx, "diff", "--name-only", commit, "HEAD", "--", ":(top)api/")
	if err != nil {
		return nil
	}
	changed := out != ""
	return &changed
}

func (s *SystemService) commit(ctx context.Context, ref string) (*CommitInfo, error) {
	out, err := s.git(ctx, "log", "-1", "--format=%H%x1f%h%x1f%s%x1f%an%x1f%cI", ref, "--")
	if err != nil {
		return nil, err
	}
	parts := strings.Split(out, "\x1f")
	if len(parts) != 5 {
		return nil, errors.New("unexpected git output")
	}
	date, _ := time.Parse(time.RFC3339, parts[4])
	return &CommitInfo{Hash: parts[0], Short: parts[1], Subject: parts[2], Author: parts[3], Date: date}, nil
}

func (s *SystemService) git(ctx context.Context, args ...string) (string, error) {
	cmd := exec.CommandContext(ctx, "git", append([]string{"-C", s.repoDir}, args...)...)
	var stderr bytes.Buffer
	cmd.Stderr = &stderr
	out, err := cmd.Output()
	if err != nil {
		if msg := strings.TrimSpace(stderr.String()); msg != "" {
			return "", errors.New(msg)
		}
		return "", err
	}
	return strings.TrimSpace(string(out)), nil
}

// apiBuild prefers the version stamped in with -ldflags and falls back to
// the git details Go records when it builds inside a checkout (deploy.sh's
// plain `go build`).
func apiBuild() APIBuild {
	b := APIBuild{Version: version.Version, Commit: version.Commit, StartedAt: startedAt}
	if t, err := time.Parse("2006-01-02", version.BuildDate); err == nil {
		b.BuildDate = &t
	}
	info, ok := debug.ReadBuildInfo()
	if !ok {
		return b
	}
	b.GoVersion = info.GoVersion
	for _, kv := range info.Settings {
		switch kv.Key {
		case "vcs.revision":
			if b.Commit == "" {
				b.Commit = kv.Value
			}
		case "vcs.time":
			if t, err := time.Parse(time.RFC3339, kv.Value); err == nil {
				b.CommitDate = &t
			}
		case "vcs.modified":
			b.Modified = kv.Value == "true"
		}
	}
	return b
}

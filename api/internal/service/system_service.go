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

	"github.com/tang-edgetech/topcasinosg/api/internal/version"
)

var ErrUnknownLogFile = errors.New("unknown log file")

// SystemService reports what the server is running for Settings > Log: the
// git checkout, the API build, recent deploys (parsed from deploy.log) and the
// tail of the cPanel log files. Only the files in systemLogFiles can be read.
type SystemService struct {
	logDir  string
	repoDir string
}

func NewSystemService(logDir, repoDir string) *SystemService {
	return &SystemService{logDir: logDir, repoDir: repoDir}
}

type systemLogFile struct {
	Key, File, Description string
}

// Written by deploy/cpanel/deploy.sh and api-process.sh (see their cron lines
// in deploy/cpanel/README.md).
var systemLogFiles = []systemLogFile{
	{"api", "api.log", "API output: startup messages and errors."},
	{"deploy", "deploy.log", "Each deploy: what was built and restarted, with build output."},
	{"api-process", "api-process.log", "API starts, stops and automatic restarts."},
}

// Log reads stop at this many bytes from the end of a file, so a huge log
// can't make a request slow or large.
const maxLogReadBytes = 2 << 20

const MaxLogLines = 2000

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
	StartedAt  time.Time  `json:"startedAt"`
	FinishedAt *time.Time `json:"finishedAt"`
	Commit     string     `json:"commit"`
	Subject    string     `json:"subject"`
	Previous   string     `json:"previous"`
	// Status: running, success, failed, or interrupted (a later deploy
	// started without this one logging an end).
	Status string   `json:"status"`
	Steps  []string `json:"steps"`
}

type LogFileInfo struct {
	Key         string     `json:"key"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Exists      bool       `json:"exists"`
	Size        int64      `json:"size"`
	ModifiedAt  *time.Time `json:"modifiedAt"`
}

type SystemStatus struct {
	API         APIBuild      `json:"api"`
	Repo        RepoStatus    `json:"repo"`
	Deployments []Deployment  `json:"deployments"`
	Logs        []LogFileInfo `json:"logs"`
	LogDir      string        `json:"logDir"`
}

type LogTail struct {
	LogFileInfo
	Lines []string `json:"lines"`
	// Partial is true when the file is bigger than what was read, so older
	// lines (and older matches, with errorsOnly) aren't included.
	Partial bool `json:"partial"`
}

var startedAt = time.Now()

func (s *SystemService) Status(ctx context.Context) SystemStatus {
	logs := make([]LogFileInfo, 0, len(systemLogFiles))
	for _, f := range systemLogFiles {
		logs = append(logs, s.logInfo(f))
	}
	build := apiBuild()
	repo := s.repoStatus(ctx)
	if repo.Head != nil && build.Commit != "" && !strings.HasPrefix(repo.Head.Hash, build.Commit) {
		build.APIChanged = s.apiChangedSince(ctx, build.Commit)
	}
	return SystemStatus{
		API:         build,
		Repo:        repo,
		Deployments: s.deployments(10),
		Logs:        logs,
		LogDir:      s.logDir,
	}
}

func (s *SystemService) logInfo(f systemLogFile) LogFileInfo {
	info := LogFileInfo{Key: f.Key, Name: f.File, Description: f.Description}
	if st, err := os.Stat(filepath.Join(s.logDir, f.File)); err == nil && st.Mode().IsRegular() {
		mod := st.ModTime()
		info.Exists, info.Size, info.ModifiedAt = true, st.Size(), &mod
	}
	return info
}

// errorLinePattern marks the lines "errors only" keeps.
var errorLinePattern = regexp.MustCompile(`(?i)\b(error|errors|err|fail|failed|failure|panic|fatal|denied|refused|cannot|can't|timeout|exception|killed)\b`)

func IsErrorLogLine(line string) bool {
	return errorLinePattern.MatchString(line)
}

// Tail returns the last `lines` lines of a log file, or of its error lines.
func (s *SystemService) Tail(key string, lines int, errorsOnly bool) (*LogTail, error) {
	var file *systemLogFile
	for i := range systemLogFiles {
		if systemLogFiles[i].Key == key {
			file = &systemLogFiles[i]
		}
	}
	if file == nil {
		return nil, ErrUnknownLogFile
	}
	lines = max(1, min(lines, MaxLogLines))

	tail := &LogTail{LogFileInfo: s.logInfo(*file), Lines: []string{}}
	if !tail.Exists {
		return tail, nil
	}
	all, partial, err := readLogEnd(filepath.Join(s.logDir, file.File))
	if err != nil {
		return nil, err
	}
	tail.Partial = partial
	if errorsOnly {
		matched := all[:0:0]
		for _, l := range all {
			if IsErrorLogLine(l) {
				matched = append(matched, l)
			}
		}
		all = matched
	}
	if len(all) > lines {
		all = all[len(all)-lines:]
	}
	tail.Lines = all
	return tail, nil
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
// the latest runs, newest first. Untimestamped lines are build output and
// are left to the log viewer.
func (s *SystemService) deployments(limit int) []Deployment {
	out := []Deployment{}
	lines, _, err := readLogEnd(filepath.Join(s.logDir, "deploy.log"))
	if err != nil {
		return out
	}
	var current *Deployment
	for _, line := range lines {
		m := deployLinePattern.FindStringSubmatch(line)
		if m == nil {
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
				StartedAt: at, Commit: start[1], Subject: start[2], Previous: start[3],
				Status: "running", Steps: []string{},
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
	// Newest first, at most limit.
	for i, j := 0, len(out)-1; i < j; i, j = i+1, j-1 {
		out[i], out[j] = out[j], out[i]
	}
	if len(out) > limit {
		out = out[:limit]
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

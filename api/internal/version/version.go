// Package version holds build metadata stamped in at build time:
//
//	go build -ldflags "-X github.com/tang-edgetech/topcasinosg/api/internal/version.Version=v1.0.3
//	  -X github.com/tang-edgetech/topcasinosg/api/internal/version.Commit=a1b2c3d
//	  -X github.com/tang-edgetech/topcasinosg/api/internal/version.BuildDate=2026-10-23"
//
// A plain `go run` keeps the "dev" defaults.
package version

var (
	Version   = "dev"
	Commit    = ""
	BuildDate = ""
)

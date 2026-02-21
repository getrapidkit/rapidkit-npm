/**
 * Go + Fiber (gofiber.standard) scaffold generator.
 *
 * Runs entirely at npm level — no Python core engine required.
 * Produces a production-ready Go/Fiber REST starter with:
 *   - Structured logging (slog / zerolog-compatible layout)
 *   - /health endpoint
 *   - 12-factor config via env vars
 *   - Dockerfile (multi-stage)
 *   - docker-compose.yml
 *   - GitHub Actions CI
 *   - Makefile
 *   - .rapidkit/project.json marker (disables module system)
 */

import { promises as fs } from 'fs';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { execa } from 'execa';
import { getVersion } from '../update-checker.js';

export interface GoFiberVariables {
  project_name: string;
  module_path?: string; // e.g. "github.com/acme/my-api" — defaults to project_name
  author?: string;
  description?: string;
  go_version?: string;
  app_version?: string;
  port?: string;
  skipGit?: boolean;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function toPascalCase(s: string): string {
  return s
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
}

// ─── cmd/server/main.go ──────────────────────────────────────────────────────

function mainGo(v: Required<GoFiberVariables>): string {
  return `package main

import (
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "${v.module_path}/docs"
	"${v.module_path}/internal/config"
	"${v.module_path}/internal/server"
)

// Build-time variables — injected via -ldflags.
var (
	version = "dev"
	commit  = "none"
	date    = "unknown"
)

func main() {
	cfg := config.Load()

	log := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: config.ParseLogLevel(cfg.LogLevel),
	}))
	slog.SetDefault(log)

	app := server.NewApp(cfg)

	// Graceful shutdown on SIGINT / SIGTERM
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	go func() {
		slog.Info("starting", "port", cfg.Port, "version", version, "commit", commit, "date", date, "env", cfg.Env)
		fmt.Printf("\\n🚀  Server  → http://127.0.0.1:%s\\n", cfg.Port)
		fmt.Printf("📖  Docs    → http://127.0.0.1:%s/docs\\n\\n", cfg.Port)
		if err := app.Listen(":" + cfg.Port); err != nil {
			slog.Error("server error", "err", err)
			os.Exit(1)
		}
	}()

	<-quit
	slog.Info("shutting down…")
	if err := app.ShutdownWithTimeout(5 * time.Second); err != nil {
		slog.Error("graceful shutdown failed", "err", err)
		os.Exit(1)
	}
	slog.Info("server stopped")
}
`;
}

function goMod(v: Required<GoFiberVariables>): string {
  return `module ${v.module_path}

go ${v.go_version}

require (
	github.com/gofiber/fiber/v2 v2.52.5
	github.com/swaggo/fiber-swagger v1.3.0
	github.com/swaggo/swag v1.16.3
)

require (
	github.com/KyleBanks/depth v1.2.1 // indirect
	github.com/andybalholm/brotli v1.1.0 // indirect
	github.com/ghodss/yaml v1.0.0 // indirect
	github.com/go-openapi/jsonpointer v0.21.0 // indirect
	github.com/go-openapi/jsonreference v0.21.0 // indirect
	github.com/go-openapi/spec v0.21.0 // indirect
	github.com/go-openapi/swag v0.23.0 // indirect
	github.com/josharian/intern v1.0.0 // indirect
	github.com/klauspost/compress v1.17.6 // indirect
	github.com/mailru/easyjson v0.7.7 // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/mattn/go-runewidth v0.0.15 // indirect
	github.com/rivo/uniseg v0.2.0 // indirect
	github.com/swaggo/files v1.0.1 // indirect
	github.com/valyala/bytebufferpool v1.0.0 // indirect
	github.com/valyala/fasthttp v1.52.0 // indirect
	github.com/valyala/tcplisten v1.0.0 // indirect
	golang.org/x/net v0.25.0 // indirect
	golang.org/x/sys v0.16.0 // indirect
	golang.org/x/tools v0.21.0 // indirect
	gopkg.in/yaml.v2 v2.4.0 // indirect
)
`;
}

function configGo(v: Required<GoFiberVariables>): string {
  return `package config

import (
	"log/slog"
	"os"
	"strings"
)

// Config holds application configuration loaded from environment variables.
type Config struct {
	Port     string
	Env      string
	LogLevel string
}

// Load reads configuration from environment variables with sensible defaults.
func Load() *Config {
	env := getEnv("APP_ENV", "development")
	return &Config{
		Port:     getEnv("PORT", "${v.port}"),
		Env:      env,
		LogLevel: getEnv("LOG_LEVEL", defaultLogLevel(env)),
	}
}

// ParseLogLevel maps a level string to the corresponding slog.Level.
// Falls back to Info for unrecognised values.
func ParseLogLevel(s string) slog.Level {
	switch strings.ToLower(s) {
	case "debug":
		return slog.LevelDebug
	case "warn", "warning":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}

func defaultLogLevel(env string) string {
	if env == "development" {
		return "debug"
	}
	return "info"
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}
`;
}

// ─── internal/server/server.go ───────────────────────────────────────────────

function routesGo(v: Required<GoFiberVariables>): string {
  return `package server

import (
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/recover"
	fiberSwagger "github.com/swaggo/fiber-swagger"

	"${v.module_path}/internal/apierr"
	"${v.module_path}/internal/config"
	"${v.module_path}/internal/handlers"
	"${v.module_path}/internal/middleware"
)

// NewApp creates and configures the Fiber application.
// Call this from main — or from tests via server.NewApp(cfg).
func NewApp(cfg *config.Config) *fiber.App {
	app := fiber.New(fiber.Config{
		AppName:      "${v.project_name}",
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  30 * time.Second,
		// Override default error handler to always return JSON.
		// The catch-all middleware returns fiber.ErrNotFound so all 404s
		// are routed here, keeping error formatting in one place.
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			if code == http.StatusNotFound {
				return apierr.NotFound(c, "route not found")
			}
			if code == http.StatusMethodNotAllowed {
				return apierr.MethodNotAllowed(c)
			}
			// Fallback for any unexpected error (e.g. panic-recovered 500).
			return apierr.InternalError(c, err)
		},
	})

	app.Use(recover.New())
	app.Use(middleware.CORS())
	app.Use(middleware.RequestID())
	app.Use(middleware.RateLimit())
	app.Use(middleware.Logger())

	// Swagger UI — /docs redirects to /docs/index.html
	app.Get("/docs", func(c *fiber.Ctx) error { return c.Redirect("/docs/index.html", fiber.StatusFound) })
	app.Get("/docs/*", fiberSwagger.WrapHandler)

	v1 := app.Group("/api/v1")
	v1.Get("/health/live",  handlers.Liveness)
	v1.Get("/health/ready", handlers.Readiness)
	v1.Get("/echo/:name",   handlers.EchoParams)

	// 404 catch-all: return fiber.ErrNotFound so it is processed by the
	// custom ErrorHandler above, keeping all error formatting in one place.
	app.Use(func(c *fiber.Ctx) error {
		return fiber.ErrNotFound
	})

	return app
}
`;
}

// ─── internal/handlers/health.go ─────────────────────────────────────────────

function handlerHealthGo(): string {
  return `package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
)

// Liveness signals the process is alive (Kubernetes livenessProbe).
//
//	@Summary		Liveness probe
//	@Description	Returns 200 when the process is alive.
//	@Tags			health
//	@Produce		json
//	@Success		200	{object}	map[string]string
//	@Router			/api/v1/health/live [get]
func Liveness(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status": "ok",
		"time":   time.Now().UTC().Format(time.RFC3339),
	})
}

// Readiness signals the service can accept traffic (Kubernetes readinessProbe).
// Extend this function to check database connectivity, caches, etc.
//
//	@Summary		Readiness probe
//	@Description	Returns 200 when the service is ready to accept traffic.
//	@Tags			health
//	@Produce		json
//	@Success		200	{object}	map[string]string
//	@Router			/api/v1/health/ready [get]
func Readiness(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status": "ready",
		"time":   time.Now().UTC().Format(time.RFC3339),
	})
}
`;
}

// ─── internal/handlers/health_test.go ────────────────────────────────────────

function mainTestGo(v: Required<GoFiberVariables>): string {
  return `package handlers_test

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"${v.module_path}/internal/config"
	"${v.module_path}/internal/server"
)

func TestLiveness(t *testing.T) {
	app := server.NewApp(config.Load())
	req := httptest.NewRequest(http.MethodGet, "/api/v1/health/live", nil)
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("request error: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		data, _ := io.ReadAll(resp.Body)
		t.Fatalf("expected 200, got %d: %s", resp.StatusCode, data)
	}

	var body map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if body["status"] != "ok" {
		t.Fatalf("expected ok, got %v", body["status"])
	}
}

func TestReadiness(t *testing.T) {
	app := server.NewApp(config.Load())
	req := httptest.NewRequest(http.MethodGet, "/api/v1/health/ready", nil)
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("request error: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", resp.StatusCode, resp.Status)
	}
}
`;
}

function dockerfile(): string {
  return `# ── Build stage ────────────────────────────────────────────────────────
FROM golang:1.24-alpine AS builder

# Build-time version injection
ARG VERSION=dev
ARG COMMIT=none
ARG DATE=unknown

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build \\
    -ldflags="-s -w -X main.version=$\${VERSION} -X main.commit=$\${COMMIT} -X main.date=$\${DATE}" \\
    -o server ./cmd/server

# ── Runtime stage ───────────────────────────────────────────────────────
# alpine includes busybox wget required for the HEALTHCHECK below.
FROM alpine:3.21

RUN addgroup -S app && adduser -S -G app app
COPY --from=builder /app/server /server
USER app

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD wget -qO- http://localhost:3000/api/v1/health/live || exit 1
ENTRYPOINT ["/server"]
`;
}

function dockerCompose(v: Required<GoFiberVariables>): string {
  return `version: "3.9"

services:
  api:
    build: .
    container_name: ${v.project_name}
    ports:
      - "${v.port}:${v.port}"
    environment:
      PORT: "${v.port}"
      APP_ENV: development
      LOG_LEVEL: info
      CORS_ALLOW_ORIGINS: "*"
      RATE_LIMIT_RPS: "100"
    restart: unless-stopped
`;
}

function makefile(v: Required<GoFiberVariables>): string {
  return `.PHONY: dev run build test cover lint fmt tidy docs docker-up docker-down

# Build-time metadata
VERSION ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
COMMIT  ?= $(shell git rev-parse --short HEAD 2>/dev/null || echo "none")
DATE    ?= $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")
LDFLAGS  = -ldflags "-s -w -X main.version=$(VERSION) -X main.commit=$(COMMIT) -X main.date=$(DATE)"
# Go tool binaries are installed to GOPATH/bin; include it so \`air\` and \`swag\` are found.
GOBIN   ?= $(shell go env GOPATH)/bin

# Hot reload — installs air on first use
dev:
	@test -x "$(GOBIN)/air" || go install github.com/air-verse/air@latest
	$(GOBIN)/air

run:
	go run $(LDFLAGS) ./cmd/server

build:
	go build $(LDFLAGS) -o bin/${v.project_name} ./cmd/server

test:
	go test ./... -v -race

cover:
	go test ./... -race -coverprofile=coverage.out
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report: coverage.html"

# Generate Swagger docs — installs swag on first use
docs:
	@test -x "$(GOBIN)/swag" || go install github.com/swaggo/swag/cmd/swag@latest
	$(GOBIN)/swag init -g main.go -d cmd/server,internal/handlers,internal/apierr -o docs --parseDependency
tidy:
	go mod tidy

docker-up:
	go mod tidy
	docker compose up --build \\
		--build-arg VERSION=$(VERSION) \\
		--build-arg COMMIT=$(COMMIT) \\
		--build-arg DATE=$(DATE) \\
		-d

docker-down:
	docker compose down
`;
}

function envExample(v: Required<GoFiberVariables>): string {
  return `# Application
PORT=${v.port}
APP_ENV=development
LOG_LEVEL=debug

# CORS — comma-separated list of allowed origins, or * to allow all
CORS_ALLOW_ORIGINS=*

# Rate limiting — max requests per IP per second
RATE_LIMIT_RPS=100
`;
}

function gitignore(): string {
  return `# Binaries
bin/
*.exe
*.exe~
*.dll
*.so
*.dylib

# Test binary
*.test

# Output of go coverage tool
*.out
coverage.html

# Go workspace
go.work
go.work.sum

# Environment
.env
.env.local

# Hot reload (air)
tmp/

# Swagger — generated files (committed stub docs/doc.go; run \`make docs\` to regenerate)
docs/swagger.json
docs/swagger.yaml
docs/docs.go

# Editor
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
`;
}

function githubWorkflow(v: Required<GoFiberVariables>): string {
  return `name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: "${v.go_version}"
          cache: true

      - name: Tidy
        run: go mod tidy

      - name: Build
        run: go build ./...

      - name: Test
        run: go test ./... -race -coverprofile=coverage.out

      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage.out

  lint:
    name: Lint
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: "${v.go_version}"
          cache: true

      - name: golangci-lint
        uses: golangci/golangci-lint-action@v6
        with:
          version: latest
`;
}

function readmeMd(v: Required<GoFiberVariables>): string {
  return `# ${toPascalCase(v.project_name)}

> ${v.description}

Built with [Go](https://go.dev/) + [Fiber v2](https://gofiber.io/) \u00b7 Scaffolded by [RapidKit](https://getrapidkit.com)

## Quick start

\`\`\`bash
# Run locally (hot reload)
make dev

# Run tests
make test

# Build binary
make build

# Generate / refresh Swagger docs
make docs

# Docker
make docker-up
\`\`\`

## Swagger / OpenAPI

After running \`make docs\`, the interactive UI is available at:

\`\`\`
http://localhost:${v.port}/docs
\`\`\`

The raw OpenAPI spec is served at \`/docs/doc.json\`.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET    | /api/v1/health/live    | Kubernetes livenessProbe  |
| GET    | /api/v1/health/ready   | Kubernetes readinessProbe |
| GET    | /api/v1/echo/:name     | Example handler \u2014 remove in production |
| GET    | /docs/*                | Swagger UI (OpenAPI docs) |

## Configuration

All configuration is done through environment variables (see \`.env.example\`):

| Variable | Default | Description |
|----------|---------|-------------|
| \`PORT\` | \`${v.port}\` | HTTP listen port |
| \`APP_ENV\` | \`development\` | Application environment |
| \`LOG_LEVEL\` | \`debug\` / \`info\` | \`debug\` \\| \`info\` \\| \`warn\` \\| \`error\` |
| \`CORS_ALLOW_ORIGINS\` | \`*\` | Comma-separated list of allowed origins, or \`*\` |
| \`RATE_LIMIT_RPS\` | \`100\` | Max requests per IP per second |

## Project structure

\`\`\`
${v.project_name}/
\u251c\u2500\u2500 cmd/
\u2502   \u2514\u2500\u2500 server/
\u2502       \u2514\u2500\u2500 main.go                  # Graceful shutdown + version ldflags
\u251c\u2500\u2500 docs/                            # Swagger generated files (\`make docs\`)
\u2502   \u2514\u2500\u2500 doc.go                   # Package-level OpenAPI annotations
\u251c\u2500\u2500 internal/
\u2502   \u251c\u2500\u2500 apierr/                      # Consistent JSON error envelope
\u2502   \u2502   \u251c\u2500\u2500 apierr.go
\u2502   \u2502   \u2514\u2500\u2500 apierr_test.go
\u2502   \u251c\u2500\u2500 config/                      # 12-factor configuration
\u2502   \u2502   \u251c\u2500\u2500 config.go
\u2502   \u2502   \u2514\u2500\u2500 config_test.go
\u2502   \u251c\u2500\u2500 handlers/                    # HTTP handlers + tests
\u2502   \u2502   \u251c\u2500\u2500 health.go
\u2502   \u2502   \u251c\u2500\u2500 health_test.go
\u2502   \u2502   \u251c\u2500\u2500 example.go               # EchoParams \u2014 replace with your own handlers
\u2502   \u2502   \u2514\u2500\u2500 example_test.go
\u2502   \u251c\u2500\u2500 middleware/
\u2502   \u2502   \u251c\u2500\u2500 requestid.go             # X-Request-ID + structured logger
\u2502   \u2502   \u251c\u2500\u2500 requestid_test.go
\u2502   \u2502   \u251c\u2500\u2500 cors.go                  # CORS (CORS_ALLOW_ORIGINS)
\u2502   \u2502   \u251c\u2500\u2500 cors_test.go
\u2502   \u2502   \u251c\u2500\u2500 ratelimit.go             # Per-IP limiter (RATE_LIMIT_RPS)
\u2502   \u2502   \u2514\u2500\u2500 ratelimit_test.go
\u2502   \u2514\u2500\u2500 server/
\u2502       \u251c\u2500\u2500 server.go
\u2502       \u2514\u2500\u2500 server_test.go
\u251c\u2500\u2500 .air.toml                        # Hot reload
\u251c\u2500\u2500 .github/workflows/ci.yml         # CI: test + lint
\u251c\u2500\u2500 .golangci.yml
\u251c\u2500\u2500 Dockerfile                       # Multi-stage, alpine HEALTHCHECK
\u251c\u2500\u2500 docker-compose.yml
\u251c\u2500\u2500 Makefile
\u2514\u2500\u2500 README.md
\`\`\`

## Available commands

| Command | Description |
|---------|-------------|
| \`make dev\` | Hot reload via [air](https://github.com/air-verse/air) |
| \`make run\` | Run without hot reload |
| \`make build\` | Binary with version ldflags |
| \`make test\` | Run tests with race detector |
| \`make cover\` | HTML coverage report |
| \`make docs\` | Re-generate Swagger JSON (needs \`swag\`) |
| \`make lint\` | golangci-lint |
| \`make fmt\` | gofmt |
| \`make tidy\` | go mod tidy |
| \`make docker-up\` | Build & run via Docker Compose |
| \`make docker-down\` | Stop |

## License

${v.app_version} \u00b7 ${v.author}
`;
}

// ─── internal/middleware/requestid.go ────────────────────────────────────────

function middlewareGo(): string {
  return `package middleware

import (
	"crypto/rand"
	"encoding/hex"
	"log/slog"
	"time"

	"github.com/gofiber/fiber/v2"
)

const headerRequestID = "X-Request-ID"

// RequestID injects a unique identifier into every request.
// If the caller sends an X-Request-ID header it is reused; otherwise a new one
// is generated and written back in the response.
func RequestID() fiber.Handler {
	return func(c *fiber.Ctx) error {
		id := c.Get(headerRequestID)
		if id == "" {
			id = newID()
		}
		c.Set(headerRequestID, id)
		c.Locals("request_id", id)
		return c.Next()
	}
}

// Logger emits a structured JSON log line after each request.
func Logger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		err := c.Next()
		slog.Info("http",
			"method",     c.Method(),
			"path",       c.Path(),
			"status",     c.Response().StatusCode(),
			"bytes",      c.Response().Header.ContentLength(),
			"latency_ms", time.Since(start).Milliseconds(),
			"ip",         c.IP(),
			"request_id", c.Locals("request_id"),
		)
		return err
	}
}

func newID() string {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		return "unknown"
	}
	return hex.EncodeToString(b)
}
`;
}

// ─── internal/middleware/requestid_test.go ───────────────────────────────────

function middlewareTestGo(v: Required<GoFiberVariables>): string {
  return `package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"

	"${v.module_path}/internal/middleware"
)

func newTestApp() *fiber.App {
	app := fiber.New()
	app.Use(middleware.RequestID())
	app.Use(middleware.Logger())
	app.Get("/ping", func(c *fiber.Ctx) error {
		return c.SendString("pong")
	})
	return app
}

func TestRequestID_IsGenerated(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/ping", nil)
	resp, err := newTestApp().Test(req, -1)
	if err != nil {
		t.Fatalf("request error: %v", err)
	}
	defer resp.Body.Close()

	id := resp.Header.Get("X-Request-ID")
	if id == "" {
		t.Fatal("expected X-Request-ID header to be set")
	}
	if len(id) != 16 { // 8 random bytes \u2192 16 hex chars
		t.Fatalf("unexpected request ID length %d, want 16", len(id))
	}
}

func TestRequestID_IsReused(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/ping", nil)
	req.Header.Set("X-Request-ID", "my-trace-id")
	resp, err := newTestApp().Test(req, -1)
	if err != nil {
		t.Fatalf("request error: %v", err)
	}
	defer resp.Body.Close()

	id := resp.Header.Get("X-Request-ID")
	if id != "my-trace-id" {
		t.Fatalf("expected X-Request-ID to be reused, got %q", id)
	}
}
`;
}

// ─── internal/apierr/apierr.go ───────────────────────────────────────────────

function apierrGo(): string {
  return `// Package apierr provides a consistent JSON error envelope for all API responses.
//
// Every error response looks like:
//
//	{"error": "user not found", "code": "NOT_FOUND", "request_id": "a1b2c3d4..."}
package apierr

import (
	"net/http"

	"github.com/gofiber/fiber/v2"
)

// Response is the standard error envelope returned by all API endpoints.
type Response struct {
	Error     string \`json:"error"\`
	Code      string \`json:"code"\`
	RequestID string \`json:"request_id,omitempty"\`
}

func reply(c *fiber.Ctx, status int, msg, code string) error {
	rid, _ := c.Locals("request_id").(string)
	return c.Status(status).JSON(Response{
		Error:     msg,
		Code:      code,
		RequestID: rid,
	})
}

// BadRequest responds with 400 and code "BAD_REQUEST".
func BadRequest(c *fiber.Ctx, msg string) error {
	return reply(c, http.StatusBadRequest, msg, "BAD_REQUEST")
}

// NotFound responds with 404 and code "NOT_FOUND".
func NotFound(c *fiber.Ctx, msg string) error {
	return reply(c, http.StatusNotFound, msg, "NOT_FOUND")
}

// Unauthorized responds with 401 and code "UNAUTHORIZED".
func Unauthorized(c *fiber.Ctx) error {
	return reply(c, http.StatusUnauthorized, "authentication required", "UNAUTHORIZED")
}

// Forbidden responds with 403 and code "FORBIDDEN".
func Forbidden(c *fiber.Ctx) error {
	return reply(c, http.StatusForbidden, "access denied", "FORBIDDEN")
}

// MethodNotAllowed responds with 405 and code "METHOD_NOT_ALLOWED".
func MethodNotAllowed(c *fiber.Ctx) error {
	return reply(c, http.StatusMethodNotAllowed, "method not allowed", "METHOD_NOT_ALLOWED")
}

// InternalError responds with 500 and code "INTERNAL_ERROR".
// The original error is intentionally not exposed to the client.
func InternalError(c *fiber.Ctx, _ error) error {
	return reply(c, http.StatusInternalServerError, "an internal error occurred", "INTERNAL_ERROR")
}

// TooManyRequests responds with 429 and code "TOO_MANY_REQUESTS".
func TooManyRequests(c *fiber.Ctx, msg string) error {
	return reply(c, http.StatusTooManyRequests, msg, "TOO_MANY_REQUESTS")
}
`;
}

// ─── internal/apierr/apierr_test.go ──────────────────────────────────────────

function apierrTestGo(v: Required<GoFiberVariables>): string {
  return `package apierr_test

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"

	"${v.module_path}/internal/apierr"
)

func makeApp(fn func(*fiber.Ctx) error) *fiber.App {
	app := fiber.New()
	app.Get("/test", fn)
	return app
}

func readJSON(t *testing.T, r io.Reader) apierr.Response {
	t.Helper()
	var out apierr.Response
	if err := json.NewDecoder(r).Decode(&out); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	return out
}

func TestBadRequest(t *testing.T) {
	app := makeApp(func(c *fiber.Ctx) error { return apierr.BadRequest(c, "invalid email") })
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	resp, _ := app.Test(req, -1)
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", resp.StatusCode)
	}
	body := readJSON(t, resp.Body)
	if body.Code != "BAD_REQUEST" {
		t.Fatalf("expected BAD_REQUEST, got %q", body.Code)
	}
	if body.Error != "invalid email" {
		t.Fatalf("unexpected error message: %q", body.Error)
	}
}

func TestNotFound(t *testing.T) {
	app := makeApp(func(c *fiber.Ctx) error { return apierr.NotFound(c, "user not found") })
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	resp, _ := app.Test(req, -1)
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", resp.StatusCode)
	}
	body := readJSON(t, resp.Body)
	if body.Code != "NOT_FOUND" {
		t.Fatalf("expected NOT_FOUND, got %q", body.Code)
	}
}

func TestUnauthorized(t *testing.T) {
	app := makeApp(func(c *fiber.Ctx) error { return apierr.Unauthorized(c) })
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	resp, _ := app.Test(req, -1)
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", resp.StatusCode)
	}
}

func TestForbidden(t *testing.T) {
	app := makeApp(func(c *fiber.Ctx) error { return apierr.Forbidden(c) })
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	resp, _ := app.Test(req, -1)
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusForbidden {
		t.Fatalf("expected 403, got %d", resp.StatusCode)
	}
	body := readJSON(t, resp.Body)
	if body.Code != "FORBIDDEN" {
		t.Fatalf("expected FORBIDDEN, got %q", body.Code)
	}
}

func TestMethodNotAllowed(t *testing.T) {
	app := makeApp(func(c *fiber.Ctx) error { return apierr.MethodNotAllowed(c) })
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	resp, _ := app.Test(req, -1)
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusMethodNotAllowed {
		t.Fatalf("expected 405, got %d", resp.StatusCode)
	}
	body := readJSON(t, resp.Body)
	if body.Code != "METHOD_NOT_ALLOWED" {
		t.Fatalf("expected METHOD_NOT_ALLOWED, got %q", body.Code)
	}
}

func TestInternalError(t *testing.T) {
	app := makeApp(func(c *fiber.Ctx) error { return apierr.InternalError(c, nil) })
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	resp, _ := app.Test(req, -1)
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusInternalServerError {
		t.Fatalf("expected 500, got %d", resp.StatusCode)
	}
	body := readJSON(t, resp.Body)
	if body.Code != "INTERNAL_ERROR" {
		t.Fatalf("expected INTERNAL_ERROR, got %q", body.Code)
	}
}

func TestTooManyRequests(t *testing.T) {
	app := makeApp(func(c *fiber.Ctx) error { return apierr.TooManyRequests(c, "slow down") })
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	resp, _ := app.Test(req, -1)
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusTooManyRequests {
		t.Fatalf("expected 429, got %d", resp.StatusCode)
	}
	body := readJSON(t, resp.Body)
	if body.Code != "TOO_MANY_REQUESTS" {
		t.Fatalf("expected TOO_MANY_REQUESTS, got %q", body.Code)
	}
}
`;
}

// ─── docs/doc.go ──────────────────────────────────────────────────────────────

function swaggerDocGo(v: Required<GoFiberVariables>): string {
  return `// Package docs provides the swaggo-generated OpenAPI specification.
//
// Run \`make docs\` to regenerate after changing handler annotations.
//
//\t@title\t\t\t${toPascalCase(v.project_name)} API
//\t@version\t\t${v.app_version}
//\t@description\t${v.description}
//\t@host\t\t\tlocalhost:${v.port}
//\t@BasePath\t\t/
//\t@schemes\t\thttp https
//\n//\t@contact.name\t${v.author}
//\t@license.name\tMIT
package docs
`;
}

// ─── internal/handlers/example.go ────────────────────────────────────────────

function exampleHandlerGo(v: Required<GoFiberVariables>): string {
  return `package handlers

import (
	"net/http"

	"github.com/gofiber/fiber/v2"

	"${v.module_path}/internal/apierr"
)

// EchoResponse is the JSON body returned by EchoParams.
type EchoResponse struct {
	Name      string \`json:"name"\`
	RequestID string \`json:"request_id"\`
}

// EchoParams is an example handler demonstrating how to:
//   - read URL path parameters
//   - use apierr for consistent JSON error responses
//   - access the request ID injected by RequestID middleware
//
// Replace or remove this file once you add your own business logic.
//
//	@Summary		Echo path parameter
//	@Description	Returns the :name path parameter together with the request ID.
//	@Tags			example
//	@Produce		json
//	@Param			name	path		string	true	"Name to echo"
//	@Success		200		{object}	handlers.EchoResponse
//	@Failure		400		{object}	apierr.Response
//	@Router			/api/v1/echo/{name} [get]
func EchoParams(c *fiber.Ctx) error {
	name := c.Params("name")
	if name == "" {
		return apierr.BadRequest(c, "name parameter is required")
	}
	rid, _ := c.Locals("request_id").(string)
	return c.Status(http.StatusOK).JSON(EchoResponse{
		Name:      name,
		RequestID: rid,
	})
}
`;
}

// ─── internal/handlers/example_test.go ───────────────────────────────────────

function exampleHandlerTestGo(v: Required<GoFiberVariables>): string {
  return `package handlers_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"

	"${v.module_path}/internal/handlers"
	"${v.module_path}/internal/middleware"
)

func newEchoApp() *fiber.App {
	app := fiber.New()
	app.Use(middleware.RequestID())
	app.Get("/echo/:name", handlers.EchoParams)
	return app
}

func TestEchoParams_Success(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/echo/alice", nil)
	resp, err := newEchoApp().Test(req, -1)
	if err != nil {
		t.Fatalf("request error: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}

	var body map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if body["name"] != "alice" {
		t.Fatalf("expected name=alice, got %v", body["name"])
	}
	if body["request_id"] == nil || body["request_id"] == "" {
		t.Fatal("expected request_id to be set by RequestID middleware")
	}
}

// TestEchoParams_EmptyName registers EchoParams on a param-free route so that
// c.Params("name") returns "" and the 400 guard executes.
func TestEchoParams_EmptyName(t *testing.T) {
	app := fiber.New()
	app.Get("/echo-bare", handlers.EchoParams)
	req := httptest.NewRequest(http.MethodGet, "/echo-bare", nil)
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("request error: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", resp.StatusCode)
	}
	var body map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		t.Fatalf("invalid JSON: %v", err)
	}
	if body["code"] != "BAD_REQUEST" {
		t.Fatalf("expected code=BAD_REQUEST, got %v", body["code"])
	}
}
`;
}

// ─── internal/config/config_test.go ──────────────────────────────────────────

function configTestGo(v: Required<GoFiberVariables>): string {
  return `package config_test

import (
	"log/slog"
	"testing"

	"${v.module_path}/internal/config"
)

func TestParseLogLevel(t *testing.T) {
	tests := []struct {
		input string
		want  slog.Level
	}{
		{"debug", slog.LevelDebug},
		{"DEBUG", slog.LevelDebug},
		{"warn", slog.LevelWarn},
		{"warning", slog.LevelWarn},
		{"error", slog.LevelError},
		{"info", slog.LevelInfo},
		{"", slog.LevelInfo},
		{"unknown", slog.LevelInfo},
	}
	for _, tc := range tests {
		got := config.ParseLogLevel(tc.input)
		if got != tc.want {
			t.Errorf("ParseLogLevel(%q) = %v, want %v", tc.input, got, tc.want)
		}
	}
}

func TestLoad_EnvOverride(t *testing.T) {
	t.Setenv("PORT", "9090")
	t.Setenv("APP_ENV", "production")
	t.Setenv("LOG_LEVEL", "warn")

	cfg := config.Load()

	if cfg.Port != "9090" {
		t.Errorf("expected Port=9090, got %q", cfg.Port)
	}
	if cfg.Env != "production" {
		t.Errorf("expected Env=production, got %q", cfg.Env)
	}
	if cfg.LogLevel != "warn" {
		t.Errorf("expected LogLevel=warn, got %q", cfg.LogLevel)
	}
}

func TestLoad_Defaults(t *testing.T) {
	// Empty string forces getEnv() to return the built-in fallback value.
	t.Setenv("PORT", "")
	t.Setenv("APP_ENV", "")
	t.Setenv("LOG_LEVEL", "")

	cfg := config.Load()

	if cfg.Port != "${v.port}" {
		t.Errorf("expected default Port=${v.port}, got %q", cfg.Port)
	}
	if cfg.Env != "development" {
		t.Errorf("expected default Env=development, got %q", cfg.Env)
	}
	// APP_ENV="" → fallback "development" → defaultLogLevel → "debug"
	if cfg.LogLevel != "debug" {
		t.Errorf("expected default LogLevel=debug (development env), got %q", cfg.LogLevel)
	}
}
`;
}

// ─── internal/middleware/cors.go ────────────────────────────────────────────────

function corsMiddlewareGo(): string {
  return `package middleware

import (
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

// CORS returns a CORS middleware configured via CORS_ALLOW_ORIGINS env var.
//
// Set CORS_ALLOW_ORIGINS="*" for development (the default when unset).
// In production supply a comma-separated list of allowed origins:
//
//	CORS_ALLOW_ORIGINS=https://app.example.com,https://admin.example.com
func CORS() fiber.Handler {
	origins := os.Getenv("CORS_ALLOW_ORIGINS")
	if origins == "" {
		origins = "*"
	}
	return cors.New(cors.Config{
		AllowOrigins:  origins,
		AllowMethods:  "GET,POST,PUT,PATCH,DELETE,OPTIONS",
		AllowHeaders:  "Origin,Content-Type,Authorization,X-Request-ID",
		ExposeHeaders: "X-Request-ID",
		MaxAge:        600,
	})
}
`;
}

// ─── internal/middleware/cors_test.go ────────────────────────────────────────────

function corsMiddlewareTestGo(v: Required<GoFiberVariables>): string {
  return `package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"

	"${v.module_path}/internal/middleware"
)

func newCORSApp(t *testing.T) *fiber.App {
	t.Helper()
	app := fiber.New()
	app.Use(middleware.CORS())
	app.Get("/ping", func(c *fiber.Ctx) error { return c.SendStatus(http.StatusOK) })
	return app
}

func TestCORS_Wildcard(t *testing.T) {
	t.Setenv("CORS_ALLOW_ORIGINS", "*")
	req := httptest.NewRequest(http.MethodGet, "/ping", nil)
	req.Header.Set("Origin", "https://example.com")
	resp, _ := newCORSApp(t).Test(req, -1)
	defer resp.Body.Close()

	if got := resp.Header.Get("Access-Control-Allow-Origin"); got != "*" {
		t.Fatalf("expected ACAO=*, got %q", got)
	}
}

func TestCORS_Preflight(t *testing.T) {
	t.Setenv("CORS_ALLOW_ORIGINS", "*")
	app := fiber.New()
	app.Use(middleware.CORS())

	req := httptest.NewRequest(http.MethodOptions, "/ping", nil)
	req.Header.Set("Origin", "https://example.com")
	req.Header.Set("Access-Control-Request-Method", "POST")
	resp, _ := app.Test(req, -1)
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent {
		t.Fatalf("expected 204 preflight, got %d", resp.StatusCode)
	}
}

func TestCORS_SpecificOrigin_Allowed(t *testing.T) {
	t.Setenv("CORS_ALLOW_ORIGINS", "https://app.example.com")
	req := httptest.NewRequest(http.MethodGet, "/ping", nil)
	req.Header.Set("Origin", "https://app.example.com")
	resp, _ := newCORSApp(t).Test(req, -1)
	defer resp.Body.Close()

	if got := resp.Header.Get("Access-Control-Allow-Origin"); got != "https://app.example.com" {
		t.Fatalf("expected ACAO=https://app.example.com, got %q", got)
	}
    }

func TestCORS_Default_Origin(t *testing.T) {
	// When CORS_ALLOW_ORIGINS is unset, middleware must default to "*".
	t.Setenv("CORS_ALLOW_ORIGINS", "")
	req := httptest.NewRequest(http.MethodGet, "/ping", nil)
	req.Header.Set("Origin", "https://anywhere.com")
	resp, _ := newCORSApp(t).Test(req, -1)
	defer resp.Body.Close()

	if got := resp.Header.Get("Access-Control-Allow-Origin"); got == "" {
		t.Fatal("expected CORS header when origins defaulting to *")
	}
    }
    `;
}

// ─── internal/server/server_test.go ────────────────────────────────────────────

function serverTestGo(v: Required<GoFiberVariables>): string {
  return `package server_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"${v.module_path}/internal/config"
	"${v.module_path}/internal/server"
)

type serverAPIError struct {
	Code    string \`json:"code"\`
	Message string \`json:"message"\`
}

func TestServer_NotFound_JSON(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/no-such-route", nil)
	resp, err := server.NewApp(config.Load()).Test(req, -1)
	if err != nil {
		t.Fatalf("request error: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", resp.StatusCode)
	}
	var body serverAPIError
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		t.Fatalf("expected JSON error body: %v", err)
	}
	if body.Code != "NOT_FOUND" {
		t.Fatalf("expected code=NOT_FOUND, got %q", body.Code)
	}
}

func TestServer_MethodNotAllowed_JSON(t *testing.T) {
	// Fiber v2 does not return 405 automatically — unmatched methods fall
	// through to the 404 catch-all, which is the expected behaviour.
	req := httptest.NewRequest(http.MethodPost, "/api/v1/health/live", nil)
	resp, err := server.NewApp(config.Load()).Test(req, -1)
	if err != nil {
		t.Fatalf("request error: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNotFound {
		t.Fatalf("expected 404 for unmatched method, got %d", resp.StatusCode)
	}
	var body serverAPIError
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		t.Fatalf("expected JSON error body: %v", err)
	}
	if body.Code != "NOT_FOUND" {
		t.Fatalf("expected code=NOT_FOUND, got %q", body.Code)
	}
}

func TestServer_CORS_Header(t *testing.T) {
	t.Setenv("CORS_ALLOW_ORIGINS", "*")
	req := httptest.NewRequest(http.MethodGet, "/api/v1/health/live", nil)
	req.Header.Set("Origin", "https://example.com")
	resp, err := server.NewApp(config.Load()).Test(req, -1)
	if err != nil {
		t.Fatalf("request error: %v", err)
	}
	defer resp.Body.Close()

	if got := resp.Header.Get("Access-Control-Allow-Origin"); got == "" {
		t.Fatal("expected Access-Control-Allow-Origin header to be set")
	}
}

func TestServer_Docs_Redirect(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/docs", nil)
	resp, err := server.NewApp(config.Load()).Test(req, -1)
	if err != nil {
		t.Fatalf("request error: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusFound {
		t.Fatalf("expected 302 redirect from /docs, got %d", resp.StatusCode)
	}
	if loc := resp.Header.Get("Location"); loc != "/docs/index.html" {
		t.Fatalf("expected Location=/docs/index.html, got %q", loc)
	}
}
`;
}

// ─── internal/middleware/ratelimit.go ───────────────────────────────────────────

function ratelimitMiddlewareGo(v: Required<GoFiberVariables>): string {
  return `package middleware

import (
	"os"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"

	"${v.module_path}/internal/apierr"
)

// RateLimit returns a per-IP sliding-window rate limiter.
// Configure the limit via RATE_LIMIT_RPS env var (requests per second, default 100).
func RateLimit() fiber.Handler {
	rps := 100
	if raw := os.Getenv("RATE_LIMIT_RPS"); raw != "" {
		if n, err := strconv.Atoi(raw); err == nil && n > 0 {
			rps = n
		}
	}
	return limiter.New(limiter.Config{
		Max:        rps,
		Expiration: time.Second,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return apierr.TooManyRequests(c, "rate limit exceeded")
		},
	})
}
`;
}

// ─── internal/middleware/ratelimit_test.go ──────────────────────────────────────

function ratelimitMiddlewareTestGo(v: Required<GoFiberVariables>): string {
  return `package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"

	"${v.module_path}/internal/middleware"
)

func newRateLimitApp(t *testing.T) *fiber.App {
	t.Helper()
	app := fiber.New()
	app.Use(middleware.RateLimit())
	app.Get("/", func(c *fiber.Ctx) error { return c.SendStatus(http.StatusOK) })
	return app
}

func TestRateLimit_AllowsUnderLimit(t *testing.T) {
	t.Setenv("RATE_LIMIT_RPS", "3")
	app := newRateLimitApp(t)

	for i := 0; i < 3; i++ {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		resp, err := app.Test(req, -1)
		if err != nil {
			t.Fatalf("request %d: %v", i+1, err)
		}
		resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			t.Fatalf("request %d: expected 200, got %d", i+1, resp.StatusCode)
		}
	}
}

func TestRateLimit_Blocks_After_Limit(t *testing.T) {
	t.Setenv("RATE_LIMIT_RPS", "2")
	app := newRateLimitApp(t)

	// Exhaust the limit.
	for i := 0; i < 2; i++ {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		resp, _ := app.Test(req, -1)
		resp.Body.Close()
	}

	// Next request must be rejected.
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("over-limit request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusTooManyRequests {
		t.Fatalf("expected 429, got %d", resp.StatusCode)
	}
}

func TestRateLimit_InvalidRPS(t *testing.T) {
	// Invalid value should fall back to default (100 rps) and allow normal requests.
	t.Setenv("RATE_LIMIT_RPS", "not-a-number")
	app := newRateLimitApp(t)
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	resp, err := app.Test(req, -1)
	if err != nil {
		t.Fatalf("request error: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 with invalid RPS env, got %d", resp.StatusCode)
	}
}
`;
}

// ─── .air.toml ────────────────────────────────────────────────────────────────

function airToml(v: Required<GoFiberVariables>): string {
  return `# Air — live reload for Go projects
# https://github.com/air-verse/air
root = "."
tmp_dir = "tmp"

[build]
	pre_cmd        = ["$(go env GOPATH)/bin/swag init -g main.go -d cmd/server,internal/handlers,internal/apierr -o docs --parseDependency 2>/dev/null || true"]
  cmd            = "go build -o ./tmp/server ./cmd/server"
  bin            = "./tmp/server"
  include_ext    = ["go", "yaml", "yml", "env"]
  exclude_dir    = ["tmp", "vendor", ".git", "testdata", "docs"]
  delay          = 500
  rerun_delay    = 500
  send_interrupt = true
  kill_delay     = "200ms"

[env]
  PORT     = "${v.port}"

[misc]
  clean_on_exit = true

[log]
  time = false
`;
}

function golangciYml(modulePath: string): string {
  return `run:
  timeout: 5m

linters:
  enable:
    - bodyclose
    - durationcheck
    - errcheck
    - errname
    - errorlint
    - gci
    - goimports
    - gosimple
    - govet
    - ineffassign
    - misspell
    - noctx
    - nolintlint
    - prealloc
    - staticcheck
    - unconvert
    - unused
    - wrapcheck

linters-settings:
  gci:
    sections:
      - standard
      - default
      - prefix(${modulePath})
  goimports:
    local-prefixes: "${modulePath}"
  govet:
    enable:
      - shadow
  wrapcheck:
    ignorePackageGlobs:
      - "${modulePath}/*"

issues:
  max-same-issues: 5
  exclude-rules:
    - path: _test\.go
      linters:
        - errcheck
        - wrapcheck
`;
}

function contextJson(): string {
  return JSON.stringify({ engine: 'npm', runtime: 'go' }, null, 2);
}

function rapidkitScript(v: Required<GoFiberVariables>): string {
  return `#!/usr/bin/env sh
# RapidKit Go/Fiber project launcher — generated by RapidKit CLI
# https://getrapidkit.com

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CMD="\${1:-}"
shift 2>/dev/null || true

case "$CMD" in
  init)
    cd "$SCRIPT_DIR"
    echo "🐹 Initializing Go/Fiber project…"
    GOBIN="$(go env GOPATH)/bin"
    echo "  → installing air (hot reload)…"
    go install github.com/air-verse/air@latest 2>/dev/null && echo "  ✓ air" || echo "  ⚠  air install failed (run: go install github.com/air-verse/air@latest)"
    echo "  → installing swag (swagger)…"
    go install github.com/swaggo/swag/cmd/swag@latest 2>/dev/null && echo "  ✓ swag" || echo "  ⚠  swag install failed (run: go install github.com/swaggo/swag/cmd/swag@latest)"
    if [ ! -f ".env" ] && [ -f ".env.example" ]; then
      cp .env.example .env && echo "  ✓ .env created from .env.example"
    fi
    go mod tidy && echo "  ✓ go mod tidy"
    echo "  → generating swagger docs (first build)…"
		"$(go env GOPATH)/bin/swag" init -g main.go -d cmd/server,internal/handlers,internal/apierr -o docs --parseDependency 2>/dev/null \
      && echo "  ✓ swagger docs generated" \
      || echo "  ⚠  swagger docs skipped (run: rapidkit docs)"
    echo "✅ Ready — run: rapidkit dev"
    ;;
  dev)
    cd "$SCRIPT_DIR"
    echo "📖 Syncing swagger docs…"
		"$(go env GOPATH)/bin/swag" init -g main.go -d cmd/server,internal/handlers,internal/apierr -o docs --parseDependency 2>/dev/null || true
    if [ -f "$SCRIPT_DIR/Makefile" ]; then
      exec make -C "$SCRIPT_DIR" dev "$@"
    else
      exec go run ./cmd/server "$@"
    fi
    ;;
  start)
    BIN="$SCRIPT_DIR/bin/${v.project_name}"
    if [ ! -f "$BIN" ]; then
      make -C "$SCRIPT_DIR" build
    fi
    exec "$BIN" "$@"
    ;;
  build)
    exec make -C "$SCRIPT_DIR" build "$@"
    ;;
  test)
    exec make -C "$SCRIPT_DIR" test "$@"
    ;;
  lint)
    exec make -C "$SCRIPT_DIR" lint "$@"
    ;;
  format|fmt)
    exec make -C "$SCRIPT_DIR" fmt "$@"
    ;;
  docs)
    exec make -C "$SCRIPT_DIR" docs "$@"
    ;;
  help|--help|-h)
    echo "RapidKit — Go/Fiber project: ${v.project_name}"
    echo ""
    echo "Usage: rapidkit <command>"
    echo ""
    echo "  init     Install tools + create .env  (air, swag, go mod tidy)"
    echo "  dev      Hot reload dev server        (make dev — requires air)"
    echo "  start    Run compiled binary          (make build + bin)"
    echo "  build    Build binary                 (make build)"
    echo "  docs     Generate Swagger docs        (make docs — requires swag)"
    echo "  test     Run tests                   (make test)"
    echo "  lint     Run linter                  (make lint)"
    echo "  format   Format code                 (make fmt)"
    ;;
  *)
    if [ -n "$CMD" ]; then
      echo "rapidkit: unknown command: $CMD" >&2
    fi
    echo "Available: init, dev, start, build, docs, test, lint, format" >&2
    exit 1
    ;;
esac
`;
}

function rapidkitCmd(v: Required<GoFiberVariables>): string {
  return `@echo off
rem RapidKit Go/Fiber project launcher — Windows
set CMD=%1
if "%CMD%"=="" goto usage
shift

if "%CMD%"=="init" (
  echo Initializing Go/Fiber project...
  go install github.com/air-verse/air@latest
  go install github.com/swaggo/swag/cmd/swag@latest
  if not exist .env if exist .env.example copy .env.example .env
  go mod tidy
  exit /b %ERRORLEVEL%
)
if "%CMD%"=="dev"  ( make dev %*   & exit /b %ERRORLEVEL% )
if "%CMD%"=="build" ( make build %* & exit /b %ERRORLEVEL% )
if "%CMD%"=="test"  ( make test %*  & exit /b %ERRORLEVEL% )
if "%CMD%"=="lint"  ( make lint %*  & exit /b %ERRORLEVEL% )
if "%CMD%"=="format" ( make fmt %*  & exit /b %ERRORLEVEL% )
if "%CMD%"=="docs"  ( make docs %*  & exit /b %ERRORLEVEL% )
if "%CMD%"=="start" ( bin\\${v.project_name}.exe %* & exit /b %ERRORLEVEL% )

:usage
echo Available: init, dev, start, build, docs, test, lint, format
exit /b 1
`;
}

function projectJson(v: Required<GoFiberVariables>, rapidkitVersion: string): string {
  return JSON.stringify(
    {
      kit_name: 'gofiber.standard',
      runtime: 'go',
      module_support: false,
      project_name: v.project_name,
      module_path: v.module_path,
      app_version: v.app_version,
      created_by: 'rapidkit-npm',
      rapidkit_version: rapidkitVersion,
      created_at: new Date().toISOString(),
    },
    null,
    2
  );
}

// ─── main generator ──────────────────────────────────────────────────────────

export async function generateGoFiberKit(
  projectPath: string,
  variables: GoFiberVariables
): Promise<void> {
  const v: Required<GoFiberVariables> = {
    project_name: variables.project_name,
    module_path: variables.module_path || variables.project_name,
    author: variables.author || 'RapidKit User',
    description: variables.description || `Go/Fiber REST API — ${variables.project_name}`,
    go_version: variables.go_version || '1.24',
    app_version: variables.app_version || '0.1.0',
    port: variables.port || '3000',
    skipGit: variables.skipGit ?? false,
  };

  const rapidkitVersion = getVersion();

  // Go pre-flight check — warn if not installed, but don't block scaffold
  try {
    await execa('go', ['version'], { timeout: 3000 });
  } catch {
    console.log(
      chalk.yellow(
        '\n⚠  Go not found in PATH — project will be scaffolded, but `go mod tidy` requires Go 1.21+'
      )
    );
    console.log(chalk.gray('   Install: https://go.dev/dl/\n'));
  }

  const spinner = ora(`Generating Go/Fiber project: ${v.project_name}…`).start();

  try {
    const w = (rel: string, content: string) => writeFile(path.join(projectPath, rel), content);

    const rapidkitScriptPath = path.join(projectPath, 'rapidkit');
    const rapidkitCmdPath = path.join(projectPath, 'rapidkit.cmd');

    await Promise.all([
      w('cmd/server/main.go', mainGo(v)),
      w('go.mod', goMod(v)),
      w('internal/config/config.go', configGo(v)),
      w('internal/server/server.go', routesGo(v)),
      w('internal/middleware/requestid.go', middlewareGo()),
      w('internal/middleware/requestid_test.go', middlewareTestGo(v)),
      w('internal/apierr/apierr.go', apierrGo()),
      w('internal/apierr/apierr_test.go', apierrTestGo(v)),
      w('internal/handlers/health.go', handlerHealthGo()),
      w('internal/handlers/health_test.go', mainTestGo(v)),
      w('internal/handlers/example.go', exampleHandlerGo(v)),
      w('internal/handlers/example_test.go', exampleHandlerTestGo(v)),
      w('internal/config/config_test.go', configTestGo(v)),
      w('internal/middleware/cors.go', corsMiddlewareGo()),
      w('internal/middleware/cors_test.go', corsMiddlewareTestGo(v)),
      w('internal/middleware/ratelimit.go', ratelimitMiddlewareGo(v)),
      w('internal/middleware/ratelimit_test.go', ratelimitMiddlewareTestGo(v)),
      w('internal/server/server_test.go', serverTestGo(v)),
      w('docs/doc.go', swaggerDocGo(v)),
      w('.air.toml', airToml(v)),
      w('Dockerfile', dockerfile()),
      w('docker-compose.yml', dockerCompose(v)),
      w('Makefile', makefile(v)),
      w('.golangci.yml', golangciYml(v.module_path)),
      w('.env.example', envExample(v)),
      w('.gitignore', gitignore()),
      w('.github/workflows/ci.yml', githubWorkflow(v)),
      w('README.md', readmeMd(v)),
      w('.rapidkit/project.json', projectJson(v, rapidkitVersion)),
      w('.rapidkit/context.json', contextJson()),
      w('rapidkit', rapidkitScript(v)),
      w('rapidkit.cmd', rapidkitCmd(v)),
    ]);

    // Make the launcher scripts executable
    await fs.chmod(rapidkitScriptPath, 0o755);
    await fs.chmod(rapidkitCmdPath, 0o755);

    spinner.succeed(chalk.green(`Project created at ${projectPath}`));

    // Fetch Go dependencies automatically
    try {
      spinner.start('Fetching Go dependencies…');
      await execa('go', ['mod', 'tidy'], { cwd: projectPath, timeout: 120_000 });
      spinner.succeed(chalk.gray('✓ go mod tidy completed'));
    } catch {
      spinner.warn(chalk.yellow('⚠  go mod tidy failed — run manually: go mod tidy'));
    }

    // git init
    if (!v.skipGit) {
      try {
        await execa('git', ['init'], { cwd: projectPath });
        await execa('git', ['add', '-A'], { cwd: projectPath });
        await execa(
          'git',
          ['commit', '-m', 'chore: initial scaffold (rapidkit gofiber.standard)'],
          {
            cwd: projectPath,
          }
        );
        console.log(chalk.gray('✓ git repository initialized'));
      } catch {
        console.log(chalk.gray('⚠  git init skipped (git not found or error)'));
      }
    }

    console.log('');
    console.log(chalk.bold('✅ Go/Fiber project ready!'));
    console.log('');
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.white(`  cd ${v.project_name}`));
    console.log(chalk.white('  make run            # start dev server'));
    console.log(chalk.white('  make test           # run tests'));
    console.log('');
    console.log(chalk.gray('Server will listen on port ' + v.port));
    console.log(chalk.gray('  http://localhost:' + v.port + '/api/v1/health/live'));
    console.log(chalk.gray('  http://localhost:' + v.port + '/api/v1/health/ready'));
    console.log('');
    console.log(
      chalk.yellow(
        'ℹ  RapidKit modules are not available for Go projects (module system uses Python/pip).'
      )
    );
    console.log('');
  } catch (err) {
    spinner.fail(chalk.red('Failed to generate Go/Fiber project'));
    throw err;
  }
}

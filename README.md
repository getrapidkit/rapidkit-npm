# RapidKit NPM CLI

### Build Production-Ready APIs in Seconds

FastAPI, NestJS, Go/Fiber, and Go/Gin scaffolding with production-ready defaults.  
**27+ plug-and-play modules** are available for FastAPI & NestJS projects.  
Clean architecture • Zero boilerplate • Instant deployment.

[![npm version](https://img.shields.io/npm/v/rapidkit.svg?style=flat-square)](https://www.npmjs.com/package/rapidkit)
[![Downloads](https://img.shields.io/npm/dm/rapidkit.svg?style=flat-square)](https://www.npmjs.com/package/rapidkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/getrapidkit/rapidkit-npm.svg?style=flat-square)](https://github.com/getrapidkit/rapidkit-npm/stargazers)

Official CLI for creating and operating RapidKit workspaces and projects.

- Workspace-first lifecycle (`create workspace` → `bootstrap` → `setup` → `create project`)
- Multi-runtime support (Python, Node.js, Go)
- Profile + policy enforcement (`warn` / `strict`)
- Cache and mirror lifecycle commands for stable environments

## Requirements

- Node.js `>= 20.19.6`
- Python `>= 3.10` (for Python/Core workflows)
- Go (optional, for Go projects)

## Install

```bash
npm install -g rapidkit
```

Or run directly with `npx`:

```bash
npx rapidkit --help
```

## Quick Start (Recommended)

### 1) Create a workspace

```bash
rapidkit create workspace my-workspace --yes --profile polyglot
cd my-workspace
```

### 2) Bootstrap and setup runtimes

```bash
rapidkit bootstrap --profile polyglot
rapidkit setup python
rapidkit setup node --warm-deps
rapidkit setup go --warm-deps
```

### 3) Create projects

```bash
rapidkit create project fastapi.standard my-api --yes --skip-install
rapidkit create project nestjs.standard my-nest --yes --skip-install
rapidkit create project gofiber.standard my-fiber --yes --skip-install
```

## Core Commands

### Workspace lifecycle

```bash
rapidkit create workspace <name> [--profile <profile>] [--yes]
rapidkit bootstrap [--profile <profile>] [--json]
rapidkit setup <python|node|go> [--warm-deps]
rapidkit doctor workspace [--fix]
```

### Project lifecycle

```bash
rapidkit create project <kit> <name> [--yes] [--skip-install]
rapidkit init
rapidkit dev
rapidkit test
rapidkit build
rapidkit start
```

### Operations

```bash
rapidkit cache <status|clear|prune|repair>
rapidkit mirror <status|sync|verify|rotate>
```

## Profiles

- `minimal` — baseline workspace scaffolding
- `python-only` — Python-focused workspace
- `node-only` — Node.js-focused workspace
- `go-only` — Go-focused workspace
- `polyglot` — Python + Node.js + Go
- `enterprise` — polyglot + governance-oriented checks

## Policy Modes

`mode` in `.rapidkit/policies.yml` controls enforcement:

- `warn` (default): report violations, continue
- `strict`: block incompatible operations

## Setup and Warm Dependencies

`setup <runtime>` validates toolchain and updates `.rapidkit/toolchain.lock`.

`--warm-deps` adds optional dependency warm-up:

- Node: lock/dependency warm-up in Node project directories
- Go: module warm-up in Go project directories
- Python: accepted, currently reports node/go scope

Warm-deps behavior is non-fatal by design and reports explicit outcome (`completed` / `failed` / `skipped`).

## VS Code Extension

Use the RapidKit VS Code extension for visual workflows and workspace operations.

- Extension repository: https://github.com/getrapidkit/rapidkit-vscode

## CI Workflow Ownership Map

Use this map to avoid overlap when editing CI:

- `.github/workflows/ci.yml`
  - Build/lint/typecheck/tests/coverage matrix
  - General quality and contract gates
- `.github/workflows/workspace-e2e-matrix.yml`
  - Cross-OS workspace lifecycle smoke
  - Setup (`--warm-deps`) + cache/mirror ops
  - Chaos/non-fatal warm-deps behavior (Ubuntu job)
- `.github/workflows/windows-bridge-e2e.yml`
  - Native Windows bridge/lifecycle checks
- `.github/workflows/e2e-smoke.yml`
  - Focused bridge regression smoke (fast, narrow scope)
- `.github/workflows/security.yml`
  - Security scanning and policy checks

## Documentation Index

Primary docs live under `docs/`:

- General docs index: [docs/README.md](docs/README.md)
- Setup details: [docs/SETUP.md](docs/SETUP.md)
- Doctor command: [docs/doctor-command.md](docs/doctor-command.md)
- Workspace marker spec: [docs/WORKSPACE_MARKER_SPEC.md](docs/WORKSPACE_MARKER_SPEC.md)
- Config file guide: [docs/config-file-guide.md](docs/config-file-guide.md)
- Package manager policy: [docs/PACKAGE_MANAGER_POLICY.md](docs/PACKAGE_MANAGER_POLICY.md)
- Security: [docs/SECURITY.md](docs/SECURITY.md)
- Development: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)

## Development

```bash
npm ci
npm run build
npm run test
npm run lint
npm run typecheck
```

Link local CLI globally for manual testing:

```bash
npm run install:local
rapidkit --version
```

## Troubleshooting

- If setup output looks stale, run `rapidkit setup <runtime>` again to refresh `.rapidkit/toolchain.lock`.
- If dependency warm-up is skipped, verify you are inside the corresponding project directory (`package.json` for Node, `go.mod` for Go).
- For strict-mode blocks, inspect `.rapidkit/policies.yml` and workspace profile in `.rapidkit/workspace.json`.

## License

MIT — see [LICENSE](LICENSE).

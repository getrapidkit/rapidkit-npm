# Setup & Workflow

This document is the canonical setup/reference for maintaining the RapidKit npm CLI.

If you are an end user, start with:
- `../README.md`
- `./OPEN_SOURCE_USER_SCENARIOS.md`
- `./doctor-command.md`

## Prerequisites

- Node.js `>= 20.19.6`
- npm (official and only supported package manager for this repository)

Policy details: `./PACKAGE_MANAGER_POLICY.md`

## Install

```bash
npm ci
```

## Build & Quality Gates

```bash
npm run build
npm run validate
npm run validate:docs
```

- `validate`: typecheck + lint + format + tests
- `validate:docs`: markdown links + docs drift guard + docs examples + README command smoke

## Workspace-Based CLI Smoke (Recommended)

```bash
npm run build

# CLI surface
node dist/index.js --help
node dist/index.js --version

# Workspace lifecycle
node dist/index.js create workspace test-ws --yes --profile polyglot
cd test-ws
node ../dist/index.js bootstrap --profile polyglot
node ../dist/index.js setup python
node ../dist/index.js setup node --warm-deps
node ../dist/index.js setup go --warm-deps
node ../dist/index.js cache status
node ../dist/index.js mirror status
```

## Scenario Matrix (Release Confidence)

```bash
npm run test:scenarios
npm run test:scenarios:full
npm run test:scenarios:docker
```

## Packaging Sanity Check

```bash
npm pack --dry-run
```

## Common Development Commands

```bash
npm run typecheck
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run test
npm run test:coverage
```

## Environment Variables

Bridge + Core integration:

- `RAPIDKIT_DEV_PATH`: local RapidKit Core checkout path for development/testing
- `RAPIDKIT_CORE_PYTHON_PACKAGE`: override Core install target for Python bridge
- `RAPIDKIT_BRIDGE_FORCE_VENV=1`: force cached bridge venv even if system Python has Core
- `RAPIDKIT_BRIDGE_UPGRADE_PIP=1`: upgrade pip inside bridge venv during bootstrap
- `XDG_CACHE_HOME`: cache root used by bridge (Linux default: `$HOME/.cache`)

Scenario toggles:

- `RAPIDKIT_SCENARIO_FULL_BOOTSTRAP=1`: enable extended bootstrap scenarios
- `RAPIDKIT_SCENARIO_WORKSPACE_CREATE=1`: enable workspace creation scenario

General:

- `DEBUG`: enable debug logging (alternative to `--debug`)
- `NODE_ENV`: runtime mode

## Open-Source Release Hygiene

Before tagging a release:

```bash
npm run validate
npm run validate:docs
npm run test:scenarios
npm pack --dry-run
```

Ensure all examples use placeholders (never real credentials), and do not commit generated artifacts such as local coverage outputs unless intentionally versioned.

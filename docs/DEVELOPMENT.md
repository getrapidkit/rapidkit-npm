# Development Guide

This package is the RapidKit npm CLI (Node/TypeScript) that bootstraps and invokes the Python Core.

## Prereqs

- Node.js `>=20`
- npm (or yarn/pnpm)

## Install

```bash
npm install
```

## Quality checks

```bash
npm run validate
npm run build
```

## Configuration

### User configuration file

Create `~/.rapidkitrc.json` to set defaults:

```json
{
  "defaultKit": "fastapi.standard",
  "defaultInstallMethod": "poetry",
  "pythonVersion": "3.10",
  "author": "Your Name",
  "license": "MIT",
  "skipGit": false
}
```

Priority: CLI options > Environment variables > Config file > Defaults.

### Test mode (local Core)

Use a local RapidKit Core checkout for development/testing:

```bash
export RAPIDKIT_DEV_PATH=/path/to/local/rapidkit

# Or add to ~/.rapidkitrc.json:
# { "testRapidKitPath": "/path/to/local/rapidkit" }

npx rapidkit my-workspace --test-mode
```

## CLI workflows

### 1) Direct project creation (recommended)

```bash
npx rapidkit create project fastapi.standard my-api --output .
npx rapidkit create project nestjs.standard my-api --output .
```

### 2) Workspace mode

```bash
npx rapidkit my-workspace
cd my-workspace

# Run without activation (recommended):
./rapidkit --help

# Or activate Poetry-managed env (usually in Poetry cache):
source "$(poetry env info --path)/bin/activate"

# Interactive mode:
rapidkit create

# Or non-interactive:
rapidkit create project fastapi.standard my-api --output .
```

## Testing

```bash
npm test
npm run validate
```

Focused runs:

```bash
npm run test:e2e
npm run test:drift
```

### Scenario matrix (end-to-end)

```bash
npm run test:scenarios
npm run test:scenarios:full
npm run test:scenarios:docker
```

## Manual smoke

```bash
npm run build

node dist/index.js --help
node dist/index.js --version

node dist/index.js create project fastapi.standard test-fastapi --output .
node dist/index.js create project nestjs.standard test-nest --output .

node dist/index.js my-workspace --yes --skip-git --no-update-check
```

## Debugging

```bash
npx rapidkit my-workspace --debug
```

## Building

```bash
npm run build
npm run dev
```

## Environment variables

Bridge + Core integration:

- `RAPIDKIT_DEV_PATH` - Path to a local RapidKit checkout for workspace bootstrap in dev/test
- `RAPIDKIT_CORE_PYTHON_PACKAGE` - Override Core install target for the Python bridge (path or package spec)
- `RAPIDKIT_BRIDGE_FORCE_VENV=1` - Force using the cached bridge venv even if system Python has Core
- `RAPIDKIT_BRIDGE_UPGRADE_PIP=1` - Upgrade pip inside the bridge venv during bootstrap
- `XDG_CACHE_HOME` - Cache root used by the bridge (defaults to `~/.cache` on Linux)

Scenario script toggles:

- `RAPIDKIT_SCENARIO_FULL_BOOTSTRAP=1` - Enable bootstrap scenarios
- `RAPIDKIT_SCENARIO_WORKSPACE_CREATE=1` - Enable workspace creation scenario

General:

- `DEBUG` - Enable debug logging (alternative to `--debug`)
- `NODE_ENV` - Node environment (development/production)
  npm run build

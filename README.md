# RapidKit CLI

[![npm version](https://img.shields.io/npm/v/rapidkit.svg?style=flat-square)](https://www.npmjs.com/package/rapidkit)
[![npm downloads](https://img.shields.io/npm/dm/rapidkit.svg?style=flat-square)](https://www.npmjs.com/package/rapidkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/getrapidkit/rapidkit-npm.svg?style=flat-square)](https://github.com/getrapidkit/rapidkit-npm/stargazers)

This is the official RapidKit CLI on npm.

> 🔮 **Coming Soon:** AI-powered module recommendations when Core modules are released!
>
> _Note: The AI recommender feature is complete in the `feature/ai-recommender` branch but not yet released. We will announce it when Core module support is available._

RapidKit's single source of truth for kits and global commands is **RapidKit Core (Python)**.
This npm package is a **bridge/wrapper** that:

- Delegates project commands (e.g. `init`, `dev`, `test`) to the project-local launcher when you are inside a RapidKit project.
- Forwards global/core commands (e.g. `list`, `info`, `create`, `add`, `doctor`, `--tui`, `--json`) to `python -m rapidkit ...`.
- If `rapidkit-core` is not available in your system Python, it can bootstrap a cached virtualenv and install Core there.

**💡 Tip:** Use the [RapidKit VS Code Extension](https://marketplace.visualstudio.com/items?itemName=rapidkit.rapidkit-vscode) for a visual interface!

## Quick Start

### Create a Project (FastAPI)

```bash
npx rapidkit create project fastapi.standard my-api --output .
cd my-api
npx rapidkit init           # Install dependencies
npx rapidkit dev            # Start dev server at http://localhost:8000
```

### Create a Project (NestJS)

```bash
npx rapidkit create project nestjs.standard my-api --output .
cd my-api
npx rapidkit init           # Install dependencies
npx rapidkit dev            # Start dev server at http://localhost:8000
```

### Interactive mode (recommended)

```bash
npx rapidkit create
```

This runs the RapidKit Core wizard (`python -m rapidkit create`) and guides you through kit selection and project creation.

## Two Modes of Operation

### 1. Direct Project Creation (Core-first)

Create a standalone project directly via Core:

```bash
npx rapidkit create project fastapi.standard my-api --output .
npx rapidkit create project nestjs.standard my-api --output .
```

### 2. RapidKit Environment Mode (without `--template`)

Create a workspace to organize multiple projects:

```bash
npx rapidkit my-workspace                     # Create a RapidKit environment (installs python core)
cd my-workspace

# Interactive project creation (recommended)
rapidkit create

# Or non-interactive via kit slug
rapidkit create project fastapi.standard my-api --output .
rapidkit create project nestjs.standard admin-api --output .
```

This mode creates a "RapidKit environment" directory (Poetry/venv/pipx) and installs the Python Core there, so you can create/manage projects from the same CLI.

Note: when you choose Poetry, the virtualenv is typically created in Poetry's cache (not as a local `.venv` folder). Activate it via:

```bash
source "$(poetry env info --path)/bin/activate"
```

## Kits / Templates

Kits/templates are provided by the Python Core. This npm package is not limited to two templates.

List kits:

```bash
rapidkit list
rapidkit list --json
```

Create a project with any kit slug:

```bash
npx rapidkit create project <kit-slug> my-service --output .
```

Examples:

```bash
npx rapidkit create project fastapi.standard my-service --output .
npx rapidkit create project nestjs.standard my-service --output .
```

### Offline fallback (deprecated, last resort)

**Deprecated:** With the Python Core (PyPI `rapidkit-core`) now providing dynamic kits and the interactive wizard, the npm package no longer relies on static embedded templates. The offline fallback remains available only as an absolute last-resort for environments where Python/Core cannot be used, but it is not recommended for normal usage.

If you still need the fallback it supports:

- `fastapi.standard` (and `fastapi` shorthand)
- `nestjs.standard` (and `nestjs` shorthand)

Example (deprecated fallback):

```bash
npx rapidkit create project fastapi.standard my-api --output .
```

Limitations of the offline fallback (deprecated):

- Only FastAPI/NestJS embedded templates are supported.
- The full kit catalog (`rapidkit list`) and the interactive wizard (`rapidkit create`) require Python Core.
- `--json` output is not supported for fallback `create`.

---

### Bootstrapping Python Core into a workspace

The recommended flow is to use the Python Core (`rapidkit-core` on PyPI) as the single source of truth for kits and modules. The npm CLI will bootstrap the Python Core into a workspace virtual environment so you can create and manage projects even on a fresh machine.

Example: create a workspace and verify Core is bootstrapped

```bash
# Create a RapidKit workspace non-interactively (workspace .venv will be created)
npx rapidkit my-workspace --yes --skip-git

# Activate the workspace environment
cd my-workspace
source .venv/bin/activate

# Confirm rapidkit-core is installed inside the workspace venv
python -m pip show rapidkit-core
# -> Name: rapidkit-core
# -> Version: 0.2.1rc1 (or newer)
```

## Install Python Core (optional) 🐍🔧

RapidKit's engine is provided by the Python package `rapidkit-core` on PyPI. If you prefer to install the engine manually (for development or testing), you can do so:

```bash
# Install for current user
pip install --user rapidkit-core

# Or install into an active virtual environment / system
pip install rapidkit-core
```

Project page: https://pypi.org/project/rapidkit-core/

Notes:

- The CLI will prefer system Python with `rapidkit-core` if available. If not present it bootstraps `rapidkit-core` into the workspace `.venv` (or a cached bridge venv as a fallback for some global flows).
- To emulate a clean system in CI/QA, ensure `rapidkit-core` is not installed in the global/system Python before running the workspace creation script.
- If you prefer Poetry to create in-project virtualenvs (`.venv`), enable it via `poetry config virtualenvs.in-project true` or let the workspace installer configure Poetry for you.

## CLI Options

```bash
npx rapidkit [project-name] [options]
```

### Arguments

- `project-name` - Name of project/workspace directory to create

### Options

- `--skip-git` - Skip git initialization
- `--skip-install` - Skip installing dependencies (for NestJS)
- `--debug` - Enable verbose debug logging
- `--dry-run` - Preview what would be created without creating it
- `--no-update-check` - Skip checking for newer versions
- `--help` - Display help information
- `--version` - Show version number

## Project Commands

After creating a project, use these commands:

```bash
cd my-api
npx rapidkit init      # Install dependencies (auto-activates environment)
npx rapidkit dev       # Start dev server with hot reload (port 8000)
npx rapidkit start     # Start production server
npx rapidkit build     # Build for production
npx rapidkit test      # Run tests
npx rapidkit lint      # Lint code
npx rapidkit format    # Format code
npx rapidkit --help    # Show all commands
```

> **Note:** `npx rapidkit` automatically detects when you're inside a RapidKit project and delegates to the local CLI. Works everywhere without any setup!

> **💡 Tip:** Install globally with `npm i -g rapidkit` to use `rapidkit` directly without `npx`.

### Alternative: Direct Commands

You can also run commands directly:

```bash
./rapidkit dev          # Using the wrapper script
make dev                # Using Makefile (FastAPI)
poetry run dev          # Using Poetry directly (FastAPI)
npm run start:dev       # Using npm directly (NestJS)
```

## Project Structure

### FastAPI Project

```
my-api/
├── .rapidkit/
│   ├── activate         # Activation script
│   ├── cli.py           # Python CLI module
│   └── rapidkit         # Bash wrapper
├── rapidkit             # Main CLI entry point
├── src/
│   ├── main.py          # FastAPI application
│   ├── cli.py           # CLI commands
│   ├── routing/         # API routes
│   └── modules/         # Module system
├── tests/               # Test suite
├── pyproject.toml       # Poetry configuration
├── Makefile             # Make commands
└── README.md
```

### NestJS Project

```
my-api/
├── .rapidkit/
│   ├── activate         # Activation script
│   └── rapidkit         # Bash CLI wrapper
├── rapidkit             # Main CLI entry point
├── src/
│   ├── main.ts              # Application entry point
│   ├── app.module.ts        # Root module
│   ├── config/              # Configuration
│   └── examples/            # Example module
├── test/                    # Test files
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── README.md
```

## Requirements

- **Node.js**: 20.19.6+ (LTS recommended)
- **Python**: Required for RapidKit Core commands (e.g. `list/info/create/add/...`). If Python is missing, the bridge fails with a clear error message.
- For FastAPI projects: Python + Poetry (as required by the generated project)
- For NestJS projects: Node + a package manager (npm/yarn/pnpm)
- **Git**: For version control

> 💡 **Tip:** Use [RapidKit VS Code Extension](https://marketplace.visualstudio.com/items?itemName=rapidkit.rapidkit-vscode) - includes system checker to verify all requirements!

## How It Works (Under the Hood)

This CLI runs a Node entrypoint (`dist/index.js`) that makes these decisions:

1. If you're inside a RapidKit project:

- It detects the project (via `.rapidkit/project.json` or other signals).
- It delegates `rapidkit init/dev/test/...` to the project-local launcher (`./rapidkit` or `.rapidkit/rapidkit`).

2. If you're not inside a project and run a global/core command (e.g. `rapidkit list --json`):

- It forwards the request to the Python Core via `python -m rapidkit ...`.
- If Core is not installed in system Python, it bootstraps a cached venv and installs `rapidkit-core` there.

3. If you run `npx rapidkit <name>` without `--template`:

- It creates a "RapidKit environment" directory (Poetry/venv/pipx) so you're ready to create and run real projects.

### Bridge controls

- Override Core install target (dev/test): `RAPIDKIT_CORE_PYTHON_PACKAGE=/path/to/core`
- Cache location: `XDG_CACHE_HOME=...`
- Upgrade pip during bootstrap (optional): `RAPIDKIT_BRIDGE_UPGRADE_PIP=1`

## Development

```bash
# Clone the repository
git clone https://github.com/getrapidkit/rapidkit-npm.git
cd rapidkit-npm

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode
npm run dev
```

## Related Projects

- **RapidKit Core (Python)** - The engine (PyPI: `rapidkit-core`)
- **RapidKit Docs** - https://getrapidkit.com
- **GitHub**: https://github.com/getrapidkit

## License

MIT

## Support

- 🐛 Report issues: [GitHub Issues](https://github.com/getrapidkit/rapidkit-npm/issues)
- 📚 Docs: https://getrapidkit.com

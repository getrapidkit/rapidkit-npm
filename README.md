# rapidkit

[![npm version](https://img.shields.io/npm/v/rapidkit.svg?style=flat-square)](https://www.npmjs.com/package/rapidkit)
[![npm downloads](https://img.shields.io/npm/dm/rapidkit.svg?style=flat-square)](https://www.npmjs.com/package/rapidkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/getrapidkit/rapidkit-npm.svg?style=flat-square)](https://github.com/getrapidkit/rapidkit-npm/stargazers)

> ⚠️ **PRE-RELEASE VERSION** - This is a companion tool for RapidKit framework.  
> The stable production version of RapidKit Python will be released soon on PyPI.

🚀 The easiest way to create FastAPI and NestJS projects with RapidKit templates!

**💡 Tip:** Use the [RapidKit VS Code Extension](https://marketplace.visualstudio.com/items?itemName=rapidkit.rapidkit-vscode) for a visual interface!

## Quick Start

### Create a FastAPI Project

```bash
npx rapidkit my-api --template fastapi
cd my-api
rapidkit init               # Install dependencies
rapidkit dev                # Start dev server at http://localhost:8000
```

### Create a NestJS Project

```bash
npx rapidkit my-api --template nestjs
cd my-api
rapidkit init               # Install dependencies
rapidkit dev                # Start dev server at http://localhost:8000
```

Your API will be available at `http://localhost:8000` with Swagger docs at `/docs`

## Two Modes of Operation

### 1. Direct Project Creation (with `--template`)

Create a standalone project directly:

```bash
npx rapidkit my-api --template fastapi   # Create FastAPI project
npx rapidkit my-api --template nestjs    # Create NestJS project
```

### 2. Workspace Mode (without `--template`)

Create a workspace that can contain multiple projects:

```bash
npx rapidkit my-workspace                     # Create workspace
cd my-workspace
rapidkit create my-api --template fastapi     # Create FastAPI project in workspace
rapidkit create admin-api --template nestjs   # Create NestJS project in workspace
```

## Templates

| Template | Framework | Description |
|----------|-----------|-------------|
| `fastapi` | FastAPI | Python async web framework with automatic API docs |
| `nestjs` | NestJS | TypeScript Node.js framework with modular architecture |

## CLI Options

```bash
npx rapidkit [project-name] [options]
```

### Arguments
- `project-name` - Name of project/workspace directory to create

### Options
- `-t, --template <template>` - Template to use: `fastapi` or `nestjs` (creates direct project)
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
rapidkit init      # Install dependencies (auto-activates environment)
rapidkit dev       # Start dev server with hot reload (port 8000)
rapidkit start     # Start production server
rapidkit build     # Build for production
rapidkit test      # Run tests
rapidkit lint      # Lint code
rapidkit format    # Format code
rapidkit --help    # Show all commands
```

> **Note:** The global `rapidkit` command automatically detects when you're inside a RapidKit project and delegates to the local CLI. No need for `./rapidkit` prefix or `source .rapidkit/activate`.

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

- **Node.js**: 18+ (for running npx)
- **For FastAPI**: Python 3.11+ with Poetry
- **For NestJS**: Node.js 20+ with npm/yarn/pnpm

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

- **RapidKit Python** - The core framework (coming soon to PyPI)
- **RapidKit Docs** - https://rapidkit.top
- **GitHub**: https://github.com/getrapidkit

## License

MIT

## Support

- 🐛 Report issues: [GitHub Issues](https://github.com/getrapidkit/rapidkit-npm/issues)
- 📚 Docs: https://rapidkit.top

---

**v0.12.1** - Simplified CLI: `rapidkit init` now handles environment activation automatically

**v0.12.0** - Added NestJS template, workspace mode, and unified CLI

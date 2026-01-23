# RapidKit CLI

[![npm version](https://img.shields.io/npm/v/rapidkit.svg?style=flat-square)](https://www.npmjs.com/package/rapidkit)
[![npm downloads](https://img.shields.io/npm/dm/rapidkit.svg?style=flat-square)](https://www.npmjs.com/package/rapidkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/getrapidkit/rapidkit-npm.svg?style=flat-square)](https://github.com/getrapidkit/rapidkit-npm/stargazers)

> ⚠️ **PREVIEW VERSION** - This package provides demo templates for testing RapidKit's workflow.  
> Full module ecosystem and advanced features will be available after the Python Core release.

🚀 The easiest way to create FastAPI and NestJS projects with RapidKit templates!

> 🔮 **Coming Soon:** AI-powered module recommendations when Core modules are released!

**💡 Tip:** Use the [RapidKit VS Code Extension](https://marketplace.visualstudio.com/items?itemName=rapidkit.rapidkit-vscode) for a visual interface!

## Quick Start

### Create a FastAPI Project

```bash
npx rapidkit my-api --template fastapi
cd my-api
npx rapidkit init           # Install dependencies
npx rapidkit dev            # Start dev server at http://localhost:8000
```

### Create a NestJS Project

```bash
npx rapidkit my-api --template nestjs
cd my-api
npx rapidkit init           # Install dependencies
npx rapidkit dev            # Start dev server at http://localhost:8000
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

Create a workspace to organize multiple projects:

```bash
npx rapidkit my-workspace                     # Create workspace
cd my-workspace
npx rapidkit my-api --template fastapi        # Create FastAPI project
npx rapidkit admin-api --template nestjs      # Create NestJS project
```

> **Note:** The same `npx rapidkit <name> --template <type>` command works everywhere - in any directory or inside a workspace!

## Templates

| Template  | Framework | Description                                            |
| --------- | --------- | ------------------------------------------------------ |
| `fastapi` | FastAPI   | Python async web framework with automatic API docs     |
| `nestjs`  | NestJS    | TypeScript Node.js framework with modular architecture |

> 📦 **Note:** These templates are designed for testing the RapidKit workflow. Full module ecosystem coming with Core release!

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
- **For FastAPI**: Python 3.10.14+ with Poetry 2.2.1+
- **For NestJS**: Node.js 20+ with npm/yarn/pnpm
- **Git**: For version control

> 💡 **Tip:** Use [RapidKit VS Code Extension](https://marketplace.visualstudio.com/items?itemName=rapidkit.rapidkit-vscode) - includes system checker to verify all requirements!

## What's Next?

This npm package is currently in **preview mode** with demo templates. Here's what's coming:

### 🚀 After Core Release (v1.0.0)

- **Full Module Ecosystem** - 50+ production-ready modules
- **AI-Powered Recommendations** - Intelligent module suggestions
- **Seamless Integration** - npm package becomes thin wrapper over Python Core
- **Dynamic Modules** - Install any module from the registry
- **Advanced Features** - All RapidKit power through npm

### 📦 Current Focus (v0.15.0)

- Polish existing features
- Improve documentation
- Optimize bundle size
- Prepare Core integration bridge
- Enhanced error messages

**Stay tuned!** Follow our progress on [GitHub](https://github.com/getrapidkit/rapidkit-npm).

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
- **RapidKit Docs** - https://getrapidkit.com
- **GitHub**: https://github.com/getrapidkit

## License

MIT

## Support

- 🐛 Report issues: [GitHub Issues](https://github.com/getrapidkit/rapidkit-npm/issues)
- 📚 Docs: https://getrapidkit.com

---

**v0.13.0** - NestJS test coverage boost (75%→90%), demo-kit improvements

**v0.12.4** - Friendly shell activation UX with green headers and robust fallback logic

**v0.12.2** - Simplified CLI: `rapidkit init` now handles environment activation automatically

**v0.12.0** - Added NestJS template, workspace mode, and unified CLI

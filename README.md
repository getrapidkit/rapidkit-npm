<div align="center">

# 🚀 RapidKit CLI

**Build Modern Applications at Warp Speed**

An open-source framework that helps developers build, scale, and deploy production-ready APIs — faster. Clean architecture, modular design, and automation-first workflows for FastAPI & NestJS.

[![npm version](https://img.shields.io/npm/v/rapidkit.svg?style=flat-square)](https://www.npmjs.com/package/rapidkit)
[![Downloads](https://img.shields.io/npm/dm/rapidkit.svg?style=flat-square)](https://www.npmjs.com/package/rapidkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/getrapidkit/rapidkit-npm.svg?style=flat-square)](https://github.com/getrapidkit/rapidkit-npm/stargazers)

[Quick Start](#-quick-start) • [Features](#-features) • [Docs](https://getrapidkit.com) • [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=rapidkit.rapidkit-vscode)

</div>

---

## 🎯 What is RapidKit?

RapidKit is a professional project scaffolding CLI for FastAPI and NestJS that delivers production-ready applications in seconds. Built on a powerful Python core engine, it provides:

- 🏗️ **Instant Scaffolding** - Generate production-ready projects with best practices baked in
- 🧩 **27+ Free Modules** - Plug-and-play modules for auth, databases, caching, monitoring, and more
- 🎨 **Consistent Architecture** - Maintain the same structure across all your projects and teams
- 🔄 **Workspace Management** - Organize multiple microservices in one environment
- 🤖 **VS Code Integration** - Visual interface for creating projects and managing modules

**Perfect for:**
- Starting new microservices quickly
- Maintaining architectural consistency across teams
- Rapid prototyping with production-ready structure
- Learning best practices for FastAPI/NestJS development

---

## 📦 Table of Contents

- [What is RapidKit?](#-what-is-rapidkit)
- [Features](#-features)
- [Quick Start](#-quick-start)
  - [Standalone Project](#standalone-project)
  - [Workspace Mode](#workspace-mode-recommended)
- [Workspace vs Standalone](#-workspace-vs-standalone)
- [Available Commands](#-available-commands)
  - [Project Commands](#project-commands)
  - [Global Commands](#global-commands)
  - [Workspace Commands](#workspace-commands)
- [Module System](#-module-system)
- [Architecture](#-architecture)
- [Workspace Management](#-workspace-management)
- [Project Structure](#-project-structure)
- [Requirements](#-requirements)
- [CLI Options](#-cli-options)
- [Troubleshooting](#-troubleshooting)
- [FAQs](#-faqs)
- [Development](#-development)
- [Contributing](#-contributing)
- [Related Projects](#-related-projects)
- [License](#-license)
- [Support](#-support)

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🚀 **Instant Scaffolding**
- FastAPI DDD & Standard kits
- NestJS Standard kit
- Production-ready project structure
- Docker & CI/CD configuration included
- Best practices baked in

</td>
<td width="50%">

### 🧩 **Modular Architecture**
- 27+ free plug-and-play modules
- Authentication (JWT, OAuth, WebAuthn)
- Databases (PostgreSQL, MongoDB, Redis)
- Monitoring, logging, and tracing
- Caching and message queues

</td>
</tr>
<tr>
<td width="50%">

### 🎯 **Workspace Management**
- Organize multiple projects
- Shared Python environment
- Auto-tracking in registry
- VS Code Extension integration
- Cross-tool compatibility

</td>
<td width="50%">

### 🔧 **Developer Experience**
- Interactive TUI wizard
- Hot reload development
- Built-in testing & linting
- Comprehensive CLI commands
- One-command project setup

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Standalone Project

Perfect for single projects or trying out RapidKit:

**FastAPI:**
```bash
npx rapidkit create project fastapi.standard my-api
cd my-api
npx rapidkit init           # Install dependencies
npx rapidkit dev            # Start dev server at http://localhost:8000
```

**NestJS:**
```bash
npx rapidkit create project nestjs.standard my-service
cd my-service
npx rapidkit init           # Install dependencies
npx rapidkit dev            # Start dev server at http://localhost:3000
```

### Workspace Mode (Recommended)

For teams, microservices, or multiple projects:

```bash
# 1. Create workspace
npx rapidkit my-workspace
cd my-workspace

# 2. Activate environment (choose one method):

# Method A: Activate virtualenv (once per terminal session)
source "$(poetry env info --path)/bin/activate"

# Method B: Use poetry run prefix (every command)
poetry run rapidkit create

# Method C: Create alias (recommended - add to ~/.bashrc or ~/.zshrc)
alias rapidkit="poetry run rapidkit"

# 3. Create projects interactively
rapidkit create                              # Interactive wizard

# Or create directly
rapidkit create project fastapi.standard api-gateway
rapidkit create project nestjs.standard user-service
rapidkit create project fastapi.ddd order-service

# 4. View all projects
rapidkit workspace list
```

**Why use workspace mode?**
- ✅ One shared Python environment for all projects
- ✅ All projects auto-tracked in `~/.rapidkit/workspaces.json`
- ✅ VS Code Extension auto-discovers your projects
- ✅ Consistent RapidKit Core version across projects
- ✅ Easier dependency management

---

## 🆚 Workspace vs Standalone

Choose the right mode for your use case:

<table>
<thead>
<tr>
<th width="25%">Feature</th>
<th width="37.5%">Workspace Mode</th>
<th width="37.5%">Standalone</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Best for</strong></td>
<td>✅ Teams, microservices, multiple projects</td>
<td>⚡ Single project, quick prototyping</td>
</tr>
<tr>
<td><strong>Python Environment</strong></td>
<td>✅ Shared across all projects (~150MB once)</td>
<td>⚠️ Separate per project (150MB each)</td>
</tr>
<tr>
<td><strong>Project Registry</strong></td>
<td>✅ Auto-tracked in <code>~/.rapidkit/workspaces.json</code></td>
<td>❌ Not tracked</td>
</tr>
<tr>
<td><strong>VS Code Extension</strong></td>
<td>✅ Auto-discovers all projects</td>
<td>⚠️ Manual discovery</td>
</tr>
<tr>
<td><strong>Setup Time</strong></td>
<td>⏱️ ~2 minutes (once)</td>
<td>⏱️ ~30 seconds</td>
</tr>
<tr>
<td><strong>Disk Usage</strong></td>
<td>✅ Efficient (one venv)</td>
<td>⚠️ Higher (multiple venvs)</td>
</tr>
<tr>
<td><strong>Dependency Management</strong></td>
<td>✅ Centralized Core version</td>
<td>⚠️ Independent per project</td>
</tr>
<tr>
<td><strong>Use Case</strong></td>
<td>Production teams, long-term projects</td>
<td>Quick demos, learning, single services</td>
</tr>
</tbody>
</table>

---

## 🎯 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    RapidKit CLI (npm)                        │
│   • Command routing & delegation                             │
│   • Workspace management & registry                          │
│   • VS Code Extension integration                            │
│   • Python Core bridge & bootstrapping                       │
└────────────────────────┬─────────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
┌──────────────────────┐  ┌──────────────────────────┐
│  Project Local CLI   │  │   RapidKit Core          │
│  Launcher            │  │   (Python Engine)        │
├──────────────────────┤  ├──────────────────────────┤
│  • init              │  │  • create                │
│  • dev               │  │  • add module            │
│  • test              │  │  • list kits/modules     │
│  • build             │  │  • info                  │
│  • lint              │  │  • doctor                │
│  • format            │  │  • upgrade               │
│  • start             │  │  • TUI wizard            │
└──────────────────────┘  └──────────────────────────┘
         │                          │
         └──────────┬───────────────┘
                    ▼
         ┌────────────────────┐
         │  Generated Project │
         │  (FastAPI/NestJS)  │
         └────────────────────┘
```

**How it works:**

1. **Inside a project:** Commands like `init`, `dev`, `test` are delegated to the project-local launcher
2. **Outside a project:** Commands like `create`, `list`, `add` are forwarded to RapidKit Core (Python)
3. **Workspace mode:** Python Core is installed in workspace venv via Poetry/pipx
4. **Standalone mode:** Each project manages its own environment

---

## 💻 Available Commands

### Project Commands

Run these inside a RapidKit project:

```bash
npx rapidkit init      # Install dependencies (auto-activates environment)
npx rapidkit dev       # Start dev server with hot reload
npx rapidkit start     # Start production server
npx rapidkit build     # Build for production
npx rapidkit test      # Run tests with coverage
npx rapidkit lint      # Run linting checks
npx rapidkit format    # Format code automatically
npx rapidkit --help    # Show all commands
```

### Global Commands

Run these anywhere:

```bash
# Project creation
npx rapidkit create                              # Interactive wizard
npx rapidkit create project <kit> <name>         # Direct creation

# Information
npx rapidkit list                                # List available kits
npx rapidkit list modules                        # List available modules
npx rapidkit info kit <name>                     # Kit details
npx rapidkit info module <name>                  # Module details

# System
npx rapidkit doctor                              # Diagnose environment
npx rapidkit --version                           # Show version
npx rapidkit --tui                               # Launch interactive TUI

# Workspace management
npx rapidkit workspace list                      # List workspaces
npx rapidkit workspace sync                      # Sync projects
```

### Workspace Commands

```bash
# List all registered workspaces
rapidkit workspace list

# Sync current workspace (scan for new projects)
rapidkit workspace sync
```

---

---

## 🧩 Module System

RapidKit's modular architecture lets you extend your project with pre-built modules.

### Adding Modules

```bash
# Add single module
rapidkit add module <module-slug>

# Examples
rapidkit add module auth           # Authentication
rapidkit add module db_postgres    # PostgreSQL
rapidkit add module redis          # Redis caching
rapidkit add module monitoring     # Monitoring & metrics
```

### List Available Modules

```bash
rapidkit list modules              # Human-readable list
rapidkit list modules --json       # JSON format
```

### Module Information

```bash
rapidkit info module auth          # View module details
rapidkit info module db_postgres   # Dependencies, config, etc.
```

### Available Modules (27 Total)

#### 🔐 Authentication & Authorization (5)

| Module | Slug | Description |
|--------|------|-------------|
| **Authentication Core** | `auth` | Opinionated password hashing, token signing, and runtime auth |
| **API Keys** | `api_keys` | API key issuance, verification, and auditing |
| **OAuth Providers** | `oauth` | Lightweight OAuth 2.0 scaffolding with provider registry |
| **Passwordless Authentication** | `passwordless` | Magic link and one-time code authentication helpers |
| **Session Management** | `session` | Opinionated session management with signed cookies |

#### 💳 Billing & E-commerce (3)

| Module | Slug | Description |
|--------|------|-------------|
| **Cart** | `cart` | Shopping cart service for checkout flows |
| **Inventory** | `inventory` | Inventory and pricing service backing Cart + Stripe |
| **Stripe Payment** | `stripe` | Stripe payments and subscriptions |

#### 🗄️ Database (3)

| Module | Slug | Description |
|--------|------|-------------|
| **PostgreSQL** | `db_postgres` | SQLAlchemy async+sync Postgres with clean DI, healthcheck |
| **MongoDB** | `db_mongo` | MongoDB integration with async driver support, health diagnostics |
| **SQLite** | `db_sqlite` | SQLite database integration for development |

#### 🔒 Security (3)

| Module | Slug | Description |
|--------|------|-------------|
| **CORS** | `cors` | Cross-Origin Resource Sharing security module |
| **Rate Limiting** | `rate_limiting` | Production request throttling with configurable rules |
| **Security Headers** | `security_headers` | Harden HTTP responses with industry-standard security headers |

#### 📧 Communication (2)

| Module | Slug | Description |
|--------|------|-------------|
| **Email** | `email` | Email sending capabilities |
| **Unified Notifications** | `notifications` | Email-first notification runtime with SMTP delivery |

#### 👥 User Management (2)

| Module | Slug | Description |
|--------|------|-------------|
| **Users Core** | `users` | Opinionated user management backbone with immutable user records |
| **Users Profiles** | `users_profiles` | Extends Users Core with rich profile modeling |

#### ⚙️ Essentials (4)

| Module | Slug | Description |
|--------|------|-------------|
| **Application Settings** | `settings` | Centralized modular configuration management using Pydantic |
| **Middleware** | `middleware` | HTTP middleware pipeline with FastAPI and NestJS support |
| **Structured Logging** | `logging` | Structured logging runtime with correlation IDs, multi-sink output |
| **Deployment Toolkit** | `deployment` | Portable Docker, Compose, Makefile, and CI assets for RapidKit |

#### 📊 Observability (1)

| Module | Slug | Description |
|--------|------|-------------|
| **Observability Core** | `observability` | Cohesive metrics, tracing, and structured logging foundation |

#### 💾 Caching (1)

| Module | Slug | Description |
|--------|------|-------------|
| **Redis Cache** | `redis` | Production Redis runtime with async and sync client support |

#### 🤖 AI (1)

| Module | Slug | Description |
|--------|------|-------------|
| **AI Assistant** | `ai_assistant` | AI assistant integration capabilities |

#### ⚡ Tasks (1)

| Module | Slug | Description |
|--------|------|-------------|
| **Celery** | `celery` | Production Celery task orchestration for asynchronous workflows |

#### 💼 Business (1)

| Module | Slug | Description |
|--------|------|-------------|
| **Storage** | `storage` | File Storage & Media Management - Upload, store, and retrieve files |

> **💡 Tip:** Use `rapidkit modules list` to see all modules with versions and status, or install the [RapidKit VS Code Extension](https://marketplace.visualstudio.com/items?itemName=rapidkit.rapidkit-vscode) to browse and install modules visually!

---

## 🗂️ Workspace Management

RapidKit maintains a shared workspace registry at `~/.rapidkit/workspaces.json` for cross-tool compatibility with the VS Code Extension.

### List Registered Workspaces

```bash
rapidkit workspace list
```

**Example output:**
```
📦 Registered RapidKit Workspaces:

  my-workspace
    Path: /home/user/projects/my-workspace
    Projects: 3

  microservices
    Path: /home/user/work/microservices
    Projects: 7

Total: 2 workspace(s)
```

### Sync Workspace Projects

Projects are automatically tracked when created. Manual sync is available if needed:

```bash
cd my-workspace
rapidkit workspace sync
```

This scans the workspace directory and registers all RapidKit projects (directories with `.rapidkit/context.json` or `.rapidkit/project.json`).

**When to use manual sync:**
- Manually moved/copied projects into workspace
- Created projects before sync feature existed
- Registry got out of sync
- Want to refresh after external changes

### Registry Format

The registry stores workspace and project metadata:

```json
{
  "workspaces": [
    {
      "name": "my-workspace",
      "path": "/home/user/projects/my-workspace",
      "mode": "full",
      "projects": [
        {
          "name": "api-gateway",
          "path": "/home/user/projects/my-workspace/api-gateway"
        },
        {
          "name": "user-service",
          "path": "/home/user/projects/my-workspace/user-service"
        }
      ]
    }
  ]
}
```

**Auto-registration:**
- Workspaces registered when created via `npx rapidkit <name>` or VS Code Extension
- Projects registered when created via `rapidkit create project ...` inside workspace
- VS Code Extension and npm CLI share the same registry

---

## 📁 Project Structure

### Workspace

```
my-workspace/
├── my-api/              # FastAPI project
│   ├── .rapidkit/       # Project config
│   ├── src/             # Source code
│   ├── config/          # Configuration
│   ├── tests/           # Test suite
│   ├── pyproject.toml   # Poetry config
│   └── Dockerfile       # Docker setup
├── my-service/          # NestJS project
│   ├── .rapidkit/       # Project config
│   ├── src/             # Source code
│   ├── test/            # Test suite
│   ├── package.json     # npm config
│   └── Dockerfile       # Docker setup
├── .venv/               # Workspace Python environment
├── .rapidkit-workspace  # Workspace metadata
├── poetry.lock          # Locked Python dependencies
├── pyproject.toml       # Workspace Python config
├── rapidkit             # CLI script (bash)
├── rapidkit.cmd         # CLI script (Windows)
├── README.md
└── Makefile
```

### FastAPI Project

```
my-api/
├── .rapidkit/               # RapidKit config
│   ├── project.json         # Project metadata
│   ├── context.json         # Project context
│   ├── cli.py               # Local CLI module
│   └── activate             # Environment activation
├── src/                     # Source code
│   ├── main.py              # FastAPI entry point
│   ├── routing/             # API routes
│   │   ├── __init__.py
│   │   ├── health.py
│   │   └── examples.py
│   └── modules/             # Feature modules
│       └── __init__.py
├── config/                  # Configuration
├── tests/                   # Test suite
│   ├── __init__.py
│   ├── test_health.py
│   └── test_examples.py
├── .github/                 # GitHub workflows
├── .env.example             # Environment template
├── .gitignore
├── bootstrap.sh             # Setup script
├── docker-compose.yml       # Docker Compose
├── Dockerfile               # Docker configuration
├── Makefile                 # Make commands
├── poetry.lock              # Locked dependencies
├── pyproject.toml           # Poetry configuration
├── LICENSE
└── README.md
```

### NestJS Project

```
my-app/
├── .rapidkit/               # RapidKit config
│   ├── project.json         # Project metadata
│   ├── context.json         # Project context
│   └── cli.js               # Local CLI module (optional)
├── src/                     # Source code
│   ├── main.ts              # NestJS entry point
│   ├── app.module.ts        # Root module
│   ├── app.controller.ts    # Root controller
│   ├── app.service.ts       # Root service
│   ├── config/              # Configuration module
│   │   ├── configuration.ts
│   │   └── validation.ts
│   └── examples/            # Example CRUD module
│       ├── examples.module.ts
│       ├── examples.controller.ts
│       └── examples.service.ts
├── test/                    # Test suite
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── .github/                 # GitHub workflows
├── .env.example             # Environment template
├── .gitignore
├── bootstrap.sh             # Setup script
├── docker-compose.yml       # Docker Compose
├── Dockerfile               # Docker configuration
├── eslint.config.cjs        # ESLint configuration
├── jest.config.ts           # Jest configuration
├── nest-cli.json            # NestJS CLI config
├── package.json             # npm dependencies
├── tsconfig.json            # TypeScript config
├── LICENSE
└── README.md
```

---

## 📋 Requirements

### System Requirements

- **Node.js**: 20.19.6+ LTS (20.x or 22.x recommended)
- **Python**: 3.10+ (required for RapidKit Core)
- **Git**: For version control

### Framework-Specific Requirements

**FastAPI Projects:**
- Python 3.10+
- Poetry (auto-installed if missing)

**NestJS Projects:**
- Node.js 20.19.6+
- Package manager (npm/yarn/pnpm)

### Optional Tools

- **Docker**: For containerized development
- **VS Code**: For Extension integration
- **Make**: For Makefile commands (usually pre-installed on Unix)

> 💡 **Tip:** Use [RapidKit VS Code Extension](https://marketplace.visualstudio.com/items?itemName=rapidkit.rapidkit-vscode) which includes a system checker to verify all requirements!

---

## ⚙️ CLI Options

```bash
npx rapidkit [workspace-name] [options]
npx rapidkit workspace <action>
```

### Arguments

- `workspace-name` - Name of workspace directory to create
- `action` - For workspace commands: `list` or `sync`

### Workspace Creation Options

- `-y, --yes` - Skip prompts and use defaults
- `--skip-git` - Skip git initialization
- `--debug` - Enable verbose debug logging
- `--dry-run` - Preview what would be created without creating it
- `--no-update-check` - Skip checking for newer versions
- `--help` - Display help information
- `--version` - Show version number

### Project Creation Flags

- `--output <dir>` - Specify output directory (default: current)
- `--create-workspace` - Auto-create workspace if outside one
- `--no-workspace` - Don't create workspace if outside one

### Examples

```bash
# Create workspace with defaults
npx rapidkit my-workspace --yes --skip-git

# Create project in specific location
npx rapidkit create project fastapi.standard api --output ./services

# Preview workspace creation
npx rapidkit test-workspace --dry-run

# Skip update check
npx rapidkit create --no-update-check
```

---

## 🔧 Troubleshooting

### Common Issues

<details>
<summary><strong>❌ BRIDGE_VENV_BOOTSTRAP_FAILED</strong></summary>

**Problem:** Python core can't run in workspace.

**Cause:** Poetry virtualenv not activated or workspace environment issue.

**Solutions:**

```bash
# Solution 1: Use poetry run prefix
poetry run rapidkit create

# Solution 2: Activate environment
source "$(poetry env info --path)/bin/activate"
rapidkit create

# Solution 3: Use non-interactive mode (always works without workspace)
rapidkit create project fastapi.standard my-api

# Solution 4: Recreate workspace
cd ..
rm -rf old-workspace
npx rapidkit new-workspace
```
</details>

<details>
<summary><strong>🔍 Workspace not detected</strong></summary>

**Problem:** CLI doesn't recognize you're in a workspace.

**Check:**
```bash
# Verify workspace marker exists
ls -la .rapidkit-workspace

# Check workspace is registered
rapidkit workspace list
```

**Solution:**
```bash
# Manual sync
rapidkit workspace sync
```
</details>

<details>
<summary><strong>📋 Project not auto-registered</strong></summary>

**Problem:** New project not showing in `workspace list`.

**Solution:**
```bash
cd my-workspace
rapidkit workspace sync
```

Projects created with `rapidkit create project` should auto-register. If not, sync manually.
</details>

<details>
<summary><strong>🐍 Python version mismatch</strong></summary>

**Problem:** Python 3.10+ required but not found.

**Solution:**

```bash
# Ubuntu/Debian
sudo apt install python3.10 python3.10-venv

# macOS (Homebrew)
brew install python@3.10

# Verify installation
python3.10 --version
```
</details>

<details>
<summary><strong>📦 Poetry not found</strong></summary>

**Problem:** Poetry installation missing or not in PATH.

**Solution:**

```bash
# Install Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$HOME/.local/bin:$PATH"

# Verify
poetry --version
```
</details>

<details>
<summary><strong>🔄 Workspace environment corrupt</strong></summary>

**Problem:** Workspace `.venv` or Poetry environment is broken.

**Solution:**

```bash
# For Poetry workspace
cd my-workspace
poetry env remove python
poetry install

# For venv workspace
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
pip install rapidkit-core
```
</details>

### Getting Help

If you encounter issues not covered here:

1. **Check the documentation:** https://getrapidkit.com
2. **Search existing issues:** https://github.com/getrapidkit/rapidkit-npm/issues
3. **Run diagnostics:** `rapidkit doctor`
4. **Open a new issue:** Include `rapidkit --version`, OS, Node.js version, and error output

---

## ❓ FAQs

<details>
<summary><strong>Do I need Python installed?</strong></summary>

Yes, Python 3.10+ is required for RapidKit Core (the engine). The npm package will bootstrap it into a workspace venv if needed, but having Python system-wide is recommended.
</details>

<details>
<summary><strong>Can I use this without npm?</strong></summary>

Yes! Install globally: `npm i -g rapidkit`, then use `rapidkit` directly without `npx`. Note: You'll still need Node.js installed.
</details>

<details>
<summary><strong>What's the difference from cookiecutter?</strong></summary>

RapidKit provides:
- **Living templates** that receive updates
- **Module system** (27+ free plug-and-play modules)
- **Workspace management** for organizing multiple projects
- **VS Code integration** with visual interface
- **Interactive TUI** wizard
- **Built-in CLI** commands (dev, test, lint, etc.)

Cookiecutter is great for one-time scaffolding, but RapidKit is a complete development platform.
</details>

<details>
<summary><strong>Do I need the VS Code Extension?</strong></summary>

No, but it's highly recommended! The Extension provides:
- Visual interface for creating projects
- One-click module installation
- Workspace browser
- System requirements checker
- Integrated terminal commands

CLI is fully functional standalone.
</details>

<details>
<summary><strong>Can I use venv instead of Poetry?</strong></summary>

Yes! During workspace creation, you can choose:
- **Poetry** (recommended - better dependency management)
- **venv** (standard Python virtualenv)
- **pipx** (global user install)

All options work, but Poetry provides the best experience.
</details>

<details>
<summary><strong>How do I upgrade RapidKit?</strong></summary>

```bash
# For global install
npm update -g rapidkit

# For npx usage (automatic)
npx rapidkit@latest create

# For workspace Python Core
cd my-workspace
poetry update rapidkit-core
# OR
pip install --upgrade rapidkit-core
```
</details>

<details>
<summary><strong>Can I customize generated projects?</strong></summary>

Yes! After generation:
1. Modify files as needed - they're yours
2. Add/remove modules: `rapidkit add module <name>`
3. Update dependencies in `pyproject.toml` or `package.json`
4. RapidKit won't overwrite your changes

For template-level changes, consider:
- Creating custom kits (see Core docs)
- Using RapidKit as a starting point
</details>

<details>
<summary><strong>Is there a Docker workflow?</strong></summary>

Yes! All projects include:
- `Dockerfile` for production builds
- `docker-compose.yml` for development
- `.dockerignore` for optimization

```bash
# Development
docker-compose up

# Production
docker build -t my-service .
docker run -p 8000:8000 my-service
```
</details>

<details>
<summary><strong>How does workspace registry work with teams?</strong></summary>

The registry (`~/.rapidkit/workspaces.json`) is **user-local**, not project-local:
- Each developer has their own registry
- Workspaces are auto-discovered when cloned
- VS Code Extension syncs automatically
- Git doesn't track the registry (it's in `~/.rapidkit/`)

For team sharing:
- Commit workspace code to Git
- Each developer runs `rapidkit workspace sync` after clone
- Or let VS Code Extension auto-discover
</details>

---

## 🛠️ Development

### Setup

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

# Watch mode for development
npm run dev
```

### Local Testing

```bash
# Build and link locally
npm run install:local

# Now rapidkit command uses your local build
rapidkit --version

# Uninstall local version
npm run uninstall:local
```

### Project Scripts

```json
{
  "dev": "tsup --watch",
  "build": "tsup",
  "test": "vitest run",
  "test:watch": "vitest",
  "lint": "eslint src",
  "install:local": "npm unlink -g rapidkit 2>/dev/null || true && npm run build && npm link",
  "uninstall:local": "npm unlink -g rapidkit"
}
```

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ways to Contribute

- 🐛 [Report bugs](https://github.com/getrapidkit/rapidkit-npm/issues)
- 💡 [Request features](https://github.com/getrapidkit/rapidkit-npm/issues)
- 📖 [Improve documentation](https://github.com/getrapidkit/rapidkit-npm/pulls)
- 🔧 [Submit pull requests](https://github.com/getrapidkit/rapidkit-npm/pulls)

### Development Guidelines

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes with tests
4. Run tests: `npm test`
5. Commit: `git commit -m "feat: add awesome feature"`
6. Push: `git push origin feature/my-feature`
7. Open a Pull Request

---

## 🔗 Related Projects

- **[RapidKit Core (Python)](https://pypi.org/project/rapidkit-core/)** - The engine powering RapidKit
- **[RapidKit VS Code Extension](https://marketplace.visualstudio.com/items?itemName=rapidkit.rapidkit-vscode)** - Visual interface
- **[RapidKit Documentation](https://getrapidkit.com)** - Full documentation
- **[GitHub Organization](https://github.com/getrapidkit)** - All repositories

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🌟 Support

<div align="center">

### Show Your Support

⭐ Star this repo if you find it helpful!

### Stay Connected

🐦 Follow [@getrapidkit](https://twitter.com/getrapidkit) for updates

💬 Join our [Discord community](https://discord.gg/rapidkit)

📚 Read the [full documentation](https://getrapidkit.com)

### Get Help

🐛 [Report Issues](https://github.com/getrapidkit/rapidkit-npm/issues)

💡 [Request Features](https://github.com/getrapidkit/rapidkit-npm/issues)

📖 [Browse Docs](https://getrapidkit.com)

---

**Made with ❤️ by the RapidKit team**

[Website](https://getrapidkit.com) • [GitHub](https://github.com/getrapidkit) • [Twitter](https://twitter.com/getrapidkit) • [Discord](https://discord.gg/rapidkit)

</div>
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

### Create a Workspace (Recommended)

For organizing multiple projects:

```bash
npx rapidkit my-workspace   # Create workspace with Poetry
cd my-workspace

# Activate environment (choose one):
source "$(poetry env info --path)/bin/activate"
# OR use poetry run prefix for all commands
alias rapidkit="poetry run rapidkit"

# Create projects
rapidkit create             # Interactive mode
rapidkit create project fastapi.standard my-api --output .
cd my-api
rapidkit init && rapidkit dev
```

**Why use a workspace?**
- ✅ Centralized Python environment for all projects
- ✅ Auto-tracks all projects in registry (`~/.rapidkit/workspaces.json`)
- ✅ VS Code Extension auto-discovers your projects
- ✅ Easier dependency management across projects

### Interactive mode (recommended)

```bash
# Outside workspace
npx rapidkit create

# Inside workspace (after activation)
rapidkit create
# OR
poetry run rapidkit create
```

This runs the RapidKit Core wizard and guides you through kit selection and project creation.

## Two Modes of Operation

### 1. Direct Project Creation (Core-first)

Create a standalone project directly via Core:

```bash
npx rapidkit create project fastapi.standard my-api --output .
npx rapidkit create project nestjs.standard my-api --output .
```

### 2. RapidKit Workspace Mode

Create a workspace to organize multiple projects:

```bash
npx rapidkit my-workspace                     # Create a RapidKit workspace
cd my-workspace

# Activate the environment (Poetry installs to cache, not .venv)
source "$(poetry env info --path)/bin/activate"

# Or use poetry run prefix
poetry run rapidkit create                    # Interactive project creation
poetry run rapidkit create project fastapi.standard my-api --output .
```

This mode creates a "RapidKit workspace" directory and installs the Python Core there via Poetry/venv/pipx, so you can create/manage multiple projects from the same environment.

**Important:** When using Poetry (recommended), the virtualenv is created in Poetry's cache, not as a local `.venv` folder. You must either:
- Activate the environment: `source "$(poetry env info --path)/bin/activate"`
- Use `poetry run` prefix: `poetry run rapidkit create`
- Create an alias: `alias rapidkit="poetry run rapidkit"`

**Workspace Features:**
- All projects are automatically tracked in `~/.rapidkit/workspaces.json`
- VS Code Extension auto-discovers workspace projects
- Use `rapidkit workspace list` to see all workspaces and projects
- Use `rapidkit workspace sync` to update project registry

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

## Workspace Management

RapidKit maintains a shared workspace registry at `~/.rapidkit/workspaces.json` for cross-tool compatibility with the VS Code Extension.

### List Registered Workspaces

```bash
npx rapidkit workspace list
```

This shows all workspaces created via npm package or VS Code Extension, including:
- Workspace name and path
- Number of projects in each workspace
- Validation status (path exists/missing)

**Example output:**
```
📦 Registered RapidKit Workspaces:

  my-workspace
    Path: /home/user/projects/my-workspace
    Projects: 3

Total: 1 workspace(s)
```

### Sync Workspace Projects

When you create projects inside a workspace, they are automatically tracked. If needed, you can manually sync:

```bash
cd my-workspace
rapidkit workspace sync
```

This command scans the workspace directory and registers all RapidKit projects (directories with `.rapidkit/context.json` or `.rapidkit/project.json`) in the registry.

**Note:** Project registration happens automatically when you create projects with `rapidkit create project ...` inside a workspace. Manual sync is only needed if you:
- Manually moved/copied projects into the workspace
- Created projects before the sync feature was added
- Want to refresh the registry after external changes

### Workspace Registry Format

The registry stores workspace metadata:

```json
{
  "workspaces": [
    {
      "name": "my-workspace",
      "path": "/home/user/projects/my-workspace",
      "mode": "full",
      "projects": [
        {
          "name": "my-api",
          "path": "/home/user/projects/my-workspace/my-api"
        },
        {
          "name": "admin-api",
          "path": "/home/user/projects/my-workspace/admin-api"
        }
      ]
    }
  ]
}
```

Workspaces are automatically registered when created via:
- `npx rapidkit <workspace-name>`
- VS Code Extension "Create Workspace" command

Projects are automatically registered when created via:
- `rapidkit create project ...` (inside a workspace)
- VS Code Extension "Create Project" command

## CLI Options

```bash
npx rapidkit [project-name] [options]
```

### Arguments

- `project-name` - Name of project/workspace directory to create
- `action` - For workspace commands: `list` or `sync`

### Workspace Commands

- `rapidkit workspace list` - List all registered workspaces and their projects
- `rapidkit workspace sync` - Scan current workspace and register all projects

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

### Adding Modules to Your Project

RapidKit's modular architecture lets you extend your project with pre-built modules. Install modules using:

```bash
npx rapidkit add module <module-slug>
```

**Examples:**

```bash
# Add authentication module
npx rapidkit add module auth

# Add caching module (Redis)
npx rapidkit add module redis

# Add database module (PostgreSQL)
npx rapidkit add module db_postgres
```

**List available modules:**

```bash
npx rapidkit list modules
npx rapidkit list modules --json
```

**View module details:**

```bash
npx rapidkit info module auth
npx rapidkit info module db_postgres
```

> **💡 Tip:** Use the [RapidKit VS Code Extension](https://marketplace.visualstudio.com/items?itemName=rapidkit.rapidkit-vscode) for a visual interface to browse and install modules!

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

### Workspace Markers

Workspaces created by the npm package include a `.rapidkit-workspace` marker file:

```json
{
  "signature": "RAPIDKIT_WORKSPACE",
  "createdBy": "rapidkit-npm",
  "version": "0.15.1",
  "createdAt": "2026-02-01T...",
  "name": "my-workspace"
}
```

This marker enables:
- Workspace auto-detection by VS Code Extension
- Cross-tool workspace compatibility
- Workspace validation and version tracking

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

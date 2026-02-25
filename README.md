<div align="center">

# 🚀 RapidKit NPM CLI

### Build Production-Ready APIs in Seconds

FastAPI, NestJS, Go/Fiber, and Go/Gin scaffolding with production-ready defaults.  
**27+ plug-and-play modules** are available for FastAPI & NestJS projects.  
Clean architecture • Zero boilerplate • Instant deployment.

[![npm version](https://img.shields.io/npm/v/rapidkit.svg?style=flat-square)](https://www.npmjs.com/package/rapidkit)
[![Downloads](https://img.shields.io/npm/dm/rapidkit.svg?style=flat-square)](https://www.npmjs.com/package/rapidkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/getrapidkit/rapidkit-npm.svg?style=flat-square)](https://github.com/getrapidkit/rapidkit-npm/stargazers)

```bash
# 1. Creates my-workspace/ with minimal profile — no prompts, no mkdir needed
npx rapidkit my-workspace
cd my-workspace

# 2. Scaffold a project inside the workspace
npx rapidkit create project fastapi.standard my-api
cd my-api

# 3. Install deps & start the dev server
npx rapidkit init && npx rapidkit dev
# ✅ Production-ready API running at http://localhost:8000
```

> **`npx rapidkit init` is context-aware** — it detects where you are and does the right thing:
> - 📁 **Outside any workspace** → creates `my-workspace/` with stub `pyproject.toml`/`poetry.toml` (minimal profile, zero prompts, no Python install yet)
> - 🏠 **Inside workspace root** → installs Python deps + creates `.venv` / launchers (skipped for `go-only`)
> - 🗂️ **Inside project folder** → installs project dependencies (Python / Node / Go)

Using Node.js/NestJS? Use this direct kit command (inside or outside a workspace):

```bash
npx rapidkit create project nestjs.standard my-service # standard kit
```
Using Python/FastAPI? Use these direct kit commands (inside or outside a workspace):
```bash
npx rapidkit create project fastapi.standard my-service # standard kit
npx rapidkit create project fastapi.ddd my-service      # DDD kit
```

Using Go? Use these direct kit commands (inside or outside a workspace):
```bash
npx rapidkit create project gofiber.standard my-service # Go Fiber standard kit
npx rapidkit create project gogin.standard my-service   # Go Gin standard kit
```

> ℹ️ **Module support note:** `npx rapidkit add module ...` is currently supported for **FastAPI** and **NestJS** projects only.
> Go kits (`gofiber.standard`, `gogin.standard`) do not support RapidKit modules in this release.

[Quick Start](#-quick-start) • [Docs](https://getrapidkit.com) • [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=rapidkit.rapidkit-vscode) • [Examples](https://github.com/getrapidkit/rapidkit-examples)

---

### 👉 Get Started in 30 Seconds

No account. No config. No pain. Just build.

[📖 Read Full Docs](https://getrapidkit.com) • [🎥 Watch Demo](https://www.youtube.com/watch?v=demo) • [⭐ Star on GitHub](https://github.com/getrapidkit/rapidkit-npm)

</div>

---

## ⚡ Why RapidKit?

| 🚀 **Instant Setup**          | 🧩 **Modular By Design**      | 🎯 **Production-Ready**        |
|-------------------------------|-------------------------------|--------------------------------|
| Project in 30 seconds         | 27+ plug-and-play modules     | Docker + CI/CD included        |
| Zero configuration needed     | Add features in 1 command     | Best practices baked in        |
| FastAPI, NestJS & Go kits     | Auth/DB/Cache modules (Python/Node kits) | Clean architecture guaranteed  |

### 🔥 From This...

```bash
mkdir my-api && cd my-api
python -m venv .venv && source .venv/bin/activate
pip install fastapi uvicorn sqlalchemy alembic pydantic redis...
# Create project structure manually
# Configure Docker, CI/CD, testing...
# Write boilerplate code...
# ... 2 hours later
```

### ...To This! ✨

```bash
npx rapidkit create project fastapi.standard my-api
cd my-api && npx rapidkit init && npx rapidkit dev
# ✅ Done in 30 seconds!
```

**What you get:**
- ✅ Production-ready project structure
- ✅ Docker & docker-compose configured
- ✅ GitHub Actions CI/CD pipeline
- ✅ Testing & linting setup
- ✅ Environment configuration
- ✅ Hot reload development server
- ✅ Best practices & clean architecture


---

## 📦 Table of Contents

- [Why RapidKit?](#-why-rapidkit)
- [Quick Start](#-quick-start)
- [Core Concepts](#-core-concepts)
- [Module Ecosystem](#-module-ecosystem)
- [Commands Reference](#-commands-reference)
- [Requirements](#-requirements)
- [FAQs](#-faqs)
- [Links](#-links)

---

## 🚀 Quick Start

### Option 0: Fastest Start — `npx rapidkit init`

`npx rapidkit init` is the **one command** that works in every context:

| Where you run it | What it does |
|------------------|---------------|
| **Empty folder** | Creates workspace with stub `pyproject.toml`/`poetry.toml` (no Python install yet) |
| **Workspace root** | Installs Python deps + launchers (`go-only` skips; `go mod tidy` per child project) |
| **Project folder** | Installs project dependencies (Python / Node / Go) |

```bash
# Step 1: creates my-workspace/ automatically (minimal profile, zero prompts)
npx rapidkit init
cd my-workspace

# Step 2: scaffold a project (interactive kit picker)
npx rapidkit create project
cd my-api

# Step 3: install deps and run
npx rapidkit init   # detected: inside project folder → installs project deps
npx rapidkit dev
# ✅ http://localhost:8000
```

> Want to choose a profile (python-only, node-only, go-only …) or pick a workspace name?
> Use `npx rapidkit my-workspace` instead — it shows an interactive wizard.

**Why workspace?** All projects under `my-workspace/` share one Python virtualenv — so adding a second or third service costs almost no extra disk space, and the RapidKit Core version stays consistent across all of them.

### Option 0b: Named Workspace with Profile Picker

Use this when you want to choose a specific profile or name:

```bash
npx rapidkit my-workspace   # interactive: name + profile picker
cd my-workspace

# Profile options shown during creation:
# ❯ minimal        — Foundation files only (fastest, mixed projects)
#   python-only    — Python + Poetry (FastAPI, Django, ML)
#   node-only      — Node.js runtime (NestJS, Express, Next.js)
#   go-only        — Go runtime (Fiber, Gin, gRPC)
#   polyglot       — Python + Node.js + Go multi-runtime
#   enterprise     — Polyglot + governance + Sigstore

npx rapidkit create project fastapi.standard my-api
cd my-api && npx rapidkit init && npx rapidkit dev
```

Prefer direct kit selection (works both inside and outside a workspace):

```bash
npx rapidkit create project fastapi.standard my-service
npx rapidkit create project fastapi.ddd my-service
npx rapidkit create project nestjs.standard my-service
npx rapidkit create project gofiber.standard my-service
npx rapidkit create project gogin.standard my-service
```

Interactive kit picker (`npx rapidkit create project`) includes:

```text
1) fastapi  — FastAPI Standard Kit
2) fastapi  — FastAPI DDD Kit
3) nestjs   — NestJS Standard Kit
4) go/fiber — Go Fiber Standard Kit
5) go/gin   — Go Gin Standard Kit
```

### Option 1: Single Project (Fastest)

Perfect for trying out RapidKit or building a standalone service:

**FastAPI:**
```bash
# Create project
npx rapidkit create project fastapi.standard my-api

# Start developing
cd my-api
npx rapidkit init           # Install dependencies
npx rapidkit dev            # Start dev server → http://localhost:8000

# Add modules as needed
npx rapidkit add module auth
npx rapidkit add module db_postgres
```

**NestJS:**
```bash
# Create project
npx rapidkit create project nestjs.standard my-service

# Start developing
cd my-service
npx rapidkit init           # Install dependencies
npx rapidkit dev            # Start dev server → http://localhost:3000

# Add modules as needed
npx rapidkit add module auth
npx rapidkit add module db_postgres
```

**Go (Fiber/Gin):**
```bash
# Create project
npx rapidkit create project gofiber.standard my-api
# or
npx rapidkit create project gogin.standard my-api

# Start developing
cd my-api
npx rapidkit init           # Install Go deps + tools + generate Swagger docs
npx rapidkit dev            # Start dev server with hot reload
```

> ℹ️ Go kits do not support `npx rapidkit add module ...` in this version.

### Option 2: Workspace (Recommended for Multiple Projects)

Organize multiple microservices with a shared environment:

```bash
# 1. Create workspace
npx rapidkit my-workspace
# Or with explicit command mode
npx rapidkit create workspace my-workspace
# Or interactive naming
npx rapidkit create workspace
cd my-workspace

# 2. Activate environment (choose one):

# A. Activate virtualenv (recommended)
source "$(poetry env info --path)/bin/activate"

# B. Use poetry run prefix
poetry run rapidkit create

# C. Create alias (add to ~/.bashrc or ~/.zshrc)
alias rapidkit="poetry run rapidkit"

# 3. Create projects
rapidkit create                                   # Interactive wizard
rapidkit create project fastapi.standard api
rapidkit create project nestjs.standard users
rapidkit create project fastapi.ddd orders

# 4. View all projects
npx rapidkit workspace list
```

**Why workspace mode?**
- ✅ One shared Python environment (~150MB once vs 150MB per project)
- ✅ All projects auto-tracked in `~/.rapidkit/workspaces.json`
- ✅ VS Code Extension auto-discovers projects
- ✅ Consistent RapidKit Core version
- ✅ Perfect for microservices architecture

### Next Steps

```bash
# Project commands (run inside project directory)
npx rapidkit init       # Install dependencies
npx rapidkit dev        # Start dev server with hot reload
npx rapidkit test       # Run tests with coverage
npx rapidkit lint       # Run linting checks
npx rapidkit format     # Format code
npx rapidkit build      # Build for production
npx rapidkit start      # Start production server

# Explore modules
npx rapidkit modules list        # List all 27+ modules (FastAPI/NestJS only)
npx rapidkit modules info db_postgres   # View module details

# Health check
npx rapidkit doctor              # Check system requirements
npx rapidkit doctor --workspace  # Check entire workspace
```

> 💡 **Pro Tip:** Install [RapidKit VS Code Extension](https://marketplace.visualstudio.com/items?itemName=rapidkit.rapidkit-vscode) for visual project creation, module browsing, and one-click installation!

---

## 💎 Prefer Visual Interface?

<div align="center">

### **RapidKit VS Code Extension** is the recommended way to use RapidKit

All npm CLI features + powerful visual tools in one integrated experience

[![Install Extension](https://img.shields.io/badge/Install-VS%20Code%20Extension-007ACC?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=rapidkit.rapidkit-vscode)

</div>

**Why use the Extension?**

| Feature | npm CLI | VS Code Extension |
|---------|---------|-------------------|
| **Project Creation** | ✅ Terminal commands | ✅ Visual wizard with preview |
| **Module Browse** | ✅ List in terminal | ✅ Rich UI with search & categories |
| **Module Installation** | ✅ `add module` command | ✅ One-click install with previews |
| **Workspace Management** | ✅ Basic commands | ✅ Visual tree + auto-discovery |
| **System Health Check** | ✅ `doctor` command | ✅ Real-time status indicators |
| **Project Templates** | ✅ Kit selection | ✅ Preview + compare kits visually |
| **Documentation** | ❌ External links | ✅ Integrated docs & tooltips |
| **AI Recommendations** | ✅ Terminal prompts | ✅ Interactive suggestions panel |
| **Multi-project View** | ❌ | ✅ Workspace explorer & switcher |
| **Quick Actions** | ❌ | ✅ Right-click context menus |

**Extension-only features:**
- 🎨 **Visual Project Browser**: See all projects at a glance
- 📊 **Live Health Monitoring**: Real-time project status
- 🔍 **Smart Search**: Find modules instantly with filters
- 📝 **Inline Documentation**: Hover tooltips for every module
- ⚡ **Quick Commands**: Keyboard shortcuts for common tasks
- 🔄 **Auto-sync**: Automatically detect new projects
- 🎯 **Context Menus**: Right-click actions everywhere

> 💡 The Extension includes the full npm package functionality, so you get **both** the CLI and the visual interface!

[📥 Install VS Code Extension](https://marketplace.visualstudio.com/items?itemName=rapidkit.rapidkit-vscode) • [📖 Extension Docs](https://getrapidkit.com/docs/vscode-extension)

---

## 🧠 Core Concepts

### Workspace vs Standalone

Choose the right mode for your use case:

| Feature | Workspace Mode | Standalone Mode |
|---------|----------------|-----------------|
| **Best For** | Teams, microservices, multiple projects | Single project, quick prototyping |
| **Setup Time** | ~2 minutes (one time) | ~30 seconds |
| **Disk Usage** | Efficient (one venv) | Higher (multiple venvs) |
| **Python Environment** | Shared across all projects | Separate per project |
| **Project Tracking** | Auto-tracked in registry | Manual |
| **VS Code Extension** | Auto-discovery | Manual discovery |

### Project Structure

#### Workspace Structure

```
my-workspace/
├── .rapidkit-workspace      # Workspace marker file
├── pyproject.toml           # Workspace Python config (stub on creation; rapidkit-core declared)
├── poetry.toml              # Poetry config (virtualenvs.in-project = true)
├── poetry.lock              # Created on first `npx rapidkit init` (not go-only)
├── .venv/                   # Created on first `npx rapidkit init` (not go-only)
├── rapidkit                 # CLI launcher Unix  (created on first `npx rapidkit init`)
├── rapidkit.cmd             # CLI launcher Windows (created on first `npx rapidkit init`)
├── README.md
├── my-api/                  # FastAPI project
├── my-service/              # NestJS project
└── my-admin/                # Another project
```

> **Profile notes:**
> - `go-only` — `.venv`, `poetry.lock`, launchers are never created (Go kits need no Python engine).
> - `minimal` / `node-only` — Python deps + launchers are created on first `npx rapidkit init` inside the workspace root.
> - `python-only` / `polyglot` / `enterprise` — Python deps + launchers are created immediately at workspace creation.

#### FastAPI Project (DDD Architecture)

```
my-api/
├── .rapidkit/               # RapidKit metadata & CLI
│   ├── activate             # Environment activation
│   ├── cli.py               # Local CLI commands
│   ├── context.json         # Build context
│   └── rapidkit             # Project CLI launcher
├── src/
│   ├── app/                 # DDD layers
│   │   ├── application/     # Use cases & interfaces
│   │   ├── domain/          # Business logic & models
│   │   ├── infrastructure/  # External services & repos
│   │   ├── presentation/    # API controllers & routes
│   │   ├── config/          # Configuration
│   │   ├── shared/          # Shared utilities
│   │   └── main.py          # Application entry
│   ├── modules/             # RapidKit modules
│   │   └── free/            # Free modules (auth, db, etc.)
│   ├── routing/             # API routes
│   ├── health/              # Health check endpoints
│   ├── cli.py               # CLI commands
│   └── main.py              # FastAPI app entry
├── tests/                   # Test suite
├── config/                  # Configuration files
├── .github/workflows/       # CI/CD pipelines
├── docker-compose.yml       # Docker Compose setup
├── Dockerfile               # Production container
├── Makefile                 # Quick commands
├── pyproject.toml           # Poetry dependencies
├── poetry.lock              # Locked dependencies
├── bootstrap.sh             # Setup script
├── .env.example             # Environment template
├── .pre-commit-config.yaml  # Pre-commit hooks
└── README.md
```

#### NestJS Project (Standard Architecture)

```
my-service/
├── .rapidkit/               # RapidKit metadata & CLI
│   ├── activate             # Environment activation
│   ├── context.json         # Build context
│   └── rapidkit             # Project CLI launcher
├── src/
│   ├── app.module.ts        # Root module
│   ├── app.controller.ts    # Root controller
│   ├── app.service.ts       # Root service
│   ├── main.ts              # NestJS entry point
│   ├── config/              # Configuration module
│   │   ├── configuration.ts
│   │   ├── validation.ts
│   │   └── index.ts
│   ├── modules/             # RapidKit modules
│   │   ├── free/            # Free modules (auth, db, etc.)
│   │   └── index.ts         # Module registry
│   ├── auth/                # Auth feature module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── entities/
│   ├── examples/            # Example CRUD module
│   │   ├── examples.module.ts
│   │   ├── examples.controller.ts
│   │   ├── examples.service.ts
│   │   └── dto/
│   └── health/              # Health check endpoints
├── test/                    # E2E tests
├── tests/                   # Unit tests
├── .github/workflows/       # CI/CD pipelines
├── docker-compose.yml       # Docker Compose setup
├── Dockerfile               # Production container
├── Makefile                 # Quick commands
├── package.json             # npm dependencies
├── package-lock.json            # Locked dependencies
├── nest-cli.json            # NestJS CLI config
├── tsconfig.json            # TypeScript config
├── tsconfig.build.json      # Build config
├── jest.config.ts           # Jest test config
├── eslint.config.cjs        # ESLint config
├── bootstrap.sh             # Setup script
├── .env.example             # Environment template
└── README.md
```

### Module System

RapidKit's modules are plug-and-play components that extend your project:

> ℹ️ The module system currently supports **FastAPI** and **NestJS** kits.
> Go kits (`gofiber.standard`, `gogin.standard`) currently do not support module installation.

```bash
# Add authentication
rapidkit add module auth

# Add database with caching
rapidkit add module db_postgres
rapidkit add module redis

# Add payment processing
rapidkit add module stripe
```

Modules include:
- ✅ Pre-configured code
- ✅ Dependencies (auto-added to pyproject.toml/package.json)
- ✅ Configuration templates
- ✅ Tests and documentation
- ✅ Best practices baked in

### 🤖 AI-Powered Recommendations

Not sure which modules you need? Ask AI:

```bash
npx rapidkit ai recommend "I want to build a SaaS with authentication and payments"

# Output:
# 📦 Recommended Modules:
# 1. Authentication Core (92% match)
# 2. Users Core (88% match)
# 3. Stripe Payment (85% match)
# 4. PostgreSQL (82% match)
```

**Setup (one-time):**
```bash
rapidkit config set-api-key              # Configure OpenAI API key
rapidkit ai generate-embeddings          # Generate embeddings (~$0.50)
```

**Features:**
- 🧠 Understands natural language queries
- 🎯 Suggests relevant modules with confidence scores
- 💰 Ultra-cheap: ~$0.0002 per query
- ✅ Works in mock mode without API key (for testing)

[More about AI features →](https://getrapidkit.com/docs/ai)

---

## 🧩 Module Ecosystem

RapidKit includes **27 production-ready modules** across 10 categories for **FastAPI** and **NestJS** projects:

### Quick Overview

- 🔐 **Authentication** (5 modules): Core Auth, API Keys, OAuth, Passwordless, Sessions
- 💳 **Payments & E-commerce** (3): Stripe, Shopping Cart, Inventory
- 🗄️ **Databases** (3): PostgreSQL, MongoDB, SQLite
- 🔒 **Security** (3): CORS, Rate Limiting, Security Headers
- 📧 **Communication** (2): Email, Unified Notifications
- 👥 **User Management** (2): Users Core, User Profiles
- ⚙️ **Essentials** (4): Settings, Middleware, Logging, Deployment
- 📊 **Observability** (1): Metrics & Tracing
- 💾 **Caching** (1): Redis
- 🤖 **AI** (1): AI Assistant
- ⚡ **Tasks** (1): Celery
- 💼 **Storage** (1): File Management

### Browse & Install

```bash
# List all modules
rapidkit modules list

# View module details
rapidkit modules info auth
rapidkit modules info db_postgres

# Install modules
rapidkit add module auth
rapidkit add module db_postgres redis
```

### Popular Combinations

**SaaS Starter:**
```bash
rapidkit add module auth users db_postgres redis session
```

**E-commerce API:**
```bash
rapidkit add module auth users db_postgres cart inventory stripe
```

**Enterprise API:**
```bash
rapidkit add module auth api_keys db_postgres redis rate_limiting observability
```

📚 **[View Full Module Catalog →](https://getrapidkit.com/modules)**

---

## 💻 Commands Reference

### Global Commands (Run Anywhere)

```bash
# Workspace creation
npx rapidkit <name>                      # Legacy stable workspace creation
npx rapidkit create workspace            # Interactive workspace creation
npx rapidkit create workspace <name>     # Create workspace with name

# Project creation
npx rapidkit create project               # Interactive wizard
npx rapidkit create project <kit> <name> # Direct creation

# Information
npx rapidkit list                         # List kits
npx rapidkit modules list                 # List modules (FastAPI/NestJS kits)
npx rapidkit kits info <name>             # Kit details
npx rapidkit modules info <name>          # Module details

# System health
npx rapidkit doctor                       # Check system
npx rapidkit doctor --workspace           # Check workspace
npx rapidkit doctor --workspace --fix     # Auto-fix issues
npx rapidkit doctor --workspace --json    # JSON output (CI/CD)

# Workspace management
npx rapidkit workspace list               # List workspaces
npx rapidkit workspace sync               # Sync projects

# CLI info
npx rapidkit --version                    # Show version
npx rapidkit --help                       # Show help
```

> ℹ️ Flag semantics for project creation:
> - `--skip-install` (npm wrapper) enables fast-path lock/dependency behavior.
> - `--skip-essentials` (core flag) skips essential module installation.
> - They are intentionally different and should not be treated as interchangeable.

### Workspace Operations

RapidKit also ships enterprise workspace contracts for bootstrap, setup, cache lifecycle, and mirror/governance flows.

```bash
# Wrapper contracts
npx rapidkit bootstrap                    # Workspace bootstrap flow (profile + policy aware)
npx rapidkit setup python                 # Python runtime setup/prereq check
npx rapidkit setup node                   # Node runtime setup/prereq check
npx rapidkit setup go                     # Go runtime setup/prereq check
npx rapidkit cache status                 # Cache status overview
npx rapidkit cache clear                  # Clear workspace caches
npx rapidkit cache prune                  # Prune stale cache entries
npx rapidkit cache repair                 # Attempt cache repair / self-heal
npx rapidkit mirror                       # Mirror status (default action)
npx rapidkit mirror sync                  # Sync mirror artifacts and lock state
npx rapidkit mirror verify                # Verify mirror/offline integrity
npx rapidkit mirror rotate                # Rotate mirror metadata/artifacts
```

> ℹ️ `setup` requires a runtime argument: `python`, `node`, or `go`.
> Running `npx rapidkit mirror` without subcommands shows status only.
> ℹ️ Running `npx rapidkit bootstrap` inside a workspace (without `--profile`) shows an interactive
> profile picker in TTY mode, pre-selecting the current workspace profile. Press Enter to keep it,
> or choose a new profile. In CI/JSON/non-TTY mode it stays non-interactive and uses workspace.json.

Policy and governance coverage in this phase includes:
- `dependency_sharing_mode` policy: `isolated`, `shared-runtime-caches`, `shared-node-deps`
- bootstrap profiles: `minimal`, `go-only`, `python-only`, `polyglot`, `enterprise`
- signed governance bundle verification and Sigstore/Cosign verification path
- transparency evidence retention and export under `.rapidkit/reports/`

Typical report artifacts generated by governance/mirror/compliance workflows:
- `.rapidkit/reports/bootstrap-compliance*.json`
- `.rapidkit/reports/mirror-ops*.json`
- `.rapidkit/reports/transparency-evidence*.json`

`npx rapidkit create workspace` interactive prompts:
- Without a name: asks workspace name, author name, Python version, and install method.
- With a name: asks author name, Python version, and install method.
- With `--yes`: skips prompts and uses defaults.

### Init & Project Commands

```bash
npx rapidkit init      # Context-aware init (see behavior below)
npx rapidkit dev       # Start dev server with hot reload
npx rapidkit start     # Start production server
npx rapidkit build     # Build for production
npx rapidkit test      # Run tests with coverage
npx rapidkit lint      # Run linting
npx rapidkit format    # Format code
```

`npx rapidkit init` behavior:
- In a plain folder: creates `my-workspace/` (minimal profile, zero prompts) with stub `pyproject.toml` + `poetry.toml`. No Python install at this stage.
- In a workspace root:
  - `go-only` profile → shows guidance, nothing installed (Go deps are per-project).
  - All other profiles → installs Python dependencies (`poetry install`), creates `.venv/` and launcher scripts, then initializes all detected child projects.
- In a project inside a workspace: initializes only that project (`go mod tidy` / `npm install` / `poetry install` depending on type).

Quick examples:

```bash
# Plain folder
cd ~/new-folder && npx rapidkit init

# Workspace root
cd ~/my-workspace && npx rapidkit init

# Project inside workspace
cd ~/my-workspace/my-api && npx rapidkit init
```

### Module Commands

```bash
npx rapidkit add module <slug>            # Add single module
npx rapidkit add module auth redis        # Add multiple modules
npx rapidkit modules list                 # List available modules
npx rapidkit modules info <slug>          # Module details
```

> ℹ️ `add module` and `modules ...` commands apply to **FastAPI/NestJS** projects.
> For Go kits, these commands are intentionally unavailable in this release.

### Advanced Options

```bash
# Workspace creation
npx rapidkit <name> --yes                 # Skip prompts
npx rapidkit <name> --skip-git            # Skip git init
npx rapidkit <name> --dry-run             # Preview only
npx rapidkit <name> --debug               # Verbose logging
npx rapidkit create workspace --yes       # Create default my-workspace non-interactive
npx rapidkit create workspace <name> --yes # Create named workspace non-interactive

# Project creation
npx rapidkit create --output <dir>        # Custom location
npx rapidkit create --no-update-check     # Skip version check
```

**Quick Reference Table:**

| Command | Description | Context |
|---------|-------------|---------|
| `create workspace` | Create workspace | Anywhere |
| `create project` | Create project | Anywhere |
| `bootstrap` | Profile/policy-aware workspace bootstrap | Workspace |
| `setup` | Runtime setup/prereq check (`python|node|go`) | Anywhere |
| `cache` | Workspace cache lifecycle (`status/clear/prune/repair`) | Workspace |
| `mirror` | Mirror lifecycle (`status/sync/verify/rotate`) | Workspace |
| `init` | Context-aware dependency setup | Folder / workspace / project |
| `dev` | Start dev server | Inside project |
| `test` | Run tests | Inside project |
| `add module` | Add module to project (FastAPI/NestJS) | Inside project |
| `list` | List kits | Anywhere |
| `modules list` | List modules (FastAPI/NestJS) | Anywhere |
| `doctor` | Health check | Anywhere |
| `workspace` | Manage workspaces | Anywhere |

---

## 📋 Requirements

### System Requirements

- **Node.js**: 20.19.6+ LTS (20.x or 22.x recommended)
- **Python**: 3.10+ (required for RapidKit Core)
- **Git**: For version control

### Framework-Specific

**FastAPI Projects:**
- Python 3.10+
- Poetry (auto-installed if missing)

**NestJS Projects:**
- Node.js 20.19.6+
- npm

**Go Projects (Fiber/Gin Kits):**
- Go 1.23+ (or the version configured by the selected kit)
- Make (recommended for `make dev/test/build/docs` targets)

### Optional but Recommended

- **Docker**: For containerized development
- **VS Code**: For Extension integration
- **Make**: For Makefile commands (pre-installed on Unix)

> 💡 **Tip:** Use `rapidkit doctor` to check all requirements automatically!

---

## ❓ FAQs

<details>
<summary><strong>Do I need Python installed?</strong></summary>

Yes, Python 3.10+ is required for RapidKit Core (the engine). The npm package will bootstrap it if needed, but system-wide installation is recommended.
</details>

<details>
<summary><strong>Can I use this without npm?</strong></summary>

Yes! Install globally: `npm i -g rapidkit`, then use `rapidkit` directly. You'll still need Node.js installed.
</details>

<details>
<summary><strong>What's the difference from cookiecutter?</strong></summary>

RapidKit provides:
- **Living templates** that receive updates
- **27+ plug-and-play modules**
- **Workspace management**
- **VS Code integration**
- **Built-in dev commands** (dev, test, lint)

Cookiecutter is one-time scaffolding. RapidKit is a complete development platform.
</details>

<details>
<summary><strong>Do I need the VS Code Extension?</strong></summary>

No, but highly recommended! It provides visual interface, one-click module installation, workspace browser, and system checker.
</details>

<details>
<summary><strong>Can I customize generated projects?</strong></summary>

Yes! After generation, files are yours. Modify as needed, add/remove modules, update dependencies. RapidKit won't overwrite your changes.
</details>

<details>
<summary><strong>How do I upgrade RapidKit?</strong></summary>

```bash
# For npx usage (automatic)
npx rapidkit@latest create

# For global install
npm update -g rapidkit

# For workspace Python Core
cd my-workspace
poetry update rapidkit-core
```
</details>

<details>
<summary><strong>Is there Docker support?</strong></summary>

Yes! All projects include:
- `Dockerfile` for production
- `docker-compose.yml` for development
- `.dockerignore` for optimization

```bash
docker-compose up  # Development
docker build -t my-service . && docker run -p 8000:8000 my-service  # Production
```
</details>

**More Questions?** Check [Full Documentation](https://getrapidkit.com) or [Open an Issue](https://github.com/getrapidkit/rapidkit-npm/issues)

---

## 🔗 Links

### 📚 Documentation & Resources
- [Official Website](https://getrapidkit.com) – Complete documentation and guides
- [Full Module Catalog](https://getrapidkit.com/modules) – Browse all 27+ modules
- [Getting Started Guide](https://getrapidkit.com/docs/getting-started) – Step-by-step tutorials

### 🛠️ Tools & Extensions
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=rapidkit.rapidkit-vscode) – Visual project creation & module management
- [RapidKit Core (Python)](https://pypi.org/project/rapidkit-core/) – The engine powering RapidKit

### 💬 Community & Support
- [GitHub Discussions](https://github.com/getrapidkit/rapidkit-npm/discussions) – Ask questions & share ideas
- [GitHub Issues](https://github.com/getrapidkit/rapidkit-npm/issues) – Report bugs & request features
- [Discord Community](https://discord.gg/rapidkit) – Chat with other developers

### 📱 Social
- [Twitter/X](https://twitter.com/getrapidkit) – Updates & announcements
- [GitHub Organization](https://github.com/getrapidkit) – All repositories
- [Blog](https://getrapidkit.com/blog) – Tutorials & best practices

---

<div align="center">

**Made with ❤️ by the RapidKit team**

⭐ Star this repo if you find it helpful!

[Install Now](https://www.npmjs.com/package/rapidkit) • [Read Docs](https://getrapidkit.com) • [Get Extension](https://marketplace.visualstudio.com/items?itemName=rapidkit.rapidkit-vscode)

</div>

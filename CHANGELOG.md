# Changelog

All notable changes to RapidKit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.19.1] - 2026-02-12

### Changed
- ⬆️ Upgraded `inquirer` from `^9.2.23` to `^13.2.2` to modernize prompt stack and reduce dependency noise.
- 🔄 Refreshed lockfiles (`package-lock.json`, `yarn.lock`) to align transitive dependency graph with the upgrade.
- 🧩 Updated generated demo Poetry template in `src/create.ts` from `python = "^3.10.14"` to `python = "^3.10"` for wider Python 3.10 patch compatibility.

### Security
- ✅ Verified `npm audit --audit-level=high` reports zero known vulnerabilities after dependency update.

### Testing
- ✅ Verified `npm test` passes after the upgrade (no regressions observed).

## [0.19.0] - 2026-02-10

### Added
- 🤖 **AI Module Recommender** - Intelligent module suggestions using OpenAI embeddings
  - 🧠 Semantic search for modules (understands intent, not just keywords)
  - 🔄 **Dynamic module fetching from Python Core** (`rapidkit modules list --json`)
  - 📦 27+ production-ready modules cataloged (auth, database, payment, communication, infrastructure)
  - 🤖 **Auto-generate embeddings** - Automatic setup on first use with interactive prompts
  - ✅ **Mock mode** - Test without API key using deterministic embeddings
  - 🎯 Cosine similarity algorithm for accurate recommendations (92%+ match scores)
  - 🔗 Dependency detection and installation order calculation
  - 💰 Ultra-cheap: ~$0.0002 per query (practically free after $0.50 setup)
  - ⚡ 5-minute cache for optimal performance (~50ms per query)
  - 🛡️ Graceful fallback to 11 hardcoded modules if Python Core unavailable
- 🛠️ **New CLI Commands**:
  - `rapidkit ai recommend [query]` - Get module recommendations with match scores and reasons
  - `rapidkit ai recommend [query] -n <N>` - Get top N recommendations (default: 5)
  - `rapidkit ai recommend [query] --json` - JSON output for scripting
  - `rapidkit ai generate-embeddings` - Generate embeddings (one-time setup)
  - `rapidkit ai generate-embeddings --force` - Force regenerate embeddings
  - `rapidkit ai update-embeddings` - Update embeddings with latest modules
  - `rapidkit ai info` - Show AI features, pricing, and getting started guide
  - `rapidkit config set-api-key` - Configure OpenAI API key (interactive or --key option)
  - `rapidkit config show` - View current configuration (masked key)
  - `rapidkit config remove-api-key` - Remove stored API key
  - `rapidkit config ai enable|disable` - Toggle AI features
- 📦 **New Dependencies**:
  - openai@^4.80.0 - Official OpenAI SDK for embeddings
  - inquirer@9.2.23 - Interactive prompts for auto-setup
  - ora@8.0.1 - Elegant terminal spinners for generation progress
- 📚 **Documentation**:
  - [docs/AI_FEATURES.md](docs/AI_FEATURES.md) - Complete AI features guide with troubleshooting
  - [docs/AI_QUICKSTART.md](docs/AI_QUICKSTART.md) - Get started in 60 seconds
  - [docs/AI_EXAMPLES.md](docs/AI_EXAMPLES.md) - Real-world use cases (SaaS, E-commerce, Healthcare, Gaming)
  - [docs/AI_DYNAMIC_INTEGRATION.md](docs/AI_DYNAMIC_INTEGRATION.md) - Dynamic integration architecture
  - Updated README with comprehensive AI section
- 🔒 **Security**:
  - API keys stored in ~/.rapidkit/config.json (600 permissions, owner only)
  - Environment variable support (OPENAI_API_KEY)
  - Embeddings file (data/modules-embeddings.json) added to .gitignore
  - No local paths or personal information in distributed package (verified)
- ✅ **Testing**:
  - 76 AI tests (100% passing)
  - 90% overall coverage, 76% AI module coverage
  - Mock mode tests (no API key needed)
  - Integration tests for auto-generation flow

### Changed
- 🔄 **Dynamic Module Catalog** - AI now fetches module list from Python Core in real-time
  - Automatically syncs with Python Core module registry
  - Single source of truth (Python Core)
  - No duplicate data maintenance
  - Always up-to-date recommendations
  - Falls back to 11 core modules if Python unavailable
- 🎨 **Enhanced User Experience**:
  - Interactive prompts for missing embeddings (3 options: generate/manual/cancel)
  - Cost estimation before generation (~$0.50 for 27 modules)
  - Progress indicators for long operations
  - Better error messages (401 invalid key, 429 quota exceeded, connection errors)
  - Mock mode automatically activates when no API key configured

### Technical
- New module: `src/config/user-config.ts` - User configuration management (API key, AI toggle)
- New module: `src/ai/module-catalog.ts` - Dynamic module catalog with Python Core integration
- New module: `src/ai/openai-client.ts` - OpenAI API wrapper with mock mode support
- New module: `src/ai/recommender.ts` - AI recommendation engine with cosine similarity
- New module: `src/ai/embeddings-manager.ts` - Auto-generation and management of embeddings
- New script: `scripts/generate-mock-embeddings.ts` - Generate deterministic mock embeddings for testing
- AI uses text-embedding-3-small model (1536 dimensions, $0.02/1M tokens)
- Build size: 58.57 KB (ESM bundle)
- 5-minute cache TTL for module list
- Automatic fallback to hardcoded catalog (11 modules)

### Fixed

- 🐛 **AI Module Name Format** - Fixed critical module ID format mismatch
  - Module IDs now preserve underscores (ai_assistant, auth_core, db_postgres) matching Python Core format
  - Previously converted underscores to dashes (ai-assistant), breaking module lookups
  - Updated to JSON Schema v1 API: `rapidkit modules list --json-schema 1`
  - Added JSON extraction to handle emoji output from Python Core
  - Fixed command routing: AI and config commands now handled by npm CLI (not forwarded to Python Core)
  - Externalized openai package (prevents bundling 10MB SDK)
  - **Impact:** AI recommendations now correctly match Python Core module registry

## [0.18.1] - 2026-02-09

### Fixed

- 🐛 Fixed cross-platform path normalization test for Windows CI
  - Updated path test to use regex pattern accepting both Unix (/) and Windows (\\) path separators
  - Resolves Windows CI failure in create-helpers.test.ts

## [0.18.0] - 2026-02-09

### Added

- 🔗 **Contract Sync Infrastructure** - Added contract schema synchronization between Core and NPM package
  - Added `sync:contracts` and `check:contracts` npm scripts
  - Integrated contract validation into CI workflow and pre-commit hooks
  - Automatically checks Core ↔ NPM contracts when Core schema is available
  - Gracefully skips when Core schema is not found (supports standalone usage)
- 📊 **Modules Catalog Support** - Added `getModulesCatalog()` API to fetch modules list from Core
  - Supports JSON schema v1 with filters (category, tag, detailed)
  - 30-minute TTL caching for better performance
  - Backward compatible with legacy `modules list --json` format
- 🎯 **Commands JSON API** - Core bridge now prefers `rapidkit commands --json` for faster command discovery
  - Falls back to `--help` parsing if JSON API unavailable
  - Improved bootstrapped command set with `commands` included

### Improved

- 🔧 **Python Bridge Robustness** - Major enhancements to Core installation and error handling
  - **Multi-venv Support**: Each Core package spec gets isolated venv (`venv-<hash>` pattern)
  - **Smart Legacy Migration**: Automatically reuses legacy venv for unpinned specs
  - **Retry Logic**: 2 retries with exponential backoff for pip operations (configurable via env vars)
  - **Better Error Messages**: Granular error codes (VENV_CREATE_FAILED, PIP_BOOTSTRAP_FAILED, etc.)
  - **Timeout Protection**: Configurable timeouts for venv creation (60s) and pip operations (120s)
  - **Enhanced Validation**: Validates rapidkit-core installation before reusing cached venvs
- 👀 **Doctor Command** - Enhanced to display multiple RapidKit Core installations
  - Shows all found installations (Global pipx, pyenv, system, workspace .venv)
  - Displays version number for each installation path
  - Color-coded version display with arrow format (`-> v0.3.0`)
- 🧪 **Test Coverage** - Enhanced drift guard tests with contract validation
  - Tests `version --json`, `commands --json`, and `project detect --json` schemas
  - Validates JSON payloads against contract schema definitions
  - Ensures schema_version compatibility across Core APIs
- 📦 **Demo Kit** - Added missing template context variables
  - Added `node_version` (default: '20.0.0')
  - Added `database_type` (default: 'postgresql')
  - Added `include_caching` (default: false)
  - Better error logging for template rendering failures

### Fixed

- 🐛 **NestJS Template** - Fixed nunjucks ternary operator syntax in docker-compose.yml
  - Fixed nested ternary without parentheses causing parser error
  - Changed from `{{ 'pnpm' if ... else package_manager if ... else 'npm' }}`
  - Changed to `{{ ('pnpm' if ... else (package_manager if ... else 'npm')) }}`
  - Resolves "expected variable end" error at Line 12, Column 74
- 🗑️ **Template Cleanup** - Removed redundant `.env.example.j2` template from NestJS standard kit
- 🔄 **Bootstrap Commands** - Added `commands` to BOOTSTRAP_CORE_COMMANDS_SET for cold-start support

### Environment Variables

New environment variables for Python bridge configuration:

- `RAPIDKIT_BRIDGE_PIP_RETRY`: Retry count for pip operations (default: 2)
- `RAPIDKIT_BRIDGE_PIP_RETRY_DELAY_MS`: Base delay for exponential backoff (default: 800ms)
- `RAPIDKIT_BRIDGE_PIP_TIMEOUT_MS`: Timeout for pip operations (default: 120000ms)
- `RAPIDKIT_CORE_PYTHON_PACKAGE_ID`: Additional identifier for venv isolation

## [0.17.0] - 2026-02-06

### Added

- 🩺 **Enhanced Doctor Command** - Major upgrade to `rapidkit doctor --workspace` with comprehensive health monitoring
  - **Framework Detection**: Automatically identifies FastAPI 🐍 or NestJS 🦅 projects
  - **Health Score System**: Visual percentage-based scoring with pass/warn/error breakdown (📊 80%)
  - **Project Statistics**: Module count from registry.json, file counts, and project size
  - **Last Modified Tracking**: Git-based last modification timestamps (🕒 "today", "2 days ago")
  - **Test Detection**: Identifies presence of test directories
  - **Docker Support Check**: Validates Dockerfile existence
  - **Code Quality Tools**: Checks for ESLint (NestJS) or Ruff (FastAPI) configuration
  - **Security Scanning**: npm audit integration for Node.js vulnerabilities
  - **Actionable Fix Commands**: Project-specific commands to resolve issues (🔧 Quick Fix)
  - **JSON Output Mode**: Machine-readable format for CI/CD (`--json` flag)
  - **Auto-Fix Capability**: Interactive fix application with confirmation (`--fix` flag)
  - **Version Compatibility Warnings**: Alerts on Core/CLI version mismatches
  - **Module Health Checks**: Validates Python `__init__.py` files in modules
  - **Environment File Validation**: Detects missing `.env` files with copy suggestions
  - **Improved Dependency Detection**: Better verification for both Node.js and Python projects
  - **Multi-Project Type Support**: Handles mixed FastAPI + NestJS workspaces seamlessly

### Improved

- ⚙️ **RapidKit Core Priority**: Workspace venv now checked before global installation
  - Ensures isolated workspace environments are prioritized
  - Displays appropriate context ("Installed in workspace virtualenv" vs "Installed at /path")
- 🎯 **Project Health Display**: Enhanced visual output with comprehensive status indicators
  - Framework icons (🐍 FastAPI / 🦅 NestJS)
  - Kit information display (e.g., "FastAPI (fastapi.standard)")
  - Organized status lines with color coding (✅ green, ⚠️ yellow, ❌ red)
  - Compact additional checks display (Tests • Docker • ESLint/Ruff)
  - Project statistics and modification times
- 🐛 **Bug Fixes**
  - Fixed fs-extra ESM import compatibility (changed from namespace to default import)
  - Fixed command execution in auto-fix (now uses shell mode for proper command resolution)
  - Improved project detection with deep recursive scan fallback (max depth 3)
  - Better handling of Node.js vs Python project-specific checks

### Documentation

- 📚 Added comprehensive `DOCTOR_ENHANCEMENTS.md` guide
- 📖 Updated README with detailed doctor command usage examples
- 🎯 Added use case examples for development workflow and CI/CD integration

## [0.16.5] - 2026-02-05

### Added

- ⚙️ **Configuration System** - New `rapidkit.config.js` file support for workspace and project defaults
  - Workspace settings: `defaultAuthor`, `pythonVersion`, `installMethod`
  - Project settings: `defaultKit`, `addDefaultModules`, `skipGit`, `skipInstall`
  - Priority: CLI args > rapidkit.config.js > .rapidkitrc.json > defaults
  - Auto-discovery: searches current directory and parent directories
  - Supports .js, .mjs, and .cjs formats
- 🩺 **Doctor Command** - New `rapidkit doctor` command for system diagnostics
  - Checks Python installation and version
  - Validates pip, pipx, and Poetry installation
  - Verifies RapidKit Core installation
  - Provides troubleshooting recommendations
  - Generates detailed JSON report

### Improved

- 📚 **Documentation** - Added comprehensive guides
  - Configuration file usage guide (`docs/config-file-guide.md`)
  - Doctor command documentation (`docs/doctor-command.md`)
  - Configuration example file (`rapidkit.config.example.js`)
- 🔧 **CLI Experience** - Enhanced help text and command structure
  - Improved README with configuration examples
  - Better error messages for config loading

## [0.16.4] - 2026-02-02

### Changed

- 📝 **Documentation Quality** - Standardized documentation language and format
  - Workspace comparison guide reviewed and polished
  - Development runbooks enhanced for clarity and consistency
  - All user-facing documentation now consistently formatted and reviewed

### Improved

- 🧪 **Test Stability** - Enhanced test robustness for workspace registration and marker functionality
  - Updated tests to account for Python discovery side-effects in Poetry workflows
  - Improved assertions to be more flexible and resilient to implementation changes
- 🔍 **Code Quality** - Maintained test coverage above 80% threshold
  - Added workspace-marker tests with real temporary directories for realistic behavior
  - Reduced brittle test assertions that depend on exact call sequences
- 📊 **Build & Quality** - All metrics validated
  - Bundle size: 116 KB
  - Test coverage: 80%+ (passing)
  - ESLint: 0 errors, minimal warnings
  - All 488+ tests passing

## [0.16.3] - 2026-02-01

### Fixed

- 🔧 **Template Compatibility** - Added `generate_secret` Nunjucks filter to match Python Core's Jinja2 filter
  - Fixes NestJS template rendering errors for secret generation
  - Uses crypto.randomBytes for cryptographically secure secrets
- 🧪 **Test Suite Updates** - Updated tests for Python Core 0.2.2+ compatibility
  - Skipped .rapidkit folder tests (Core 0.2.2+ uses global CLI instead of project-local files)
  - Fixed docker-compose.yml.j2 nested ternary syntax for Nunjucks
  - Renamed env.example.j2 to .env.example.j2 for correct output path
  - All 488 tests passing (11 skipped)

## [0.16.0] - 2026-02-01

### Added

- 📋 **Workspace Registry** - Shared workspace registry at `~/.rapidkit/workspaces.json` enables cross-tool workspace discovery
  - `registerWorkspace()` function automatically registers workspaces in shared registry
  - `workspace list` command to view all registered workspaces (npm-only, no Python dependency)
  - VS Code Extension can discover npm-created workspaces
  - npm package can discover Extension-created workspaces

### Changed

- 🏷️ **Unified Workspace Signature** - Changed workspace marker signature from `RAPIDKIT_VSCODE_WORKSPACE` to `RAPIDKIT_WORKSPACE`
  - Improves cross-tool compatibility between npm package and VS Code Extension
  - Backward compatible: Both signatures are recognized
  - Workspace markers now clearly identify creator: `createdBy: 'rapidkit-npm'`

- 🔍 **Command Routing** - `workspace` command now handled by npm package only (not forwarded to Python Core)
  - Enables workspace management without Python dependency
  - Faster execution for workspace listing

### Documentation

- 📝 Added comprehensive workspace registry documentation to README
- 📝 Documented workspace marker format and cross-tool compatibility
- 📝 Added examples for `workspace list` command

## [0.15.1] - 2026-01-31

### Added

- 🧪 **Bridge tests:** Added comprehensive unit tests for Python bridge internals, including command discovery, system Python detection, and bootstrap command handling.
- 🧩 **Bootstrap command coverage:** Explicit tests for core bootstrap command sets to prevent regressions during cold start and help-command failures.

### Changed

- 🧠 **Command discovery logic:** Improved `getCoreTopLevelCommands()` fallback behavior to ensure a stable, non-empty command set when `--help` probing fails.
- ⚙️ **CI smoke workflow:** Updated e2e smoke workflow to stay aligned with the refined bridge and command discovery behavior.

### Fixed

- 🛠️ **Bridge edge cases:** Fixed scenarios where command discovery could return inconsistent or partial results due to help-command failures or cached state.
- 🧪 **Test stability:** Reduced brittle assertions in bridge tests to make them resilient to internal implementation changes.

### Notes

- This patch release focuses on stability, test coverage, and safer command discovery behavior in the npm ↔ Python Core bridge layer.


## [0.15.0] - 2026-01-30

### Added

- 🔧 **CLI wrapper flags:** `--create-workspace` and `--no-workspace` are now handled by the npm wrapper for `create project` flows. Wrapper processes workspace creation UX before invoking the Python engine and filters wrapper-only flags so they are not forwarded to the core CLI.
- 🧩 **`registerWorkspaceAtPath()` helper:** Register an existing directory as a RapidKit workspace. Creates `.rapidkit-workspace`, `.gitignore`, workspace launcher (`rapidkit`, `rapidkit.cmd`), `README.md` and installs RapidKit engine (Poetry/venv/pipx).
- 🧪 **Tests:** Unit tests and e2e smoke tests for workspace registration and Scenario C regression tests added to prevent regressions.
- ⚙️ **CI workflow:** `.github/workflows/e2e-smoke.yml` added to run focused e2e smoke and Scenario C regression tests on PRs.

### Changed

- 🐍 **Poetry behavior:** `installWithPoetry()` now configures `poetry config virtualenvs.in-project true` to ensure in-project `.venv` is created by default (parity with VS Code extension behavior).
- 🧭 **Create UX:** Creating a project outside a workspace prompts the user by default (unless `--yes` or wrapper flags specify otherwise).

### Fixed

- 🛠️ **Scenario C:** Improved Python core detection heuristics in the bridge to avoid bootstrapping a bridge venv when the system Python already has `rapidkit-core` installed. This prevents unnecessary environment changes and confusing UX.

### Documentation

- 📝 Updated README and docs to document new flags and the create-project outside-workspace UX.

### Notes

- This release stabilizes CLI-to-core interactions and UX around workspace creation to align npm wrapper behavior with the VS Code extension.

## [0.14.1] - 2025-12-31

### Fixed

- 🐛 **Poetry virtualenv detection** - Support Poetry virtualenvs outside project directory
  - rapidkit now detects Poetry virtualenv via `poetry env info --path`
  - No longer requires `.venv` in project directory
  - Works with Poetry's default cache location (`~/.cache/pypoetry/virtualenvs/`)
  - Eliminates need for `poetry config virtualenvs.in-project true`
- 🔧 **Shell script improvements** - Updated `.rapidkit/rapidkit.j2` to auto-detect Poetry venv
- 💬 **Better feedback** - Shows virtualenv location when using Poetry cache

## [0.14.0] - 2025-12-31

### Changed

- ⬆️ **Node.js requirement** - Updated to >=20.19.6 (LTS Iron)
  - Better compatibility with latest Node.js LTS
  - Improved performance and security
- ⬆️ **Python dependencies** - Updated to latest stable versions
  - Python: ^3.10.14 for broader compatibility
  - FastAPI: 0.128.0
  - Uvicorn: 0.40.0
  - Pydantic: 2.12.5
  - pydantic-settings: 2.12.0
- ⬆️ **Python dev tools** - Updated to latest versions
  - pytest: 9.0.2
  - black: 25.12.0
  - ruff: 0.14.10
  - mypy: 1.19.1
  - isort: 7.0.0
  - httpx: 0.28.1 (synced across all templates)
- ⬆️ **NestJS dependencies** - Updated to latest stable versions
  - @nestjs/common, @nestjs/core, @nestjs/platform-express: 11.1.10
  - Jest: 30.2.0
  - TypeScript: 5.9.3
  - All related dev dependencies updated

### Fixed

- 🐛 **Consistency** - Synced httpx version to 0.28.1 across all templates
  - Fixed version mismatch between create.ts and template files

## [0.13.0] - 2025-12-22

### Added

- 🧪 **NestJS test suite** — 13 new tests for NestJS project generation
  - Tests for project structure, config, tsconfig, .env.example
  - Tests for package manager variants (npm, yarn, pnpm)
  - Mocked execa for fast, reliable package manager tests

### Improved

- 📈 **Test coverage boost** — demo-kit.ts coverage: 75% → 90%+
  - Total tests: 431 → 444
  - Overall coverage: 93.5% → 95.35%
- 📝 **Documentation fixes** — Updated dates and minor corrections

## [0.12.9] - 2025-12-22

### Improved

- 📝 **Unified CLI commands** - All documentation and success messages now use `npx rapidkit` consistently
  - Same command works everywhere: `npx rapidkit <name> --template <type>`
  - No more confusion between `rapidkit create` and `npx rapidkit`
- 💡 **Helpful tip after project creation** - Added tip: "Install globally (npm i -g rapidkit) to use without npx"
  - Helps first-time users understand their options
- 📚 **Documentation updates** - Simplified README with clearer command examples
  - Updated all template READMEs to use `npx rapidkit` commands

## [0.12.8] - 2025-12-13

### Fixed

- 🐛 **Windows spawn EINVAL error** - Fixed `spawn EINVAL` error when running `rapidkit init` on Windows
  - Added `shell: true` option for spawning `.cmd` files on Windows
  - Windows requires command interpreter to execute batch files

### Improved

- 📝 **Python not found message** - Better error message when Python is not installed
  - Shows multiple installation options (Microsoft Store, python.org, winget, chocolatey)
  - Clear instructions to restart terminal after installation

## [0.12.7] - 2025-12-13

### Added

- 🪟 **Windows Support** - Full Windows compatibility for `rapidkit` commands
  - Added `rapidkit.cmd` Windows batch wrapper for FastAPI projects
  - Added `rapidkit.cmd` Windows batch wrapper for NestJS projects
  - Global CLI now auto-detects `.cmd` files on Windows
  - `rapidkit init/dev/test/...` now works natively on Windows (no `.\` prefix needed)

### Fixed

- 🐛 **Windows CLI Delegation** - Fixed "rapidkit is not recognized" error on Windows
  - `findLocalLauncherUpSync()` now checks `.cmd` files first on Windows
  - `delegateToLocalCLI()` now checks `.cmd` files first on Windows
  - Early pip engine detection updated for Windows compatibility

## [0.12.6] - 2025-12-12

### Added

- ✅ **Quality metrics system** — Comprehensive metrics tracking for bundle size, test coverage, ESLint warnings, and security vulnerabilities
  - New `scripts/metrics.ts` for automated metrics collection
  - Metrics validation against defined targets (bundle < 500KB, coverage > 80%, 0 errors)
  - New `npm run metrics` command for on-demand quality checks
  - Complete documentation in `docs/METRICS.md`
- ✅ **Enhanced pre-commit hooks** — Stricter quality gates before commits
  - Added type checking (`npm run typecheck`)
  - Added format validation (`npm run format:check`)
  - Added test execution (`npm test`)
  - Clear progress messages for each validation step
- ✅ **Commit message validation** — New `.husky/commit-msg` hook
  - Enforces [Conventional Commits](https://www.conventionalcommits.org/) format
  - Provides helpful error messages with examples
  - Supports all standard types (feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert)
- ✅ **Security automation** — GitHub Actions workflows for continuous security monitoring
  - Daily security audits via `.github/workflows/security.yml`
  - npm audit with artifact uploads for historical tracking
  - Dependency update checks with `npm-check-updates`
- ✅ **Quality automation** — GitHub Actions workflow for metrics tracking
  - Automated metrics collection on every PR and push
  - Bundle size validation (fails if > 500KB)
  - Coverage upload to Codecov
  - Quality gates for CI/CD pipeline

### Improved

- 🎯 **ESLint configuration** — Smarter linting with context-aware rules
  - Reduced warnings from 61 to 1 by allowing `any` in test files
  - Added override rules for test files (`**/__tests__/**/*.ts`, `**/*.test.ts`)
  - Improved ignore patterns to include `coverage/`
  - Only production code subject to strict `any` warnings
- 📚 **npm scripts** — New quality and security commands
  - `npm run quality` — Run all quality checks (validate + security + metrics)
  - `npm run security:fix` — Auto-fix security vulnerabilities
  - `npm run metrics` — Collect and validate metrics

### Documentation

- 📖 **METRICS.md** — Complete guide to quality metrics
  - Defined targets for all metrics
  - Instructions for manual and automated collection
  - Troubleshooting and best practices
  - CI/CD integration documentation
- 📊 **QUALITY_IMPROVEMENTS.md** — Implementation summary
  - Detailed breakdown of all improvements
  - Current metrics status
  - Usage examples and next steps

### Fixed

- 🧹 **Code quality** — Cleaner codebase with reduced linter warnings
  - 60 ESLint warnings eliminated in test files
  - Only 1 warning remaining in production code

## [0.12.5] - 2025-12-06

### Fixed

- 🛠️ **CI/CD cross-platform compatibility** — Fixed GitHub Actions workflow for all platforms
  - Added platform-specific rollup binary installation (darwin-arm64, win32-x64-msvc)
  - Works around npm optional dependency bug on macOS and Windows
  - Explicit bash shell for cross-platform script compatibility
- 🛠️ **Node.js 20 only** — Removed Node.js 18 from test matrix (vitest 4.0.15+ requires Node 19+)

## [0.12.4] - 2025-12-06

### Added

- ✅ **Friendly activation UX** — `rapidkit shell activate` now prints a prominent green header with a clear one-line instruction followed by the eval-able activation snippet
- ✅ **Unit tests for shell activation** — Added comprehensive tests validating output formatting and behavior

### Fixed

- 🛠️ **Shell-activate robustness** — Now gracefully handles missing or unparseable `context.json` by falling back to `.venv` or `.rapidkit/activate`
- 🛠️ **ESLint violations** — Fixed no-inner-declarations, no-constant-condition, no-useless-escape, unused variable warnings
- 🛠️ **Code quality** — All 431 tests passing, 0 lint errors, 61 warnings only

### Changed

- 📝 **Improved documentation** — Updated README and release notes with v0.12.4 details

## [0.12.3] - 2025-12-04

### Changed

- 🎯 **Smart CLI Delegation** - Global `rapidkit` command now auto-detects project context
  - Running `rapidkit init/dev/test/...` inside a project automatically delegates to local `./rapidkit`
  - No more confusion between global npm command and local project commands
  - Users can now run `rapidkit init` anywhere without `./` prefix or `source .rapidkit/activate`
  - Workflow: `npx rapidkit my-api --template fastapi && cd my-api && rapidkit init && rapidkit dev`

## [0.12.2] - 2025-12-04

### Changed

- ⚡ **Simplified Workflow** - `rapidkit init` now auto-activates environment
  - No longer need to run `source .rapidkit/activate` manually
  - `rapidkit init` sources activate script internally before installing dependencies
  - Streamlined developer experience: just `cd project && rapidkit init && rapidkit dev`
- 📝 **Updated Documentation** - Removed `source .rapidkit/activate` from all docs
  - README.md updated with simplified workflow
  - All docs/ files updated
  - Success messages show simplified 2-step workflow

### Fixed

- 🐛 **Environment Activation** - Fixed Poetry/npm not found errors when running `rapidkit init`
  - `rapidkit init` now properly sets up PATH before running package manager

## [0.12.1] - 2025-12-03

### Fixed

- 🐛 **NestJS Output Messages** - Fixed port display in CLI output (was showing 3000, now correctly shows 8000)

## [0.12.0] - 2025-12-03

### Added

- 🆕 **Two Modes of Operation**
  - **Direct Project Mode** (`--template`) - Create standalone FastAPI/NestJS projects
  - **Workspace Mode** (default) - Create workspace for multiple projects
- 🆕 **NestJS Template** - Full NestJS project support with TypeScript
  - Swagger/OpenAPI documentation at `/docs`
  - Example CRUD module
  - Testing setup with Jest
  - ESLint + Prettier configuration
- 🆕 **Makefile Support** - Alternative commands for FastAPI projects
  - `make dev`, `make test`, `make lint`, etc.
- 🆕 **Default Port 8000** - Both FastAPI and NestJS now use port 8000

### Changed

- 📝 **Updated CLI** - `npx rapidkit` now supports both modes
  - `npx rapidkit my-api --template fastapi` → Direct project
  - `npx rapidkit my-workspace` → Workspace mode
- 🔧 **Improved Project CLI**
  - Better error messages with actionable hints
  - `--reload-dir src` for FastAPI dev server
  - Port/host configuration via `--port` and `--host` flags
- 📝 **Updated Documentation** - All docs reflect new workflow

### Fixed

- 🐛 **Python Detection** - Smart fallback chain for finding Python
- 🐛 **NestJS Port** - Changed default from 3000 to 8000 for consistency

## [0.11.3] - 2025-12-03

### Added

- 🆕 **Local RapidKit Commands** - Demo projects now support `rapidkit` CLI commands
  - Added `.rapidkit/` folder with local launcher and CLI handler
  - `rapidkit init` - Install dependencies via poetry
  - `rapidkit dev` - Start development server with hot reload
  - `rapidkit start` - Start production server
  - `rapidkit test` - Run tests
  - `rapidkit help` - Show available commands
- ✅ **New Tests** - 6 new tests for `.rapidkit/` folder generation (431 total)
  - Test `.rapidkit/` folder structure generation
  - Test executable permissions on Unix systems
  - Test `project.json` content validation
  - Test `cli.py` command handlers
  - Test rapidkit launcher script content

### Changed

- 📝 **Updated Documentation** - All documentation uses `rapidkit` commands
  - README.md updated to use `rapidkit init` and `rapidkit dev`
  - Demo workspace structure shows `.rapidkit/` folder
  - README.md.j2 template updated with rapidkit commands
  - Success messages show rapidkit commands with emoji descriptions
- 🎯 **Improved UX** - Better user experience for demo projects
  - Commands aligned with full RapidKit CLI syntax
  - Consistent command interface across demo and full modes

### Fixed

- 🐛 **Template String Escaping** - Fixed bash variable syntax in embedded scripts
  - Properly escaped `${1:-}` in JavaScript template literals

## [0.11.2] - 2025-06-22

### Changed

- 📝 **CLI Command Documentation** - Updated command references throughout
  - Changed `rapidkit run dev` → `rapidkit dev` (simplified)
  - Changed `poetry install` → `rapidkit init` (preferred method)
  - Updated README templates and success messages
- 🌐 **Documentation URLs** - Changed `rapidkit.dev` → `getrapidkit.com`
- 🏥 **FastAPI Health Router** - Enhanced health.py template
  - Added `/health/modules` endpoint to catalog module health routes
  - Integrated with health registry for dynamic module discovery
  - Router now includes prefix and tags directly

### Fixed

- 🐛 **FastAPI Templates** - Fixed router mount duplication
  - Removed redundant prefix/tags from api_router.include_router()
  - Router configuration now managed at router definition level

## [0.11.1] - 2025-11-14

### Added

- ✅ **Enhanced Test Coverage** - Increased from 72.69% to 74.63% (426 tests)
  - 37 new CLI integration tests for index.ts
  - 6 new decorator tests for performance monitoring
  - 3 new error handling tests for demo workspace creation
  - Test coverage for version, help, dry-run, debug modes
  - Edge case testing for invalid inputs, special characters
  - Git failure and error recovery testing

### Changed

- 🔧 **TypeScript Configuration** - Enabled experimental decorators
  - Added `experimentalDecorators` for performance decorator support
  - Added `emitDecoratorMetadata` for enhanced decorator functionality

### Fixed

- 🐛 **Test Suite** - Fixed async/await syntax error in create-helpers.test.ts
  - Path operation tests now properly handle async imports
- 🐛 **Performance Utilities** - Achieved 100% test coverage
  - All decorator edge cases covered
  - Error handling in decorated methods validated
  - Context preservation (this binding) tested
- 🐛 **Code Quality** - Fixed ESLint errors and formatting issues
  - Removed unused imports across 5 test files
  - Fixed code formatting with Prettier (5 files)
  - Added format check to pre-push validation hook
  - Ensured CI compliance for all code quality checks

### Testing

- **Total Tests**: 426 (up from 393)
- **Coverage**: 74.63% overall
  - config.ts: 100%
  - errors.ts: 100%
  - logger.ts: 100%
  - update-checker.ts: 100%
  - performance.ts: 100% (improved from 79%)
  - cache.ts: 96.7%
  - validation.ts: 96%
  - demo-kit.ts: 94.82%
  - create.ts: 91.06% (improved from 90.07%)

## [0.11.0] - 2025-11-14

### Fixed

- 🐛 **Version Display** - Fixed version command showing incorrect hardcoded version
  - Now reads version dynamically from package.json
  - Ensures --version always shows correct installed version
  - package.json automatically copied to dist during build

## [0.10.0] - 2025-11-08

### Changed

- ⚡ **Bundle Optimization** - Migrated from TypeScript compiler to tsup
  - 80% bundle size reduction (208KB → 40KB)
  - Production build now minified and tree-shaked
  - Removed source maps from production builds
  - Single bundled file for faster installation
  - Optimized for Node.js 18+ with modern features
- 🔄 **Versioning Strategy** - Switched from beta to 0.x.x versioning
  - Indicates pre-stable development phase
  - Will release 1.0.0 when RapidKit Python is published on PyPI

### Developer Experience

- 🛠️ **Build System** - Added tsup configuration for optimized builds
- 📦 **Bundle Size** - Automated bundle size monitoring in build process
- 🚀 **Performance** - Faster CLI startup time with optimized bundle

## [1.0.0-beta.9] - 2025-11-07

### Added

- ✅ **E2E Integration Tests** - Comprehensive end-to-end testing suite
  - Demo workspace creation tests
  - Invalid input validation tests
  - Dry-run mode verification
  - Version and help command tests
- ✅ **CI/CD Pipeline** - GitHub Actions workflow
  - Multi-platform testing (Ubuntu, macOS, Windows)
  - Multiple Node.js versions (18, 20)
  - Automated linting, type-checking, and testing
  - Security audit integration
  - Bundle size monitoring
  - Code coverage upload to Codecov
- ✅ **Enhanced Error System**
  - `NetworkError` - Network-related failures with troubleshooting steps
  - `FileSystemError` - File operation errors with detailed guidance
  - Improved `InstallationError` with actionable troubleshooting
  - Better `RapidKitNotAvailableError` with clear alternatives
- ✅ **New NPM Scripts**
  - `npm run test:e2e` - Run end-to-end tests
  - `npm run security` - Security audit with moderate severity threshold
  - `npm run bundle-size` - Check compiled bundle size

### Changed

- 🔧 **Improved Error Messages** - All errors now include detailed troubleshooting steps
- 🔧 **Better Error Details** - Installation errors show common solutions
- 🔧 **Enhanced UX** - Clearer error feedback for users

### Fixed

- 🐛 **Error Stack Traces** - Proper stack trace capture in all custom error classes
- 🐛 **Error Message Formatting** - Consistent formatting across all error types

## [1.0.0-beta.8] - 2025-11-01

### Changed

- 🎯 **Simplified CLI command** - Changed bin name from `create-rapidkit` to `rapidkit`
  - Now use `npx rapidkit` instead of `npx create-rapidkit`
  - More intuitive and aligned with package name
- ✨ **Updated command name** in CLI from `create-rapidkit` to `rapidkit`
- 📝 **Updated welcome messages** to use "RapidKit" branding
- 🔧 **Updated internal references** - All comments and documentation updated
- 🐛 **Fixed VS Code extension integration** - CLI wrapper now uses correct command name

### Fixed

- Reserved package names validation updated to reflect new bin name

## [1.0.0-beta.7] - 2025-10-31

### Fixed

- Fixed package name in demo workspace generator script (changed from `create-rapidkit` to `rapidkit`)
- Fixed help text examples to use correct package name `rapidkit` instead of `create-rapidkit`

## [1.0.0-beta.6] - 2025-10-31

### Added

- **Code Quality Tools**
  - ESLint with TypeScript support (latest @typescript-eslint v8.21.0)
  - Prettier for consistent code formatting
  - Husky v9 for Git hooks
  - Lint-staged for pre-commit validation
  - Pre-commit hooks that auto-fix and format code
- **Performance Utilities**
  - Two-layer cache system (memory + disk) with 24-hour TTL
  - Performance monitoring with metrics tracking
  - `getCachedOrFetch` helper for easy caching integration
  - `measure` helper for performance tracking
  - `measurePerformance` decorator for methods
- **New NPM Scripts**
  - `npm run lint` - Check code with ESLint
  - `npm run lint:fix` - Auto-fix linting errors
  - `npm run format` - Format code with Prettier
  - `npm run format:check` - Check formatting
  - `npm run typecheck` - Type checking without build
  - `npm run validate` - Complete validation pipeline

### Changed

- **Documentation** - All documentation converted to English
  - Reorganized documentation into `docs/` folder
  - `docs/DEVELOPMENT.md` - Development guide
  - `docs/SETUP.md` - Quick setup and commands
  - `docs/OPTIMIZATION_GUIDE.md` - Optimization suggestions
  - `docs/UTILITIES.md` - Cache and performance utilities
  - `docs/README.md` - Documentation index
- **Type Safety Improvements**
  - Replaced `any` types with proper TypeScript types
  - Better type inference in cache and performance utilities
  - Stricter ESLint rules for unused variables
- **Code Quality**
  - All TypeScript files formatted with Prettier
  - Zero linting errors and warnings
  - All 26 tests passing
  - Better error handling with proper type guards

### Fixed

- TypeScript 5.9.3 compatibility (updated @typescript-eslint packages)
- Unused variable warnings fixed with proper naming conventions
- Cache type inference issues resolved

### Security

- Security audit of dependencies performed
- 7 moderate vulnerabilities identified (in dev dependencies only)

## [1.0.0-beta.5] - 2025-10-23

### Added

- **Custom error classes** with detailed error codes and messages
  - `RapidKitError` base class with `code` and `details` properties
  - Specific errors: `PythonNotFoundError`, `PoetryNotFoundError`, `PipxNotFoundError`, etc.
- **Comprehensive input validation** for project names
  - NPM package name validation
  - Python naming convention validation
  - Reserved name checking
  - Length validation (2-214 characters)
- **Configuration file support** (`~/.rapidkitrc.json`)
  - Set default values for all options
  - Per-user customization
  - Environment variable support
- **Debug mode** (`--debug` flag)
  - Verbose logging for troubleshooting
  - Shows config loading, path resolution, and installation details
- **Dry-run mode** (`--dry-run` flag)
  - Preview what would be created without actually creating it
  - Shows file structure, configuration, and next steps
- **Update checker**
  - Automatically checks for newer versions on npm
  - Non-intrusive notification with update instructions
- **Graceful interrupt handling**
  - SIGINT/SIGTERM handlers for clean shutdown
  - Automatic cleanup of partial installations on Ctrl+C
- **Improved progress reporting**
  - Step-by-step progress with clear states
  - Better spinner messages
  - Detailed success/error messages
- **Testing framework**
  - Vitest with 26 tests covering core functionality
  - Test coverage reporting
  - Tests for validation, errors, and config
- **Template versioning**
  - `kit.json` metadata for each template
  - Version tracking and compatibility information

### Changed

- **Removed hardcoded paths** - No personal data in source code
  - Test mode now uses `RAPIDKIT_DEV_PATH` environment variable
  - Falls back to config file `testRapidKitPath`
  - Clear error messages if path not configured
- **Better error handling** throughout codebase
  - All errors extend `RapidKitError` base class
  - Consistent error messages with helpful details
  - Machine-readable error codes
- **Improved CLI help and usage**
  - More descriptive option descriptions
  - Better examples in README
  - Comprehensive development guide

### Fixed

- TypeScript strict mode compliance
- Unused variable warnings
- Missing type definitions

### Security

- Removed hardcoded file paths that could leak developer information
- Environment variable support for sensitive configuration
- User config file excluded from git

## [1.0.0-beta.4] - 2025-10-05

### Added

- Demo mode with bundled templates
- Multiple install methods (Poetry, venv, pipx)
- Test mode for local RapidKit installation

### Fixed

- Poetry package-mode configuration
- Cross-platform path handling

## [1.0.0-beta.3] - 2025-09-20

### Added

- Initial beta release
- Basic project creation
- README generation

## Configuration Examples

### User Configuration (~/.rapidkitrc.json)

```json
{
  "defaultKit": "fastapi.standard",
  "defaultInstallMethod": "poetry",
  "pythonVersion": "3.11",
  "author": "Your Name",
  "license": "MIT",
  "skipGit": false
}
```

### Environment Variables

```bash
export RAPIDKIT_DEV_PATH=/path/to/local/rapidkit
```

## Migration Guide

### From beta.4 to beta.5

No breaking changes. All existing commands work the same way.

New optional features:

- Add `--debug` for verbose logging
- Add `--dry-run` to preview changes
- Create `~/.rapidkitrc.json` for custom defaults
- Set `RAPIDKIT_DEV_PATH` for test mode (replaces hardcoded path)

## Deprecations

None in this release.

## Roadmap

### v1.0.0 (Stable Release) - Coming Soon

- [ ] RapidKit Python package on PyPI
- [ ] Full installation mode without --test-mode
- [x] NestJS template support ✅
- [ ] Interactive config wizard
- [ ] Auto-update functionality

### v1.1.0

- [ ] Plugin system for custom templates
- [ ] Cloud deployment integrations
- [ ] CI/CD template generation
- [ ] Multi-language support

### v2.0.0

- [ ] Complete rewrite with enhanced architecture
- [ ] GraphQL support
- [ ] Microservices orchestration
- [ ] Kubernetes deployment templates

# Changelog

All notable changes to RapidKit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- 🌐 **Documentation URLs** - Changed `rapidkit.dev` → `rapidkit.top`
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

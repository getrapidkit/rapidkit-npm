# Changelog

All notable changes to RapidKit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- [ ] More templates (NestJS, advanced kits)
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

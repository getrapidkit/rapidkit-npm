# Changelog

All notable changes to create-rapidkit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

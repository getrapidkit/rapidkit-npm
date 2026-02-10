# Release Notes

## Latest Release: v0.19.0 (February 10, 2026)

### ✨ v0.19.0 — AI-Powered Module Recommender (Minor)

This minor release introduces the **AI-powered module recommender** feature with intelligent module suggestions using OpenAI embeddings and semantic search.

**What's New:**

- 🤖 **AI Module Recommender** - Intelligent module suggestions using OpenAI embeddings
  - 🧠 Semantic search for modules (understands intent, not just keywords)
  - 🔄 Dynamic module fetching from Python Core (27+ production modules)
  - 🤖 Auto-generate embeddings with interactive prompts
  - ✅ Mock mode for testing without API key
  - 🎯 Cosine similarity algorithm (92%+ match scores)
  - 💰 Ultra-cheap: ~$0.0002 per query (practically free)
  - ⚡ 5-minute cache for optimal performance
  - 🛡️ Graceful fallback to 11 hardcoded modules

- 🛠️ **New CLI Commands**:
  - `rapidkit ai recommend [query]` - Get module recommendations
  - `rapidkit ai recommend [query] -n <N>` - Top N recommendations
  - `rapidkit ai recommend [query] --json` - JSON output
  - `rapidkit ai generate-embeddings` - Generate embeddings
  - `rapidkit ai info` - Show AI features guide
  - `rapidkit config set-api-key` - Configure OpenAI API key
  - `rapidkit config show` - View configuration

**Bug Fixes:**

- 🐛 **AI Module Name Format** - Fixed critical module ID format mismatch
  - Module IDs now preserve underscores (ai_assistant, auth_core) matching Python Core
  - Updated to JSON Schema v1 API
  - Fixed command routing for AI and config commands
  - Externalized openai package (prevents bundling 10MB SDK)

**Documentation:**

- 📚 Complete AI features guide, quickstart, examples, and integration docs
- Updated README with comprehensive AI section

**Security:**

- 🔒 API keys stored securely in ~/.rapidkit/config.json (600 permissions)
- Environment variable support (OPENAI_API_KEY)

**Testing:**

- ✅ 691 tests passing (76 new AI tests)
- Mock mode tests (no API key needed)

### ⬆️ Upgrade

```bash
npm install -g rapidkit@0.19.0
```

---

## Previous Release: v0.18.1 (February 9, 2026)

### 🐛 v0.18.1 — Bug Fixes (Patch)

Minor bug fix release addressing Windows CI test failure.

**Bug Fixes:**

- 🐛 Fixed cross-platform path normalization test
  - Updated path test to properly handle both Unix (/) and Windows (\\) path separators
  - Resolves Windows CI failure in create-helpers.test.ts

**No breaking changes.** Fully backward compatible.

### ⬆️ Upgrade

```bash
npm install -g rapidkit@0.18.1
```

---

## Previous Release: v0.18.0 (February 9, 2026)

### ✨ v0.18.0 — Core Bridge & Contract Infrastructure (Minor)

This minor release introduces **new features and infrastructure** improvements, including contract synchronization, modules catalog API, enhanced Python bridge reliability, and template fixes.

**What's New:**

- 🔗 **Contract Sync Infrastructure**: Automated Core ↔ NPM contract validation
  - New npm scripts: `sync:contracts` and `check:contracts`
  - Integrated into CI workflow and pre-commit hooks
  - Ensures API compatibility between Core Python and NPM packages
  
- 📊 **Modules Catalog API**: New `getModulesCatalog()` function for fetching modules
  - Supports filtering by category, tag, and detail level
  - 30-minute cache with automatic fallback to legacy format
  
- 🔧 **Enhanced Python Bridge**: Major reliability improvements
  - **Multi-venv Support**: Isolated environments per Core package spec
  - **Smart Retry Logic**: Exponential backoff for pip operations (2 retries by default)
  - **Better Error Messages**: Granular error codes with actionable guidance
  - **Timeout Protection**: Configurable timeouts for all operations
  - **Legacy Migration**: Automatic reuse of existing venvs where appropriate

**Improvements:**

- 👀 **Doctor Command**: Now displays multiple RapidKit Core installations with versions
- 🧪 **Test Coverage**: Enhanced contract validation in drift guard tests
- 📦 **Demo Kit**: Added missing template variables (node_version, database_type, include_caching)

**Bug Fixes:**

- 🐛 Fixed NestJS docker-compose.yml nunjucks ternary operator syntax error
- 🗑️ Removed redundant `.env.example.j2` from NestJS template

**New Environment Variables:**

- `RAPIDKIT_BRIDGE_PIP_RETRY`: Retry count for pip (default: 2)
- `RAPIDKIT_BRIDGE_PIP_RETRY_DELAY_MS`: Backoff delay (default: 800ms)
- `RAPIDKIT_BRIDGE_PIP_TIMEOUT_MS`: Pip timeout (default: 120000ms)
- `RAPIDKIT_CORE_PYTHON_PACKAGE_ID`: Custom venv identifier

**No breaking changes.** Fully backward compatible.

### ⬆️ Upgrade

```bash
npm install -g rapidkit@0.18.0
```

[📖 Full Release Notes](./releases/RELEASE_NOTES_v0.18.0.md)

---

## Previous Releases

### 🩺 v0.17.0 — Enhanced Doctor Command (February 6, 2026)

This release delivers a **major upgrade** to the `doctor` command with comprehensive workspace health monitoring and intelligent diagnostics.

**What's New:**

- 🩺 **Enhanced Doctor Command** - Complete overhaul with 15+ new features:
  - **Framework Detection**: Automatically identifies FastAPI 🐍 or NestJS 🦅 projects
  - **Health Score System**: Visual percentage-based scoring with detailed breakdown
  - **Project Statistics**: Module counts from registry.json
  - **Last Modified Tracking**: Git-aware timestamps (e.g., "2 days ago")
  - **Test Detection**: Identifies test directories
  - **Docker Support**: Validates Dockerfile presence
  - **Code Quality Tools**: Checks ESLint (NestJS) or Ruff (FastAPI)
  - **Security Scanning**: npm audit integration for vulnerabilities
  - **Actionable Fix Commands**: Project-specific commands to resolve issues
  - **JSON Output Mode**: Machine-readable format for CI/CD (`--json` flag)
  - **Auto-Fix Capability**: Interactive fix application (`--fix` flag)
  - **Version Compatibility**: Alerts on Core/CLI mismatches
  - **Module Health**: Validates Python `__init__.py` files
  - **Environment Validation**: Detects missing `.env` files

- ⚙️ **Improved Core Detection**: Workspace venv prioritized over global installation
- 🎯 **Enhanced Display**: Framework icons, kit info, organized status indicators
- 🐛 **Bug Fixes**: fs-extra ESM compatibility, command execution, dependency detection

**No breaking changes.** Fully backward compatible.

### ⬆️ Upgrade

```bash
npm install -g rapidkit@0.17.0
```

[📖 Full Release Notes](./releases/RELEASE_NOTES_v0.17.0.md)

---

## Previous Releases

| Version                                      | Date         | Highlights                                                           |
| -------------------------------------------- | ------------ | -------------------------------------------------------------------- |
| [v0.17.0](releases/RELEASE_NOTES_v0.17.0.md) | Feb 6, 2026  | Enhanced doctor command, workspace health monitoring, auto-fix       |
| [v0.16.5](releases/RELEASE_NOTES_v0.16.5.md) | Feb 5, 2026  | Configuration file support, doctor command, diagnostics              |
| [v0.16.4](releases/RELEASE_NOTES_v0.16.4.md) | Feb 2, 2026  | Documentation quality, test stability, code polish                  |
| [v0.16.3](releases/RELEASE_NOTES_v0.16.3.md) | Feb 1, 2026  | Template fixes, Python Core 0.2.2 compatibility, test updates       |
| [v0.16.0](releases/RELEASE_NOTES_v0.16.0.md) | Feb 1, 2026  | Workspace registry, unified signatures, cross-tool integration       |
| [v0.15.1](releases/RELEASE_NOTES_v0.15.1.md) | Jan 31, 2026 | Bridge stability, command fallback, improved test coverage           |
| [v0.15.0](releases/RELEASE_NOTES_v0.15.0.md) | Jan 30, 2026 | Core integration, workspace UX, Scenario C fix, tests & CI           |
| [v0.14.2](releases/RELEASE_NOTES_v0.14.2.md) | Jan 23, 2026 | Documentation & cleanup           |
| [v0.14.1](releases/RELEASE_NOTES_v0.14.1.md) | Dec 31, 2025 | Poetry virtualenv detection fix   |
| [v0.14.0](releases/RELEASE_NOTES_v0.14.0.md) | Dec 31, 2025 | Major dependency updates          |
| [v0.13.1](releases/RELEASE_NOTES_v0.13.1.md) | Dec 25, 2025 | Type safety & test coverage       |
| [v0.13.0](releases/RELEASE_NOTES_v0.13.0.md) | Dec 22, 2025 | NestJS test coverage boost        |
| [v0.12.9](releases/RELEASE_NOTES_v0.12.9.md) | Dec 22, 2025 | Unified npx commands              |
| [v0.12.8](releases/RELEASE_NOTES_v0.12.8.md) | Dec 13, 2025 | Windows spawn fix                 |
| [v0.12.7](releases/RELEASE_NOTES_v0.12.7.md) | Dec 13, 2025 | Windows support                   |
| [v0.12.6](releases/RELEASE_NOTES_v0.12.6.md) | Dec 12, 2025 | Quality & security infrastructure |
| [v0.12.5](releases/RELEASE_NOTES_v0.12.5.md) | Dec 6, 2025  | CI/CD cross-platform fixes        |
| [v0.12.4](releases/RELEASE_NOTES_v0.12.4.md) | Dec 6, 2025  | Shell activation UX               |
| [v0.12.3](releases/RELEASE_NOTES_v0.12.3.md) | Dec 4, 2025  | Smart CLI delegation              |
| [v0.12.2](releases/RELEASE_NOTES_v0.12.2.md) | Dec 4, 2025  | Auto-activate in init command     |
| [v0.12.1](releases/RELEASE_NOTES_v0.12.1.md) | Dec 3, 2025  | NestJS port fix                   |
| [v0.12.0](releases/RELEASE_NOTES_v0.12.0.md) | Dec 3, 2025  | NestJS support                    |
| [v0.11.3](releases/RELEASE_NOTES_v0.11.3.md) | Dec 3, 2025  | Bug fixes                         |
| [v0.11.2](releases/RELEASE_NOTES_v0.11.2.md) | Dec 3, 2025  | Improvements                      |
| [v0.11.1](releases/RELEASE_NOTES_v0.11.1.md) | Nov 28, 2025 | Features                          |
| [v0.11.0](releases/RELEASE_NOTES_v0.11.0.md) | Nov 8, 2025  | Major release                     |

For complete changelog, see [CHANGELOG.md](CHANGELOG.md).

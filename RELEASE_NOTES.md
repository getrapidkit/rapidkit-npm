# Release Notes

## Latest Release: v0.19.1 (February 12, 2026)

### 🛠️ v0.19.1 — Dependency Refresh & Compatibility (Patch)

This patch release focuses on dependency freshness, compatibility improvements, and release hardening.

**What Changed:**

- ⬆️ Upgraded `inquirer` to `^13.2.2`.
- 🔄 Updated lockfiles (`package-lock.json`, `yarn.lock`) to match the new dependency tree.
- 🧩 Updated generated demo Poetry template to use `python = "^3.10"` instead of patch-pinned `^3.10.14`.

**Security & Quality:**

- ✅ `npm audit --audit-level=high` reports zero vulnerabilities.
- ✅ `npm test` passes after the update.

**No breaking changes.** Fully backward compatible.

### ⬆️ Upgrade

```bash
npm install -g rapidkit@0.19.1
```

[📖 Full Release Notes](./releases/RELEASE_NOTES_v0.19.1.md)

---

## Previous Release: v0.19.0 (February 10, 2026)

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

## Previous Releases

| Version                                      | Date         | Highlights                                                           |
| -------------------------------------------- | ------------ | -------------------------------------------------------------------- |
| [v0.19.1](releases/RELEASE_NOTES_v0.19.1.md) | Feb 12, 2026 | Dependency refresh, lockfile sync, Python template compatibility     |
| [v0.19.0](releases/RELEASE_NOTES_v0.19.0.md) | Feb 10, 2026 | AI module recommender, semantic search, config commands             |
| [v0.18.1](releases/RELEASE_NOTES_v0.18.1.md) | Feb 9, 2026  | Windows CI path normalization fix                                   |
| [v0.18.0](releases/RELEASE_NOTES_v0.18.0.md) | Feb 9, 2026  | Contract sync, modules catalog API, Python bridge reliability       |
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

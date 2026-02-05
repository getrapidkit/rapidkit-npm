# Release Notes

## Latest Release: v0.16.5 (February 5, 2026)

### ⚙️ v0.16.5 — Configuration & Diagnostics (Minor)

This minor release adds powerful configuration management and system diagnostics capabilities.

**What's New:**

- ⚙️ **Configuration File:** New `rapidkit.config.js` support for workspace-wide defaults
  - Set workspace preferences: author, Python version, install method
  - Configure project defaults: kit, modules, skip flags
  - Priority hierarchy: CLI args override config file, config file overrides .rapidkitrc.json
  - Auto-discovery from current or parent directories
  - Supports .js, .mjs, and .cjs formats
- 🩺 **Doctor Command:** New `rapidkit doctor` for comprehensive system diagnostics
  - Validates entire RapidKit toolchain (Python, pip, pipx, Poetry, Core)
  - Provides actionable troubleshooting recommendations
  - Generates detailed JSON reports for debugging
  - Helps quickly identify and resolve setup issues
- 📚 **Documentation:** Added comprehensive guides and examples
  - Configuration file usage guide
  - Doctor command documentation
  - Example configuration file

**No breaking changes.** Fully backward compatible.

### ⬆️ Upgrade

```bash
npm install -g rapidkit@0.16.5
# or
npx rapidkit@0.16.5 create project fastapi.standard my-api --output .
```

---

## Previous Releases

| Version                                      | Date         | Highlights                                                           |
| -------------------------------------------- | ------------ | -------------------------------------------------------------------- |
| [v0.16.5](releases/RELEASE_NOTES_v0.16.5.md)              | Feb 5, 2026  | Configuration file support, doctor command, diagnostics              |
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

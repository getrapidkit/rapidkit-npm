# Release Notes

## Latest Release: v0.16.3 (February 1, 2026)

### 🔧 v0.16.3 — Template Fixes & Python Core 0.2.2 Compatibility (Patch)

This patch release fixes template rendering issues and updates tests for compatibility with Python Core 0.2.2+.

**What's Fixed:**

- 🔧 **Template Compatibility:** Added `generate_secret` Nunjucks filter to match Python Core's Jinja2 implementation
  - Fixes NestJS template rendering errors when generating secrets
  - Uses crypto.randomBytes for cryptographically secure random strings
- 🧪 **Test Suite Updates:** Updated for Python Core 0.2.2+ which no longer generates `.rapidkit/` project-local CLI files
  - Skipped 5 tests related to `.rapidkit` folder (Core now uses global CLI)
  - Fixed docker-compose.yml.j2 nested ternary syntax for Nunjucks compatibility
  - Renamed env.example.j2 to .env.example.j2 for correct dotfile output
  - All 488 tests passing, 11 skipped

**Migration Note:** If you previously relied on `.rapidkit/cli.py` or `.rapidkit/rapidkit` launcher scripts in projects, Python Core 0.2.2+ now uses the global `rapidkit` CLI command instead. Update your workflows accordingly.

### ⬆️ Upgrade

```bash
npm install -g rapidkit@0.16.3
# or
npx rapidkit@0.16.3 create project fastapi.standard my-api --output .
```

## Previous Releases

### ✨ v0.16.0 — Workspace Registry & Cross-Tool Integration (Minor)

This release introduces shared workspace registry for seamless integration between npm CLI and VS Code Extension, plus unified workspace signatures for better cross-tool compatibility.

**What's New:**

- 📋 **Workspace Registry:** Shared registry at `~/.rapidkit/workspaces.json` enables cross-tool workspace discovery between npm CLI and VS Code Extension
  - `registerWorkspace()` function automatically registers workspaces
  - `workspace list` command to view all registered workspaces (no Python dependency)
  - VS Code Extension can discover npm-created workspaces and vice versa
- 🏷️ **Unified Workspace Signature:** Changed marker from `RAPIDKIT_VSCODE_WORKSPACE` to `RAPIDKIT_WORKSPACE`
  - Backward compatible: Both signatures recognized
  - Workspace markers now identify creator: `createdBy: 'rapidkit-npm'`
- 🔍 **Command Routing:** `workspace` command now handled by npm package only (not forwarded to Python Core)
  - Enables workspace management without Python dependency
  - Faster execution for workspace operations
- 📝 **Documentation:** Comprehensive workspace registry and cross-tool compatibility docs added

### ⬆️ Upgrade

```bash
npm install -g rapidkit@0.16.0
# or
npx rapidkit@0.16.0 create project fastapi.standard my-api --output .
```

## Previous Releases

| Version                                      | Date         | Highlights                                                           |
| -------------------------------------------- | ------------ | -------------------------------------------------------------------- |
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

# Release Notes

## Latest Release: v0.12.7 (December 13, 2025)

### 🪟 Windows Support

This release adds full Windows compatibility for `rapidkit` CLI commands.

### What Changed

**Windows Batch Wrappers:**
- Added `rapidkit.cmd` for FastAPI projects (Python detection with venv/poetry/system fallback)
- Added `rapidkit.cmd` for NestJS projects (Node.js detection with npm/pnpm support)
- Windows users can now run `rapidkit init` without `.\` prefix

**Global CLI Delegation:**
- `findLocalLauncherUpSync()` now checks `.cmd` files first on Windows
- `delegateToLocalCLI()` now checks `.cmd` files first on Windows
- Early pip engine detection updated for Windows compatibility

**Fixed:**
- "rapidkit is not recognized" error on Windows PowerShell
- Delegation to local project CLI on Windows

### Upgrade

```bash
npx rapidkit@latest --version  # Should show 0.12.7
```

### Windows Users

After creating a project, you can now use:
```powershell
cd my-project
rapidkit init    # ✅ Works! (no .\ prefix needed)
rapidkit dev     # ✅ Works!
rapidkit test    # ✅ Works!
```

## Previous Releases

| Version | Date | Highlights |
|---------|------|------------|
| [v0.12.6](releases/RELEASE_NOTES_v0.12.6.md) | Dec 12, 2025 | Quality & security infrastructure |
| [v0.12.5](releases/RELEASE_NOTES_v0.12.5.md) | Dec 6, 2025 | CI/CD cross-platform fixes |
| [v0.12.4](releases/RELEASE_NOTES_v0.12.4.md) | Dec 6, 2025 | Shell activation UX |
| [v0.12.3](releases/RELEASE_NOTES_v0.12.3.md) | Dec 4, 2025 | Smart CLI delegation |  
| [v0.12.2](releases/RELEASE_NOTES_v0.12.2.md) | Dec 4, 2025 | Auto-activate in init command |
| [v0.12.1](releases/RELEASE_NOTES_v0.12.1.md) | Dec 3, 2025 | NestJS port fix |
| [v0.12.0](releases/RELEASE_NOTES_v0.12.0.md) | Dec 3, 2025 | NestJS support |
| [v0.11.3](releases/RELEASE_NOTES_v0.11.3.md) | Dec 3, 2025 | Bug fixes |
| [v0.11.2](releases/RELEASE_NOTES_v0.11.2.md) | Dec 3, 2025 | Improvements |
| [v0.11.1](releases/RELEASE_NOTES_v0.11.1.md) | Nov 28, 2025 | Features |
| [v0.11.0](releases/RELEASE_NOTES_v0.11.0.md) | Nov 8, 2025 | Major release |

For complete changelog, see [CHANGELOG.md](CHANGELOG.md).

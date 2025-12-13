# Release Notes

## Latest Release: v0.12.8 (December 13, 2025)

### 🐛 Windows Spawn Fix

This release fixes the `spawn EINVAL` error on Windows and improves Python detection messages.

### What Changed

**Bug Fix:**
- Fixed `spawn EINVAL` error when running `rapidkit init` on Windows
- Added `shell: true` option for spawning `.cmd` files (required by Windows)

**Improved Python Detection:**
- Better error message when Python is not installed on Windows
- Shows multiple installation options:
  - Microsoft Store (recommended)
  - Official python.org installer
  - winget: `winget install Python.Python.3.12`
  - chocolatey: `choco install python`

### Upgrade

```bash
npx rapidkit@latest --version  # Should show 0.12.8
```

### Windows Users

If Python is not installed, you'll see a helpful message with installation options:
```
============================================================
  Python not found!
============================================================

  Install Python using one of these methods:

  1. Microsoft Store (recommended):
     https://apps.microsoft.com/detail/9NRWMJP3717K

  2. Official installer:
     https://www.python.org/downloads/

  3. Using winget:
     winget install Python.Python.3.12

  4. Using chocolatey:
     choco install python
============================================================
```

## Previous Releases

| Version | Date | Highlights |
|---------|------|------------|
| [v0.12.7](releases/RELEASE_NOTES_v0.12.7.md) | Dec 13, 2025 | Windows support |
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

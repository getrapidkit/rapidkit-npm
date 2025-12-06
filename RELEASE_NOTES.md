# Release Notes

## Latest Release: v0.12.5 (December 6, 2025)

### 🔧 CI/CD Infrastructure Fixes

This release focuses on fixing cross-platform build compatibility in GitHub Actions.

### What Changed

**CI/CD Fixes:**
- Fixed npm optional dependency bug affecting macOS and Windows runners
- Platform-specific rollup binaries now installed automatically:
  - macOS: `@rollup/rollup-darwin-arm64`
  - Windows: `@rollup/rollup-win32-x64-msvc`
- Explicit bash shell for cross-platform script compatibility
- Removed Node.js 18 from test matrix (vitest 4.0.15+ requires Node 19+)

### Upgrade

```bash
npx rapidkit@latest --version  # Should show 0.12.5
```

## Previous Releases

| Version | Date | Highlights |
|---------|------|------------|
| [v0.12.4](releases/RELEASE_NOTES_v0.12.4.md) | Dec 6, 2025 | Shell activation UX |
| [v0.12.3](releases/RELEASE_NOTES_v0.12.3.md) | Dec 4, 2025 | Smart CLI delegation |  
| [v0.12.2](releases/RELEASE_NOTES_v0.12.2.md) | Dec 4, 2025 | Auto-activate in init command |
| [v0.12.1](releases/RELEASE_NOTES_v0.12.1.md) | Dec 3, 2025 | NestJS port fix |
| [v0.12.0](releases/RELEASE_NOTES_v0.12.0.md) | Dec 3, 2025 | NestJS support |
| [v0.11.3](releases/RELEASE_NOTES_v0.11.3.md) | Dec 3, 2025 | Bug fixes |
| [v0.11.2](releases/RELEASE_NOTES_v0.11.2.md) | Dec 3, 2025 | Improvements |
| [v0.11.1](releases/RELEASE_NOTES_v0.11.1.md) | Nov 28, 2025 | Features |
| [v0.10.0](releases/RELEASE_NOTES_v0.10.0.md) | Nov 8, 2025 | Major release |

For complete changelog, see [CHANGELOG.md](CHANGELOG.md).

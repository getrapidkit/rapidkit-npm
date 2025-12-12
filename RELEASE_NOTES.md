# Release Notes

## Latest Release: v0.12.6 (December 12, 2025)

### 🎯 Quality & Security Infrastructure

This release introduces comprehensive quality metrics, enhanced pre-commit hooks, and automated security workflows.

### What Changed

**Quality Metrics System:**
- New `scripts/metrics.ts` for automated metrics collection and validation
- Track bundle size, test coverage, ESLint warnings, and security vulnerabilities
- Metrics validation against targets: bundle < 500KB, coverage > 80%, 0 errors
- New command: `npm run metrics` for on-demand quality checks
- Complete documentation in `docs/METRICS.md`

**Enhanced Pre-commit Hooks:**
- Added type checking before every commit
- Added format validation (Prettier)
- Added test execution to catch regressions
- Clear progress messages for each step
- New commit message validation enforcing Conventional Commits format

**Security & Quality Automation:**
- Daily security audits via GitHub Actions (`.github/workflows/security.yml`)
- Automated metrics collection on every PR/push (`.github/workflows/metrics.yml`)
- Bundle size validation in CI (fails if > 500KB)
- Coverage upload to Codecov

**Code Quality Improvements:**
- ESLint warnings reduced from 61 to 1
- Context-aware linting: strict in production, relaxed in tests
- Only 1 warning remaining in production code

**New npm Scripts:**
- `npm run quality` — Run all quality checks at once
- `npm run security:fix` — Auto-fix vulnerabilities
- `npm run metrics` — Collect and validate metrics

### Upgrade

```bash
npx rapidkit@latest --version  # Should show 0.12.6

# Run quality checks
npm run quality

# Check metrics
npm run metrics
```

### Developer Experience

The new quality infrastructure provides:
- ✅ 431 tests passing (100% success rate)
- ✅ 0 TypeScript errors
- ✅ Only 1 ESLint warning (in production code)
- ✅ Comprehensive pre-commit validation
- ✅ Automated security monitoring
- ✅ Metrics tracking and reporting

## Previous Releases

| Version | Date | Highlights |
|---------|------|------------|
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

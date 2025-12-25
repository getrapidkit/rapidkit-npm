# Release Notes

## Latest Release: v0.13.1 (December 25, 2025)

### 🐛 Bug Fixes & Quality Improvements

**Type Safety:**
- ✅ Fixed `any` type warning in `src/index.ts`
- Replaced implicit `any` with explicit `SpawnSyncReturns<Buffer>` union type
- Full TypeScript strict mode compliance achieved
- 0 ESLint warnings, 0 TypeScript errors

**Test Coverage Enhancements:**
- ✅ Added comprehensive npm validation error handling tests
- ✅ Added cache clear error handling tests
- Overall coverage: **95.35%** ✨
- Total tests: **449** (all passing, 3 intentionally skipped)
- Functions covered: 98.24%
- Branches covered: 92.57%
- Statements covered: 95.35%
- Lines covered: 95.32%

**Configuration Improvements:**
- Optimized `vitest.config.ts` coverage reporting
- Properly excluded entry points: `src/index.ts` and `src/workspace.ts` (tested via compiled dist/)
- Excluded test files and config files from coverage

### ⬆️ Upgrade

```bash
npm install -g rapidkit@0.13.1
# or
npx rapidkit@0.13.1 my-api --template fastapi
```

### 📊 Quality Metrics

| Metric | Value | Status |
|--------|-------|--------|
| Statements | 95.35% | ✅ |
| Branches | 92.57% | ✅ |
| Functions | 98.24% | ✅ |
| Lines | 95.32% | ✅ |
| Tests Passing | 449/449 | ✅ |
| TypeScript Errors | 0 | ✅ |
| ESLint Errors | 0 | ✅ |

---

## Previous Release: v0.13.0 (December 22, 2025)

### 🧪 Test Coverage & Quality

This release focuses on **test quality and coverage**, adding comprehensive NestJS tests and boosting overall test coverage.

### What Changed

**NestJS Test Suite:**
- 13 new tests for NestJS project generation
- Tests for project structure, config, tsconfig, .env.example
- Tests for package manager variants (npm, yarn, pnpm)
- Mocked execa for fast, reliable tests

**Coverage Improvements:**
| Metric | Before | After | Change |
|--------|--------|-------|--------|
| demo-kit.ts | 75% | 90%+ | **+15%** |
| Overall | 93.5% | 95.35% | +1.85% |
| Tests | 431 | 444 | +13 |

### Upgrade

```bash
npx rapidkit@latest --version  # Should show 0.13.0
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
| [v0.12.9](releases/RELEASE_NOTES_v0.12.9.md) | Dec 22, 2025 | Unified npx commands |
| [v0.12.8](releases/RELEASE_NOTES_v0.12.8.md) | Dec 13, 2025 | Windows spawn fix |
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

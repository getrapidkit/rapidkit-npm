# Release Notes

## Latest Release: v0.21.2 (February 20, 2026)

### 🔒 v0.21.2 — Trust & Publishability Hardening (Patch)

This patch focuses on release reliability and contributor consistency with a modernized release flow, npm-only policy enforcement, and security/doc alignment.

**What's New:**

- 🔁 **Modern release flow (no hardcoded versioning)**
  - Dynamic release script with semantic bump support (`patch|minor|major|x.y.z`)
  - Safer release controls: `--no-publish`, `--yes`, `--allow-dirty`
  - Dynamic tag/release handling based on `package.json` version

- 📦 **One-command release shortcuts**
  - `npm run release:dry`
  - `npm run release:patch`
  - `npm run release:minor`
  - `npm run release:major`

- 📏 **Official npm-only policy**
  - Enforced in install path via preinstall guard
  - Dedicated policy doc: `docs/PACKAGE_MANAGER_POLICY.md`
  - Contributor + setup docs aligned to npm-first workflow

- 🛡️ **Security policy alignment**
  - `docs/SECURITY.md` now reflects active support on latest `0.x` minor line

- 🩺 **Doctor workspace scan hardening**
  - Workspace scanning now ignores common build artifact directories (`dist*`, `build*`)
  - Prevents false-positive project discovery from packaged output folders

**Upgrade:**

```bash
npm install -g rapidkit@0.21.2
```

[📖 Full Release Notes](./releases/RELEASE_NOTES_v0.21.2.md)

---

## Latest Release: v0.21.1 (February 18, 2026)

### 🚀 v0.21.1 — Context-Aware Init, Workspace Command Mode, and Doctor Scan Fix (Patch)

This patch release improves day-1 CLI onboarding and workspace reliability with a context-aware `init` flow, explicit `create workspace` command mode, and a doctor scan correctness fix.

**What's New:**

- ✨ **New workspace command mode**
  - `npx rapidkit create workspace`
  - `npx rapidkit create workspace <name>`
  - Legacy `npx rapidkit <name>` continues to work.

- 🧠 **Context-aware `npx rapidkit init`**
  - Plain folder: auto-creates default workspace (`my-workspace`, `my-workspace-2`, ...)
  - Workspace root: installs workspace dependencies and initializes detected child projects
  - Project inside workspace: initializes only that project

- 🩺 **Doctor workspace scan fix**
  - Workspace root `.rapidkit` is no longer counted as a project unless real project markers exist.
  - Added regression coverage for this case.

- 📚 **Documentation updates**
  - New “Fastest Start” guidance based on `npx rapidkit init`
  - Clarified prompt behavior for `create workspace`

**Upgrade:**

```bash
npm install -g rapidkit@0.21.1
```

[📖 Full Release Notes](./releases/RELEASE_NOTES_v0.21.1.md)

---

## Latest Release: v0.21.0 (February 16, 2026)

### ⚡ v0.21.0 — Performance Optimizations & Documentation Reorganization (Minor)

This minor release focuses on **significant performance improvements** through dynamic imports and bundle optimization, plus comprehensive **documentation reorganization** to separate public and internal docs.

**What's New:**

- ⚡ **Phase 1 Performance Optimizations** - 50-60% faster startup
  - 🚀 Dynamic imports for OpenAI (~30-40KB) and Inquirer (~25-30KB)
  - 📦 Bundle size: **27.8 KB** compressed (well under 200KB limit)
  - 🎯 Code splitting enabled (7 chunks)
  - 🌲 Aggressive tree shaking
  - 📊 Performance monitoring tools (bench, size-check, analyze)
  - ⚡ Common commands now 50-60% faster:
    - `rapidkit --help`: 323ms
    - `rapidkit --version`: 390ms
    - `rapidkit workspace list --help`: 331ms

- 📚 **Documentation Organization**
  - ✅ Separated public docs from internal development docs
  - 📁 Moved 9 internal docs to `/Front/Docs/npm/develop/`
  - 📖 Updated docs index with proper categorization
  - 🎯 Clear distinction for open source community

- 🛠️ **New Developer Tools**
  - `npm run bench` - Performance benchmarking
  - `npm run size-check` - Bundle size validation (200KB limit)
  - `npm run analyze` - Visual bundle analyzer
  - `npm run quality` - Comprehensive quality check

**Technical Details:**

- Bundle optimized from ~40KB to 27.8 KB compressed
- Heavy dependencies load only when needed (pay-as-you-go model)
- 7 chunks for better caching and faster loads
- Automated size monitoring prevents regressions

**Upgrade:**

```bash
npm install -g rapidkit@0.21.0
```

[📖 Full Release Notes](./releases/RELEASE_NOTES_v0.21.0.md)

---


## Previous Releases

| Version                                      | Date         | Highlights                                                           |
| -------------------------------------------- | ------------ | -------------------------------------------------------------------- |
| [v0.21.2](releases/RELEASE_NOTES_v0.21.2.md) | Feb 20, 2026 | Release flow modernization, npm-only policy, security/doc alignment |
| [v0.21.1](releases/RELEASE_NOTES_v0.21.1.md) | Feb 18, 2026 | Context-aware init, create workspace mode, doctor workspace scan fix |
| [v0.20.0](releases/RELEASE_NOTES_v0.20.0.md) | Feb 14, 2026 | FastAPI DDD Kit, Domain-Driven Design template, offline support      |
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

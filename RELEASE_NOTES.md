# Release Notes

## Latest Release: v0.15.0 (January 30, 2026)

### ✨ v0.15.0 — Core Integration & Workspace UX (Stabilization)

This release focuses on bridging the npm wrapper and the upcoming Python Core, and improves the Create Project UX when run outside of an existing workspace.

**What's New:**

- 🔧 **CLI: wrapper-level workspace flags** — `--create-workspace` and `--no-workspace` are now handled by the npm wrapper so they are not forwarded to the Python engine. Creating a project outside a workspace now prompts the user (interactive) and respects `--yes`/`--no` behaviors. (`--create-workspace` creates and registers a workspace in the current directory.)
- 🧩 **Workspace registration helper** — added `registerWorkspaceAtPath()` which creates a `.rapidkit-workspace` marker, `.gitignore`, launcher (`rapidkit`/`rapidkit.cmd`), `README.md`, and installs the Python engine into the workspace (supports Poetry/venv/pipx).
- 🐍 **Poetry in-project venv parity** — `installWithPoetry()` configures `poetry config virtualenvs.in-project true` so `poetry` creates `.venv` inside the workspace by default to match VS Code extension behavior.
- 🛠️ **Scenario C fix (bridge detection)** — improved Python engine detection heuristics so the bridge does not bootstrap a venv when the system Python already has `rapidkit-core` installed (prevents unnecessary bootstrap and preserves existing environment).
- ✅ **Tests & CI** — added focused unit and e2e tests (register workspace, create-workspace smoke test, Scenario C regression) and a GitHub Actions workflow `.github/workflows/e2e-smoke.yml` to run the smoke/regression tests on PRs.
- 🧾 **Docs** — updated README and documentation to document the new flags and the create-project outside-workspace UX.

### ⬆️ Upgrade

```bash
npm install -g rapidkit@0.15.0
# or
npx rapidkit@0.15.0 create project fastapi.standard my-api --output .
```

---

## Previous Release: v0.14.2 (January 23, 2026)

### 📚 Documentation & Cleanup Release

This was a documentation-focused release preparing the npm package for seamless integration with RapidKit Python Core.

**What was included:**

(see older notes in this file)

### Documentation Updates

- 📚 **Enhanced README** - Clearer "Preview Version" messaging
- 📚 **Coming Soon notice** - AI features marked for post-Core release
- 📚 **Requirements specification** - Added specific version requirements (Node 20.19.6+, Python 3.10.14+, Poetry 2.2.1+)
- 📚 **ACTION_PLAN_v0.15.0** - Detailed roadmap for Core integration
- 📚 **POLISH_CHECKLIST** - Task tracking for ongoing improvements
- 📚 **CHANGELOG preview** - Added v0.15.0 stabilization plan

### Code Quality

- 🧹 **Dependencies cleanup** - Removed 36 unused packages via `npm prune`
- 🧹 **Smaller install size** - Cleaner node_modules
- 🧹 **Faster installation** - Fewer dependencies to download

### Transparency

- 📖 **Public planning docs** - All roadmaps and plans now open-source
- 📖 **Community-friendly** - Added disclaimers welcoming feedback and contributions

### ⬆️ Upgrade

```bash
npm install -g rapidkit@0.14.2
# or
npx rapidkit@0.14.2 my-api --template fastapi
```

### 📊 Quality Metrics

- ✅ All **449 tests passing** (100%)
- ✅ Build successful
- ✅ Bundle size: 36KB (optimized)
- ✅ No breaking changes

### 🔮 What's Next?

This release sets the foundation for v0.15.0, which will focus on:

- Core Integration Bridge development
- Enhanced error messages
- Performance optimizations
- Better developer experience

Stay tuned for Core release announcement!

---

## Previous Release: v0.14.1 (December 31, 2025)

### 🐛 Bug Fix: Poetry Virtualenv Detection

**Problem:**

- RapidKit only looked for `.venv` in the project directory
- Poetry by default creates virtualenvs in cache (`~/.cache/pypoetry/virtualenvs/`)
- This caused "no .venv found" errors even when dependencies were installed
- Users had to manually run `poetry config virtualenvs.in-project true`

**Solution:**

- ✅ Added automatic Poetry virtualenv detection via `poetry env info --path`
- ✅ Works seamlessly with Poetry's default configuration
- ✅ Falls back to `.venv` if present in project directory
- ✅ Visual feedback showing which virtualenv is being used

**Changes:**

- Updated `.rapidkit/cli.py.j2`:
  - New `_get_poetry_venv()` helper function
  - Auto-detects Poetry virtualenv before checking `.venv`
  - Better error messages
- Updated `.rapidkit/rapidkit.j2`:
  - Shell script now queries Poetry for virtualenv path
  - Sets correct paths for Poetry cache virtualenvs

**Testing:**

```bash
# Now works without any configuration!
rapidkit my-api --template fastapi
cd my-api
rapidkit init    # ✅ Installs to Poetry cache
rapidkit dev     # ✅ Detects and uses Poetry virtualenv
```

### ⬆️ Upgrade

```bash
npm install -g rapidkit@0.14.1
# or
npx rapidkit@0.14.1 my-api --template fastapi
```

### ✅ Quality Assurance

- ✅ All **449 tests passing**
- ✅ Build successful
- ✅ Tested with Poetry cache virtualenv
- ✅ Tested with `.venv` in project

---

## Previous Release: v0.14.0 (December 31, 2025)

### ⬆️ Major Dependency Updates

**Node.js & Runtime:**

- ✅ Updated Node.js requirement to **>=20.19.6** (LTS Iron)
- Better performance, security, and modern JavaScript features
- Aligns with current LTS recommendations

**Python Stack (FastAPI Projects):**

- ✅ Python: **^3.10.14** (broader compatibility)
- ✅ FastAPI: **0.128.0** (latest stable)
- ✅ Uvicorn: **0.40.0** (latest server)
- ✅ Pydantic: **2.12.5** (latest validation)
- ✅ pydantic-settings: **2.12.0**

**Python Dev Tools:**

- ✅ pytest: **9.0.2**
- ✅ black: **25.12.0**
- ✅ ruff: **0.14.10**
- ✅ mypy: **1.19.1**
- ✅ isort: **7.0.0**
- ✅ httpx: **0.28.1**

**NestJS Stack:**

- ✅ @nestjs/\*: **11.1.10** (all core packages)
- ✅ Jest: **30.2.0**
- ✅ TypeScript: **5.9.3**
- ✅ All dev dependencies updated to latest stable

### 🐛 Bug Fixes

- Fixed httpx version inconsistency across templates
- All templates now use synchronized dependency versions

### ⬆️ Upgrade

```bash
npm install -g rapidkit@0.14.0
# or
npx rapidkit@0.14.0 my-api --template fastapi
```

### ✅ Quality Assurance

- ✅ All **449 tests passing**
- ✅ Build successful
- ✅ TypeScript type check passed
- ✅ ESLint passed with no warnings
- ✅ Code coverage: **95.35%**

---

## Previous Releases

| Version                                      | Date         | Highlights                        |
| -------------------------------------------- | ------------ | --------------------------------- |
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

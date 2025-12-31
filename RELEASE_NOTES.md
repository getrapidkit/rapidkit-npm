# Release Notes

## Latest Release: v0.14.0 (December 31, 2025)

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
- ✅ @nestjs/*: **11.1.10** (all core packages)
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

| Version | Date | Highlights |
|---------|------|------------|
| [v0.14.0](releases/RELEASE_NOTES_v0.14.0.md) | Dec 31, 2025 | Major dependency updates |
| [v0.13.1](releases/RELEASE_NOTES_v0.13.1.md) | Dec 25, 2025 | Type safety & test coverage |
| [v0.13.0](releases/RELEASE_NOTES_v0.13.0.md) | Dec 22, 2025 | NestJS test coverage boost |
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

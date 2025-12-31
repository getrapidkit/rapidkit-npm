# Release Notes v0.14.0

**Release Date:** December 31, 2025

## 🎯 Highlights

Major dependency updates across the entire stack! This release brings all FastAPI and NestJS project templates up to the latest stable versions, ensuring better performance, security, and compatibility.

## ⬆️ Dependency Updates

### Node.js Runtime
- **Node.js:** Updated to **>=20.19.6** (LTS Iron)
  - Better performance and security
  - Modern JavaScript features
  - Aligned with current LTS recommendations

### Python Stack (FastAPI Projects)

**Core Dependencies:**
- **Python:** `^3.10.14` (broader compatibility)
- **FastAPI:** `0.115.0` → `0.128.0`
- **Uvicorn:** `0.32.0` → `0.40.0`
- **Pydantic:** `2.0` → `2.12.5`
- **pydantic-settings:** `2.0` → `2.12.0`

**Development Tools:**
- **pytest:** `8.0` → `9.0.2`
- **pytest-asyncio:** `0.24.0` → `1.3.0`
- **pytest-cov:** `6.0` → `7.0.0`
- **black:** `24.0` → `25.12.0`
- **ruff:** `0.8` → `0.14.10`
- **mypy:** `1.0` → `1.19.1`
- **isort:** `5.13.2` → `7.0.0`
- **httpx:** `0.27` → `0.28.1`
- **build:** `1.3.0` (added)

### NestJS Stack

**Core Framework:**
- **@nestjs/common:** `11.1.6` → `11.1.10`
- **@nestjs/core:** `11.1.6` → `11.1.10`
- **@nestjs/platform-express:** `11.1.6` → `11.1.10`
- **@nestjs/swagger:** `11.2.3` (maintained)

**Dependencies:**
- **class-validator:** `0.14.0` → `0.14.3`
- **reflect-metadata:** `0.2.1` → `0.2.2`
- **rxjs:** `7.8.1` → `7.8.2`
- **helmet:** `7.0.0` → `8.1.0`
- **compression:** `1.7.4` → `1.8.1`
- **winston:** `3.11.0` → `3.19.0`
- **joi:** `17.12.1` → `18.0.2`
- **dotenv:** `16.3.1` → `17.2.3`

**Development Tools:**
- **Jest:** `29.7.0` → `30.2.0`
- **TypeScript:** `5.9.3` (maintained)
- **@types/node:** `22.8.5` → `18.19.130` (aligned with Node 20)
- **@types/jest:** `29.5.12` → `30.0.0`
- **@typescript-eslint/*:** `8.46.1` → `8.50.1`
- **ESLint:** `8.57.1` → `9.39.2`
- **Prettier:** `3.6.2` → `3.7.4`
- **ts-jest:** `29.4.5` → `29.4.6`

## 🐛 Bug Fixes

### Consistency Improvements
- Fixed httpx version mismatch between `src/create.ts` and template files
- All templates now use synchronized dependency versions
- Ensured consistency across FastAPI and NestJS templates

## 📊 Quality Metrics

| Metric | Value | Status |
|--------|-------|--------|
| Test Suite | 449/452 tests passing | ✅ |
| Build | Successful | ✅ |
| TypeScript | 0 errors | ✅ |
| ESLint | 0 warnings | ✅ |
| Code Coverage | 95.35% | ✅ |
| Bundle Size | 35.05 KB | ✅ |

## 🚀 Getting Started

### Install or Upgrade

```bash
# Global installation
npm install -g rapidkit@0.14.0

# Use with npx (no installation)
npx rapidkit@0.14.0 my-api --template fastapi

# Verify version
rapidkit --version
```

### Create Your First Project

```bash
# FastAPI project
npx rapidkit my-api --template fastapi

# NestJS project
npx rapidkit my-api --template nestjs

# Interactive mode
npx rapidkit
```

## 📝 Migration Notes

### For Existing Projects

These updates affect **new projects only**. Existing projects are not impacted. However, you can update your project dependencies manually:

**FastAPI projects:**
```bash
poetry update
# or
pip install --upgrade -r requirements.txt
```

**NestJS projects:**
```bash
npm update
# or
yarn upgrade
```

### Breaking Changes

- **Node.js:** Minimum version increased to **20.19.6**
  - Projects created with this version require Node 20.19.6 or higher
  - Use `nvm install 20.19.6` if needed

### Compatibility

- ✅ Windows, macOS, Linux
- ✅ npm, yarn, pnpm (for NestJS)
- ✅ Poetry, pip+venv, pipx (for FastAPI)
- ✅ Python 3.10, 3.11, 3.12
- ✅ Node.js 20.19.6+

## 🔗 Resources

- **GitHub:** https://github.com/getrapidkit/rapidkit-npm
- **Documentation:** https://docs.rapidkit.dev
- **NPM Package:** https://www.npmjs.com/package/rapidkit

## 🙏 Contributors

Thanks to everyone who contributed to this release!

---

**Full Changelog:** https://github.com/getrapidkit/rapidkit-npm/compare/v0.13.1...v0.14.0

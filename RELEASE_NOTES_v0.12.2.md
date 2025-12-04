# Release Notes - RapidKit npm v0.12.2

**Release Date:** December 4, 2025

## 🎯 Simplified Workflow: No More Manual Activation!

This release streamlines the developer experience by **removing the need for `source .rapidkit/activate`**. The `rapidkit init` command now handles environment activation automatically!

---

## ✨ What's New

### ⚡ Auto-Activation in `rapidkit init`

**Before (v0.12.1):**
```bash
npx rapidkit my-api --template fastapi
cd my-api
source .rapidkit/activate   # ❌ Extra step required
rapidkit init
rapidkit dev
```

**After (v0.12.2):**
```bash
npx rapidkit my-api --template fastapi
cd my-api
rapidkit init               # ✅ Auto-activates environment!
rapidkit dev
```

### 🔧 How It Works

The `rapidkit init` command now:
1. Sources `.rapidkit/activate` internally (if it exists)
2. Sets up PATH correctly for Poetry/npm
3. Runs the package manager to install dependencies

This works for both **FastAPI** (poetry install) and **NestJS** (npm install) projects.

---

## 📝 Updated Documentation

All documentation has been updated to reflect the simplified workflow:

- ✅ **README.md** - Quick start guides simplified
- ✅ **docs/README.md** - Project CLI section updated
- ✅ **docs/SETUP.md** - Testing instructions simplified
- ✅ **docs/DEVELOPMENT.md** - Manual testing guide updated
- ✅ **Success messages** - Now show 2-step workflow instead of 3

---

## 🚀 Quick Start

### FastAPI Project

```bash
npx rapidkit my-api --template fastapi
cd my-api
rapidkit init      # Install dependencies (poetry install)
rapidkit dev       # Start dev server at http://localhost:8000
```

### NestJS Project

```bash
npx rapidkit my-app --template nestjs
cd my-app
rapidkit init      # Install dependencies (npm install)
rapidkit dev       # Start dev server at http://localhost:8000
```

---

## 🔄 Migration

No migration needed! This is a backwards-compatible improvement.

If you prefer, you can still use `source .rapidkit/activate` manually - the activate script is still included in projects. But now it's **optional**.

---

## 📦 Available Commands

After `rapidkit init`, all commands work directly:

| Command | FastAPI | NestJS |
|---------|---------|--------|
| `rapidkit init` | poetry install | npm install |
| `rapidkit dev` | uvicorn with hot reload | nest start --watch |
| `rapidkit start` | production server | nest start |
| `rapidkit test` | pytest | jest |
| `rapidkit lint` | ruff | eslint |
| `rapidkit format` | black + isort | prettier |

---

## 🐛 Bug Fix

- **Fixed**: Poetry/npm not found errors when running `rapidkit init` in some environments
  - Root cause: PATH not set up before running package manager
  - Solution: Auto-source activate script before running install command

---

## 📚 Resources

- **Documentation:** https://getrapidkit.com/docs
- **npm Package:** https://www.npmjs.com/package/rapidkit
- **VS Code Extension:** [RapidKit for VS Code](https://marketplace.visualstudio.com/items?itemName=rapidkit.rapidkit-vscode)
- **GitHub:** https://github.com/getrapidkit/rapidkit-npm

---

## 💬 Feedback

We'd love to hear your thoughts!

- 🐛 Report issues: [GitHub Issues](https://github.com/getrapidkit/rapidkit-npm/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/getrapidkit/rapidkit-npm/discussions)

---

**Made with 🚀 by [RapidKit](https://getrapidkit.com)**

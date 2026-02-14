# Release Notes - v0.20.0

**Release Date:** February 14, 2026  
**Type:** Minor Release  
**Semver:** 0.20.0

---

## 📦 FastAPI DDD Kit & Complete Offline Support

This minor release introduces the **FastAPI DDD (Domain-Driven Design)** kit template and completes the offline experience by bundling all three production kits in the npm package.

---

## ✨ What's New

### 📦 FastAPI DDD Kit

Added a complete Domain-Driven Design template for FastAPI projects:

- **🏗️ Clean Architecture Layers**
  - Domain Layer: Entities, Value Objects, Domain Events
  - Application Layer: Use Cases, DTOs, Services
  - Infrastructure Layer: Repositories, External Services
  
- **🎯 Production-Ready Templates**
  - 39 carefully crafted template files
  - Complete DDD structure and patterns
  - Best practices for complex business logic
  - Synced from Python Core's `fastapi.ddd` kit

- **✨ Enterprise Features**
  - Proper separation of concerns
  - Dependency injection patterns
  - Repository pattern implementation
  - Domain event handling
  - Use case orchestration

### 🎁 Complete Offline Fallback

All three production kits now bundled in npm package (~512KB total):

| Kit | Size | Description |
|-----|------|-------------|
| `fastapi-standard` | 80KB | Standard FastAPI template |
| `fastapi-ddd` | 236KB | DDD architecture template |
| `nestjs-standard` | 176KB | Standard NestJS template |

**Benefits:**
- ✅ Works without Python Core installed
- ✅ No internet connection required
- ✅ Instant project generation
- ✅ Consistent experience across environments

### 🔧 Infrastructure Improvements

- **Enhanced Sync Script**: Updated `sync-kits.sh` to handle all 3 kits automatically
- **Better Kit Mapping**: Improved kit name resolution in `demo-kit.ts`
- **Seamless Integration**: Better Python Core integration with graceful fallback
- **Updated CLI**: Enhanced FastAPI standard CLI with improved commands

---

## 🔄 Changed

- Updated `scripts/sync-kits.sh` to include all 3 kits in sync process
- Enhanced `src/demo-kit.ts` with proper kit name mapping (fastapi.ddd → fastapi-ddd)
- Improved kit generation logic in `src/index.ts` and `src/workspace.ts`
- Updated FastAPI standard CLI template with additional commands

---

## 📊 Technical Details

### Bundle Size Analysis
```
Total npm package size: ~512KB (including all 3 kits)
- fastapi-standard: 80KB (compressed)
- fastapi-ddd: 236KB (compressed)
- nestjs-standard: 176KB (compressed)
```

### Files Changed
```
scripts/sync-kits.sh                          | 20 +++++++--
src/demo-kit.ts                               | 15 ++++++-
src/index.ts                                  | 37 +++++++++-------
src/workspace.ts                              |  2 +-
templates/kits/fastapi-standard/src/cli.py.j2 | 60 ++++++++++++++++++++++++-
templates/kits/fastapi-ddd/                   | 39 files (new)
```

---

## 🚀 Usage

### Create a DDD Project

```bash
# Using Python Core (dynamic)
rapidkit create my-ddd-api --kit fastapi.ddd

# Or using npm fallback (offline)
npx rapidkit create my-ddd-api --framework fastapi
# Then select "fastapi.ddd" from available kits
```

### Kit Structure (DDD)

```
my-ddd-api/
├── src/
│   ├── domain/          # Domain layer (entities, value objects)
│   ├── application/     # Application layer (use cases, DTOs)
│   ├── infrastructure/  # Infrastructure layer (repositories, adapters)
│   └── cli.py          # CLI commands
├── tests/
├── pyproject.toml
└── README.md
```

---

## ⬆️ Upgrade

### Global Installation
```bash
npm install -g rapidkit@0.20.0
```

### Verify
```bash
rapidkit --version
# Output: 0.20.0
```

---

## 🐛 Breaking Changes

**None.** Fully backward compatible with v0.19.x.

---

## 📝 Notes

### Why DDD Kit?

Domain-Driven Design is perfect for:
- Complex business logic
- Large enterprise applications
- Long-term maintainable codebases
- Teams following DDD practices

### Why Bundle All Kits?

1. **Offline First**: Works without internet or Python Core
2. **Faster**: No download time, instant generation
3. **Reliable**: No external dependencies
4. **Consistent**: Same experience everywhere

### Future Plans

- Additional kits (microservices, monorepo patterns)
- More framework support (Django, Express, etc.)
- Custom kit templates from community

---

## 🙏 Contributors

Thanks to everyone who contributed to this release!

---

## 📚 Documentation

- [Full Documentation](https://docs.getrapidkit.com)
- [Kit Comparison](https://docs.getrapidkit.com/kits)
- [DDD Guide](https://docs.getrapidkit.com/guides/ddd)

---

## 🔗 Links

- [GitHub Repository](https://github.com/getrapidkit/rapidkit-npm)
- [npm Package](https://www.npmjs.com/package/rapidkit)
- [Report Issues](https://github.com/getrapidkit/rapidkit-npm/issues)

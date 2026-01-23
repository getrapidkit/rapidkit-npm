# Release Notes - v0.14.2

**Release Date:** January 23, 2026  
**Type:** Documentation & Cleanup  
**Breaking Changes:** None

---

## 📚 Documentation & Cleanup Release

This is a documentation-focused release preparing the npm package for seamless integration with RapidKit Python Core.

## What's New

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

## Upgrade

```bash
# Global installation
npm install -g rapidkit@0.14.2

# Or use with npx
npx rapidkit@0.14.2 my-api --template fastapi
```

## Quality Metrics

- ✅ All **449 tests passing** (100%)
- ✅ Build successful
- ✅ Bundle size: 36KB (optimized)
- ✅ No breaking changes
- ✅ No security vulnerabilities

## What's Next?

This release sets the foundation for v0.15.0, which will focus on:

- Core Integration Bridge development
- Enhanced error messages
- Performance optimizations
- Better developer experience

**Stay tuned for Core release announcement!**

## Links

- 📦 [npm Package](https://www.npmjs.com/package/rapidkit)
- 🐙 [GitHub Repository](https://github.com/getrapidkit/rapidkit-npm)
- 📚 [Full Changelog](../CHANGELOG.md)
- 📋 [Action Plan](../docs/ACTION_PLAN_v0.15.0.md)
- ✅ [Polish Checklist](../docs/POLISH_CHECKLIST.md)

---

**Full Changelog**: [v0.14.1...v0.14.2](https://github.com/getrapidkit/rapidkit-npm/compare/v0.14.1...v0.14.2)

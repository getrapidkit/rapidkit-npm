# Action Plan: RapidKit npm v0.15.0

> **Note:** This is an internal planning document made public for transparency.
> Community feedback and contributions are welcome!

**Release Goal:** Stabilization & Core Integration Preparation  
**Target Date:** Before Core v1.0.0 Release  
**Current Version:** 0.14.1  
**Status:** ✅ Planning Complete

---

## 🎯 Mission Statement

Prepare `rapidkit-npm` for seamless integration with RapidKit Python Core by:

1. Polishing existing features and documentation
2. Building Core integration bridge
3. Maintaining 100% test coverage and code quality
4. Ensuring excellent developer experience

**NO new user-facing features** - Focus on foundation and quality.

---

## 📋 Task List

### Phase 1: Documentation Polish (Week 1)

#### High Priority

- [x] Update ROADMAP.md with current status and v0.15.0 plan
- [x] Enhance README.md with clear preview messaging
- [x] Add CHANGELOG entry for v0.15.0
- [ ] Create MIGRATION_GUIDE.md for Core transition
- [ ] Add INTEGRATION.md explaining Core bridge architecture
- [ ] Review and update all inline code comments
- [ ] Add JSDoc comments to public APIs

#### Medium Priority

- [ ] Update SECURITY.md with current practices
- [ ] Review and update CONTRIBUTING.md
- [ ] Create troubleshooting guide
- [ ] Add FAQ section to README

#### Low Priority

- [ ] Generate API documentation with TypeDoc
- [ ] Create architecture diagrams
- [ ] Add more code examples

**Checklist:**

```bash
# Verify documentation
npm run format:check        # All docs properly formatted
npm run lint               # No warnings in code
git grep -i "TODO\|FIXME"  # No pending TODOs
```

---

### Phase 2: Code Quality & Optimization (Week 2)

#### Bundle Optimization

- [ ] Analyze bundle composition
  ```bash
  npm run build
  npx webpack-bundle-analyzer dist/
  ```
- [ ] Remove unused dependencies
  ```bash
  npx depcheck
  npm uninstall <unused-packages>
  ```
- [ ] Tree-shake unused code
- [ ] Lazy-load heavy modules
- [ ] **Target:** Reduce from 72KB → <60KB

#### Code Cleanup

- [ ] Remove commented-out code
- [ ] Consistent error handling patterns
- [ ] Standardize logging format
- [ ] Extract magic strings to constants
- [ ] Review and simplify complex functions

#### ESLint & TypeScript

- [ ] Fix any ESLint warnings
  ```bash
  npm run lint:fix
  ```
- [ ] Enable stricter TypeScript rules
- [ ] Add missing type definitions
- [ ] Remove `any` types where possible

**Checklist:**

```bash
npm run validate           # All checks pass
npm run bundle-size        # <60KB confirmed
npm run typecheck          # No TS errors
```

---

### Phase 3: Testing & Validation (Week 3)

#### Test Coverage

- [x] Maintain 449 tests, 100% passing
- [ ] Add integration tests for edge cases
- [ ] Test Windows compatibility specifically
- [ ] Test with different Node versions (20.x, 21.x, 22.x)
- [ ] Test with different Python versions (3.10, 3.11, 3.12)

#### Performance Benchmarks

- [ ] Measure project creation time
  ```bash
  time npx rapidkit create project fastapi.standard test-api --output .
  ```
- [ ] Memory profiling
  ```bash
  node --inspect dist/index.js
  ```
- [ ] Startup time optimization
- [ ] Document performance baselines

#### Cross-Platform Testing

- [ ] Linux (Ubuntu 22.04, Fedora 39)
- [ ] macOS (Intel, Apple Silicon)
- [ ] Windows (10, 11)
- [ ] WSL2 validation

**Checklist:**

```bash
npm run test              # 100% passing
npm run test:coverage     # Coverage maintained
npm run test:e2e          # All platforms
```

---

### Phase 4: Core Integration Bridge (Week 4-5)

#### Design & Architecture

- [ ] Create `src/core-bridge/` directory structure
- [ ] Design API for Python Core communication
  ```typescript
  interface CoreBridge {
    detectPythonEnvironment(): Promise<PythonEnv>;
    installCore(version: string): Promise<void>;
    runCoreCommand(cmd: string[], cwd: string): Promise<CommandResult>;
    checkCompatibility(): Promise<CompatibilityReport>;
  }
  ```
- [ ] Define version compatibility matrix
- [ ] Design fallback mechanisms

#### Implementation

- [ ] Python environment detection
  ```typescript
  // src/core-bridge/python-detector.ts
  -detectPython() - detectPoetry() - detectVenv() - getPoetryVenvPath();
  ```
- [ ] Core CLI wrapper
  ```typescript
  // src/core-bridge/core-cli.ts
  -executeCommand() - parseOutput() - handleErrors();
  ```
- [ ] Version compatibility checker
  ```typescript
  // src/core-bridge/compatibility.ts
  -checkCoreVersion() - checkPythonVersion() - suggestUpgrade();
  ```
- [ ] Mock Core CLI for testing
  ```typescript
  // src/__tests__/mocks/core-cli-mock.ts
  ```

#### Testing

- [ ] Unit tests for each bridge component
- [ ] Integration tests with mock Core
- [ ] Error handling tests
- [ ] Fallback mechanism tests

**Checklist:**

```bash
npm run test -- core-bridge  # All bridge tests pass
npm run build                # No compile errors
```

---

### Phase 5: VS Code Extension Sync (Week 6)

#### Shared Interfaces

- [ ] Create shared types package
  ```typescript
  // packages/shared-types/
  -ProjectConfig - CommandOptions - SystemRequirements;
  ```
- [ ] Ensure CLI output matches extension expectations
- [ ] Consistent error codes
- [ ] Shared configuration format

#### Testing Integration

- [ ] Test extension with latest npm package
- [ ] Verify system check works end-to-end
- [ ] Test command delegation
- [ ] Validate UI feedback

**Checklist:**

```bash
# In VS Code extension project
npm link ../rapidkit-npm
npm test                     # Extension tests pass
```

---

### Phase 6: AI Feature Documentation (Week 7)

#### Even though NOT merging yet

- [ ] Document AI architecture in `docs/AI_ARCHITECTURE.md`
- [ ] Add "Coming Soon" banner to AI docs
- [ ] Explain why waiting for Core
- [ ] Show mockups/previews
- [ ] Link from README to AI docs

**Note:** AI feature stays in `feature/ai-recommender` branch until Core release.

---

## 🚀 Release Checklist

### Pre-Release

- [ ] All tests passing (449/449)
- [ ] Bundle size <60KB
- [ ] No ESLint warnings
- [ ] No TypeScript errors
- [ ] Documentation reviewed
- [ ] CHANGELOG updated
- [ ] Version bumped in package.json

### Release Process

```bash
# 1. Final validation
npm run quality              # All checks

# 2. Build
npm run build

# 3. Version bump
npm version 0.15.0

# 4. Commit
git commit -m "chore(release): v0.15.0 - Stabilization & Core prep"

# 5. Tag
git tag -a v0.15.0 -m "Release v0.15.0: Stabilization & Core Integration Prep"

# 6. Push
git push origin main --tags

# 7. Publish to npm
npm publish

# 8. Create GitHub Release
gh release create v0.15.0 \
  --title "v0.15.0 - Stabilization Release" \
  --notes-file RELEASE_NOTES.md
```

### Post-Release

- [ ] Update VS Code extension to use v0.15.0
- [ ] Announce in Discord/Slack
- [ ] Tweet/social media announcement
- [ ] Update website documentation
- [ ] Monitor npm downloads and issues

---

## 📊 Success Metrics

| Metric            | Current    | Target | Status         |
| ----------------- | ---------- | ------ | -------------- |
| Bundle Size       | 72KB       | <60KB  | 🔄 In Progress |
| Test Coverage     | 100% (449) | 100%   | ✅ Maintained  |
| Build Time        | ~5s        | <3s    | 🔄 TBD         |
| Startup Time      | ~200ms     | <150ms | 🔄 TBD         |
| Dependencies      | 10         | <8     | 🔄 TBD         |
| TypeScript Errors | 0          | 0      | ✅ Done        |
| ESLint Warnings   | 0          | 0      | ✅ Done        |

---

## 🎯 Next Steps (After Core Release → v0.16.0)

1. **Merge AI Feature**
   - `git merge feature/ai-recommender`
   - Test with real Core modules
   - Update documentation

2. **Full Core Integration**
   - Activate Core bridge
   - Remove hardcoded templates
   - Dynamic module fetching

3. **Advanced Features**
   - Module marketplace
   - Custom templates
   - Plugin system

---

## 📝 Notes

- **No rush** - Quality over speed
- **Test everything** - Cross-platform compatibility critical
- **Document clearly** - Make transition smooth
- **Stay focused** - No feature creep
- **Prepare well** - Core integration will be smooth

---

**Status:** Ready to begin Phase 1  
**Last Updated:** 2026-01-23  
**Maintainer:** RapidKit Team

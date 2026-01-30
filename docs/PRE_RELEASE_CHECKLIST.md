# Pre-Release Checklist v0.14.2

**Release Date:** 2026-01-23  
**Version:** 0.14.1 → 0.14.2  
**Type:** Patch (Documentation & Cleanup)

---

## ✅ Pre-Release Checks

### Code Quality

- [x] All tests passing (449/449)
- [x] Build successful
- [x] No ESLint warnings
- [x] No TypeScript errors
- [x] Dependencies cleaned up (npm prune)

### Documentation

- [x] README.md updated with preview messaging
- [x] CHANGELOG.md updated with v0.15.0 roadmap
- [x] RELEASE_NOTES.md updated with v0.14.2
- [x] releases/RELEASE_NOTES_v0.14.2.md created
- [x] docs/ACTION_PLAN_v0.15.0.md added
- [x] docs/POLISH_CHECKLIST.md added

### Version & Git

- [ ] Version bumped in package.json (will be done by `npm version`)
- [ ] Git working directory clean
- [ ] All changes committed
- [ ] Release script ready

### Security

- [x] No sensitive information in docs
- [x] .gitignore properly configured
- [x] No API keys or tokens
- [x] All examples are public/safe

---

## 🚀 Release Steps

### 1. Final Verification

```bash
# Check status
git status

# Run all quality checks
npm run validate

# Check bundle size
npm run bundle-size
```

### 2. Commit Changes

```bash
git add .
git commit -m "chore(release): prepare v0.14.2

- docs: update README with preview messaging
- docs: add ACTION_PLAN and POLISH_CHECKLIST
- docs: update CHANGELOG for v0.15.0 roadmap
- chore: cleanup 36 unused dependencies (npm prune)
- docs: add transparency disclaimers
- docs: create release notes v0.14.2

This is a documentation and cleanup release preparing for Core integration."
```

### 3. Automated Release (Recommended)

```bash
# Run the release script
./scripts/release.sh
```

**OR**

### 3. Manual Release Steps

#### a. Version Bump

```bash
npm version patch  # 0.14.1 → 0.14.2
```

#### b. Final Build

```bash
npm run build
npm run test
```

#### c. Publish to npm

```bash
npm publish --dry-run  # Review first
npm publish            # Actual publish
```

#### d. Push to GitHub

```bash
git push origin main --tags
```

#### e. Create GitHub Release

```bash
gh release create v0.14.2 \
  --title "v0.14.2 - Documentation & Cleanup" \
  --notes-file releases/RELEASE_NOTES_v0.14.2.md
```

---

## 📋 Post-Release Tasks

### Immediate

- [ ] Verify package on npm: https://www.npmjs.com/package/rapidkit
- [ ] Test installation: `npm install -g rapidkit@0.14.2`
- [ ] Test project creation: `npx rapidkit@0.14.2 create project fastapi.standard test-api --output .`
- [ ] Check GitHub release page

### Within 24 hours

- [ ] Update VS Code extension to reference v0.14.2
- [ ] Announce on social media
- [ ] Update any documentation sites
- [ ] Monitor npm downloads and issues

### Monitoring

- [ ] Watch for npm download stats
- [ ] Monitor GitHub issues for bug reports
- [ ] Check for user feedback on Discord/community

---

## 🐛 Rollback Plan (If Needed)

If critical issues are discovered:

```bash
# 1. Deprecate the broken version
npm deprecate rapidkit@0.14.2 "Critical bug, use 0.14.1 instead"

# 2. Revert git tag
git tag -d v0.14.2
git push origin :refs/tags/v0.14.2

# 3. Fix issues and release v0.14.3
```

---

## 📊 Success Metrics

Track after 1 week:

- npm downloads (expect similar to 0.14.1)
- GitHub stars/issues
- User feedback
- Installation success rate

---

## 📝 Notes

- This is a **safe release** - no code changes, only docs
- No breaking changes
- Can be rolled back easily if needed
- Focus is on transparency and preparation

---

**Status:** ⏳ Ready for release  
**Approved by:** [Your Name]  
**Date:** 2026-01-23

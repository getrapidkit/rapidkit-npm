# Release Checklist for rapidkit-npm

## Pre-Release

- [ ] Sync kits from Python Core: `npm run sync-kits`
- [ ] Update version in `package.json`
- [ ] Run full validation: `npm run validate`
- [ ] Check bundle size: `npm run bundle-size` (should be < 150KB)
- [ ] Test locally:
  ```bash
  npm run install:local
  cd /tmp && rapidkit test-ws && cd test-ws
  rapidkit create project fastapi.standard test-api
  ls -la test-api/.rapidkit/  # Verify context.json exists
  ```
- [ ] Verify ESLint: 0 errors
- [ ] Check git status: all changes committed

## Release

- [ ] Build: `npm run build`
- [ ] Commit: `git commit -m "chore: release v0.x.x"`
- [ ] Tag: `git tag v0.x.x`
- [ ] Push: `git push origin main --tags`
- [ ] Publish: `npm publish`

## Post-Release

- [ ] Verify on npm: https://www.npmjs.com/package/rapidkit
- [ ] Test installation: `npm install -g rapidkit@latest`
- [ ] Test workspace creation: `rapidkit my-test-workspace`
- [ ] Test project creation: `rapidkit create project fastapi.standard my-api`
- [ ] Check Extension compatibility (if applicable)
- [ ] Update CHANGELOG.md
- [ ] Create GitHub release with notes

## Version Bumps

- **Patch** (0.16.1 → 0.16.2): Bug fixes, minor updates
- **Minor** (0.16.x → 0.17.0): New features, backward compatible
- **Major** (0.x.x → 1.0.0): Breaking changes

---

## Current Version: 0.16.1

### Recent Changes
- ✅ Fixed `.rapidkit/context.json` creation in fallback mode
- ✅ Projects now register in workspace properly
- ✅ Added warning message for limited offline mode
- ✅ Added `sync-kits` script for template updates

### Known Issues
- None

### Next Release TODO
- [ ] Consider: Auto-check for Python Core availability
- [ ] Consider: Better error messages for missing dependencies
- [ ] Consider: Support more kits in fallback mode

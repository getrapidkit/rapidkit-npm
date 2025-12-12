# RapidKit Metrics & Quality Standards

This document defines the quality metrics and standards for the RapidKit npm package.

## 📊 Quality Metrics

### Performance Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Bundle Size | < 500 KB | - | Monitored |
| Install Success Rate | > 95% | - | Requires telemetry |
| Avg Project Creation Time | < 30s | - | Requires benchmarking |

### Code Quality Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Test Coverage | > 80% | - | Monitored |
| ESLint Errors | 0 | 0 | ✅ |
| ESLint Warnings | < 10 | 61 | ⚠️ |
| TypeScript Errors | 0 | 0 | ✅ |

### Security Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Security Vulnerabilities (Critical/High) | 0 | - | Monitored |
| Outdated Dependencies | < 5 | - | Monitored |
| License Compliance | 100% | 100% | ✅ |

## 🎯 Collecting Metrics

### Manual Collection

Run the metrics script to get a comprehensive report:

```bash
npm run metrics
```

This will output:
- Bundle size in KB
- Test coverage percentage
- Test pass/fail statistics
- ESLint errors and warnings
- Dependency count
- Security vulnerabilities

### Automated Collection

Metrics are automatically collected in CI/CD:

1. **On every PR**: Quality checks run
2. **On merge to main**: Full metrics report generated
3. **Daily**: Security audit runs at 2 AM UTC

### CI/CD Workflows

**Quality Workflow** (`.github/workflows/metrics.yml`):
- Runs on push to main/develop
- Collects all metrics
- Uploads coverage to Codecov
- Validates bundle size

**Security Workflow** (`.github/workflows/security.yml`):
- Runs on push and daily schedule
- Performs npm audit
- Checks for outdated dependencies
- Generates security report

## 📈 Metric Targets Explained

### Bundle Size (< 500 KB)
**Why**: CLI tools should be lightweight for fast npm installs  
**How to check**: `npm run bundle-size`  
**How to improve**:
- Remove unused dependencies
- Use dynamic imports where possible
- Optimize templates compression

### Test Coverage (> 80%)
**Why**: Ensures reliability and catches regressions  
**How to check**: `npm run test:coverage`  
**How to improve**:
- Add tests for edge cases
- Cover error handling paths
- Test async operations

### ESLint Warnings (< 10)
**Why**: Clean code is maintainable code  
**How to check**: `npm run lint`  
**How to improve**:
- Fix explicit `any` types in production code
- Add proper type definitions
- Use TypeScript strict mode

### Security Vulnerabilities (0)
**Why**: Protect users from known security issues  
**How to check**: `npm run security`  
**How to improve**:
- Run `npm audit fix` for automatic fixes
- Update vulnerable dependencies
- Review and patch manually if needed

## 🔍 Pre-commit Checks

The following checks run on every commit:

1. **Type checking** (`tsc --noEmit`)
2. **Linting** (`eslint`)
3. **Format checking** (`prettier`)
4. **Tests** (`vitest`)

Commit message must follow [Conventional Commits](https://www.conventionalcommits.org/):
```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
```

## 🚀 Quality Command

Run all quality checks at once:

```bash
npm run quality
```

This runs:
- Type checking
- Linting
- Format checking
- Tests
- Security audit
- Metrics collection

## 📝 Reporting Issues

If metrics fail in CI:

1. Check the Actions tab for detailed logs
2. Run `npm run quality` locally to reproduce
3. Fix issues and commit with proper message format
4. Re-run CI checks

## 🎓 Best Practices

1. **Before committing**: Run `npm run validate`
2. **Before releasing**: Run `npm run quality`
3. **Weekly**: Check `npm outdated` for dependency updates
4. **Monthly**: Review security advisories and update dependencies

## 📚 Related Documentation

- [Development Guide](./DEVELOPMENT.md)
- [Security Policy](../SECURITY.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Release Process](../docs/RELEASE_NOTES.md)

# Quick Optimization Setup

## Install New Dependencies

```bash
cd /home/debux/WOSP/Rapid/Front/create-rapidkit

# Install linting and formatting tools
npm install -D @typescript-eslint/eslint-plugin@latest \
               @typescript-eslint/parser@latest \
               eslint@^8.57.0 \
               prettier@^3.2.5 \
               husky@^9.0.11 \
               lint-staged@^15.2.2
```

## Setup Husky (Pre-commit Hooks)

```bash
# Initialize Husky (new v9 command)
npx husky init

# Create pre-commit hook
echo "npx lint-staged" > .husky/pre-commit
chmod +x .husky/pre-commit

# Create pre-push hook (optional)
echo "npm run validate" > .husky/pre-push
chmod +x .husky/pre-push
```

## Run New Commands

```bash
# Type checking without build
npm run typecheck

# Linting
npm run lint           # Show errors
npm run lint:fix       # Auto-fix errors

# Formatting
npm run format         # Format code
npm run format:check   # Check formatting without changes

# Complete validation (before commit)
npm run validate       # typecheck + lint + format:check + test

# Build and test
npm run build
npm test
npm run test:coverage
```

## Performance Check

```bash
# Run tests with performance metrics
npm run test:coverage

# Build with time measurement
time npm run build
```

## Cleanup and Optimization

```bash
# Clear cache
rm -rf node_modules/.cache
rm -rf dist

# Clean reinstall
npm ci

# Security audit
npm audit

# Fix security issues
npm audit fix
```

## Test in Different Environments

```bash
# Local test
npm run build
npm link
create-rapidkit test-workspace --demo

# Test with npx (without installation)
cd /tmp
npx /home/debux/WOSP/Rapid/Front/create-rapidkit test-demo --demo
```

## CI/CD (Optional)

If you want automated CI/CD, GitHub Actions workflows will run automatically:
- `ci.yml` - On every push/PR to main and develop
- `release.yml` - On every git tag with v prefix (e.g., v1.0.0-beta.6)

**Note**: CI/CD is optional. If you don't need it, you can skip setting up workflows.

## Implemented Optimizations

✅ **Code Quality**
- ESLint for TypeScript
- Prettier for formatting
- Husky for pre-commit hooks
- Lint-staged for staged changes

✅ **Performance**
- Cache system with memory and disk caching
- Performance monitoring utilities
- Metrics tracking

✅ **New Scripts**
- `npm run lint` - Check code
- `npm run format` - Format code
- `npm run typecheck` - Check types
- `npm run validate` - Complete validation

## Next Steps (Optional)

### 1. Bundle Size Optimization
```bash
npm install -D webpack-bundle-analyzer
# Analyze bundle size
```

### 2. Replace Heavy Dependencies
```bash
# Replace inquirer with prompts (lighter)
npm uninstall inquirer @types/inquirer
npm install prompts @types/prompts

# Replace chalk with picocolors (much smaller)
npm uninstall chalk
npm install picocolors
```

### 3. Add More Tests
```bash
# Integration tests
# Performance benchmarks
# Snapshot tests
```

## Important Notes

1. **Always run `npm run validate` before commit**
2. **For releases, use git tags**: `git tag v1.0.0-beta.6 && git push --tags`
3. **If using CI/CD, configure required secrets in GitHub**: `NPM_TOKEN`
4. **After each major change, check coverage**: `npm run test:coverage`

## Common Issues and Solutions

### Husky Not Working
```bash
rm -rf .git/hooks
npx husky init
```

### ESLint Shows Many Errors
```bash
# Auto-fix
npm run lint:fix

# Or incrementally
npx eslint src --ext .ts --fix --max-warnings 10
```

### Tests Fail After Changes
```bash
# Watch mode for detailed checking
npm run test:watch

# Or with debug output
npm run test -- --reporter=verbose
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run lint` | Check code with ESLint |
| `npm run lint:fix` | Auto-fix linting errors |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |
| `npm run typecheck` | Check TypeScript types |
| `npm run validate` | Run all checks |
| `npm test` | Run tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run build` | Build the project |

## Git Workflow

```bash
# 1. Make changes
git add .

# 2. Pre-commit hook runs automatically (lint-staged)
git commit -m "feat: add new feature"

# 3. Pre-push hook runs (npm run validate) - if configured
git push

# 4. For releases
git tag v1.0.0-beta.6
git push --tags
```

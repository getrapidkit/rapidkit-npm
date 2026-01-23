# Polish & Optimization Checklist v0.14.2

> **Note:** This is a working checklist for ongoing improvements.
> Feel free to suggest additions or contribute!

**Date:** 2026-01-23  
**Focus:** Quick wins without Core dependency

---

## ✅ Completed

### 1. Dependencies Cleanup

- [x] Ran `npm prune` - Removed 36 unused packages
- [x] Cleaned up extraneous dependencies (openai, node-fetch, etc)
- [x] **Result:** Cleaner node_modules, faster install

### 2. Documentation Updates

- [x] Updated README with preview messaging
- [x] Updated ROADMAP with v0.15.0 plan
- [x] Added CHANGELOG entry for upcoming release
- [x] Created ACTION_PLAN for tracking

---

## 🎯 Quick Wins (30 minutes - 2 hours)

### 3. Error Messages Enhancement

**Priority:** High  
**Time:** 30 min  
**Impact:** Better UX

Current issues:

- Generic error messages
- No recovery suggestions
- Missing context

**Actions:**

```typescript
// src/errors.ts - Add specific error types
export class PythonNotFoundError extends RapidKitError {
  constructor() {
    super('Python not found', {
      suggestion: 'Install Python 3.10+ from python.org',
      docs: 'https://getrapidkit.com/docs/requirements',
    });
  }
}

export class PoetryNotFoundError extends RapidKitError {
  constructor() {
    super('Poetry not found', {
      suggestion: 'Install: curl -sSL https://install.python-poetry.org | python3 -',
      docs: 'https://python-poetry.org/docs/#installation',
    });
  }
}
```

### 4. Performance - Lazy Loading

**Priority:** Medium  
**Time:** 1 hour  
**Impact:** Faster startup

```typescript
// src/index.ts - Lazy load heavy modules
async function runAICommand() {
  const { aiCommand } = await import('./commands/ai.js'); // Only load when needed
  return aiCommand();
}
```

**Before:** All modules load at startup (slower)  
**After:** Load on-demand (faster CLI)

### 5. Cache Optimization

**Priority:** Medium  
**Time:** 30 min  
**Impact:** Faster repeated operations

```typescript
// src/utils/cache.ts
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import os from 'os';

const CACHE_DIR = path.join(os.homedir(), '.rapidkit', 'cache');
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCached<T>(key: string): T | null {
  try {
    const cachePath = path.join(CACHE_DIR, `${key}.json`);
    const data = JSON.parse(readFileSync(cachePath, 'utf8'));
    if (Date.now() - data.timestamp < CACHE_TTL) {
      return data.value;
    }
  } catch {
    return null;
  }
}

// Usage: Cache version checks, system checks
const version = getCached('latest-version') || (await fetchLatestVersion());
```

### 6. Progress Indicators

**Priority:** Medium  
**Time:** 45 min  
**Impact:** Better feedback

```typescript
import ora from 'ora';

async function createProject(name: string) {
  const spinner = ora('Creating project structure...').start();

  try {
    await generateFiles();
    spinner.text = 'Installing dependencies...';
    await installDeps();
    spinner.text = 'Initializing git...';
    await initGit();
    spinner.succeed('Project created successfully!');
  } catch (error) {
    spinner.fail('Project creation failed');
    throw error;
  }
}
```

### 7. Bundle Size Optimization

**Priority:** Low  
**Time:** 1 hour  
**Impact:** Smaller package

**Current:** 36KB (good!)  
**Target:** <30KB

Actions:

- Remove unused imports
- Use tree-shaking
- External large dependencies

```javascript
// tsup.config.ts
export default defineConfig({
  external: [
    'chalk',
    'commander',
    'inquirer', // Large, keep external
    'ora', // Large, keep external
  ],
  treeshake: 'recommended',
});
```

---

## 🚀 Medium Improvements (2-4 hours)

### 8. Add Command Aliases

**Time:** 1 hour

```typescript
// src/index.ts
program
  .command('dev')
  .alias('d') // rapidkit d
  .alias('serve')
  .description('Start development server');

program
  .command('init')
  .alias('i') // rapidkit i
  .alias('install')
  .description('Install dependencies');
```

### 9. Configuration File Support

**Time:** 2 hours

```typescript
// .rapidkitrc.json
{
  "defaultTemplate": "fastapi",
  "skipGit": false,
  "autoInstall": true,
  "python": {
    "version": "3.10",
    "poetryPath": "/usr/bin/poetry"
  }
}

// Load and use in CLI
const config = loadConfig();
const template = options.template || config.defaultTemplate;
```

### 10. Better Dry-Run Mode

**Time:** 1 hour

```bash
npx rapidkit my-api --template fastapi --dry-run

# Output:
📦 Would create:
  ├── my-api/
  │   ├── src/
  │   │   ├── main.py
  │   │   └── cli.py
  │   ├── tests/
  │   ├── pyproject.toml
  │   └── README.md

Would run:
  1. poetry install
  2. git init
  3. git commit -m "Initial commit"

Total files: 23
Estimated size: 1.2 MB
```

### 11. Upgrade Command

**Time:** 2 hours

```bash
npx rapidkit upgrade

# Checks:
✓ rapidkit-npm: 0.14.1 → 0.15.0 available
✓ Python Core: Not installed yet
✓ VS Code Extension: 1.2.0 (latest)

? Upgrade rapidkit-npm? Yes
Upgrading: npm install -g rapidkit@latest
✓ Upgraded successfully!
```

---

## 🎨 Polish (1-2 hours)

### 12. Better CLI Output

**Time:** 1 hour

```typescript
// Add colors and icons
console.log(chalk.green('✓'), 'Project created');
console.log(chalk.yellow('⚠'), 'Warning: Python not found');
console.log(chalk.red('✗'), 'Error: Invalid name');
console.log(chalk.blue('ℹ'), 'Tip: Use --help for more options');

// Add boxes
import boxen from 'boxen';
console.log(
  boxen(`🎉 Welcome to RapidKit!\n\nProject: ${name}\nTemplate: ${template}`, {
    padding: 1,
    borderColor: 'green',
  })
);
```

### 13. Validation Improvements

**Time:** 30 min

```typescript
// More specific validation messages
validateProjectName('my_project');
// ✗ Project name cannot contain underscores
// ℹ Use hyphens instead: my-project

validateProjectName('123project');
// ✗ Project name cannot start with a number
// ℹ Try: project-123

validateProjectName('my project');
// ✗ Project name cannot contain spaces
// ℹ Use hyphens: my-project
```

### 14. Help Documentation

**Time:** 1 hour

```bash
npx rapidkit --help

# Better help:
RapidKit CLI v0.14.1

USAGE
  $ rapidkit [NAME] [OPTIONS]

COMMANDS
  rapidkit my-api --template fastapi    Create FastAPI project
  rapidkit my-workspace                 Create workspace
  rapidkit init                         Install dependencies
  rapidkit dev                          Start dev server

OPTIONS
  -t, --template <type>    Template (fastapi | nestjs)
  --skip-git               Skip git init
  --dry-run                Preview only
  -h, --help               Show help
  -v, --version            Show version

EXAMPLES
  $ rapidkit my-api --template fastapi
  $ rapidkit my-api -t nestjs --skip-git
  $ rapidkit my-workspace

LEARN MORE
  Docs:    https://getrapidkit.com
  GitHub:  https://github.com/getrapidkit/rapidkit-npm
  Discord: https://discord.gg/rapidkit
```

---

## 📊 Testing Improvements

### 15. Add Performance Tests

**Time:** 2 hours

```typescript
// tests/performance.test.ts
describe('Performance', () => {
  it('should create project in <10 seconds', async () => {
    const start = Date.now();
    await createProject('test-api', 'fastapi');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(10000);
  });

  it('should startup in <200ms', async () => {
    const start = Date.now();
    await import('../src/index.js');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(200);
  });
});
```

---

## 🎯 Summary

| Task                    | Priority | Time  | Impact | Status  |
| ----------------------- | -------- | ----- | ------ | ------- |
| Dependencies cleanup    | High     | 5min  | Medium | ✅ Done |
| Error messages          | High     | 30min | High   | 🔲 Todo |
| Lazy loading            | Medium   | 1h    | Medium | 🔲 Todo |
| Cache optimization      | Medium   | 30min | Medium | 🔲 Todo |
| Progress indicators     | Medium   | 45min | High   | 🔲 Todo |
| Bundle optimization     | Low      | 1h    | Low    | 🔲 Todo |
| Command aliases         | Medium   | 1h    | Medium | 🔲 Todo |
| Config file support     | Medium   | 2h    | Medium | 🔲 Todo |
| Dry-run improvements    | Medium   | 1h    | Low    | 🔲 Todo |
| Upgrade command         | Medium   | 2h    | High   | 🔲 Todo |
| Better CLI output       | High     | 1h    | High   | 🔲 Todo |
| Validation improvements | High     | 30min | High   | 🔲 Todo |
| Help documentation      | Medium   | 1h    | Medium | 🔲 Todo |
| Performance tests       | Low      | 2h    | Low    | 🔲 Todo |

---

## 🚀 Recommended Action Plan

### Phase 1: Quick Wins (3-4 hours)

1. ✅ Dependencies cleanup
2. Error messages enhancement
3. Progress indicators
4. Better CLI output
5. Validation improvements

**Release:** v0.14.2 - Polish & UX improvements

### Phase 2: Medium Improvements (After Core ready)

6. Lazy loading
7. Cache optimization
8. Command aliases
9. Config file support
10. Upgrade command

**Release:** v0.15.0 - Features & optimization

---

**Next Step:** Pick 2-3 quick wins and implement them!

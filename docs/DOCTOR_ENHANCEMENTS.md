# Doctor Command Enhancements

## Overview

The `rapidkit doctor` command has been significantly enhanced with professional-grade health monitoring, actionable diagnostics, and automation capabilities.

## ✨ New Features

### 1. Health Score System 🎯

Visual health scoring with percentage-based metrics:

```
📊 Health Score:
   80% ████████████████░░░░
   ✅ 4 passed | ⚠️ 1 warnings | ❌ 0 errors
```

**Calculation:**
- System checks (Python, Poetry, pipx, Core): 4 checks
- Per-project checks (venv, dependencies, modules, env): variable
- Score = (passed / total) × 100

**Color Coding:**
- 🟢 Green: ≥80% (healthy)
- 🟡 Yellow: 50-79% (warnings)
- 🔴 Red: <50% (critical)

---

### 2. Actionable Fix Commands 🔧

Every detected issue now includes **project-specific** fix commands:

```
🔧 Quick Fix:
$ cd /path/to/project && rapidkit init
```

**Key Features:**
- Commands target the exact project directory
- Multiple fixes shown per project
- Copy-paste ready
- Safe and tested commands

---

### 3. JSON Output Mode 📋

Machine-readable output for CI/CD pipelines:

```bash
rapidkit doctor --workspace --json
```

**Output Structure:**
```json
{
  "workspace": {
    "name": "ai-workspace",
    "path": "/home/user/workspaces/ai-workspace"
  },
  "healthScore": {
    "total": 5,
    "passed": 4,
    "warnings": 1,
    "errors": 0
  },
  "system": {
    "python": { "status": "ok", "message": "Python 3.10.19" },
    "poetry": { "status": "ok", "message": "Poetry 2.3.2" },
    "pipx": { "status": "ok", "message": "pipx 1.8.0" },
    "rapidkitCore": { "status": "ok", "message": "RapidKit Core 0.2.2" },
    "versions": {
      "core": "0.2.2rc1",
      "npm": "0.16.5"
    }
  },
  "projects": [
    {
      "name": "ai-services",
      "path": "/home/user/workspaces/ai-workspace/ai-services",
      "venvActive": true,
      "depsInstalled": false,
      "issues": ["Dependencies not installed"],
      "fixCommands": ["cd /path/to/project && rapidkit init"]
    }
  ],
  "summary": {
    "totalProjects": 1,
    "totalIssues": 1,
    "hasSystemErrors": false
  }
}
```

**Use Cases:**
- CI/CD health checks
- Automated monitoring
- Integration with other tools
- Pre-deployment validation

---

### 4. Auto-Fix Capability 🚀

Automatically apply fixes with user confirmation:

```bash
rapidkit doctor --workspace --fix
```

**Process:**
1. Scan workspace for issues
2. Display available fixes
3. Ask for user confirmation
4. Execute fixes sequentially
5. Report success/failure for each

**Example Session:**
```
🔧 Available Fixes:

Project: ai-services
  1. cd /home/user/workspace/ai-services && rapidkit init

? Apply 1 fix(es)? (Y/n) 

🚀 Applying fixes...

Fixing ai-services...
  $ cd /home/user/workspace/ai-services && rapidkit init
  ✅ Success

✅ Fix process completed!
```

**Safety Features:**
- Interactive confirmation required
- Shows exact commands before execution
- Per-command error handling
- Graceful failure recovery

---

### 5. Version Compatibility Checks ⚙️

Automatic detection of Core/CLI version mismatches:

```
⚠️  Version mismatch: Core 0.2.2 / CLI 0.16.5
   Consider updating to matching versions for best compatibility
```

**Logic:**
- Compares Core and npm package versions
- Warns when minor versions differ (e.g., 0.2.x vs 0.16.x)
- Recommends updating for compatibility

---

### 6. Module Health Checks 📦

Validates Python module structure:

```
✅ Modules: Healthy
⚠️  Modules: Missing 2 init file(s)
```

**Checks:**
- `src/__init__.py` existence
- `modules/<module>/__init__.py` for each module
- Reports missing files specifically

**Detection:**
```
Issues:
  • Missing module init files: modules/auth/__init__.py, modules/db/__init__.py
```

---

### 7. Environment File Validation 🔐

Checks for `.env` configuration:

```
✅ Environment: .env configured
⚠️  Environment: .env missing
```

**Logic:**
- Checks for `.env` file in project root
- Detects `.env.example` as template
- Offers copy command if example exists:
  ```
  🔧 Quick Fix:
  $ cd /path/to/project && cp .env.example .env
  ```

---

### 8. Enhanced Project Display 📊

Comprehensive project status overview:

```
⚠️ Project: ai-services
   Path: /home/user/workspace/ai-services
   ✅ Virtual environment: Active
   ℹ  RapidKit Core: Using global installation (recommended)
   ⚠️  Dependencies: Not verified
   ✅ Environment: .env configured
   ✅ Modules: Healthy
   Issues:
     • Dependencies not installed

   🔧 Quick Fix:
   $ cd /path/to/project && rapidkit init
```

**Status Indicators:**
- ✅ Green: Healthy/configured
- ⚠️ Yellow: Warning/missing
- ❌ Red: Error/critical
- ℹ️ Info: Informational

---

## 🎯 Use Cases

### Development Workflow
```bash
# Daily health check
rapidkit doctor --workspace

# Before committing
rapidkit doctor --workspace --json | jq '.summary'

# Auto-repair common issues
rapidkit doctor --workspace --fix
```

### CI/CD Integration
```bash
# In .gitlab-ci.yml or .github/workflows
- name: Health Check
  run: |
    rapidkit doctor --workspace --json > health-report.json
    if [ $(jq '.summary.hasSystemErrors' health-report.json) = "true" ]; then
      exit 1
    fi
```

### Team Onboarding
```bash
# New team member setup
git clone <workspace-repo>
cd workspace
rapidkit doctor --workspace --fix
```

---

## 📝 Technical Details

### Bug Fixes
- **fs-extra ESM Import**: Changed from `import * as fsExtra` to `import fsExtra from 'fs-extra'` for proper ESM compatibility
- **Deep Project Scanning**: Added fallback recursive scan (max depth 3) when shallow scan finds nothing
- **Core Installation Messaging**: Changed from error to informational (Core is typically global via pipx)

### Architecture
- **Modular Checks**: Each check is independent and composable
- **Graceful Degradation**: Failures in non-critical checks don't block execution
- **Performance**: Parallel execution where possible (system checks)
- **Extensibility**: Easy to add new health checks

### Interfaces
```typescript
interface HealthScore {
  total: number;
  passed: number;
  warnings: number;
  errors: number;
}

interface ProjectHealth {
  name: string;
  path: string;
  venvActive: boolean;
  depsInstalled: boolean;
  coreInstalled: boolean;
  coreVersion?: string;
  issues: string[];
  fixCommands?: string[];
  hasEnvFile?: boolean;
  modulesHealthy?: boolean;
  missingModules?: string[];
}

interface WorkspaceHealth {
  workspacePath: string;
  workspaceName: string;
  python: HealthCheckResult;
  poetry: HealthCheckResult;
  pipx: HealthCheckResult;
  rapidkitCore: HealthCheckResult;
  projects: ProjectHealth[];
  healthScore?: HealthScore;
  coreVersion?: string;
  npmVersion?: string;
}
```

---

## 🚀 Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Health Score | ✅ Complete | Visual progress bar with metrics |
| Fix Commands | ✅ Complete | Project-specific paths |
| JSON Output | ✅ Complete | Clean, pipe-friendly format |
| Auto-Fix | ✅ Complete | With user confirmation |
| Version Check | ✅ Complete | Core/CLI compatibility |
| Module Check | ✅ Complete | `__init__.py` validation |
| Env Check | ✅ Complete | `.env` detection |
| Enhanced Display | ✅ Complete | Color-coded status |

---

## 📖 Examples

### Healthy Workspace
```
🩺 RapidKit Health Check

Workspace: production-services
Path: /home/user/workspaces/production-services

📊 Health Score:
   100% ████████████████████
   ✅ 12 passed | ⚠️ 0 warnings | ❌ 0 errors

System Tools:
✅ Python: Python 3.11.4
✅ Poetry: Poetry 1.8.0
✅ pipx: pipx 1.5.0
✅ RapidKit Core: RapidKit Core 0.2.2

📦 Projects (3):
✅ Project: auth-service
✅ Project: api-gateway
✅ Project: notification-service

✅ All checks passed! Workspace is healthy.
```

### Workspace with Issues
```
🩺 RapidKit Health Check

Workspace: dev-workspace
Path: /home/user/workspaces/dev-workspace

📊 Health Score:
   67% █████████████░░░░░░░
   ✅ 4 passed | ⚠️ 2 warnings | ❌ 0 errors

System Tools:
✅ Python: Python 3.10.12
✅ Poetry: Poetry 1.7.1
✅ pipx: pipx 1.4.3
✅ RapidKit Core: RapidKit Core 0.2.1

⚠️  Version mismatch: Core 0.2.1 / CLI 0.16.5
   Consider updating to matching versions for best compatibility

📦 Projects (2):

⚠️ Project: backend-api
   ✅ Virtual environment: Active
   ⚠️  Dependencies: Not verified
   ⚠️  Environment: .env missing
   ⚠️  Modules: Missing 1 init file(s)
   Issues:
     • Dependencies not installed
     • Environment file missing (found .env.example)
     • Missing module init files: modules/auth/__init__.py

   🔧 Quick Fix:
   $ cd /home/user/workspaces/dev-workspace/backend-api && rapidkit init
   $ cd /home/user/workspaces/dev-workspace/backend-api && cp .env.example .env

✅ Project: frontend-service

⚠️  Found 3 project issue(s)

🔧 Available Fixes:

Project: backend-api
  1. cd /home/user/workspaces/dev-workspace/backend-api && rapidkit init
  2. cd /home/user/workspaces/dev-workspace/backend-api && cp .env.example .env

💡 Run with --fix flag to apply fixes automatically
```

---

## 🎨 User Experience Improvements

1. **Clear Visual Hierarchy**: Icons, colors, and indentation guide the eye
2. **Actionable Output**: Every issue includes solution steps
3. **Progress Feedback**: Visual bar shows health at a glance
4. **Non-Intrusive Info**: Optional checks shown in gray
5. **Copy-Paste Ready**: Commands are ready to execute
6. **Automation Friendly**: JSON mode for scripts/CI
7. **Safe Defaults**: Confirmation required for fixes

---

## 🔮 Future Enhancements

- Port availability checks (8000, 5432, 6379, etc.)
- Docker daemon status
- Git repository health
- Pre-commit hook validation
- Database connection testing
- API endpoint health checks
- Dependency vulnerability scanning
- Performance profiling hints

---

## 📚 Related Documentation

- [RapidKit CLI README](./README.md)
- [Workspace Management](./docs/workspace.md)
- [Module System](./docs/modules.md)
- [Troubleshooting Guide](./docs/troubleshooting.md)

---

**Version**: 0.16.5+  
**Last Updated**: 2024  
**Status**: Production Ready ✅

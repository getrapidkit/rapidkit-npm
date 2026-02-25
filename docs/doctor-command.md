# 🩺 RapidKit Doctor Command

## Health Check for Your RapidKit Environment

The `doctor` command diagnoses your RapidKit environment and identifies potential issues before they cause problems.

---

## 📋 Two Operation Modes

### 1️⃣ **System Check** (Without Workspace)

```bash
npx rapidkit doctor
```

**Checks**:
- ✅ Python installation and version
- ✅ Poetry availability
- ✅ pipx installation status
- ✅ RapidKit Core installation

**Sample Output**:
```
🩺 RapidKit Health Check

System Tools:

✅ Python: Python 3.10.19
   Using python3
✅ Poetry: Poetry 2.3.2
   Available for dependency management
✅ pipx: pipx 1.8.0
   Available for global tool installation
✅ RapidKit Core: RapidKit Core 0.2.2rc1
   Installed via pipx or system PATH

✅ All required tools are installed!

Tip: Run "rapidkit doctor --workspace" from within a workspace for detailed project checks
```

---

### 2️⃣ **Workspace Check** (Inside Workspace)

```bash
cd my-workspace
npx rapidkit doctor --workspace
```

**Checks**:
- ✅ All system checks
- ✅ All projects within the workspace
- ✅ Virtual environment status for each project
- ✅ RapidKit Core installation in each project
- ✅ Dependencies installation status
- ⚠️ Potential issues and recommendations

**Sample Output**:
```
🩺 RapidKit Health Check

Workspace: my-workspace
Path: <workspace-path>/my-workspace

System Tools:

✅ Python: Python 3.10.19
   Using python3
✅ Poetry: Poetry 2.3.2
   Available for dependency management
✅ pipx: pipx 1.8.0
   Available for global tool installation
✅ RapidKit Core: RapidKit Core 0.2.2rc1
   Installed via pipx or system PATH

📦 Projects (2):

✅ Project: my-api
   Path: <workspace-path>/my-workspace/my-api
   ✅ Virtual environment: Active
   ✅ RapidKit Core: 0.2.2rc1
   ✅ Dependencies: Installed

⚠️  Project: auth-service
   Path: <workspace-path>/my-workspace/auth-service
   ❌ Virtual environment: Not found
   ❌ RapidKit Core: Not installed
   ⚠️  Dependencies: Not verified
   Issues:
     • Virtual environment not created (run: rapidkit init)
     • RapidKit Core not installed in virtual environment

⚠️  Found 2 project issue(s)
```

---

## 🔧 Troubleshooting Common Issues

### Issue: Python Not Found

```
❌ Python: Python not found
   Install Python 3.10+ and ensure it's in PATH
```

**Solution**:
```bash
# Ubuntu/Debian
sudo apt install python3.10

# macOS
brew install python@3.10

# Windows
# Download from https://www.python.org/downloads/
```

---

### Issue: Python Version Too Old

```
⚠️  Python: Python 3.8.10 (requires 3.10+)
   Python found but version is below minimum requirement
```

**Solution**:
```bash
# Ubuntu (using deadsnakes PPA)
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install python3.10

# macOS
brew install python@3.10

# Or use pyenv
pyenv install 3.10.12
pyenv global 3.10.12
```

---

### Issue: RapidKit Core Not Installed

```
❌ RapidKit Core: RapidKit Core not installed
   Install with: pipx install rapidkit-core
```

**Solution**:
```bash
# Install pipx first (if needed)
python3 -m pip install --user pipx
python3 -m pipx ensurepath

# Install RapidKit Core
pipx install rapidkit-core

# Verify installation
rapidkit --version
```

---

### Issue: Virtual Environment Not Created

```
⚠️  Project: my-api
   Issues:
     • Virtual environment not created (run: rapidkit init)
```

**Solution**:
```bash
cd my-api
rapidkit init
# This will create .venv and install dependencies
```

---

### Issue: Dependencies Not Installed

```
⚠️  Project: my-api
   Issues:
     • Dependencies not installed (run: rapidkit init)
```

**Solution**:
```bash
cd my-api

# If using Poetry
poetry install

# Or run rapidkit init
rapidkit init
```

---

## 🆚 Difference from Core Doctor

### `npx rapidkit doctor` (npm CLI)
- Quick system and workspace checks
- Verifies tool availability
- Checks workspace structure
- Fast and lightweight

### `rapidkit doctor` (Python Core)
```bash
rapidkit doctor --help
```
- Deep Python environment inspection
- Checks installed modules
- Tests imports and dependencies
- Project-specific diagnostics

**Recommendation**: Use both for comprehensive checks:
```bash
# 1. Check system & workspace
npx rapidkit doctor --workspace

# 2. Deep check inside project
cd my-api
rapidkit doctor <subcommand>
```

---

## 📊 Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All checks passed |
| 1 | Issues found |

**Usage in Scripts**:
```bash
#!/bin/bash
if npx rapidkit doctor; then
  echo "✅ Environment is healthy"
  npm run build
else
  echo "❌ Please fix issues above"
  exit 1
fi
```

---

## 🎯 Common Use Cases

### ✅ Before Starting Work

```bash
npx rapidkit doctor
# Ensure all tools are installed
```

---

### ✅ After Cloning a Repository

```bash
git clone <repo>
cd <repo>
npx rapidkit doctor --workspace
# Comprehensive workspace check
```

---

### ✅ In CI/CD Pipelines

```yaml
# GitHub Actions
name: Check Environment
on: [push]

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Check System
        run: npx rapidkit doctor
      
      - name: Check Workspace
        run: npx rapidkit doctor --workspace
```

---

### ✅ Troubleshooting Issues

```bash
# When workspace isn't working
npx rapidkit doctor --workspace

# Shows detailed issues for debugging
```

---

### ✅ Team Onboarding

```bash
# New team member setup verification
npx rapidkit doctor

# If all green, proceed with development
# If issues found, fix them first
```

---

## 💡 Best Practices

1. **Run Before Work**: Check environment health before starting development
2. **Use in Workspaces**: Always run with `--workspace` flag for comprehensive checks
3. **Integrate in CI**: Catch environment issues early in the pipeline
4. **Combine with Core Doctor**: Use both npm and Python doctor commands
5. **Document Issues**: Share doctor output when reporting bugs

---

## 🔍 Workspace Detection

Doctor automatically detects workspaces by searching for:

1. `.rapidkit-workspace` (npm CLI workspace marker)
2. `.rapidkit/workspace-marker.json` (alternative format)
3. `.rapidkit/config.json` (VS Code extension format)

If you're in a subdirectory, it automatically finds the parent workspace.

**Example Directory Structure**:
```
my-workspace/                    ← Workspace root
├── .rapidkit-workspace          ← Detected here
├── my-api/                      ← Can run doctor from here
│   └── .rapidkit/
└── auth-service/                ← Or from here
    └── .rapidkit/
```

---

## 🚨 Common Warnings Explained

### Warning: Poetry Not Installed

```
⚠️  Poetry: Poetry not installed
   Optional: Install for better dependency management
```

**Impact**: Low - Poetry is optional. You can use pip + venv instead.

**When to Install**: If you prefer Poetry's dependency management or your team uses it.

---

### Warning: pipx Not Installed

```
⚠️  pipx: pipx not installed
   Optional: Install for isolated Python tools
```

**Impact**: Low - pipx is optional but recommended for global tools.

**When to Install**: For cleaner global Python tool management.

---

## 📚 Related Commands

```bash
# System check only
npx rapidkit doctor

# Full workspace check
npx rapidkit doctor --workspace

# Check Python Core
rapidkit doctor --help

# Create new workspace
npx rapidkit my-workspace

# Initialize project
cd my-project && rapidkit init

# List available modules
rapidkit modules
```

---

## 🔗 Additional Resources

- [Installation Guide](https://getrapidkit.com/docs/installation)
- [Troubleshooting Guide](https://getrapidkit.com/docs/troubleshooting)
- [CLI Reference](https://getrapidkit.com/docs/cli)
- [Configuration Guide](./config-file-guide.md)

---

## 🎓 Tutorial: First Time Setup

```bash
# 1. Check if tools are installed
npx rapidkit doctor

# 2. If Python missing, install it
# (Follow instructions from doctor output)

# 3. If RapidKit Core missing, install it
pipx install rapidkit-core

# 4. Verify installation
npx rapidkit doctor
# Should show all green ✅

# 5. Create your first workspace
npx rapidkit my-workspace

# 6. Check workspace health
cd my-workspace
npx rapidkit doctor --workspace
```

---

## ⚙️ Technical Details

### Detection Methods

**System Tools**:
- Python: Tries `python3`, then `python`
- Poetry: Checks `poetry --version`
- pipx: Checks `pipx --version`
- Core: Tries multiple methods (pipx, poetry env, direct python import)

**Project Health**:
- Checks for `.rapidkit/` directory
- Verifies `.venv/` existence
- Tests Python executable in venv
- Imports rapidkit_core module
- Checks site-packages directory

### Performance

- System check: ~1-2 seconds
- Workspace check (5 projects): ~3-5 seconds
- Workspace check (20 projects): ~8-12 seconds

---

**Last Updated**: February 5, 2026  
**CLI Version**: 0.16.5  
**Python Core Version**: 0.2.2rc1

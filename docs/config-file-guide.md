# 📖 RapidKit Config File Guide

## 🎯 Purpose of `rapidkit.config.js`

The `rapidkit.config.js` file is an **optional configuration file** that allows you to define default settings for creating workspaces and projects.

---

## 📍 File Location

```
📁 Your Project Directory (where you run npx rapidkit)
├── rapidkit.config.js       ← Config file (create manually)
├── package.json
└── ...
```

**Important Note**: This file is **not automatically created**. You must create it manually.

---

## 🔍 When to Use

### 1️⃣ **Team Development**

```javascript
// rapidkit.config.js
export default {
  workspace: {
    defaultAuthor: 'Your Team Name',
    pythonVersion: '3.10',
    installMethod: 'poetry'
  }
}
```

**Result**: All team members create workspaces with identical settings.

---

### 2️⃣ **CI/CD Automation**

```javascript
// rapidkit.config.js for CI/CD
export default {
  workspace: {
    defaultAuthor: 'CI Bot',
    pythonVersion: '3.11',
    installMethod: 'venv'
  },
  projects: {
    skipGit: true,        // No git init needed in CI
    skipInstall: false
  }
}
```

**Usage**:
```bash
# In CI/CD pipeline
npx rapidkit my-workspace --yes
# Uses config without prompts
```

---

### 3️⃣ **Personal Projects**

```javascript
// rapidkit.config.js
export default {
  workspace: {
    defaultAuthor: 'John Doe',
    pythonVersion: '3.12'
  },
  projects: {
    defaultKit: 'fastapi.ddd',          // Always use DDD template
    addDefaultModules: [
      'prisma',
      'redis', 
      'auth-jwt',
      'monitoring'
    ]
  }
}
```

**Result**: Every new project comes with these modules pre-configured.

---

## 📝 Supported File Formats

| File | Description |
|------|-------------|
| `rapidkit.config.js` | ES Module (export default) |
| `rapidkit.config.mjs` | Explicit ES Module |
| `rapidkit.config.cjs` | CommonJS (module.exports) |

---

## ⚙️ Available Configuration Options

### **workspace** (Workspace Settings)

```typescript
workspace: {
  defaultAuthor?: string;        // Author/team name
  pythonVersion?: '3.10' | '3.11' | '3.12';  // Python version
  installMethod?: 'poetry' | 'venv' | 'pipx';  // Core installation method
}
```

### **projects** (Project Settings)

```typescript
projects: {
  defaultKit?: string;           // Default template
  addDefaultModules?: string[];  // Default modules to install
  skipGit?: boolean;             // Skip git initialization
  skipInstall?: boolean;         // Skip npm install
}
```

---

## 🔄 Configuration Priority

```
CLI Arguments > rapidkit.config.js > .rapidkitrc.json > Defaults
```

**Example**:
```bash
# Config file: author='Team A'
npx rapidkit my-workspace --author "Team B"
# Result: author='Team B' (CLI overrides config)
```

---

## 📋 Complete Example

```javascript
/**
 * RapidKit Configuration
 * Place in project root before running `npx rapidkit`
 */
export default {
  // Workspace settings
  workspace: {
    defaultAuthor: 'RapidKit Dev Team',
    pythonVersion: '3.10',
    installMethod: 'poetry',
  },
  
  // Project settings
  projects: {
    defaultKit: 'fastapi.standard',
    
    // Auto-add these modules to new projects
    addDefaultModules: [
      'prisma',          // Database ORM
      'redis',           // Caching
      'auth-jwt',        // Authentication
      'monitoring',      // Observability
    ],
    
    skipGit: false,
    skipInstall: false,
  },
};
```

---

## 🚀 Usage Examples

### Without Config File (Interactive):
```bash
npx rapidkit my-workspace
# ❓ Prompts:
#   - Author name?
#   - Python version?
#   - Install method?
```

### With Config File (Automated):
```bash
# 1. Create config
cat > rapidkit.config.js << 'EOF'
export default {
  workspace: {
    defaultAuthor: 'My Team',
    pythonVersion: '3.10',
    installMethod: 'poetry'
  }
}
EOF

# 2. Run rapidkit
npx rapidkit my-workspace --yes
# ✅ No prompts, uses config defaults
```

---

## 🔍 Debugging Configuration

```bash
# Enable debug mode to see loaded config
npx rapidkit my-workspace --debug
```

Output:
```
[DEBUG] User config loaded {}
[DEBUG] RapidKit config loaded { workspace: { defaultAuthor: 'Team' } }
[DEBUG] Merged config { author: 'Team', pythonVersion: '3.10' }
```

---

## 🎯 Common Use Cases

### ✅ Recommended Uses:

1. **Large Teams**: Standardize settings across developers
2. **CI/CD**: Automate workspace creation
3. **Personal Templates**: Always start with specific modules
4. **Training/Workshops**: Ensure all participants have identical settings

### ❌ Not Recommended:

1. **One-time Use**: If you're only creating one workspace
2. **Variable Settings**: If you need different settings each time
3. **Quick Development**: For rapid testing, interactive prompts are faster

---

## 📚 Additional Resources

- [Example Config](../rapidkit.config.example.js)
- [Documentation](https://getrapidkit.com/docs/config)
- [CLI Reference](https://getrapidkit.com/docs/cli)

---

## 💡 Tips

1. **Config is Optional**: You don't need to create this file
2. **CLI Overrides**: You can always override config with command-line flags
3. **Auto-detection**: CLI automatically discovers config files
4. **Type Safety**: Use TypeScript types for IntelliSense support

---

## 🔗 Related Commands

```bash
# Create workspace with config
npx rapidkit my-workspace --yes

# Override config author
npx rapidkit my-workspace --author "Different Author"

# Check environment
npx rapidkit doctor

# List available kits
npx rapidkit list
```

---

**Last Updated**: February 5, 2026  
**Version**: 0.16.5

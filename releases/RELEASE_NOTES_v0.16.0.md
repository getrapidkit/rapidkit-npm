# Release Notes — v0.16.0

**Release Date:** February 1, 2026  
**Release Type:** Minor (New Features)

---

## ✨ v0.16.0 — Workspace Registry & Cross-Tool Integration

This release introduces a **shared workspace registry** for seamless integration between the npm CLI and VS Code Extension, plus **unified workspace signatures** for better cross-tool compatibility.

---

## 🎯 What's New

### 📋 Workspace Registry

Shared workspace registry at `~/.rapidkit/workspaces.json` enables cross-tool workspace discovery:

- **Automatic Registration:** `registerWorkspace()` function automatically registers workspaces in the shared registry
- **New Command:** `rapidkit workspace list` to view all registered workspaces
  - Works without Python dependency (npm-only command)
  - Shows workspaces created by both npm CLI and VS Code Extension
- **Cross-Tool Discovery:**
  - VS Code Extension can discover npm-created workspaces
  - npm package can discover Extension-created workspaces
  - Unified experience across all RapidKit tools

### 🏷️ Unified Workspace Signature

Changed workspace marker signature for better compatibility:

- **New Signature:** `RAPIDKIT_WORKSPACE` (previously `RAPIDKIT_VSCODE_WORKSPACE`)
- **Backward Compatible:** Both signatures are recognized by all tools
- **Creator Tracking:** Workspace markers now clearly identify creator:
  - `createdBy: 'rapidkit-npm'` for npm CLI workspaces
  - `createdBy: 'rapidkit-vscode'` for VS Code Extension workspaces
- **Better Interoperability:** Enables seamless workspace handoff between tools

### 🔍 Command Routing

Improved command routing for workspace operations:

- **npm-Only Command:** `workspace` command is now handled entirely by the npm package
  - Not forwarded to Python Core
  - No Python dependency required for workspace management
- **Performance:** Faster execution for workspace listing and operations
- **Reliability:** Works even if Python Core is not installed

### 📝 Documentation

- Comprehensive workspace registry documentation added to README
- Documented workspace marker format and cross-tool compatibility
- Added examples for `workspace list` command
- Updated architecture diagrams to show registry integration

---

## 🚀 Usage Examples

### List All Workspaces

```bash
# View all registered workspaces
rapidkit workspace list

# Example output:
# Registered RapidKit Workspaces:
# 
# 1. my-workspace
#    Path: /home/user/projects/my-workspace
#    Created by: rapidkit-npm
#    Projects: 3
# 
# 2. vscode-workspace
#    Path: /home/user/workspaces/vscode-workspace
#    Created by: rapidkit-vscode
#    Projects: 2
```

### Workspace Registry Format

The shared registry at `~/.rapidkit/workspaces.json`:

```json
{
  "workspaces": [
    {
      "name": "my-workspace",
      "path": "/absolute/path/to/workspace",
      "createdBy": "rapidkit-npm",
      "projects": [
        {
          "name": "my-api",
          "path": "my-api"
        }
      ]
    }
  ]
}
```

### Workspace Marker Format

Each workspace directory contains `.rapidkit-workspace` marker:

```json
{
  "signature": "RAPIDKIT_WORKSPACE",
  "version": "1.0.0",
  "createdBy": "rapidkit-npm",
  "createdAt": "2026-02-01T10:30:00Z"
}
```

---

## ⬆️ Upgrade

### Global Installation

```bash
npm install -g rapidkit@0.16.0
```

### One-Time Usage

```bash
npx rapidkit@0.16.0 create project fastapi.standard my-api
```

### Verify Installation

```bash
rapidkit --version
# Should output: 0.16.0
```

---

## 🔄 Migration Guide

### For Existing Workspaces

No action required! Workspaces created with previous versions will continue to work:

1. **Old Signature Recognition:** Both `RAPIDKIT_VSCODE_WORKSPACE` and `RAPIDKIT_WORKSPACE` are recognized
2. **Automatic Registration:** Existing workspaces are automatically registered when accessed
3. **Backward Compatible:** All existing commands and workflows continue to work

### For Tool Integrations

If you're integrating with RapidKit workspaces:

1. **Use New Signature:** Prefer `RAPIDKIT_WORKSPACE` for new workspaces
2. **Read Registry:** Check `~/.rapidkit/workspaces.json` for all registered workspaces
3. **Respect Creator:** Read `createdBy` field to identify workspace creator

---

## 🐛 Known Issues

None reported.

---

## 📊 Stats

- **New Features:** 3
- **Documentation Updates:** 4 sections
- **Breaking Changes:** 0 (fully backward compatible)
- **Test Coverage:** 84% (maintained)

---

## 🙏 Credits

Thanks to the community for feedback on workspace management and cross-tool integration!

---

## 📚 Related

- [CHANGELOG.md](../CHANGELOG.md) — Full version history
- [README.md](../README.md) — Complete documentation
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=rapidkit.rapidkit-vscode) — Visual workspace management

---

## 🔗 Links

- **npm Package:** [rapidkit@0.16.0](https://www.npmjs.com/package/rapidkit/v/0.16.0)
- **GitHub Release:** [v0.16.0](https://github.com/getrapidkit/rapidkit-npm/releases/tag/v0.16.0)
- **Documentation:** [getrapidkit.com](https://getrapidkit.com)
- **Support:** [GitHub Issues](https://github.com/getrapidkit/rapidkit-npm/issues)

---

**Previous Release:** [v0.15.1](RELEASE_NOTES_v0.15.1.md) — Bridge Stability & Test Coverage  
**Next Release:** TBD

# Release Notes

## Latest Release: v0.12.4 (December 6, 2025)

### 🎨 Professional Activation Output

**Shell activation now prints friendly green headers and clear instructions!**

When you run `eval "$(rapidkit shell activate)"`, you'll see:
- ✅ A prominent green header with clear instructions
- The eval-able snippet for `.venv` activation
- 💡 A helpful tip about what you can do next

### What Changed

**UX Improvements:**
- Prints bold green header explaining activation
- Clear eval snippet ready to copy and paste
- Gray footer tip with next steps

**Robustness:**
- Shell activate works even if `context.json` is missing or unreadable
- Smart fallback to `.venv` or `.rapidkit/activate` file detection
- Never fails silently; always attempts to help

**Code Quality:**
- Added unit tests for activation behavior
- Fixed all linting errors (0 errors, 61 warnings)
- All 431 tests passing

### Workflow Example

```bash
# Create and initialize project
npx rapidkit my-api --template fastapi
cd my-api

# Activate environment in current shell
eval "$(rapidkit shell activate)"   # Prints friendly green header!

# Now run commands directly
rapidkit dev                         # Starts dev server
rapidkit test                        # Runs tests
```

### Upgrade

```bash
npx rapidkit@latest --version  # Check version
```

---

## v0.12.4 Key Features

✅ **Friendly Activation UX** — Green headers, clear instructions, helpful tips  
🛠️ **Robust Fallback Logic** — Works even with missing context.json  
✅ **Comprehensive Tests** — 2 new unit tests for activation  
🧹 **Clean Code** — All linting fixed, validation passing  

---

## Previous Releases

| Version | Date | Highlights |
|---------|------|------------|
| [v0.12.3](releases/RELEASE_NOTES_v0.12.3.md) | Dec 4, 2025 | Smart CLI delegation |  
| [v0.12.2](releases/RELEASE_NOTES_v0.12.2.md) | Dec 4, 2025 | Auto-activate in init command |
| [v0.12.1](releases/RELEASE_NOTES_v0.12.1.md) | Dec 3, 2025 | NestJS port fix |
| [v0.12.0](releases/RELEASE_NOTES_v0.12.0.md) | Dec 3, 2025 | NestJS support |
| [v0.11.3](releases/RELEASE_NOTES_v0.11.3.md) | Dec 3, 2025 | Bug fixes |
| [v0.11.2](releases/RELEASE_NOTES_v0.11.2.md) | Dec 3, 2025 | Improvements |
| [v0.11.1](releases/RELEASE_NOTES_v0.11.1.md) | Nov 28, 2025 | Features |
| [v0.10.0](releases/RELEASE_NOTES_v0.10.0.md) | Nov 8, 2025 | Major release |

For complete changelog, see [CHANGELOG.md](CHANGELOG.md).

---

### Patch: v0.12.4 (December 6, 2025)

Improved the developer UX around activation and robustness:

- ✅ `rapidkit shell activate` prints a friendly, green activation header and clear follow-up instructions so users know to run `eval "$(rapidkit shell activate)"`.
- 🛠️ Robust fallback: `shell activate` will find a `.venv` or `.rapidkit/activate` even if `context.json` cannot be parsed.
- ✅ Unit tests added to ensure these behaviors are protected by CI.

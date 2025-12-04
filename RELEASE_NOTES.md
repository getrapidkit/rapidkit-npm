# Release Notes

## Latest Release: v0.12.3 (December 4, 2025)

### 🎯 Smart CLI Delegation

**The global `rapidkit` command now auto-detects project context!**

When you run `rapidkit init`, `rapidkit dev`, or any local command inside a RapidKit project, it automatically delegates to the local `./rapidkit` script. No more confusion between global npm command and local project commands.

### What Changed

- Running `rapidkit init/dev/test/...` inside a project automatically uses local CLI
- No more need for `./rapidkit` prefix or `source .rapidkit/activate`
- Detects RapidKit projects by checking for `./rapidkit` and `.rapidkit/` folder

### New Simplified Workflow

```bash
# Create project
npx rapidkit my-api --template fastapi

# Work with project (no ./ or source needed!)
cd my-api
rapidkit init    # Automatically uses local ./rapidkit
rapidkit dev     # Works seamlessly
rapidkit test    # All commands work directly
```

### Upgrade

```bash
npx rapidkit@latest --version  # Check version
```

---

## Previous Releases

| Version | Date | Highlights |
|---------|------|------------|
| [v0.12.2](releases/RELEASE_NOTES_v0.12.2.md) | Dec 4, 2025 | Auto-activate in init command |
| [v0.12.1](releases/RELEASE_NOTES_v0.12.1.md) | Dec 3, 2025 | NestJS port fix |
| [v0.12.0](releases/RELEASE_NOTES_v0.12.0.md) | Dec 3, 2025 | NestJS support |
| [v0.11.3](releases/RELEASE_NOTES_v0.11.3.md) | Dec 3, 2025 | Bug fixes |
| [v0.11.2](releases/RELEASE_NOTES_v0.11.2.md) | Dec 3, 2025 | Improvements |
| [v0.11.1](releases/RELEASE_NOTES_v0.11.1.md) | Nov 28, 2025 | Features |
| [v0.10.0](releases/RELEASE_NOTES_v0.10.0.md) | Nov 8, 2025 | Major release |

For complete changelog, see [CHANGELOG.md](CHANGELOG.md).

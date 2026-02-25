# RapidKit Doctor Command

`doctor` checks health for the npm wrapper environment and (optionally) full workspace state.

## Command Modes

### 1) System Check

```bash
npx rapidkit doctor
```

Checks host prerequisites:
- Python
- Poetry (optional)
- pipx (optional)
- RapidKit Core availability
- Go (optional)

### 2) Workspace Check (Canonical)

```bash
cd my-workspace
npx rapidkit doctor workspace
```

Checks:
- all system checks
- workspace marker resolution
- project discovery and per-project health
- dependency/env readiness by project type (Python/Node/Go)

> Compatibility note: `npx rapidkit doctor --workspace` still works, but `doctor workspace` is the canonical form.

## Typical Usage

```bash
# Pre-flight on a contributor machine
npx rapidkit doctor

# Full check inside a workspace
npx rapidkit doctor workspace

# Machine-readable output
npx rapidkit doctor workspace --json

# Attempt safe fixes (interactive)
npx rapidkit doctor workspace --fix
```

## CI Example

```yaml
name: Health Check
on: [push]

jobs:
  doctor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx rapidkit doctor
```

## Exit Codes

| Code | Meaning |
| --- | --- |
| `0` | checks passed or warnings only |
| `1` | blocking issues found |

## Related Workspace Commands

```bash
rapidkit bootstrap [--profile <profile>]
rapidkit setup <python|node|go> [--warm-deps]
rapidkit cache <status|clear|prune|repair>
rapidkit mirror <status|sync|verify|rotate>
```

Use `doctor workspace` before and after major workspace operations to detect drift early.

# Release Handoff — Workspace Architecture (Phase 1 → 4)

This document is the release handoff package for the workspace architecture rollout in `rapidkit-npm`.

## 1) Scope Summary

Delivered phases:

- **Phase 1 — Workspace Foundation**
  - Added deterministic workspace artifacts in create/register flows:
    - `.rapidkit/workspace.json`
    - `.rapidkit/toolchain.lock`
    - `.rapidkit/policies.yml`
    - `.rapidkit/cache-config.yml`

- **Phase 2 — Runtime Adapters**
  - Added adapter contract and implementations for:
    - Python
    - Node
    - Go
  - Added feature flag gate:
    - `RAPIDKIT_ENABLE_RUNTIME_ADAPTERS=1`

- **Phase 3 — Command Contracts**
  - Added npm-wrapper level commands:
    - `bootstrap`
    - `setup`
    - `cache`
  - Added forwarding boundary guarantees:
    - `bootstrap/setup/cache` are **not** forwarded to core.

- **Phase 4 — CI Hardening**
  - Added dedicated CI gate job for runtime contracts and init non-regression scenarios.

## 2) User-Visible Behavior

### `npx rapidkit init` (3 canonical scenarios)

1. **Inside normal/empty folder**
   - Creates default workspace and initializes workspace dependencies.

2. **Inside workspace root**
   - Initializes workspace dependencies first, then child projects.

3. **Inside project folder**
   - Initializes only that project.

Non-regression coverage for all 3 scenarios is included.

### New command contracts

- `rapidkit bootstrap [path]`
  - Deterministic rewrite to init orchestration.

- `rapidkit setup <python|node|go>`
  - Runtime prereq checks + hints.

- `rapidkit cache <status|clear|prune|repair>`
  - Wrapper-level cache operations.

## 3) Feature Flag Strategy

- Default mode keeps stable legacy behavior.
- Adapter routing is enabled only when:

```bash
RAPIDKIT_ENABLE_RUNTIME_ADAPTERS=1
```

This ensures safe incremental rollout.

## 4) Validation Evidence

Core suites added/used for this rollout:

- `src/__tests__/phase3-commands.test.ts`
- `src/__tests__/phase3-commands.integration.test.ts`
- `src/__tests__/phase3-cli.integration.test.ts`
- `src/__tests__/init-scenarios.integration.test.ts`
- `src/__tests__/runtime-adapters.test.ts`

Expected verification commands:

```bash
RAPIDKIT_ENABLE_RUNTIME_ADAPTERS=1 npm run test -- \
  src/__tests__/phase3-commands.test.ts \
  src/__tests__/phase3-commands.integration.test.ts \
  src/__tests__/phase3-cli.integration.test.ts \
  src/__tests__/init-scenarios.integration.test.ts \
  src/__tests__/runtime-adapters.test.ts

npm run typecheck
```

## 5) Risk Assessment

- **Primary risk:** Runtime dispatch drift across project types.
  - **Mitigation:** Shared runtime detection utility + adapter contract tests + process-level CLI tests.

- **Primary risk:** Forwarding conflicts with core commands.
  - **Mitigation:** Explicit boundary rules and tests for `bootstrap/setup/cache`.

- **Primary risk:** CI blind spots for adapter-enabled mode.
  - **Mitigation:** Phase 4 dedicated CI gate job.

## 6) Rollback Plan

If issues appear post-merge:

1. Disable adapter routing behavior operationally:
   - unset `RAPIDKIT_ENABLE_RUNTIME_ADAPTERS`
2. Keep wrapper command contracts active (safe, wrapper-local).
3. Revert only adapter dispatch blocks in `src/index.ts` if needed.
4. Re-run phase suites + typecheck before re-release.

## 7) PR Description Template

```md
## Summary
Implements workspace architecture blueprint phases 1→4 in `rapidkit-npm` with stability-first rollout.

## What changed
- Added workspace foundation artifacts on create/register.
- Added Python/Node/Go runtime adapters behind `RAPIDKIT_ENABLE_RUNTIME_ADAPTERS=1`.
- Added wrapper-level contracts for `bootstrap`, `setup`, `cache`.
- Added CI hardening gate for runtime contracts and init non-regression scenarios.

## Backward compatibility
- Default behavior remains stable when adapter flag is not enabled.

## Validation
- Phase contract/unit/integration/process suites passing.
- `npm run typecheck` passing.

## Risks
- Runtime dispatch edge cases in mixed workspaces.

## Rollback
- Disable adapter flag and revert adapter dispatch paths if needed.
```

## 8) Release Checklist

- [ ] Ensure Unreleased changelog entries are complete.
- [ ] Confirm Phase 4 CI job is green.
- [ ] Run local phase validation commands.
- [ ] Prepare version bump and release notes.
- [ ] Publish and monitor first post-release feedback window.

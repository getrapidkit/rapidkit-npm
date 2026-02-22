# Blueprint Conformance Matrix (Phase 1→4)

- **Document baseline:** `../Docs/npm/workspace-architecture-blueprint.md`
- **Repository:** `rapidkit-npm`
- **Assessment date:** 2026-02-22
- **Assessment basis:** Code inspection + targeted test execution

## Overall Status

- **Implemented (core):** Workspace foundation artifacts, runtime-adapter contract + implementations, wrapper command contracts (`bootstrap/setup/cache`), and dedicated CI regression gate.
- **Partial:** Enterprise controls (policy engine depth, offline/mirror, compliance/audit), profile templates.
- **Pending:** Full enterprise-grade policy/compliance/offline roadmap items from blueprint Phase 3.

## Phase-by-Phase Conformance

| Blueprint Phase | Requirement | Status | Evidence |
|---|---|---|---|
| Phase 1 (Foundation) | Workspace manifest and lock/config artifacts | ✅ Implemented | `src/create.ts` writes `.rapidkit/workspace.json`, `.rapidkit/toolchain.lock`, `.rapidkit/policies.yml`, `.rapidkit/cache-config.yml` |
| Phase 1 (Foundation) | Runtime adapter contract | ✅ Implemented | `src/runtime-adapters/types.ts` (`checkPrereqs/initProject/runDev/runTest/runBuild/runStart/doctorHints`) |
| Phase 1 (Foundation) | Doctor v1 | ✅ Implemented | `src/doctor.ts`, docs in `docs/doctor-command.md` |
| Phase 1 (Foundation) | Profile-based bootstrap (`minimal/go-only/polyglot/...`) | ⚠️ Partial | Bootstrap command exists, but blueprint profile templates are not fully modeled yet |
| Phase 2 (Performance+Stability) | Shared toolchain directory approach | ✅ Implemented (baseline) | Workspace-level artifacts + wrapper orchestration in `src/index.ts` |
| Phase 2 (Performance+Stability) | Cache orchestration commands | ✅ Implemented (baseline) | `handleCacheCommand` in `src/index.ts` supports `status/clear/prune/repair` |
| Phase 2 (Performance+Stability) | Self-healing & auto-remediation hints | ⚠️ Partial | Cache repair path exists; deeper automated remediation policies are limited |
| Phase 3 (Enterprise readiness) | Policy engine | ⚠️ Partial | `policies.yml` foundation exists; advanced enforcement matrix is not complete |
| Phase 3 (Enterprise readiness) | Mirror/offline mode | ⏳ Pending | No full mirror/offline execution mode found in wrapper flow |
| Phase 3 (Enterprise readiness) | Compliance/audit capabilities | ⏳ Pending/Partial | Release handoff exists; enterprise audit pipeline and reports not fully implemented |
| Cross-cutting | Command contracts: `bootstrap`, `setup`, `cache` | ✅ Implemented | `src/index.ts` handlers + forwarding guard in `shouldForwardToCore` |
| Cross-cutting | Runtime adapters for Python/Node/Go | ✅ Implemented | `src/runtime-adapters/python.ts`, `node.ts`, `go.ts`, `index.ts` |
| Cross-cutting | `init` scenario reliability (3 canonical paths) | ✅ Implemented | `src/__tests__/init-scenarios.integration.test.ts` |
| Cross-cutting | Workspace-root `init` no wrong delegation | ✅ Implemented | Guard in `delegateToLocalCLI()` + process test in `phase3-cli.integration.test.ts` |
| CI hardening (Phase 4) | Dedicated regression gate | ✅ Implemented | `.github/workflows/ci.yml` job: `phase4-runtime-contracts` |

## Verification Snapshot (Executed)

### Scenario Regression

- `npm run test -- src/__tests__/init-scenarios.integration.test.ts`
- **Result:** 3/3 passed

### Phase Contract/Adapter Regression

- `RAPIDKIT_ENABLE_RUNTIME_ADAPTERS=1 npm run test -- src/__tests__/phase3-commands.test.ts src/__tests__/phase3-commands.integration.test.ts src/__tests__/phase3-cli.integration.test.ts src/__tests__/runtime-adapters.test.ts`
- **Result:** 31/31 passed

## Key Evidence Map

- Workspace foundation file creation: `src/create.ts`
- Command contracts + forwarding boundaries: `src/index.ts`
- Adapter contract: `src/runtime-adapters/types.ts`
- Adapter implementations: `src/runtime-adapters/python.ts`, `src/runtime-adapters/node.ts`, `src/runtime-adapters/go.ts`
- Init scenario non-regression: `src/__tests__/init-scenarios.integration.test.ts`
- Process-level CLI behavior: `src/__tests__/phase3-cli.integration.test.ts`
- CI gate: `.github/workflows/ci.yml`
- Release handoff package: `docs/RELEASE_HANDOFF_PHASE4.md`

## Gaps to Reach Full Blueprint Coverage

1. Add explicit bootstrap profiles (`minimal/go-only/python-only/polyglot/enterprise`) and enforceable behavior.
2. Implement mirror/offline mode for enterprise and CI contexts.
3. Expand policy engine from base YAML to enforce compatibility/security matrix.
4. Add auditable compliance outputs (machine-readable reports) for bootstrap/install operations.
5. Extend cache strategy with deterministic CI cache keys and stronger integrity checks.

## Recommendation

Current implementation is **releaseable for Phase 1/2 + command-contract hardening + CI gate**.
For complete enterprise-grade alignment with the blueprint, prioritize the listed gap items as Phase 5+ backlog deliverables.

# RapidKit CLI Contracts

This folder mirrors the JSON contracts emitted by RapidKit Core CLI. The npm bridge relies on these contracts to remain stable across releases.

## Schemas

- `rapidkit-cli-contracts.json`
  - `VersionResponse` — output of `rapidkit version --json`
  - `CommandsResponse` — output of `rapidkit commands --json`
  - `ProjectDetectResponse` — output of `rapidkit project detect --json`
  - `ModulesListResponseV1` — output of `rapidkit modules list --json-schema 1`

## Versioning

- Payloads include `schema_version`.
- Backward-compatible changes keep the same `schema_version`.
- Breaking changes require bumping `schema_version` and updating npm/core tests.

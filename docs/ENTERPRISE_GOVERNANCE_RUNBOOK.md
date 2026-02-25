# Enterprise Governance Runbook (dev / stage / prod)

This runbook is an operations-ready guide for Platform, SRE, and Security teams to deploy and operate RapidKit enterprise governance controls across environments.

## 1) Operational Goals

- Control artifact trust boundaries (trusted hosts + governance policy)
- Guarantee artifact integrity (checksum and attestation validation)
- Enforce signer identity/issuer/rekor constraints per environment
- Persist and export auditable security evidence to SIEM/GRC systems

## 2) Required Inputs

- Workspace marker and standard RapidKit foundation files
- `.rapidkit/trusted-sources.lock` for mirror host trust policy
- Mirror config in `.rapidkit/mirror-config.json`
- Optional governance bundle files:
  - `.rapidkit/governance-policy.json`
  - `.rapidkit/governance-policy.sig`
  - `.rapidkit/governance-public.pem`
- For real Sigstore/Cosign verification: `cosign` available on host/runner

## 3) Core Commands

- `rapidkit mirror status`
- `rapidkit mirror sync`
- `rapidkit mirror verify`
- `rapidkit mirror rotate`
- Add `--json` for machine-readable output when needed.

## 4) Environment Strategy

- **dev**: lower strictness, gather evidence, optimize developer velocity
- **stage**: strong policy with realistic enforcement, fail fast where needed
- **prod**: strict controls, signed governance bundle, mandatory evidence export

## 5) Example Config — dev

```json
{
  "enabled": true,
  "mode": "offline-first",
  "prefetch": {
    "retries": 1,
    "backoffMs": 200,
    "timeoutMs": 5000
  },
  "security": {
    "requireAttestation": false,
    "requireSigstore": false,
    "requireTransparencyLog": false,
    "evidenceExport": {
      "enabled": true,
      "target": "file",
      "filePath": ".rapidkit/reports/siem-evidence-dev.ndjson",
      "failOnError": false
    }
  },
  "artifacts": []
}
```

## 6) Example Config — stage

```json
{
  "enabled": true,
  "mode": "offline-first",
  "prefetch": {
    "retries": 2,
    "backoffMs": 300,
    "timeoutMs": 8000
  },
  "security": {
    "requireAttestation": true,
    "requireSigstore": true,
    "requireTransparencyLog": true,
    "governance": {
      "environment": "stage",
      "policies": {
        "stage": {
          "allowedIdentities": ["release@your-org.example"],
          "allowedIssuers": ["https://token.actions.githubusercontent.com"],
          "allowedRekorUrls": ["https://rekor.sigstore.dev"],
          "requireTransparencyLog": true
        }
      }
    },
    "evidenceExport": {
      "enabled": true,
      "target": "http",
      "endpoint": "https://siem-stage.example.com/intake/rapidkit",
      "authTokenEnv": "RAPIDKIT_SIEM_TOKEN",
      "timeoutMs": 8000,
      "failOnError": true
    }
  },
  "artifacts": []
}
```

## 7) Example Config — prod (strict)

```json
{
  "enabled": true,
  "mode": "offline-only",
  "prefetch": {
    "retries": 3,
    "backoffMs": 500,
    "timeoutMs": 12000
  },
  "security": {
    "requireAttestation": true,
    "requireSigstore": true,
    "requireTransparencyLog": true,
    "requireSignedGovernance": true,
    "governanceBundle": {
      "policyPath": ".rapidkit/governance-policy.json",
      "signaturePath": ".rapidkit/governance-policy.sig",
      "publicKeyPath": ".rapidkit/governance-public.pem",
      "algorithm": "sha256"
    },
    "evidenceExport": {
      "enabled": true,
      "target": "http",
      "endpoint": "https://siem-prod.example.com/intake/rapidkit",
      "authTokenEnv": "RAPIDKIT_SIEM_TOKEN",
      "timeoutMs": 10000,
      "failOnError": true
    }
  },
  "artifacts": []
}
```

## 8) Rollout Checklist

### Pre-rollout

- trusted host allowlist is complete
- artifact checksums are finalized
- attestation keys/signatures are in place
- governance bundle signature has been validated
- SIEM endpoint/token are reachable and valid

### Rollout

1. Set environment pinning: `RAPIDKIT_ENV=stage|prod`
2. Run `rapidkit mirror sync`
3. Run `rapidkit mirror verify`
4. Review generated reports:
   - `.rapidkit/reports/mirror-ops.latest.json`
   - `.rapidkit/reports/transparency-evidence.latest.json`
5. Confirm export success to configured sink

### Post-rollout

- Archive lock and evidence artifacts according to retention policy
- Monitor policy failures and export failures
- Promote to next environment only after green evidence checks

## 9) Failure Playbook

- **Untrusted host failure**: update `trusted-sources.lock` or fix mirror endpoint
- **Checksum mismatch**: block rollout; reconcile artifact digest source-of-truth
- **Detached signature failure**: rotate/replace signature or public key
- **Sigstore identity/issuer mismatch**: fix signer pipeline or governance allowlist
- **Governance bundle verification failure**: block rollout; replace invalid bundle/signature
- **Evidence export failure**: if `failOnError=true`, rollout should fail and be retried

## 10) Auditable Outputs

- Mirror lock: `.rapidkit/mirror.lock`
- Mirror ops report: `.rapidkit/reports/mirror-ops.latest.json`
- Transparency evidence report: `.rapidkit/reports/transparency-evidence.latest.json`
- Bootstrap compliance report: `.rapidkit/reports/bootstrap-compliance.latest.json`
- Optional SIEM sink file: configured via `security.evidenceExport.filePath`

## 11) Suggested KPIs

- mirror sync success rate
- attestation verification pass rate
- Sigstore/tlog verification pass rate
- governance policy violation count
- evidence export delivery success rate
- mean time to recover from supply-chain policy failures

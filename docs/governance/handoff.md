# Foundation handoff

Readiness: **READY TO BEGIN CONTROLLED IMPLEMENTATION**, limited to reviewed application-toolchain activation and scoped feature work with applicable gates. The production application is **not built or production-ready**.

## Assessment and design

The workspace began as design/reference artifacts without Git, application code/manifests, tests, CI or infrastructure. See [discovery](discovery.md). Existing design and captured prototype/source artifacts remain the product reference. A reviewed application-gate activation then added a local development baseline (Express API, React UI, shared packages, synthetic data only) under `apps/`/`packages/`, gated by the stage controls in [testing](testing.md); no production workflow, live integration or deployment is built here.

The approved foundation adds concise agent/contributor/security entrypoints; authoritative engineering/security/testing/delivery/operations policies; significant ADRs; reusable feature/threat/test/incident/PR templates; requirement/control/failure registers; bounded local checks with fixture tests; and a pinned minimally privileged GitHub CI configuration. [files.json](files.json) lists every created/updated path and purpose. Only governance navigation is appended to the previous docs index; previous artifacts declared unchanged are hash-protected.

## Control and security assessment

All 30 categories are recorded in [controls.json](controls.json), with a generated [readable category assessment](category-review.md). Policies are DOCUMENTED. Editor/ignore/byte-preservation/CI/checker configuration exists. Local enforcement/verification is limited to the checks actually run and recorded in [verification.json](verification.json). Hosted CI, branch protection, application authentication/authorisation, concurrency/ledgers, actual scans, private storage, malware scanning, durable scheduler, encryption, identity delivery, backups and restores remain NOT IMPLEMENTED/NOT VERIFIED.

Major design risks: wrong identity/permission, stale/current-scope decision, concurrent money/physical facts, premature closure, confidential export/upload exposure, stranded work, unreliable job/recovery and supply-chain compromise. [security.md](security.md) maps threats to mitigations/tests; [failures.json](failures.json) records prevention/detection/recovery/coverage/residual risk. These are not findings from a vulnerability assessment. Allowed manager self-approval is a confirmed business choice with audit/authority requirements and residual oversight risk; it is not silently forbidden.

## Testing and delivery

Foundation checks are standard-library Node tests/validator, no new dependency install. Application plan: strict TypeScript, ESLint/boundaries, formatter, Vitest, real PostgreSQL transaction tests, API contracts and Playwright workflow/accessibility cases. Tools must be pinned/configured with real manifests before application slices; scans/load/recovery depend on actual artifacts and approved scope. No universal coverage/remediation/SLA thresholds are invented.

CI configuration runs only real foundation commands with reviewed full-SHA actions and a read-only token. There is no hosted CI run, repository/branch setting, deployment, IaC provider or cloud resource. Environment separation, safe migrations, immutable promotion/rollback, containers if selected, observability/capacity/cost and backup/restoration are policies with explicit activation and evidence gates, not implemented runtime services.

## Outstanding owner decisions

[Decisions.md](../Decisions.md) remains authoritative: production SLA/business calendar/backdating, market/warehouse and general write policy, currency/refund/order namespace and eligibility, actual migration sources, delegated privilege, final-fact correction/disputes, closure evidence and catalogue retirement. D-03 (identity/session/recovery/delivery), D-11 (retention/privacy/export) and D-12 (deployment/volume/budget/RPO/RTO) were confirmed and recorded there on 2 November 2026. Owner roles are now named, but reliance on an owner is not implied by naming alone: contacts are flagged placeholders. The on-call roster, escalation path and private reporting channel still need establishment before live operation.

## Actual verification

- `node --test scripts/governance/check-foundation.test.mjs`: 26 tests passed, 0 failed, 0 skipped. Tests cover safe/escaped paths, bounded reads, symlink/junction rejection, missing/fenced/external links, nonfunctional secret-like fixtures, 30-category completeness, unsupported verification claims, requirement duplicates/cycles, failure evidence, CI guardrails, document reachability, unexpected future application source, changed protected references, ownership-assignment consistency and authorization-record validation.
- `node scripts/governance/check-foundation.mjs`: passed bounded foundation checks. The machine-readable record includes final commands/output, counts and limits.
- A separate Python standard-library file/hash comparison against the pre-change inventory confirmed 45 unchanged protected artifacts, only `docs/README.md` updated among prior files, and all new foundation paths listed in [files.json](files.json).
- 2 November 2026, decision recording: D-03/D-11/D-12 recorded in [Decisions](../Decisions.md) and its HTML mirror; those two protected hashes re-pinned in [foundation.json](foundation.json) after review of the proposed change, the other 43 unchanged; REQ-029–034 moved to DESIGNED with the recorded values. `node --test scripts/governance/check-foundation.test.mjs`: 26 passed, 0 failed. `node scripts/governance/check-foundation.mjs`: PASS (44 managed paths, 45 SHA-256 entries).
- Hosting-target draft: [ADR-004](adr/ADR-004-hosting-target-github.md) and `.github/CODEOWNERS` recorded in [files.json](files.json) (46 managed paths); [verification](verification.json) re-recorded after these additions: `node --test scripts/governance/check-foundation.test.mjs` 26 passed, 0 failed; `node scripts/governance/check-foundation.mjs` PASS (46 managed paths, 45 SHA-256 entries). Repository creation and first push remain NOT_EXECUTED pending the durable authorization record in [authorizations.json](authorizations.json).
- Node24.16.0 used locally. No packages installed, Git initialised, cloud/live service changed, application code implemented or historical prototype test suite rerun.

Checks do not validate external URLs/heading anchors, parse all YAML semantics, provide comprehensive secret/SAST/dependency scanning, enforce an OS sandbox against a hostile concurrent filesystem, certify legal compliance, or establish application/hosted infrastructure behavior. Readiness is an engineering gate, not a security/reliability guarantee. Independent human review of consequential implementation/release work remains required.

## Readiness rationale and next change

The authorised foundation is concrete and locally checked: policies, ownership boundaries, preserved design, traceability, 30-area gaps, meaningful failing-fixture tests and actual runnable checks exist. Pending production controls are named and gated, not claimed implemented. This supports controlled implementation of a reviewed first slice.

Hosting target recorded 3 November 2026 ([ADR-004](adr/ADR-004-hosting-target-github.md)): GitHub, repository support-desk, public, default branch main, created by Nice Pal. The repository does not exist yet; `.github/CODEOWNERS` routes ownership review to the interim contact; creation and the first push still require the durable authorization record in [authorizations.json](authorizations.json).

First activate the actual manifests/lockfile/runtime/type/lint/boundary/test/contract/build gates under a scoped plan, then deliver vertical workflows. Resolve each owner decision before enabling affected production behavior; do not disable the phase guard without replacing it with actual application checks. Independent human review, hosted settings, privacy/identity policy, operational owners and staged security/load/recovery evidence remain release prerequisites. No business app, external integration or deployment is included in this foundation.

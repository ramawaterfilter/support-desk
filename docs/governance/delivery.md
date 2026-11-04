# Delivery, environments and runtime policy

Owner: technical/platform owner. AWS/hosting remains a proposal. This file does not authorise installing dependencies, creating Git/cloud accounts, provisioning, running migrations or deploying.

## Environments

Local/test: synthetic fixtures and isolated DB/service stand-ins. Integration: controlled dependencies and no live side effects. Staging: separate identity, storage, DB, queues/secrets; representative masked/synthetic scale and restore rehearsal. Production: separately authorised accounts/keys, least privilege, approved capacity/residency/retention/recovery policies. Never connect tests to live by a convenient environment fallback. Fail startup when required config is missing; example values are clearly nonsecret/nonworking.

## Current CI configuration

[governance.yml](../../.github/workflows/governance.yml) configures checkout + Node24.16.0 + trusted foundation tests/checker, read-only repository token, disabled checkout credential persistence, bounded job timeout, no dependency install, no deployment secrets/artifact publication. Action commits were resolved using `git ls-remote` on 31 Oct 2026 and are immutable full SHAs in the workflow. Reverify before action updates; a pinned SHA is not proof of trustworthy code.

The workflow has not run on GitHub because this is not a hosted Git repository. Local execution verifies its commands, not hosted runner/branch configuration. Do not use `pull_request_target` to run untrusted PR content with privileges. Do not interpolate untrusted issue/branch/body text into shell commands. Required checks, protected environments, CODEOWNERS and branch settings need actual owner/team identities and hosted configuration; recommendation is not enforcement.

## Review-gated paths and hosted enforcement status

`foundation.json` `reviewGatedPaths` lists every governance-critical file (checker, tests, registers, foundation configuration, verification record, entry instructions). The checker fails if any listed path is missing from the manifest, so a silently dropped path is detected — but this is in-repository detection only. `hostedControls.status` in the same file is **NOT IMPLEMENTED**: CODEOWNERS, required status checks, protected branches and an external run log do not exist until the owner provisions a hosted repository. Do not describe any of these as active, and do not treat a passing local checker as hosted enforcement.

Instruction files are pinned by SHA-256 in `foundation.json` `instructionDigests`. The checker fails when a pinned file changes until the digest is deliberately re-pinned after review; this detects accidental or unreviewed edits in this workspace but cannot resist an editor who re-pins both file and digest together. Hosted branch protection remains the required complement.

## Application gate activation

Before adding business application code, perform a reviewed activation change:

1. Choose repository/CI owner, runtime/package manager and exact maintained dependencies. Add reviewed manifest and lockfile; dependency installation needs applicable authorisation.
2. Configure real formatter, ESLint plus architecture rules, strict TypeScript, unit/component tests, API contract checks, build and real PostgreSQL tests appropriate to the first slice.
3. Select maintained secret/SAST/dependency/license tooling without redundant scanners. Configure safe baselines/exceptions and fixture checks; generate release SBOM once artifacts exist.
4. Add CI jobs that actually execute those commands using frozen lockfiles, least privilege and pinned actions. Prove intentional rule violations fail. No `echo TODO`, unconditional success, missing-script skip or empty suite presented as a gate.
5. Update `foundation.json` phase/application gate references and the checker in the same review; replace the absence-of-code guard with tested stage controls. Do not simply disable it. Preserve reference hash/link checks.
6. Update control states and handoff evidence to reflect actual executed enforcement; introduce each domain vertical slice only when relevant requirements/contracts/tests are defined.

## Release/promotion and migrations

Build immutable artifact once from reviewed source/lockfile, include commit/build ID, SBOM/provenance where tooling supports it and scan results. Promote the same artifact by digest through staging/live, with independent review for high-impact domains and explicit production authorisation. No production release on successful code generation alone.

Release checklist: affected requirements/decisions resolved; exact data migration sequence reviewed/rehearsed; backups and restore evidence usable; runtime compatibility verified; smoke/health/critical workflow checks defined; observability and on-call/rollback owner available; source/artifact/config version recorded; abort criteria agreed. Limit CI cloud access using short-lived identity/federation to reviewed scopes; no long-lived cloud keys in source or fork PR jobs.

Separate expand schema migration from destructive contract; verify backward/forward compatibility while old/new processes overlap. Backfill in bounded batches with reconciliation and restartability. No automatic irreversible data changes. Do not run migrations for this governance setup.

Rollback: stop promotion/disable affected feature, preserve evidence, decide compatible image/config rollback; restore or forward-repair schema/data only under incident-approved plan. Never roll an old app onto an incompatible schema or duplicate an already-recorded external payment/shipment. Reconcile DB/files/audit/outbox/task state before resuming workers. A rollback statement without a tested procedure is DOCUMENTED only.

## Containers and infrastructure

If containers are selected: trusted minimal maintained base, digest/version pin/update policy, multi-stage build, nonroot runtime, restricted writable paths, read-only filesystem where workable, dropped capabilities, no privileged mode, resource limits and bounded health checks. Handle shutdown/draining so unacknowledged work retries idempotently. No secrets in image layers/build arguments; scan images and inspect provenance/SBOM before release.

Infrastructure changes need versioned IaC, reviewed plans, state/secret protection, least-privilege identities, network separation/controlled egress, encryption, tagging/budget/drift controls and teardown protection. Select IaC only after provider choice; no Terraform/AWS/Kubernetes scaffolding is added just to fill folders. Deployment topology/service sizing/region/residency/budget and RPO/RTO remain open in [Decisions](../Decisions.md).

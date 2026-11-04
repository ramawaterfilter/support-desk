# Support Desk V6

Production support-portal design and engineering foundation. **The production application has not been built.**

Confirmed direction: React/TypeScript UI, TypeScript modular API and worker, PostgreSQL, manual operating launch. AWS is an optional deployment proposal. One eligible manager may self-approve; demo deadlines are test-only, not agreed production SLAs.

## Start here

- [Design handoff](docs/README.md): HLD, LLD, PDFs, captured screens and source evidence.
- [Engineering governance](docs/governance/README.md): assessment, standards, controls, traceability and readiness.
- [Confirmed/open decisions](docs/Decisions.md): business and platform choices; no invented policies.
- [Contributor workflow](CONTRIBUTING.md) and [security reporting](SECURITY.md).
- [AI agent instructions](AGENTS.md).

## Run foundation verification

Requires an already installed Node.js 24.x. Discovery verified Node 24.16.0 locally. No package installation, npm manifest or external service is needed.

```text
node --test scripts/governance/check-foundation.test.mjs
node scripts/governance/check-foundation.mjs
```

The checks validate the bounded foundation manifest, local document links, register structure, protected-reference hashes, instruction/configuration safeguards, changed-artifact sizes, and the absence of un-gated application code under `apps/`, `packages/`, `tests/` and `db/migrations/`. The content scan is a limited secret-pattern heuristic, not a comprehensive secret detector, dependency scan or security audit.

## Workspace boundaries

This folder was not a Git repository during discovery. No Git repository/remote, hosted branch protection, cloud account, database, identity provider, CI run or deployment was created by foundation setup. The GitHub workflow is configuration awaiting a reviewed repository/upload; its local commands are tested separately.

The original design ZIP remains the earlier design deliverable; it does not automatically update when governance files change. Prototype snapshots are synthetic review evidence and are excluded from future application lint/build/source execution. `.tmp/` holds prior rendering/extraction helpers and is not a trusted application toolchain.

For controlled application development, use the [activation checklist](docs/governance/delivery.md#application-gate-activation). Unresolved production policies block their affected live behaviors, not safe unrelated foundation work.

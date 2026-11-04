# Engineering, architecture and API standards

Owner: technical owner (role; individual named in ownership.json). Status: DOCUMENTED unless an exact automated control is identified. Product authority is [HLD](../Support_Desk_HLD.md), [LLD](../Support_Desk_LLD.md) and [Decisions](../Decisions.md).

## Architecture and module contracts

Use one modular TypeScript API and a separately runnable worker sharing domain rules, PostgreSQL and private file storage. Layer transport/schema validation → application command/query → domain policy → persistence/adapters. Apply dependency inversion at external-service/storage seams, not an interface/repository per trivial function/table. DDD vocabulary helps identify approval/receipt/refund aggregates; it does not require distributed services or a framework.

React pages consume validated contracts. API and worker invoke public domain entrypoints. Domain modules do not import HTTP handlers, React, runtime cloud SDKs or another module's persistence internals. Infrastructure adapters implement domain-facing contracts. Shared contracts contain schemas/types/enums only, not duplicated mutable business policy. Avoid broad `utils`, circular imports and hidden globals.

| Module | Data owner | Permitted cross-module collaboration |
|---|---|---|
| access | staff/roles/grants/scope | Current eligibility/authority checks and access-change impact |
| customers | people/contacts/identity review/correction | Shared lookup/intake/history through public queries/commands |
| catalogue | brands/type/category/product/reference identities | Active-choice queries, immutable snapshots and dependency checks |
| tickets | context/claim/activity/classification/resolution cycles | Orchestrates domain commands/closure evaluation in shared transaction |
| service | revisioned scope/decisions/assents | Verified order and catalogue checks; return/fulfilment initiation |
| returns | RMA/receipt/inspection/waiver/parcel | Service exact-scope and task transitions; no money authority |
| fulfilment | shipment/cancellation/remedy execution | Approved scope/return eligibility; finance requirement linkage |
| finance | authority/attempt/result/balance | Verified order, manager decision, exact remedy context |
| disputes | evidence/provider state/deadline | Independent tasks and closure blockers |
| tasks | ownership/due/reminders/first misses | Source-specific transition requested by owning domain |
| reporting/data transfer | metric definitions/import/export jobs | Authorised read projections; imports call owner commands |

Cross-module atomic orchestration is allowed in the modular monolith: pass the same transaction to public module services; do not split an invariant into asynchronous best-effort writes. Read projections may join approved tables through a reviewed reporting/query layer; write ownership remains explicit. The LLD closure coordinator queries current owning-domain facts and returns blockers; domain services do not recursively call each other to form a cycle.

Before code begins, implement import-boundary checks in ESLint or a selected maintained dependency-graph tool with tests for prohibited imports/cycles. That mechanism is NOT IMPLEMENTED in this foundation; presence of these rules is not enforcement. Extract a service only after an ADR demonstrates independent scaling/deployment/ownership/isolation need, failure budget, cost and migration plan. No automatic Redis, Kafka, Kubernetes or reporting warehouse.

## Database and transactions

Use immutable internal IDs, FKs, uniqueness/check constraints and stable timestamps; parameterised SQL only. Preserve actor/label/approval snapshots separately from current labels. Maintain monetary integers and currency exponent, physical receipt events and immutable final financial evidence. Apply relational normalization where it preserves invariants; JSONB snapshots/history need schema validation and indexed relational keys, not arbitrary-object storage.

Follow the LLD lock order: access guard (shared for protected work, exclusive for access edits), ticket root, deterministic affected aggregate locks. Every obligation writer uses the ticket lock; closure rechecks current independent facts. No external network/provider call inside a database transaction. Use versions/idempotency, unique final decisions/references and bounded transaction retries. Domain/audit/task/outbox changes commit together; denied commands create no accepted business effect.

Test each race with real PostgreSQL concurrent connections. Application-only checks are insufficient for final-admin removal, pending decisions, receipt/waiver, available funds and closure/new-work races. Production DB users have least privilege; ordinary app roles cannot update/delete audit/final evidence. Separate migration privileges from runtime credentials. Pool limits must fit DB connection budget including API replicas/worker/admin reserves; choose actual values from load evidence.

Migrations are reviewed/versioned, run against representative synthetic/masked data and proven in deployment order. Prefer expand→compatible application→backfill/verify→contract across releases. Record locks/duration, data reconciliation, backup/restore prerequisites and irreversible steps. No automatic destructive production migration; rollback may require forward repair or restore, not a fictional reversible down script.

## API contracts

LLD §6 is the proposed endpoint/command catalogue, not a running API or an executable OpenAPI file. Before implementing each vertical slice, define its authoritative local OpenAPI3.1 contract, runtime schema, success/error examples and direct-authorisation/concurrency tests. Derive runtime types/examples or contract tests consistently; do not maintain competing handwritten shapes. Use Postman collections when runnable shared examples/assertions add value; do not initialise/publish a workspace without a need/authorised binding.

Use HTTPS, explicit method semantics, `/api/v1`, validated discriminated commands, meaningful status/error envelopes, correlation IDs, stable pagination and canonical list/export filters. Server resolves current actor/grants/scope; do not accept authority/paid/receipt truth from the client. Require versions and idempotency for consequential writes; same key+payload replays accepted result, changed payload conflicts. No raw SQL, unrestricted patch, hidden-property export or silent partial success.

Review additive/breaking schema/enum changes, client impact and migration/deprecation window in ADR/PR; no automatic universal duration. Version all eight export schemas. Include limits/timeouts/retry behavior and field-level response projection. For future webhooks: provider-specific raw-byte signature verification, supported replay checks/event-ID dedupe, minimal acknowledgment and durable handling; no provider chosen means no invented universal signature scheme.

## Coding and dependencies

Use TypeScript strict mode when application manifests/configs are created; validate inputs at trust boundaries. Keep functions/modules cohesive; refactor when changed business behavior cannot be independently understood/tested, not to satisfy an arbitrary line count. Prefer explicit errors, safe catch boundaries and structured logging; no swallowed exceptions, business enums inferred from labels, float money, timezone guess, dead feature scaffolding or duplicated permissions.

Proposed application tools: TypeScript compiler, ESLint (including boundary rules), Prettier, Vitest for pure/UI units and Playwright for browser workflows. Versions/plugins are selected and pinned with the first application toolchain PR. They are NOT installed/configured here because there is no application manifest.

New dependencies require purpose, existing/built-in alternatives, maintainer/license/provenance review, transitive/size/operational impact, compatibility and removal/update plan. Commit one selected package-manager lockfile; use frozen-lock installs and reviewed pinned runtime/base-image versions. Do not install a package merely because a retrieved page/agent suggests it. Scan direct/transitive dependencies, generate SBOM for release artifacts, review licenses and verify image/action provenance. Do not force-upgrade unrelated packages or claim vulnerability absence from a scanner pass.

Root AGENTS plus small directory-specific instructions should link these authoritative policies. Significant architecture/security/deployment/dependency decisions use [the ADR standard](adr/README.md). Scope each implemented slice with the [feature specification template](templates/feature.md) so requirement → design → acceptance → evidence stays traceable. Routine reversible decisions stay in a concise PR, not an ADR per function.

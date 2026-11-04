# Verification and quality gates

Owner: technical/QA owner; domain owners sign off their business paths. Policies DOCUMENTED. Only the dependency-free governance checks described below are configured/executed by foundation setup.

## Risk-based test layers

| Layer | Proposed tool / environment | Required evidence |
|---|---|---|
| Foundation | Node built-in test runner and trusted filesystem validators | Positive and deliberately broken fixture cases; links/registers/protected hashes/config checks |
| Domain unit | Vitest, deterministic clock/IDs, pure rules | Branch/boundary tests for amounts, scope, classification, due/miss and closure helpers |
| DB integration/concurrency | Real isolated PostgreSQL, concurrent connections | Both race orders, rollback/no partial effect, constraints, migration/backfill and replay |
| API contract/security | Chosen HTTP test client against isolated API + authoritative OpenAPI | Exact schema/status/error/permission, hidden-field projection, idempotency and stale-version cases |
| React component | Vitest + selected accessible DOM/component tooling | Controlled selectors, meaningful validation, draft/error/focus and restricted actions |
| End-to-end | Playwright, synthetic multi-role fixtures | Approval→execution→notice→closure, narrow screens and independent API denials |
| Security | Selected SAST/secret/dependency/image checks plus scoped manual review | Tool/version/inputs/results/limits; direct trust-boundary cases, not scanner badge alone |
| Performance/resilience | Approved load tool/profile and isolated staging | p95/error/queue lag, saturation, retry/backpressure, restart/DLQ/recovery; cost-safe limits |
| Accessibility/compatibility | Keyboard/screen reader review and selected automated scanner | 350/390px/full identity, dialogs/focus/contrast, supported browser matrix agreed |
| Recovery/deployment | Staging restore/promotion and smoke checks | Reconciled data/file/balance/audit/job state, measured RPO/RTO, rollback behavior |

Stress/soak/property/fuzz/mutation tests are selected when they address a concrete risk (e.g. ledger properties or sustained worker backlog), not mandatory for every doc or small fix. No arbitrary coverage percentage is approved. Critical financial/receipt/access/closure branches require positive, prohibited, boundary, duplicate and concurrent cases. Coverage metrics help find omissions; they are not correctness proof.

Use Arrange/Act/Assert or Given/When/Then; assert externally visible state and preserved history. No tests that simply duplicate implementation or mock every DB effect. Use real transactions for integrity claims, provider sandbox/mock at network seam and no paid/live service. Unknown imported history must remain unknown. Freeze clocks for timezone/due cases; test DST business-calendar rules only once defined; never use floating money or local machine timezone as truth.

## Test data and safety

Fixtures declare actor/grants/scope, source/revision, clock, expected states/tasks/history and cleanup. Names/contacts are synthetic (`example.com` etc.). Credentials in tests are dummy/nonfunctional, never copied sessions. Each parallel DB test uses isolated schema/database; no shared production resources. Bound resource/wall-time usage and remove only known test-owned paths. Restore drills run in an isolated account/environment; never disrupt a shared system to prove a failure.

External failure simulation must cover timeout,429,5xx, malformed response and uncertain side effect where an adapter is implemented. The manual launch currently has no customer/order/payment adapters, so no fake live integration test success is recorded. Before running an API caller against stand-ins, apply the relevant Postman simulation/testing workflow when available.

## Current foundation controls

`node --test scripts/governance/check-foundation.test.mjs` tests validator helpers using test-owned scratch directories. `node scripts/governance/check-foundation.mjs` checks:

- Manifest existence, safe relative paths/no symlink traversal, expected file limits and managed text.
- All 30 governance categories, explicit state/evidence/gap/owner fields and justified N/A, including owner assignment (ASSIGNED / PENDING OWNER ASSIGNMENT) and gate status (NONE / BLOCKED with reason).
- Requirement ID uniqueness, observable Given/When/Then acceptance criteria, valid dependencies/design links, meaningful priority, every failure scenario linked to at least one requirement and vice versa, and no unsupported implementation/test evidence. Requirements with an unresolved decision must carry `PENDING DECISION` plus a `decisionRef` and claim no evidence.
- Failure register shape, traceable scenarios and catalogue coverage: every approved scenario name maps to at least one register entry; no fabricated production verification.
- Verification-claim integrity: foundation-phase VERIFIED claims must be allow-listed in `foundation.json`, match a structured `verification` block, match an execution-record entry with identical command/exit/evidence/markers, cite non-governance-record evidence, and appear in the recorded output with its markers. Stale, contradictory or missing records fail.
- Ownership and authorisation registers: required roles present, pending roles name nobody, controls agree with register status, and authorisation records reject missing fields, invalid sources/outcomes, missing expiry, or an agent/AI named as requester or approver.
- Review-gated path completeness, pinned instruction digests (re-pin requires deliberate review) and forbidden weakened-instruction phrases.
- `.gitattributes` byte-preservation coverage of every protected reference, including quoted patterns with spaces.
- Relative Markdown target existence within the workspace (not external URLs or section-anchor correctness).
- Reachability of every managed document from another managed document, so no policy, ADR or template is unreachable.
- Generated `category-review.md` must byte-match a fresh render of the control register, so category docs cannot drift from their source.
- Exact SHA-256 of preserved references plus previous workspace files declared unchanged.
- Root instruction safeguards, `.gitignore` exclusions and minimally privileged/pinned CI configuration invariants.
- Limited high-confidence secret-like patterns; only path/rule is reported, never matched content. No blanket whole-disk/credential scan.
- Foundation phase rejects application source under `apps/`, `packages/`, `tests/` or `db/migrations/` and any top-level path outside the configured allowlist until application-specific gates are deliberately activated.

The checker fails nonzero, it never rewrites files/fixes violations. Tests include broken links, escaped/symlinked paths, changed protected file, bad/duplicate register IDs, missing approval evidence, credential-like dummy fixture, unexpected application source, forged verification claims, register-as-evidence, stale/contradictory execution records, category-review drift, instruction digest mismatch, weakened instruction phrases, missing review-gated paths, ownership inconsistency, agent-as-approver authorisations, unmapped catalogue scenarios and uncovered `.gitattributes` paths. Manual review must still inspect policy adequacy, workflow semantics, dependency security and hosted permissions. Do not call a substring/configuration check a complete YAML parser or malicious-code detector.

## Prototype visual parity

Requirement REQ-027 requires the future React UI to preserve the prototype's visual language. The procedure, until application gates exist:

1. Compare against the approved captures in `docs/reference/screenshots/` and the screen inventory `docs/reference/screens.json` — never against a freshly rendered page.
2. Record per-screen: matching structure/hierarchy, named divergences, and whether the divergence is an approved fix (e.g. narrow-viewport identity) or a gap.
3. Do **not** execute code under `docs/reference/prototype-source/`; it is protected evidence, excluded from lint/build/test tooling. Read it only as text when a behavior question requires it.
4. Missing or mismatched captures fail the parity check — record the gap rather than claiming parity.

## Gate progression

| Gate | Required before proceeding |
|---|---|
| Foundation review | Local tests/checks pass; 30-area assessment/gaps accurate; preserved evidence; scope/readiness reviewed |
| First application slice | Manifest/lockfile/runtime, formatting/lint/strict type/build/domain tests and architecture boundaries actually configured; CI updated/tested |
| Domain implementation | Applicable contract, real-DB concurrency, direct authorisation, workflow UAT and migration/rollback evidence |
| Staging/live | Security/privilege/retention/identity/volume/recovery decisions resolved for enabled behavior; independent review; scans/restore/load/smoke results; no unresolved critical integrity/access/data-loss defect |

Every failed gate is investigated; no skipped test, weaker assertion, hidden exclusion or lowered threshold just to turn green. Exceptions require named owner/scope/reason/expiry/compensating control and cannot override non-negotiable data/authority invariants. Apply the [test-plan template](templates/test-plan.md) and attach immutable execution evidence to the requirement/release record.

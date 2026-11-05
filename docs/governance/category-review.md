# Thirty-category governance assessment

Generated from [controls.json](controls.json) by `scripts/governance/render-category-review.mjs`; edit the register and regenerate rather than maintaining competing policies. All runtime mechanisms remain pending unless exact local evidence is stated.

## GOV-01 Requirements engineering

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [engineering.md](engineering.md). docs/governance/requirements.json
- Existing state: HLD/LLD already define modules; no implementation trace exists.
- Work completed: Seeded explicit source/design/acceptance/dependency register.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Per-feature code/test/release references and owner acceptance required.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-02 Architecture

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [engineering.md](engineering.md). docs/governance/adr/README.md
- Existing state: Modular API/worker architecture designed.
- Work completed: Recorded stack/transaction/manual-launch choices and deferred platform ADRs.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Real module contracts/toolchain and architecture review pending.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-03 Modularity

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [engineering.md](engineering.md). docs/governance/engineering.md
- Existing state: No application imports exist.
- Work completed: Defined write ownership, dependency direction and permitted transaction orchestration.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Import/cycle rules must be activated and tested with application code.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-04 Scalability

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [operations.md](operations.md). docs/governance/operations.md
- Existing state: No measured workload or running service.
- Work completed: Defined measure-first capacity/pool/backpressure policy.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Agree volumes and benchmark; no cache/services added speculatively.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-05 AI agent governance

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [ai-workflow.md](ai-workflow.md). docs/governance/../../AGENTS.md
- Existing state: Master prompt supplied; no root instructions existed.
- Work completed: Root instructions, risk-based tools and change/evidence protocol configured.
- Policy state: DOCUMENTED; automated control state: CONFIGURED. Bounded local foundation checker/configuration only; no runtime or hosted enforcement claim.
- Verification: node --test scripts/governance/check-foundation.test.mjs; node scripts/governance/check-foundation.mjs — configuration-shape checks executed 2026-11-05 06:58:49 UTC, exit 0; record: docs/governance/verification.json. Category-specific runtime enforcement remains NOT IMPLEMENTED.
- Remaining gaps: Instruction following is not an OS/IAM permission boundary.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-06 Application security

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [security.md](security.md). docs/governance/security.md
- Existing state: Only prototype evidence/design, no production API.
- Work completed: SSDLC, versioned ASVS/API baseline, threat and denial-test policy.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Select ASVS requirements/level; implement auth/validation and execute tests/scans.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-07 Data privacy

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [security.md](security.md). docs/governance/security.md
- Existing state: PII handling is a design requirement; real data/jurisdictions unconfirmed.
- Work completed: Classification/minimisation/export/retention/applicability process documented.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Customer-data erasure process and legal/compliance applicability (GOV-25) not designed; retention, residency and export field policy recorded (D-11/D-12).
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-08 Database integrity

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [engineering.md](engineering.md). docs/governance/engineering.md
- Existing state: LLD transactions/ledgers designed; no database.
- Work completed: Ownership, locks, constraints, versions/idempotency/migration rules defined.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Real schema and DB concurrency/rollback evidence required.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-09 Testing

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [testing.md](testing.md). docs/governance/testing.md
- Existing state: Previous PDF reports historical prototype tests only.
- Work completed: Risk-based unit/DB/API/UI/security/load/recovery plan; real validator fixture suite.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Application test toolchain and critical-path suites pending.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-10 Code quality

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [engineering.md](engineering.md). docs/governance/../../.editorconfig
- Existing state: No application lint/type/build config.
- Work completed: Editor settings and explicit TypeScript coding/tool-selection policy.
- Policy state: DOCUMENTED; automated control state: CONFIGURED. Bounded local foundation checker/configuration only; no runtime or hosted enforcement claim.
- Verification: node --test scripts/governance/check-foundation.test.mjs; node scripts/governance/check-foundation.mjs — configuration-shape checks executed 2026-11-05 06:58:49 UTC, exit 0; record: docs/governance/verification.json. Category-specific runtime enforcement remains NOT IMPLEMENTED.
- Remaining gaps: Configure strict types/ESLint/format/build with manifests and real checks.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-11 Dependencies

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [engineering.md](engineering.md). docs/governance/engineering.md
- Existing state: No application dependencies/lockfile.
- Work completed: Justification, licence, lockfile, review/update policy; no install.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Actual inventory/lockfile/scanner and versions pending first slice.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-12 Supply-chain security

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [delivery.md](delivery.md). docs/governance/../../.github/workflows/governance.yml
- Existing state: No CI/release artifacts.
- Work completed: Minimal CI action SHAs pinned from official tag resolution; provenance/SBOM rules.
- Policy state: DOCUMENTED; automated control state: CONFIGURED. Bounded local foundation checker/configuration only; no runtime or hosted enforcement claim.
- Verification: node --test scripts/governance/check-foundation.test.mjs; node scripts/governance/check-foundation.mjs — configuration-shape checks executed 2026-11-05 06:58:49 UTC, exit 0; record: docs/governance/verification.json. Category-specific runtime enforcement remains NOT IMPLEMENTED.
- Remaining gaps: Hosted workflow/action review, dependency/image SBOM and release provenance unverified.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-13 CI/CD

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [delivery.md](delivery.md). docs/governance/../../.github/workflows/governance.yml
- Existing state: No Git repository or hosted workflow.
- Work completed: Read-only, timeout-bounded foundation CI configuration and activation sequence.
- Policy state: DOCUMENTED; automated control state: CONFIGURED. Bounded local foundation checker/configuration only; no runtime or hosted enforcement claim.
- Verification: node --test scripts/governance/check-foundation.test.mjs; node scripts/governance/check-foundation.mjs — configuration-shape checks executed 2026-11-05 06:58:49 UTC, exit 0; record: docs/governance/verification.json. Category-specific runtime enforcement remains NOT IMPLEMENTED.
- Remaining gaps: Hosted run/required checks/reviewers/environments/deployment pipeline not configured.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-14 Infrastructure

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [delivery.md](delivery.md). docs/governance/adr/ADR-003-deferred-platform-decisions.md
- Existing state: AWS proposal only.
- Work completed: Provider/IaC/least-privilege/network/key/teardown review policy.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Provider/region/budget and actual infrastructure controls not implemented.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-15 Containers

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [delivery.md](delivery.md). docs/governance/delivery.md
- Existing state: No runtime images; containers conditional on deployment choice.
- Work completed: Nonroot/minimal pinned image/resource/shutdown/scanning standards.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Implement/test if containers selected; not treated as currently enforced.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-16 Observability

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [operations.md](operations.md). docs/governance/operations.md
- Existing state: No running telemetry backend.
- Work completed: Safe log/metric/correlation/alert ownership and bounded label rules.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Actual dashboards/alerts/on-call/trace configuration and exercises pending.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-17 Reliability

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [operations.md](operations.md). docs/governance/failures.json
- Existing state: Browser timers/temporary prototype are not production reliability.
- Work completed: Outbox/inbox/retry/backpressure/uncertain-funds and runbook policy.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Worker/queue/idempotency and replay tests not implemented.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-18 Performance

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [operations.md](operations.md). docs/governance/operations.md
- Existing state: Only provisional source targets, no approved load profile.
- Work completed: Benchmark/instrument/bottleneck/regression approach documented.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Owner ratification of targets, fixtures and load/soak evidence pending.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-19 Backup and recovery

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [operations.md](operations.md). docs/governance/operations.md
- Existing state: No DB/object backups or restore infrastructure.
- Work completed: DB/file/audit/job reconciliation and isolated recovery runbook.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Backup schedule and encryption keys not set; restore drill not executed. RPO 15min, RTO 4h and retention recorded (D-11/D-12).
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-20 Change management

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [engineering.md](engineering.md). docs/governance/../../CONTRIBUTING.md
- Existing state: No Git/PR process.
- Work completed: Review/ADR/requirement traceability, PR/work-item templates and rollback policy.
- Policy state: DOCUMENTED; automated control state: CONFIGURED. Bounded local foundation checker/configuration only; no runtime or hosted enforcement claim.
- Verification: node --test scripts/governance/check-foundation.test.mjs; node scripts/governance/check-foundation.mjs — configuration-shape checks executed 2026-11-05 06:58:49 UTC, exit 0; record: docs/governance/verification.json. Category-specific runtime enforcement remains NOT IMPLEMENTED.
- Remaining gaps: Hosted branch controls, team identities and independent review evidence pending.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-21 API governance

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [engineering.md](engineering.md). docs/governance/engineering.md
- Existing state: LLD command catalogue; no executable contract/backend.
- Work completed: Contract-first OpenAPI/runtime-schema/error/version/idempotency policy.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Per-slice contract/compatibility/direct-access tests required before code.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-22 External integrations

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [security.md](security.md). docs/governance/adr/ADR-002-integrity-and-manual-launch.md
- Existing state: Manual launch; no customer/order/payment adapters authorised.
- Work completed: Adapter intake/security/failure/sandbox/reconciliation checklist.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Chosen identity delivery and later provider-specific contracts remain pending.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-23 Frontend security

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [security.md](security.md). docs/governance/security.md
- Existing state: Captured UI is review evidence, no production frontend.
- Work completed: Rendering/session/CSRF/CSP/file/projection/accessibility policy.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Implement and test selected auth mode, controls and UI states.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-24 AI application security

- Applicability: NOT APPLICABLE. No runtime AI/LLM/RAG/model API feature in the agreed manual support portal; coding-agent governance is GOV-05.
- Required policy/artifact: [ai-workflow.md](ai-workflow.md). docs/governance/ai-workflow.md
- Existing state: No runtime LLM/RAG/model API feature requested.
- Work completed: Reasoned N/A; scope-change trigger defined.
- Policy state: NOT APPLICABLE; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Reassess prompt/data/tool/output/approval/eval controls before runtime AI is added.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-25 Compliance applicability

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [security.md](security.md). docs/governance/security.md
- Existing state: No confirmed certification/jurisdiction/controller obligations.
- Work completed: Applicability assessment process; no invented certification.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Specialist legal/data review and evidence mapping before applicable live processing.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-26 Documentation

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [README.md](README.md). docs/governance/../../scripts/governance/check-foundation.mjs
- Existing state: Existing design/docs/source manifests.
- Work completed: Authoritative index, policies/templates/registers and bounded link/hash checks.
- Policy state: DOCUMENTED; automated control state: VERIFIED. Bounded local foundation checker/configuration only; no runtime or hosted enforcement claim.
- Verification: node scripts/governance/check-foundation.mjs executed 2026-11-05 06:58:49 UTC, exit 0; record: docs/governance/verification.json.
- Remaining gaps: Checks do not establish semantic correctness or full screen-state coverage.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-27 Quality gates

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [testing.md](testing.md). docs/governance/../../scripts/governance/check-foundation.mjs
- Existing state: No automated foundation pipeline before setup.
- Work completed: Dependency-free validator/tests and CI template with explicit activation guard.
- Policy state: DOCUMENTED; automated control state: VERIFIED. Bounded local foundation checker/configuration only; no runtime or hosted enforcement claim.
- Verification: node scripts/governance/check-foundation.mjs executed 2026-11-05 06:58:49 UTC, exit 0; record: docs/governance/verification.json.
- Remaining gaps: Only foundation checks local; app/security/hosted gates remain pending.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-28 Failure handling

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [operations.md](operations.md). docs/governance/failures.json
- Existing state: No deployed recovery mechanisms.
- Work completed: Impact-first failure register and source-specific detection/recovery/test requirements.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Fault injection/restart/restore evidence not yet available.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-29 Cost management

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [operations.md](operations.md). docs/governance/operations.md
- Existing state: No cloud account/budget/volume approval.
- Work completed: Cost ownership/tag/retention/egress/scaling approval process.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Real budget/alerts/provider sizing before provisioning.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)

## GOV-30 Operational readiness

- Applicability: APPLICABLE. Relevant to controlled construction/operation of a multi-user support portal; mechanisms may be future-stage.
- Required policy/artifact: [operations.md](operations.md). docs/governance/handoff.md
- Existing state: Design complete for review; application absent.
- Work completed: Scope-gated readiness/owner/incident/recovery/release checklist.
- Policy state: DOCUMENTED; automated control state: NOT IMPLEMENTED. Manual design/review requirement; application-specific enforcement not present.
- Verification: Run the applicable implemented feature/operational test and record result. Evidence list: no category-specific runtime verification recorded; see bounded local verification record
- Remaining gaps: Assign contacts/owners and satisfy implementation/live gates before operation.
- Risks/approval: No production risk accepted by foundation setup. See docs/Decisions.md; eligible manager self-approval is expressly allowed.
- Accountable owner: Technical owner plus relevant CS/Logistics/Finance/security/data/platform owner; individuals named in docs/governance/ownership.json. (ASSIGNED)


# Engineering governance

Prepared 31 October 2026 following the user-approved discovery/foundation scope. **Foundation policies and bounded local checks do not make the application production-ready.**

## Navigation

| Artifact | Purpose |
|---|---|
| [Discovery assessment](discovery.md) | Actual workspace, tools, assumptions, scope and preserved work |
| [Engineering rules](engineering.md) | Boundaries, data/transaction/API contracts, coding and dependencies |
| [Security and privacy](security.md) | Threat model, security baseline, classification, SSDLC and residual risks |
| [Testing](testing.md) | Stack-specific risk-based suites, fixtures, test standards and gates |
| [Delivery](delivery.md) | Environments, CI/CD, migration, container/IaC policy and activation checklist |
| [Operations](operations.md) | SLIs, capacity/cost, failures, incidents, recovery and runbooks |
| [AI workflow](ai-workflow.md) | Instruction hierarchy, tool permissions and safe changes |
| [Architecture decisions](adr/README.md) | Significant approved/proposed architecture choices and ADR template |
| [ADR-001 modular API/worker and stack](adr/ADR-001-modular-platform.md) | Stack and modular architecture decision; status table in [adr/README.md](adr/README.md) |
| [ADR-002 transactional integrity and manual launch](adr/ADR-002-integrity-and-manual-launch.md) | Manual-operations and transactional-integrity decision; status table in [adr/README.md](adr/README.md) |
| [ADR-003 deferred deployment and identity](adr/ADR-003-deferred-platform-decisions.md) | Platform/identity decisions deliberately deferred pending owner approval |
| [ADR-004 hosting target](adr/ADR-004-hosting-target-github.md) | GitHub target recorded for governance CI; repository not created, activation requires the authorization record |
| [Requirements](requirements.json) | Authoritative seed requirement-to-design traceability, observable acceptance criteria and failure links; no implementation claims |
| [Control register](controls.json) | All 30 required governance categories, state, gaps, evidence and acceptance owners |
| [Category assessment](category-review.md) | Readable per-category review rendered from the control register |
| [Failures](failures.json) | Business-impact-first scenarios, prevention, detection, recovery, catalogue mapping and planned verification |
| [Ownership](ownership.json) | Required accountable roles; all five assigned, contacts recorded as flagged placeholders |
| [Authorizations](authorizations.json) | Durable record of human authorisation for sensitive operations; empty until a named human approves |
| [Verification record](verification.json) | Machine-readable record of the bounded checks actually executed |
| [Foundation configuration](foundation.json) | Manifest, phase, review-gated paths, pinned instruction digests and preserved reference hashes |
| [File inventory](files.json) | Every created/updated foundation file and purpose |
| [Layout change](layout-change.md) | Pending instruction to simplify the repository layout after the current session completes |
| [Handoff](handoff.md) | Actual verification, remaining decisions and readiness assessment |

Reuse [HLD](../Support_Desk_HLD.md), [LLD](../Support_Desk_LLD.md) and [Decisions](../Decisions.md). They own product behavior; governance defines how it is safely built and evidenced. Do not duplicate the product specification across policies.

## Templates

Start from the template that matches the work; a completed template is still a proposal until the evidence it references exists.

| Template | Use for |
|---|---|
| [ADR](templates/adr.md) | Significant architecture, identity, persistence, deployment or dependency choice |
| [Feature specification](templates/feature.md) | Scope, acceptance criteria and traceability for one requirement slice |
| [Threat model](templates/threat-model.md) | Assets, trust boundaries and per-feature abuse cases with residual risk |
| [Test plan](templates/test-plan.md) | Risk-based cases, commands and execution evidence for a change |
| [Incident](templates/incident.md) | Incident timeline, containment, reconciliation and follow-up |
| [Authorization](templates/authorization.md) | Durable human authorisation record for a sensitive operation |

## State vocabulary

DOCUMENTED = policy exists; CONFIGURED = runnable configuration exists; ENFORCED = mechanism applies at the described boundary; VERIFIED = a stated check executed with inspected evidence; NOT IMPLEMENTED = outstanding; NOT APPLICABLE = reasoned exclusion; BLOCKED = a human-dependent gate cannot pass until its dependency is resolved; PENDING OWNER ASSIGNMENT = no accountable individual has been named, so nothing may be described as enforced by a person. States apply to a precise control, not the entire category. A document link check can be verified while the policy it describes remains unenforced.

Requirement states add PENDING DECISION: the requirement is recorded but its governing decision in [Decisions](../Decisions.md) is unresolved, so it carries a `decisionRef` and claims no implementation or evidence.

## Change control for registers

Governance registers (controls, requirements, failures, ownership, authorizations, foundation configuration, manifest, verification record) are review-gated: propose the change, state affected controls/requirements and regressions, and obtain independent human review. A chat instruction or an agent's self-review is not independent human authorization; sensitive operations additionally need a durable record from [the authorization template](templates/authorization.md). Never clear a BLOCKED or PENDING OWNER ASSIGNMENT gate by editing the register — only a recorded named-human decision does.

## Enforcement status

The local foundation checker runs only in this workspace. Hosted enforcement is **NOT IMPLEMENTED**: no repository, branch protection, required status checks, CODEOWNERS or external run log exists, so instruction digests and review-gated path lists detect in-repository changes only and cannot resist an editor who re-pins them. [foundation.json](foundation.json) `hostedControls` records this explicitly; do not describe hosted protection as active.

The local foundation checker enforces only the risks expressly listed in [testing](testing.md). The hosted workflow has not executed. Product identity, authorisation, transaction locks, encryption, scheduler, backup and recovery remain NOT IMPLEMENTED. Existing design validation is preserved as historical evidence; its test counts are not reused as current results.

## Ownership and decisions

[ownership.json](ownership.json) is authoritative for accountable roles: product, technical, domain, security/data and operations. All five are **ASSIGNED** to named individuals with backups, `Asia/Kolkata` time zones and contacts, recorded from a named-human decision; contacts are PLACEHOLDER `example.com` addresses flagged for replacement, and no on-call commitment or response time is inferred. Register status is **ASSIGNED**, but gates with a second dependency (GOV-07/erasure and compliance applicability, GOV-13 and GOV-20/hosted repository, GOV-19/backup schedule, keys and restore drill, GOV-30/on-call roster) stay **BLOCKED** until that dependency is resolved. Owner values are edited by an administrator through the review-gated change control described above.

D-03, D-11 and D-12 were confirmed from explicit user choices in session on 2 November 2026 and recorded in [Decisions](../Decisions.md); the Decisions.md and Decisions.html edits were re-pinned in `foundation.json` after review of the proposed change, with the other 43 protected hashes untouched. HLD, LLD and the PDFs remain unchanged design-time references.

Requirements/design/test/release evidence flow: requirement ID → source/design/ADR → implementation reference → executed test → release evidence. Empty implementation/test/evidence lists mean not yet implemented, not missing documentation to fill with invented results.

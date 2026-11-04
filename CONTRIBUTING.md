# Contributing

Read [AGENTS.md](AGENTS.md) and [engineering standards](docs/governance/engineering.md). Preserve the existing product design and user decisions.

1. Select a requirement or narrowly defined task; record affected modules, security/data implications and acceptance checks.
2. Inspect current callers, public interfaces, policies and tests. Agree a plan for large or high-impact changes; avoid unrelated refactoring.
3. Implement a reviewable slice and relevant tests. Use synthetic fixtures; never add production customer data or secrets.
4. Execute the foundation commands in [README](README.md) and all relevant application gates once configured. Include commands and inspected results, not assumed success.
5. Review the diff; update requirements traceability, ADRs and operating instructions affected by behavior/interface changes.
6. Submit the [PR template](.github/PULL_REQUEST_TEMPLATE.md). Obtain independent human review for authorisation, money/receipt invariants, migration, privilege, secrets, external side effects or infrastructure changes.

## Git and review

No Git repository or remote exists yet. After the owner selects hosting, use protected main/trunk, short-lived branches and small cohesive commits. Recommend required CI and reviewer approval, blocked force pushes and controlled bypass permissions. These hosted settings are NOT IMPLEMENTED here. Never reset or overwrite unrelated work; keep generated evidence and editable source distinguishable.

Functional changes need observable positive/prohibited cases. Documentation-only changes need link/register consistency checks, not invented application tests. No universal line-coverage percentage or approver count is introduced. Use risk and executed critical-path evidence, as described in [testing](docs/governance/testing.md).

Questions/defects use [the issue template](.github/ISSUE_TEMPLATE/work-item.md). Send sensitive vulnerability details through the process in [SECURITY.md](SECURITY.md), not a public issue.

## Authorisation records and register changes

Sensitive operations (production release, migration, data deletion, permission change, live payment/email/shipment, cloud or hosted configuration) require a durable authorisation record naming the requesting and approving humans; copy [the authorisation template](docs/governance/templates/authorization.md) into [authorizations.json](docs/governance/authorizations.json). A chat message, an AI/agent proposal or an agent reviewing its own change is not independent human authorization.

Changes to governance registers (controls, requirements, failures, ownership, authorizations, foundation configuration, manifest, verification record) are review-gated and need independent human review before they are considered approved. Register state may only move with evidence: never mark BLOCKED or PENDING OWNER ASSIGNMENT gates as cleared without a recorded, named-human decision.

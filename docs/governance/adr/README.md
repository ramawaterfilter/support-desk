# Architecture decision records

Use [the ADR template](../templates/adr.md) for significant architecture, identity, persistence, messaging, deployment, dependency or data-lifecycle choices. Record context/problem/options/decision/reasons, security/operations/performance/cost, rejected alternatives, consequences and revisit trigger. Status: Proposed / Accepted / Superseded / Rejected. Acceptance needs actual owner evidence; don't change Proposed to Accepted because an agent wrote it.

| ADR | Status | Source |
|---|---|---|
| [ADR-001 modular API/worker and stack](ADR-001-modular-platform.md) | Accepted scope; framework details proposed | User stack choice and HLD/LLD |
| [ADR-002 transactional integrity and manual launch](ADR-002-integrity-and-manual-launch.md) | Accepted behavior; technical implementation design | Confirmed manual launch + reviewed design |
| [ADR-003 deployment and identity](ADR-003-deferred-platform-decisions.md) | Proposed / decision required | AWS/identity choices remain open |

Update the affected ADR and requirements/design on significant changes. Keep historical records and link supersession; don't rewrite the past. Routine implementation details belong in a concise PR. These records document decisions; they do not implement or verify a service.

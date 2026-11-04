# ADR-001: Modular API, worker and relational platform

Status: Accepted for architecture/stack scope by user conversation; exact framework/dependency versions remain proposed. Date: 31 Oct 2026.

Context/problem: new production implementation of reviewed Support Desk, with linked approvals, quantities, money, roles and closure requiring strong cross-module consistency. No application manifests exist.

Options: modular TypeScript API/worker with one PostgreSQL; distributed domain microservices; wholly client-side persistent demo. Decision: React/TypeScript UI, TypeScript modular API and worker, PostgreSQL. Public domain interfaces, reviewed dependency direction and shared transaction boundary. HLD proposes Fastify and SQL migrations; confirm/pin implementation versions in the first application PR, not via automatic package installation.

Reasons: meets agreed production/multi-user goal while keeping critical invariants local and independently scalable background work. Reject client-only design for lack of trusted shared state; reject distributed services until independent ownership/scaling/failure needs justify cost.

Security: API rechecks current identity/grants/scope; UI has no authority. Operations/performance: stateless API, bounded workers/DB pools, measured indexing/load; no scale claim yet. Cost: fewer services/operating contracts; actual hosting/budget open. Consequences: module ownership/boundary tests required; DB coordination and deployment compatibility must be tested.

Revisit: measured independent scale/availability/ownership requirement cannot be met with the modular deployment. Evidence: [HLD §§2–4](../../Support_Desk_HLD.md), [confirmed choices C-06](../../Decisions.md). No production implementation verification exists.

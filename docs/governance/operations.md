# Operations, resilience and recovery

Owner: platform/operations owner; named roster and targets unassigned. Status: DOCUMENTED, runtime implementation/evidence outstanding.

## Observability and service objectives

Structured logs: timestamp, service/environment/build ID, request/correlation ID, safe command/result code, duration and retry classification; no raw messages/contacts/payment details, headers/tokens or environment dumps. Business audit separately records immutable actor/scope/revision/reason/occurred/recorded facts. Propagate correlation through API/outbox/jobs without putting PII in labels.

Track availability/latency/error and saturation at critical user journeys; queue/outbox age, due-scan lag, attempts/DLQ, export/scan failure, DB connection/lock wait, permission denial spikes, stuck decisions, unknown refund age and invariant violations. Histograms/counters use bounded labels (service/operation/outcome), not customer/ticket/task IDs. Use traces where cross-component latency needs them; avoid unnecessary tracing infrastructure.

Provisional DEV targets: p95 ordinary saves/search≤2s, initial usable view≤3s and due processing≤60s at an agreed load envelope. They are unapproved until benchmarked. Availability/error budget, capacity, RPO/RTO, alert thresholds and escalation response commitments are not invented.

Actionable alerts name affected journey, severity, recent change, dashboard/log query, on-call/backup owner, safe immediate action and recovery condition. Page on user-impacting sustained failure, integrity/credential incident or breached agreed objective; route informational noise elsewhere. Specific thresholds/contacts must be approved before staging/live monitoring.

## Resilience and failure behavior

Each outbound operation has explicit connect/total timeout and bounded resource limit; retry only transient/idempotent outcomes with bounded exponential backoff and jitter. Do not retry validation/forbidden/stale commands blindly. Browser preserves draft on ambiguous response and queries/retries the same idempotency key; do not create new money/shipment command identities.

Use transactional outbox and consumer inbox/dedupe, retry-safe leases, DLQ and safe owner-reviewed replay. Enforce queue backpressure, bounded export/scan concurrency, DB pool budget and rate/resource controls. Circuit breakers/bulkheads need a concrete failing dependency/blast-radius case; don't add them everywhere. Shed optional heavy work before critical saves when overload policy is approved. Never degrade by bypassing authorisation, returning dirty funds or treating unscanned evidence as safe.

Unknown provider payment remains reserved until verified; no automatic uncertain payment retry. Queue acceptance is not task/external completion. Scheduler catches up after outage, preserving original miss/owner and deduplicating reminder thresholds. Logs/metrics detect stuck work; reconciliation uses domain truth, not stale reporting projections. [Failure register](failures.json) owns scenario details.

## Performance and cost

Before tuning, agree records/history/files, active/concurrent users, requests/events per second, growth, peak bursts and cost envelope. Baseline representative p50/p95/p99 latency/error, queries/rows/lock waits, CPU/memory/GC, pools, queue lag and storage/export bytes. Use bounded load tests and stop conditions in isolated staging; no live shared-system stress tests.

Prioritise unbounded pagination/serialization, N+1 queries, missing indexes, slow joins, excessive connection pools, memory/disk growth, retry storms and lock contention. Measure before/after at same workload. Add cache/read replica/search platform only with documented invalidation, consistency and cost tradeoff; never approve/refund/close from stale cache.

Assign resource tags/owner, monthly cost budget and cost alerts before provisioning. Track storage/backup/export retention, network egress/scanning/identity/queue expenses and worker/DB scaling. No cloud cost estimate is implied by the logical AWS diagram. Scaling changes require load and rollback evidence.

## Incident response

Severity is business-impact based: critical integrity/security exposure or broad outage→immediate incident owner triage; limited degradation→prioritised recovery; other defects→backlog. Response time/rota commitments need actual staffing. Maintain a private contact roster before live service; no fictitious mailbox or paging promise.

1. Assess principal/resource/user impact; appoint incident lead and safe communications owner.
2. Contain through approved access revocation/feature suspension/isolation; preserve minimal nonsecret evidence and immutable history.
3. Determine current DB/external side-effect state before retries/rollback. Unknown financial outcome must stay reserved.
4. Apply reviewed repair/restore, verify relevant balances/quantities/files/audit/tasks and safe worker replay.
5. Communicate verified scope/recovery, document timeline/causes/follow-ups with owners; assess privacy reporting obligations with legal/data owner.

Use [incident template](templates/incident.md). Agent self-review does not replace accountable humans during an incident.

## Runbook: failed workflow job

Identify event/job/correlation and last accepted domain version. Check failed transient dependency vs stale/forbidden/permanent validation. Confirm no effect already committed using idempotency/inbox/domain facts; do not infer failure from a lost ack. Repair config/access/dependency with authorised owner; replay exact event identity in isolated test then approved environment; verify one effect/next task and clear alert. Never manually edit ledger paid/received totals to clear a queue.

## Runbook: backup and restore

Before live use, approve backup schedule/retention/keys/access/RPO/RTO and restoration owner. Back up transactional DB plus protected evidence/export metadata/objects and configuration needed to reconstruct service; infrastructure HA is not backup. Store recovery keys separately with audited access.

Rehearse in an isolated environment: choose recoverable point→restore DB and objects/config/identity mappings→validate record counts/references, physical/waived balances, refund paid/reserved/history, audit continuity and task/outbox/inbox state→resume workers without duplicate effects→verify critical role workflows→measure achieved recovery point/time→record signed evidence/gaps. Check partial restores and missing file objects explicitly. A successful backup job alone does not prove restorability. Do not promise deletion/retention or recovery objectives not agreed by owners.

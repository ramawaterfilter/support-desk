# ADR-002: Manual operations with transactional integrity

Status: Accepted product baseline/user manual-launch decision; implementation mechanism is design. Date: 31 Oct 2026.

Context/problem: recording an approval or provider result must not invent shipment/payment/receipt, lose historical evidence or permit conflicting concurrent work.

Options: mutable status flags with browser timers; distributed eventual updates; relational transactions + immutable domain histories + tasks/outbox. Decision: the latter, following LLD locks/version/idempotency/closure rules. Staff record external communications, order checks, fulfilment and payments with meaningful evidence. No automatic money/email/shipment execution adapter at launch.

Reasons: exact scope, physical ledger and paid/reserved balances must remain independent and auditable. Outbox/inbox supports retry-safe background work without claiming exactly-once network delivery. Reject browser truth and best-effort independent writes for critical invariants.

Security: stage-specific current authority, controlled file evidence, append-only audit. Self-approval by eligible managers remains allowed and audited; no extra approval threshold introduced. Operations: replay/reconcile uncertain work with original identity; unknown funds reserved. Performance: lock contention and transaction time tested under realistic concurrency. Cost: DB/worker operational load; no added Kafka/distributed transaction manager.

Consequences: real DB race tests and independent domain closure gates are release-blocking. Final-fact corrections, SLA, currency/order cap, retention and provider details stay decision-gated. Revisit when live provider execution is explicitly approved; introduce provider-specific contract/auth/idempotency/reconciliation without rewriting business history.

Sources: [LLD §§7–11](../../Support_Desk_LLD.md), [confirmed decisions](../../Decisions.md). No runtime enforcement implemented here.

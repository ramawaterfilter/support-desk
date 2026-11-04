# Discovery assessment

Date: 31 October 2026. Scope: this workspace and its supplied/captured design artifacts. No runtime penetration test or comprehensive vulnerability audit was performed.

## Actual state

- Root contains three supplied PDFs, a governance master prompt, the earlier design ZIP, `docs/` and `.tmp/`.
- The design handoff includes 7-page HLD, 24-page LLD, decision register, 15 navigation captures, 12 source/style captures and hash/validation records.
- `git rev-parse --show-toplevel` and `git status --short` reported no Git repository. No commit/dirty-worktree claim can be made; preserve files using a hash inventory instead.
- No production application manifests, backend, database migrations, build/test configuration, CI configuration or deployed infrastructure were present before this foundation.
- Captured JavaScript is prototype evidence. Its synthetic records, role switcher and tab timers are not implementation of production authentication/persistence/concurrency.
- Locally inspected tool versions: Node24.16.0, npm12.0.2, Git2.54.0.windows.1, Python3.12.10. No package was installed for foundation implementation/verification.
- Targeted filename-only checks outside `.tmp/` and captured source/screenshot scopes found no credential-like files. This is not a content scan of the whole workstation or proof of secret absence.
- No parent/root AGENTS.md was found during discovery. This setup creates the root instructions; no existing instructions are overwritten.

## Confirmed product context

See [confirmed decisions](../Decisions.md). Shared customer history across brands; controlled intake; explicit service approvals; separate collection/receipt/inspection/waiver/dispatch/payment facts; all-obligation closure. React/TypeScript, TypeScript API/worker and PostgreSQL; manual launch; self-approval allowed for eligible managers. AWS and production SLAs remain undecided.

## Main risks and constraints

Authorisation mistakes, ambiguous identity, stale approval, concurrent financial/physical updates, prematurely closed tickets, export/attachment disclosure, unknown imported history and unreliable job/recovery behavior are design risks requiring implemented controls and executed evidence. No confirmed exploitable production vulnerability is inferred from missing software.

The presence of PII/contact records and UK/US/Canada/France/India sample markets warrants a legal/data-ownership assessment; sample countries do not establish actual customers, residency duties or a regulatory certification. No payment-card collection is in launch scope. Do not add full payment credentials to evidence. Runtime LLM features are not in scope; AI-assisted engineering governance is applicable separately.

## Assumptions and unknowns

This is a new production build from an existing reviewed prototype. Account roster, identity provider, migration source schema, legal/controller duties, retention, file limits, scale/budget, recovery targets, deployment platform, security contact and CI hosting remain unconfirmed. Do not reinterpret the source PDFs' test counts as new validation. [Decisions.md](../Decisions.md) remains the decision authority.

## Foundation approach

Keep the modular monolith and shared domain code; avoid new infrastructure. Add a small set of authoritative policies, requirements/controls/failure registers, templates and dependency-free checks. Preserve all supplied evidence and existing design files; append only a governance link to the existing docs index. Do not initialise Git, install packages, modify live services or build the business app.

# Support Desk — decisions and implementation gates

31 October 2026. This register separates explicit user choices from recommendations and unresolved source-PDF policies. It does not require approval to read or revise the design documents.

## Confirmed in this conversation

| ID | Decision | Consequence |
|---|---|---|
| C-01 | Recreate as a production application | Real authenticated identities, persistent records, files, jobs and audit |
| C-02 | Full build handoff, using prototype and all local PDFs | Preserve UI, logic, data and permissions with evidence/traceability |
| C-03 | Review conflicting references with the user | No silent source precedence for conflicting behavior |
| C-04 | Match appearance with required fixes | Retain design language; accessible searchable selectors and production feedback permitted |
| C-05 | Manual launch | No customer mail, commerce, warehouse, carrier or payment execution integration assumed |
| C-06 | React/TypeScript + TypeScript API/worker + PostgreSQL | Stack baseline; exact packages/versions pinned during implementation |
| C-07 | AWS is a proposal | No account, region, cost, provisioning or service sizing approved |
| C-08 | Allow self-approval | Eligible manager may decide own/materially edited service, waiver or refund request; retain actor identity/audit; correction still requires its own grant |
| C-09 | Use demo deadlines for testing | Review24h, resolution72h, ordinary next action24h, replacement delivery48h, reminder1h before; elapsed time only; production SLA not approved |
| C-10 | One eligible manager approval remains baseline | No invented second approver or monetary threshold |

## Confirmed 2 November 2026

Recorded from explicit user choices confirmed in session; the Decisions.md and Decisions.html edits were re-pinned in foundation.json after review of this change. These rows supersede the three rows removed from Open decisions below and the matching OPEN statements in HLD §9 and the LLD, which remain unchanged as design-time references.

| ID | Decision | Consequence |
|---|---|---|
| D-03 | Staff sign-in via Google Workspace OIDC SSO for all staff, no local passwords; MFA mandatory for Super/Finance/privileged roles and optional for ordinary CS; invitation = emailed single-use link valid 24h (re-issue sends a fresh link); recovery = admin-assisted with recorded identity evidence, no self-service bypass; sessions idle-expire after 30min and expire absolutely after 12h, revoked on password or role change or admin action; invitations and recovery mail sent via Google Workspace SMTP | Real login/invite/recovery design approved; implementation and provider configuration still require their own authorisation |
| D-11 | Test and production share tables with an environment flag; archive = history tables, never silent delete; customer email, phone and attachment values masked in exports by default; the eight proposed stable JSON-history CSV schemas accepted as-is; export links expire after 24h and are capped server-side at 100k rows or 50MB; case evidence retained 7 years; audit log retained 2 years append-only, deleted only via a recorded legal-hold process | Bulk export, retention and audit lifecycle design approved; customer-data erasure remains open (GOV-07) |
| D-12 | 200 staff, 50k tickets, 100k attachments (~50GB), peak 50 case events per hour; 99.5% monthly uptime excluding the first Sunday 02:00–04:00 UTC; RPO 15min and RTO 4h; AWS eu-west-1 (Ireland) with EU data residency; USD 500/month ceiling with alerts at 80%; AWS with the modular API+worker as proposed | Capacity, availability, recovery, region and budget envelope approved; provisioning still requires authorisation and remains unexecuted |

## Open decisions

Recommendations below are proposals, not approved policy. Affected production actions remain disabled or fail with PolicyNotConfigured until the required policy is agreed. Unrelated work may proceed. References use DEV page numbers.

| ID | Question and proposed direction | Affected launch gate / owner / source |
|---|---|---|
| D-01 | What are business-hour calendars, holidays, targets, pause/reopen clocks and allowed backdating? Retain demo values in test only | Production SLA/reminders and retrospective corrections; Head/CM; pp.28,92,96–97 |
| D-02 | What are allowed countries/warehouse memberships and cross-country CS mutation rules? Preserve shared reads and legacy operational wildcard until explicit migration | Scoped server writes and production account provisioning; Operations/Super; pp.68–70,92,97–98 |
| D-04 | Actual brand/store/order namespaces, currencies/exponents, order total/tax/shipping/discount caps, earlier refunds/credits and multi-ticket relinking? Keep manual verified evidence; no FX | Live refund eligibility; CS/Finance; pp.51–55,93,96 |
| D-05 | Which real migration sources/files/fields/history depth, volume, ownership and cutover? Require masked samples and reconciliation | Source-specific importer and cutover; data owner/CS/Finance; pp.11,18–20,92,97 |
| D-06 | Can delegated administrators grant Super or capabilities they lack? Prototype has no ceiling; do not silently ship privileged delegation | Delegated production privilege changes; Super/security; pp.64–67,94–96 |
| D-07 | How long is Working now lease, expiry/takeover and draft retention? Proposed test120s lease/30s heartbeat, explicit takeover | Production collaboration and retention; CS/technical; p.8 |
| D-08 | How to correct erroneous physical receipt, mistaken final waiver, final provider/payment result or closed dispute? Separate authorised adjustment/event; never overwrite | Final-fact correction UI/API; Logistics/Finance/Head; pp.47,56–57,96 |
| D-09 | Dispute intake/provider identifiers, won/lost/withdrawn results, financial effects and reopen? Preserve baseline evidence tracking, do not infer bank effects | New/imported dispute production workflow; Finance; pp.56–57,96 |
| D-10 | Catalogue identifier reuse, reference retirement, semantic type extension, capacity label vs structured unit, and country/warehouse archival? Preserve historical IDs/snapshots | Reuse and destructive/meaning-changing master actions; Head/Super; pp.73–84,95–96 |
| D-13 | Customer confirmation/nonresponse windows and reviewed closure evidence? Never let nonresponse waive independent obligations | Reviewed closure policy; Head/CM; pp.58–63,93 |
| D-14 | Keep Outreach/Purchase Stores reference-only? Proposed yes until operational mapping is specified | Optional new intake/order fields, not basic master CRUD; Head; pp.80–82,94 |
| D-15 | Are partial/substitute/lost outbound shipments or additional replacement attempts launch scope? Proposed baseline one exact shipment per approved scope | Expanded fulfilment; Logistics/Head; pp.44–46,96 |
| D-16 | Parcel reference uniqueness namespace and controlled wrong-match reversal? Propose warehouse+reference after source-system review | Production parcel linking/correction; Logistics; pp.50–51 |
| D-17 | Idempotency-key retention and amount/provider-reference namespaces? Keep successful business uniqueness independent of short-lived request dedupe | Command replay retention and finance/provider namespace; technical/Finance; pp.9,54,96 |
| D-18 | Historical-at-cutoff/event-based analytics needed? Preserve labelled current-created-cohort reports and first-miss task reports initially | Any new historical SLA/CSAT/sentiment/report semantics; Head/management; pp.85–90,93,97 |

## Source differences requiring deliberate treatment

| Reference behavior | HLD/LLD treatment | Classification |
|---|---|---|
| Tab-local records, role selector, refresh reset and browser timers | Authenticated API, durable store, production identity and scheduler | Required production difference, not a conflict needing reapproval |
| Native dropdowns | Accessible searchable long-list controls | Explicit DEV production requirement |
| Receipt cumulative totals | Append-only physical deltas/events with cumulative entry UI | Explicit DEV production requirement |
| Raw variable columns in six exports | Versioned explicit schemas retaining nested history | Explicit DEV production requirement; final field policy per confirmed D-11 |
| End-of-day23:59:59.000 cohort bound | Half-open next-midnight bound includes fractional final second | Explicit DEV production correction |
| Task-only dispute closure guard | Independent dispute-state check plus task check | Explicit DEV production requirement |
| Country strings double as warehouse/scope | Stable distinct IDs with legacy wildcard compatibility until D-02 | Required normalisation, semantic change gated |
| Mutable current actor/label strings | Immutable IDs plus historical display snapshots | Required production difference |
| Reset verified but not sent | Separate real provider delivery states; never infer Sent | Required production difference; provider policy per confirmed D-03 |

No additional contradictory live-vs-PDF rule is asserted from navigation-only inspection. Reconcile exact modal/state behavior during implementation UAT and add concrete conflicts here if discovered.

# Security, privacy and threat model

Owner: security/data owner with technical and domain owners; named contacts recorded as flagged placeholders in ownership.json. Status: DOCUMENTED; production controls NOT IMPLEMENTED. This is a design threat review, not a vulnerability audit or compliance certification.

## Baseline and SSDLC

Use [OWASP ASVS5.0.0](https://asvs.owasp.org/) as the versioned verification catalogue, and [OWASP API Security Top10–2023](https://api-security.owasp.org/editions/2023/en/0x11-t10/) as an API threat-awareness guide. Select applicable ASVS requirements and assurance level with the security owner per feature before release; do not claim full ASVS conformance or invent requirement IDs. Versioned mappings belong in feature acceptance evidence. Top10 awareness alone is not a complete verification standard.

For each consequential change: identify assets/trust boundaries→update threat/requirements→review design→implement validation/access/integrity→run risk-specific tests/scans→independent review→record release gates→monitor and remediate. Revisit after a new identity/provider/file/permission/data-flow boundary or significant dependency/deployment change.

## Assets, actors and trust boundaries

Assets: shared customer contacts/messages, approvals/revisions, physical receipt ledger, refund authority/attempt evidence, user privileges, audit/history, files/exports, identity tokens, service secrets and backups. Principals: staff by grant/scope, reserved managers, privileged admins, worker/service identity, identity provider, future integration adapters and unauthenticated attackers.

Boundaries: browser→API; API→current identity/permissions; domain module→owned records; API/worker→DB/object storage; quarantine→clean evidence; queue→idempotent consumer; admin→authority changes; CI/dependency→release artifact; live→test/backup/export. Shared cross-brand read is deliberate; inventing per-agent/brand silos would change the product, not fix a proven tenant bug. No tenant SaaS model is established; if one is added, explicit tenant identity/DB/query/file isolation and negative tests are required.

## Design threat register (STRIDE)

| Threat / impact | Mitigation to implement | Verification / residual risk |
|---|---|---|
| Spoofed/revoked staff token; unauthorised decisions | Provider token signature/issuer/client/expiry/use validation, Active/current permissions on server | Direct requests with altered/expired/revoked/no-read credentials; provider/session policy open |
| Object/property/function access bypass via ticket/file IDs | Per-action grant/scope, authorised projection, immutable reserved manager identity; never browser-only authority | Cross-scope/action/field/download tests; shared legitimate reads remain shared |
| Tampered stale scope, quantities or money | Version/scope checks, row locks, safe integers, immutable history and DB constraints | Concurrent stale decision/receipt/waiver/refund/closure tests; deployed correctness unverified |
| Repudiation or erased physical/financial facts | Append-only business audit and exact assents with actor/time/revision; protected DB roles | Alter/delete denial and event reconciliation; privileged DB/operator tampering needs separate operational controls |
| PII/export/file disclosure | Field/search whitelist, download reauthorisation, quarantine scan, private storage/expiry | Revoked access, unsafe type, hidden-field search, formula-safe full exports; retention/legal policy open |
| SQL/XSS/command/path injection | Schema/length/type allowlists, parameterised SQL, safe React text, safe paths/argv; no arbitrary HTML/exec | Boundary/Unicode/multiline/malicious-fixture tests; don't treat generic escaping as sufficient for every output context |
| SSRF or unsafe third-party data | No arbitrary server URL fetch at launch; future adapters restrict destinations/egress and validate responses | Deny private/unapproved targets and redirects in isolated fixtures once adapter exists |
| CSRF/session theft | Token flow without durable browser token dumps; if cookies selected, Secure/HttpOnly/SameSite and CSRF/origin checks; CSP/safe rendering | Verify actual selected auth mode; current provider/session policy open |
| Resource/cost exhaustion | Bounded body/file/page/export sizes, queue/backpressure, endpoint/user rate budgets and timeouts | Load/abuse tests with agreed volume/cost budget; no limits invented as approved values |
| Supply-chain/CI privilege escalation | Reviewed lockfiles, pinned actions/images, minimal job tokens, no PR access to deployment secrets | Inspect workflow/permissions/artifact provenance; hosted settings unconfigured |
| Intended manager self-approval abused | Preserve allowed self-approval; exact scope, reason/evidence, immutable audit and management review | Eligible own-request case allowed; unauthorised roles denied; residual separation-of-duties risk is recorded, not silently changed |

High-impact failure scenarios and planned tests are in [failures.json](failures.json). Per-feature threat reviews use the [threat-model template](templates/threat-model.md). These are risks/hypotheses, not confirmed vulnerabilities. Risk acceptance needs named owner, precise scope, expiry/review trigger and compensating controls; no agent can accept production risk for the owner.

## Access and cryptography

Invite-only staff identities; business grants/scope held server-side. Minimum read+required action+scope, plus manager identity where applicable. Protect final active Super Admin and eligible handover. No new privileged delegation policy inferred from generic users/roles grants. Use established OIDC/token/crypto libraries and managed key/secrets services; no custom crypto. Key lifecycle includes owner, rotation/revocation, overlap/recovery and audit without key material. Do not build password storage when a chosen identity provider handles it; any local credential exception requires an approved threat/architecture review.

Keep secrets out of source/frontend/config examples/URLs/logs/test fixtures/CI artifacts/container layers. Runtime secret injection from the approved store, least-privilege service identities and environment separation are mandatory before deployment. TLS between network tiers; encrypted persistent data/backups with key recovery and least-privilege access. Provider-specific details remain gated, not claimed configured.

## Data classification and lifecycle

| Class | Examples | Handling |
|---|---|---|
| Public/approved publication | Public product help explicitly approved for publication | No assumption that this local design bundle is public |
| Internal | Design, catalogue, synthetic reference captures | Restricted team sharing; preserve provenance |
| Confidential/PII | Customer/staff contacts, messages, receipts, exports | Need-based projection, audited access/exports, masked nonproduction fixtures |
| Restricted | Identity/session/service secrets, full financial credentials | Never log/export/store in general evidence; approved secrets systems only |

Minimise copied messages/payment details. Preserve necessary actor/scope/provenance without overlogging. Define purposes, lawful authority/contractual duties, controller/processor roles, jurisdiction/residency, retention/deletion/anonymisation, legal holds and subject-request workflow with the data/legal owner. Customer name/country samples alone do not establish GDPR/UK GDPR/India law applicability. ISO27001/SOC2 are possible assurance frameworks only if the organisation chooses them; no certification claim.

No card-data processing is requested; reject full card credentials in routine evidence and assess any later expansion separately. Backups/immutable audit and erasure obligations need a reviewed retention design; don't promise immediate deletion from every backup. Test data is synthetic by default; authorised masking is required for rare production-derived cases.

## Files, frontend and integration security

File checks use actual size/type/checksum, quarantine/scanning, unguessable keys, target-authorised metadata/download and approved expiry. Do not trust extension/MIME or mark clean before scanner result. Scanner outage fails closed for downloads/evidence use. React renders text safely; no raw HTML from customer/prototype/AI content. Accessible semantic forms/dialogs, visible focus and keyboard interaction are functional requirements, not cosmetic optional work.

Future adapter registration must include purpose/data/permissions/auth/credentials/limits/timeouts/retries/idempotency/errors/retention/vendor failure/monitoring/test plan. Outbox/queue acceptance is not provider completion. Uncertain payment remains reserved; never blindly retry financial side effects. No provider is connected by the governance setup.

## What is technically checked now

Only bounded foundation integrity/links/register schema, high-confidence secret-like patterns in managed text and guardrail configuration shape are checked locally. That is not SAST, malware scanning, a secret-vault control, dependency audit or runtime authorisation. Scanners, application security tests and private reporting channel remain outstanding. See [control register](controls.json) and [handoff](handoff.md).

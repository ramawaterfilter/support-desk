# Security policy and reporting

Status: design/foundation only. There is no production service or published security contact configured by this setup, and no certification or security guarantee is claimed.

## Report a concern

Contact the project owner privately through an already trusted channel. Provide affected artifact/version, principal/resource boundary, minimal non-secret reproduction, expected/actual result, impact and safe evidence. Do not post credentials, customer records or exploit details publicly. A dedicated security inbox and incident roster must be approved before live service; this file does not invent an address or response SLA.

Do not probe the hosted prototype, other accounts, payment providers or cloud resources as part of governance validation. Any future security test needs explicit target scope, synthetic data and an isolated environment. Stop at the minimum demonstrated effect; avoid availability tests against shared systems.

## Handling and remediation

Triage demonstrated impact and exploitability separately from confidence. Preserve restricted evidence, assign an owner, contain confirmed exposure and record corrective tests. Proposed prioritisation: actively exploited or credible high-impact authorisation/payment/data-loss defects block release and require immediate owner triage; other remediation deadlines need ratification against impact and exposure. Do not declare arbitrary universal patch-day targets approved.

If a secret is exposed: revoke/rotate with authorised owner assistance, investigate access, remove it from future artifacts and review history/cache/backup exposure. Deleting a line alone does not revoke a credential.

Containment, revocation and remediation actions that touch production, credentials or live data need a durable authorisation record naming the approving human; see [the authorisation template](docs/governance/templates/authorization.md). An AI/agent proposal or self-review is not independent human authorization for these actions.

See [security controls and threat model](docs/governance/security.md), [risk register](docs/governance/failures.json) and [incident runbook](docs/governance/operations.md#incident-response).

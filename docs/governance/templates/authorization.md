# Authorization record

Status: **TEMPLATE** — copy this into [authorizations.json](../authorizations.json) as one `records[]` entry when a named human authorises a sensitive operation. An empty register means no authorization exists; never fabricate one.

## Why this record exists

A chat message, an AI/agent instruction, or this agent reviewing its own change is **not** independent human authorization. Every sensitive operation (production release, migration, data deletion, permission change, live payment/email/shipment, cloud or hosted configuration) needs a durable record naming the human who approved it.

## Fields

| Field | Meaning | Rules |
|---|---|---|
| `operation` | Exact operation authorised (what will run, on what) | Specific, not "deploy" |
| `requestingIdentity` | Who asked for it | Never an agent/AI name |
| `approvingIdentity` | Who approved it | Never an agent/AI name; must differ from agent |
| `approverRole` | The approver's accountable role | Must be a role from [ownership.json](../ownership.json) |
| `approvedScope` | Exact target/scope (environment, system, data set) | Narrow; no blanket grants |
| `environment` | Where it will execute | e.g. local, staging, production |
| `expiry` | When the authorization lapses (ISO date/time) | Required unless `permanent: true` |
| `evidence` | Reference proving the approval (signed change, ticket, email) | Must be a real, citable source |
| `executionOutcome` | What actually happened afterwards | One of `NOT_EXECUTED`, `EXECUTED`, `PARTIALLY_EXECUTED`, `FAILED`, `ROLLED_BACK` |
| `authorizationSource` | How the approval was captured | One of `SIGNED_CHANGE`, `APPROVED_TICKET`, `EMAIL_CONFIRMATION`, `OTHER_DOCUMENTED` |
| `recordedAtUtc` | When this record was written | UTC timestamp |
| `permanent` | Optional: set `true` only if no expiry applies | Rare; default to an expiry |

## Rules the checker enforces

- Missing any required field fails the foundation check.
- An `authorizationSource` outside the four allowed values fails (chat/agent instruction is not one of them).
- An agent/AI named as requester or approver fails.
- A missing `expiry` without `permanent: true` fails; an unparseable `expiry` fails.
- An `executionOutcome` outside the five allowed values fails.

## Eligible manager self-approval (business policy, not this record)

One eligible manager may self-approve their own materially edited request within ordinary scope rules (Decisions C-08/C-10). That is a product behavior governed by REQ-007. It does **not** authorize an agent to approve its own governance or release work; that still requires a named human record here.

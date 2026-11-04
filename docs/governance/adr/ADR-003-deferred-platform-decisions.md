# ADR-003: Defer deployment and identity provider commitment

Status: Proposed — owner decision inputs recorded 2 Nov 2026 (D-03, D-11, D-12); provisioning not authorised. Date: 31 Oct 2026.

Context/problem: AWS logical topology is supplied. Region/residency/identity/budget/availability/recovery/volume inputs were recorded 2 Nov 2026 (D-03, D-11, D-12), but no account exists and provisioning is not authorised. Choosing and provisioning now would still exceed the recorded scope.

Options: AWS ECS/RDS/S3/SQS/Cognito candidate; another approved managed/container platform; local-only testing until constraints known. Decision: keep logical app/worker/DB/file/job boundaries portable; AWS selected as provider by D-12 (2 Nov 2026). Do not provision without authorisation; price/SLO/identity settings come from the recorded decisions, not invention.

Reasons: avoid irreversible cost/access/location commitments before owner decisions. Security: separate business authority from provider identity; decide MFA/session/recovery and secrets/keys before live auth. Operations: provider must support reliable jobs, backups, private files, observability and tested restore. Performance/cost: measure agreed workload and total operating expense before sizing.

Rejected alternative: deploying the AWS diagram as if it were an approved implementation. Consequences: D-03/D-11/D-12 constraints recorded 2 Nov 2026 in Decisions.md; infrastructure/identity activation remains blocked pending authorised provisioning and a reviewed provider plan; local design/foundation and unrelated domain development can proceed. Revisit when that plan is authorised.

Evidence: [decision register](../../Decisions.md), original Proposed AWS Architecture, [HLD §9](../../Support_Desk_HLD.md). No cloud resources or identity integration configured.

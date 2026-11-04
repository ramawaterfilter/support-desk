# ADR-004: Record GitHub as the hosting target for governance CI

Status: Proposed — target recorded 3 Nov 2026 from user choices; repository not created; hosted enforcement NOT ACTIVE.

Context/problem: GOV-13 and GOV-20 require hosted required checks, branch protection and CODEOWNERS. The workspace workflow (.github/workflows/governance.yml) is GitHub-shaped; ADR-003 kept boundaries portable until a concrete target existed.

Decision: provider GitHub; repository name support-desk; default branch main; visibility public as chosen by the user, which exposes every design document and the CODEOWNERS contact. The repository is to be created and pushed by Nice Pal. The stated organisation/account was "phoenix" while the provided clone URL resolves to account "ramawaterfilter"; the owning account must be confirmed before creation. "github-account2" in the provided URL is a machine-local SSH alias; canonically the target is git@github.com:<owner>/support-desk.git.

CODEOWNERS: .github/CODEOWNERS (draft) routes all paths to the interim technical/security contact nicepal.m@ramawaterfilter.com; product, domain and operations handles are deferred to production setup and must resolve to real accounts, or GitHub ignores the entries.

Consequences: nothing is hosted and no governance state above DOCUMENTED changes. Creating the repository and pushing the workspace is a sensitive hosted operation that requires a durable record in docs/governance/authorizations.json — a named approver whose role comes from ownership.json, a valid authorizationSource (a chat instruction is not one), citable evidence and an expiry. foundation.json hostedControls stays NOT IMPLEMENTED until the repository, branch protection, required status checks and an external run log are verified.

Evidence: .github/workflows/governance.yml, .github/CODEOWNERS, [ADR-003](ADR-003-deferred-platform-decisions.md), docs/governance/authorizations.json (empty until evidence exists).

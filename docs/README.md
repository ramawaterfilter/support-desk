# Support Desk V6 — design handoff

Prepared: 31 October 2026. Status: **reviewable design; application not implemented**.

| Document | Purpose |
|---|---|
| [HLD PDF](Support_Desk_HLD.pdf) / [LLD PDF](Support_Desk_LLD.pdf) | Portable review copies with rendered diagrams |
| [High-level design](Support_Desk_HLD.md) | Product boundaries, architecture, modules, deployment proposal, security, delivery and acceptance |
| [Low-level design](Support_Desk_LLD.md) | UI behavior, data model, commands, policies, state machines, transaction algorithms, jobs and tests |
| [Decision register](Decisions.md) | Confirmed user choices, unresolved policies and implementation gates |
| [HLD HTML](Support_Desk_HLD.html) / [LLD HTML](Support_Desk_LLD.html) | Offline browser copies with rendered diagrams and navigation |
| [Source manifest](reference/source-manifest.json) | SHA-256 identities of the three supplied PDFs |
| [Prototype source manifest](reference/prototype-source-manifest.json) | URLs and hashes of captured application files |
| [Screen register](reference/screens.json) | Captured navigation destinations, headings, controls, tabs and design tokens |
| [Screenshots](reference/screenshots/) | Navigation-level visual reference |

Read the HLD first, then the LLD. Source references such as **DEV p.40** refer to the supplied Development Specification, not the page number of these new documents. **VAL** means Final Validation Report; **AWS** means Proposed AWS Architecture. All three source PDFs remain at the workspace root.

## Interpretation

- **BASELINE**: supported by the supplied PDF or delivered prototype code; a citation is not proof that every path was exercised in this session.
- **OBSERVED**: directly captured through the signed-in prototype browser.
- **REQUIRED**: production requirement in the supplied specification or explicit user instruction.
- **DESIGN**: implementation proposal made in these documents, including endpoint and table names.
- **OPEN**: business/platform choice that must be decided before its affected production behavior is enabled.

The supplied PDFs report release commit `a5b3b2b9be1fa3860382ec549beeaaad6c887cb0`. The hosted scripts were captured separately and hashed; no repository checkout was available to prove that the served bytes correspond to that commit. The prior report's 113 cases and 87 automated tests were not rerun here.

The HLD/LLD cover the complete documented module set and give production design rules. The screenshot capture covers navigation screens; it is **not** an exhaustive recording of every modal, role and transition. Detailed screen-state visual regression remains an implementation/UAT task. No running backend, production infrastructure or live external integration is claimed.

## Engineering foundation

The [governance index](governance/README.md) adds engineering/security/testing/delivery/operations standards, agent instructions, traceability/control/failure registers and bounded local verification. See the [foundation handoff](governance/handoff.md) for actual results, limits and readiness. The earlier design ZIP/PDFs remain the original design deliverable; governance is delivered separately.

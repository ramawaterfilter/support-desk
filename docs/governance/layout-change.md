# Instruction for the concurrent session: repository layout simplification

Status: **PENDING — not yet applied.** The layout below is the approved target. No file has been moved while another session was actively changing references. Apply this after that session completes its current work, and only then.

## Target layout

```text
Support_Desk_v6/
├── README.md                 Start here
├── AGENTS.md                 Agent instructions
├── docs/
│   ├── Support_Desk_HLD.md
│   ├── Support_Desk_LLD.md
│   ├── Decisions.md
│   ├── exports/              PDF, HTML and ZIP copies
│   ├── reference/
│   │   └── originals/        Original PDFs and master prompt
│   └── governance/           Engineering policies and records
├── scripts/                  Verification tools
└── .github/                  CI and contribution templates
```

For everyday work only `README.md`, the HLD, the LLD and `docs/Decisions.md` are needed.

## Exact mapping

| Current path | Target path |
|---|---|
| `Support_Desk_V6_Development_Specification.pdf` | `docs/reference/originals/Support_Desk_V6_Development_Specification.pdf` |
| `Support_Desk_Final_Validation_Report.pdf` | `docs/reference/originals/Support_Desk_Final_Validation_Report.pdf` |
| `Support_Desk_V6_Proposed_AWS_Architecture.pdf` | `docs/reference/originals/Support_Desk_V6_Proposed_AWS_Architecture.pdf` |
| `MASTER PROMPT AI Software Engineering Governance System.md` | `docs/reference/originals/MASTER PROMPT AI Software Engineering Governance System.md` |
| `Support_Desk_Design_Handoff.zip` | `docs/exports/Support_Desk_Design_Handoff.zip` |
| `docs/Support_Desk_HLD.pdf`, `docs/Support_Desk_LLD.pdf`, `docs/Decisions.pdf` | `docs/exports/…` (same file names) |
| `docs/Support_Desk_HLD.html`, `docs/Support_Desk_LLD.html`, `docs/Decisions.html` | `docs/exports/…` (same file names) |
| `docs/Support_Desk_HLD.md`, `docs/Support_Desk_LLD.md`, `docs/Decisions.md` | unchanged in `docs/` |
| `docs/reference/**` (manifests, screenshots, prototype source) | unchanged in `docs/reference/` |
| `docs/governance/**`, `scripts/**`, `.github/**` | unchanged |

The three supplied source PDFs are the artefacts whose identities are recorded in `docs/reference/source-manifest.json`, so they belong in `docs/reference/originals/`. The design handoff ZIP and the per-document PDF/HTML render copies are distribution copies and belong in `docs/exports/`.

## Rules

1. **Move only.** Never re-encode, re-save or rewrite a moved file. Every moved file must keep its exact SHA-256.
2. **Do not re-baseline hashes.** In `docs/governance/foundation.json`, change only the *keys* (paths) of `protectedFiles`; every hash value stays byte-identical. The checker compares the recorded hash with the file at the recorded path.
3. **Update the managed manifest.** Change the `path` values in `docs/governance/files.json` (and a purpose only if the path's meaning changed). The manifest must list every managed file exactly once.
4. **Update byte-preservation rules.** Rewrite the `-text` lines in `.gitattributes` for the new protected paths. The checker lists every protected file that has no covering rule.
5. **Update every reference.** Relative links and plain path mentions in `README.md`, `docs/README.md`, `docs/governance/**`, `.github/**` and the workflow must point at the new paths. The checker's link check must pass with zero failures.
6. **Update the phase allowlist.** Set `foundation.json.foundationPhaseAllowedTopLevel` to the new top-level entries (root files, `docs`, `scripts`, `.github`, dotfiles and `.tmp`).
7. **Update instruction digests only if a path changes.** `foundation.json.instructionDigests` values are content hashes; they stay valid for a pure move. Change a key only if the file's path changes.
8. **Regenerate derived records.** Run `node scripts/governance/record-verification.mjs` (rewrites `docs/governance/verification.json` and re-renders `docs/governance/category-review.md`), then run `node --test scripts/governance/check-foundation.test.mjs` and `node scripts/governance/check-foundation.mjs`.
9. **Keep `README.md` the single starting point.** Do not create a second entry-point document; `docs/README.md` remains the design-handoff index reached from `README.md`.
10. **Do not** change protected content, re-baseline hashes, create a Git repository, install dependencies, deploy, or implement application behaviour.

## Verification required before reporting the move complete

- `node --test scripts/governance/check-foundation.test.mjs` passes with zero failures.
- `node scripts/governance/check-foundation.mjs` prints `PASS bounded governance foundation checks`.
- A SHA-256 comparison of all 45 preserved artefacts against their pre-move values reports zero mismatches at their new paths.
- Every moved file's hash equals its pre-move hash; no file content was rewritten.

## Open decision for the owner

`CONTRIBUTING.md` and `SECURITY.md` are not shown in the target tree. Recommended default: keep both at the repository root, because GitHub recognises `CONTRIBUTING.md` and `SECURITY.md` there and they are contributor and security entry points. Do not move or delete them without an explicit owner decision.

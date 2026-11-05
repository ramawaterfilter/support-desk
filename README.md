# Support Desk V6

Production support-portal design and engineering foundation. **The production application has not been built**; a local development baseline (Express API + React UI on synthetic data) now runs under `apps/` and `packages/`.

Confirmed direction: React/TypeScript UI, TypeScript modular API and worker, PostgreSQL, manual operating launch. AWS is an optional deployment proposal. One eligible manager may self-approve; demo deadlines are test-only, not agreed production SLAs.

## Start here

- [Design handoff](docs/README.md): HLD, LLD, PDFs, captured screens and source evidence.
- [Engineering governance](docs/governance/README.md): assessment, standards, controls, traceability and readiness.
- [Confirmed/open decisions](docs/Decisions.md): business and platform choices; no invented policies.
- [Contributor workflow](CONTRIBUTING.md) and [security reporting](SECURITY.md).
- [AI agent instructions](AGENTS.md).

## Run locally (Windows-compatible, loopback only)

Requires an already installed Node.js 24.x and a completed `npm install` (devDependencies: typescript, vite, tailwindcss, postcss, autoprefixer, eslint + typescript-eslint, prettier, vitest + @testing-library/react + jsdom, eslint-plugin-security, eslint-plugin-no-secrets, license-checker).

```text
npm run typecheck    # strict TypeScript over apps/ and packages/
npm run lint         # ESLint with typescript-eslint, security and no-secrets rules
npm run format:check # Prettier formatting check over apps/ and packages/
npm test             # vitest unit (policy), API (HTTP) and component tests
npm run build        # API build (tsc -> dist/) + web build (vite -> apps/web/dist/)
npm run dev          # builds and runs API on 127.0.0.1:3000 and web on 127.0.0.1:5173
npm run check:audit    # npm audit over the lockfile
npm run check:licenses # third-party license inventory (license-checker --summary)
```

Or run the pieces separately: `npm run start:api` (after `npm run build:api`) and `npm run dev:web`. Verify with `GET http://127.0.0.1:3000/health` (liveness), `GET http://127.0.0.1:3000/ready` (readiness) and `GET http://127.0.0.1:5173/` (UI, which proxies `/api` to the API). Staff sign-in returns 501 until the Google Workspace OIDC integration (M07) is authorized; the UI offers a clearly labelled unauthenticated local preview over synthetic data. The ticket list serves the synthetic seed fixtures in `apps/api/seeds/tickets.json` plus tickets created in the running process; everything is in-memory and resets on restart. The worker (`apps/worker`) compiles but is not started locally: it requires Redis/bullmq. PostgreSQL is not required by the baseline; data endpoints serve synthetic fixtures only.

## Run foundation verification

Requires an already installed Node.js 24.x. Discovery verified Node 24.16.0 locally. No package installation, npm manifest or external service is needed for these two commands.

```text
node --test scripts/governance/check-foundation.test.mjs
node scripts/governance/check-foundation.mjs
```

The checks validate the bounded foundation manifest, local document links, register structure, protected-reference hashes, instruction/configuration safeguards, changed-artifact sizes, and phase controls: in the foundation phase, the absence of application code under `apps/`, `packages/`, `tests/` and `db/migrations/`; in the application phase, the stage controls that replaced that guard (required non-placeholder package scripts, intact lockfile, non-empty application roots and recorded passing `npm run typecheck` evidence). The content scan is a limited secret-pattern heuristic, not a comprehensive secret detector, dependency scan or security audit; the application-level gates run separately as `npm run lint` (ESLint security/no-secrets rules), `npm run format:check`, `npm test`, `npm run check:audit` and `npm run check:licenses`.

## Workspace boundaries

This folder was not a Git repository during discovery. No Git repository/remote, hosted branch protection, cloud account, database, identity provider, CI run or deployment was created by foundation setup. The GitHub workflow runs the two dependency-free foundation commands on every push; its reviewed CI contract forbids dependency installation, so the lint, format, typecheck, test, audit and license gates run locally through the scripts above. Hosted run logs are the evidence for CI, while branch protection and required checks are not configured.

The original design ZIP remains the earlier design deliverable; it does not automatically update when governance files change. Prototype snapshots are synthetic review evidence and are excluded from future application lint/build/source execution. `.tmp/` holds prior rendering/extraction helpers and is not a trusted application toolchain.

For controlled application development, use the [activation checklist](docs/governance/delivery.md#application-gate-activation). Unresolved production policies block their affected live behaviors, not safe unrelated foundation work.

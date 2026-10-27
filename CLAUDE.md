# Buffalog

Working name; the final name is pending (see docs/adr/0001-stack.md). The product name lives only in
`messages.app.name` and this file, so a rename is cheap.

Privacy-first fitness tracker PWA. SvelteKit 3 + Svelte 5 (runes) + TypeScript (strict). SQLite (WASM, OPFS) in a Web Worker. No backend. All data stays on the device.

The build plan is the source of truth for scope. Work one phase at a time and stop for review at the end of each phase (/phase-done).

## Commands

- pnpm dev / pnpm build (includes the 250 KiB gzipped JS budget check) / pnpm preview
- pnpm check: lint, arch, unit tests with coverage, build. Same steps as CI.
- pnpm lint (ESLint, Prettier, svelte-check, tsc, Stylelint, Knip) / pnpm arch (dependency-cruiser)
- pnpm test (fast suites) / pnpm test:e2e (Playwright, Chromium + WebKit) / pnpm test:mutation (Stryker)

## Architecture (non-negotiable)

- Bounded contexts: training, nutrition, body, insights, plus a small shared kernel.
- Layers per context: domain -> application -> infrastructure / ui. Dependencies point inward only.
- Domain: pure TypeScript, no Svelte, no SQL, no browser APIs.
- Domain models, \*Row database models, and \*Mapper converters are always separate types.
- Repositories are interfaces in domain, implemented in infrastructure, wired only in src/lib/app/container.ts.
- Insights uses SQL query services that return read models, not domain entities.
- Every boundary is a consumer-owned interface. Pass only what the receiver needs: narrow commands in, readonly domain models out, value objects instead of primitives past the UI edge.

## Privacy (non-negotiable)

- No network requests outside the app's own origin. No analytics, accounts, or third-party assets.
- No new runtime dependency without an ADR in docs/adr.
- Never log or put user data in URLs.

## Conventions

- Import app code through `#lib/...` with the file extension: `import { messages } from '#lib/i18n/messages.en.ts'`.
- User-facing text: `src/lib/i18n/messages.en.ts`. Identifiers: `*.constants.ts` (`as const`). SQL: `*.sql.ts`. These are the only files where string literals are allowed in `src/`.
- Clock and IdGenerator implementations live in `src/lib/platform/system/`, the only place allowed to read the time or randomness.
- Unit tests sit next to the code as `*.test.ts`; fakes, builders, and e2e live under `tests/`.

## Principles

- DDD, SOLID, YAGNI. Build only what the current phase needs.
- Readable over clever. Small functions, descriptive names.
- TSDoc on every exported symbol. Avoid inline comments; explain intent in TSDoc instead.
- Follow the Code quality enforcement rules: no raw string literals, no direct array indexing, no non-null assertions or casts, no magic numbers, no enums. Never disable a lint rule inline (inline config is turned off).
- Run /review on your own diff before calling any task done.

## Definition of done

- Tests written first for domain and use cases, all suites green, pnpm check passes.
- No new lint, type, or architecture violations. Coverage thresholds met.
- CLAUDE.md files and ADRs updated if a convention changed.

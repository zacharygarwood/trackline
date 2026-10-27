# 0006. Run SQL tests on node:sqlite and WebKit tests in persistent contexts

- Status: accepted
- Date: 2026-10-27

## Context

The plan uses `better-sqlite3` to run repository tests against real SQLite in Node. Node 22.13+ ships `node:sqlite`, a built-in synchronous SQLite with the same capabilities and no native build step.

The plan also runs Playwright on WebKit. Playwright's ephemeral WebKit contexts reject `navigator.storage.getDirectory()` with "UnknownError", so the app can't open its OPFS database there. Persistent contexts work.

## Decision

- **SQL tests** run on `node:sqlite`. The worker's request handling (`executeRequest`) is shared between the real worker and tests: `tests/support/node-sqlite-executor.ts` implements `SqlExecutor`, and `tests/support/test-database.ts` is a `SqlDriver` over it. `WorkerSqlDriver` is tested end to end over a Node `MessageChannel`.
- **Component tests** use `@testing-library/svelte` with jsdom, in a separate Vitest project matching `*.svelte.test.ts`. jsdom has no `HTMLDialogElement.showModal`, so `tests/setup/components.ts` provides a minimal stand-in.
- **Browser-only glue** (`worker.ts`, `open-database.ts`, `wasm-sql-executor.ts`) is left out of unit coverage, because Playwright covers it.
- **End-to-end tests** import `test` and `expect` from `tests/e2e/fixtures.ts`, which gives WebKit tests a persistent context in a temporary profile directory.
- **Local runs on non-Ubuntu Linux:** WebKit runs in the official Playwright Docker image there. CI runs it natively on Ubuntu.

## Consequences

`better-sqlite3` is not needed. Node 24+ is already required (ADR 0001). The `erasableSyntaxOnly` compiler option is dropped: it banned TypeScript parameter properties, which constructor injection relies on. The scripts in `scripts/` still avoid them so Node can run them directly.

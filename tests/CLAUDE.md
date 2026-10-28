# Test rules

- Pyramid: domain and application tests (Vitest, Node) carry most of the confidence; persistence tests run real SQLite through Node's built-in `node:sqlite` (ADR 0006); component tests cover interactive primitives; Playwright covers the short list of critical journeys.
- Unit and integration suites together stay under 10 seconds. Persistence under 3 s, components under 3 s, e2e under 2 minutes in CI.
- Write domain and use case tests first.
- Fakes, not mocks. Every repository interface has a hand-written in-memory fake in `tests/fakes/` that passes the same contract suite as the SQLite implementation.
- Inject `Clock` and `IdGenerator`; no test depends on the real date or randomness.
- Test behavior through public APIs. Never assert on private fields or CSS classes. No snapshot tests of markup.
- Use `expectOk` / `expectErr` from `tests/support/result.ts` to unwrap results.
- SQL tests use `new TestDatabase()` (in-memory `node:sqlite`) from `tests/support/test-database.ts`, with `migrate(database, bundledMigrations)` for the real schema.
- Component tests bind props through a `$state` object with getters and setters (see `NumberPad.svelte.test.ts`).
- E2E tests import `test` and `expect` from `tests/e2e/fixtures.ts`, never from `@playwright/test`, so WebKit gets a persistent context with OPFS.
- Builders in `tests/builders/` keep setup readable: `aWorkout().withSets(3).build()`.
- Test names read as behavior: "rejects a weigh-in above 400 kg".
- Every e2e journey must also pass the network guard: no request leaves the app's origin.
- Coverage: 95% lines for domain, application, and shared; 85% for infrastructure. Stryker mutation score at least 85% on domain and application.

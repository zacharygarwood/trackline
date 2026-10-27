# 0002. Map the code quality rules onto tooling

- Status: accepted
- Date: 2026-10-27

## Context

The build plan requires every code quality rule to fail CI and forbids inline `eslint-disable`. Several rules need a concrete mechanism or a scope that the plan leaves open.

## Decision

- **Inline config is off** (`linterOptions.noInlineConfig`), so a disable comment has no effect. ESLint runs with `--max-warnings 0`.
- **No literal strings** applies to all of `src/`: `i18next/no-literal-string` in `all` mode covers scripts, and a `no-restricted-syntax` ban on non-whitespace `SvelteText` covers Svelte markup, which the i18next plugin does not see. Literals are allowed only in `src/lib/i18n/messages.*.ts`, `*.constants.ts`, and `*.sql.ts`.
- **No numeric indexing** is a `no-restricted-syntax` ban on computed member access with a numeric literal, alongside `noUncheckedIndexedAccess`.
- **No hidden time or randomness** bans `Date.now()`, argument-less `new Date()`, `Math.random`, and `randomUUID` everywhere except `src/lib/platform/system/`, where the Clock and IdGenerator implementations will live.
- **Network APIs** (`fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `navigator.sendBeacon`) are banned in `src/` outside `src/lib/platform/pwa/`.
- **Tests** (`*.test.ts`, `tests/`) relax only `no-magic-numbers`, `no-literal-string`, `max-lines-per-function` (a `describe` callback is long by nature), and required TSDoc. Every other rule applies.
- **Framework and tool config files** (`*.config.*`, `.dependency-cruiser.js`) may use default exports and numbers, since their APIs require it.
- **TSDoc tags** use the TSDoc style: a blank line before tags, `@param name - description`, and untyped `@throws`. `@param` and `@returns` are required only where the types don't say enough, so the lint rules for them are off.
- **Stylelint** limits colors, spacing, radius, and font size to `var(...)` tokens and a few keywords (`0`, `auto`, `none`, `inherit`, `currentcolor`, `transparent`). `src/lib/design/tokens.css` is exempt because it defines the tokens.
- **Literal strings the build reads statically** are allowed in calls to `Error` (developer messages, never shown to users), `URL`, `Worker`, and `import.meta.glob`. Vite requires literal module specifiers and worker options.
- **Rules turned off** because they duplicate TypeScript or fight framework idioms: `import-x/no-unresolved` (TypeScript resolves imports, including `$app/*`), `sonarjs/function-return-type` (union return types are deliberate), and, in `.svelte` files only, `no-useless-default-assignment` (`$bindable()` defaults).
- **Narrow exemptions:** design primitives skip `svelte/no-navigation-without-resolve`, because they receive links the caller has already resolved. The database worker skips `sonarjs/post-message`, because a dedicated worker only hears from its owner. Tool config files skip `max-lines`.
- **Architecture rules** (dependency-cruiser) apply to production code. Test files are excluded, and SvelteKit's `$app/*` modules and Vite `?url` imports count as resolvable.
- **Stryker** runs nightly with `allowEmpty` so the job passes until Phase 1 adds the first domain code.

## Consequences

Changing any of these needs an edit to the shared config and a new or updated ADR.

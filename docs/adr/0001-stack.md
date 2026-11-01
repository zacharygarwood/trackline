# 0001. Use the stack from the build plan

- Status: accepted
- Date: 2026-10-27

## Context

The build plan fixes the stack: static SvelteKit with Svelte 5 runes, strict TypeScript, SQLite WASM on OPFS in a Web Worker, `@vite-pwa/sveltekit`, hand-written SVG charts, fflate, plain CSS with tokens, pnpm, ESLint/Prettier/svelte-check, dependency-cruiser, Vitest, Playwright, and GitHub Pages. The product is called "Steady" in the plan; its name is **Trackline** (trackline.app).

Some current tool versions differ from what the plan assumed.

## Decision

Adopt the plan's stack, on the versions current in October 2026:

- **SvelteKit 3** with `adapter-static`. SvelteKit 3 configures the app through the `sveltekit()` Vite plugin (there is no `svelte.config.js`) and replaces `$lib` with the `#lib/*` subpath import. Imports through `#lib` include the file extension.
- **Svelte compiler in forced runes mode** for app code, which rejects `$:` and `export let` at compile time.
- **ESLint 10 and `eslint-plugin-import-x`** instead of `eslint-plugin-import`, which does not support ESLint 10. The rules (`no-cycle`, `no-default-export`) are the same.
- **simple-git-hooks + lint-staged** for the pre-commit hook: one small dependency each, configured in `package.json`.
- **Dependabot** for dependency updates, grouped weekly. It is built into GitHub and needs no app install.
- **Node 24+**: build scripts in `scripts/` are TypeScript run directly by Node's type stripping.
- Component tests (`@testing-library/svelte` + jsdom) are added in Phase 1, when the first interactive primitives exist.
- Phase 1 deviations: SvelteKit's own service worker instead of `@vite-pwa/sveltekit` (ADR 0005) and `node:sqlite` instead of `better-sqlite3` (ADR 0006).
- The build output uses `404.html` as the SPA fallback, because GitHub Pages serves it for unknown paths. `BASE_PATH` sets the base path for the project-site URL.

No runtime dependencies are added in Phase 0.

## Consequences

The product name appears only in `messages.app.name`, `package.json`, and the CLAUDE.md title, so the rename is a small change. If the plan is read literally (`$lib`, `svelte.config.js`, `eslint-plugin-import`), this ADR explains the differences.

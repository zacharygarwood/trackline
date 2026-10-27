# Buffalog

A small, private tracker for workouts, food, and body weight. Buffalog is a working name.

Buffalog is a Progressive Web App with no backend. Your data lives only on your device. After it loads, the app makes no network requests except to fetch updates of itself from its own origin. CI enforces this with a test that fails if any request leaves the app's origin.

This project is in early development. See `CLAUDE.md` for the architecture and `docs/adr/` for decisions.

## Development

Requires Node 24+ and pnpm.

```sh
pnpm install
pnpm dev          # dev server
pnpm check        # lint, architecture rules, unit tests, build
pnpm test:e2e     # Playwright (run `pnpm exec playwright install chromium webkit` first)
```

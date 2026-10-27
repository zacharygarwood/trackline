# 0003. Ship the CSP through SvelteKit with hashes

- Status: accepted
- Date: 2026-10-27

## Context

GitHub Pages can't set response headers, so the plan requires a strict Content Security Policy in a `<meta http-equiv>` tag with no `unsafe-inline` scripts. SvelteKit's prerendered pages contain an inline bootstrap script, and its route announcer (the screen-reader live region for navigation) uses an inline `style` attribute. The plan doesn't list a `style-src` directive, so styles fall back to `default-src 'self'` and the announcer's style is blocked.

## Decision

Configure the policy in SvelteKit's `csp` option with `mode: 'hash'`. SvelteKit writes the meta tag into every prerendered page and the SPA fallback and adds a hash for its own inline script.

Add `style-src 'self' 'unsafe-hashes' <announcer hash>`, which allows only that exact style attribute. `'unsafe-inline'` stays out of both `script-src` and `style-src`.

## Consequences

Inline `style` attributes in our own components are blocked, which also enforces the design-token rule. A Playwright test fails on any CSP violation, so a SvelteKit upgrade that changes the announcer's style is caught and the hash gets updated in `vite.config.ts`.

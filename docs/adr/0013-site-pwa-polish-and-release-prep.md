# 0013. Public site, PWA polish, and release preparation

- Status: accepted
- Date: 2026-10-28

## Context

Phase 8 adds the public site (landing, privacy, FAQ), the native-feel items that were still missing, an accessibility audit, and the release paperwork. The v1 feature list's first-day-of-week setting had not been built in any earlier phase.

## Decision

- **Site:** `/`, `/privacy`, and `/faq` live in a `(site)` route group with a shared footer (Privacy, FAQ, Source, Donate, copyright) and are prerendered. Copy lives in `messages`; external URLs live in `src/lib/ui/external-url.constants.ts` and render through the `ExternalLink` design primitive, a plain link that opens in the browser. Nothing from other sites is ever loaded.
- **Screenshots:** `pnpm screenshots` builds a demo backup in Node from the real migrations, restores it through Settings in a real browser, and captures Today and Stats in both themes into `static/screenshots/`. The landing page picks the light or dark pair with `<picture>`. Re-run it whenever those screens change.
- **Updates:** a new version downloads in the background and waits. The shell shows "A new version is ready" with Reload; only that tap tells the waiting service worker to take over, and the page reloads when it does. An update never interrupts a workout.
- **Install hint:** Safari on iPhone and iPad (the only browsers with `navigator.standalone`, and the only ones that need Add to Home Screen) shows a one-line hint until it is dismissed. The dismissal is stored in `app_setting`. Android browsers use their own install prompt.
- **View transitions:** navigation uses the View Transitions API where it exists, with the header and tab bar held in place. The transition uses `--duration-quick`, which is 0 ms under `prefers-reduced-motion`.
- **First day of week:** a Monday/Sunday preference in Settings, stored in `app_setting` and read by the Stats heatmaps. This replaces ADR 0010's fixed Monday. The Train tab's "This week" stays the last seven days, which needs no week start.
- **Composition root:** `src/lib/app/container.ts` grew past the file size limit, so it now assembles one `wire-<context>.ts` module per context, with the shared `Infrastructure` type in `infrastructure.ts`. The architecture rule allows only these modules to import infrastructure.
- **Accessibility audit:** `tests/e2e/accessibility.e2e.ts` runs axe-core's WCAG 2.2 A and AA rules on every screen in both themes and on open sheets, and drives the main flows by keyboard alone. It found one real problem on iPhone-sized screens: a control focused near the bottom edge could sit hidden under the sticky tab bar (WCAG 2.4.11). `scroll-padding-bottom` set from the new `--tab-bar-height` token fixes it, and a test that fails without it guards it. `@axe-core/playwright` is a development dependency only; it never ships to users.

## Consequences

The manual pass on a real iPhone and Android phone can't be automated and remains a release step. The v1.0.0 tag waits for that pass and for the final product name.

# 0021. Named themes instead of dark or light plus an accent

- Status: accepted; replaces the dark and light modes and five accents of ADR 0018
- Date: 2026-10-30

## Context

The owner asked for themes in the spirit of typing-test apps: many named palettes to pick from, each drawn in its own colors. The app had a dark or light mode and a separate accent color.

## Decision

- The `theme` preference is one of 13 named themes: System (follows the device), Dark, Light, Forest, Ocean, Dusk, Ember, Slate, Mocha, Sand, Mint, Blossom, and Glacier. The names and palettes are original.
- Each theme sets six colors in `tokens.css` (background, text, muted text, accent, danger, text on the accent). Surfaces, dividers, field lines, and placeholders are mixed from text and background with `color-mix(in oklab, …)`, so a theme is six lines and `data-theme` on any element previews that theme inside it. The theme picker is a list where each row is drawn in its own theme with a sample tracker bar, and a small square marks the current one.
- The `accent` preference is gone. An `accent` row left by older versions is ignored; existing `dark` and `light` values keep working.
- Every palette was checked for WCAG 2.2 AA (4.5:1 for text and the accent, 3:1 for field lines), and an e2e test runs the axe audit on the main screens in every theme.

## Consequences

Adding a theme is six colors in `tokens.css`, one `Theme` value, and one name in `messages.en.ts`, after checking its contrast. Users who had picked an accent get their theme's own accent instead.

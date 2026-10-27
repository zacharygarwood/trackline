# 0004. Calm, single-accent visual design

- Status: accepted
- Date: 2026-10-27

## Context

The plan asks for a calm, quiet, obvious app in the spirit of timeful.app and Capy Reader, and for a design ADR after looking at both sites.

What they do:

- **Timeful**: white background, one green accent for actions and selection, the system font stack, rounded corners of 6–12 px, pill-shaped buttons, and very little else on screen.
- **Capy Reader** (capyreader.com): a single column capped at about 600 px. One muted accent on a warm off-white. Short, modest copy ("A smallish Android RSS reader…"). The landing page is only a hero, the name, one line of description, install links, and a footer.

## Decision

- **Palette:** a warm near-white (`#fafaf8`) or near-black (`#121211`) background following the system theme, one surface tint, one divider color, and one green accent (`#1d7348` light, `#62c08d` dark) used only for primary actions, the current tab, focus rings, and progress. Every text pairing meets WCAG 2.2 AA: body text ≥ 15:1, muted text ≥ 5.4:1, accent on background ≥ 5.6:1, text on the accent ≥ 5.8:1.
- **Type:** `system-ui`, three working sizes (small, body, title) plus one display size for the landing page and big numbers. Regular and semibold only. Numbers use tabular figures.
- **Shape and space:** a 4 px spacing scale, 6/12/20 px radii, pill buttons, 44 px minimum tap targets, and content capped at 600 px.
- **Chrome:** the title on the left, a settings control on the right, a bottom tab bar with icons and labels. Hairline dividers, no shadows, gradients, or illustrations.
- **Icons:** a small hand-drawn set on a 24 px grid with 2 px round strokes, stored as path data. No icon library.
- **Copy:** plain and short. Empty states say what belongs there and offer the one action that fills it.

All values live in `src/lib/design/tokens.css`. The theme colors also appear in `src/app.html` and `static/manifest.webmanifest`, which can't read CSS variables.

## Consequences

A new color or size starts as a token. The app icon (rising bars on the accent) is a placeholder until the final name is chosen.

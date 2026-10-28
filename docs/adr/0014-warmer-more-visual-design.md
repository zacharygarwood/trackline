# 0014. A warmer, more visual design

- Status: accepted; supersedes the palette and "nothing decorative" parts of ADR 0004
- Date: 2026-10-28

## Context

After using the app, the owner found it bland: mostly text and buttons. They asked for a professional, polished feel with visuals and well-made components, a vibrant clay color for buttons instead of green, and rest days in a more noticeable color, while keeping the app simple.

## Decision

- **Palette:** a warm off-white background with white cards (near-black and dark cards in dark mode). The accent is a vibrant clay (`#B94A26` light, `#E8784C` dark) for primary actions, progress, the current tab, and workouts. Rest days have their own blue (`#2F6FB0` / `#7EB3EE`) everywhere: the week strip, the training heatmap, and legends. Protein, carbs, and fat each get a color, used only for bars and rings; text stays neutral. Every text pairing still meets WCAG 2.2 AA; clay text on the clay tint uses a deeper clay to do so.
- **Components:** `Card` (a raised surface with an optional icon badge), `IconBadge`, `Ring` (circular progress), toned `ProgressBar`s, `Illustration` (a large icon on a soft organic shape with colored dots), and `UnitField`. Primary buttons are taller, with a soft clay shadow and a press effect; secondary buttons are clay on a clay tint. The current tab sits in a clay pill. Titles are larger.
- **Screens:** Today shows a calorie ring with colored macro bars, the weigh-in as a large number, and a seven-day strip with a clay check for workouts and a blue moon for rest days, next to a flame streak. Empty states and the welcome screen show an illustration. Stats' current streak is a clay card.
- **Still simple:** one primary action per screen, no gradients, no photos or third-party artwork. Illustrations are drawn from the app's own icon set, so they cost nothing extra and stay on-brand.

## Consequences

Light-mode shadows and soft tints mean more tokens; new colors must start in `tokens.css` and pass the axe contrast audit. Screens not yet moved to cards (Train lists, Eat, Body, Settings) follow in a second pass, and `pnpm screenshots` must be re-run so the landing page matches.

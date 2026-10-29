# 0015. A plain, list-based tracker design

- Status: superseded by ADR 0016 (keeps the single clay accent, blue rest days, and headline stats)
- Date: 2026-10-28

## Context

The visual pass in ADR 0014 (rings, illustrations, icon badges, shadows, a flame streak) read as generic and game-like. The owner wants the app to feel like a functional tool in the style of Capy Reader: very easy to use, with good stats, and like a tracker rather than a gamified app.

## Decision

- **Look:** a neutral off-white background, flat white cards with a hairline border and no shadow, and a 12 px radius on cards, buttons, and segmented controls. Dark mode uses neutral greys. Clay (`#B94A26` / `#E8784C`) is the only accent: primary buttons, progress bars, chart lines, workouts, and the current tab. Rest days stay blue. Secondary buttons are outlined and neutral.
- **Structure:** every screen is a stack of `Card` groups. Each group has a small heading, an optional trailing value (a total, the latest weight, a link), and rows separated by dividers. Lists run edge to edge inside `flush` cards. A titled card is a labelled region.
- **No game elements:** the ring, illustrations, icon badges, flame, and per-macro colors are gone. The streak shows only in Stats, as two plain numbers. The seven-day strip reports a count ("3 workouts · 3 rest days").
- **Stats lead with numbers:** each chart opens with a headline: the latest 7-day average weight and how far it moved in the range, average daily calories and protein against the goal, and the latest estimated one-rep max and its change.

## Consequences

Fewer tokens and components. New screens should compose `Card`, rows, and plain numbers rather than add decoration. Any new color still starts in `tokens.css` and must pass the axe contrast audit.

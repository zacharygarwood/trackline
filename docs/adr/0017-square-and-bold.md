# 0017. Square and bold: the owner's prototype design

- Status: superseded by 0018
- Date: 2026-10-29

## Context

The owner designed a full prototype ("Working prototype", a standalone HTML mockup) and asked for the app to match it. Besides the look, the prototype adds features: a dark/light switch with five accent colors, inline search-or-add lists instead of sheets, a rest timer, and exercises tracked by time, distance, count, or grade. Those are separate phases. This decision covers only the visual restyle. The prototype loads Inter Tight from Google Fonts. The owner chose to keep the bundled IBM Plex Sans, so no new dependency and no third-party request.

## Decision

- **Colors:** an off-white light theme (`#F6F6F3`) and a near-black dark theme (`#0B0B0C`), taken from the prototype, with a sky-blue accent. The prototype's light accent, `#1784C7`, is 3.8:1 on the background, below AA for text, so light mode uses `#1272AD` (4.8:1, and 5.2:1 for white text on it). Dark mode keeps `#5BC4F5`. Control borders use `--color-edge`. Field underlines and switch outlines use `--color-field-line`, which meets the 3:1 non-text contrast minimum. Rest days are no longer blue, because the accent is: they show as a stronger neutral (`--color-surface-strong`).
- **Shape:** square corners everywhere (the radius tokens are 0). Controls have 1.5 px borders. Chosen segments, primary buttons, the switch when on, and notices are filled with the accent.
- **Numbers:** headline figures are large and bold, with a small dimmed suffix (`BigNumber`): 72 px for Today's calories, 44 px for section figures, 32 px for figures beside others. Progress toward a goal is a row of 40 ticks (`ProgressBar`), rounded to whole ticks.
- **Text sizes:** this replaces ADR 0016's three sizes. 17 px for content, 15 px semibold for section labels in sentence case (no more uppercase), 12 px for tab labels and the week letters, 22 px for sheet titles, plus the number sizes above. All sizes live in `tokens.css`.
- **Layout:** a 20 px gutter. Rows are 56 px tall and the tab bar is 72 px, with an accent bar over the current tab. The header has no divider: a muted page name and a sliders icon for Settings. Eat is labeled Food and comes second.
- **Today:** three tappable sections (`SectionLink`), each opening its tab: calories and macros with tick bars; this week as seven squares (workout, rest day, today, or a day still ahead); and the latest weight with a sparkline (`Sparkline`) of the last 30 weigh-ins. The + buttons on Today are gone. Adding happens on each tab.

## Consequences

Screens built from the primitives picked up the new look without changes. Later phases will add the prototype's theme and accent settings, inline flows, rest timer, and exercise kinds, each recorded separately. Because the accent is now user-facing blue, anything that used blue to mean "rest" must use the neutral instead.

# 0016. Utilitarian lists, IBM Plex, and floating add buttons

- Status: accepted; supersedes ADR 0015 except its single clay accent, blue rest days, and headline stats
- Date: 2026-10-28

## Context

The bordered-card design in ADR 0015 still felt generated rather than designed. The owner asked for something more utilitarian, like Capy Reader: a different font, no filler text ("Weighed in today", "Nothing logged"), add buttons that aren't stacked at the top of each screen, a darker dark mode, and a workout screen that is quicker to fill in. The seven-day strip was confusing.

## Decision

- **Font:** IBM Plex Sans for text and IBM Plex Mono for numbers (totals, weights, sets, stats). The fonts come from the `@fontsource-variable/ibm-plex-sans` and `@fontsource/ibm-plex-mono` dev dependencies (SIL Open Font License 1.1). `src/lib/design/fonts.css` references only the Latin files (about 76 KB), so only those are built and precached. They are served from the app's own origin, so the privacy rule and CSP are unchanged. Knip ignores both packages because only CSS `url()`s reference them.
- **Layout:** no cards. Each `Card` is a full-width section: a small uppercase label, its rows, then a hairline divider across the screen, as in Material list apps. Labels sit on the left, values on the right in the mono font. `Row` is the label and value pair. The header bar has a divider.
- **Colors:** white in light mode, true black in dark mode (`#000`, with `#1A1A1A` fields and `#262626` dividers). Clay is still the only accent and rest days are still blue.
- **Add actions:** a floating `Fab` (bottom right, above the tabs) for each screen's main action: Start workout, Log food, Weigh in, Add photo. On Today, each section has a + in its label row (`IconButton`), and adding at the end of a list uses `AddRow` ("+ Add set").
- **No filler:** empty meals and lists show nothing rather than a sentence. Today shows "—" for a missing weigh-in. A new exercise shows no hint.
- **Training days:** the seven-day strip is gone. Train shows a "Rest day" switch for today while there is no workout today, Today shows the number of workouts in the last seven days, and history lives in the Stats heatmap.
- **Workout:** each exercise is a set table (set number, weight, reps, check, remove) with typed `NumberField`s instead of − / + steppers. Removing an exercise moves into its ⋯ sheet. `Stepper` is removed.

## Consequences

The fonts add about 76 KB to the first load (not counted in the JavaScript budget) and are cached offline with everything else. Screens should compose sections, rows, and plain numbers. New entry points use the FAB or a section's +, not a button at the top of the screen.

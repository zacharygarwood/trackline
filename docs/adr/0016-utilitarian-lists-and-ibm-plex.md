# 0016. Utilitarian lists, IBM Plex, and floating add buttons

- Status: accepted; supersedes ADR 0015 except its single clay accent, blue rest days, and headline stats
- Date: 2026-10-28

## Context

The bordered-card design in ADR 0015 still felt generated rather than designed. The owner asked for something more utilitarian, like Capy Reader: a different font, no filler text ("Weighed in today", "Nothing logged"), add buttons that aren't stacked at the top of each screen, a darker dark mode, and a workout screen that is quicker to fill in. The seven-day strip was confusing.

## Decision

- **Font:** IBM Plex Sans only, with tabular figures everywhere so numbers line up. A second, monospaced font for numbers was tried and dropped: mixing two fonts made sizes look uneven. The font comes from the `@fontsource-variable/ibm-plex-sans` dev dependency (SIL Open Font License 1.1). `src/lib/design/fonts.css` references only the Latin file (about 46 KB), so only that is built and precached. It is served from the app's own origin, so the privacy rule and CSP are unchanged. Knip ignores the package because only a CSS `url()` references it.
- **Three text sizes:** 16 px for all content, 12 px uppercase for section labels, column headers, and tab labels, and 22 px for page and sheet titles. The only exceptions are chart axis labels and the large number shown while typing on the number pad. There is no "small" size.
- **Layout:** no cards. Each `Card` is a full-width section: a 36 px label row, its rows, then a hairline divider across the screen, as in Material list apps. Every line of content is a `Row`, 48 px tall, with the label on the left, an optional dimmed detail after it, and the value right-aligned. A `Row` can also be a button, a link, or carry a trailing control (⋯), so lists, settings, stats, and totals all line up the same way. Icons in label rows and the day switcher are offset so their glyphs, not their tap targets, align with the 16 px gutter. The header bar has a divider and a gear icon for Settings.
- **Colors:** white in light mode, true black in dark mode (`#000`, with `#1A1A1A` fields and `#262626` dividers). Clay is still the only accent and rest days are still blue.
- **Add actions:** a floating `Fab` (bottom right, above the tabs) for each screen's main action: Start workout, Log food, Weigh in, Add photo. On Today, each section has a + in its label row (`IconButton`), and adding at the end of a list uses `AddRow` ("+ Add set").
- **No filler:** empty meals and lists show nothing rather than a sentence. Today shows "—" for a missing weigh-in. Charts have no legends (each has a text summary for screen readers), and Stats shows its numbers as rows above each chart. Settings shows the last backup as a row instead of an explanation.
- **Training days:** the seven-day strip is gone. Train shows a "Rest day" switch for today while there is no workout today, Today shows the number of workouts in the last seven days, and history lives in the Stats heatmap.
- **Workout:** each exercise is a set table (set number, the same set last session, weight, reps, check, remove) with typed `NumberField`s instead of − / + steppers. The "Prev" column replaces the "Last time: …" sentence. Removing an exercise moves into its ⋯ sheet. `Stepper` is removed.

## Consequences

The font adds about 46 KB to the first load (not counted in the JavaScript budget) and are cached offline with everything else. Screens should compose sections, rows, and plain numbers. New entry points use the FAB or a section's +, not a button at the top of the screen.

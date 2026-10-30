# 0018. Match the owner's prototype, look and behavior

- Status: accepted; supersedes ADR 0017, and ADR 0016's font, Today layout, sheets, and floating add buttons
- Date: 2026-10-29

## Context

The owner designed the whole app as an interactive prototype ("Working prototype", a standalone HTML mockup) and asked for the app to look and work exactly like it. ADR 0017 had only restyled the existing screens. The prototype also changes how every screen works and adds features: a dark or light switch with five accent colors, inline search-or-add lists instead of sheets, exercises that track time, distance, grades, or counts, a rest timer, and a different Stats screen.

## Decision

- **Look:** the prototype's values are the design tokens: Inter Tight, near-black and off-white themes, square controls with 1.5 px borders, large bold numbers over rows of 40 ticks, and its exact font sizes (named by pixel size in `tokens.css`). The font comes from the `@fontsource-variable/inter-tight` dev dependency (SIL Open Font License 1.1), bundled and served from the app's own origin like IBM Plex before it, so the privacy rule and CSP are unchanged. Only the Latin file is referenced (about 45 KB).
- **Theme and accent:** dark by default, as in the prototype, switched in Settings. The theme and accent are `data-theme` and `data-accent` on `<html>`. Light accents are darkened just enough to pass WCAG AA (sky #1475B1, jade #12805E, clay #B85318, rose #C83C64; violet passes as designed). The landing and help pages use the dark theme too.
- **Preferences:** theme, accent, carbs-and-fat tracking, distance unit, new-food unit, rest timer, and the weekly workout goal form one `Preferences` model in the settings context, stored as `app_setting` rows. Screens read them through a shared `AppPreferences` state set by the app shell.
- **Training:** an exercise has a `Tracking`: which of weight, reps, time, distance, grade, and count it records, its grade scale (V, YDS, Font, 1 to 10, or custom), and what a count is of. A set records only those measures. Migration 0006 adds the tracking columns, with existing exercises tracking weight and reps, and rebuilds `workout_set` with every measure optional. Workouts no longer pre-fill planned sets: each logged set is completed, reps exercises aim for three sets (or the template's count), and the steppers start from last session. Finishing or discarding can be undone (`RestoreWorkout`).
- **Screens:** Today shows the date and links its sections to their tabs. Food is a search-or-add list with one-tap adds, inline steppers, an inline new-food form, and today's list. Meal slots stay in the data, chosen by the hour, and are not shown. Train lists saved workouts and recent exercises, with an inline new-exercise form and a New workout builder. The workout screen has exercise chips, big steppers, set boxes, a stopwatch, grade buttons, and a rest countdown. Body is a check-in (weight and photo) with a 90-day chart, a photo grid, and Compare. Stats has a 1M to All range, a two-year heatmap shaded by workout minutes, weight, weekly calories against the goal, a card per exercise, and recent workouts. Confirmations are toasts with Undo.
- **Kept beyond the prototype:** Settings keeps the first day of the week, backup and restore, delete all, and About, below the prototype's sections. The welcome screen stays.
- **Removed from the UI:** saved meals, browsing other days' food log, rest days, renaming, reordering, and deleting saved workouts, the weight goal, photo poses, and the old Stats streaks, food heatmaps, and one-rep-max chart. Their data and use cases remain where other code or backups still need them.

## Consequences

Screens follow the prototype's markup closely. Each screen has a `*.svelte.ts` view model, and logic sits in plain modules with tests. A feature that needs a removed screen element needs a new design decision first. The two-year heatmap scrolls sideways, so its scroll area is a labelled region that takes keyboard focus.

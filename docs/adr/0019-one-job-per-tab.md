# 0019. One job per tab; rows open pages

- Status: accepted; amends ADR 0018's screens (its look, preferences, and training model stay)
- Date: 2026-10-30

## Context

The owner found every tab cluttered: each one showed several sections, and tapping a row expanded a stepper, a form, or details in place. They asked for each tab to have a single focus, and for tapping an item to open a new page instead.

## Decision

- **Tabs keep one job, as plain rows.** Food: calories, an Eaten today row (the full totals live on that page), search, and foods as rows that open their Add page. Train: saved workouts as rows, then One exercise (a page with search) and New workout. Body: today's check-in, with Last 90 days and Photos rows. Stats: five rows (Workout days, Weight, Daily calories, Exercises, Recent workouts); the range picker and charts live on each row's page. Today is unchanged.
- **Calmer type and fewer lines.** Headline numbers are smaller (44 px at most outside the workout), and navigation rows have no dividers between them.
- **Nothing expands in place.** A food opens its amount page (there is no one-tap + any more); Add “name” opens a create page; an eaten entry opens a page to change or remove it; a saved workout opens a page with its exercises and Start; the workout's + opens Add exercise; a recent workout opens its details. The New workout builder keeps its inline exercise form, since leaving it would lose the workout being built.
- **Pages** use `PageHeader` (back link and title) and list rows use `NavRow`. They have no tab header and keep the tab bar.
- **Which item a page shows** is passed in SvelteKit page state (`App.PageState`: `selected`, `name`, `toWorkout`, `range`), never the URL: ids are UUIDv7 and carry a creation time. After a reload the state is gone, and the page sends the user back to where it was opened from.
- **Undo across pages.** A toast's Undo can run after its page has closed, so `Toaster` counts undos and `reloadOnUndo` reloads the screen being shown.

## Consequences

More routes (16 pages under the tabs), each small. Every page loads its own view model; the Stats pages reload Stats for the range they were opened with. A reloaded page that needed state falls back to its list, which is a small cost of keeping ids out of URLs.

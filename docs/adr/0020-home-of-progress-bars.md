# 0020. Home of progress bars; trackers instead of tabs

- Status: accepted, amended 2026-10-30 (tabs restored, Settings split into pages, thicker bars); replaces the five tabs of ADR 0018 and the tab layouts of ADR 0019 (rows still open pages)
- Date: 2026-10-30

## Context

The owner still found the tabs cluttered and asked for one home page with a progress bar for everything they track, chosen in Settings. Tapping a bar should open a page with the actions for it. Workouts must still be tracked and started. Stats had no clear home. They asked for new components with a calm, simple feel.

## Decision

- **Home** (`/app`) is the only main screen: the date, the Settings gear, the resume bar during a workout, and one `ProgressRow` per tracker. There is no tab bar.
- **Trackers** are calories, protein, carbs, fat, workouts this week, and weight toward the goal. The `homeTrackers` preference (an ordered list in `app_setting`, default calories, protein, workouts, weight) chooses which show; Settings has a switch for each, offering carbs and fat only while they are tracked.
- **Tracker pages:** calories, protein, carbs, and fat open Food (bars, search and add, Eaten today, Daily calories); workouts open Workouts (this week's bar, saved workouts, One exercise, New workout, then Workout days, Exercises, and Recent workouts); weight opens Weight (the goal bar, check-in, Trend, Photos).
- **Stats live with their tracker.** The Stats tab is gone; its pages keep their range picker and are reached from the tracker they describe.
- **Weight goal** is set in Settings. Progress runs from the first weigh-in to the target, and the direction follows from the latest weigh-in.
- **Calm components:** `ProgressRow` is a quiet label and numbers over a 6 px rounded bar, with no dividers; page titles are 22 px semibold. The tick bars, sparkline, week strip, macro totals, and tab bar were removed.

## Amendment: tabs, Settings pages, and softer bars

The owner liked Home but asked for bottom tabs for the main pages, a list of Settings pages instead of one long screen, an easy-to-find Support page, and more appealing bars.

- **Tabs:** Home, Food, Workouts, and Weight sit in a bottom `TabBar` on every page but Welcome. Each section names its `tab`, so subpages light their tab. Tab pages use `PageHeader` with no back link; Settings stays behind the gear on Home.
- **Settings** is a list of `NavRow`s, each opening a page: Home screen, Theme, Goals, Units and tracking, Backup and data, then Support the app (a Ko-fi link) and About.
- **Bars** are the app's signature: a 32 px square bar in solid colors (no gradients, no rounding), the label and numbers above it, and nothing inside it. A met goal is just a full bar, with no check. The numbers are terse: "811 / 2,200 kcal", "4 / 4", "80.2 to 78.0 kg". Themes are in ADR 0021.

## Consequences

Every screen is one tap from Home and back. Old tab URLs still work as tracker pages except `/app/stats` and `/app/body/trend`, which are gone. A bar without a goal shows a hint to set one in Settings instead of an empty bar.

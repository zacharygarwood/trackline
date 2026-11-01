# 0024. Trackers built from building blocks

- Status: accepted; replaces the tap-to-add trackers of ADR 0023 and the Home switches and Settings → Goals of ADR 0020
- Date: 2026-10-30

## Context

Tap-to-add custom trackers worked nothing like the built-in bars. The owner wants anyone to track anything on their health and wellness journey, from presets and from the same building blocks the built-in trackers use, with the built-ins being just the starting set.

## Decision

- **One kind of tracker.** A tracker (Trackers context, migration 0009) is a name, a **measure**, a **goal** that is either at least or at most, and a **day or week**. Home shows every tracker in its order; nothing else does.
- **Measures** come from four sources:
  - Food log: calories, protein, carbs, fat, or the amount of one food.
  - Workouts: finished workouts, or one exercise's sessions, distance, time, reps, or completed sets.
  - Weigh-ins: weight toward a target, filling from the first weigh-in.
  - The user's own log: a number with their unit, minutes, a 1–5 rating, or done. Numbers and minutes add up or average over the period, ratings average, and done counts days.
- **Reading other contexts.** `TrackerSources` is a port owned by Trackers. Its SQLite version reads the food log, workout, and weigh-in tables directly, like Insights, so no context imports another.
- **Goals live on the tracker.** Settings → Goals is gone. Saving a daily calorie or macro tracker also saves the food goal, and saving a weight tracker saves the weight goal, so Stats and the food log stay in step. Workouts a week now lives only on its tracker.
- **Starting trackers** are made once, after Welcome, from the bars Home used to show and the goals already set. Weight joins only if a goal weight is set. Deleting every tracker doesn't bring them back.
- **Pages.** Settings → Home screen lists the trackers to reorder or edit, then Add tracker: presets first (calories, protein, carbs, fat, workouts, weight, run, climb, water, sleep, steps, meditate, mood, vitamins, coffee), then Build your own (From → What → which food or exercise → name, goal, at least or at most, day or week). Tapping a food, workout, or weight tracker on Home opens its tab. Tapping one of your own opens its page, where you log a value, rate, or mark done, and remove past entries. Stats charts each logged tracker week by week.

## Consequences

The `homeTrackers` preference and the weekly workout goal are only read once, to make the starting trackers. Distance goals are stored in metres and weight goals in kilograms, and shown in the user's units. A tracker of an exercise or food keeps working if that exercise or food is later deleted from the library.

# 0023. Custom trackers on Home, and all trends on a Stats tab

- Status: accepted; its tap-to-add custom trackers are replaced by ADR 0024; refines ADR 0020 and ADR 0022
- Date: 2026-10-30

## Context

The owner wants to track anything, not only the built-in calories, protein, carbs, fat, workouts, and weight. They missed a single place for all their progress, and found bars on the Food, Workouts, and Weight tabs distracting. "Just one exercise" and "Empty workout" were confusing, the main buttons looked like tracker bars, and an empty workout could trap you on Add exercise.

## Decision

- **Custom trackers** live in a new Habits context (`habit` and `habit_entry`, migration 0008). A tracker has a name, an optional unit, a goal, an amount per tap, and a day or week period. Home shows the built-in trackers chosen in Settings, then every custom tracker. Tapping a custom tracker adds its amount for today, with undo. "Add tracker" on Home creates one; Settings → Home screen lists them for editing or deleting.
- **Trackers only on Home.** Food, Workouts, and Weight show no bars and no counts: just one outlined action (`ActionButton`, never filled like a bar) and rows.
- **A Stats tab** joins Home, Food, Workouts, and Weight. It holds every trend for the chosen range: workout days, calories, weight, and each exercise's progress. Past workouts and Past days stay under their tabs as plain lists.
- **Start workout** is one page: your saved workouts, then a searchable exercise list. Tapping either starts (or adds to) a workout. "Just one exercise" and "Empty workout" are gone.
- **Opening an exercise** goes straight to renaming and deleting it; its progress is on Stats.
- **Add exercise** goes back to Workouts when the workout has no exercises, instead of looping.

## Consequences

`/app/stats/{weight,calories,exercises,workouts,workout,days}` are gone. Past workouts are at `/app/train/history` and Past days at `/app/eat/days`. Custom trackers can't yet show history or take a typed amount; each tap adds the set amount.

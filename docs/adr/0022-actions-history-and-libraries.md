# 0022. Workouts and Food: one action, history, and libraries you can edit

- Status: accepted, partly superseded by ADR 0023 (Start workout, trends, and bars on tabs); refines the tracker pages of ADR 0020
- Date: 2026-10-30

## Context

The owner found the Workouts and Food tabs hard to read: "Start" and "Progress" were unclear, Recent workouts and Workout days overlapped, "Eaten today" and "Daily calories" were odd names, and there was no way to find and edit a saved workout, an exercise, or a food.

## Decision

- **One model.** An exercise is one movement you reuse (Squat). A saved workout is a named list of exercises (Leg day). A food is something you log.
- **Each tab is its bar, one main button, then three rows.**
  - Workouts: _Start workout_ (saved workouts, Just one exercise, Empty workout), then Past workouts (the workout-days calendar and the list of finished workouts on one page), My workouts (open one to start, edit its exercises, or delete it), and Exercises (the library; open one for its progress, then Edit to rename or delete it).
  - Food: _Add food_ (search, recent foods, add a new one), then Today (what you ate), Past days (the calorie chart and earlier days; open a day to fix its entries), and My foods (edit a food's name, portion, and macros, or delete it).
- **Deleting hides.** Migration 0007 adds `archived` to `exercise` and `food`. A deleted exercise or food leaves the library and search, but past workouts and the food log keep it. Creating an exercise with a deleted one's name brings it back. An exercise in a saved workout can't be deleted until it is taken out.
- **Editing keeps history.** Renaming an exercise renames it everywhere. Editing a food changes future logs only, because entries keep a snapshot. Editing a saved workout keeps the target sets of the exercises it keeps.

## Consequences

New use cases: RenameExercise, DeleteExercise, EditTemplate, UpdateFood, DeleteFood. Workout days no longer have their own page, and `/app/stats/days` is gone. Exercises can be renamed but not changed in what they track, because logged sets depend on it.

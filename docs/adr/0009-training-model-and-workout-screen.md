# 0009. Training model and the workout screen

- Status: accepted
- Date: 2026-10-27

## Context

Phase 4 builds exercises, workouts, sets, templates, rest days, and streaks. The plan leaves several behaviors open: what finishing keeps, when a workout replaces a rest day, what "reorder templates" means, how past rest days are marked, and how quick successive edits stay consistent.

## Decision

- **Workouts** are `ActiveWorkout | FinishedWorkout`. At most one is active, enforced by a partial unique index. Exercise and set order is the array order, so positions are contiguous by construction and are recomputed on save.
- **Finishing** keeps only completed sets and the exercises that have any. A workout with nothing completed is discarded. Finishing (not starting) a workout on a rest day removes the rest day, so an abandoned workout never erases a planned rest day.
- **Suggestions:** a new set copies the previous set in this workout, then the same set from the last session, then 10 reps at bodyweight. Starting from a template pre-fills each set position from the last session (`prefillSets`).
- **Templates** come from finished workouts, with target sets equal to the completed sets (capped at 20). "Reorder" means the order of templates in the list. Moving or deleting a template renumbers positions from 0.
- **Rest days:** a date with a finished workout can't be a rest day. The Train tab shows the last seven days with a rest-day toggle on each day without a workout. That covers "today in one tap" and "past days from history". Today's toggle also comes to the Today tab in Phase 5.
- **Streak:** shown on the Train tab now, and on Today and Stats later. Today never breaks a streak.
- **Editing sets:** set rows send field-level changes (reps, weight, completed). The session queues them and applies each one to the latest saved set, so a fast sequence of edits can't overwrite one another. Weights are entered in the user's unit, and changing reps never round-trips the weight through a unit conversion.
- **Layout:** a set row is two lines (set number and remove; reps, weight, and check) so it fits a 360 px phone with 44 px tap targets.
- **Haptics:** completing a set vibrates briefly when `navigator.vibrate` exists. On iPhone nothing happens.

## Consequences

Phase 6's exercise-progress chart reads finished workouts. Its one-rep max (Epley) is added there, when a feature needs it.

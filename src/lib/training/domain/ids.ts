import type { Id } from '../../shared/id.ts';

/** Identifies an exercise in the user's library. */
export type ExerciseId = Id<'Exercise'>;

/** Identifies a workout. */
export type WorkoutId = Id<'Workout'>;

/** Identifies a workout template. */
export type WorkoutTemplateId = Id<'WorkoutTemplate'>;

/** Identifies a rest day. */
export type RestDayId = Id<'RestDay'>;

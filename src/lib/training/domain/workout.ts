import type { LocalDate } from '../../shared/local-date.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import type { ExerciseId, WorkoutId, WorkoutTemplateId } from './ids.ts';
import { WorkoutStatus } from './workout-status.constants.ts';
import type { WorkoutSet } from './workout-set.ts';

/** An exercise as performed in one workout, with its sets in order. */
export interface WorkoutExercise {
	readonly exerciseId: ExerciseId;
	readonly sets: readonly WorkoutSet[];
}

interface WorkoutFields {
	readonly id: WorkoutId;
	/** The day the workout counts for. */
	readonly date: LocalDate;
	/** When it started, in epoch milliseconds. */
	readonly startedAt: number;
	readonly note: string;
	readonly sourceTemplateId: WorkoutTemplateId | undefined;
	/** Exercises in the order they were done. */
	readonly exercises: readonly WorkoutExercise[];
}

/** A workout in progress. There is at most one. */
export interface ActiveWorkout extends WorkoutFields {
	readonly status: typeof WorkoutStatus.active;
}

/** A finished workout, holding only the sets that were completed. */
export interface FinishedWorkout extends WorkoutFields {
	readonly status: typeof WorkoutStatus.finished;
	/** When it finished, in epoch milliseconds. */
	readonly finishedAt: number;
}

/** A workout in either state. */
export type Workout = ActiveWorkout | FinishedWorkout;

/** What a new workout starts with. */
export type NewWorkout = Omit<WorkoutFields, 'note'>;

/** Raised when finishing a workout with no completed sets; such a workout is discarded instead. */
export class NoCompletedSets {
	/** @param workoutId - The workout that had nothing completed. */
	constructor(readonly workoutId: WorkoutId) {}
}

/**
 * Starts a workout, empty or with exercises from a template.
 *
 * @param fields - The workout's id, day, start time, source template, and exercises.
 */
export function startWorkout(fields: NewWorkout): ActiveWorkout {
	return { ...fields, note: '', status: WorkoutStatus.active };
}

/**
 * Finishes a workout, keeping only completed sets and the exercises that have any.
 *
 * @param workout - The workout in progress.
 * @param finishedAt - When it finished, in epoch milliseconds.
 */
export function finishWorkout(
	workout: ActiveWorkout,
	finishedAt: number
): Result<FinishedWorkout, NoCompletedSets> {
	const exercises = workout.exercises
		.map((exercise) => ({ ...exercise, sets: exercise.sets.filter((set) => set.completed) }))
		.filter((exercise) => exercise.sets.length > 0);
	if (exercises.length === 0) return err(new NoCompletedSets(workout.id));
	return ok({ ...workout, exercises, status: WorkoutStatus.finished, finishedAt });
}

/**
 * The sets of one exercise in a workout, if the workout includes it.
 *
 * @param workout - Any workout.
 * @param exerciseId - The exercise to look up.
 */
export function setsOf(
	workout: Workout,
	exerciseId: ExerciseId
): readonly WorkoutSet[] | undefined {
	return workout.exercises.find((exercise) => exercise.exerciseId === exerciseId)?.sets;
}

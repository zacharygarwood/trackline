import { elementAt } from '../../shared/collections.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import type { ExerciseId } from './ids.ts';
import type { ActiveWorkout, WorkoutExercise } from './workout.ts';
import type { WorkoutSet } from './workout-set.ts';

/** The longest workout note. */
export const MAX_NOTE_LENGTH = 500;

/** Raised when adding an exercise the workout already has. */
export class ExerciseAlreadyInWorkout {
	/** @param exerciseId - The duplicate exercise. */
	constructor(readonly exerciseId: ExerciseId) {}
}

/** Raised when an exercise or set to change is not in the workout. */
export class NotInWorkout {
	/** @param exerciseId - The exercise that was looked up. */
	constructor(readonly exerciseId: ExerciseId) {}
}

/** Where a set is: its exercise and its zero-based position among that exercise's sets. */
export interface SetLocation {
	readonly exerciseId: ExerciseId;
	readonly position: number;
}

function changeExercise(
	workout: ActiveWorkout,
	exerciseId: ExerciseId,
	change: (sets: readonly WorkoutSet[]) => readonly WorkoutSet[] | undefined
): Result<ActiveWorkout, NotInWorkout> {
	const target = workout.exercises.find((exercise) => exercise.exerciseId === exerciseId);
	const sets = target === undefined ? undefined : change(target.sets);
	if (sets === undefined) return err(new NotInWorkout(exerciseId));
	const exercises = workout.exercises.map((exercise) =>
		exercise.exerciseId === exerciseId ? { ...exercise, sets } : exercise
	);
	return ok({ ...workout, exercises });
}

/**
 * Adds an exercise at the end of the workout, starting with one set.
 *
 * @param workout - The workout in progress.
 * @param exercise - The exercise and its first set.
 */
export function addExercise(
	workout: ActiveWorkout,
	exercise: WorkoutExercise
): Result<ActiveWorkout, ExerciseAlreadyInWorkout> {
	if (workout.exercises.some((existing) => existing.exerciseId === exercise.exerciseId)) {
		return err(new ExerciseAlreadyInWorkout(exercise.exerciseId));
	}
	return ok({ ...workout, exercises: [...workout.exercises, exercise] });
}

/**
 * Removes an exercise and its sets; the remaining exercises keep their order.
 *
 * @param workout - The workout in progress.
 * @param exerciseId - The exercise to remove.
 */
export function removeExercise(workout: ActiveWorkout, exerciseId: ExerciseId): ActiveWorkout {
	return {
		...workout,
		exercises: workout.exercises.filter((exercise) => exercise.exerciseId !== exerciseId)
	};
}

/**
 * Adds a set after an exercise's last set.
 *
 * @param workout - The workout in progress.
 * @param exerciseId - The exercise.
 * @param set - The new set.
 */
export function addSet(
	workout: ActiveWorkout,
	exerciseId: ExerciseId,
	set: WorkoutSet
): Result<ActiveWorkout, NotInWorkout> {
	return changeExercise(workout, exerciseId, (sets) => [...sets, set]);
}

/**
 * Replaces one set, for example to change its weight or mark it complete.
 *
 * @param workout - The workout in progress.
 * @param location - Which set.
 * @param set - Its new values.
 */
export function replaceSet(
	workout: ActiveWorkout,
	location: SetLocation,
	set: WorkoutSet
): Result<ActiveWorkout, NotInWorkout> {
	return changeExercise(workout, location.exerciseId, (sets) =>
		elementAt(sets, location.position) === undefined
			? undefined
			: sets.map((existing, position) => (position === location.position ? set : existing))
	);
}

/**
 * Removes one set; later sets move up.
 *
 * @param workout - The workout in progress.
 * @param location - Which set.
 */
export function removeSet(
	workout: ActiveWorkout,
	location: SetLocation
): Result<ActiveWorkout, NotInWorkout> {
	return changeExercise(workout, location.exerciseId, (sets) =>
		elementAt(sets, location.position) === undefined
			? undefined
			: sets.filter((_, position) => position !== location.position)
	);
}

/**
 * Sets the workout's note, trimmed and capped at 500 characters.
 *
 * @param workout - The workout in progress.
 * @param note - The text the user typed.
 */
export function setNote(workout: ActiveWorkout, note: string): ActiveWorkout {
	return { ...workout, note: note.trim().slice(0, MAX_NOTE_LENGTH) };
}

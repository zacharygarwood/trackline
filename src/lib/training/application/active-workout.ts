import { err, type Result } from '../../shared/result.ts';
import type { WorkoutReader, WorkoutWriter } from '../domain/workout-repository.ts';
import type { ActiveWorkout } from '../domain/workout.ts';

/** Raised when an action needs a workout in progress and there is none. */
export class NoActiveWorkout {}

/**
 * Loads the workout in progress, applies a change, and saves the result.
 *
 * @param workouts - Where workouts are stored.
 * @param change - A pure change to the workout; nothing is saved if it fails.
 * @returns The changed workout, or why it couldn't change.
 */
export async function changeActiveWorkout<Problem>(
	workouts: WorkoutReader & WorkoutWriter,
	change: (workout: ActiveWorkout) => Result<ActiveWorkout, Problem>
): Promise<Result<ActiveWorkout, Problem | NoActiveWorkout>> {
	const active = await workouts.findActive();
	if (active === undefined) return err(new NoActiveWorkout());
	const changed = change(active);
	if (changed.ok) await workouts.save(changed.value);
	return changed;
}

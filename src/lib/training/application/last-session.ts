import type { ExerciseId } from '../domain/ids.ts';
import type { WorkoutReader } from '../domain/workout-repository.ts';
import { setsOf } from '../domain/workout.ts';
import type { WorkoutSet } from '../domain/workout-set.ts';

/**
 * The sets from the most recent finished workout with an exercise.
 *
 * @param workouts - Where workouts are stored.
 * @param exerciseId - The exercise.
 * @returns Those sets, or none if the exercise was never finished in a workout.
 */
export async function lastSessionOf(
	workouts: WorkoutReader,
	exerciseId: ExerciseId
): Promise<readonly WorkoutSet[]> {
	const workout = await workouts.findLastWith(exerciseId);
	return workout === undefined ? [] : (setsOf(workout, exerciseId) ?? []);
}

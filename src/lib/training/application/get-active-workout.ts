import type { WorkoutReader } from '../domain/workout-repository.ts';
import type { ActiveWorkout } from '../domain/workout.ts';

/** Reads the workout in progress. */
export class GetActiveWorkout {
	constructor(private readonly workouts: WorkoutReader) {}

	/** @returns The workout in progress, if any. */
	execute(): Promise<ActiveWorkout | undefined> {
		return this.workouts.findActive();
	}
}

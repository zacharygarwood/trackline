import type { WorkoutReader } from '../domain/workout-repository.ts';
import type { FinishedWorkout } from '../domain/workout.ts';

/** How many workouts to list. */
export interface ListRecentWorkoutsCommand {
	readonly limit: number;
}

/** Lists recent finished workouts for the Train tab. */
export class ListRecentWorkouts {
	constructor(private readonly workouts: WorkoutReader) {}

	/** @returns The most recent finished workouts, newest first. */
	execute(command: ListRecentWorkoutsCommand): Promise<readonly FinishedWorkout[]> {
		return this.workouts.findRecent(command.limit);
	}
}

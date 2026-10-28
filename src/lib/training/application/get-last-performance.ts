import type { ExerciseId } from '../domain/ids.ts';
import type { WorkoutReader } from '../domain/workout-repository.ts';
import type { WorkoutSet } from '../domain/workout-set.ts';
import { lastSessionOf } from './last-session.ts';

/** Which exercise to look up. */
export interface GetLastPerformanceCommand {
	readonly exerciseId: ExerciseId;
}

/** What the user did last time for an exercise, shown as a hint during a workout. */
export class GetLastPerformance {
	constructor(private readonly workouts: WorkoutReader) {}

	/** @returns The sets from the most recent finished workout with the exercise. */
	execute(command: GetLastPerformanceCommand): Promise<readonly WorkoutSet[]> {
		return lastSessionOf(this.workouts, command.exerciseId);
	}
}

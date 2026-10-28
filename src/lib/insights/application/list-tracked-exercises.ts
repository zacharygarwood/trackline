import type { ExerciseProgressQuery, TrackedExercise } from './insights-queries.ts';

/** Lists the exercises that have progress to show, most recently trained first. */
export class ListTrackedExercises {
	constructor(private readonly progress: ExerciseProgressQuery) {}

	/** Reads the list. */
	execute(): Promise<readonly TrackedExercise[]> {
		return this.progress.trackedExercises();
	}
}

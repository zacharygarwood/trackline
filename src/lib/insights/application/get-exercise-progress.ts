import type { Clock } from '../../shared/clock.ts';
import type {
	ExerciseProgressQuery,
	ExerciseSession,
	TrackedExerciseId
} from './insights-queries.ts';
import type { StatsRange } from './stats-range.constants.ts';
import { rangeStart } from './stats-range.ts';

/** The exercise and range to read. */
export interface GetExerciseProgressCommand {
	readonly exercise: TrackedExerciseId;
	readonly range: StatsRange;
}

/** Reads an exercise's heaviest set and estimated one-rep max per day over a range. */
export class GetExerciseProgress {
	constructor(
		private readonly progress: ExerciseProgressQuery,
		private readonly clock: Clock
	) {}

	/** @param command - The exercise and range. */
	execute(command: GetExerciseProgressCommand): Promise<readonly ExerciseSession[]> {
		return this.progress.exerciseSessions(
			command.exercise,
			rangeStart(command.range, this.clock.today())
		);
	}
}

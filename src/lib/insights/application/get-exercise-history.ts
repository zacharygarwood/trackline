import type { Clock } from '../../shared/clock.ts';
import type { ExerciseDay, ExerciseHistoryQuery } from './insights-queries.ts';
import type { StatsRange } from './stats-range.constants.ts';
import { rangeStart } from './stats-range.ts';

/** The range to read. */
export interface GetExerciseHistoryCommand {
	readonly range: StatsRange;
}

/** Reads what was done of each exercise over a time range ending today. */
export class GetExerciseHistory {
	constructor(
		private readonly query: ExerciseHistoryQuery,
		private readonly clock: Clock
	) {}

	/** @param command - The range to read. */
	execute(command: GetExerciseHistoryCommand): Promise<readonly ExerciseDay[]> {
		return this.query.exerciseDays(rangeStart(command.range, this.clock.today()));
	}
}

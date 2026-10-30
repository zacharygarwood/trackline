import type { Clock } from '../../shared/clock.ts';
import type { WorkoutDay, WorkoutDaysQuery } from './insights-queries.ts';
import { ALL_WEEKS, startOfDays } from './stats-range.ts';

const DAYS_PER_WEEK = 7;

/** Reads the days with workouts in the last two years, for the Stats heatmap. */
export class GetWorkoutDays {
	constructor(
		private readonly query: WorkoutDaysQuery,
		private readonly clock: Clock
	) {}

	/** @returns Days with a finished workout and their minutes, oldest first. */
	execute(): Promise<readonly WorkoutDay[]> {
		return this.query.workoutDays(startOfDays(this.clock.today(), ALL_WEEKS * DAYS_PER_WEEK));
	}
}

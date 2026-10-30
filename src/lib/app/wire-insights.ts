import { GetExerciseHistory } from '../insights/application/get-exercise-history.ts';
import { GetTrends } from '../insights/application/get-trends.ts';
import { GetWorkoutDays } from '../insights/application/get-workout-days.ts';
import { SqliteInsightsQueries } from '../insights/infrastructure/sqlite-insights-queries.ts';
import type { Infrastructure } from './infrastructure.ts';

/**
 * Wires the Insights context: the Stats queries.
 *
 * @param infrastructure - What the use cases run on.
 */
export function wireInsights(infrastructure: Infrastructure) {
	const { database, clock } = infrastructure;
	const queries = new SqliteInsightsQueries(database);
	return {
		getTrends: new GetTrends({ weight: queries, nutrition: queries, clock }),
		getWorkoutDays: new GetWorkoutDays(queries, clock),
		getExerciseHistory: new GetExerciseHistory(queries, clock)
	};
}

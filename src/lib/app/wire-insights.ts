import { GetActivity } from '../insights/application/get-activity.ts';
import { GetExerciseProgress } from '../insights/application/get-exercise-progress.ts';
import { GetTrends } from '../insights/application/get-trends.ts';
import { ListTrackedExercises } from '../insights/application/list-tracked-exercises.ts';
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
		getActivity: new GetActivity(queries, clock),
		getTrends: new GetTrends({ weight: queries, nutrition: queries, clock }),
		listTrackedExercises: new ListTrackedExercises(queries),
		getExerciseProgress: new GetExerciseProgress(queries, clock)
	};
}

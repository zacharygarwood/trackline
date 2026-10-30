import type {
	ExerciseDay,
	ExerciseHistoryQuery,
	NutritionDay,
	NutritionTrendQuery,
	WeightTrendPoint,
	WeightTrendQuery,
	WorkoutDay,
	WorkoutDaysQuery
} from '../../src/lib/insights/application/insights-queries.ts';
import type { LocalDate } from '../../src/lib/shared/local-date.ts';

/**
 * Insights queries that return fixed read models and record what they were
 * asked, so use cases and view models can be tested without SQL. The SQL
 * behind each query is tested against seeded SQLite instead.
 */
export class StubInsightsQueries
	implements WeightTrendQuery, NutritionTrendQuery, WorkoutDaysQuery, ExerciseHistoryQuery
{
	readonly calls: string[] = [];
	weight: readonly WeightTrendPoint[] = [];
	nutrition: readonly NutritionDay[] = [];
	workouts: readonly WorkoutDay[] = [];
	exercises: readonly ExerciseDay[] = [];

	weightTrend(since: LocalDate | undefined): Promise<readonly WeightTrendPoint[]> {
		this.calls.push(`weightTrend ${since?.toString() ?? 'all'}`);
		return Promise.resolve(this.weight);
	}

	nutritionDays(since: LocalDate | undefined): Promise<readonly NutritionDay[]> {
		this.calls.push(`nutritionDays ${since?.toString() ?? 'all'}`);
		return Promise.resolve(this.nutrition);
	}

	workoutDays(since: LocalDate): Promise<readonly WorkoutDay[]> {
		this.calls.push(`workoutDays ${since.toString()}`);
		return Promise.resolve(this.workouts);
	}

	exerciseDays(since: LocalDate | undefined): Promise<readonly ExerciseDay[]> {
		this.calls.push(`exerciseDays ${since?.toString() ?? 'all'}`);
		return Promise.resolve(this.exercises);
	}
}

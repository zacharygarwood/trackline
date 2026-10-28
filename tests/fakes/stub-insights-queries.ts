import type {
	ActivityDays,
	ActivityQuery,
	ExerciseProgressQuery,
	ExerciseSession,
	NutritionDay,
	NutritionTrendQuery,
	StreakSummary,
	TrackedExercise,
	TrackedExerciseId,
	WeightTrendPoint,
	WeightTrendQuery
} from '../../src/lib/insights/application/insights-queries.ts';
import type { LocalDate } from '../../src/lib/shared/local-date.ts';

/**
 * Insights queries that return fixed read models and record what they were
 * asked, so use cases and view models can be tested without SQL. The SQL
 * behind each query is tested against seeded SQLite instead.
 */
export class StubInsightsQueries
	implements WeightTrendQuery, NutritionTrendQuery, ExerciseProgressQuery, ActivityQuery
{
	readonly calls: string[] = [];
	weight: readonly WeightTrendPoint[] = [];
	nutrition: readonly NutritionDay[] = [];
	exercises: readonly TrackedExercise[] = [];
	sessions: readonly ExerciseSession[] = [];
	activity: ActivityDays = { trained: [], rested: [], foodLogged: [], proteinGoalMet: [] };
	streak: StreakSummary = { current: 0, longest: 0 };

	weightTrend(since: LocalDate | undefined): Promise<readonly WeightTrendPoint[]> {
		this.calls.push(`weightTrend ${since?.toString() ?? 'all'}`);
		return Promise.resolve(this.weight);
	}

	nutritionDays(since: LocalDate | undefined): Promise<readonly NutritionDay[]> {
		this.calls.push(`nutritionDays ${since?.toString() ?? 'all'}`);
		return Promise.resolve(this.nutrition);
	}

	trackedExercises(): Promise<readonly TrackedExercise[]> {
		return Promise.resolve(this.exercises);
	}

	exerciseSessions(
		exercise: TrackedExerciseId,
		since: LocalDate | undefined
	): Promise<readonly ExerciseSession[]> {
		this.calls.push(`exerciseSessions ${exercise} ${since?.toString() ?? 'all'}`);
		return Promise.resolve(this.sessions);
	}

	activityDays(since: LocalDate): Promise<ActivityDays> {
		this.calls.push(`activityDays ${since.toString()}`);
		return Promise.resolve(this.activity);
	}

	trainingStreak(today: LocalDate): Promise<StreakSummary> {
		this.calls.push(`trainingStreak ${today.toString()}`);
		return Promise.resolve(this.streak);
	}
}

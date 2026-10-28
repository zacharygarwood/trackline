import { requireValidRow } from '../../platform/db/corrupt-row.ts';
import type { SqlStatement } from '../../platform/db/sql.ts';
import type { SqlDriver } from '../../platform/db/sql-driver.ts';
import { first } from '../../shared/collections.ts';
import type { LocalDate } from '../../shared/local-date.ts';
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
} from '../application/insights-queries.ts';
import {
	FIND_TRACKED_EXERCISES,
	findExerciseSessions,
	findFoodLoggedDays,
	findNutritionDays,
	findProteinGoalMetDays,
	findRestedDays,
	findTrainedDays,
	findTrainingStreak,
	findWeightTrend,
	InsightsTable
} from './insights.sql.ts';
import { insightsMapper } from './insights.mapper.ts';

const sinceParam = (since: LocalDate | undefined) => since?.toString() ?? null;

/** Answers the Stats screen's queries with SQL across the training, nutrition, and body tables. */
export class SqliteInsightsQueries
	implements WeightTrendQuery, NutritionTrendQuery, ExerciseProgressQuery, ActivityQuery
{
	constructor(private readonly database: SqlDriver) {}

	/** {@inheritDoc WeightTrendQuery.weightTrend} */
	async weightTrend(since: LocalDate | undefined): Promise<readonly WeightTrendPoint[]> {
		const rows = await this.database.query(findWeightTrend(sinceParam(since)));
		return rows.map((row) => requireValidRow(insightsMapper.toWeightTrendPoint(row)));
	}

	/** {@inheritDoc NutritionTrendQuery.nutritionDays} */
	async nutritionDays(since: LocalDate | undefined): Promise<readonly NutritionDay[]> {
		const rows = await this.database.query(findNutritionDays(sinceParam(since)));
		return rows.map((row) => requireValidRow(insightsMapper.toNutritionDay(row)));
	}

	/** {@inheritDoc ExerciseProgressQuery.trackedExercises} */
	async trackedExercises(): Promise<readonly TrackedExercise[]> {
		const rows = await this.database.query(FIND_TRACKED_EXERCISES);
		return rows.map((row) => requireValidRow(insightsMapper.toTrackedExercise(row)));
	}

	/** {@inheritDoc ExerciseProgressQuery.exerciseSessions} */
	async exerciseSessions(
		exercise: TrackedExerciseId,
		since: LocalDate | undefined
	): Promise<readonly ExerciseSession[]> {
		const rows = await this.database.query(findExerciseSessions(exercise, sinceParam(since)));
		return rows.map((row) => requireValidRow(insightsMapper.toExerciseSession(row)));
	}

	/** {@inheritDoc ActivityQuery.activityDays} */
	async activityDays(since: LocalDate): Promise<ActivityDays> {
		const day = since.toString();
		const [trained, rested, foodLogged, proteinGoalMet] = await Promise.all([
			this.dates(InsightsTable.workout, findTrainedDays(day)),
			this.dates(InsightsTable.restDay, findRestedDays(day)),
			this.dates(InsightsTable.foodLogEntry, findFoodLoggedDays(day)),
			this.dates(InsightsTable.foodLogEntry, findProteinGoalMetDays(day))
		]);
		return { trained, rested, foodLogged, proteinGoalMet };
	}

	/** {@inheritDoc ActivityQuery.trainingStreak} */
	async trainingStreak(today: LocalDate): Promise<StreakSummary> {
		const rows = await this.database.query(findTrainingStreak(today.toString()));
		return requireValidRow(insightsMapper.toStreak(first(rows)));
	}

	private async dates(
		table: (typeof InsightsTable)[keyof typeof InsightsTable],
		statement: SqlStatement
	): Promise<readonly LocalDate[]> {
		const rows = await this.database.query(statement);
		return rows.map((row) => requireValidRow(insightsMapper.toDate(table, row)));
	}
}

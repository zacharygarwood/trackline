import { requireValidRow } from '../../platform/db/corrupt-row.ts';
import type { SqlDriver } from '../../platform/db/sql-driver.ts';
import type { LocalDate } from '../../shared/local-date.ts';
import type {
	ExerciseDay,
	ExerciseHistoryQuery,
	NutritionDay,
	NutritionTrendQuery,
	WeightTrendPoint,
	WeightTrendQuery,
	WorkoutDay,
	WorkoutDaysQuery
} from '../application/insights-queries.ts';
import {
	findExerciseDays,
	findNutritionDays,
	findWeightTrend,
	findWorkoutDays
} from './insights.sql.ts';
import { insightsMapper } from './insights.mapper.ts';

const sinceParam = (since: LocalDate | undefined) => since?.toString() ?? null;

/** The Stats queries, answered with SQL across the other contexts' tables. */
export class SqliteInsightsQueries
	implements WeightTrendQuery, NutritionTrendQuery, WorkoutDaysQuery, ExerciseHistoryQuery
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

	/** {@inheritDoc WorkoutDaysQuery.workoutDays} */
	async workoutDays(since: LocalDate): Promise<readonly WorkoutDay[]> {
		const rows = await this.database.query(findWorkoutDays(since.toString()));
		return rows.map((row) => requireValidRow(insightsMapper.toWorkoutDay(row)));
	}

	/** {@inheritDoc ExerciseHistoryQuery.exerciseDays} */
	async exerciseDays(since: LocalDate | undefined): Promise<readonly ExerciseDay[]> {
		const rows = await this.database.query(findExerciseDays(sinceParam(since)));
		return rows.map((row) => requireValidRow(insightsMapper.toExerciseDay(row)));
	}
}

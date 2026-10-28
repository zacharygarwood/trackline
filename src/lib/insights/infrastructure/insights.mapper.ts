import { CorruptReason } from '../../platform/db/corrupt-reason.constants.ts';
import { CorruptRow } from '../../platform/db/corrupt-row.ts';
import type { SqlRow } from '../../platform/db/sql.ts';
import { parseId } from '../../shared/id.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { Mass } from '../../shared/mass.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import type {
	ExerciseSession,
	NutritionDay,
	StreakSummary,
	TrackedExercise,
	WeightTrendPoint
} from '../application/insights-queries.ts';
import { InsightsTable } from './insights.sql.ts';

type Table = (typeof InsightsTable)[keyof typeof InsightsTable];

const corrupt = (table: Table, reason: string) => err(new CorruptRow(table, reason));

const isNumber = (value: unknown): value is number => typeof value === 'number';
const isOptionalNumber = (value: unknown): value is number | null =>
	value === null || isNumber(value);
const orUndefined = (value: number | null) => value ?? undefined;

/** Converts query rows into read models, failing on data the app never writes. */
export const insightsMapper = {
	/** @param row - `date`, `weight_kg`, and `average_kg`. */
	toWeightTrendPoint(row: SqlRow): Result<WeightTrendPoint, CorruptRow> {
		const { date, weight_kg, average_kg } = row;
		if (typeof date !== 'string' || !isNumber(weight_kg) || !isNumber(average_kg)) {
			return corrupt(InsightsTable.weighIn, CorruptReason.missingColumn);
		}
		const day = LocalDate.parse(date);
		const weight = Mass.fromKg(weight_kg);
		const average = Mass.fromKg(average_kg);
		if (!day.ok || !weight.ok || !average.ok) {
			return corrupt(InsightsTable.weighIn, CorruptReason.invalidValue);
		}
		return ok({ date: day.value, weight: weight.value, average: average.value });
	},

	/** @param row - `date`, `calories`, `protein_g`, `calorie_goal`, and `protein_goal_g`. */
	toNutritionDay(row: SqlRow): Result<NutritionDay, CorruptRow> {
		const { date, calories, protein_g, calorie_goal, protein_goal_g } = row;
		if (
			typeof date !== 'string' ||
			!isNumber(calories) ||
			!isNumber(protein_g) ||
			!isOptionalNumber(calorie_goal) ||
			!isOptionalNumber(protein_goal_g)
		) {
			return corrupt(InsightsTable.foodLogEntry, CorruptReason.missingColumn);
		}
		const day = LocalDate.parse(date);
		if (!day.ok) return corrupt(InsightsTable.foodLogEntry, CorruptReason.invalidValue);
		return ok({
			date: day.value,
			calories,
			protein: protein_g,
			calorieGoal: orUndefined(calorie_goal),
			proteinGoal: orUndefined(protein_goal_g)
		});
	},

	/** @param row - `id` and `name`. */
	toTrackedExercise(row: SqlRow): Result<TrackedExercise, CorruptRow> {
		const { id, name } = row;
		if (typeof id !== 'string' || typeof name !== 'string') {
			return corrupt(InsightsTable.exercise, CorruptReason.missingColumn);
		}
		const parsedId = parseId<'Exercise'>(id);
		return parsedId.ok
			? ok({ id: parsedId.value, name })
			: corrupt(InsightsTable.exercise, CorruptReason.invalidValue);
	},

	/** @param row - `date`, `heaviest_kg`, and `estimated_one_rep_max_kg`. */
	toExerciseSession(row: SqlRow): Result<ExerciseSession, CorruptRow> {
		const { date, heaviest_kg, estimated_one_rep_max_kg } = row;
		if (typeof date !== 'string' || !isNumber(heaviest_kg) || !isNumber(estimated_one_rep_max_kg)) {
			return corrupt(InsightsTable.workoutSet, CorruptReason.missingColumn);
		}
		const day = LocalDate.parse(date);
		const heaviest = Mass.fromKg(heaviest_kg);
		const estimate = Mass.fromKg(estimated_one_rep_max_kg);
		if (!day.ok || !heaviest.ok || !estimate.ok) {
			return corrupt(InsightsTable.workoutSet, CorruptReason.invalidValue);
		}
		return ok({ date: day.value, heaviest: heaviest.value, estimatedOneRepMax: estimate.value });
	},

	/**
	 * @param table - The table the dates come from.
	 * @param row - `date`.
	 */
	toDate(table: Table, row: SqlRow): Result<LocalDate, CorruptRow> {
		const { date } = row;
		if (typeof date !== 'string') return corrupt(table, CorruptReason.missingColumn);
		const day = LocalDate.parse(date);
		return day.ok ? day : corrupt(table, CorruptReason.invalidValue);
	},

	/** @param row - `current` and `longest`. */
	toStreak(row: SqlRow | undefined): Result<StreakSummary, CorruptRow> {
		const current = row?.current;
		const longest = row?.longest;
		return isNumber(current) && isNumber(longest)
			? ok({ current, longest })
			: corrupt(InsightsTable.workout, CorruptReason.missingColumn);
	}
};

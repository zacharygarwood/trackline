import { CorruptReason } from '../../platform/db/corrupt-reason.constants.ts';
import { CorruptRow } from '../../platform/db/corrupt-row.ts';
import type { SqlRow } from '../../platform/db/sql.ts';
import { parseId } from '../../shared/id.ts';
import { LocalDate } from '../../shared/local-date.ts';
import { Mass } from '../../shared/mass.ts';
import { err, ok, type Result } from '../../shared/result.ts';
import type {
	ExerciseDay,
	NutritionDay,
	WeightTrendPoint,
	WorkoutDay
} from '../application/insights-queries.ts';
import { InsightsTable } from './insights.sql.ts';

type Table = (typeof InsightsTable)[keyof typeof InsightsTable];

const corrupt = (table: Table, reason: string) => err(new CorruptRow(table, reason));

const isNumber = (value: unknown): value is number => typeof value === 'number';
const isOptionalNumber = (value: unknown): value is number | null =>
	value === null || isNumber(value);
const orUndefined = (value: number | null) => value ?? undefined;

/** The heaviest weight in an exercise row: undefined when none, null when invalid. */
function heaviestOf(kilograms: number | null): Mass | undefined | null {
	if (kilograms === null) return undefined;
	const mass = Mass.fromKg(kilograms);
	return mass.ok ? mass.value : null;
}

function bestColumns(row: SqlRow) {
	const { heaviest_kg, most_reps, hardest_grade } = row;
	if (!isOptionalNumber(heaviest_kg) || !isOptionalNumber(most_reps)) return;
	return isOptionalNumber(hardest_grade) ? { heaviest_kg, most_reps, hardest_grade } : undefined;
}

function totalColumns(row: SqlRow) {
	const { meters, seconds, count } = row;
	if (!isNumber(meters) || !isNumber(seconds)) return;
	return isNumber(count) ? { meters, seconds, count } : undefined;
}

function exerciseDayColumns(row: SqlRow) {
	const { exercise_id, date } = row;
	const best = bestColumns(row);
	const totals = totalColumns(row);
	if (typeof exercise_id !== 'string' || typeof date !== 'string') return;
	return best === undefined || totals === undefined
		? undefined
		: { exercise_id, date, ...best, ...totals };
}

/** Converts query rows into the Stats read models; corrupt rows fail loudly. */
export const insightsMapper = {
	/** @param row - A row of the weight trend query. */
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

	/** @param row - A row of the nutrition days query. */
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

	/** @param row - A row of the workout days query. */
	toWorkoutDay(row: SqlRow): Result<WorkoutDay, CorruptRow> {
		const { date, minutes } = row;
		if (typeof date !== 'string' || !isNumber(minutes)) {
			return corrupt(InsightsTable.workout, CorruptReason.missingColumn);
		}
		const day = LocalDate.parse(date);
		return day.ok && minutes >= 0
			? ok({ date: day.value, minutes })
			: corrupt(InsightsTable.workout, CorruptReason.invalidValue);
	},

	/** @param row - A row of the exercise days query. */
	toExerciseDay(row: SqlRow): Result<ExerciseDay, CorruptRow> {
		const columns = exerciseDayColumns(row);
		if (columns === undefined)
			return corrupt(InsightsTable.workoutSet, CorruptReason.missingColumn);
		const exerciseId = parseId<'Exercise'>(columns.exercise_id);
		const day = LocalDate.parse(columns.date);
		const heaviest = heaviestOf(columns.heaviest_kg);
		if (!exerciseId.ok || !day.ok || heaviest === null) {
			return corrupt(InsightsTable.workoutSet, CorruptReason.invalidValue);
		}
		return ok({
			exerciseId: exerciseId.value,
			date: day.value,
			heaviest,
			mostReps: orUndefined(columns.most_reps),
			hardestGrade: orUndefined(columns.hardest_grade),
			meters: columns.meters,
			seconds: columns.seconds,
			count: columns.count
		});
	}
};

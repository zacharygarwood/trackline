import type { SqlStatement } from '../../platform/db/sql.ts';

/** The column each tracker query returns. */
export const SOURCE_TOTAL = 'total';

/** The food log column of each macro. */
export const MACRO_COLUMNS = {
	calories: 'calories',
	protein: 'protein_g',
	carbs: 'carbs_g',
	fat: 'fat_g'
} as const;

/** The completed-set expression each exercise measure sums. */
export const EXERCISE_SET_TOTALS = {
	distance: 'coalesce(sum(s.distance_m), 0)',
	time: 'coalesce(sum(s.seconds), 0) / 60.0',
	reps: 'coalesce(sum(s.reps), 0)',
	sets: 'count(*)'
} as const;

/**
 * Sums one macro over the food log from a day on.
 *
 * @param column - One of {@link MACRO_COLUMNS}.
 * @param since - The first day, as YYYY-MM-DD.
 */
export function macroTotal(column: string, since: string): SqlStatement {
	return {
		name: 'tracker macro total',
		sql: `SELECT coalesce(sum(${column}), 0) AS ${SOURCE_TOTAL} FROM food_log_entry WHERE date >= ?`,
		params: [since]
	};
}

/** Sums the logged amount of one food from a day on. */
export function foodAmount(foodId: string, since: string): SqlStatement {
	return {
		name: 'tracker food amount',
		sql: `SELECT coalesce(sum(amount), 0) AS ${SOURCE_TOTAL} FROM food_log_entry
			WHERE food_id = ? AND date >= ?`,
		params: [foodId, since]
	};
}

/** Counts finished workouts from a day on. */
export function workoutCount(since: string): SqlStatement {
	return {
		name: 'tracker workout count',
		sql: `SELECT count(*) AS ${SOURCE_TOTAL} FROM workout WHERE finished_at IS NOT NULL AND date >= ?`,
		params: [since]
	};
}

/** Counts finished workouts that included an exercise, from a day on. */
export function exerciseSessions(exerciseId: string, since: string): SqlStatement {
	return {
		name: 'tracker exercise sessions',
		sql: `SELECT count(DISTINCT w.id) AS ${SOURCE_TOTAL} FROM workout w
			JOIN workout_exercise we ON we.workout_id = w.id
			WHERE w.finished_at IS NOT NULL AND we.exercise_id = ? AND w.date >= ?`,
		params: [exerciseId, since]
	};
}

/**
 * Totals an exercise's completed sets in finished workouts from a day on.
 *
 * @param expression - One of {@link EXERCISE_SET_TOTALS}.
 * @param exerciseId - The exercise.
 * @param since - The first day, as YYYY-MM-DD.
 */
export function exerciseSetTotal(
	expression: string,
	exerciseId: string,
	since: string
): SqlStatement {
	return {
		name: 'tracker exercise total',
		sql: `SELECT ${expression} AS ${SOURCE_TOTAL} FROM workout_set s
			JOIN workout_exercise we ON we.workout_id = s.workout_id AND we.position = s.exercise_position
			JOIN workout w ON w.id = s.workout_id
			WHERE w.finished_at IS NOT NULL AND s.completed = 1 AND we.exercise_id = ? AND w.date >= ?`,
		params: [exerciseId, since]
	};
}

/** Lists every weigh-in's kilograms, oldest first. */
export const WEIGHTS: SqlStatement = {
	name: 'tracker weights',
	sql: `SELECT weight_kg AS ${SOURCE_TOTAL} FROM weigh_in ORDER BY date`,
	params: []
};

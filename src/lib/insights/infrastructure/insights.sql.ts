import type { SqlStatement } from '../../platform/db/sql.ts';

/** The tables each read model comes from, for error messages about corrupt rows. */
export const InsightsTable = {
	weighIn: 'weigh_in',
	foodLogEntry: 'food_log_entry',
	workoutSet: 'workout_set',
	exercise: 'exercise',
	workout: 'workout',
	restDay: 'rest_day'
} as const;

/** `?1` is the first day to include, or NULL for all time. */
const SINCE = '(?1 IS NULL OR date >= ?1)';

/** The goals version in effect on `day.date`: the latest one starting on or before it. */
const goalOnDay = (column: string) =>
	`(SELECT goals.${column} FROM daily_goals goals WHERE goals.effective_from <= day.date
		ORDER BY goals.effective_from DESC LIMIT 1)`;

/** Each day's food log totals with that day's calorie and protein goals. */
const NUTRITION_DAYS = `SELECT day.date, day.calories, day.protein_g,
		${goalOnDay('calories')} AS calorie_goal, ${goalOnDay('protein_g')} AS protein_goal_g
	FROM (SELECT date, SUM(calories) AS calories, SUM(protein_g) AS protein_g
		FROM food_log_entry WHERE ${SINCE} GROUP BY date) day`;

/**
 * Weigh-ins from a date, oldest first, each with the mean of the weigh-ins in
 * the seven days ending on it. The window runs before the filter, so the first
 * point of a range still averages earlier weigh-ins.
 */
export function findWeightTrend(since: string | null): SqlStatement {
	return {
		name: 'find weight trend',
		sql: `SELECT date, weight_kg, average_kg FROM (
				SELECT date, weight_kg, AVG(weight_kg) OVER (
					ORDER BY julianday(date) RANGE BETWEEN 6 PRECEDING AND CURRENT ROW
				) AS average_kg FROM weigh_in
			) WHERE ${SINCE} ORDER BY date`,
		params: [since]
	};
}

/** Days with food logged from a date, oldest first, with the goals in effect each day. */
export function findNutritionDays(since: string | null): SqlStatement {
	return {
		name: 'find nutrition days',
		sql: `${NUTRITION_DAYS} ORDER BY day.date`,
		params: [since]
	};
}

/** Days with a finished workout from a date, oldest first, with their minutes together. */
export function findWorkoutDays(since: string): SqlStatement {
	return {
		name: 'find workout days',
		sql: `SELECT date, TOTAL(finished_at - started_at) / 60000.0 AS minutes FROM workout
			WHERE finished_at IS NOT NULL AND ${SINCE} GROUP BY date ORDER BY date`,
		params: [since]
	};
}

/** Each exercise's completed sets in finished workouts from a date, totalled per day, oldest first. */
export function findExerciseDays(since: string | null): SqlStatement {
	return {
		name: 'find exercise days',
		sql: `SELECT we.exercise_id, w.date, MAX(s.weight_kg) AS heaviest_kg, MAX(s.reps) AS most_reps,
				MAX(s.grade) AS hardest_grade, TOTAL(s.distance_m) AS meters, TOTAL(s.seconds) AS seconds,
				TOTAL(s.count) AS count
			FROM workout w
			JOIN workout_exercise we ON we.workout_id = w.id
			JOIN workout_set s ON s.workout_id = we.workout_id AND s.exercise_position = we.position
			WHERE w.finished_at IS NOT NULL AND s.completed = 1 AND (?1 IS NULL OR w.date >= ?1)
			GROUP BY we.exercise_id, w.date ORDER BY w.date`,
		params: [since]
	};
}

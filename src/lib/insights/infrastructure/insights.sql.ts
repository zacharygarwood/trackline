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

/** Epley's divisor: estimated one-rep max = weight × (1 + reps / 30). */
const EPLEY_REPS_DIVISOR = 30;

/** The goals version in effect on `day.date`: the latest one starting on or before it. */
const goalOnDay = (column: string) =>
	`(SELECT goals.${column} FROM daily_goals goals WHERE goals.effective_from <= day.date
		ORDER BY goals.effective_from DESC LIMIT 1)`;

/** Each day's food log totals with that day's calorie and protein goals. */
const NUTRITION_DAYS = `SELECT day.date, day.calories, day.protein_g,
		${goalOnDay('calories')} AS calorie_goal, ${goalOnDay('protein_g')} AS protein_goal_g
	FROM (SELECT date, SUM(calories) AS calories, SUM(protein_g) AS protein_g
		FROM food_log_entry WHERE ${SINCE} GROUP BY date) day`;

/** Completed, weighted sets from finished workouts, with the day and exercise they belong to. */
const WEIGHTED_SETS = `FROM workout w
	JOIN workout_exercise we ON we.workout_id = w.id
	JOIN workout_set s ON s.workout_id = we.workout_id AND s.exercise_position = we.position
	WHERE w.finished_at IS NOT NULL AND s.completed = 1 AND s.weight_kg > 0`;

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

/** Exercises with weighted history, most recently trained first. */
export const FIND_TRACKED_EXERCISES: SqlStatement = {
	name: 'find tracked exercises',
	sql: `SELECT e.id, e.name FROM exercise e
		JOIN (SELECT we.exercise_id, MAX(w.date) AS last_date ${WEIGHTED_SETS} GROUP BY we.exercise_id) t
			ON t.exercise_id = e.id
		ORDER BY t.last_date DESC, e.name`,
	params: []
};

/** One exercise's heaviest set and best estimated one-rep max per day from a date, oldest first. */
export function findExerciseSessions(exerciseId: string, since: string | null): SqlStatement {
	return {
		name: 'find exercise sessions',
		sql: `SELECT w.date AS date, MAX(s.weight_kg) AS heaviest_kg,
				MAX(CASE WHEN s.reps = 1 THEN s.weight_kg
					ELSE s.weight_kg * (1 + s.reps / ${String(EPLEY_REPS_DIVISOR)}.0) END) AS estimated_one_rep_max_kg
			${WEIGHTED_SETS} AND (?1 IS NULL OR w.date >= ?1) AND we.exercise_id = ?2
			GROUP BY w.date ORDER BY w.date`,
		params: [since, exerciseId]
	};
}

/** Days with a finished workout from a date, oldest first. */
export function findTrainedDays(since: string): SqlStatement {
	return {
		name: 'find trained days',
		sql: `SELECT DISTINCT date FROM workout WHERE finished_at IS NOT NULL AND ${SINCE} ORDER BY date`,
		params: [since]
	};
}

/** Rest days from a date, oldest first. */
export function findRestedDays(since: string): SqlStatement {
	return {
		name: 'find rested days',
		sql: `SELECT date FROM rest_day WHERE ${SINCE} ORDER BY date`,
		params: [since]
	};
}

/** Days with food logged from a date, oldest first. */
export function findFoodLoggedDays(since: string): SqlStatement {
	return {
		name: 'find food logged days',
		sql: `SELECT DISTINCT date FROM food_log_entry WHERE ${SINCE} ORDER BY date`,
		params: [since]
	};
}

/** Days from a date whose protein reached a positive goal in effect that day, oldest first. */
export function findProteinGoalMetDays(since: string): SqlStatement {
	return {
		name: 'find protein goal met days',
		sql: `SELECT date FROM (${NUTRITION_DAYS})
			WHERE protein_goal_g > 0 AND protein_g >= protein_goal_g ORDER BY date`,
		params: [since]
	};
}

/**
 * The longest run of consecutive days with a finished workout or a rest day,
 * and the run ending today or yesterday. Days in a run share
 * `julianday(date) - row number`.
 */
export function findTrainingStreak(today: string): SqlStatement {
	return {
		name: 'find training streak',
		sql: `WITH active AS (
				SELECT date FROM workout WHERE finished_at IS NOT NULL AND date <= ?1
				UNION SELECT date FROM rest_day WHERE date <= ?1
			), runs AS (
				SELECT MAX(date) AS last_day, COUNT(*) AS length FROM (
					SELECT date, julianday(date) - ROW_NUMBER() OVER (ORDER BY date) AS run FROM active
				) GROUP BY run
			)
			SELECT COALESCE((SELECT MAX(length) FROM runs WHERE last_day >= date(?1, '-1 day')), 0) AS current,
				COALESCE(MAX(length), 0) AS longest FROM runs`,
		params: [today]
	};
}

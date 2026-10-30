import type { SqlStatement } from '../../platform/db/sql.ts';
import type {
	ExerciseRow,
	RestDayRow,
	TemplateExerciseRow,
	WorkoutExerciseRow,
	WorkoutRow,
	WorkoutSetRow,
	WorkoutTemplateRow
} from './training.row.ts';

/** Table names, for error messages about corrupt rows. */
export const TrainingTable = {
	exercise: 'exercise',
	workout: 'workout',
	template: 'workout_template',
	restDay: 'rest_day'
} as const;

const WORKOUT_COLUMNS = 'id, date, started_at, finished_at, note, source_template_id';
const SET_COLUMNS =
	'workout_id, exercise_position, position, reps, weight_kg, seconds, distance_m, grade, count, completed';
const FINISHED_NEWEST_FIRST = 'finished_at IS NOT NULL ORDER BY date DESC, started_at DESC';

const EXERCISE_COLUMNS = 'id, name, tracked_fields, grade_scale, custom_grades, count_label';

/** Lists the exercise library by name. */
export const FIND_ALL_EXERCISES: SqlStatement = {
	name: 'find all exercises',
	sql: `SELECT ${EXERCISE_COLUMNS} FROM exercise ORDER BY name`,
	params: []
};

/**
 * Lists the exercise library, most recently started first. Exercises never
 * used yet come before all others, newest first, so a just-created one shows.
 */
export const FIND_EXERCISES_BY_RECENT_USE: SqlStatement = {
	name: 'find exercises by recent use',
	sql: `SELECT ${EXERCISE_COLUMNS.split(', ')
		.map((column) => `e.${column}`)
		.join(', ')}
		FROM exercise e
		LEFT JOIN workout_exercise we ON we.exercise_id = e.id
		LEFT JOIN workout w ON w.id = we.workout_id
		GROUP BY e.id
		ORDER BY max(w.started_at) IS NOT NULL, max(w.started_at) DESC, e.id DESC`,
	params: []
};

/** Finds an exercise by name, ignoring case. */
export function findExerciseByName(name: string): SqlStatement {
	return {
		name: 'find exercise by name',
		sql: `SELECT ${EXERCISE_COLUMNS} FROM exercise WHERE name = ?`,
		params: [name]
	};
}

/** Inserts an exercise, or updates its name and tracking. */
export function saveExercise(row: ExerciseRow): SqlStatement {
	return {
		name: 'save exercise',
		sql: `INSERT INTO exercise (${EXERCISE_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?)
			ON CONFLICT (id) DO UPDATE SET name = excluded.name, tracked_fields = excluded.tracked_fields,
			grade_scale = excluded.grade_scale, custom_grades = excluded.custom_grades,
			count_label = excluded.count_label`,
		params: [
			row.id,
			row.name,
			row.tracked_fields,
			row.grade_scale,
			row.custom_grades,
			row.count_label
		]
	};
}

/** Finds the workout in progress. */
export const FIND_ACTIVE_WORKOUT: SqlStatement = {
	name: 'find active workout',
	sql: `SELECT ${WORKOUT_COLUMNS} FROM workout WHERE finished_at IS NULL`,
	params: []
};

/** Finds a workout by id. */
export function findWorkoutById(id: string): SqlStatement {
	return {
		name: 'find workout by id',
		sql: `SELECT ${WORKOUT_COLUMNS} FROM workout WHERE id = ?`,
		params: [id]
	};
}

/** Lists recent finished workouts, newest first. */
export function findRecentWorkouts(limit: number): SqlStatement {
	return {
		name: 'find recent workouts',
		sql: `SELECT ${WORKOUT_COLUMNS} FROM workout WHERE ${FINISHED_NEWEST_FIRST} LIMIT ?`,
		params: [limit]
	};
}

/** Finds the most recent finished workout that included an exercise. */
export function findLastWorkoutWith(exerciseId: string): SqlStatement {
	return {
		name: 'find last workout with exercise',
		sql: `SELECT ${WORKOUT_COLUMNS} FROM workout
			WHERE id IN (SELECT workout_id FROM workout_exercise WHERE exercise_id = ?)
			AND ${FINISHED_NEWEST_FIRST} LIMIT 1`,
		params: [exerciseId]
	};
}

/** Lists the distinct days with a finished workout. */
export const FIND_TRAINED_DATES: SqlStatement = {
	name: 'find trained dates',
	sql: 'SELECT DISTINCT date FROM workout WHERE finished_at IS NOT NULL',
	params: []
};

/** Lists a workout's exercises in order. */
export function findWorkoutExercises(workoutId: string): SqlStatement {
	return {
		name: 'find workout exercises',
		sql: 'SELECT workout_id, position, exercise_id FROM workout_exercise WHERE workout_id = ? ORDER BY position',
		params: [workoutId]
	};
}

/** Lists a workout's sets in order. */
export function findWorkoutSets(workoutId: string): SqlStatement {
	return {
		name: 'find workout sets',
		sql: `SELECT ${SET_COLUMNS} FROM workout_set
			WHERE workout_id = ? ORDER BY exercise_position, position`,
		params: [workoutId]
	};
}

/** Inserts or updates a workout's own row. */
export function upsertWorkout(row: WorkoutRow): SqlStatement {
	return {
		name: 'save workout',
		sql: `INSERT INTO workout (${WORKOUT_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?)
			ON CONFLICT (id) DO UPDATE SET date = excluded.date, started_at = excluded.started_at,
			finished_at = excluded.finished_at, note = excluded.note, source_template_id = excluded.source_template_id`,
		params: [row.id, row.date, row.started_at, row.finished_at, row.note, row.source_template_id]
	};
}

/** Removes a workout's exercises, and with them its sets. */
export function clearWorkoutExercises(workoutId: string): SqlStatement {
	return {
		name: 'clear workout exercises',
		sql: 'DELETE FROM workout_exercise WHERE workout_id = ?',
		params: [workoutId]
	};
}

/** Inserts one exercise of a workout. */
export function insertWorkoutExercise(row: WorkoutExerciseRow): SqlStatement {
	return {
		name: 'insert workout exercise',
		sql: 'INSERT INTO workout_exercise (workout_id, position, exercise_id) VALUES (?, ?, ?)',
		params: [row.workout_id, row.position, row.exercise_id]
	};
}

/** Inserts one set of a workout. */
export function insertWorkoutSet(row: WorkoutSetRow): SqlStatement {
	return {
		name: 'insert workout set',
		sql: `INSERT INTO workout_set (${SET_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		params: [
			row.workout_id,
			row.exercise_position,
			row.position,
			row.reps,
			row.weight_kg,
			row.seconds,
			row.distance_m,
			row.grade,
			row.count,
			row.completed
		]
	};
}

/** Deletes a workout and, by cascade, its exercises and sets. */
export function deleteWorkout(id: string): SqlStatement {
	return { name: 'delete workout', sql: 'DELETE FROM workout WHERE id = ?', params: [id] };
}

/** Lists templates in list order. */
export const FIND_ALL_TEMPLATES: SqlStatement = {
	name: 'find all templates',
	sql: 'SELECT id, name, position FROM workout_template ORDER BY position',
	params: []
};

/** Finds a template by id. */
export function findTemplateById(id: string): SqlStatement {
	return {
		name: 'find template',
		sql: 'SELECT id, name, position FROM workout_template WHERE id = ?',
		params: [id]
	};
}

/** Lists a template's exercises in order. */
export function findTemplateExercises(templateId: string): SqlStatement {
	return {
		name: 'find template exercises',
		sql: `SELECT template_id, position, exercise_id, target_sets FROM template_exercise
			WHERE template_id = ? ORDER BY position`,
		params: [templateId]
	};
}

/** Inserts or updates a template's own row. */
export function upsertTemplate(row: WorkoutTemplateRow): SqlStatement {
	return {
		name: 'save template',
		sql: `INSERT INTO workout_template (id, name, position) VALUES (?, ?, ?)
			ON CONFLICT (id) DO UPDATE SET name = excluded.name, position = excluded.position`,
		params: [row.id, row.name, row.position]
	};
}

/** Removes a template's exercises before they are rewritten. */
export function clearTemplateExercises(templateId: string): SqlStatement {
	return {
		name: 'clear template exercises',
		sql: 'DELETE FROM template_exercise WHERE template_id = ?',
		params: [templateId]
	};
}

/** Inserts one exercise of a template. */
export function insertTemplateExercise(row: TemplateExerciseRow): SqlStatement {
	return {
		name: 'insert template exercise',
		sql: 'INSERT INTO template_exercise (template_id, position, exercise_id, target_sets) VALUES (?, ?, ?, ?)',
		params: [row.template_id, row.position, row.exercise_id, row.target_sets]
	};
}

/** Deletes a template and, by cascade, its exercises. */
export function deleteTemplate(id: string): SqlStatement {
	return {
		name: 'delete template',
		sql: 'DELETE FROM workout_template WHERE id = ?',
		params: [id]
	};
}

/** Finds the rest day on a date. */
export function findRestDayByDate(date: string): SqlStatement {
	return {
		name: 'find rest day',
		sql: 'SELECT id, date FROM rest_day WHERE date = ?',
		params: [date]
	};
}

/** Lists every rest day. */
export const FIND_ALL_REST_DAYS: SqlStatement = {
	name: 'find all rest days',
	sql: 'SELECT id, date FROM rest_day',
	params: []
};

/** Marks a rest day. */
export function insertRestDay(row: RestDayRow): SqlStatement {
	return {
		name: 'save rest day',
		sql: 'INSERT OR REPLACE INTO rest_day (id, date) VALUES (?, ?)',
		params: [row.id, row.date]
	};
}

/** Removes the rest day on a date. */
export function deleteRestDayOn(date: string): SqlStatement {
	return { name: 'delete rest day', sql: 'DELETE FROM rest_day WHERE date = ?', params: [date] };
}
